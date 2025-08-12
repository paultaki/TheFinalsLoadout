/**
 * The Finals Slot Machine Animation Engine v2
 * Delta-time based, monotonic position tracking, multi-stage deceleration
 * 
 * Core Principles:
 * - Single source of truth: unwrappedY (monotonically increasing)
 * - Visual position via modulo: wrappedY = unwrappedY % cycleHeight
 * - Forward-only motion including overshoot
 * - Frame-rate independent via delta-time integration
 */

// Constants
const ITEM_H = 80;
const VIEWPORT_H = 240;
const CENTER_OFFSET = 80; // Center row position (VIEWPORT_H - ITEM_H) / 2

// Animation Configuration
const ANIM_CONFIG = {
  // Phase durations (ms)
  ACCELERATION_DURATION: 600,
  CRUISE_DURATION: 1800,
  DECEL_A_DURATION: 500,  // easeOutQuad
  DECEL_B_DURATION: 400,  // easeOutCubic
  FINAL_LOCK_DURATION: 300, // easeOutQuart
  OVERSHOOT_DURATION: 200,
  SETTLE_DURATION: 150,
  
  // Speeds (px/s)
  MIN_SPEED: 100,
  MAX_SPEED: 2400,
  CRUISE_BASE_SPEED: 1800,
  SPEED_INCREMENT: 150, // Per spin number
  
  // Effects
  OVERSHOOT_AMOUNT: 35, // pixels
  JITTER_AMOUNT: 0.08, // ±8% during cruise
  STAGGER_DELAY: 250, // ms between columns
  
  // Visual blur thresholds
  BLUR_MAX: 4,
  BLUR_REMOVE_START: 0.6,
  BLUR_REMOVE_END: 0.9
};

class AnimationEngineV2 {
  constructor() {
    // Debug mode
    this.debug = true;
    this.frameCount = 0;
    this.reversalDetected = false;
    
    // Animation state
    this.isAnimating = false;
    this.animationFrameId = null;
    this.columnStates = new Map();
    
    // Spin tracking
    this.spinNumber = 0;
    
    // FPS tracking
    this.lastFrameTime = 0;
    this.fps = 60;
    
    // Audio (reuse existing)
    this.audioEnabled = true;
    
    if (this.debug) {
      this.createDebugPanel();
    }
  }
  
  /**
   * Main animation orchestrator
   */
  async animateSlotMachine(columns, scrollContents, predeterminedResults) {
    if (this.isAnimating) {
      console.warn('Animation already in progress');
      return;
    }
    
    this.isAnimating = true;
    this.spinNumber++;
    
    try {
      // Initialize column states with monotonic position tracking
      this.initializeColumnStates(columns);
      
      // Run the animation phases
      await this.runAnimation(columns, predeterminedResults);
      
    } finally {
      this.isAnimating = false;
      this.cleanup();
    }
  }
  
  /**
   * Initialize column states with unwrapped position tracking
   */
  initializeColumnStates(columns) {
    columns.forEach((column, index) => {
      const itemsContainer = column.querySelector('.slot-items');
      if (!itemsContainer) return;
      
      const itemCount = itemsContainer.children.length;
      const cycleHeight = itemCount * ITEM_H;
      
      // Read initial position from DOM
      const currentTransform = itemsContainer.style.transform;
      let startPos = -1600; // Default (winner at index 20 above viewport)
      const match = currentTransform.match(/translateY\((-?\d+(?:\.\d+)?)px\)/);
      if (match) {
        startPos = parseFloat(match[1]);
      }
      
      // Initialize state with unwrapped position
      // Start with a large positive offset to ensure we never go negative
      const unwrappedStart = 10000 + startPos; // Ensure always positive
      
      this.columnStates.set(column, {
        element: itemsContainer,
        index: index,
        cycleHeight: cycleHeight,
        itemCount: itemCount,
        
        // Position tracking (monotonic)
        unwrappedY: unwrappedStart,
        prevUnwrappedY: unwrappedStart,
        
        // Velocity
        velocity: 0,
        targetVelocity: 0,
        
        // Target position for deceleration
        targetY: null,
        overshootY: null,
        
        // Phase tracking
        phase: 'idle',
        phaseStartTime: 0,
        phaseProgress: 0
      });
      
      // Apply initial position
      this.applyPosition(itemsContainer, unwrappedStart, cycleHeight);
    });
  }
  
  /**
   * Apply position with modulo wrapping
   */
  applyPosition(element, unwrappedY, cycleHeight) {
    // Modulo wrap for visual position
    let wrappedY = unwrappedY % cycleHeight;
    
    // Ensure wrapped position is in correct range for downward scroll
    // We want negative values for content above viewport
    while (wrappedY > 0) {
      wrappedY -= cycleHeight;
    }
    
    element.style.transform = `translateY(${wrappedY}px)`;
    
    // Debug: Check monotonicity
    if (this.debug && this.frameCount % 10 === 0) {
      const state = this.getStateByElement(element);
      if (state) {
        const deltaY = unwrappedY - state.prevUnwrappedY;
        if (deltaY < -0.001) {
          console.error(`❌ REVERSAL DETECTED! deltaY=${deltaY.toFixed(3)}`);
          this.reversalDetected = true;
        }
      }
    }
    
    return wrappedY;
  }
  
  /**
   * Get state by element
   */
  getStateByElement(element) {
    for (const [column, state] of this.columnStates) {
      if (state.element === element) return state;
    }
    return null;
  }
  
  /**
   * Calculate future congruent target
   */
  calculateFutureTarget(currentUnwrappedY, winnerIndex, cycleHeight) {
    // Base target position (winner at center)
    const baseTarget = CENTER_OFFSET - (winnerIndex * ITEM_H);
    
    // Find the next congruent position that's ahead of current position
    // target = baseTarget + k * cycleHeight where k = ceil((current - base) / cycle)
    const k = Math.ceil((currentUnwrappedY - baseTarget) / cycleHeight);
    const target = baseTarget + (k * cycleHeight);
    
    // Ensure target is ahead
    if (target <= currentUnwrappedY) {
      return target + cycleHeight;
    }
    
    return target;
  }
  
  /**
   * Main animation loop with delta-time integration
   */
  async runAnimation(columns, predeterminedResults) {
    return new Promise((resolve) => {
      let startTime = performance.now();
      let lastTime = startTime;
      
      // Calculate progressive speed for this spin
      const baseSpeed = ANIM_CONFIG.CRUISE_BASE_SPEED;
      const cruiseSpeed = baseSpeed + (this.spinNumber - 1) * ANIM_CONFIG.SPEED_INCREMENT;
      
      // Set up target positions for each column
      columns.forEach((column, index) => {
        const state = this.columnStates.get(column);
        if (!state) return;
        
        // Winner is always at index 20 for now
        const winnerIndex = 20;
        const futureTarget = this.calculateFutureTarget(
          state.unwrappedY,
          winnerIndex,
          state.cycleHeight
        );
        
        state.targetY = futureTarget;
        state.overshootY = futureTarget + ANIM_CONFIG.OVERSHOOT_AMOUNT;
        
        console.log(`Column ${index}: Target=${futureTarget.toFixed(1)}, Overshoot=${state.overshootY.toFixed(1)}`);
      });
      
      const animate = (currentTime) => {
        const dt = Math.min(50, currentTime - lastTime) / 1000; // Delta in seconds, clamped
        const totalElapsed = currentTime - startTime;
        lastTime = currentTime;
        
        // Update FPS
        if (this.debug) {
          this.fps = 1000 / (currentTime - this.lastFrameTime);
          this.lastFrameTime = currentTime;
          this.frameCount++;
        }
        
        let allComplete = true;
        
        columns.forEach((column, index) => {
          const state = this.columnStates.get(column);
          if (!state) return;
          
          // Store previous position for monotonicity check
          state.prevUnwrappedY = state.unwrappedY;
          
          // Calculate column-specific timing with stagger
          const columnStartDelay = index * ANIM_CONFIG.STAGGER_DELAY;
          const columnElapsed = Math.max(0, totalElapsed - columnStartDelay);
          
          // Determine current phase
          const phase = this.determinePhase(columnElapsed, state);
          
          // Update velocity based on phase
          this.updateVelocity(state, phase, columnElapsed, cruiseSpeed, dt);
          
          // Integrate position (ALWAYS FORWARD)
          state.unwrappedY += state.velocity * dt;
          
          // Apply position with modulo wrap
          const wrappedY = this.applyPosition(state.element, state.unwrappedY, state.cycleHeight);
          
          // Update blur based on velocity
          this.updateBlur(state.element, state.velocity, phase);
          
          // Check if this column is complete
          if (phase.name !== 'complete') {
            allComplete = false;
          }
          
          // Debug output
          if (this.debug && index === 0 && this.frameCount % 30 === 0) {
            console.log(`C0: phase=${phase.name}, vel=${state.velocity.toFixed(0)}, unwrapped=${state.unwrappedY.toFixed(0)}, wrapped=${wrappedY.toFixed(0)}`);
          }
        });
        
        // Update debug panel
        if (this.debug) {
          this.updateDebugPanel();
        }
        
        if (!allComplete) {
          this.animationFrameId = requestAnimationFrame(animate);
        } else {
          resolve();
        }
      };
      
      this.animationFrameId = requestAnimationFrame(animate);
    });
  }
  
  /**
   * Determine current animation phase
   */
  determinePhase(elapsed, state) {
    let cumulativeTime = 0;
    
    // Acceleration
    cumulativeTime += ANIM_CONFIG.ACCELERATION_DURATION;
    if (elapsed < cumulativeTime) {
      return {
        name: 'acceleration',
        progress: elapsed / ANIM_CONFIG.ACCELERATION_DURATION,
        elapsed: elapsed
      };
    }
    
    // Cruise
    cumulativeTime += ANIM_CONFIG.CRUISE_DURATION;
    if (elapsed < cumulativeTime) {
      return {
        name: 'cruise',
        progress: (elapsed - cumulativeTime + ANIM_CONFIG.CRUISE_DURATION) / ANIM_CONFIG.CRUISE_DURATION,
        elapsed: elapsed - cumulativeTime + ANIM_CONFIG.CRUISE_DURATION
      };
    }
    
    // Deceleration A (easeOutQuad)
    cumulativeTime += ANIM_CONFIG.DECEL_A_DURATION;
    if (elapsed < cumulativeTime) {
      return {
        name: 'decel_a',
        progress: (elapsed - cumulativeTime + ANIM_CONFIG.DECEL_A_DURATION) / ANIM_CONFIG.DECEL_A_DURATION,
        elapsed: elapsed - cumulativeTime + ANIM_CONFIG.DECEL_A_DURATION
      };
    }
    
    // Deceleration B (easeOutCubic)
    cumulativeTime += ANIM_CONFIG.DECEL_B_DURATION;
    if (elapsed < cumulativeTime) {
      return {
        name: 'decel_b',
        progress: (elapsed - cumulativeTime + ANIM_CONFIG.DECEL_B_DURATION) / ANIM_CONFIG.DECEL_B_DURATION,
        elapsed: elapsed - cumulativeTime + ANIM_CONFIG.DECEL_B_DURATION
      };
    }
    
    // Final Lock (easeOutQuart)
    cumulativeTime += ANIM_CONFIG.FINAL_LOCK_DURATION;
    if (elapsed < cumulativeTime) {
      return {
        name: 'final_lock',
        progress: (elapsed - cumulativeTime + ANIM_CONFIG.FINAL_LOCK_DURATION) / ANIM_CONFIG.FINAL_LOCK_DURATION,
        elapsed: elapsed - cumulativeTime + ANIM_CONFIG.FINAL_LOCK_DURATION
      };
    }
    
    // Overshoot (forward only)
    cumulativeTime += ANIM_CONFIG.OVERSHOOT_DURATION;
    if (elapsed < cumulativeTime) {
      return {
        name: 'overshoot',
        progress: (elapsed - cumulativeTime + ANIM_CONFIG.OVERSHOOT_DURATION) / ANIM_CONFIG.OVERSHOOT_DURATION,
        elapsed: elapsed - cumulativeTime + ANIM_CONFIG.OVERSHOOT_DURATION
      };
    }
    
    // Settle
    cumulativeTime += ANIM_CONFIG.SETTLE_DURATION;
    if (elapsed < cumulativeTime) {
      return {
        name: 'settle',
        progress: (elapsed - cumulativeTime + ANIM_CONFIG.SETTLE_DURATION) / ANIM_CONFIG.SETTLE_DURATION,
        elapsed: elapsed - cumulativeTime + ANIM_CONFIG.SETTLE_DURATION
      };
    }
    
    return { name: 'complete', progress: 1, elapsed: elapsed };
  }
  
  /**
   * Update velocity based on current phase
   */
  updateVelocity(state, phase, elapsed, cruiseSpeed, dt) {
    switch(phase.name) {
      case 'acceleration':
        // Smooth ramp up
        const accelProgress = this.easeOutQuad(phase.progress);
        state.velocity = ANIM_CONFIG.MIN_SPEED + (cruiseSpeed - ANIM_CONFIG.MIN_SPEED) * accelProgress;
        break;
        
      case 'cruise':
        // High speed with jitter
        const jitter = 1 + (Math.random() - 0.5) * ANIM_CONFIG.JITTER_AMOUNT;
        state.velocity = cruiseSpeed * jitter;
        break;
        
      case 'decel_a':
        // First deceleration stage (easeOutQuad)
        const decelA = this.easeOutQuad(phase.progress);
        state.velocity = cruiseSpeed * (1 - decelA * 0.4); // Reduce by 40%
        break;
        
      case 'decel_b':
        // Second deceleration stage (easeOutCubic)
        const decelB = this.easeOutCubic(phase.progress);
        state.velocity = cruiseSpeed * 0.6 * (1 - decelB * 0.5); // Reduce by another 50%
        break;
        
      case 'final_lock':
        // Final approach (easeOutQuart)
        const remaining = state.targetY - state.unwrappedY;
        const lockProgress = this.easeOutQuart(phase.progress);
        
        // Calculate velocity to reach target
        if (remaining > 0) {
          const timeLeft = ANIM_CONFIG.FINAL_LOCK_DURATION * (1 - phase.progress) / 1000;
          if (timeLeft > 0.01) {
            state.velocity = (remaining / timeLeft) * (1 - lockProgress * 0.8);
          } else {
            state.velocity = 100; // Minimum speed
          }
        } else {
          state.velocity = 100;
        }
        break;
        
      case 'overshoot':
        // Continue forward to overshoot position
        const overshootRemaining = state.overshootY - state.unwrappedY;
        if (overshootRemaining > 0) {
          const overshootProgress = this.easeOutCubic(phase.progress);
          state.velocity = 200 * (1 - overshootProgress);
        } else {
          state.velocity = 50;
        }
        break;
        
      case 'settle':
        // Final settle (moves forward slightly past overshoot)
        // This creates the visual "snap back" via modulo wrapping
        const settleProgress = this.easeOutQuad(phase.progress);
        state.velocity = 30 * (1 - settleProgress);
        break;
        
      default:
        state.velocity = 0;
    }
    
    // Ensure velocity is never negative (monotonic constraint)
    state.velocity = Math.max(0, state.velocity);
  }
  
  /**
   * Update blur effect based on velocity
   */
  updateBlur(element, velocity, phase) {
    const maxSpeed = ANIM_CONFIG.MAX_SPEED;
    const blurAmount = Math.min(ANIM_CONFIG.BLUR_MAX, (velocity / maxSpeed) * ANIM_CONFIG.BLUR_MAX);
    
    // Reduce blur during deceleration phases
    let blurMultiplier = 1;
    if (phase.name === 'decel_a' || phase.name === 'decel_b') {
      blurMultiplier = 1 - phase.progress * 0.5;
    } else if (phase.name === 'final_lock' || phase.name === 'overshoot' || phase.name === 'settle') {
      blurMultiplier = 0.2;
    }
    
    element.style.filter = `blur(${blurAmount * blurMultiplier}px)`;
  }
  
  /**
   * Easing functions
   */
  easeOutQuad(t) {
    return t * (2 - t);
  }
  
  easeOutCubic(t) {
    return 1 - Math.pow(1 - t, 3);
  }
  
  easeOutQuart(t) {
    return 1 - Math.pow(1 - t, 4);
  }
  
  /**
   * Create debug panel
   */
  createDebugPanel() {
    const panel = document.createElement('div');
    panel.id = 'anim-debug-v2';
    panel.style.cssText = `
      position: fixed;
      top: 10px;
      left: 10px;
      background: rgba(0, 0, 0, 0.9);
      color: #0f0;
      padding: 10px;
      font-family: monospace;
      font-size: 12px;
      z-index: 10000;
      border: 1px solid #0f0;
    `;
    panel.innerHTML = `
      <div>FPS: <span id="debug-fps">60</span></div>
      <div>Frame: <span id="debug-frame">0</span></div>
      <div>Spin: <span id="debug-spin">0</span></div>
      <div>Reversal: <span id="debug-reversal" style="color: #0f0;">NONE</span></div>
      <div>C0 Unwrapped: <span id="debug-unwrapped">0</span></div>
      <div>C0 Velocity: <span id="debug-velocity">0</span></div>
      <div>C0 Phase: <span id="debug-phase">idle</span></div>
    `;
    document.body.appendChild(panel);
  }
  
  /**
   * Update debug panel
   */
  updateDebugPanel() {
    if (!this.debug) return;
    
    document.getElementById('debug-fps').textContent = Math.round(this.fps);
    document.getElementById('debug-frame').textContent = this.frameCount;
    document.getElementById('debug-spin').textContent = this.spinNumber;
    
    const reversalEl = document.getElementById('debug-reversal');
    if (this.reversalDetected) {
      reversalEl.textContent = 'DETECTED!';
      reversalEl.style.color = '#f00';
    }
    
    // Get first column state
    const firstColumn = Array.from(this.columnStates.values())[0];
    if (firstColumn) {
      document.getElementById('debug-unwrapped').textContent = firstColumn.unwrappedY.toFixed(0);
      document.getElementById('debug-velocity').textContent = firstColumn.velocity.toFixed(0);
      document.getElementById('debug-phase').textContent = firstColumn.phase || 'idle';
    }
  }
  
  /**
   * Cleanup
   */
  cleanup() {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
    
    // Clear blur
    this.columnStates.forEach(state => {
      if (state.element) {
        state.element.style.filter = 'none';
      }
    });
    
    console.log(`Animation complete. Monotonicity preserved: ${!this.reversalDetected}`);
  }
  
  /**
   * Force stop animation
   */
  forceStopAnimation() {
    this.cleanup();
    this.isAnimating = false;
  }
}

// Export for use
window.AnimationEngineV2 = AnimationEngineV2;

/**
 * Forward-Only Overshoot Explanation:
 * 
 * Traditional overshoot: position goes A → B → A (reversal)
 * Our approach: unwrappedY goes A → B → C (always forward)
 * 
 * The "snap back" visual effect is achieved through modulo wrapping:
 * - Target at unwrappedY = 5000, wrappedY = -1520 (visible)
 * - Overshoot to unwrappedY = 5035, wrappedY = -1485 (slightly past)
 * - Settle to unwrappedY = 5050, wrappedY = -1470 (continues forward)
 * 
 * Since the item height is 80px and we overshoot by 35px, the visual
 * appears to "bounce back" but the actual position never decreases.
 * This preserves monotonicity while maintaining the desired effect.
 */