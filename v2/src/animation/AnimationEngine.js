/**
 * Central Animation Engine for The Finals Loadout Randomizer
 * Manages RAF loop and all slot machine animations
 */

import { SLOT_PHYSICS, SLOT_TIMING } from '../core/Constants.js';

// SlotColumn class - handles individual column animations
export class SlotColumn {
  constructor(element, index, isFinalSpin) {
    this.element = element;
    this.index = index;
    this.velocity = 0;
    this.position = 0;
    this.state = "waiting";
    this.lastTimestamp = null;
    this.isFinalSpin = isFinalSpin;
    this.animationStartTime = null;
    this.maxAnimationDuration = SLOT_TIMING.ANIMATION_SAFETY_TIMEOUT;
    this.overshootAmount = 0;
    this.snapbackComplete = false;

    const timing = isFinalSpin
      ? SLOT_PHYSICS.TIMING.FINAL_SPIN
      : SLOT_PHYSICS.TIMING.REGULAR_SPIN;

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
        deltaTime = SLOT_TIMING.FRAME_DURATION;
      }

      // Ensure deltaTime is reasonable
      const dt = Math.min(deltaTime, 50) / 1000; // Cap at 50ms, convert to seconds

      // Vegas-style physics with distinct phases
      const accelerationPhase = 500; // 0-500ms
      const maxSpeedPhase = this.totalDuration - this.decelerationTime - 200; // Account for overshoot

      switch (this.state) {
        case "accelerating":
          // Exponential acceleration for dramatic start
          const accelProgress = Math.min(elapsed / accelerationPhase, 1);
          const accelMultiplier = 1 + Math.pow(accelProgress, 2) * 2; // Up to 3x acceleration

          this.velocity += SLOT_PHYSICS.ACCELERATION * dt * accelMultiplier;

          if (
            elapsed >= accelerationPhase ||
            this.velocity >= SLOT_PHYSICS.MAX_VELOCITY
          ) {
            this.velocity = SLOT_PHYSICS.MAX_VELOCITY;
            this.state = "spinning";
          }
          break;

        case "spinning":
          // Maintain max velocity with slight variations for realism
          this.velocity = SLOT_PHYSICS.MAX_VELOCITY + Math.sin(elapsed / 100) * 200;

          if (elapsed >= maxSpeedPhase) {
            this.state = "decelerating";
            // Calculate target position with overshoot
            const baseTarget =
              Math.ceil(this.position / SLOT_PHYSICS.ITEM_HEIGHT) *
              SLOT_PHYSICS.ITEM_HEIGHT;
            this.overshootAmount = SLOT_PHYSICS.ITEM_HEIGHT * 0.3; // 30% overshoot
            this.targetPosition = baseTarget;

            // For gadget columns, use normal positioning
            if (this.index >= 2) {
              this.targetPosition = 0;
              this.overshootAmount = SLOT_PHYSICS.ITEM_HEIGHT * 0.2;
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
            this.velocity = -Math.abs(this.velocity) * SLOT_TIMING.BOUNCE_VELOCITY_MULTIPLIER;
          } else if (this.velocity < 100) {
            this.forceStop();
          }
          break;

        case "snapback":
          // Snap back to final position
          this.velocity += SLOT_PHYSICS.ACCELERATION * dt * 0.8; // Gentler snapback

          if (
            this.position <= this.targetPosition ||
            Math.abs(this.velocity) < SLOT_TIMING.SNAP_THRESHOLD_VELOCITY
          ) {
            this.position = this.targetPosition;
            this.forceStop();
          }
          break;

        case "bouncing":
          // Legacy bounce state (kept for compatibility)
          this.velocity += SLOT_PHYSICS.DECELERATION * 1.2 * dt;
          if (Math.abs(this.velocity) < SLOT_TIMING.SNAP_THRESHOLD_VELOCITY) {
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
      }, 300);

      // Play column stop sound
      if (window.state && window.state.soundEnabled) {
        const columnStopSound = document.getElementById("columnStop");
        if (columnStopSound) {
          columnStopSound.currentTime = 0;
          columnStopSound.volume = 0.5;
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
        }, 200);
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

      const absVelocity = Math.abs(this.velocity);

      if (absVelocity > 3500) {
        blur = 8;
        containerClass = "extreme-blur";
      } else if (absVelocity > SLOT_TIMING.BLUR_THRESHOLD_VELOCITY) {
        blur = 3;
        containerClass = "high-speed-blur";
      } else if (absVelocity > 1000) {
        blur = 1;
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
      if (this.state === "snapback") {
        try {
          shakeX = Math.sin(performance.now() / 50) * 3;
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
      if (this.container && absVelocity > SLOT_TIMING.BLUR_THRESHOLD_VELOCITY) {
        try {
          const glowIntensity = 20 + absVelocity / 100;
          const glowOpacity = 0.2 + absVelocity / 10000;

          // Validate glow values
          const safeGlowIntensity = Math.max(0, Math.min(glowIntensity, 100));
          const safeGlowOpacity = Math.max(0, Math.min(glowOpacity, 1));

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

// Central Animation Engine
export class AnimationEngine {
  constructor() {
    this.columns = [];
    this.animationId = null;
    this.startTime = null;
    this.lastFrameTime = null;
    this.isRunning = false;
    this.onComplete = null;
    this.onColumnStop = null;
  }

  /**
   * Initialize slot columns for animation
   * @param {Array} columnElements - DOM elements for slot columns
   * @param {boolean} isFinalSpin - Whether this is the final spin
   * @returns {Promise} Resolves when all columns have stopped
   */
  spin(columnElements, isFinalSpin = false) {
    return new Promise((resolve, reject) => {
      try {
        // Clear any existing animation
        this.stop();

        // Initialize columns
        this.columns = columnElements.map((element, index) => 
          new SlotColumn(element, index, isFinalSpin)
        );

        // Set callbacks
        this.onComplete = resolve;
        
        // Start all columns
        this.columns.forEach(column => {
          column.state = "accelerating";
        });

        // Start animation loop
        this.isRunning = true;
        this.startTime = null;
        this.lastFrameTime = null;
        this.animate();
        
      } catch (error) {
        console.error("Animation engine spin error:", error);
        reject(error);
      }
    });
  }

  animate(timestamp) {
    if (!this.isRunning) return;

    if (!this.startTime) {
      this.startTime = timestamp;
      this.lastFrameTime = timestamp;
    }

    const elapsed = timestamp - this.startTime;
    const deltaTime = timestamp - this.lastFrameTime;
    this.lastFrameTime = timestamp;

    let allStopped = true;

    // Update all columns
    this.columns.forEach((column, index) => {
      if (column.state !== "stopped") {
        allStopped = false;
        column.update(elapsed, deltaTime);
        
        // Check if column just stopped
        if (column.state === "stopped" && this.onColumnStop) {
          this.onColumnStop(index);
        }
      }
    });

    if (allStopped) {
      this.isRunning = false;
      if (this.onComplete) {
        this.onComplete();
      }
    } else {
      this.animationId = requestAnimationFrame((t) => this.animate(t));
    }
  }

  stop() {
    this.isRunning = false;
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
    
    // Force stop all columns
    this.columns.forEach(column => {
      if (column.state !== "stopped") {
        column.forceStop();
      }
    });
  }

  /**
   * Get the current state of all columns
   * @returns {Array} Array of column states
   */
  getColumnStates() {
    return this.columns.map(col => ({
      index: col.index,
      state: col.state,
      position: col.position,
      velocity: col.velocity
    }));
  }
}

// Singleton instance
export const animationEngine = new AnimationEngine();