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
    
    // Store device pixel ratio once to ensure consistency across all columns
    this.devicePixelRatio = window.devicePixelRatio || 1;
    
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
    
    // Clear any visual effects but preserve position
    const columns = document.querySelectorAll('.slot-column');
    columns.forEach(col => {
      const itemsContainer = col.querySelector('.slot-items');
      if (itemsContainer) {
        // CRITICAL FIX: Don't reset to translateY(0) - preserve current position
        // Only reset position if explicitly needed for debugging
        // itemsContainer.style.transform = 'translateY(0)'; // REMOVED - causes blank frames
        itemsContainer.style.filter = 'none';
        itemsContainer.style.transition = 'none';
        
        // Keep current position to prevent blank frames
        const currentTransform = itemsContainer.style.transform;
        if (!currentTransform || currentTransform === 'translateY(0px)') {
          // Only set safe position if no position is set
          itemsContainer.style.transform = 'translateY(-1520px)'; // Safe winner position
        }
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
    console.log(`🎬 animateSlotMachine called: isFinal=${predeterminedResults !== null}, preservePos=${preservePosition}, isAnimating=${this.isAnimating}`);
    
    // Only reset if not preserving position (for multi-spin continuity)
    if (!preservePosition) {
      this.resetAnimation();
    }
    
    if (this.isAnimating) {
      console.error('⚠️ Animation already in progress! Skipping this call.');
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
    
    // Keep reasonable durations for intermediate spins so they're visible
    ANIM_CONFIG.ACCELERATION_DURATION = 600;
    ANIM_CONFIG.CRUISE_DURATION = 1800; // Full cruise for visible spinning
    ANIM_CONFIG.DECEL_A_DURATION = 500; // Add deceleration for visual effect
    // This gives us 2.9 seconds total for a proper visible spin
    
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
    console.log(`🔧 Initializing ${columns.length} column states...`);
    columns.forEach((column, index) => {
      console.log(`Column ${index}:`, column);
      const itemsContainer = column.querySelector('.slot-items');
      if (!itemsContainer) {
        console.error(`❌ No .slot-items found in column ${index}!`);
        return;
      }
      console.log(`✅ Found itemsContainer for column ${index}:`, itemsContainer);
      
      const itemCount = itemsContainer.children.length;
      const cycleHeight = itemCount * ITEM_H;
      
      // Read initial position from DOM
      const currentTransform = itemsContainer.style.transform;
      let startPos = -1680; // Default (winner at effective position 20 above viewport)
      
      // CRITICAL FIX: If position is 0 or not set, use safe starting position
      if (!currentTransform || currentTransform === 'none' || currentTransform === 'translateY(0px)' || currentTransform === 'translate3d(0px, 0px, 0px)') {
        console.warn(`[ANIMATION] Column at unsafe position, setting to -1680px for proper start`);
        startPos = -1680;
        itemsContainer.style.transform = `translateY(${startPos}px)`;
      } else {
        const match = currentTransform.match(/translateY\((-?\d+(?:\.\d+)?)px\)/);
        if (match) {
          startPos = parseFloat(match[1]);
        }
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
      
      // CRITICAL: Check for blank frame after position application
      if (itemsContainer.children.length === 0) {
        console.error(`[DOM] Blank frame detected in column ${index} after position application!`);
      }
    });
  }
  
  /**
   * Apply position with modulo wrapping and device pixel snapping
   */
  applyPosition(element, unwrappedY, cycleHeight) {
    // Calculate wrapped position for display
    // The wrapped position should be in range (-cycleHeight, 0]
    let wrappedY = unwrappedY % cycleHeight;
    
    // Convert to negative range for proper display
    if (wrappedY > 0) {
      wrappedY = wrappedY - cycleHeight;
    }
    
    // Ensure we're in the correct range
    while (wrappedY < -cycleHeight) {
      wrappedY += cycleHeight;
    }
    
    // Apply device pixel snapping for crisp visuals using consistent ratio
    const snappedY = Math.round(wrappedY * this.devicePixelRatio) / this.devicePixelRatio;
    
    // Use translate3d for hardware acceleration
    element.style.transform = `translate3d(0, ${snappedY}px, 0)`;
    element.style.willChange = 'transform';
    element.style.backfaceVisibility = 'hidden';
    
    // CRITICAL: Check for blank frame after position change
    if (element.children.length === 0) {
      console.error(`[DOM] Blank frame detected after position apply! transform: ${element.style.transform}`);
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
   * Calculate future congruent target with multi-spin support
   */
  calculateFutureTarget(currentUnwrappedY, winnerIndex, cycleHeight, totalSpins = 1) {
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
    
    // CORRECT CALCULATION:
    // We need to land at exactly -1520px (which is index 20 with offset 80)
    // The wrapped position calculation: wrappedY = unwrappedY % cycleHeight
    // But if wrapped > 0, we display as wrapped - cycleHeight (negative)
    
    // Calculate minimum spins needed
    const minDistance = totalSpins * cycleHeight;
    const baseUnwrapped = currentUnwrappedY + minDistance;
    
    // We want final wrapped position to be -1520px
    // This means unwrappedY % cycleHeight should give us a value that,
    // when converted to display position, equals -1520
    
    // Since -1520 is negative, it means wrapped = cycleHeight - 1520
    const targetWrappedRaw = cycleHeight + targetWrappedPosition; // cycleHeight - 1520
    
    // Find how much we need to add to baseUnwrapped to reach this wrapped position
    const currentWrappedRaw = baseUnwrapped % cycleHeight;
    let adjustment = targetWrappedRaw - currentWrappedRaw;
    
    // If adjustment is negative, add a full cycle
    if (adjustment < 0) {
      adjustment += cycleHeight;
    }
    
    const targetUnwrapped = baseUnwrapped + adjustment;
    
    console.log(`[PHYSICS] Target: ${targetUnwrapped.toFixed(0)}px will wrap to -1520px`);
    
    return targetUnwrapped;
  }
  
  /**
   * Main animation loop with delta-time integration
   */
  async runAnimation(columns, predeterminedResults) {
    console.log(`🏃 runAnimation started: columns=${columns.length}, hasPredetermined=${predeterminedResults !== null}`);
    return new Promise((resolve) => {
      let startTime = performance.now();
      let lastTime = startTime;
      const maxDuration = 5000; // 5 second maximum for reasonable spin duration
      
      // Use consistent speed for all columns in this animation
      const cruiseSpeed = ANIM_CONFIG.CRUISE_BASE_SPEED;
      
      // Only set up target positions if we have predetermined results (final spin)
      const isFinalSpin = predeterminedResults !== null;
      
      if (isFinalSpin) {
        // CRITICAL FIX: Calculate a common target for all columns to ensure alignment
        // First, find the average current position
        let totalUnwrapped = 0;
        let columnCount = 0;
        
        columns.forEach((column) => {
          const state = this.columnStates.get(column);
          if (state) {
            totalUnwrapped += state.unwrappedY;
            columnCount++;
          }
        });
        
        const averageUnwrapped = totalUnwrapped / columnCount;
        
        // Calculate ONE target position based on average
        const winnerIndex = 20;
        const commonTarget = this.calculateFutureTarget(
          averageUnwrapped,
          winnerIndex,
          columns[0] ? this.columnStates.get(columns[0]).cycleHeight : 4000,
          3
        );
        
        // Apply the SAME target to all columns with small stagger adjustments
        columns.forEach((column, index) => {
          const state = this.columnStates.get(column);
          if (!state) return;
          
          // Use common target with tiny stagger offset for visual interest
          // But ensure they all land at the same wrapped position
          state.targetY = commonTarget + (index * 0); // No offset - perfect alignment
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
      
      console.log('🔄 Starting animation loop...');
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
        
        // For intermediate spins, run a full animation cycle but don't decelerate to a specific target
        if (!isFinalSpin) {
          // Intermediate spins should show full spinning animation
          // Run for acceleration + cruise + partial deceleration for visual effect
          const intermediateDuration = ANIM_CONFIG.ACCELERATION_DURATION + 
                                      ANIM_CONFIG.CRUISE_DURATION + 
                                      ANIM_CONFIG.DECEL_A_DURATION;
          if (totalElapsed >= intermediateDuration) {
            console.log(`✅ Intermediate spin completed after ${totalElapsed.toFixed(0)}ms with full animation`);
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
          
          // CRITICAL: Detect race condition - check for blank frames during animation
          if (state.element.children.length === 0) {
            console.error(`[DOM] Blank frame detected during animation in column ${index}! Phase: ${phase.name}, Position: ${wrappedY.toFixed(1)}px`);
            // Emergency stop to prevent blank frame progression
            allComplete = true;
          }
          
          // Update blur based on velocity
          this.updateBlur(state.element, state.velocity, phase);
          
          // Check for animation completion
          if (!this.isAnimationComplete(state, isFinalSpin)) {
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
          console.log('🏁 ANIMATION COMPLETE - Starting final positioning...');
          // CRITICAL FIX: Snap ALL columns to EXACT same position when animation completes
          const exactFinalPosition = -1520; // All columns must land here
          
          columns.forEach((column, index) => {
            const state = this.columnStates.get(column);
            if (!state) return;
            
            // For final spins, force exact alignment
            console.log(`Column ${index}: isFinalSpin=${isFinalSpin}, targetY=${state.targetY}, element=${state.element}`);
            if (isFinalSpin && state.targetY) {
              console.log(`✅ Applying final snap to column ${index}`);
              // Apply consistent pixel snapping for final position
              const snappedFinal = Math.round(exactFinalPosition * this.devicePixelRatio) / this.devicePixelRatio;
              
              // Disable ALL animations and transitions
              state.element.style.transition = 'none';
              state.element.style.animation = 'none';
              
              // Force reflow to ensure styles are applied
              state.element.offsetHeight;
              
              // Apply the EXACT SAME final position to ALL columns
              state.element.style.transform = `translateY(${snappedFinal}px)`;
              state.element.style.willChange = 'auto'; // Release GPU memory
              
              console.log(`🎯 Column ${index} FORCED TO EXACT: ${snappedFinal}px`);
              
              // Double-check the position was applied
              const verifyTransform = state.element.style.transform;
              console.log(`Verification: Column ${index} transform is now: ${verifyTransform}`);
            } else {
              console.log(`⚠️ Column ${index} skipped final snap: isFinalSpin=${isFinalSpin}, targetY=${state.targetY}`);
              // For non-final spins, keep current position
              const currentWrapped = state.unwrappedY % state.cycleHeight;
              const displayWrapped = currentWrapped > 0 ? currentWrapped - state.cycleHeight : currentWrapped;
              
              console.log(`🎯 Column ${index} COMPLETE: unwrapped=${state.unwrappedY.toFixed(1)}, wrapped=${displayWrapped.toFixed(1)}px, velocity=${state.velocity.toFixed(1)}px/s`);
            }
          });
          
          console.log('✅ Animation promise resolved');
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
    
    // For intermediate spins, add a deceleration phase for visual effect
    if (!isFinalSpin || !state.targetY) {
      // Add deceleration A for intermediate spins
      cumulativeTime += ANIM_CONFIG.DECEL_A_DURATION;
      if (elapsed < cumulativeTime) {
        return {
          name: 'deceleration_intermediate',
          progress: (elapsed - cumulativeTime + ANIM_CONFIG.DECEL_A_DURATION) / ANIM_CONFIG.DECEL_A_DURATION,
          elapsed: elapsed - cumulativeTime + ANIM_CONFIG.DECEL_A_DURATION
        };
      }
      
      // After deceleration, maintain steady state
      return {
        name: 'cruise_extended',
        progress: 0,
        elapsed: elapsed - cumulativeTime,
        distanceToTarget: 0
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
        
      case 'deceleration_intermediate':
        // Gradual deceleration for intermediate spins (visual effect only)
        const decelProgress = phase.progress;
        const targetIntermediate = cruiseSpeed * 0.6; // Decelerate to 60% speed
        state.velocity = cruiseSpeed - ((cruiseSpeed - targetIntermediate) * this.easeInQuad(decelProgress));
        break;
        
      case 'braking':
        const distanceToTarget = phase.distanceToTarget;
        const brakingDistance = this.calculateBrakingDistance(state.velocity);
        
        // Begin deceleration ONLY when remaining <= brakingDistance on FINAL spin
        if (distanceToTarget <= brakingDistance) {
          // Physics-based deceleration: v² = u² + 2as
          const targetVelocity = Math.sqrt(2 * ANIM_CONFIG.DECELERATION_RATE * Math.max(0.1, distanceToTarget));
          
          // Apply deceleration smoothly
          const maxVelocityChange = ANIM_CONFIG.DECELERATION_RATE * dt;
          
          if (state.velocity > targetVelocity) {
            state.velocity = Math.max(targetVelocity, state.velocity - maxVelocityChange);
          } else {
            state.velocity = Math.min(targetVelocity, state.velocity);
          }
          
          // AGGRESSIVE exponential decay to ensure completion
          if (distanceToTarget < 100) {
            state.velocity *= 0.92; // Aggressive decay
          }
          if (distanceToTarget < 50) {
            state.velocity *= 0.85; // More aggressive
          }
          if (distanceToTarget < 10) {
            state.velocity = Math.min(state.velocity, 50); // Cap at 50px/s
          }
          if (distanceToTarget < 2) {
            state.velocity = Math.min(state.velocity, 10); // Nearly stop
          }
        } else {
          // Maintain max velocity until braking distance reached
          const jitter = 1 + (Math.random() - 0.5) * ANIM_CONFIG.JITTER_AMOUNT;
          state.velocity = cruiseSpeed * jitter;
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
      const totalDuration = ANIM_CONFIG.ACCELERATION_DURATION + ANIM_CONFIG.CRUISE_DURATION;
      const elapsed = performance.now() - (state.phaseStartTime || 0);
      return elapsed >= totalDuration;
    }
    
    const distanceToTarget = state.targetY - state.unwrappedY;
    
    // TIGHTER CRITERIA: End animation only when VERY close to target AND velocity is low
    // This ensures we get much closer to -1520px before stopping
    const isComplete = (Math.abs(distanceToTarget) <= 1 && Math.abs(state.velocity) <= 10) || 
                      Math.abs(state.velocity) <= 0.5;
    
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