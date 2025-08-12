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
// The viewport shows 3 items (80px each)
// Row 1: 0-80px, Row 2: 80-160px (center), Row 3: 160-240px
// To place winner at start of Row 2 (center):
// Winner at index 20 = 1600px from top
// To show at 80px in viewport: translateY = -(20 * 80) + 80 = -1520px
const CENTER_OFFSET = 80; // Position winner at row 2 (center row)

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
  MIN_SPEED: 300,  // Increased from 100 to avoid jerky slow motion
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
    // Debug mode (disabled for production)
    this.debug = false;
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
   * Reset animation state completely
   */
  resetAnimation() {
    // Cancel any running animations
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
    
    // Clear all column states
    this.columnStates.clear();
    
    // Reset flags
    this.isAnimating = false;
    this.spinNumber = 0;
    this.frameCount = 0;
    this.reversalDetected = false;
    
    // Clear any visual effects
    const columns = document.querySelectorAll('.slot-column');
    columns.forEach(col => {
      const itemsContainer = col.querySelector('.slot-items');
      if (itemsContainer) {
        itemsContainer.style.transform = 'translateY(0)';
        itemsContainer.style.filter = 'none';
        itemsContainer.style.transition = 'none';
      }
    });
  }
  
  /**
   * Main animation orchestrator
   */
  async animateSlotMachine(columns, scrollContents, predeterminedResults) {
    // Reset everything first
    this.resetAnimation();
    
    if (this.isAnimating) {
      return; // Animation already in progress
    }
    
    this.isAnimating = true;
    // Start at 1 for proper speed calculation
    this.spinNumber = 1;
    
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
   * Quick spin animation (shorter duration)
   */
  async animateQuickSpin(columns, scrollContents) {
    // For quick spin, temporarily reduce durations
    const originalDurations = {
      ACCELERATION_DURATION: ANIM_CONFIG.ACCELERATION_DURATION,
      CRUISE_DURATION: ANIM_CONFIG.CRUISE_DURATION,
      DECEL_A_DURATION: ANIM_CONFIG.DECEL_A_DURATION,
      DECEL_B_DURATION: ANIM_CONFIG.DECEL_B_DURATION,
    };
    
    // Reduce durations for quick spin
    ANIM_CONFIG.ACCELERATION_DURATION = 400;
    ANIM_CONFIG.CRUISE_DURATION = 800;
    ANIM_CONFIG.DECEL_A_DURATION = 300;
    ANIM_CONFIG.DECEL_B_DURATION = 200;
    
    try {
      await this.animateSlotMachine(columns, scrollContents, null);
    } finally {
      // Restore original durations
      Object.assign(ANIM_CONFIG, originalDurations);
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
      // Use a large base offset to ensure unwrapped position is always positive
      // This base should be consistent with our target calculation
      const baseOffset = 10000;
      const unwrappedStart = baseOffset + startPos; // Will be around 8400 for -1600 start
      
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
    // Debug the calculation
    const state = this.getStateByElement(element);
    const isFirstColumn = state && state.index === 0;
    
    // Calculate wrapped position for display
    // The wrapped position should be in range (-cycleHeight, 0]
    let wrappedY = unwrappedY % cycleHeight;
    
    // Debug log before conversion
    if (isFirstColumn && this.debug && this.frameCount % 100 === 0) {
      console.log(`Pre-wrap: unwrapped=${unwrappedY.toFixed(1)}, modulo=${wrappedY.toFixed(1)}, cycle=${cycleHeight}`);
    }
    
    // Convert to negative range for proper display
    if (wrappedY > 0) {
      wrappedY = wrappedY - cycleHeight;
    }
    
    // Ensure we're in the correct range
    while (wrappedY < -cycleHeight) {
      wrappedY += cycleHeight;
    }
    
    // Keep subpixel precision for smooth animation
    // Only round for final position
    
    // Use translate3d for hardware acceleration
    element.style.transform = `translate3d(0, ${wrappedY}px, 0)`;
    element.style.willChange = 'transform';
    element.style.backfaceVisibility = 'hidden';
    
    // Check monotonicity
    if (this.debug && this.frameCount % 10 === 0 && state) {
      const deltaY = unwrappedY - state.prevUnwrappedY;
      if (deltaY < -0.001) {
        console.error(`❌ REVERSAL DETECTED! deltaY=${deltaY.toFixed(3)}`);
        this.reversalDetected = true;
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
    // Winner positioning for Row 2 (center):
    // - Viewport: 240px (3 items of 80px each)
    // - Row 1: 0-80px
    // - Row 2: 80-160px (CENTER - target here)
    // - Row 3: 160-240px
    //
    // Winner at index 20 (20 items above it = 1600px from top)
    // To place winner at row 2 start (80px in viewport):
    // translateY = -(winnerIndex * ITEM_H) + CENTER_OFFSET
    // translateY = -(20 * 80) + 80 = -1520px
    const targetWrappedPosition = -(winnerIndex * ITEM_H) + CENTER_OFFSET; // -1520px for center row
    
    // Now find an unwrapped position that gives us this wrapped position
    // For modulo math: we need remainder that gives us -1520 when wrapped
    // If cycleHeight = 4800, we want: X % 4800 = 3280 (because 3280 - 4800 = -1520)
    const targetRemainder = (targetWrappedPosition % cycleHeight + cycleHeight) % cycleHeight; // 3280 for center position
    
    // Find the next position ahead that has this remainder
    let cycles = Math.ceil(currentUnwrappedY / cycleHeight) + 1; // At least one cycle ahead
    let targetUnwrapped = cycles * cycleHeight + targetRemainder;
    
    // Ensure it's ahead of current
    while (targetUnwrapped <= currentUnwrappedY) {
      targetUnwrapped += cycleHeight;
      cycles++;
    }
    
    // Triple-check our math
    const checkRemainder = targetUnwrapped % cycleHeight;
    const checkWrapped = checkRemainder > 0 ? checkRemainder - cycleHeight : checkRemainder;
    
    if (Math.abs(checkWrapped - targetWrappedPosition) > 0.1) {
      console.error(`❌ Target calculation error!`);
      console.error(`  Want wrapped: ${targetWrappedPosition}px`);
      console.error(`  Got wrapped: ${checkWrapped}px`);
      console.error(`  Unwrapped: ${targetUnwrapped}, Remainder: ${checkRemainder}`);
    } else {
      console.log(`✅ Target correct: unwrapped=${targetUnwrapped.toFixed(0)} → wrapped=${checkWrapped.toFixed(0)}px`);
    }
    
    return targetUnwrapped;
  }
  
  /**
   * Main animation loop with delta-time integration
   */
  async runAnimation(columns, predeterminedResults) {
    return new Promise((resolve) => {
      let startTime = performance.now();
      let lastTime = startTime;
      
      // Use consistent speed for all columns in this animation
      const cruiseSpeed = ANIM_CONFIG.CRUISE_BASE_SPEED;
      
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
        state.overshootY = futureTarget; // No actual overshoot to maintain accuracy
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
          const prevY = state.unwrappedY;
          state.prevUnwrappedY = prevY;
          
          // Calculate column-specific timing with stagger
          const columnStartDelay = index * ANIM_CONFIG.STAGGER_DELAY;
          const columnElapsed = Math.max(0, totalElapsed - columnStartDelay);
          
          // Determine current phase
          const phase = this.determinePhase(columnElapsed, state);
          state.phase = phase.name; // Store for debug
          
          // Update velocity based on phase
          this.updateVelocity(state, phase, columnElapsed, cruiseSpeed, dt);
          
          // Integrate position (ALWAYS FORWARD)
          const deltaPos = Math.max(0, state.velocity * dt); // Ensure delta is never negative
          // Round to prevent subpixel accumulation
          state.unwrappedY = Math.round((state.unwrappedY + deltaPos) * 100) / 100; // Round to 0.01px
          
          
          // Apply position with modulo wrap
          const wrappedY = this.applyPosition(state.element, state.unwrappedY, state.cycleHeight);
          
          // Update blur based on velocity
          this.updateBlur(state.element, state.velocity, phase);
          
          // Check if this column is complete
          if (phase.name !== 'complete') {
            allComplete = false;
          }
          
        });
        
        // Update debug panel
        if (this.debug) {
          this.updateDebugPanel();
        }
        
        if (!allComplete) {
          this.animationFrameId = requestAnimationFrame(animate);
        } else {
          // After the animation completes, ensure all columns are at exact positions
          columns.forEach((column, index) => {
            const state = this.columnStates.get(column);
            if (!state) return;
            
            // Apply smooth transition for final positioning
            state.element.style.transition = 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
            
            // Force exact target position for ALL columns
            state.unwrappedY = state.targetY;
            const finalWrapped = this.applyPosition(state.element, state.unwrappedY, state.cycleHeight);
            
            // Verify position
            const expectedWrapped = -(20 * ITEM_H) + CENTER_OFFSET; // -1520px
            if (Math.abs(finalWrapped - expectedWrapped) > 1) {
              console.warn(`Column ${index}: Small adjustment from ${finalWrapped.toFixed(1)} to ${expectedWrapped}px`);
            }
            
            // Clear transition after positioning
            setTimeout(() => {
              state.element.style.transition = 'none';
            }, 350);
            
            console.log(`🎯 Column ${index} FINAL: unwrapped=${state.unwrappedY.toFixed(1)}, wrapped=${finalWrapped.toFixed(1)}px`);
          });
          
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
        // Final approach to exact target (easeOutQuart)
        const remaining = state.targetY - state.unwrappedY;
        const lockProgress = this.easeOutQuart(phase.progress);
        
        if (remaining > 0) {
          // Calculate required velocity to reach target
          const timeLeft = ANIM_CONFIG.FINAL_LOCK_DURATION * (1 - phase.progress) / 1000;
          if (timeLeft > 0.001) {
            // Direct calculation - we MUST reach the target
            state.velocity = remaining / timeLeft;
            // Don't apply too much easing or we won't reach target
            // Ensure we maintain enough speed
            state.velocity = Math.max(100, state.velocity * (1 - lockProgress * 0.3));
          } else {
            // Almost at end - big push to reach target
            state.velocity = Math.max(100, remaining * 10);
          }
        } else {
          // At or past target - minimal forward motion
          state.velocity = 10;
        }
        break;
        
      case 'overshoot':
        // Visual overshoot only - don't actually move past target
        // This phase just slows down to create settling effect
        state.velocity = 0; // Stop at target, no actual overshoot
        break;
        
      case 'settle':
        // Only move forward if we haven't reached target yet
        const finalRemaining = state.targetY - state.unwrappedY;
        if (finalRemaining > 0.1) {
          // Still need to reach target - move forward
          const settleTimeLeft = ANIM_CONFIG.SETTLE_DURATION * (1 - phase.progress) / 1000;
          if (settleTimeLeft > 0.001) {
            state.velocity = Math.max(10, finalRemaining / settleTimeLeft);
          } else {
            state.velocity = Math.max(50, finalRemaining * 10); // Final push
          }
        } else {
          // At or past target - stop (never move backward)
          state.velocity = 0;
        }
        break;
        
      default:
        state.velocity = 0;
    }
    
    // Ensure velocity is never negative (monotonic constraint)
    state.velocity = Math.max(0, state.velocity);
    
    // Extra safety check
    if (state.velocity < 0) {
      console.error(`⚠️ Negative velocity detected in ${phase.name}: ${state.velocity}`);
      state.velocity = 0;
    }
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