/**
 * AnimationEngine.js - Slot Machine Animation System
 * 
 * This module handles all animation logic for the slot machine,
 * including physics calculations, visual effects, and timing.
 */

import {
  SLOT_PHYSICS,
  SLOT_TIMING,
  ANIMATION_PHASES,
  BLUR_THRESHOLDS,
  GLOW_EFFECTS,
  SOUND_VOLUMES,
  VELOCITY_THRESHOLDS,
  SHAKE_EFFECTS,
  PARTICLE_EFFECTS,
  CELEBRATION_EFFECTS
} from '../core/Constants.js';

import {
  isMobile,
  isLowEndDevice,
  getOptimizedPhysics,
  getOptimizedVisuals,
  performanceMonitor,
  MOBILE_FRAME_SETTINGS
} from '../core/MobileOptimizations.js';

/**
 * SlotColumn class handles individual column animations
 */
class SlotColumn {
  constructor(element, index, isFinalSpin) {
    this.element = element;
    this.index = index;
    this.velocity = 0;
    this.position = 0;
    this.state = "waiting";
    this.lastTimestamp = null;
    this.isFinalSpin = isFinalSpin;
    this.animationStartTime = null;
    this.maxAnimationDuration = SLOT_TIMING.ANIMATION_SAFETY_TIMEOUT; // 10 second safety timeout
    this.overshootAmount = 0;
    this.snapbackComplete = false;

    // Use mobile-optimized physics if on mobile
    const physics = getOptimizedPhysics() || SLOT_PHYSICS;
    const timing = isFinalSpin
      ? physics.TIMING.FINAL_SPIN
      : physics.TIMING.REGULAR_SPIN;

    // Use explicit stop times for final spin columns
    if (isFinalSpin && timing.COLUMN_STOPS && timing.COLUMN_STOPS[index]) {
      this.totalDuration = timing.COLUMN_STOPS[index];
    } else {
      this.stopDelay = timing.COLUMN_DELAY * index;
      this.totalDuration = timing.BASE_DURATION + this.stopDelay;
    }

    this.decelerationTime = timing.DECELERATION_TIME;
    this.targetPosition = 0;
    this.initialPosition = 0;

    // Add reference to container for visual effects
    this.container = element.closest(".item-container");
  }

  update(elapsed, deltaTime) {
    try {
      // Safety check for runaway animations
      if (!this.animationStartTime) {
        this.animationStartTime = performance.now();
      } else if (
        performance.now() - this.animationStartTime >
        this.maxAnimationDuration
      ) {
        console.warn("Animation timeout - forcing stop");
        this.forceStop();
        return;
      }

      if (this.state === "stopped") return;

      // Validate inputs
      if (typeof elapsed !== "number" || isNaN(elapsed) || elapsed < 0) {
        console.warn("Invalid elapsed time:", elapsed);
        elapsed = 0;
      }

      if (typeof deltaTime !== "number" || isNaN(deltaTime) || deltaTime < 0) {
        console.warn("Invalid deltaTime:", deltaTime);
        deltaTime = SLOT_TIMING.FRAME_DURATION; // Default to ~60fps
      }

      // Use mobile-optimized frame settings if on mobile
      const frameSettings = isMobile() ? MOBILE_FRAME_SETTINGS : { FRAME_DURATION: SLOT_TIMING.FRAME_DURATION };
      
      // Ensure deltaTime is reasonable
      const dt = Math.min(deltaTime, VELOCITY_THRESHOLDS.DT_CAP) / 1000; // Cap at 50ms, convert to seconds
      
      // Get physics values (mobile-optimized if applicable)
      const physics = getOptimizedPhysics() || SLOT_PHYSICS;

      // Vegas-style physics with distinct phases
      const accelerationPhase = ANIMATION_PHASES.ACCELERATION_PHASE; // 0-500ms
      const maxSpeedPhase = this.totalDuration - this.decelerationTime - 200; // Account for overshoot

      switch (this.state) {
        case "accelerating":
          // Exponential acceleration for dramatic start
          const accelProgress = Math.min(elapsed / accelerationPhase, 1);
          const accelMultiplier = 1 + Math.pow(accelProgress, ANIMATION_PHASES.ACCELERATION_POWER) * (ANIMATION_PHASES.ACCELERATION_MAX_MULT - 1); // Up to 3x acceleration

          this.velocity += physics.ACCELERATION * dt * accelMultiplier;

          if (
            elapsed >= accelerationPhase ||
            this.velocity >= physics.MAX_VELOCITY
          ) {
            this.velocity = physics.MAX_VELOCITY;
            this.state = "spinning";
          }
          break;

        case "spinning":
          // Maintain max velocity with slight variations for realism
          this.velocity = physics.MAX_VELOCITY + Math.sin(elapsed / ANIMATION_PHASES.VELOCITY_VARIATION_RATE) * ANIMATION_PHASES.VELOCITY_VARIATION;

          if (elapsed >= maxSpeedPhase) {
            this.state = "decelerating";
            // Calculate target position with overshoot
            const baseTarget =
              Math.ceil(this.position / physics.ITEM_HEIGHT) *
              physics.ITEM_HEIGHT;
            this.overshootAmount = physics.ITEM_HEIGHT * ANIMATION_PHASES.OVERSHOOT_AMOUNT; // 30% overshoot
            this.targetPosition = baseTarget;

            // For gadget columns, use normal positioning
            if (this.index >= 2) {
              this.targetPosition = 0;
              this.overshootAmount = physics.ITEM_HEIGHT * ANIMATION_PHASES.OVERSHOOT_AMOUNT_GADGET;
            }
          }
          break;

        case "decelerating":
          // Smooth exponential deceleration
          const decelProgress =
            (elapsed - maxSpeedPhase) / this.decelerationTime;
          const decelMultiplier = Math.pow(1 - Math.min(decelProgress, 1), 2);

          this.velocity = SLOT_PHYSICS.MAX_VELOCITY * decelMultiplier;

          // Check if we've reached the overshoot point
          if (
            !this.snapbackComplete &&
            this.position >= this.targetPosition + this.overshootAmount
          ) {
            this.state = "snapback";
            this.velocity = -Math.abs(this.velocity) * ANIMATION_PHASES.SNAPBACK_VELOCITY_MULT; // Reverse at 50% speed
          } else if (this.velocity < VELOCITY_THRESHOLDS.STOP_VELOCITY) {
            this.forceStop();
          }
          break;

        case "snapback":
          // Snap back to final position
          this.velocity += SLOT_PHYSICS.ACCELERATION * dt * ANIMATION_PHASES.SNAPBACK_ACCELERATION; // Gentler snapback

          if (
            this.position <= this.targetPosition ||
            Math.abs(this.velocity) < VELOCITY_THRESHOLDS.MIN_VELOCITY
          ) {
            this.position = this.targetPosition;
            this.forceStop();
          }
          break;

        case "bouncing":
          // Legacy bounce state (kept for compatibility)
          this.velocity += SLOT_PHYSICS.DECELERATION * 1.2 * dt;
          if (Math.abs(this.velocity) < VELOCITY_THRESHOLDS.BOUNCE_STOP) {
            this.forceStop();
          }
          break;
      }

      // Update position with safety checks
      if (
        typeof this.velocity === "number" &&
        !isNaN(this.velocity) &&
        typeof this.position === "number" &&
        !isNaN(this.position)
      ) {
        this.position += this.velocity * dt;
      } else {
        console.warn(
          "Invalid velocity or position values:",
          this.velocity,
          this.position
        );
        // Reset to safe values
        this.velocity = 0;
        this.position = 0;
      }

      // Don't normalize position for gadget columns when targeting position 0
      if (
        this.index >= 2 &&
        this.targetPosition === 0 &&
        this.state === "stopped"
      ) {
        // Keep exact position for gadgets
      } else if (this.state !== "snapback") {
        try {
          this.position = this.normalizePosition(this.position);
        } catch (normalizeError) {
          console.warn("Position normalization error:", normalizeError);
          this.position = 0; // Safe fallback
        }
      }

      // Update visuals with error handling
      try {
        this.updateVisuals();
      } catch (visualError) {
        console.warn("Update visuals error:", visualError);
        // Continue without visuals if they fail
      }
    } catch (updateError) {
      console.error("SlotColumn update error:", updateError);
      // Force stop on critical error to prevent further crashes
      try {
        this.forceStop();
      } catch (stopError) {
        console.error("Force stop error:", stopError);
        // Emergency state reset
        this.state = "stopped";
        this.velocity = 0;
      }
    }
  }

  normalizePosition(pos) {
    const wrappedPosition = pos % SLOT_PHYSICS.ITEM_HEIGHT;
    return wrappedPosition >= 0
      ? wrappedPosition
      : wrappedPosition + SLOT_PHYSICS.ITEM_HEIGHT;
  }

  forceStop() {
    this.velocity = 0;
    this.position = this.targetPosition;
    this.state = "stopped";

    // Remove blur classes
    if (this.container) {
      this.container.classList.remove("high-speed-blur", "extreme-blur");

      // Add lock-in animation
      this.container.classList.add("locked", "locking");

      // Flash effect
      setTimeout(() => {
        this.container.classList.remove("locking");
      }, SLOT_TIMING.LOCK_IN_DELAY);

      // Play column stop sound
      if (window.state && window.state.soundEnabled) {
        const columnStopSound = document.getElementById("columnStop");
        if (columnStopSound) {
          columnStopSound.currentTime = 0;
          columnStopSound.volume = SOUND_VOLUMES.COLUMN_STOP;
          columnStopSound.play().catch(() => {});
        }
      }

      // Add screen shake for dramatic effect (only on final spin)
      if (this.isFinalSpin && this.index === 0) {
        document
          .querySelector(".items-container")
          ?.classList.add("screen-shake");
        setTimeout(() => {
          document
            .querySelector(".items-container")
            ?.classList.remove("screen-shake");
        }, SLOT_TIMING.SCREEN_SHAKE_DURATION);
      }
    }

    this.updateVisuals();

    // Reset box shadow
    if (this.container) {
      this.container.style.boxShadow = "";
    }
  }

  updateVisuals() {
    try {
      // Validate velocity before calculations
      if (typeof this.velocity !== "number" || isNaN(this.velocity)) {
        console.warn("Invalid velocity in updateVisuals:", this.velocity);
        this.velocity = 0;
      }

      if (typeof this.position !== "number" || isNaN(this.position)) {
        console.warn("Invalid position in updateVisuals:", this.position);
        this.position = 0;
      }

      // Vegas-style blur effects based on velocity
      let blur = 0;
      let containerClass = "";
      
      // Get visual settings (mobile-optimized if applicable)
      const visualSettings = getOptimizedVisuals();
      const blurEnabled = !visualSettings || visualSettings.BLUR_ENABLED;

      if (blurEnabled) {
        const absVelocity = Math.abs(this.velocity);
        const maxBlur = visualSettings ? visualSettings.MAX_BLUR : BLUR_THRESHOLDS.EXTREME_BLUR;

        if (absVelocity > BLUR_THRESHOLDS.EXTREME_VELOCITY) {
          blur = Math.min(BLUR_THRESHOLDS.EXTREME_BLUR, maxBlur);
          containerClass = "extreme-blur";
        } else if (absVelocity > BLUR_THRESHOLDS.HIGH_VELOCITY) {
          blur = Math.min(BLUR_THRESHOLDS.HIGH_BLUR, maxBlur);
          containerClass = "high-speed-blur";
        } else if (absVelocity > BLUR_THRESHOLDS.MEDIUM_VELOCITY) {
          blur = Math.min(BLUR_THRESHOLDS.MEDIUM_BLUR, maxBlur);
        }
      }

      // Add/remove blur classes on container with error handling
      if (this.container) {
        try {
          this.container.classList.remove("high-speed-blur", "extreme-blur");
          if (containerClass) {
            this.container.classList.add(containerClass);
          }
        } catch (classError) {
          console.warn("Class manipulation error:", classError);
        }
      }

      // Shake effect during snapback
      let shakeX = 0;
      const shakeEnabled = !visualSettings || visualSettings.SCREEN_SHAKE_ENABLED;
      
      if (this.state === "snapback" && shakeEnabled) {
        try {
          const shakeIntensity = visualSettings ? visualSettings.SCREEN_SHAKE_INTENSITY : 1;
          shakeX = Math.sin(performance.now() / SHAKE_EFFECTS.SNAPBACK_SHAKE_RATE) * SHAKE_EFFECTS.SNAPBACK_SHAKE_AMOUNT * shakeIntensity;
          // Validate shakeX
          if (isNaN(shakeX)) {
            shakeX = 0;
          }
        } catch (shakeError) {
          console.warn("Shake calculation error:", shakeError);
          shakeX = 0;
        }
      }

      // Apply transform and filter with error handling
      if (this.element) {
        try {
          this.element.style.transform = `translate(${shakeX}px, ${this.position}px)`;
          this.element.style.filter = blur > 0 ? `blur(${blur}px)` : "none";
        } catch (styleError) {
          console.warn("Style application error:", styleError);
          // Try basic fallback
          try {
            this.element.style.transform = `translateY(${this.position}px)`;
            this.element.style.filter = "none";
          } catch (fallbackError) {
            console.warn("Fallback style error:", fallbackError);
          }
        }
      }

      // Add slot glow effect at high speeds with error handling
      if (this.container && absVelocity > BLUR_THRESHOLDS.HIGH_VELOCITY) {
        try {
          const glowIntensity = GLOW_EFFECTS.BASE_INTENSITY + absVelocity / GLOW_EFFECTS.INTENSITY_DIVISOR;
          const glowOpacity = GLOW_EFFECTS.BASE_OPACITY + absVelocity / GLOW_EFFECTS.OPACITY_DIVISOR;

          // Validate glow values
          const safeGlowIntensity = Math.max(0, Math.min(glowIntensity, GLOW_EFFECTS.MAX_INTENSITY));
          const safeGlowOpacity = Math.max(0, Math.min(glowOpacity, GLOW_EFFECTS.MAX_OPACITY));

          this.container.style.boxShadow = `
            inset 0 10px 30px rgba(0,0,0,0.8),
            0 0 ${safeGlowIntensity}px rgba(255, 215, 0, ${safeGlowOpacity})
          `;
        } catch (glowError) {
          console.warn("Glow effect error:", glowError);
          // Remove potentially broken box shadow
          try {
            this.container.style.boxShadow = "";
          } catch (shadowError) {
            console.warn("Shadow reset error:", shadowError);
          }
        }
      }
    } catch (visualsError) {
      console.error("UpdateVisuals critical error:", visualsError);
      // Emergency cleanup - remove all effects
      try {
        if (this.element) {
          this.element.style.transform = "";
          this.element.style.filter = "";
        }
        if (this.container) {
          this.container.classList.remove("high-speed-blur", "extreme-blur");
          this.container.style.boxShadow = "";
        }
      } catch (cleanupError) {
        console.error("Emergency cleanup error:", cleanupError);
      }
    }
  }
}

/**
 * Main animation function that orchestrates the slot spin
 */
export function startSlotAnimation(columns, options = {}) {
  const {
    isFinalSpin = false,
    onComplete = () => {},
    soundEnabled = true
  } = options;

  return new Promise((resolve, reject) => {
    // Safety check for columns array
    if (!columns || !Array.isArray(columns) || columns.length === 0) {
      console.error(
        "❌ CRASH PREVENTION: Invalid columns passed to startSlotAnimation"
      );
      reject(new Error("Invalid columns array"));
      return;
    }

    console.log(
      `🎲 Animation starting with isFinalSpin = ${isFinalSpin}`
    );

    // Play spin start sound
    if (soundEnabled) {
      const spinStartSound = document.getElementById("spinStart");
      if (spinStartSound) {
        spinStartSound.currentTime = 0;
        spinStartSound.volume = SOUND_VOLUMES.SPIN_START;
        spinStartSound.play().catch(() => {});
      }
    }

    // Play spinning sound
    if (soundEnabled) {
      const spinningSound = document.getElementById("spinningSound");
      if (spinningSound) {
        spinningSound.currentTime = 0;
        spinningSound.volume = SOUND_VOLUMES.SPINNING; // Reduced by 50%
        spinningSound.play().catch(() => {});
      }
    }

    const startTime = performance.now();

    const slotColumns = columns
      .map((element, index) => {
        if (!element) {
          console.error(`❌ CRASH PREVENTION: Column ${index} is null/undefined`);
          return null;
        }
        return new SlotColumn(element, index, isFinalSpin);
      })
      .filter((col) => col !== null);

    if (slotColumns.length === 0) {
      console.error("❌ CRASH PREVENTION: No valid slot columns created");
      reject(new Error("No valid slot columns"));
      return;
    }

    // Reset containers but keep current positions (or set initial random position for first spin)
    const isFirstSpin = !columns[0].style.transform || columns[0].style.transform === 'none' || columns[0].style.transform === '';
    
    columns.forEach((column, index) => {
      if (!column) {
        console.error(
          `❌ CRASH PREVENTION: Column ${index} is null during reset`
        );
        return;
      }

      try {
        const container = column.closest(".item-container");
        if (container) {
          container.classList.remove("landing-flash", "winner-pulsate");
          const lockedTag = container.querySelector(".locked-tag");
          if (lockedTag) lockedTag.remove();
        }
        
        // For the very first spin, set a random position to hide winners
        if (isFirstSpin) {
          const itemHeight = SLOT_PHYSICS.ITEM_HEIGHT;
          let randomOffset;
          
          if (index >= 2) {
            // Gadget column - avoid showing winner at index 0
            randomOffset = Math.floor(Math.random() * 4 + 2) * itemHeight;
          } else {
            // Weapon/spec column - avoid showing winner at index 4
            const showTopHalf = Math.random() < 0.5;
            if (showTopHalf) {
              randomOffset = Math.floor(Math.random() * 4) * itemHeight;
            } else {
              randomOffset = Math.floor(Math.random() * 3 + 5) * itemHeight;
            }
          }
          
          column.style.transform = `translateY(-${randomOffset}px)`;
        }
        
        // Reset transition to prepare for animation
        column.style.transition = "none";
      } catch (error) {
        console.error(
          `❌ CRASH PREVENTION: Error resetting column ${index}:`,
          error
        );
      }
    });

    // Initialize animation states and get current positions
    slotColumns.forEach((column, idx) => {
      column.state = "accelerating";
      column.velocity = 0;
      
      // Get the current position from the transform
      const transformMatch = columns[idx].style.transform.match(/translateY\((-?\d+(?:\.\d+)?)px\)/);
      const currentOffset = transformMatch ? parseFloat(transformMatch[1]) : 0;
      
      // Set initial position to match current visual position
      column.position = -currentOffset; // Negative because translateY is negative
      column.initialPosition = column.position;
      column.lastTimestamp = null;
    });

    function animate(currentTime) {
      try {
        // Safety timeout to prevent infinite animations
        const elapsed = currentTime - startTime;
        if (elapsed > SLOT_TIMING.ANIMATION_TOTAL_TIMEOUT) {
          // 15 second timeout
          console.warn("⚠️ Slot machine animation safety timeout triggered");
          // Force stop all columns
          slotColumns.forEach((column) => {
            try {
              if (column && typeof column.forceStop === "function") {
                column.forceStop();
              }
            } catch (stopError) {
              console.warn("Column force stop error:", stopError);
            }
          });
          // Stop spinning sound
          try {
            const spinningSound = document.getElementById("spinningSound");
            if (spinningSound) {
              spinningSound.pause();
              spinningSound.currentTime = 0;
            }
          } catch (soundError) {
            console.warn("Sound stop error:", soundError);
          }
          // Complete animation
          onComplete();
          resolve();
          return;
        }

        let isAnimating = false;

        slotColumns.forEach((column, index) => {
          try {
            if (column && column.state !== "stopped") {
              isAnimating = true;
              const deltaTime = column.lastTimestamp
                ? currentTime - column.lastTimestamp
                : 16.67;

              // Validate deltaTime is reasonable
              const safeDeltaTime = Math.max(0, Math.min(deltaTime, 100));

              if (typeof column.update === "function") {
                column.update(elapsed, safeDeltaTime);
              } else {
                console.warn(`Column ${index} missing update method`);
                // Force stop this broken column
                if (column) {
                  column.state = "stopped";
                }
              }
              column.lastTimestamp = currentTime;
            }
          } catch (columnError) {
            console.error(`Error updating column ${index}:`, columnError);
            // Force stop the problematic column to prevent further crashes
            try {
              if (column) {
                column.state = "stopped";
                if (typeof column.forceStop === "function") {
                  column.forceStop();
                }
              }
            } catch (stopError) {
              console.warn(`Failed to stop column ${index}:`, stopError);
            }
          }
        });

        // Update performance monitor on mobile
        if (isMobile()) {
          performanceMonitor.update();
        }

        if (isAnimating) {
          try {
            requestAnimationFrame(animate);
          } catch (rafError) {
            console.error("RequestAnimationFrame error:", rafError);
            // Fallback: use setTimeout
            setTimeout(() => {
              try {
                animate(performance.now());
              } catch (fallbackError) {
                console.error("Fallback animation error:", fallbackError);
                // Force completion
                onComplete();
                resolve();
              }
            }, 16);
          }
        } else {
          console.log("✅ All columns stopped, animation complete");

          try {
            // Stop spinning sound with mobile fix
            const spinningSound = document.getElementById("spinningSound");
            if (spinningSound) {
              spinningSound.pause();
              spinningSound.currentTime = 0;
              // Additional stop mechanism for mobile browsers
              try {
                spinningSound.src = spinningSound.src; // Force reload on mobile
              } catch (e) {
                console.log("Mobile audio reload failed:", e);
              }
            }

            // Add visual effects only for final spin
            if (isFinalSpin) {
              let lastColumnIndex = columns.length - 1;

              columns.forEach((column, index) => {
                try {
                  const container = column
                    ? column.closest(".item-container")
                    : null;
                  if (container) {
                    setTimeout(() => {
                      try {
                        container.classList.add("landing-flash");

                        // If this is the last column, add celebration effects
                        if (index === lastColumnIndex) {
                          console.log(
                            "🔒 Last locked tag added, disabling spin buttons"
                          );
                          try {
                            const spinBtns =
                              document.querySelectorAll(".spin-button");
                            spinBtns.forEach((button) => {
                              try {
                                button.disabled = true;
                                button.setAttribute("disabled", "disabled");
                                button.classList.add("dimmed");
                              } catch (btnError) {
                                console.warn("Button disable error:", btnError);
                              }
                            });
                            console.log(
                              `Disabled ${spinBtns.length} spin buttons`
                            );
                          } catch (buttonError) {
                            console.warn("Button handling error:", buttonError);
                          }
                        }

                        setTimeout(() => {
                          try {
                            container.classList.add("winner-pulsate");

                            // Add dramatic screen shake on the last column
                            if (index === lastColumnIndex) {
                              try {
                                addScreenShake();
                                createLockInParticleExplosion(container);
                              } catch (effectError) {
                                console.warn("Screen effect error:", effectError);
                              }
                            }
                          } catch (pulsateError) {
                            console.warn("Pulsate effect error:", pulsateError);
                          }
                        }, SLOT_TIMING.LANDING_FLASH_DELAY);
                      } catch (timeoutError) {
                        console.error(
                          `Timeout callback error for column ${index}:`,
                          timeoutError
                        );
                      }
                    }, index * SLOT_TIMING.COLUMN_STOP_DELAY);
                  }
                } catch (columnEffectError) {
                  console.error(
                    `Column effect error for index ${index}:`,
                    columnEffectError
                  );
                }
              });
            }

            // Complete animation after delay
            setTimeout(
              () => {
                try {
                  onComplete();
                  resolve();
                } catch (completeError) {
                  console.error("Complete callback error:", completeError);
                  resolve(); // Still resolve promise
                }
              },
              isFinalSpin ? SLOT_TIMING.FINALIZE_DELAY_FINAL : SLOT_TIMING.FINALIZE_DELAY_REGULAR
            );
          } catch (completionError) {
            console.error("Animation completion error:", completionError);
            // Force completion with minimal functionality
            setTimeout(() => {
              onComplete();
              resolve();
            }, 1000);
          }
        }
      } catch (animateError) {
        console.error("Critical animation error:", animateError);
        // Emergency shutdown
        try {
          const spinningSound = document.getElementById("spinningSound");
          if (spinningSound) {
            spinningSound.pause();
            spinningSound.currentTime = 0;
          }
          // Complete animation
          setTimeout(() => {
            onComplete();
            resolve();
          }, 100);
        } catch (emergencyError) {
          console.error("Emergency shutdown error:", emergencyError);
          resolve(); // Still resolve to prevent hanging
        }
      }
    }

    requestAnimationFrame(animate);
  });
}

/**
 * Screen shake effect for dramatic lock-in
 */
export function addScreenShake() {
  const body = document.body;
  body.classList.add("screen-shake");

  setTimeout(() => {
    body.classList.remove("screen-shake");
  }, CELEBRATION_EFFECTS.SCREEN_SHAKE_DURATION);
}

/**
 * Particle explosion when cards lock in
 */
export function createLockInParticleExplosion(container) {
  const rect = container.getBoundingClientRect();
  const centerX = rect.left + rect.width / 2;
  const centerY = rect.top + rect.height / 2;

  // Get visual settings for mobile optimization
  const visualSettings = getOptimizedVisuals();
  const particleMultiplier = visualSettings ? visualSettings.PARTICLE_COUNT_MULTIPLIER : 1;
  
  // Reduce particles on mobile
  const waveCount = Math.ceil(PARTICLE_EFFECTS.WAVE_COUNT * particleMultiplier);
  const particlesPerWave = Math.ceil(PARTICLE_EFFECTS.PARTICLES_PER_WAVE * particleMultiplier);

  // Create multiple waves of particles
  for (let wave = 0; wave < waveCount; wave++) {
    setTimeout(() => {
      for (let i = 0; i < particlesPerWave; i++) {
        const particle = document.createElement("div");
        particle.className = "lock-in-particle";

        const angle = (360 / PARTICLE_EFFECTS.PARTICLES_PER_WAVE) * i;
        const velocity = PARTICLE_EFFECTS.BASE_VELOCITY + wave * PARTICLE_EFFECTS.VELOCITY_INCREMENT;
        const size = Math.random() * PARTICLE_EFFECTS.SIZE_RANGE + PARTICLE_EFFECTS.MIN_SIZE;

        particle.style.cssText = `
          position: fixed;
          width: ${size}px;
          height: ${size}px;
          background: linear-gradient(45deg, #ffff00, #ffd700, #ff8c00);
          border-radius: 50%;
          pointer-events: none;
          z-index: 10000;
          left: ${centerX}px;
          top: ${centerY}px;
          box-shadow: 0 0 10px rgba(255, 215, 0, 0.8);
        `;

        document.body.appendChild(particle);

        // Animate particle
        const radians = (angle * Math.PI) / 180;
        const endX = centerX + Math.cos(radians) * velocity;
        const endY = centerY + Math.sin(radians) * velocity;

        particle.animate(
          [
            {
              transform: "translate(0, 0) scale(1)",
              opacity: 1,
            },
            {
              transform: `translate(${endX - centerX}px, ${
                endY - centerY
              }px) scale(0)`,
              opacity: 0,
            },
          ],
          {
            duration: PARTICLE_EFFECTS.BASE_DURATION + wave * PARTICLE_EFFECTS.DURATION_INCREMENT,
            easing: "ease-out",
          }
        ).onfinish = () => {
          if (particle.parentNode) {
            particle.parentNode.removeChild(particle);
          }
        };
      }
    }, wave * PARTICLE_EFFECTS.WAVE_DELAY);
  }
}

/**
 * Animate counter to new value
 */
export function animateCounterTo(element, targetValue) {
  const currentValue = parseInt(element.textContent.replace(/,/g, "")) || 0;
  const increment = Math.ceil((targetValue - currentValue) / 30);
  let current = currentValue;

  const timer = setInterval(() => {
    current += increment;
    if (current >= targetValue) {
      current = targetValue;
      clearInterval(timer);
    }
    element.textContent = current.toLocaleString();
  }, 50);
}