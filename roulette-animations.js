// Roulette Animation System
class RouletteAnimationSystem {
  constructor() {
    this.classOptions = ["Light", "Medium", "Heavy"];
    this.spinOptions = [1, 2, 3, 4, 5];
    this.selectedClass = null;
    this.selectedSpins = null;
    this.animating = false;

    // Animation timing configurations
    this.classAnimationConfig = {
      initialSpeed: 50, // 50ms between cycles initially
      finalSpeed: 800, // 800ms at the end
      totalDuration: 3000, // 3 seconds total
      decelerationStart: 0.4, // Start decelerating at 40% through
    };

    this.spinAnimationConfig = {
      initialSpeed: 50, // 50ms between cycles initially
      finalSpeed: 600, // 600ms at the end
      totalDuration: 2000, // 2 seconds total
      decelerationStart: 0.5, // Start decelerating at 50% through
    };

    // Realistic roulette wheel instance
    this.realisticWheel = null;

    // Set up cleanup interval to catch any lingering containers
    this.setupCleanupInterval();
  }

  // Main entry point for the full animation sequence
  async startFullSequence() {
    if (this.animating) return;

    this.animating = true;
    window.state.isRouletteAnimating = true; // Set global flag

    // Don't hide anything - keep everything visible
    // document.querySelector(".selection-container").style.display = "none";
    // document.getElementById("output").style.display = "none";

    // Show roulette overlay and container
    const rouletteOverlay = document.getElementById("roulette-overlay");
    const rouletteContainer = document.getElementById("roulette-container");

    if (!rouletteContainer) {
      console.error("Roulette container not found!");
      return;
    }

    // Force cleanup of ALL animation containers before starting
    RouletteAnimationSystem.cleanupAllAnimationContainers();

    // Show overlay and container by removing hidden class
    if (rouletteOverlay) {
      rouletteOverlay.classList.remove("hidden");
    }
    rouletteContainer.classList.remove("hidden");

    // Container visibility is handled by CSS, no need for inline styles
    console.log("SHOWING ROULETTE CONTAINER");

    // Debug container visibility
    console.log("Roulette container visibility check:", {
      element: rouletteContainer,
      hasHiddenClass: rouletteContainer.classList.contains("hidden"),
      computedDisplay: window.getComputedStyle(rouletteContainer).display,
      computedVisibility: window.getComputedStyle(rouletteContainer).visibility,
      computedOpacity: window.getComputedStyle(rouletteContainer).opacity,
      computedZIndex: window.getComputedStyle(rouletteContainer).zIndex,
    });

    // Prevent body scrolling during animation
    document.body.style.overflow = "hidden";

    // Phase 1: Class Selection
    await this.animateClassSelection();

    // Brief pause between phases
    await this.delay(500);

    // Phase 2: Spin Count Selection
    await this.animateSpinSelection();

    // Brief pause before starting the actual slot machine
    await this.delay(500);

    // Hide roulette overlay and container
    if (rouletteOverlay) {
      rouletteOverlay.classList.add("hidden");
    }

    // Clear inline styles and hide container
    rouletteContainer.style.display = "";
    rouletteContainer.style.visibility = "";
    rouletteContainer.style.opacity = "";
    rouletteContainer.classList.add("hidden");

    // Restore body scrolling
    document.body.style.overflow = "";

    // Show the selection display
    this.showSelectionDisplay();

    // Everything stays visible, no need to show/hide
    // document.querySelector(".selection-container").style.display = "block";
    // document.getElementById("output").style.display = "block";

    // Set the state for the original system
    console.log(
      `🔗 Roulette transferring to main system: selectedClass = "${this.selectedClass}", totalSpins = ${this.selectedSpins}`
    );
    window.state.selectedClass = this.selectedClass;
    window.state.totalSpins = this.selectedSpins;
    console.log(
      `✅ Main state updated: selectedClass = "${window.state.selectedClass}"`
    );

    this.animating = false;
    window.state.isRouletteAnimating = false; // Clear global flag

    // Trigger the original spin mechanism
    console.log(
      `🚀 Calling window.spinLoadout() with selectedClass = "${window.state.selectedClass}"`
    );
    window.spinLoadout();

    // Final cleanup - remove any lingering animation containers
    setTimeout(() => {
      const allAnimationContainers = document.querySelectorAll(
        'div[style*="position: fixed"][style*="z-index: 999999"]'
      );
      allAnimationContainers.forEach((container) => {
        if (container.parentNode) {
          console.log("🧹 Cleaning up lingering animation container");
          container.remove();
        }
      });
    }, 100);
  }

  // Animate class selection roulette using realistic wheel physics

  async animateClassSelection() {
    try {
      console.log("🎯 Starting realistic roulette class selection animation");

      // Get available classes (respecting exclusions)
      const availableClasses = this.getAvailableClasses();
      console.log(
        `🎯 Roulette class selection - Available classes:`,
        availableClasses
      );

      if (availableClasses.length === 0) {
        console.error("⚠️ All classes excluded!");
        alert(
          "All classes are excluded! Please uncheck at least one class to continue."
        );
        return;
      }

      // Create a completely new DOM structure that we control
      const animationContainer = document.createElement("div");
      animationContainer.className = "roulette-animation-container";
      animationContainer.setAttribute("data-roulette-phase", "class-selection");
      animationContainer.dataset.createdAt = Date.now();
      animationContainer.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        background: rgba(0, 0, 0, 0.95);
        z-index: 999999;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
      `;

      // Create the class selection UI from scratch
      const title = document.createElement("h2");
      title.textContent = "SELECTING CLASS...";
      title.style.cssText = `
        font-size: clamp(28px, 8vw, 48px);
        font-weight: 900;
        letter-spacing: clamp(2px, 2vw, 8px);
        margin-bottom: clamp(20px, 4vw, 30px);
        color: #ffb700;
        text-shadow: 0 0 20px rgba(255, 183, 0, 0.8);
        text-align: center;
        padding: 0 20px;
      `;

      // Create container for the realistic roulette wheel
      const wheelContainer = document.createElement("div");
      wheelContainer.id = "realistic-wheel-container";
      wheelContainer.style.cssText = `
        width: 100%;
        max-width: 500px;
        height: 500px;
        margin: 0 auto;
      `;

      animationContainer.appendChild(title);
      animationContainer.appendChild(wheelContainer);
      document.body.appendChild(animationContainer);

      // Initialize the realistic roulette wheel if not already created
      if (!window.RealisticRouletteWheel) {
        console.error(
          "RealisticRouletteWheel class not found! Make sure roulette-wheel-physics.js is loaded."
        );
        throw new Error("RealisticRouletteWheel not available");
      }

      // Create and initialize the wheel
      this.realisticWheel = new window.RealisticRouletteWheel();

      // Update the pocket mappings for class selection
      this.realisticWheel.pocketMappings =
        this.generateClassPocketMappings(availableClasses);

      // Initialize the wheel
      this.realisticWheel.init("realistic-wheel-container");

      return new Promise((resolve) => {
        // Listen for the roulette completion event
        const handleRouletteComplete = (event) => {
          const result = event.detail.result;

          if (result) {
            // Handle random selection (pocket 0)
            if (result.type === "random") {
              this.selectedClass =
                availableClasses[
                  Math.floor(Math.random() * availableClasses.length)
                ];
              console.log(
                `🎲 Realistic roulette landed on RANDOM, selected: ${this.selectedClass}`
              );
            } else if (result.class) {
              this.selectedClass = result.class;
              console.log(
                `🎲 Realistic roulette selected class: ${this.selectedClass}`
              );
            }

            // Update title
            title.textContent = `${this.selectedClass.toUpperCase()} SELECTED!`;
            title.style.color = this.getClassColor(this.selectedClass);

            // Play win sound
            this.playClassWinSound();

            // Clean up after a delay
            setTimeout(() => {
              // Remove event listener
              document.removeEventListener(
                "rouletteComplete",
                handleRouletteComplete
              );

              // Destroy the wheel
              if (this.realisticWheel) {
                this.realisticWheel.destroy();
                this.realisticWheel = null;
              }

              // Remove container
              if (animationContainer && animationContainer.parentNode) {
                document.body.removeChild(animationContainer);
              }

              resolve();
            }, 1500);
          }
        };

        // Add event listener
        document.addEventListener("rouletteComplete", handleRouletteComplete);

        // Start the wheel spin after a brief delay
        setTimeout(() => {
          this.realisticWheel.spin();
        }, 500);

        // Safety timeout
        setTimeout(() => {
          console.warn("⚠️ Realistic roulette safety timeout triggered");

          // Fallback selection
          if (!this.selectedClass && availableClasses.length > 0) {
            this.selectedClass =
              availableClasses[
                Math.floor(Math.random() * availableClasses.length)
              ];
          }

          // Clean up
          document.removeEventListener(
            "rouletteComplete",
            handleRouletteComplete
          );

          if (this.realisticWheel) {
            this.realisticWheel.destroy();
            this.realisticWheel = null;
          }

          if (animationContainer && animationContainer.parentNode) {
            document.body.removeChild(animationContainer);
          }

          resolve();
        }, 15000); // 15 second safety timeout
      });
    } catch (error) {
      console.error("❌ Error in realistic roulette class selection:", error);

      // Fallback to simple animation
      console.log("Falling back to simple class selection animation");
      return this.animateClassSelectionSimple();
    }
  }

  // Generate pocket mappings for available classes
  generateClassPocketMappings(availableClasses) {
    const mappings = {};
    const totalPockets = 37;

    // Special pocket 0 - random selection
    mappings[0] = {
      type: "random",
      class: "Random",
      name: "RANDOM CLASS",
      desc: "Let fate decide!",
    };

    // Distribute classes evenly across remaining pockets
    const classesPerPocket = Math.floor(
      (totalPockets - 1) / availableClasses.length
    );
    let pocketIndex = 1;

    availableClasses.forEach((className, classIndex) => {
      const endPocket =
        classIndex === availableClasses.length - 1
          ? totalPockets
          : pocketIndex + classesPerPocket;

      for (let i = pocketIndex; i < endPocket; i++) {
        mappings[i] = {
          type: "class",
          class: className,
          name: className.toUpperCase(),
          desc: `Play as ${className} class`,
        };
      }

      pocketIndex = endPocket;
    });

    return mappings;
  }

  // Get class-specific color
  getClassColor(className) {
    const colors = {
      Light: "#00f3ff",
      Medium: "#7b2fe3",
      Heavy: "#ff4757",
    };
    return colors[className] || "#ffb700";
  }

  // Fallback simple animation (original method)
  async animateClassSelectionSimple() {
    // This is a simplified version of the original animation as fallback
    const availableClasses = this.getAvailableClasses();

    if (availableClasses.length === 0) {
      this.selectedClass = "Medium";
      return;
    }

    // Simple random selection
    this.selectedClass =
      availableClasses[Math.floor(Math.random() * availableClasses.length)];
    console.log(`🎲 Simple selection chose: ${this.selectedClass}`);

    // Brief visual feedback
    await this.delay(1000);
  }

  // Animate spin count selection
  async animateSpinSelection() {
    // Create a completely new DOM structure
    const animationContainer = document.createElement("div");
    animationContainer.className = "roulette-animation-container";
    animationContainer.setAttribute("data-roulette-phase", "spin-selection");
    animationContainer.dataset.createdAt = Date.now();
    animationContainer.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background: rgba(0, 0, 0, 0.95);
    z-index: 999999;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
  `;

    const title = document.createElement("h2");
    title.textContent = "CHOOSING SPINS...";
    title.style.cssText = `
    font-size: clamp(28px, 8vw, 48px);
    font-weight: 900;
    letter-spacing: clamp(2px, 2vw, 8px);
    margin-bottom: clamp(20px, 8vw, 50px);
    color: #ffb700;
    text-shadow: 0 0 20px rgba(255, 183, 0, 0.8);
    text-align: center;
    padding: 0 20px;
  `;

    const wheel = document.createElement("div");
    wheel.style.cssText = `
    display: flex;
    justify-content: center;
    gap: clamp(5px, 2vw, 20px);
    height: 200px;
    align-items: center;
    padding: 0 30px;
    box-sizing: border-box;
    overflow-x: auto;
    width: 100%;
  `;

    const spinElements = [];

    this.spinOptions.forEach((num) => {
      const option = document.createElement("div");
      option.style.cssText = `
      width: clamp(65px, 15vw, 100px);
      height: clamp(65px, 15vw, 100px);
      min-width: 65px;
      background: linear-gradient(135deg, #1a1a2e, #2a2a4e);
      border-radius: 50%;
      display: flex;
      justify-content: center;
      align-items: center;
      font-size: clamp(24px, 6vw, 40px);
      font-weight: 900;
      color: #fff;
      transition: all 0.3s ease;
      opacity: 0.5;
      transform: scale(0.8);
      flex-shrink: 0;
    `;

      const span = document.createElement("span");
      span.textContent = num;
      option.appendChild(span);
      wheel.appendChild(option);
      spinElements.push(option);
    });

    const statusEl = document.createElement("div");
    statusEl.id = "spinStatus";
    statusEl.style.cssText = `
    margin-top: 20px;
    font-size: 18px;
    font-weight: 600;
    letter-spacing: 2px;
    color: #00f3ff;
    text-shadow: 0 0 10px rgba(0, 243, 255, 0.8);
    min-height: 30px;
  `;

    animationContainer.appendChild(title);
    animationContainer.appendChild(wheel);
    animationContainer.appendChild(statusEl);
    document.body.appendChild(animationContainer);

    // Animation logic
    let currentIndex = 0;
    const startTime = Date.now();
    // Don't predetermine winner - let animation decide
    let winnerIndex = 0;

    return new Promise((resolve) => {
      // Safety timeout to prevent infinite animations
      const safetyTimeout = setTimeout(() => {
        console.warn("Spin animation safety timeout triggered");
        try {
          if (animationContainer && animationContainer.parentNode) {
            document.body.removeChild(animationContainer);
          }
        } catch (e) {
          console.error("Safety cleanup error:", e);
        }
        resolve();
      }, this.spinAnimationConfig.totalDuration + 2000);

      const animate = () => {
        const elapsed = Date.now() - startTime;

        if (elapsed >= this.spinAnimationConfig.totalDuration) {
          // Final selection - use whatever we landed on
          winnerIndex = currentIndex;
          this.selectedSpins = this.spinOptions[winnerIndex];

          try {
            if (spinElements[winnerIndex]) {
              spinElements[winnerIndex].style.opacity = "1";
              spinElements[winnerIndex].style.transform = "scale(1.2)";
              spinElements[winnerIndex].style.boxShadow =
                "0 0 40px rgba(123, 47, 227, 0.8)";
            }

            this.playSpinWinSound();

            if (statusEl) {
              statusEl.textContent = `${this.selectedSpins} SPIN${
                this.selectedSpins > 1 ? "S" : ""
              } SELECTED!`;
            }
          } catch (finalError) {
            console.error("Error in spin final selection:", finalError);
          }

          setTimeout(() => {
            try {
              clearTimeout(safetyTimeout);
              if (animationContainer && animationContainer.parentNode) {
                document.body.removeChild(animationContainer);
              }
              resolve();
            } catch (cleanupError) {
              console.error("Spin cleanup error:", cleanupError);
              clearTimeout(safetyTimeout);
              resolve();
            }
          }, 500);
          return;
        }

        // Update active state with error handling
        try {
          spinElements.forEach((el, idx) => {
            if (el) {
              try {
                if (idx === currentIndex) {
                  el.style.opacity = "1";
                  el.style.transform = "scale(1.2)";
                  el.style.background =
                    "linear-gradient(135deg, #7b2fe3, #1e90ff)";

                  // Create particle effect (less frequent to avoid overwhelming)
                  if (elapsed % 100 < 50) {
                    try {
                      this.createParticleEffect(el);
                    } catch (particleError) {
                      console.warn("Particle effect error:", particleError);
                    }
                  }
                } else {
                  el.style.opacity = "0.5";
                  el.style.transform = "scale(0.8)";
                  el.style.background =
                    "linear-gradient(135deg, #1a1a2e, #2a2a4e)";
                }
              } catch (elementError) {
                console.warn("Spin element style error:", elementError);
              }
            }
          });
        } catch (updateError) {
          console.warn("Spin update error:", updateError);
        }

        this.playTickSound();

        // Calculate speed
        const progress = elapsed / this.spinAnimationConfig.totalDuration;
        let speed = this.spinAnimationConfig.initialSpeed;

        if (progress > this.spinAnimationConfig.decelerationStart) {
          const decelerationProgress =
            (progress - this.spinAnimationConfig.decelerationStart) /
            (1 - this.spinAnimationConfig.decelerationStart);
          speed =
            this.spinAnimationConfig.initialSpeed +
            (this.spinAnimationConfig.finalSpeed -
              this.spinAnimationConfig.initialSpeed) *
              Math.pow(decelerationProgress, 2);
        }

        // Continue cycling through options naturally
        currentIndex = (currentIndex + 1) % this.spinOptions.length;

        // Ensure speed is within reasonable bounds
        speed = Math.max(10, Math.min(1000, speed));

        try {
          setTimeout(animate, speed);
        } catch (timeoutError) {
          console.error("Spin animation timeout error:", timeoutError);
          try {
            clearTimeout(safetyTimeout);
            if (animationContainer && animationContainer.parentNode) {
              document.body.removeChild(animationContainer);
            }
            resolve();
          } catch (fallbackError) {
            console.error("Spin fallback cleanup error:", fallbackError);
            clearTimeout(safetyTimeout);
            resolve();
          }
        }
      };

      animate();
    });
  }

  // Visual effects
  createFlashEffect() {
    const flash = document.createElement("div");
    flash.className = "flash-overlay";
    document.body.appendChild(flash);
    setTimeout(() => flash.remove(), 500);
  }

  createParticleEffect(element) {
    const rect = element.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    // Reduce particle count on mobile for performance
    const particleCount = window.state?.isMobile ? 3 : 8;

    for (let i = 0; i < particleCount; i++) {
      const particle = document.createElement("div");
      particle.style.cssText = `
        position: fixed;
        width: 4px;
        height: 4px;
        background: #fff;
        border-radius: 50%;
        pointer-events: none;
        z-index: 1000001;
        left: ${centerX}px;
        top: ${centerY}px;
        box-shadow: 0 0 6px rgba(255, 255, 255, 0.8);
      `;

      // Random direction
      const angle =
        (Math.PI * 2 * i) / particleCount + (Math.random() - 0.5) * 0.5;
      const distance = 60 + Math.random() * 80;
      const targetX = centerX + Math.cos(angle) * distance;
      const targetY = centerY + Math.sin(angle) * distance;

      document.body.appendChild(particle);

      // Animate the particle
      const animation = particle.animate(
        [
          {
            transform: "translate(0, 0) scale(1)",
            opacity: 1,
          },
          {
            transform: `translate(${targetX - centerX}px, ${
              targetY - centerY
            }px) scale(0)`,
            opacity: 0,
          },
        ],
        {
          duration: 800,
          easing: "ease-out",
        }
      );

      animation.onfinish = () => {
        if (particle.parentNode) {
          particle.parentNode.removeChild(particle);
        }
      };
    }
  }

  // Sound effects (placeholders - implement with actual audio files)
  playTickSound() {
    // Check if sound is enabled
    if (!window.state || !window.state.soundEnabled) return;

    // Create a tick sound using Web Audio API or play an audio file
    const audio = document.getElementById("tickSound");
    if (
      (audio && !this._lastTickTime) ||
      Date.now() - this._lastTickTime > 30
    ) {
      this._lastTickTime = Date.now();
      audio.currentTime = 0;
      audio.volume = 0.1;
      audio.playbackRate = 2.0;
      audio.play().catch(() => {});
    }
  }

  playClassWinSound() {
    // Check if sound is enabled
    if (!window.state || !window.state.soundEnabled) return;

    // Play chang.mp3 for class selection
    const audio = document.getElementById("classWinSound");
    if (audio) {
      audio.currentTime = 0;
      audio.volume = 0.05;
      audio.play().catch(() => {});
    }
  }

  playSpinWinSound() {
    // Check if sound is enabled
    if (!window.state || !window.state.soundEnabled) return;

    // Play Tabby Tune.mp3 for spin selection
    const audio = document.getElementById("spinWinSound");
    if (audio) {
      audio.currentTime = 0;
      audio.volume = 0.05;
      audio.play().catch(() => {});
    }
  }

  // Show selection display
  showSelectionDisplay() {
    const selectionDisplay = document.getElementById("selection-display");
    if (!selectionDisplay) return;

    const classSpan = selectionDisplay.querySelector(".selection-class");
    const spinsSpan = selectionDisplay.querySelector(".selection-spins");

    // Set the class with appropriate color
    classSpan.textContent = this.selectedClass.toUpperCase();
    classSpan.className = `selection-class ${this.selectedClass.toLowerCase()}`;

    // Set the spins text
    spinsSpan.textContent = `${this.selectedSpins} SPIN${
      this.selectedSpins > 1 ? "S" : ""
    }`;

    // Show the display with visible class
    selectionDisplay.classList.remove("hidden");
    selectionDisplay.classList.add("visible");

    // Hide it after the slot machine starts
    setTimeout(() => {
      selectionDisplay.classList.remove("visible");
      selectionDisplay.classList.add("hidden");
    }, 5000);
  }

  // Utility
  delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  // Get available classes (respecting inclusions)
  getAvailableClasses() {
    const allClasses = ["Light", "Medium", "Heavy"];
    const includedClasses = [];

    // Check localStorage for inclusions (checked = included, unchecked = excluded)
    // The checkboxes are "Select Classes to Include" - when checked, the class should be included
    // localStorage stores 'false' when checked (included) and 'true' when unchecked (excluded)
    ["light", "medium", "heavy"].forEach((className) => {
      const isExcluded =
        localStorage.getItem(`exclude-${className}`) === "true";
      if (!isExcluded) {
        // If not excluded, then it's included
        const capitalizedClass =
          className.charAt(0).toUpperCase() + className.slice(1);
        includedClasses.push(capitalizedClass);
      }
    });

    // If no classes are explicitly included, include all classes
    const availableClasses =
      includedClasses.length > 0 ? includedClasses : allClasses;
    console.log("🎲 Roulette available classes:", availableClasses);
    return availableClasses;
  }

  // Set up cleanup observer instead of interval
  setupCleanupInterval() {
    // Clean up after each animation completes instead of running forever
    this.cleanupAfterAnimation = () => {
      if (!this.animating) {
        const containers = document.querySelectorAll(
          ".roulette-animation-container"
        );
        if (containers.length > 0) {
          console.log(
            "🧹 Cleaning up",
            containers.length,
            "animation containers"
          );
          containers.forEach((container) => container.remove());
        }
      }
    };

    // Only clean up when DOM changes or animation ends
    document.addEventListener("animationend", this.cleanupAfterAnimation);
  }

  // Clean up all animation containers immediately
  static cleanupAllAnimationContainers() {
    // Only clean up if there's no active animation
    if (!window.rouletteSystem || !window.rouletteSystem.animating) {
      const containers = document.querySelectorAll(
        ".roulette-animation-container"
      );

      containers.forEach((container) => {
        console.log("🧹 Force removing animation container:", container);
        container.remove();
      });
    }
  }
}

// Export for use in main app.js
window.RouletteAnimationSystem = RouletteAnimationSystem;
