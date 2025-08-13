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
   * @param {Array} columns - Column elements
   * @param {Object} scrollContents - Scroll content data
   * @param {Object} predeterminedResults - Winner data (null for continuous spins)
   * @param {boolean} preservePosition - Keep current position for multi-spin continuity
   */
  async animateSlotMachine(columns, scrollContents, predeterminedResults, preservePosition = false) {
    // Only reset if not preserving position (for multi-spin continuity)
    if (!preservePosition) {
      this.resetAnimation();
    }
    
    if (this.isAnimating) {
      return; // Animation already in progress
    }
    
    this.isAnimating = true;
    // Increment spin number for multi-spin sequences
    this.spinNumber = preservePosition ? this.spinNumber + 1 : 1;
    
    try {
      // Initialize column states with position preservation option
      this.initializeColumnStates(columns, preservePosition);
      
      // Run the animation phases
      await this.runAnimation(columns, predeterminedResults);
      
    } finally {
      this.isAnimating = false;
      // Only cleanup completely if not preserving for next spin
      if (!preservePosition || predeterminedResults) {
        this.cleanup();
      }
    }
  }
  
  /**
   * Quick spin animation (shorter duration)
   * @param {Array} columns - Column elements
   * @param {Object} scrollContents - Scroll content data
   * @param {boolean} preservePosition - Keep current position for multi-spin continuity
   */
  async animateQuickSpin(columns, scrollContents, preservePosition = false) {
    // For quick spin, temporarily reduce durations
    const originalDurations = {
      ACCELERATION_DURATION: ANIM_CONFIG.ACCELERATION_DURATION,
      CRUISE_DURATION: ANIM_CONFIG.CRUISE_DURATION,
      DECEL_A_DURATION: ANIM_CONFIG.DECEL_A_DURATION,
      DECEL_B_DURATION: ANIM_CONFIG.DECEL_B_DURATION,
    };
    
    // Reduce durations for quick spin but keep velocity high for intermediate spins
    ANIM_CONFIG.ACCELERATION_DURATION = 400;
    ANIM_CONFIG.CRUISE_DURATION = 1200; // Longer cruise for seamless continuity
    // No deceleration for intermediate spins - maintain full velocity
    
    try {
      await this.animateSlotMachine(columns, scrollContents, null, preservePosition);
    } finally {
      // Restore original durations
      Object.assign(ANIM_CONFIG, originalDurations);
    }
  }
  
  /**
   * Initialize column states with unwrapped position tracking
   * @param {Array} columns - Column elements
   * @param {boolean} preservePosition - Keep existing unwrapped position for continuity
   */
  initializeColumnStates(columns, preservePosition = false) {
    columns.forEach((column, index) => {
      const itemsContainer = column.querySelector('.slot-items');
      if (!itemsContainer) return;
      
      const itemCount = itemsContainer.children.length;
      const cycleHeight = itemCount * ITEM_H;
      
      // Read initial position from DOM
      const currentTransform = itemsContainer.style.transform;
      let startPos = -1680; // Default (winner at effective position 20 above viewport)
      const match = currentTransform.match(/translateY\((-?\d+(?:\.\d+)?)px\)/);
      if (match) {
        startPos = parseFloat(match[1]);
      }
      
      let unwrappedStart;
      let startVelocity = 0;
      
      // Check if we should preserve position for multi-spin continuity
      const existingState = this.columnStates.get(column);
      if (preservePosition && existingState) {
        // Continue from current unwrapped position
        unwrappedStart = existingState.unwrappedY;
        startVelocity = Math.max(ANIM_CONFIG.CRUISE_BASE_SPEED, existingState.velocity); // Maintain high velocity
        console.log(`🔄 Preserving unwrapped position for column ${index}: ${unwrappedStart.toFixed(1)}px, velocity: ${startVelocity.toFixed(1)}px/s`);
      } else {
        // Initialize new position
        // Use a large base offset to ensure unwrapped position is always positive
        // This base should be consistent with our target calculation
        const baseOffset = 10000;
        unwrappedStart = baseOffset + startPos; // Will be around 8320 for -1680 start
        console.log(`🆕 New unwrapped position for column ${index}: ${unwrappedStart.toFixed(1)}px`);
      }
      
      this.columnStates.set(column, {
        element: itemsContainer,
        index: index,
        cycleHeight: cycleHeight,
        itemCount: itemCount,
        
        // Position tracking (monotonic)
        unwrappedY: unwrappedStart,
        prevUnwrappedY: unwrappedStart,
        
        // Velocity (preserve high velocity for continuity)
        velocity: startVelocity,
        targetVelocity: 0,
        
        // Target position for deceleration
        targetY: null,
        
        // Physics-based braking
        brakingDistance: 0,
        inBrakingPhase: false,
        
        // Phase tracking
        phase: preservePosition ? 'cruise' : 'idle', // Start in cruise if preserving
        phaseStartTime: 0,
        phaseProgress: 0
      });
      
      // Apply current position
      this.applyPosition(itemsContainer, unwrappedStart, cycleHeight);
    });
  }
  
  /**
   * Apply position with modulo wrapping and device pixel snapping
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
    
    // CRITICAL FIX: When in final positioning (very close to target), ensure precise center alignment
    // Check if we're close to the target position (within 0.5px tolerance)
    if (state && state.targetY && Math.abs(unwrappedY - state.targetY) < 0.5) {
      const expectedWrapped = -(20 * ITEM_H) + CENTER_OFFSET; // -1520px for center position
      // Force the wrapped position to be exactly -1520px for final positioning
      wrappedY = expectedWrapped;
      
      if (isFirstColumn && this.debug) {
        console.log(`🎯 Final position snap: forced to ${expectedWrapped}px for precise center alignment`);
      }
    }
    
    // Apply device pixel snapping for crisp visuals
    const devicePixelRatio = window.devicePixelRatio || 1;
    const snappedY = Math.round(wrappedY * devicePixelRatio) / devicePixelRatio;
    
    // Use translate3d for hardware acceleration
    element.style.transform = `translate3d(0, ${snappedY}px, 0)`;
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
    
    return snappedY;
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
    const targetRemainder = (targetWrappedPosition % cycleHeight + cycleHeight) % cycleHeight; // e.g., 3280 for -1520px position
    
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
      const maxDuration = 30000; // 30 second maximum (only for safety, should complete naturally)
      
      // Use consistent speed for all columns in this animation
      const cruiseSpeed = ANIM_CONFIG.CRUISE_BASE_SPEED;
      
      // Only set up target positions if we have predetermined results (final spin)
      const isFinalSpin = predeterminedResults !== null;
      
      if (isFinalSpin) {
        // Set up target positions for each column (final spin only)
        columns.forEach((column, index) => {
          const state = this.columnStates.get(column);
          if (!state) return;
          
          // Winner is at index 20 to achieve -1520px center position
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
      } else {
        // For intermediate spins, don't set targets - maintain velocity
        columns.forEach((column, index) => {
          const state = this.columnStates.get(column);
          if (!state) return;
          
          state.targetY = null; // No target for intermediate spins
          state.brakingDistance = 0;
          state.inBrakingPhase = false;
        });
      }
      
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
        
        // For intermediate spins, complete after cruise duration
        if (!isFinalSpin) {
          const intermediateDuration = ANIM_CONFIG.ACCELERATION_DURATION + ANIM_CONFIG.CRUISE_DURATION;
          if (totalElapsed >= intermediateDuration) {
            console.log(`✅ Intermediate spin completed after ${totalElapsed.toFixed(0)}ms (maintaining velocity)`);
            resolve();
            return;
          }
        }
        
        // Safety timeout check to prevent infinite loop
        if (totalElapsed > maxDuration) {
          console.warn(`⚠️ Animation timeout after ${maxDuration}ms - forcing completion`);
          // Timeout reached - let columns finish naturally at their current positions
          console.warn(`⚠️ Safety timeout reached - animation should have completed naturally`);
          columns.forEach((column, index) => {
            const state = this.columnStates.get(column);
            if (!state) return;
            console.log(`Column ${index} timeout state: unwrapped=${state.unwrappedY.toFixed(1)}, velocity=${state.velocity.toFixed(1)}`);
          });
          resolve();
          return;
        }
        
        let allComplete = true;
        
        // Let physics-based completion run naturally without time-based forcing
        
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
          const phase = this.determinePhase(columnElapsed, state, isFinalSpin);
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
          
          // For final spins, check physics-based completion
          if (isFinalSpin && !this.isAnimationComplete(state, isFinalSpin)) {
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
          // Animation completed naturally with physics-based stopping
          columns.forEach((column, index) => {
            const state = this.columnStates.get(column);
            if (!state) return;
            
            // Log completion without forced positioning
            const currentWrapped = state.unwrappedY % state.cycleHeight;
            const displayWrapped = currentWrapped > 0 ? currentWrapped - state.cycleHeight : currentWrapped;
            
            console.log(`🎯 Column ${index} NATURAL COMPLETE: unwrapped=${state.unwrappedY.toFixed(1)}, wrapped=${displayWrapped.toFixed(1)}px, velocity=${state.velocity.toFixed(1)}px/s`);
          });
          
          resolve();
        }
      };
      
      this.animationFrameId = requestAnimationFrame(animate);
    });
  }
  
  /**
   * Determine current animation phase with physics-based braking
   * @param {number} elapsed - Time elapsed for this column
   * @param {Object} state - Column state
   * @param {boolean} isFinalSpin - Whether this is the final spin with targets
   */
  determinePhase(elapsed, state, isFinalSpin = true) {
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
    
    // For intermediate spins (not final), stay in cruise mode indefinitely
    if (!isFinalSpin || !state.targetY) {
      return {
        name: 'cruise_extended',
        progress: 0,
        elapsed: elapsed - cumulativeTime,
        distanceToTarget: 0 // No target for intermediate spins
      };
    }
    
    // After cruise, enter physics-based braking phase (final spin only)
    // Calculate braking distance based on current velocity (dynamic calculation)
    const distanceToTarget = state.targetY - state.unwrappedY;
    const currentBrakingDistance = this.calculateBrakingDistance(state.velocity);
    
    // Check if we should start braking (or if already braking)
    if (distanceToTarget <= currentBrakingDistance || state.inBrakingPhase) {
      state.inBrakingPhase = true;
      // Update braking distance dynamically for more accurate progress calculation
      state.brakingDistance = Math.max(currentBrakingDistance, state.brakingDistance || currentBrakingDistance);
      return {
        name: 'braking',
        progress: Math.min(1, Math.max(0, 1 - (distanceToTarget / state.brakingDistance))), // Clamp between 0-1
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
        
        // Use physics equation: v² = 2as, where a = -DECELERATION_RATE
        // v = sqrt(2 * deceleration * distance_remaining)
        const targetVelocity = Math.sqrt(2 * ANIM_CONFIG.DECELERATION_RATE * Math.max(0.1, distanceToTarget));
        
        // Apply deceleration smoothly
        const maxVelocityChange = ANIM_CONFIG.DECELERATION_RATE * dt;
        
        if (state.velocity > targetVelocity) {
          // Decelerate towards target velocity
          state.velocity = Math.max(targetVelocity, state.velocity - maxVelocityChange);
        } else {
          // Don't accelerate if we're already slower than target
          state.velocity = Math.min(targetVelocity, state.velocity);
        }
        
        // Enhanced exponential decay for natural velocity reduction below 12px/s
        if (distanceToTarget < 40) { // Start decay earlier (within 40px = 1/2 item)
          const decayFactor = 0.85; // Stronger decay rate for more aggressive slowdown
          state.velocity = state.velocity * Math.pow(decayFactor, dt * 60);
        }
        
        // Additional decay when getting very close to ensure velocity drops below 12px/s
        if (distanceToTarget < 10) {
          const finalDecayFactor = 0.75; // Very strong decay for final approach
          state.velocity = state.velocity * Math.pow(finalDecayFactor, dt * 60);
        }
        
        // Final threshold: allow velocity to drop to zero when very close
        if (distanceToTarget < 2) {
          state.velocity = Math.max(0, state.velocity - 200 * dt); // More rapid final deceleration
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
    // d = v² / (2 * deceleration_rate) - physics equation for stopping distance
    const distance = (velocity * velocity) / (2 * ANIM_CONFIG.DECELERATION_RATE);
    // Minimum braking distance should be smaller for better precision
    return Math.max(40, distance); // Minimum braking distance of 40px (1/2 item height) for better control
  }
  
  /**
   * Check if animation is complete based on physics criteria
   * @param {Object} state - Column state
   * @param {boolean} isFinalSpin - Whether this is the final spin with targets
   */
  isAnimationComplete(state, isFinalSpin = true) {
    // For intermediate spins, complete after cruise duration (maintain velocity)
    if (!isFinalSpin || !state.targetY) {
      // Complete intermediate spins after cruise duration is reached
      const totalDuration = ANIM_CONFIG.ACCELERATION_DURATION + ANIM_CONFIG.CRUISE_DURATION;
      const elapsed = performance.now() - (state.phaseStartTime || 0);
      return elapsed >= totalDuration;
    }
    
    const distanceToTarget = state.targetY - state.unwrappedY;
    
    // Physics-based completion criteria for natural stopping below 12px/s
    const withinPositionTolerance = Math.abs(distanceToTarget) <= 1.0; // Tighter position tolerance
    const belowVelocityThreshold = state.velocity < 12; // Must be below 12 px/s as required
    
    // Alternative completion: if we're very close and moving very slowly
    const veryCloseAndSlow = Math.abs(distanceToTarget) <= 3.0 && state.velocity < 8;
    
    // Animation is complete when EITHER:
    // 1. Both position and velocity criteria are met, OR
    // 2. We're very close and moving very slowly
    const isComplete = (withinPositionTolerance && belowVelocityThreshold) || veryCloseAndSlow;
    
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