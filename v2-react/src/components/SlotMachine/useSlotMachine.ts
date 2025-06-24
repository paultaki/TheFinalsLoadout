import { useState, useCallback, useRef, useEffect } from 'react';
import { SlotColumn, SlotResult, SlotItem } from './types';
import { playSound } from '../../utils/audio';
import { loadouts } from '../../data/loadouts';

// Animation timing constants (in ms)
const TIMING = {
  FINAL_SPIN: {
    SPIN_DURATION: 2000,
    STOP_DURATION: 3000,
    STAGGER_DELAY: 800,
    FINAL_COLUMN_PAUSE: 200
  },
  NORMAL_SPIN: {
    SPIN_DURATION: 400,
    STOP_DURATION: 600,
    STAGGER_DELAY: 200
  },
  EFFECTS: {
    SCREEN_SHAKE: 400,
    SCREEN_FLASH: 300,
    LANDING_FLASH: 600,
    ALMOST_WON_FLASH: 600,
    PARTICLE_DURATION_MIN: 800,
    PARTICLE_DURATION_MAX: 1200,
    HAPTIC_DURATION: 100
  }
};

// Animation physics constants
const PHYSICS = {
  CELL_HEIGHT: 120,
  FINAL_SPIN_START: -900,
  NORMAL_SPIN_START: -720,
  FINAL_OVERSHOOT: 50,
  NORMAL_OVERSHOOT: 20,
  SCROLL_SPEED_FINAL: 25,
  SCROLL_SPEED_BASE: 30,
  SCROLL_SPEED_INCREMENT: 3,
  LOOP_THRESHOLD: 200,
  LOOP_RESET: 400,
  FPS_ASSUMPTION: 16 // ~60fps
};

// Visual constants
const VISUAL = {
  PARTICLE_COUNT: 12,
  PARTICLE_DISTANCE_MIN: 100,
  PARTICLE_DISTANCE_MAX: 150,
  PARTICLE_SIZE: 6,
  BLUR_REMOVE_FINAL: 0.7,
  BLUR_REMOVE_FAST: 0.85,
  BLUR_REMOVE_NORMAL: 0.5
};

interface AnimationData {
  columnRef: HTMLDivElement | null;
  items: string[];
  winner: string;
  index: number;
}

export const useSlotMachine = (
  className: 'Light' | 'Medium' | 'Heavy',
  spinCount: number,
  onComplete: (result: SlotResult) => void
) => {
  const [columns, setColumns] = useState<SlotColumn[]>([]);
  const [isSpinning, setIsSpinning] = useState(false);
  const [currentSpin, setCurrentSpin] = useState(0);
  const [selectedResult, setSelectedResult] = useState<SlotResult | null>(null);
  const animationFrameRef = useRef<number>();
  const spinStartTimeRef = useRef<number>(0);
  const columnRefs = useRef<(HTMLDivElement | null)[]>([]);
  const animationPromises = useRef<Promise<void>[]>([]);
  const isFinalSpin = currentSpin === spinCount - 1;

  // Initialize columns based on class
  useEffect(() => {
    const classData = loadouts[className];
    if (!classData) return;

    const newColumns: SlotColumn[] = [
      {
        items: classData.weapons.map(w => ({ name: w, image: `/images/weapons/${w}.png` })),
        currentIndex: 0,
        isSpinning: false,
        spinDuration: 2000
      },
      {
        items: classData.specializations.map(s => ({ name: s, image: `/images/specializations/${s}.png` })),
        currentIndex: 0,
        isSpinning: false,
        spinDuration: 2500
      },
      {
        items: classData.gadgets.map(g => ({ name: g, image: `/images/gadgets/${g}.png` })),
        currentIndex: 0,
        isSpinning: false,
        spinDuration: 3000
      },
      {
        items: classData.gadgets.map(g => ({ name: g, image: `/images/gadgets/${g}.png` })),
        currentIndex: 0,
        isSpinning: false,
        spinDuration: 3500
      },
      {
        items: classData.gadgets.map(g => ({ name: g, image: `/images/gadgets/${g}.png` })),
        currentIndex: 0,
        isSpinning: false,
        spinDuration: 4000
      }
    ];

    setColumns(newColumns);
  }, [className]);

  // Easing functions
  const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);
  const easeOutQuad = (t: number) => t * (2 - t);
  const easeOutQuart = (t: number) => 1 - Math.pow(1 - t, 4);
  const easeInOutQuad = (t: number) => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
  const elasticOut = (t: number) => {
    const p = 0.3;
    return Math.pow(2, -10 * t) * Math.sin((t - p / 4) * (2 * Math.PI) / p) + 1;
  };

  // Calculate position for final spin deceleration
  const calculateFinalSpinPosition = (
    decelProgress: number,
    scrollPosition: number,
    finalPosition: number,
    overshoot: number
  ): { position: number; scrollPosition?: number } => {
    if (decelProgress < 0.75) {
      // Continue fast spinning with gradual slowdown
      const slowdownFactor = 1 - (decelProgress * 0.3); // Only slow down by 30% max
      const scrollSpeed = 15 * slowdownFactor;
      scrollPosition += scrollSpeed * PHYSICS.FPS_ASSUMPTION;
      
      // Loop position
      if (scrollPosition > 200) {
        scrollPosition = scrollPosition % 400 - 400;
      }
      
      return { position: scrollPosition, scrollPosition: scrollPosition };
    } else if (decelProgress < 0.9) {
      // Rapid deceleration to overshoot
      const rapidDecelProgress = (decelProgress - 0.75) / 0.15;
      const position = scrollPosition + 
        easeOutQuart(rapidDecelProgress) * (finalPosition + overshoot - scrollPosition);
      return { position: position };
    } else {
      // Quick bounce back
      const bounceProgress = (decelProgress - 0.9) / 0.1;
      const position = finalPosition + overshoot - 
        (overshoot * easeOutCubic(bounceProgress));
      return { position: position };
    }
  };

  // Calculate position for normal spin deceleration
  const calculateNormalSpinPosition = (
    decelProgress: number,
    startPosition: number,
    finalPosition: number,
    overshoot: number
  ) => {
    if (decelProgress < 0.7) {
      return startPosition + 
        easeOutCubic(decelProgress / 0.7) * (finalPosition + overshoot - startPosition);
    } else {
      const bounceProgress = (decelProgress - 0.7) / 0.3;
      return finalPosition + overshoot - 
        (overshoot * easeOutQuad(bounceProgress));
    }
  };

  // Animate column with staggered timing - all columns spin fast, then stop one by one
  const animateColumnStaggered = (
    column: HTMLDivElement,
    index: number,
    totalColumns: number
  ): Promise<void> => {
    return new Promise((resolve) => {
      const startTime = Date.now();
      const cellHeight = PHYSICS.CELL_HEIGHT;
      
      // Different timing for final vs non-final spins
      let spinDuration, stopDuration, staggerDelay;
      
      if (isFinalSpin) {
        // Final spin - dramatic and extended
        spinDuration = TIMING.FINAL_SPIN.SPIN_DURATION;
        stopDuration = TIMING.FINAL_SPIN.STOP_DURATION;
        staggerDelay = TIMING.FINAL_SPIN.STAGGER_DELAY;
        
        // Add extra pause before final column
        if (index === totalColumns - 1) {
          spinDuration += TIMING.FINAL_SPIN.FINAL_COLUMN_PAUSE;
        }
      } else {
        // Non-final spins - quick and snappy
        spinDuration = TIMING.NORMAL_SPIN.SPIN_DURATION;
        stopDuration = TIMING.NORMAL_SPIN.STOP_DURATION;
        staggerDelay = TIMING.NORMAL_SPIN.STAGGER_DELAY;
      }
      
      // Calculate when this column should start decelerating
      const startDecelerationTime = spinDuration + (index * staggerDelay);
      const totalDuration = startDecelerationTime + stopDuration;
      
      // Starting position
      const startPosition = isFinalSpin ? 
        PHYSICS.FINAL_SPIN_START : 
        PHYSICS.NORMAL_SPIN_START;
      const finalPosition = -(cellHeight / 2);
      
      // Add animation classes
      column.parentElement?.classList.add("animating", "extreme-blur", "speed-lines");
      
      // Add glow trail effect for final spin
      if (isFinalSpin) {
        column.classList.add("glow-trail");
      }
      
      // Track position for continuous scrolling
      let scrollPosition = startPosition;
      let lastTime = startTime;
      
      const animate = () => {
        const currentTime = Date.now();
        const elapsed = currentTime - startTime;
        const deltaTime = currentTime - lastTime;
        lastTime = currentTime;
        
        const progress = Math.min(elapsed / totalDuration, 1);
        
        if (elapsed < startDecelerationTime) {
          // Fast spinning phase - continuous scrolling
          let baseSpeed;
          if (isFinalSpin) {
            baseSpeed = PHYSICS.SCROLL_SPEED_FINAL;
          } else {
            // Progressive speed ramping - get faster with each spin
            const spinNumber = currentSpin + 1;
            baseSpeed = PHYSICS.SCROLL_SPEED_BASE + 
              (spinNumber * PHYSICS.SCROLL_SPEED_INCREMENT);
          }
          const scrollSpeed = baseSpeed; // pixels per millisecond
          scrollPosition += scrollSpeed * deltaTime;
          
          // Loop the position to create endless scrolling effect
          if (scrollPosition > PHYSICS.LOOP_THRESHOLD) {
            scrollPosition = scrollPosition % PHYSICS.LOOP_RESET - PHYSICS.LOOP_RESET;
          }
          
          column.style.transform = `translateY(${scrollPosition}px)`;
        } else {
          // Deceleration phase
          const decelProgress = (elapsed - startDecelerationTime) / stopDuration;
          
          // Adjust blur removal based on spin type
          if (isFinalSpin) {
            // Keep blur longer for final spin - less predictable
            if (decelProgress > VISUAL.BLUR_REMOVE_FINAL) {
              column.parentElement?.classList.remove("extreme-blur");
              column.parentElement?.classList.add("high-speed-blur");
            }
            if (decelProgress > VISUAL.BLUR_REMOVE_FAST) {
              column.parentElement?.classList.remove("high-speed-blur", "speed-lines");
            }
          } else {
            // Quick blur removal for non-final spins
            if (decelProgress > VISUAL.BLUR_REMOVE_NORMAL) {
              column.parentElement?.classList.remove("extreme-blur", "high-speed-blur", "speed-lines");
            }
          }
          
          // Different deceleration curves for final vs non-final
          const overshoot = isFinalSpin ? 
            PHYSICS.FINAL_OVERSHOOT : 
            PHYSICS.NORMAL_OVERSHOOT;
          let currentPosition;
          
          if (isFinalSpin) {
            const result = calculateFinalSpinPosition(
              decelProgress, scrollPosition, finalPosition, overshoot
            );
            currentPosition = result.position;
            scrollPosition = result.scrollPosition || scrollPosition;
          } else {
            currentPosition = calculateNormalSpinPosition(
              decelProgress, startPosition, finalPosition, overshoot
            );
          }
          
          column.style.transform = `translateY(${currentPosition}px)`;
          
          // Add landing flash when close to final position
          const flashTiming = isFinalSpin ? 0.95 : 0.8;
          if (decelProgress > flashTiming && !column.parentElement?.classList.contains("landing-flash")) {
            column.parentElement?.classList.add("landing-flash");
            playSound('tick');
          }
        }
        
        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          // Complete the animation
          column.style.transform = `translateY(${finalPosition}px)`;
          column.parentElement?.classList.remove("animating", "landing-flash");
          column.classList.remove("glow-trail");
          
          // Final column effects
          if (isFinalSpin && index === totalColumns - 1) {
            // Screen shake on final column landing
            document.body.classList.add('screen-shake');
            setTimeout(() => {
              document.body.classList.remove('screen-shake');
            }, TIMING.EFFECTS.SCREEN_SHAKE);
            
            // Haptic feedback
            if ('vibrate' in navigator) {
              navigator.vibrate(100);
            }
          }
          
          // Winner effects
          if (isFinalSpin) {
            const winner = column.querySelector(".slot-cell.winner");
            if (winner) {
              winner.closest(".slot-item")?.classList.add("winner-pulsate");
            }
          }
          
          resolve();
        }
      };
      
      requestAnimationFrame(animate);
    });
  };

  // Generate random result with unique gadgets
  const generateRandomResult = useCallback((): SlotResult => {
    const classData = loadouts[className];
    if (!classData) {
      throw new Error(`Invalid class: ${className}`);
    }

    // Select random items
    const weapon = classData.weapons[Math.floor(Math.random() * classData.weapons.length)];
    const specialization = classData.specializations[Math.floor(Math.random() * classData.specializations.length)];
    
    // Select unique gadgets
    const shuffledGadgets = [...classData.gadgets].sort(() => Math.random() - 0.5);
    const [gadget1, gadget2, gadget3] = shuffledGadgets.slice(0, 3);

    return {
      weapon,
      specialization,
      gadget1,
      gadget2,
      gadget3
    };
  }, [className]);

  // Build scroll content with repeated items
  const buildScrollContent = (items: string[], winner: string, columnRef: HTMLDivElement) => {
    const sequence: HTMLDivElement[] = [];
    
    // Create winner cell at the top
    const winnerCell = document.createElement('div');
    winnerCell.className = 'slot-cell winner';
    // Convert underscores to spaces for display
    const winnerDisplay = winner.replace(/_/g, ' ');
    winnerCell.innerHTML = `
      <img src="/images/${winner.replace(/ /g, '_')}.webp" alt="${winner}" loading="eager">
      <p>${winnerDisplay}</p>
    `;
    sequence.push(winnerCell);
    
    // Add near-miss items for final spin tension
    if (isFinalSpin && items.length > 1) {
      const nearMissItem = items.find(item => item !== winner) || items[0];
      const nearMissCell = document.createElement('div');
      nearMissCell.className = 'slot-cell near-miss';
      // Convert underscores to spaces for display
      const nearMissDisplay = nearMissItem.replace(/_/g, ' ');
      nearMissCell.innerHTML = `
        <img src="/images/${nearMissItem.replace(/ /g, '_')}.webp" alt="${nearMissItem}" loading="eager">
        <p>${nearMissDisplay}</p>
      `;
      sequence.push(nearMissCell);
    }
    
    // Pattern-based item placement
    const patternCount = isFinalSpin ? 8 : 5;
    for (let i = 0; i < patternCount; i++) {
      const cell = document.createElement('div');
      cell.className = 'slot-cell';
      const item = items[i % items.length];
      // Convert underscores to spaces for display
      const itemDisplay = item.replace(/_/g, ' ');
      cell.innerHTML = `
        <img src="/images/${item.replace(/ /g, '_')}.webp" alt="${item}" loading="eager">
        <p>${itemDisplay}</p>
      `;
      sequence.push(cell);
    }
    
    // Fill remaining scroll area
    const scrollItemCount = isFinalSpin ? 40 : 25;
    for (let i = 0; i < scrollItemCount; i++) {
      const cell = document.createElement('div');
      cell.className = 'slot-cell';
      const item = items[Math.floor(Math.random() * items.length)];
      // Convert underscores to spaces for display
      const itemDisplay = item.replace(/_/g, ' ');
      cell.innerHTML = `
        <img src="/images/${item.replace(/ /g, '_')}.webp" alt="${item}" loading="eager">
        <p>${itemDisplay}</p>
      `;
      sequence.push(cell);
    }
    
    // Clear and append to column
    columnRef.innerHTML = '';
    sequence.forEach(cell => columnRef.appendChild(cell));
  };

  // Main animation control
  const animateSlots = useCallback(async () => {
    if (!columnRefs.current.every(ref => ref !== null)) {
      console.error('Column refs not ready');
      return;
    }

    // Generate the result first
    const result = generateRandomResult();
    setSelectedResult(result);

    // Prepare animation data
    const animationData: AnimationData[] = [
      {
        columnRef: columnRefs.current[0],
        items: loadouts[className].weapons,
        winner: result.weapon,
        index: 0
      },
      {
        columnRef: columnRefs.current[1],
        items: loadouts[className].specializations,
        winner: result.specialization,
        index: 1
      },
      {
        columnRef: columnRefs.current[2],
        items: loadouts[className].gadgets,
        winner: result.gadget1,
        index: 2
      },
      {
        columnRef: columnRefs.current[3],
        items: loadouts[className].gadgets,
        winner: result.gadget2,
        index: 3
      },
      {
        columnRef: columnRefs.current[4],
        items: loadouts[className].gadgets,
        winner: result.gadget3,
        index: 4
      }
    ];

    // Build scroll content for each column
    animationData.forEach(data => {
      if (data.columnRef) {
        buildScrollContent(data.items, data.winner, data.columnRef);
        // Start with strip pushed up to show random items
        const startOffset = isFinalSpin ? -900 : -720;
        data.columnRef.style.transform = `translateY(${startOffset}px)`;
      }
    });

    // Start spinning sound
    playSound('spinning');

    // Create staggered animations
    const promises = animationData.map((data, index) => {
      if (!data.columnRef) return Promise.resolve();
      return animateColumnStaggered(data.columnRef, index, animationData.length);
    });

    // Wait for all animations to complete
    await Promise.all(promises);

    // Stop spinning sound
    // Note: You'll need to implement a stopSound function in audio utils
    // stopSound('spinning');

    // Play final sound
    if (isFinalSpin) {
      playSound('finalSound');
    } else {
      playSound('ding');
    }

    // Handle completion
    if (currentSpin < spinCount - 1) {
      // More spins to go
      setCurrentSpin(prev => prev + 1);
      setTimeout(() => startSpin(), 500);
    } else {
      // All spins complete
      setIsSpinning(false);
      if (result) {
        onComplete(result);
      }
    }
  }, [className, currentSpin, spinCount, isFinalSpin, generateRandomResult, onComplete]);

  const startSpin = useCallback(() => {
    if (isSpinning) return;

    setIsSpinning(true);
    animateSlots();
  }, [isSpinning, animateSlots]);

  // Set column refs
  const setColumnRef = useCallback((index: number) => (ref: HTMLDivElement | null) => {
    columnRefs.current[index] = ref;
  }, []);

  // Cleanup animation frame on unmount
  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  return {
    columns,
    isSpinning,
    currentSpin,
    startSpin,
    spinCount,
    setColumnRef,
    isFinalSpin
  };
};