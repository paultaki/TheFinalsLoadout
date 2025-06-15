import { useState, useRef, useCallback, useEffect } from 'react';
import type { SlotItem, Loadout, ColumnState } from './types';
import { playTickSound, playWinSound, playJackpotSound } from '../../utils/audio';

const SLOT_HEIGHT = 120;
const TOTAL_SLOTS = 15;
const STAGGER_DELAY = 120;
const SPIN_DURATION_NORMAL = 2500;
const SPIN_DURATION_FINAL = 5000;

// Weapon pool
const WEAPONS = [
  { name: 'FCAR', icon: 'images/weapons/fcar.png', type: 'weapon' as const },
  { name: 'AKM', icon: 'images/weapons/akm.png', type: 'weapon' as const },
  { name: 'M60', icon: 'images/weapons/m60.png', type: 'weapon' as const },
  { name: 'V9S', icon: 'images/weapons/v9s.png', type: 'weapon' as const },
  { name: 'XP-54', icon: 'images/weapons/xp54.png', type: 'weapon' as const },
];

// Specialization pool
const SPECIALIZATIONS = [
  {
    name: 'Cloaking Device',
    icon: 'images/specializations/cloak.png',
    type: 'specialization' as const,
  },
  { name: 'Goo Gun', icon: 'images/specializations/goo.png', type: 'specialization' as const },
  {
    name: 'Grappling Hook',
    icon: 'images/specializations/grapple.png',
    type: 'specialization' as const,
  },
  {
    name: 'Guardian Turret',
    icon: 'images/specializations/turret.png',
    type: 'specialization' as const,
  },
  {
    name: 'Mesh Shield',
    icon: 'images/specializations/shield.png',
    type: 'specialization' as const,
  },
];

// Gadget pool
const GADGETS = [
  { name: 'Frag Grenade', icon: 'images/gadgets/frag.png', type: 'gadget' as const },
  { name: 'Gas Grenade', icon: 'images/gadgets/gas.png', type: 'gadget' as const },
  { name: 'RPG-7', icon: 'images/gadgets/rpg.png', type: 'gadget' as const },
  { name: 'C4', icon: 'images/gadgets/c4.png', type: 'gadget' as const },
  { name: 'Jump Pad', icon: 'images/gadgets/jumppad.png', type: 'gadget' as const },
  { name: 'Stun Gun', icon: 'images/gadgets/stun.png', type: 'gadget' as const },
  { name: 'Pyro Grenade', icon: 'images/gadgets/pyro.png', type: 'gadget' as const },
  { name: 'Barricade', icon: 'images/gadgets/barricade.png', type: 'gadget' as const },
];

export const useSlotMachine = (onResult: (result: Loadout) => void, isFinalSpin = false) => {
  const [isAnimating, setIsAnimating] = useState(false);
  const [columns, setColumns] = useState<ColumnState[]>([
    { position: 0, velocity: 0, isAnimating: false, finalIndex: 0, currentIndex: 0 },
    { position: 0, velocity: 0, isAnimating: false, finalIndex: 0, currentIndex: 0 },
    { position: 0, velocity: 0, isAnimating: false, finalIndex: 0, currentIndex: 0 },
    { position: 0, velocity: 0, isAnimating: false, finalIndex: 0, currentIndex: 0 },
    { position: 0, velocity: 0, isAnimating: false, finalIndex: 0, currentIndex: 0 },
  ]);

  const animationFrameRef = useRef<number | undefined>(undefined);
  const lastTickRef = useRef<number[]>([0, 0, 0, 0, 0]);
  const columnsRef = useRef<HTMLDivElement[]>([]);

  // Get random item from pool
  const getRandomItem = (pool: SlotItem[]) => {
    return pool[Math.floor(Math.random() * pool.length)];
  };

  // Generate items for a column
  const generateColumnItems = (columnIndex: number): SlotItem[] => {
    const items: SlotItem[] = [];
    let pool: SlotItem[];

    switch (columnIndex) {
      case 0:
        pool = WEAPONS;
        break;
      case 1:
        pool = SPECIALIZATIONS;
        break;
      default:
        pool = GADGETS;
        break;
    }

    // Generate items to fill the column
    for (let i = 0; i < TOTAL_SLOTS; i++) {
      items.push(getRandomItem(pool));
    }

    return items;
  };

  const [columnItems] = useState<SlotItem[][]>(() => {
    return Array(5)
      .fill(null)
      .map((_, index) => generateColumnItems(index));
  });

  // Easing functions
  const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

  // Animate a single column
  const animateColumn = useCallback(
    (columnIndex: number, startTime: number, duration: number, targetIndex: number) => {
      const animate = (currentTime: number) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);

        if (progress < 1) {
          // Calculate position with easing
          const easedProgress = progress < 0.8 ? easeOutCubic(progress / 0.8) : 1;
          const totalDistance = (targetIndex + TOTAL_SLOTS * 3) * SLOT_HEIGHT;
          const currentPosition = easedProgress * totalDistance;

          // Update column state
          setColumns((prev) => {
            const newColumns = [...prev];
            newColumns[columnIndex] = {
              ...newColumns[columnIndex],
              position: currentPosition % (TOTAL_SLOTS * SLOT_HEIGHT),
              velocity: (currentPosition - newColumns[columnIndex].position) * 60,
              currentIndex: Math.floor(currentPosition / SLOT_HEIGHT) % TOTAL_SLOTS,
            };
            return newColumns;
          });

          // Check for tick sound
          const currentSlot = Math.floor(currentPosition / SLOT_HEIGHT);
          if (currentSlot !== lastTickRef.current[columnIndex]) {
            lastTickRef.current[columnIndex] = currentSlot;
            playTickSound();
          }

          requestAnimationFrame(animate);
        } else {
          // Animation complete - snap to final position
          setColumns((prev) => {
            const newColumns = [...prev];
            newColumns[columnIndex] = {
              ...newColumns[columnIndex],
              position: (targetIndex * SLOT_HEIGHT) % (TOTAL_SLOTS * SLOT_HEIGHT),
              velocity: 0,
              isAnimating: false,
              finalIndex: targetIndex,
              currentIndex: targetIndex,
            };
            return newColumns;
          });

          // Check if all columns are done
          setColumns((prev) => {
            const allDone = prev.every((col) => !col.isAnimating);
            if (allDone) {
              handleSpinComplete();
            }
            return prev;
          });
        }
      };

      requestAnimationFrame(animate);
    },
    []
  );

  // Handle spin completion
  const handleSpinComplete = useCallback(() => {
    setIsAnimating(false);

    // Get final items
    const finalLoadout: Loadout = {
      weapon: columnItems[0][columns[0].finalIndex],
      specialization: columnItems[1][columns[1].finalIndex],
      gadget1: columnItems[2][columns[2].finalIndex],
      gadget2: columnItems[3][columns[3].finalIndex],
      gadget3: columnItems[4][columns[4].finalIndex],
    };

    // Play win sound
    if (isFinalSpin) {
      playJackpotSound();
    } else {
      playWinSound();
    }

    // Trigger callback
    onResult(finalLoadout);
  }, [columns, columnItems, isFinalSpin, onResult]);

  // Start spin animation
  const spin = useCallback(() => {
    if (isAnimating) return;

    setIsAnimating(true);
    const duration = isFinalSpin ? SPIN_DURATION_FINAL : SPIN_DURATION_NORMAL;

    // Set all columns to animating
    setColumns((prev) => prev.map((col) => ({ ...col, isAnimating: true })));

    // Start each column with stagger
    columns.forEach((_, index) => {
      const targetIndex = Math.floor(Math.random() * TOTAL_SLOTS);
      const startDelay = index * STAGGER_DELAY;

      setTimeout(() => {
        animateColumn(index, performance.now(), duration, targetIndex);
      }, startDelay);
    });
  }, [isAnimating, isFinalSpin, columns, animateColumn]);

  // Set column refs
  const setColumnRef = useCallback(
    (index: number) => (el: HTMLDivElement | null) => {
      if (el) columnsRef.current[index] = el;
    },
    []
  );

  // Cleanup
  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  return {
    isAnimating,
    columns,
    columnItems,
    spin,
    setColumnRef,
  };
};
