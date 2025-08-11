/**
 * The Finals Slot Machine Animation Engine
 * Casino-level excitement with sophisticated timing and effects
 * 
 * FIXES APPLIED (Aug 11, 2025):
 * 1. Fixed undefined 'eased' variable in deceleration phase
 * 2. Fixed animation direction to be consistently downward
 * 3. Animation now reads initial position from DOM (set at -1600px)
 * 4. High-speed chaos continues from acceleration position (no reset)
 * 5. Combined deceleration/lock phases for smoother transition
 * 6. Winner properly centers at index 20
 */

// Constants for precise positioning
const ITEM_H = 80;
const VIEWPORT_H = 240;
const CENTER_OFFSET = (VIEWPORT_H - ITEM_H) / 2; // 80

// ========================================
// Animation Configuration
// ========================================
const ANIMATION_PHASES = {
  ACCELERATION: {
    duration: 800,
    curve: "cubic-bezier(0.25, 0.46, 0.45, 0.94)",
    startSpeed: 50,
    endSpeed: 500,
  },
  HIGH_SPEED_CHAOS: {
    duration: 2500,
    blur: 4, // pixels
    velocityVariation: 150, // ±150px/s
    baseSpeed: 500,
    itemsToShow: 40,
  },
  DECELERATION: {
    duration: 2000,
    curve: "cubic-bezier(0.55, 0.06, 0.68, 0.19)",
    startSpeed: 500,
    endSpeed: 100,
  },
  OVERSHOOT: {
    amount: 0.35, // 35% past target
    snapbackSpeed: 0.6, // 60% of original speed
    duration: 400,
  },
  LOCK_IN: {
    stagger: [0, 250, 500, 750, 1000], // ms delays for each column
    bounceDamping: 0.6,
    bounceStiffness: 300,
    screenShakeIntensity: 5, // pixels
    screenShakeDuration: 200, // ms
  },
};

// Mobile-specific adjustments
const MOBILE_ADJUSTMENTS = {
  animationSpeed: 0.75, // 25% faster on mobile
  blurIntensity: 0.6, // Lighter blur for performance
  particleEffects: false, // Disable particles
  reducedPhysics: true, // Simpler calculations
  screenShake: false, // No shake on mobile
};

// Audio configuration
const AUDIO_CONFIG = {
  spinStart: { file: "../sounds/spinning.mp3", volume: 0.05 },
  highSpeed: { file: "../sounds/spinning.mp3", volume: 0.02, loop: true },
  columnLock: { file: "../sounds/click.mp3", volume: 0.08 },
  victory: { file: "../sounds/chang.mp3", volume: 0.06 },
  nearMiss: { file: "../sounds/click.mp3", volume: 0.04 },
};

// ========================================
// Animation Engine Class
// ========================================
class AnimationEngine {
  constructor() {
    this.isAnimating = false;
    this.animationFrameId = null;
    this.columnAnimations = new Map();
    this.isMobile = this.detectMobile();
    this.audioEnabled = true;
    this.audioElements = {};
    this.debugMode = true; // Enable debug mode

    // Performance tracking
    this.fps = 60;
    this.lastFrameTime = 0;
    this.frameCount = 0;
    this.currentPhase = 'idle';
    
    // Animation direction control
    this.downward = 1; // +1 => down
    this.debug = true;
    this.baseVelocityDirection = 1; // Positive for downward motion

    // Animation recovery
    this.animationTimeout = null;
    this.maxAnimationDuration = 10000; // 10 seconds max
    
    // Initialize audio
    this.initializeAudio();
    
    // Create debug overlay
    this.createDebugOverlay();
    
    // Add visibility change handler
    this.setupVisibilityHandler();

    // Adjust for mobile if needed
    if (this.isMobile) {
      this.applyMobileAdjustments();
    }
    
    // Create debug overlay if in debug mode
    if (this.debugMode) {
      this.createDebugOverlay();
    }
  }

  /**
   * Detect if running on mobile device
   */
  detectMobile() {
    return (
      /Android|iPhone|iPad|iPod/i.test(navigator.userAgent) ||
      window.innerWidth < 768
    );
  }

  /**
   * Apply mobile optimizations
   */
  applyMobileAdjustments() {
    // Adjust phase durations
    Object.keys(ANIMATION_PHASES).forEach((phase) => {
      if (ANIMATION_PHASES[phase].duration) {
        ANIMATION_PHASES[phase].duration *= MOBILE_ADJUSTMENTS.animationSpeed;
      }
    });

    // Reduce blur intensity
    ANIMATION_PHASES.HIGH_SPEED_CHAOS.blur *= MOBILE_ADJUSTMENTS.blurIntensity;

    console.log("📱 Mobile optimizations applied");
  }

  /**
   * Initialize audio elements
   */
  initializeAudio() {
    Object.keys(AUDIO_CONFIG).forEach((key) => {
      const audio = new Audio(AUDIO_CONFIG[key].file);
      audio.volume = AUDIO_CONFIG[key].volume;
      audio.loop = AUDIO_CONFIG[key].loop || false;
      this.audioElements[key] = audio;
    });
  }

  /**
   * Play sound effect
   */
  playSound(soundKey) {
    if (!this.audioEnabled) return;

    const audio = this.audioElements[soundKey];
    if (audio) {
      audio.currentTime = 0;
      audio.play().catch((e) => {
        console.log("Audio play failed:", e);
      });
    }
  }

  /**
   * Stop sound effect
   */
  stopSound(soundKey) {
    const audio = this.audioElements[soundKey];
    if (audio) {
      audio.pause();
      audio.currentTime = 0;
    }
  }

  /**
   * Quick spin animation for non-final spins
   * @param {Array} columns - DOM elements for each column
   * @param {Object} scrollContents - Deception engine scroll contents
   */
  async animateQuickSpin(columns, scrollContents) {
    console.log('⚡ animateQuickSpin called');
    
    // Force cleanup if animation is stuck
    if (this.isAnimating) {
      console.warn("Animation already in progress - forcing cleanup");
      this.forceStopAnimation();
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    this.isAnimating = true;
    
    // Set a timeout for quick spins
    this.animationTimeout = setTimeout(() => {
      console.error('⏱️ Quick spin timeout - forcing stop');
      this.forceStopAnimation();
    }, 5000); // 5 seconds for quick spin

    try {
      // Play start sound
      this.playSound("spinStart");

      // Quick acceleration (400ms)
      await this.runQuickAcceleration(columns);

      // Short high-speed phase (1000ms)
      await this.runQuickChaos(columns, scrollContents);

      // Quick deceleration (600ms)
      await this.runQuickDeceleration(columns);

      // No overshoot or lock-in for quick spins
      // Just stop smoothly
    } finally {
      this.isAnimating = false;
      this.cleanup();
    }
  }

  /**
   * Quick acceleration for non-final spins
   */
  async runQuickAcceleration(columns) {
    return new Promise((resolve) => {
      const startTime = performance.now();
      const duration = 400; // Half the normal duration

      const animate = (currentTime) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);

        columns.forEach((column, index) => {
          const itemsContainer = column.querySelector(".slot-items");
          if (itemsContainer) {
            if (!this.columnAnimations.has(column)) {
              const itemHeight = 80;
              const totalHeight = itemsContainer.children.length * itemHeight;
              this.columnAnimations.set(column, {
                currentPosition: -(totalHeight * 0.8),
                velocity: 50,
                targetPosition: 0,
              });
            }

            const animation = this.columnAnimations.get(column);
            const currentSpeed = 50 + (500 - 50) * progress;
            animation.currentPosition += currentSpeed * 0.016;
            itemsContainer.style.transform = `translateY(${animation.currentPosition}px)`;
            
            // Update debug overlay
            if (this.debugMode && index === 0) {
              this.updateDebugOverlay();
            }
            itemsContainer.style.filter = `blur(${progress * 3}px)`;
          }
        });

        if (progress < 1) {
          this.animationFrameId = requestAnimationFrame(animate);
        } else {
          resolve();
        }
      };

      this.animationFrameId = requestAnimationFrame(animate);
    });
  }

  /**
   * Quick chaos phase
   */
  async runQuickChaos(columns, scrollContents) {
    return new Promise((resolve) => {
      const startTime = performance.now();
      const duration = 1000; // Much shorter than normal

      // Items are already populated by slot-machine.js populateScrollContainers()
      // Don't repopulate - just use existing items
      columns.forEach((column) => {
        const itemsContainer = column.querySelector(".slot-items");

        // Initialize animation state if needed
        if (!this.columnAnimations.has(column)) {
          const itemHeight = 80;
          const totalHeight = itemsContainer.children.length * itemHeight;
          this.columnAnimations.set(column, {
            currentPosition: -(totalHeight * 0.7),
            velocity: 500,
            targetPosition: 0,
          });
        }
      });

      // Skip the population code that was here
      /* Removed duplicate population logic that was causing blank items */

      columns.forEach((column) => {
        column.classList.add("spinning");
      });

      const animate = (currentTime) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);

        columns.forEach((column, index) => {
          const itemsContainer = column.querySelector(".slot-items");
          const animation = this.columnAnimations.get(column);

          if (itemsContainer && animation) {
            animation.currentPosition += 500 * 0.016;

            const itemHeight = 80;
            const totalHeight = itemsContainer.children.length * itemHeight;
            const viewportHeight = 240;

            // Fix: Check against 0 for downward scroll reset
            if (animation.currentPosition >= 0) {
              animation.currentPosition -= totalHeight;
            }

            itemsContainer.style.transform = `translateY(${animation.currentPosition}px)`;
            
            // Update debug overlay
            if (this.debugMode && index === 0) {
              this.updateDebugOverlay();
            }
            itemsContainer.style.filter = "blur(4px)";
          }
        });

        if (progress < 1) {
          this.animationFrameId = requestAnimationFrame(animate);
        } else {
          resolve();
        }
      };

      this.animationFrameId = requestAnimationFrame(animate);
    });
  }

  /**
   * Quick deceleration
   */
  async runQuickDeceleration(columns) {
    return new Promise((resolve) => {
      const startTime = performance.now();
      const duration = 600;

      const animate = (currentTime) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);

        const currentSpeed = 500 - (500 - 50) * progress;

        columns.forEach((column, index) => {
          const itemsContainer = column.querySelector(".slot-items");
          const animation = this.columnAnimations.get(column);

          if (itemsContainer && animation) {
            animation.velocity = currentSpeed;
            animation.currentPosition += animation.velocity * 0.016;

            const itemHeight = 80;
            const totalHeight = itemsContainer.children.length * itemHeight;
            const viewportHeight = 240;

            // Fix: Check against 0 for downward scroll reset
            if (animation.currentPosition >= 0) {
              animation.currentPosition -= totalHeight;
            }

            itemsContainer.style.transform = `translateY(${animation.currentPosition}px)`;
            
            // Update debug overlay
            if (this.debugMode && index === 0) {
              this.updateDebugOverlay();
            }
            itemsContainer.style.filter = `blur(${(1 - progress) * 3}px)`;
          }
        });

        if (progress < 1) {
          this.animationFrameId = requestAnimationFrame(animate);
        } else {
          // Clear blur completely
          columns.forEach((column, index) => {
            const itemsContainer = column.querySelector(".slot-items");
            if (itemsContainer) {
              itemsContainer.style.filter = "blur(0px)";
            }
          });
          resolve();
        }
      };

      this.animationFrameId = requestAnimationFrame(animate);
    });
  }

  /**
   * Main animation orchestrator
   * @param {Array} columns - DOM elements for each column
   * @param {Object} scrollContents - Deception engine scroll contents
   * @param {Object} predeterminedResults - The actual results to land on
   */
  async animateSlotMachine(columns, scrollContents, predeterminedResults) {
    console.log('🎰 animateSlotMachine called');
    
    // Force cleanup if animation is stuck
    if (this.isAnimating) {
      console.warn("Animation already in progress - forcing cleanup");
      this.forceStopAnimation();
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    this.isAnimating = true;
    this.updateDebugOverlay();
    
    // Set a timeout to force stop if animation takes too long
    this.animationTimeout = setTimeout(() => {
      console.error('⏱️ Animation timeout - forcing stop');
      this.forceStopAnimation();
    }, this.maxAnimationDuration);

    try {
      // Play start sound
      this.playSound("spinStart");

      // Phase 1: Acceleration
      await this.runAccelerationPhase(columns);

      // Phase 2: High-speed chaos
      this.playSound("highSpeed");
      await this.runHighSpeedChaosPhase(columns, scrollContents);

      // Phase 3, 4, 5: Combined Deceleration and Lock
      this.stopSound("highSpeed");
      // Extract winner indices from predetermined results
      const winnerIndices = columns.map(() => 20); // All winners at index 20
      await this.runDecelerationAndLock(columns, winnerIndices);

      // Victory!
      this.playSound("victory");

      // Screen shake effect (if not mobile)
      if (!this.isMobile) {
        this.applyScreenShake();
      }

      // Phase 6: Selection confirmation with winner glow
      await this.animateSelectionConfirmation(columns);
    } finally {
      this.isAnimating = false;
      this.cleanup();
    }
  }

  /**
   * Setup visibility change handler to recover from tab switching
   */
  setupVisibilityHandler() {
    document.addEventListener('visibilitychange', () => {
      if (document.hidden && this.isAnimating) {
        console.warn('⚠️ Tab hidden during animation - forcing cleanup');
        this.forceStopAnimation();
      }
    });
    
    // Also handle page unload
    window.addEventListener('beforeunload', () => {
      if (this.isAnimating) {
        this.forceStopAnimation();
      }
    });
  }
  
  /**
   * Create debug overlay for visual debugging
   */
  createDebugOverlay() {
    if (!this.debugMode) return;
    
    const overlay = document.createElement('div');
    overlay.id = 'animation-debug-overlay';
    overlay.style.cssText = `
      position: fixed;
      top: 10px;
      right: 10px;
      background: rgba(0, 0, 0, 0.95);
      color: #00ff00;
      padding: 15px;
      font-family: 'Courier New', monospace;
      font-size: 12px;
      z-index: 10000;
      border: 2px solid #00ff00;
      min-width: 250px;
      box-shadow: 0 0 20px rgba(0, 255, 0, 0.3);
    `;
    overlay.innerHTML = `
      <div style="color: #ffff00; font-weight: bold; margin-bottom: 10px;">🎰 SLOT MACHINE DEBUG</div>
      <div>Phase: <span id="debug-phase" style="color: #00ffff;">idle</span></div>
      <div>Position: <span id="debug-position">0</span>px</div>
      <div>Velocity: <span id="debug-velocity">0</span>px/s <span id="debug-direction">↓</span></div>
      <div>FPS: <span id="debug-fps">60</span></div>
      <div>Animating: <span id="debug-animating">false</span></div>
      <div style="margin-top: 10px; padding-top: 10px; border-top: 1px solid #00ff00;">
        <div>Loops: <span id="debug-loops">0</span></div>
        <div>Frame: <span id="debug-frame">0</span></div>
      </div>
    `;
    document.body.appendChild(overlay);
    
    // Add column position indicators
    this.createColumnDebugOverlays();
  }
  
  /**
   * Update debug overlay
   */
  /**
   * Create column-specific debug overlays
   */
  createColumnDebugOverlays() {
    if (!this.debugMode) return;
    
    const columns = document.querySelectorAll('.slot-column');
    columns.forEach((column, index) => {
      const debugDiv = document.createElement('div');
      debugDiv.className = 'column-debug';
      debugDiv.style.cssText = `
        position: absolute;
        top: -30px;
        left: 50%;
        transform: translateX(-50%);
        background: rgba(0, 0, 0, 0.8);
        color: #00ff00;
        padding: 2px 8px;
        font-size: 10px;
        font-family: monospace;
        border: 1px solid #00ff00;
        z-index: 1000;
        white-space: nowrap;
      `;
      debugDiv.innerHTML = `Col${index}: <span class="pos-val">0</span>px`;
      column.style.position = 'relative';
      column.appendChild(debugDiv);
    });
  }
  
  updateDebugOverlay() {
    if (!this.debugMode) return;
    
    const phase = document.getElementById('debug-phase');
    const position = document.getElementById('debug-position');
    const velocity = document.getElementById('debug-velocity');
    const direction = document.getElementById('debug-direction');
    const fps = document.getElementById('debug-fps');
    const animating = document.getElementById('debug-animating');
    const loops = document.getElementById('debug-loops');
    const frame = document.getElementById('debug-frame');
    
    if (phase) phase.textContent = this.currentPhase;
    if (animating) {
      animating.textContent = this.isAnimating;
      animating.style.color = this.isAnimating ? '#00ff00' : '#ff0000';
    }
    if (fps) fps.textContent = Math.round(this.fps);
    if (frame) frame.textContent = this.frameCount;
    
    // Get first column animation data
    const firstColumn = this.columnAnimations.values().next().value;
    if (firstColumn) {
      if (position) position.textContent = firstColumn.currentPosition.toFixed(1);
      if (velocity) {
        velocity.textContent = Math.abs(firstColumn.velocity).toFixed(1);
        if (direction) {
          direction.textContent = firstColumn.velocity > 0 ? '↓' : '↑';
          direction.style.color = firstColumn.velocity > 0 ? '#00ff00' : '#ff0000';
        }
      }
      if (loops && firstColumn.loopCount !== undefined) {
        loops.textContent = firstColumn.loopCount || 0;
      }
    }
    
    // Update column-specific debug overlays
    const columns = document.querySelectorAll('.slot-column');
    columns.forEach((column, index) => {
      const anim = this.columnAnimations.get(column);
      const posVal = column.querySelector('.pos-val');
      if (anim && posVal) {
        posVal.textContent = anim.currentPosition.toFixed(0);
      }
    });
  }

  /**
   * Phase 1: Acceleration
   */
  async runAccelerationPhase(columns) {
    console.log("🚀 Phase 1: Acceleration");
    this.currentPhase = 'acceleration';
    this.updateDebugOverlay();
    
    // Debug columns
    console.log('🔍 Acceleration - Columns received:', columns.length);
    columns.forEach((col, i) => {
      const items = col.querySelector('.slot-items');
      console.log(`Column ${i}:`, items ? `Has .slot-items (${items.children.length} items)` : 'MISSING .slot-items!', col);
    });

    return new Promise((resolve) => {
      const startTime = performance.now();
      const phase = ANIMATION_PHASES.ACCELERATION;

      const animate = (currentTime) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / phase.duration, 1);

        // Easing function
        const eased = this.cubicBezier(progress, 0.25, 0.46, 0.45, 0.94);

        // Calculate current speed
        const currentSpeed =
          phase.startSpeed + (phase.endSpeed - phase.startSpeed) * eased;

        // Apply to each column
        columns.forEach((column, index) => {
          const itemsContainer = column.querySelector(".slot-items");
          if (!itemsContainer) {
            console.error(`❌ Column ${index} missing .slot-items!`);
            return;
          }
          
          // Ensure no CSS transitions during animation
          itemsContainer.style.transition = 'none';
          itemsContainer.style.willChange = 'transform';
          
          // Initialize animation state if not exists
          if (!this.columnAnimations.has(column)) {
              // Read the current position from the transform (set in populateScrollContainers)
              const currentTransform = itemsContainer.style.transform;
              let startPos = -1600; // Default to winner position
              const match = currentTransform.match(/translateY\((-?\d+(?:\.\d+)?)px\)/);
              if (match) {
                startPos = parseFloat(match[1]);
              }
              
              const itemHeight = 80;
              const itemCount = itemsContainer.children.length;
              const totalHeight = itemCount * itemHeight;
              
              this.columnAnimations.set(column, {
                currentPosition: startPos,
                velocity: phase.startSpeed * this.baseVelocityDirection,
                targetPosition: 0,
                totalHeight: totalHeight,
                itemHeight: itemHeight
              });
              console.log(`🚀 Column ${index} start: ${startPos}px (from transform), ${itemCount} items, height: ${totalHeight}px`);
            }

            const animation = this.columnAnimations.get(column);

            // Update velocity and position (moving down, toward positive)
            animation.velocity = currentSpeed * this.baseVelocityDirection; // Always positive for down
            animation.currentPosition += animation.velocity * 0.016;
            
            // Apply transform
            itemsContainer.style.transform = `translateY(${animation.currentPosition}px)`;
            
            // Update debug overlay
            if (this.debugMode && index === 0) {
              this.updateDebugOverlay();
            }
            
            // Debug first column progress
            if (index === 0 && progress > 0.9) {
              console.log(`🚀 Acceleration ending - Position: ${animation.currentPosition.toFixed(1)}px, Speed: ${currentSpeed.toFixed(1)}px/s`);
            }

            // Gradually increase blur
            const blurAmount = eased * 2; // Max 2px during acceleration
            itemsContainer.style.filter = `blur(${blurAmount}px)`;
        });

        if (progress < 1) {
          this.animationFrameId = requestAnimationFrame(animate);
        } else {
          resolve();
        }
      };

      this.animationFrameId = requestAnimationFrame(animate);
    });
  }

  /**
   * Phase 2: High-speed chaos with CORRECT downward math
   */
  async runHighSpeedChaosPhase(columns, opts) {
    console.log("💨 Phase 2: High-speed chaos - FIXED MATH");
    this.currentPhase = 'high-speed-chaos';
    this.updateDebugOverlay();
    
    // Disable CSS transitions and prepare columns
    for (const col of columns) {
      const itemsContainer = col.querySelector('.slot-items');
      if (itemsContainer) {
        itemsContainer.style.willChange = 'transform';
        itemsContainer.style.transition = 'none';
        itemsContainer.dataset.anim = 'running';
      }
    }
    
    const baseSpeed = Math.max(300, Math.abs(opts?.baseSpeed || 900)); // px/s, always positive
    const t0 = performance.now();
    let last = t0;
    
    // Each column tracks position independently
    const state = columns.map((col, i) => {
      const itemsContainer = col.querySelector('.slot-items');
      if (!itemsContainer) return null;
      
      const items = itemsContainer.children.length;
      const cycleHeight = items * ITEM_H;
      
      // Continue from current position (set by acceleration phase)
      const currentTransform = itemsContainer.style.transform;
      let startPos = -1600; // Default
      const match = currentTransform.match(/translateY\((-?\d+(?:\.\d+)?)px\)/);
      if (match) {
        startPos = parseFloat(match[1]);
      }
      
      console.log(`Col${i}: items=${items}, cycleH=${cycleHeight}, continuing from pos=${startPos}`);
      
      // Add slight speed variation per column for more realistic effect
      const columnSpeedVariation = 1 + (Math.random() * 0.2 - 0.1); // ±10% variation
      
      return { 
        col: itemsContainer, 
        items, 
        cycleHeight, 
        pos: startPos, 
        vel: baseSpeed * columnSpeedVariation,
        index: i,
        speedMod: columnSpeedVariation
      };
    }).filter(s => s !== null);

    return new Promise((resolve) => {
      const phase = ANIMATION_PHASES.HIGH_SPEED_CHAOS; // Define phase BEFORE tick function
      
      // Animation loop with correct math
      const tick = (now) => {
        const dt = Math.min(48, now - last) / 1000; // clamp dt to prevent huge jumps
        last = now;
        const elapsed = now - t0; // Calculate elapsed time at the start
        
        let running = false;
        
        for (const s of state) {
          if (!s) continue;
          
          // Slight per-column variance but keep it positive (downward)
          const jitter = (Math.random() * 0.15 - 0.075) * s.vel;
          const vel = Math.max(150, s.vel + jitter); // never negative, always moving down
          s.pos += vel * dt; // positive increases translateY => down
          
          // For seamless scrolling: wrap when we've scrolled one full cycle
          // Since we start negative and move positive (down), wrap back to negative
          // when we've moved far enough that looping won't be visible
          while (s.pos > 0) {
            // Reset to continue the infinite scroll
            s.pos -= s.cycleHeight;
            if (this.debug && s.index === 0) {
              console.log(`♻️ Col${s.index} wrapped: resetting by ${s.cycleHeight}px to ${s.pos.toFixed(1)}px`);
            }
          }
          
          // Debug logging
          if (this.debug && s.index === 0) {
            if (!s._lastLog || now - s._lastLog > 150) {
              console.log(`Col${s.index} pos=${s.pos.toFixed(1)} vel=${vel.toFixed(1)} wrapAt=0 cycle=${s.cycleHeight}`);
              s._lastLog = now;
              
              // Update debug overlay
              const debugEl = document.getElementById('anim-debug');
              if (debugEl) {
                const sum = state.map((st,i) => st ? `c${i}:${st.pos.toFixed(0)}` : '').join(' ');
                debugEl.textContent = `CHAOS ${sum}`;
              }
            }
          }
          
          // Apply transform with motion blur for speed effect
          s.col.style.transform = `translate3d(0, ${s.pos}px, 0)`;
          
          // Apply motion blur based on velocity
          const blurAmount = Math.min(4, (vel / 250)); // Max 4px blur
          s.col.style.filter = `blur(${blurAmount}px)`;
          
          running = true;
        }
        
        // Check if we should continue
        if (running && elapsed < phase.duration) {
          this.animationFrameId = requestAnimationFrame(tick);
        } else {
          resolve();
        }
      };
      
      let sId = requestAnimationFrame(tick);
      
      // Expose a stop method that decel phase will call
      this._stopChaos = () => { 
        cancelAnimationFrame(sId);
        cancelAnimationFrame(this.animationFrameId);
        resolve(); 
      };
    });
  }

  /**
   * Helper: Read current position from transform
   */
  _readPos(el) {
    const m = /translate3d\(0,\s*([-\d.]+)px/.exec(el.style.transform) ||
              /translateY\(\s*([-\d.]+)px/.exec(el.style.transform);
    return m ? parseFloat(m[1]) : 0;
  }
  
  /**
   * Helper: Find nearest future target for smooth decel
   */
  _nearestFutureTarget(currentPos, targetBase, cycleHeight) {
    // Choose the congruent target > currentPos so we keep moving DOWN toward it
    let t = targetBase;
    while (t <= currentPos) t += cycleHeight;
    return t;
  }
  
  /**
   * Phase 3: Deceleration with CORRECT targeting
   */
  /**
   * Combined deceleration and lock with proper math
   */
  async runDecelerationAndLock(columns, winnerIndicesByColumn) {
    console.log("🎯 Phase 3+4+5: Deceleration and Lock - FIXED MATH");
    
    // Stop chaos
    if (this._stopChaos) this._stopChaos();
    
    const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);
    
    const anims = columns.map((col, i) => {
      const itemsContainer = col.querySelector('.slot-items');
      if (!itemsContainer) return null;
      
      const items = itemsContainer.children.length;
      const cycleHeight = items * ITEM_H;
      const winnerIndex = winnerIndicesByColumn?.[i] || 20;
      const base = CENTER_OFFSET - (winnerIndex * ITEM_H); // e.g., -1520
      const current = this._readPos(itemsContainer);
      const target = this._nearestFutureTarget(current, base, cycleHeight);
      
      console.log(`Col${i}: current=${current.toFixed(1)}, targetBase=${base}, finalTarget=${target.toFixed(1)}`);
      
      // 900-1400ms feels right after chaos
      const D = 1100 + i * 60;
      const start = performance.now();
      
      // Ensure JS owns the transform
      itemsContainer.style.transition = 'none';
      
      return new Promise(resolve => {
        const step = (now) => {
          const t = Math.min(1, (now - start) / D);
          const y = current + (target - current) * easeOutCubic(t);
          itemsContainer.style.transform = `translate3d(0, ${y}px, 0)`;
          
          // Reduce blur as we decelerate
          const blurAmount = (1 - t) * 2; // Start at 2px, fade to 0
          itemsContainer.style.filter = `blur(${blurAmount}px)`;
          
          if (t < 1) {
            requestAnimationFrame(step);
          } else {
            // Final position with no blur
            itemsContainer.style.filter = 'none';
            console.log(`Col${i} locked at ${y.toFixed(1)}px`);
            resolve();
          }
        };
        requestAnimationFrame(step);
      });
    }).filter(a => a !== null);
    
    await Promise.all(anims);
    
    // Mark finished
    for (const col of columns) {
      const itemsContainer = col.querySelector('.slot-items');
      if (itemsContainer) {
        itemsContainer.dataset.anim = 'done';
      }
    }
    
    console.log('✅ All columns locked!');
  }
  
  /**
   * Old deceleration - kept for compatibility
   */
  async runDecelerationPhase(columns) {
    console.log("🎯 Phase 3: Deceleration - using new combined method");
    const winnerIndices = columns.map(() => 20);
    await this.runDecelerationAndLock(columns, winnerIndices);
    console.log("Decel start positions:", columns.map((col, i) => {
      const anim = this.columnAnimations.get(col);
      return `Col${i}: ${anim ? anim.currentPosition.toFixed(1) : 'N/A'}px`;
    }).join(", "));

    return new Promise((resolve) => {
      const startTime = performance.now();
      const phase = ANIMATION_PHASES.DECELERATION;
      const staggerDelay = 400; // Start stopping each column 400ms apart

      const animate = (currentTime) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / phase.duration, 1);

        columns.forEach((column, index) => {
          const itemsContainer = column.querySelector(".slot-items");
          const animation = this.columnAnimations.get(column);

          if (itemsContainer && animation) {
            // Calculate staggered progress for each column
            const columnDelay = index * staggerDelay;
            const columnElapsed = Math.max(0, elapsed - columnDelay);
            const columnProgress = Math.min(
              columnElapsed / (phase.duration - columnDelay),
              1
            );

            // Declare eased variable at the start
            let eased = 0;
            
            // Only start decelerating after column's delay
            if (columnElapsed > 0) {
              eased = this.cubicBezier(
                columnProgress,
                0.55,
                0.06,
                0.68,
                0.19
              );
              const currentSpeed =
                phase.startSpeed - (phase.startSpeed - phase.endSpeed) * eased;
              animation.velocity = currentSpeed;
            } else {
              // Keep at full speed until this column's turn
              animation.velocity = phase.startSpeed;
            }

            animation.currentPosition += animation.velocity * 0.016;

            // Keep position in bounds for seamless loop during deceleration
            const itemHeight = animation.itemHeight || 80;
            const totalHeight = animation.totalHeight || (itemsContainer.children.length * itemHeight);
            const viewportHeight = 240;

            // Wrap for downward scroll - reset when content has scrolled past viewport
            if (animation.currentPosition > viewportHeight) {
              animation.currentPosition -= totalHeight;
              console.log(`🔄 Decel wrap: ${(animation.currentPosition + totalHeight).toFixed(1)}px → ${animation.currentPosition.toFixed(1)}px`);
            }

            itemsContainer.style.transform = `translateY(${animation.currentPosition}px)`;
            
            // Update debug overlay
            if (this.debugMode && index === 0) {
              this.updateDebugOverlay();
            }

            // Reduce blur as we slow down
            const blurAmount =
              (1 - eased) * ANIMATION_PHASES.HIGH_SPEED_CHAOS.blur;
            itemsContainer.style.filter = `blur(${blurAmount}px)`;
          }
        });

        if (progress < 1) {
          this.animationFrameId = requestAnimationFrame(animate);
        } else {
          resolve();
        }
      };

      this.animationFrameId = requestAnimationFrame(animate);
    });
  }

  /**
   * Phase 4: Overshoot and snapback
   */
  async runOvershootPhase(columns, predeterminedResults) {
    console.log("🎪 Phase 4: Overshoot and snapback");

    return new Promise((resolve) => {
      const startTime = performance.now();
      const phase = ANIMATION_PHASES.OVERSHOOT;

      // Calculate target positions for each column
      columns.forEach((column, index) => {
        const animation = this.columnAnimations.get(column);
        const itemHeight = 80;

        // For downward spin, winner needs to be in CENTER row
        // Viewport shows 3 items (240px), center is at 80px from top
        const visibleHeight = 240; // 3 items visible
        // Winner is at position 20 in the scroll content
        // Position 20 is at 20 * 80 = 1600px from top of container
        // To center it at 80px from viewport top, we need: -1600 + 80 = -1520px
        const targetPosition = -1520; // Centers winner at position 20
        const overshootPosition = targetPosition + itemHeight * phase.amount; // Overshoot further down
        
        console.log(`🎯 Column ${index} target: ${targetPosition}px, overshoot to ${overshootPosition}px`)

        animation.targetPosition = targetPosition;
        animation.overshootPosition = overshootPosition;
        animation.startPosition = animation.currentPosition;
      });

      const animate = (currentTime) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / phase.duration, 1);

        columns.forEach((column, index) => {
          const itemsContainer = column.querySelector(".slot-items");
          const animation = this.columnAnimations.get(column);

          if (itemsContainer && animation) {
            let position;

            if (progress < 0.5) {
              // Moving to overshoot position
              const overshootProgress = progress * 2;
              const eased = this.easeOutQuad(overshootProgress);
              position =
                animation.startPosition +
                (animation.overshootPosition - animation.startPosition) * eased;
            } else {
              // Snapping back to target
              const snapbackProgress = (progress - 0.5) * 2;
              const eased = this.easeOutElastic(snapbackProgress);
              position =
                animation.overshootPosition +
                (animation.targetPosition - animation.overshootPosition) *
                  eased;
            }

            itemsContainer.style.transform = `translateY(${position}px)`;

            // Clear blur during snapback
            const blurAmount = (1 - progress) * 2;
            itemsContainer.style.filter = `blur(${blurAmount}px)`;
          }
        });

        if (progress < 1) {
          this.animationFrameId = requestAnimationFrame(animate);
        } else {
          resolve();
        }
      };

      this.animationFrameId = requestAnimationFrame(animate);
    });
  }

  /**
   * Phase 5: Lock-in with staggered timing
   */
  async runLockInPhase(columns) {
    console.log("🔒 Phase 5: Lock-in sequence");

    const staggerDelays = ANIMATION_PHASES.LOCK_IN.stagger;

    // Create promises for each column's lock-in animation
    const lockInPromises = Array.from(columns).map((column, index) => {
      return new Promise((resolve) => {
        setTimeout(() => {
          this.lockInColumn(column, index).then(resolve);
        }, staggerDelays[index] || 0);
      });
    });

    // Wait for all columns to lock in
    await Promise.all(lockInPromises);
  }

  /**
   * Lock in a single column with spring physics
   */
  async lockInColumn(column, index) {
    return new Promise((resolve) => {
      const itemsContainer = column.querySelector(".slot-items");
      const animation = this.columnAnimations.get(column);

      if (!itemsContainer || !animation) {
        resolve();
        return;
      }

      // Play lock sound
      this.playSound("columnLock");
      
      console.log(`🔒 Locking column ${index} at position ${animation.targetPosition}px`);

      // Apply spring physics for final bounce
      const startTime = performance.now();
      const duration = 300;
      const damping = ANIMATION_PHASES.LOCK_IN.bounceDamping;
      const stiffness = ANIMATION_PHASES.LOCK_IN.bounceStiffness;

      const animate = (currentTime) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);

        // Spring physics calculation
        const spring =
          1 -
          Math.exp(-progress * 6) *
            Math.cos(progress * stiffness * 0.01) *
            damping;

        const position = animation.targetPosition * spring;

        itemsContainer.style.transform = `translateY(${position}px)`;

        // Add lock-in visual effect
        column.classList.add("locked");

        // Clear all blur
        itemsContainer.style.filter = "blur(0px)";

        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          // Mark column as complete
          column.classList.add("complete");
          resolve();
        }
      };

      requestAnimationFrame(animate);
    });
  }

  /**
   * Animate selection confirmation with winner glow
   */
  async animateSelectionConfirmation(columns) {
    console.log("✨ Winner confirmation animation");

    // Add selection zone indicators first
    this.addSelectionZoneIndicators();

    // Wait a moment for dramatic effect
    await new Promise((resolve) => setTimeout(resolve, 200));

    // Animate the winner glow left to right
    const glowPromises = Array.from(columns).map((column, index) => {
      return new Promise((resolve) => {
        setTimeout(() => {
          this.animateWinnerGlow(column, index).then(resolve);
        }, index * 200); // Stagger 200ms between columns
      });
    });

    await Promise.all(glowPromises);

    // Final celebration flash
    this.finalCelebrationFlash();
  }

  /**
   * Add visual indicators for selection zone (center row)
   */
  addSelectionZoneIndicators() {
    const columns = document.querySelectorAll(".slot-column");
    columns.forEach((column) => {
      // Create selection zone indicator
      const indicator = document.createElement("div");
      indicator.className = "selection-zone-indicator";
      indicator.style.cssText = `
                position: absolute;
                top: 50%;
                left: 0;
                right: 0;
                height: 80px;
                transform: translateY(-50%);
                border: 2px solid rgba(0, 255, 204, 0.3);
                border-radius: 8px;
                pointer-events: none;
                z-index: 10;
                box-shadow: 
                    inset 0 0 20px rgba(0, 255, 204, 0.1),
                    0 0 10px rgba(0, 255, 204, 0.2);
            `;

      const slotWindow = column.querySelector(".slot-window");
      if (
        slotWindow &&
        !slotWindow.querySelector(".selection-zone-indicator")
      ) {
        slotWindow.style.position = "relative";
        slotWindow.appendChild(indicator);
      }
    });
  }

  /**
   * Animate winner glow for individual column
   */
  async animateWinnerGlow(column, index) {
    return new Promise((resolve) => {
      const itemsContainer = column.querySelector(".slot-items");
      const slotWindow = column.querySelector(".slot-window");

      if (!itemsContainer || !slotWindow) {
        resolve();
        return;
      }

      // Create glow effect overlay
      const glowOverlay = document.createElement("div");
      glowOverlay.className = "winner-glow-overlay";
      glowOverlay.style.cssText = `
                position: absolute;
                top: 50%;
                left: 0;
                right: 0;
                height: 80px;
                transform: translateY(-50%);
                background: linear-gradient(90deg, 
                    transparent 0%,
                    rgba(255, 215, 0, 0.3) 40%,
                    rgba(255, 215, 0, 0.5) 50%,
                    rgba(0, 255, 204, 0.5) 50%,
                    rgba(0, 255, 204, 0.3) 60%,
                    transparent 100%);
                pointer-events: none;
                z-index: 20;
                opacity: 0;
                border-radius: 8px;
            `;

      slotWindow.appendChild(glowOverlay);

      // Animate the glow
      const startTime = performance.now();
      const duration = 300;

      const animate = (currentTime) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);

        // Pulse animation
        const opacity = Math.sin(progress * Math.PI);
        glowOverlay.style.opacity = opacity;

        // Scale animation
        const scale = 1 + 0.1 * Math.sin(progress * Math.PI);
        glowOverlay.style.transform = `translateY(-50%) scaleX(${scale})`;

        // Add glow to the column
        column.style.filter = `drop-shadow(0 0 ${
          20 * opacity
        }px rgba(255, 215, 0, 0.5))`;

        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          // Clean up
          setTimeout(() => {
            glowOverlay.remove();
            column.style.filter = "";
          }, 200);
          resolve();
        }
      };

      requestAnimationFrame(animate);
    });
  }

  /**
   * Final celebration flash
   */
  finalCelebrationFlash() {
    const slotMachine = document.querySelector(".slot-machine");
    if (!slotMachine) return;

    // Create flash overlay
    const flash = document.createElement("div");
    flash.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: radial-gradient(circle, 
                rgba(255, 215, 0, 0.2) 0%, 
                transparent 70%);
            pointer-events: none;
            z-index: 30;
            opacity: 0;
            animation: celebrationFlash 0.5s ease;
        `;

    // Add CSS animation
    const style = document.createElement("style");
    style.textContent = `
            @keyframes celebrationFlash {
                0% { opacity: 0; }
                50% { opacity: 1; }
                100% { opacity: 0; }
            }
        `;
    document.head.appendChild(style);

    slotMachine.style.position = "relative";
    slotMachine.appendChild(flash);

    // Remove after animation
    setTimeout(() => {
      flash.remove();
      style.remove();
    }, 500);
  }

  /**
   * Apply screen shake effect
   */
  applyScreenShake() {
    if (this.isMobile && !MOBILE_ADJUSTMENTS.screenShake) return;

    const container = document.querySelector(".slot-machine");
    if (!container) return;

    const intensity = ANIMATION_PHASES.LOCK_IN.screenShakeIntensity;
    const duration = ANIMATION_PHASES.LOCK_IN.screenShakeDuration;
    const startTime = performance.now();

    const shake = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);

      if (progress < 1) {
        const x = (Math.random() - 0.5) * intensity * (1 - progress);
        const y = (Math.random() - 0.5) * intensity * (1 - progress);
        container.style.transform = `translate(${x}px, ${y}px)`;
        requestAnimationFrame(shake);
      } else {
        container.style.transform = "";
      }
    };

    requestAnimationFrame(shake);
  }

  /**
   * Track FPS for performance monitoring
   */
  trackFPS(currentTime) {
    this.frameCount++;

    if (currentTime > this.lastFrameTime + 1000) {
      this.fps = Math.round(
        (this.frameCount * 1000) / (currentTime - this.lastFrameTime)
      );
      this.lastFrameTime = currentTime;
      this.frameCount = 0;

      // Log FPS in development
      if (this.fps < 55) {
        console.warn(`⚠️ Low FPS: ${this.fps}`);
      }
    }
  }

  /**
   * Create debug overlay for position tracking
   */
  createDebugOverlay() {
    const overlay = document.createElement('div');
    overlay.id = 'debug-overlay';
    overlay.style.cssText = `
      position: fixed;
      top: 10px;
      right: 10px;
      background: rgba(0, 0, 0, 0.8);
      color: #00ff00;
      padding: 10px;
      font-family: monospace;
      font-size: 12px;
      z-index: 10000;
      border: 1px solid #00ff00;
      min-width: 300px;
    `;
    document.body.appendChild(overlay);
    this.debugOverlay = overlay;
  }
  
  /**
   * Update debug overlay
   */
  updateDebugOverlay() {
    if (!this.debugOverlay || !this.debugMode) return;
    
    const columns = document.querySelectorAll('.slot-column');
    let debugInfo = '<strong>🎰 SLOT MACHINE DEBUG</strong><br>';
    debugInfo += `FPS: ${this.fps}<br>`;
    debugInfo += `Animation: ${this.isAnimating ? 'RUNNING' : 'IDLE'}<br>`;
    debugInfo += '<br><strong>Column Positions:</strong><br>';
    
    columns.forEach((col, i) => {
      const anim = this.columnAnimations.get(col);
      if (anim) {
        const direction = anim.velocity > 0 ? '↓' : anim.velocity < 0 ? '↑' : '⏸';
        debugInfo += `Col${i}: ${anim.currentPosition.toFixed(1)}px ${direction} (${Math.abs(anim.velocity).toFixed(0)}px/s)<br>`;
      }
    });
    
    // Find winner items
    const winners = document.querySelectorAll('.winner-item');
    if (winners.length > 0) {
      debugInfo += '<br><strong>Winner Positions:</strong><br>';
      winners.forEach((winner, i) => {
        const rect = winner.getBoundingClientRect();
        const parent = winner.closest('.slot-window');
        if (parent) {
          const parentRect = parent.getBoundingClientRect();
          const relativeTop = rect.top - parentRect.top;
          debugInfo += `Winner${i}: ${relativeTop.toFixed(1)}px from viewport top<br>`;
        }
      });
    }
    
    this.debugOverlay.innerHTML = debugInfo;
  }

  /**
   * Cleanup after animation
   */
  cleanup() {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }

    this.columnAnimations.clear();

    // Stop all looping sounds
    this.stopSound("highSpeed");
    
    // Clear debug overlay
    if (this.debugOverlay) {
      this.debugOverlay.innerHTML = '<strong>🎰 ANIMATION COMPLETE</strong>';
    }
    
    // Clear any timeouts
    if (this.animationTimeout) {
      clearTimeout(this.animationTimeout);
      this.animationTimeout = null;
    }
  }
  
  /**
   * Force stop animation and reset state
   */
  forceStopAnimation() {
    console.log('🛑 Force stopping animation');
    
    // Cancel animation frame
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
    
    // Clear timeout
    if (this.animationTimeout) {
      clearTimeout(this.animationTimeout);
      this.animationTimeout = null;
    }
    
    // Reset state
    this.isAnimating = false;
    this.currentPhase = 'idle';
    
    // Clear animations and reset positions
    this.columnAnimations.clear();
    
    // Reset all slot columns to default position
    const columns = document.querySelectorAll('.slot-items');
    columns.forEach(column => {
      column.style.transform = 'translateY(0px)';
      column.style.filter = 'blur(0px)';
    });
    
    // Update debug overlay
    this.updateDebugOverlay();
    
    // Stop all sounds
    this.stopSound("highSpeed");
    this.stopSound("spinStart");
    
    console.log('✅ Animation force stopped and state reset');
  }

  // ========================================
  // Easing Functions
  // ========================================

  /**
   * Cubic bezier easing
   */
  cubicBezier(t, p0, p1, p2, p3) {
    const cX = 3 * p0;
    const bX = 3 * (p2 - p0) - cX;
    const aX = 1 - cX - bX;

    const cY = 3 * p1;
    const bY = 3 * (p3 - p1) - cY;
    const aY = 1 - cY - bY;

    const sampleCurveX = (t) => ((aX * t + bX) * t + cX) * t;
    const sampleCurveY = (t) => ((aY * t + bY) * t + cY) * t;

    // Newton-Raphson iteration
    let x = t;
    for (let i = 0; i < 4; i++) {
      const z = sampleCurveX(x) - t;
      if (Math.abs(z) < 0.001) break;
      x -= z / (3 * aX * x * x + 2 * bX * x + cX);
    }

    return sampleCurveY(x);
  }

  /**
   * Ease out quadratic
   */
  easeOutQuad(t) {
    return t * (2 - t);
  }

  /**
   * Ease out elastic for bounce effect
   */
  easeOutElastic(t) {
    if (t === 0 || t === 1) return t;

    const p = 0.3;
    const s = p / 4;

    return Math.pow(2, -10 * t) * Math.sin(((t - s) * (2 * Math.PI)) / p) + 1;
  }
}

// ========================================
// Export for use
// ========================================
window.AnimationEngine = AnimationEngine;
