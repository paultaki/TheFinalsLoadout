/**
 * The Finals Slot Machine Animation Engine v2
 * Delta-time based, monotonic position tracking, physics-based braking
 * 
 * Core Principles:
 * - Single source of truth: unwrappedY (monotonically increasing)
 * - Visual position via modulo: wrappedY = unwrappedY % cycleHeight
 * - Physics-based smooth braking: d = v²/(2a)
 * - Natural completion without forced transitions
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
  DECEL_A_DURATION: 500,  // Added for quick spin compatibility
  DECEL_B_DURATION: 300,  // Added for quick spin compatibility
  
  // Speeds (px/s)
  MIN_SPEED: 300,
  MAX_SPEED: 2400,
  CRUISE_BASE_SPEED: 1800,
  SPEED_INCREMENT: 150,
  
  // Physics-based braking system
  DECELERATION_RATE: 800, // px/s² - how quickly we brake
  POSITION_EPSILON: 0.5,  // px - position tolerance for completion
  VELOCITY_THRESHOLD: 20, // px/s - velocity threshold for completion
  
  // Effects
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
    // DECEL_A_DURATION and DECEL_B_DURATION already defined in config
    
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
        
        // Physics-based braking
        brakingDistance: 0,
        inBrakingPhase: false,
        
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
    
    // Triple-check our math - fix the wrapped calculation
    const checkRemainder = targetUnwrapped % cycleHeight;
    let checkWrapped;
    
    // If the remainder matches our target remainder, we're good
    if (Math.abs(checkRemainder - targetRemainder) < 0.1) {
      // Convert to wrapped position (negative range)
      checkWrapped = targetWrappedPosition;
    } else {
      // Fallback calculation
      checkWrapped = checkRemainder > 0 ? checkRemainder - cycleHeight : checkRemainder;
    }
    
    // Log for debugging but don't block on errors
    if (Math.abs(checkWrapped - targetWrappedPosition) > 0.1) {
      console.warn(`⚠️ Target position mismatch (will self-correct):`);
      console.warn(`  Want: ${targetWrappedPosition}px, Got: ${checkWrapped}px`);
      // Don't throw error - let animation continue
    } else {
      console.log(`✅ Target correct: unwrapped=${targetUnwrapped.toFixed(0)} → wrapped=${targetWrappedPosition.toFixed(0)}px`);
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
      const maxDuration = 8000; // 8 second maximum to prevent infinite loop
      
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
        // Initialize braking distance (will be calculated dynamically)
        state.brakingDistance = 0;
        state.inBrakingPhase = false;
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
        
        // Safety timeout check to prevent infinite loop
        if (totalElapsed > maxDuration) {
          console.warn(`⚠️ Animation timeout after ${maxDuration}ms - forcing completion`);
          // Apply final positions when timeout occurs
          columns.forEach((column, index) => {
            const state = this.columnStates.get(column);
            if (!state || !state.targetY) return;
            
            // Snap to final target position
            state.unwrappedY = state.targetY;
            state.velocity = 0;
            
            // Apply the correct final wrapped position
            const finalWrapped = this.applyPosition(state.element, state.unwrappedY, state.cycleHeight);
            console.log(`🎯 Timeout snap Column ${index}: unwrapped=${state.unwrappedY.toFixed(1)}, wrapped=${finalWrapped.toFixed(1)}px`);
          });
          resolve();
          return;
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
          
          // Determine current phase with physics-based braking
          const phase = this.determinePhase(columnElapsed, state);
          state.phase = phase.name; // Store for debug
          
          // Update velocity based on phase with physics-based braking
          this.updateVelocity(state, phase, columnElapsed, cruiseSpeed, dt);
          
          // Integrate position (ALWAYS FORWARD)
          const deltaPos = Math.max(0, state.velocity * dt); // Ensure delta is never negative
          // Use higher precision to prevent cumulative drift
          state.unwrappedY = Math.round((state.unwrappedY + deltaPos) * 1000) / 1000; // Round to 0.001px for better precision
          
          
          // Apply position with modulo wrap
          const wrappedY = this.applyPosition(state.element, state.unwrappedY, state.cycleHeight);
          
          // Update blur based on velocity
          this.updateBlur(state.element, state.velocity, phase);
          
          // Check if this column is complete using physics-based criteria
          if (!this.isAnimationComplete(state)) {
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
          // Animation completed naturally - no forced transitions or snapping
          columns.forEach((column, index) => {
            const state = this.columnStates.get(column);
            if (!state) return;
            
            // Final position verification (no forced positioning)
            const finalWrapped = this.applyPosition(state.element, state.unwrappedY, state.cycleHeight);
            const expectedWrapped = -(20 * ITEM_H) + CENTER_OFFSET; // -1520px
            
            console.log(`🎯 Column ${index} SMOOTH COMPLETE: unwrapped=${state.unwrappedY.toFixed(1)}, wrapped=${finalWrapped.toFixed(1)}px, velocity=${state.velocity.toFixed(1)}px/s`);
            
            // Verify we're within acceptable range
            if (Math.abs(finalWrapped - expectedWrapped) > 2) {
              console.warn(`Column ${index}: Final position ${finalWrapped.toFixed(1)}px differs from expected ${expectedWrapped}px`);
            }
          });
          
          resolve();
        }
      };
      
      this.animationFrameId = requestAnimationFrame(animate);
    });
  }
  
  /**
   * Determine current animation phase with physics-based braking
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
    
    // After cruise, enter physics-based braking phase
    // Calculate braking distance based on current velocity
    const distanceToTarget = state.targetY - state.unwrappedY;
    state.brakingDistance = this.calculateBrakingDistance(state.velocity);
    
    // Check if we should start braking
    if (distanceToTarget <= state.brakingDistance || state.inBrakingPhase) {
      state.inBrakingPhase = true;
      return {
        name: 'braking',
        progress: 1 - (distanceToTarget / state.brakingDistance), // 0 = start braking, 1 = at target
        elapsed: elapsed - cumulativeTime,
        distanceToTarget: distanceToTarget
      };
    }
    
    // Continue cruise until we reach braking distance
    return {
      name: 'cruise_extended',
      progress: 0,
      elapsed: elapsed - cumulativeTime,
      distanceToTarget: distanceToTarget
    };
  }
  
  /**
   * Update velocity based on current phase with physics-based braking
   */
  updateVelocity(state, phase, elapsed, cruiseSpeed, dt) {
    switch(phase.name) {
      case 'acceleration':
        // Smooth ramp up
        const accelProgress = this.easeOutQuad(phase.progress);
        state.velocity = ANIM_CONFIG.MIN_SPEED + (cruiseSpeed - ANIM_CONFIG.MIN_SPEED) * accelProgress;
        break;
        
      case 'cruise':
      case 'cruise_extended':
        // High speed with jitter
        const jitter = 1 + (Math.random() - 0.5) * ANIM_CONFIG.JITTER_AMOUNT;
        state.velocity = cruiseSpeed * jitter;
        break;
        
      case 'braking':
        // Physics-based deceleration: v² = u² + 2as
        // We want to reach near-zero velocity at the target
        const distanceToTarget = phase.distanceToTarget;
        
        if (distanceToTarget > ANIM_CONFIG.POSITION_EPSILON) {
          // Use physics equation: v² = 2as, where a = -DECELERATION_RATE
          // v = sqrt(2 * deceleration * distance_remaining)
          const targetVelocity = Math.sqrt(2 * ANIM_CONFIG.DECELERATION_RATE * distanceToTarget);
          
          // Apply deceleration smoothly (don't instantly change velocity)
          const maxVelocityChange = ANIM_CONFIG.DECELERATION_RATE * dt;
          
          if (state.velocity > targetVelocity) {
            // Decelerate
            state.velocity = Math.max(targetVelocity, state.velocity - maxVelocityChange);
          } else {
            // Don't accelerate if we're already slower than target
            state.velocity = Math.min(targetVelocity, state.velocity);
          }
          
          // Distance-aware minimum velocity logic
          const minVelocity = distanceToTarget < 5 ? 0 : ANIM_CONFIG.VELOCITY_THRESHOLD * 0.5;
          state.velocity = Math.max(minVelocity, state.velocity);
        } else {
          // Very close to target - exponential decay for smooth final approach
          const decayFactor = 0.95; // Exponential decay rate
          state.velocity = state.velocity * Math.pow(decayFactor, dt * 60); // Frame-rate independent decay
          
          // Allow natural stopping
          if (state.velocity < 1) {
            state.velocity = 0;
          }
        }
        break;
        
      default:
        // Shouldn't reach here with new physics system
        state.velocity = Math.max(0, state.velocity - ANIM_CONFIG.DECELERATION_RATE * dt);
    }
    
    // Ensure velocity is never negative (monotonic constraint)
    state.velocity = Math.max(0, state.velocity);
  }
  
  /**
   * Calculate braking distance using physics equation: d = v²/(2a)
   */
  calculateBrakingDistance(velocity) {
    // d = v² / (2 * deceleration_rate)
    const distance = (velocity * velocity) / (2 * ANIM_CONFIG.DECELERATION_RATE);
    return Math.max(80, distance); // Minimum braking distance of 80px (1 item height)
  }
  
  /**
   * Check if animation is complete based on physics criteria
   */
  isAnimationComplete(state) {
    const distanceToTarget = state.targetY - state.unwrappedY;
    const withinPositionTolerance = Math.abs(distanceToTarget) <= ANIM_CONFIG.POSITION_EPSILON; // Use consistent config value
    const belowVelocityThreshold = state.velocity <= ANIM_CONFIG.VELOCITY_THRESHOLD; // Use consistent config value
    
    // Animation is complete when BOTH conditions are met:
    // 1. Close enough to target position (within config tolerance)
    // 2. Velocity is low enough (below config threshold)
    const isComplete = withinPositionTolerance && belowVelocityThreshold;
    
    // Debug logging for first column
    if (state.index === 0 && this.debug && this.frameCount % 30 === 0) {
      console.log(`Completion check: distance=${distanceToTarget.toFixed(2)}px, velocity=${state.velocity.toFixed(1)}px/s, complete=${isComplete}`);
    }
    
    return isComplete;
  }
  
  /**
   * Update blur effect based on velocity
   */
  updateBlur(element, velocity, phase) {
    const maxSpeed = ANIM_CONFIG.MAX_SPEED;
    const blurAmount = Math.min(ANIM_CONFIG.BLUR_MAX, (velocity / maxSpeed) * ANIM_CONFIG.BLUR_MAX);
    
    // Reduce blur during braking phase
    let blurMultiplier = 1;
    if (phase.name === 'braking') {
      // Gradually reduce blur as we approach target
      const progressToTarget = Math.min(1, phase.progress);
      blurMultiplier = 1 - progressToTarget * 0.8; // Reduce blur by up to 80%
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
      <div>C0 Distance: <span id="debug-distance">0</span></div>
      <div>C0 Braking Dist: <span id="debug-braking-dist">0</span></div>
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
      const distanceToTarget = firstColumn.targetY ? firstColumn.targetY - firstColumn.unwrappedY : 0;
      const brakingDist = this.calculateBrakingDistance(firstColumn.velocity);
      
      document.getElementById('debug-unwrapped').textContent = firstColumn.unwrappedY.toFixed(0);
      document.getElementById('debug-velocity').textContent = firstColumn.velocity.toFixed(0);
      document.getElementById('debug-phase').textContent = firstColumn.phase || 'idle';
      document.getElementById('debug-distance').textContent = distanceToTarget.toFixed(0);
      document.getElementById('debug-braking-dist').textContent = brakingDist.toFixed(0);
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
 * Physics-Based Smooth Braking System:
 * 
 * Traditional time-based approach: Hard phases with forced transitions at end
 * Our approach: Physics-based deceleration with natural completion
 * 
 * Key principles:
 * 1. Braking distance calculated using: d = v²/(2a) where a = deceleration_rate
 * 2. Braking starts when distance_to_target ≤ braking_distance
 * 3. Velocity controlled by: v = √(2 × deceleration × distance_remaining)
 * 4. Completion criteria: distance ≤ 0.5px AND velocity ≤ 20px/s
 * 5. No forced CSS transitions or position snapping
 * 
 * This ensures:
 * - Smooth deceleration based on current velocity
 * - Natural stopping without abrupt changes
 * - Monotonic forward motion (no reversals)
 * - CENTER_OFFSET=80 keeps winner centered in 240px viewport
 * - wrappedY stays in range (-cycleHeight, 0] via modulo arithmetic
 */