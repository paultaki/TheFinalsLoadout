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
  }

  // Main entry point for the full animation sequence
  async startFullSequence() {
    if (this.animating) return;

    this.animating = true;

    // Hide main UI elements
    document.querySelector(".selection-container").style.display = "none";
    document.getElementById("output").style.display = "none";

    // Show roulette container
    const rouletteContainer = document.getElementById("roulette-container");
    if (!rouletteContainer) {
      console.error("Roulette container not found!");
      return;
    }

    // Show container by removing hidden class
    rouletteContainer.classList.remove("hidden");

    // Force container visible with inline styles
    console.log("FORCING ROULETTE CONTAINER VISIBLE");
    rouletteContainer.style.display = "flex";
    rouletteContainer.style.visibility = "visible";
    rouletteContainer.style.opacity = "1";
    rouletteContainer.style.position = "fixed";
    rouletteContainer.style.top = "0";
    rouletteContainer.style.left = "0";
    rouletteContainer.style.width = "100vw";
    rouletteContainer.style.height = "100vh";
    rouletteContainer.style.zIndex = "999999";
    rouletteContainer.style.background = "rgba(0, 0, 0, 0.95)";

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

    // Hide roulette container
    rouletteContainer.classList.add("hidden");

    // Restore body scrolling
    document.body.style.overflow = "";

    // Show the selection display
    this.showSelectionDisplay();

    // Show the main container and output
    document.querySelector(".selection-container").style.display = "block";
    document.getElementById("output").style.display = "block";

    // Set the state for the original system
    window.state.selectedClass = this.selectedClass;
    window.state.totalSpins = this.selectedSpins;

    this.animating = false;

    // Trigger the original spin mechanism
    window.spinLoadout();
  }

  // Animate class selection roulette

  async animateClassSelection() {
    // Create a completely new DOM structure that we control
    const animationContainer = document.createElement("div");
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
    font-size: 48px;
    font-weight: 900;
    letter-spacing: 8px;
    margin-bottom: 50px;
    color: #ffb700;
    text-shadow: 0 0 20px rgba(255, 183, 0, 0.8);
  `;

    const wheel = document.createElement("div");
    wheel.style.cssText = `
    display: flex;
    justify-content: center;
    gap: 40px;
    height: 300px;
    align-items: center;
  `;

    // Create class options
    const classes = ["Light", "Medium", "Heavy"];
    const classElements = [];

    classes.forEach((className, index) => {
      const option = document.createElement("div");
      option.style.cssText = `
      width: 200px;
      height: 250px;
      background: linear-gradient(135deg, #1a1a2e, #2a2a4e);
      border-radius: 20px;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      transition: all 0.3s ease;
      opacity: 0.5;
      transform: scale(0.8);
    `;

      const img = document.createElement("img");
      img.src = `images/${className.toLowerCase()}_active.webp`;
      img.style.cssText = `
      width: 120px;
      height: 120px;
      margin-bottom: 20px;
      filter: brightness(0.5);
    `;

      const label = document.createElement("span");
      label.textContent = className.toUpperCase();
      label.style.cssText = `
      font-size: 24px;
      font-weight: 700;
      letter-spacing: 3px;
      color: #fff;
      opacity: 0.5;
    `;

      option.appendChild(img);
      option.appendChild(label);
      wheel.appendChild(option);
      classElements.push(option);
    });

    animationContainer.appendChild(title);
    animationContainer.appendChild(wheel);
    document.body.appendChild(animationContainer);

    // Now run the animation
    let currentIndex = 0;
    const startTime = Date.now();
    const winnerIndex = Math.floor(Math.random() * this.classOptions.length);
    this.selectedClass = this.classOptions[winnerIndex];

    return new Promise((resolve) => {
      const animate = () => {
        const elapsed = Date.now() - startTime;

        if (elapsed >= this.classAnimationConfig.totalDuration) {
          // Final selection
          classElements.forEach((el, idx) => {
            if (idx === winnerIndex) {
              el.style.opacity = "1";
              el.style.transform = "scale(1.2)";
              el.style.boxShadow = "0 0 50px rgba(255, 183, 0, 0.8)";
              el.querySelector("img").style.filter = "brightness(1.2)";
              el.querySelector("span").style.opacity = "1";
            }
          });

          this.playClassWinSound();

          setTimeout(() => {
            document.body.removeChild(animationContainer);
            resolve();
          }, 500);
          return;
        }

        // Update active state
        classElements.forEach((el, idx) => {
          if (idx === currentIndex) {
            el.style.opacity = "1";
            el.style.transform = "scale(1.1)";
            el.querySelector("img").style.filter = "brightness(1)";
            el.querySelector("span").style.opacity = "1";
          } else {
            el.style.opacity = "0.5";
            el.style.transform = "scale(0.8)";
            el.querySelector("img").style.filter = "brightness(0.5)";
            el.querySelector("span").style.opacity = "0.5";
          }
        });

        this.playTickSound();

        // Calculate speed
        const progress = elapsed / this.classAnimationConfig.totalDuration;
        let speed = this.classAnimationConfig.initialSpeed;

        if (progress > this.classAnimationConfig.decelerationStart) {
          const decelerationProgress =
            (progress - this.classAnimationConfig.decelerationStart) /
            (1 - this.classAnimationConfig.decelerationStart);
          speed =
            this.classAnimationConfig.initialSpeed +
            (this.classAnimationConfig.finalSpeed -
              this.classAnimationConfig.initialSpeed) *
              Math.pow(decelerationProgress, 2);
        }

        if (elapsed >= this.classAnimationConfig.totalDuration - 500) {
          currentIndex = winnerIndex;
          speed = 500;
        } else {
          currentIndex = (currentIndex + 1) % this.classOptions.length;
        }

        setTimeout(animate, speed);
      };

      animate();
    });
  }

  // Animate spin count selection
  async animateSpinSelection() {
    // Create a completely new DOM structure
    const animationContainer = document.createElement("div");
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
    font-size: 48px;
    font-weight: 900;
    letter-spacing: 8px;
    margin-bottom: 50px;
    color: #ffb700;
    text-shadow: 0 0 20px rgba(255, 183, 0, 0.8);
  `;

    const wheel = document.createElement("div");
    wheel.style.cssText = `
    display: flex;
    justify-content: center;
    gap: 30px;
    height: 200px;
    align-items: center;
  `;

    const spinElements = [];

    this.spinOptions.forEach((num) => {
      const option = document.createElement("div");
      option.style.cssText = `
      width: 120px;
      height: 120px;
      background: linear-gradient(135deg, #1a1a2e, #2a2a4e);
      border-radius: 50%;
      display: flex;
      justify-content: center;
      align-items: center;
      font-size: 48px;
      font-weight: 900;
      color: #fff;
      transition: all 0.3s ease;
      opacity: 0.5;
      transform: scale(0.8);
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
    const winnerIndex = Math.floor(Math.random() * this.spinOptions.length);
    this.selectedSpins = this.spinOptions[winnerIndex];

    return new Promise((resolve) => {
      const animate = () => {
        const elapsed = Date.now() - startTime;

        if (elapsed >= this.spinAnimationConfig.totalDuration) {
          // Final selection
          spinElements[winnerIndex].style.opacity = "1";
          spinElements[winnerIndex].style.transform = "scale(1.2)";
          spinElements[winnerIndex].style.boxShadow =
            "0 0 40px rgba(123, 47, 227, 0.8)";

          this.playSpinWinSound();
          statusEl.textContent = `${this.selectedSpins} SPIN${
            this.selectedSpins > 1 ? "S" : ""
          } SELECTED!`;

          setTimeout(() => {
            document.body.removeChild(animationContainer);
            resolve();
          }, 500);
          return;
        }

        // Update active state
        spinElements.forEach((el, idx) => {
          if (idx === currentIndex) {
            el.style.opacity = "1";
            el.style.transform = "scale(1.2)";
            el.style.background = "linear-gradient(135deg, #7b2fe3, #1e90ff)";
          } else {
            el.style.opacity = "0.5";
            el.style.transform = "scale(0.8)";
            el.style.background = "linear-gradient(135deg, #1a1a2e, #2a2a4e)";
          }
        });

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

        if (elapsed >= this.spinAnimationConfig.totalDuration - 400) {
          currentIndex = winnerIndex;
          speed = 400;
        } else {
          currentIndex = (currentIndex + 1) % this.spinOptions.length;
        }

        setTimeout(animate, speed);
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

    const particlesContainer = document.createElement("div");
    particlesContainer.className = "particles";
    document.body.appendChild(particlesContainer);

    // Reduce particle count on mobile for performance
    const particleCount = window.state?.isMobile ? 3 : 10;

    for (let i = 0; i < particleCount; i++) {
      const particle = document.createElement("div");
      particle.className = "particle";
      particle.style.left = centerX + "px";
      particle.style.top = centerY + "px";

      // Random direction
      const angle = (Math.PI * 2 * i) / particleCount;
      const distance = 100 + Math.random() * 100;
      particle.style.setProperty("--tx", Math.cos(angle) * distance + "px");
      particle.style.setProperty("--ty", Math.sin(angle) * distance + "px");

      particlesContainer.appendChild(particle);
    }

    setTimeout(() => particlesContainer.remove(), 1000);
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
      audio.volume = 0.2;
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
      audio.volume = 0.5;
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
      audio.volume = 0.5;
      audio.play().catch(() => {});
    }
  }

  // Show selection display
  showSelectionDisplay() {
    const selectionDisplay = document.getElementById("selection-display");
    const classSpan = selectionDisplay.querySelector(".selection-class");
    const spinsSpan = selectionDisplay.querySelector(".selection-spins");

    // Set the class with appropriate color
    classSpan.textContent = this.selectedClass.toUpperCase();
    classSpan.className = `selection-class ${this.selectedClass.toLowerCase()}`;

    // Set the spins text
    spinsSpan.textContent = `${this.selectedSpins} SPIN${
      this.selectedSpins > 1 ? "S" : ""
    }`;

    // Show the display
    selectionDisplay.classList.remove("hidden");

    // Hide it after the slot machine starts
    setTimeout(() => {
      selectionDisplay.classList.add("hidden");
    }, 5000);
  }

  // Utility
  delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

// Export for use in main app.js
window.RouletteAnimationSystem = RouletteAnimationSystem;
