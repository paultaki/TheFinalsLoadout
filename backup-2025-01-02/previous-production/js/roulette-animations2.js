// roulette-animations.js - Fallback stub for spin animation system
// TODO: swap stub for real runSpinSelector once animations are ported

// Roulette Animation System
class RouletteAnimationSystem {
  constructor() {
    this.classOptions = ["Light", "Medium", "Heavy"];
    this.spinOptions = [1, 2, 3, 4, 5];
    this.selectedClass = null;
    this.selectedSpins = null;
    this.animating = false;
  }

  // Get available classes (respecting inclusions)
  getAvailableClasses() {
    const allClasses = ["Light", "Medium", "Heavy"];
    const includedClasses = [];

    // Check localStorage for inclusions
    ["light", "medium", "heavy"].forEach((className) => {
      const isExcluded =
        localStorage.getItem(`exclude-${className}`) === "true";
      if (!isExcluded) {
        const capitalizedClass =
          className.charAt(0).toUpperCase() + className.slice(1);
        includedClasses.push(capitalizedClass);
      }
    });

    const availableClasses =
      includedClasses.length > 0 ? includedClasses : allClasses;
    console.log("🎲 Roulette available classes:", availableClasses);
    return availableClasses;
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

  // Utility
  delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  // Sound effects
  playTickSound() {
    if (!window.state || !window.state.soundEnabled) return;

    const audio = document.getElementById("tickSound");
    if (audio) {
      audio.currentTime = 0;
      audio.volume = 0.05;
      audio.playbackRate = 2.0;
      audio.play().catch(() => {});
    }
  }

  playClassWinSound() {
    if (!window.state || !window.state.soundEnabled) return;

    const audio = document.getElementById("classWinSound");
    if (audio) {
      audio.currentTime = 0;
      audio.volume = 0.05;
      audio.play().catch(() => {});
    }
  }

  // Main animation method
  async animateClassSelection() {
    try {
      console.log("🎯 Starting roulette class selection animation");
      const availableClasses = this.getAvailableClasses();

      if (availableClasses.length === 0) {
        console.error("⚠️ All classes excluded!");
        alert(
          "All classes are excluded! Please uncheck at least one class to continue."
        );
        return;
      }

      // Always use DOM-based wheel for consistency
      console.log("🎲 Using DOM-based wheel animation");
      return this.animateClassSelectionDOM(availableClasses);
    } catch (error) {
      console.error("❌ Error in class selection:", error);
      return this.animateClassSelectionSimple();
    }
  }

  // Simple animation fallback
  async animateClassSelectionSimple(availableClasses) {
    if (!availableClasses) {
      availableClasses = this.getAvailableClasses();
    }

    if (availableClasses.length === 0) {
      this.selectedClass = "Medium";
      return;
    }

    this.selectedClass =
      availableClasses[Math.floor(Math.random() * availableClasses.length)];
    console.log(`🎲 Simple selection chose: ${this.selectedClass}`);
    await this.delay(1000);
  }

  // DOM-based wheel animation
  async animateClassSelectionDOM(availableClasses) {
    console.log("🎯 Starting DOM-based roulette animation");

    // Create animation container
    const animationContainer = document.createElement("div");
    animationContainer.className =
      "roulette-animation-container mobile-dom-wheel";
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

    // Create title
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

    // Create DOM-based wheel container
    const wheelContainer = document.createElement("div");
    wheelContainer.className = "dom-roulette-wheel";
    wheelContainer.style.cssText = `
      width: clamp(280px, 70vw, 400px);
      height: clamp(280px, 70vw, 400px);
      position: relative;
      margin: 0 auto;
    `;

    // Create the wheel wrapper
    const wheelWrapper = document.createElement("div");
    wheelWrapper.className = "dom-wheel-wrapper";
    wheelWrapper.style.cssText = `
      width: 100%;
      height: 100%;
      position: relative;
      border-radius: 50%;
      overflow: hidden;
      box-shadow: 0 0 30px rgba(0, 0, 0, 0.5);
    `;

    // Create rotating wheel
    const wheel = document.createElement("div");
    wheel.className = "dom-wheel-rotating";
    wheel.style.cssText = `
      width: 100%;
      height: 100%;
      position: absolute;
      border-radius: 50%;
      transition: transform cubic-bezier(0.17, 0.67, 0.12, 0.99) 4s;
      will-change: transform;
      transform: translateZ(0);
    `;

    // Create wheel segments
    const segmentCount = 12;
    const degreePerSegment = 360 / segmentCount;

    for (let i = 0; i < segmentCount; i++) {
      const classIndex = i % availableClasses.length;
      const className = availableClasses[classIndex];
      const color = this.getClassColor(className);

      const segment = document.createElement("div");
      segment.className = "dom-wheel-segment";
      segment.dataset.class = className;
      // Calculate proper skew angle for pie segments
      const skewAngle = 90 - 180 / segmentCount;

      segment.style.cssText = `
        position: absolute;
        width: 50%;
        height: 50%;
        right: 0;
        bottom: 0;
        transform-origin: 0% 100%;
        transform: rotate(${i * degreePerSegment}deg) skewY(${skewAngle}deg);
        background: ${color};
        border: 1px solid rgba(255, 255, 255, 0.2);
        overflow: hidden;
      `;

      // Add label
      const label = document.createElement("div");
      label.textContent = className.toUpperCase();
      label.style.cssText = `
        position: absolute;
        top: 20%;
        left: 20%;
        transform: skewY(${-skewAngle}deg) rotate(${degreePerSegment / 2}deg);
        color: white;
        font-weight: bold;
        font-size: 14px;
        text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.8);
      `;
      segment.appendChild(label);

      wheel.appendChild(segment);
    }

    // Create center hub
    const centerHub = document.createElement("div");
    centerHub.style.cssText = `
      position: absolute;
      width: 30%;
      height: 30%;
      top: 35%;
      left: 35%;
      background: #222;
      border-radius: 50%;
      border: 3px solid #ffd700;
      z-index: 10;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 24px;
    `;
    centerHub.textContent = "🎲";

    // Create pointer
    const pointer = document.createElement("div");
    pointer.style.cssText = `
      position: absolute;
      top: -20px;
      left: 50%;
      transform: translateX(-50%);
      width: 0;
      height: 0;
      border-left: 20px solid transparent;
      border-right: 20px solid transparent;
      border-top: 40px solid #ffd700;
      z-index: 20;
      filter: drop-shadow(0 0 10px rgba(255, 215, 0, 0.8));
    `;

    // Create ball (simplified for DOM)
    const ball = document.createElement("div");
    ball.className = "dom-roulette-ball";
    ball.style.cssText = `
      position: absolute;
      width: 20px;
      height: 20px;
      background: radial-gradient(circle at 30% 30%, #fff, #ccc);
      border-radius: 50%;
      top: 10%;
      left: 50%;
      transform: translateX(-50%);
      z-index: 15;
      box-shadow: 0 2px 5px rgba(0, 0, 0, 0.5);
      opacity: 0;
      transition: all 3.5s cubic-bezier(0.25, 0.46, 0.45, 0.94);
    `;

    // Assemble the wheel
    wheelWrapper.appendChild(wheel);
    wheelWrapper.appendChild(centerHub);
    wheelContainer.appendChild(wheelWrapper);
    wheelContainer.appendChild(pointer);
    wheelContainer.appendChild(ball);

    animationContainer.appendChild(title);
    animationContainer.appendChild(wheelContainer);
    document.body.appendChild(animationContainer);

    return new Promise((resolve) => {
      // Calculate random winning position
      const winningSegmentIndex = Math.floor(Math.random() * segmentCount);
      const winningClassIndex = winningSegmentIndex % availableClasses.length;
      this.selectedClass = availableClasses[winningClassIndex];

      // Calculate rotation needed
      const baseRotations = 3; // Minimum full rotations
      const extraRotation =
        (segmentCount - winningSegmentIndex) * degreePerSegment;
      const totalRotation = baseRotations * 360 + extraRotation;

      // Start animation after a short delay
      setTimeout(() => {
        // Spin the wheel
        wheel.style.transform = `rotate(${totalRotation}deg)`;

        // Animate the ball with easing
        setTimeout(() => {
          ball.style.opacity = "1";
          ball.style.transform = `translateX(-50%) rotate(${
            -totalRotation * 0.8
          }deg) translateY(120px)`;
        }, 200);

        // Play tick sounds at intervals
        if (window.state?.soundEnabled) {
          let tickCount = 0;
          const tickInterval = setInterval(() => {
            this.playTickSound();
            tickCount++;
            if (tickCount > 15) clearInterval(tickInterval);
          }, 250);
        }
      }, 500);

      // Handle completion
      setTimeout(() => {
        // Update title
        title.textContent = `${this.selectedClass.toUpperCase()} SELECTED!`;
        title.style.color = this.getClassColor(this.selectedClass);

        // Play win sound
        this.playClassWinSound();

        // Highlight winning segment
        const segments = wheel.querySelectorAll(".dom-wheel-segment");
        segments.forEach((seg) => {
          if (seg.dataset.class === this.selectedClass) {
            seg.style.filter = "brightness(1.5)";
            seg.style.boxShadow = "inset 0 0 20px rgba(255, 255, 255, 0.5)";
          } else {
            seg.style.opacity = "0.5";
          }
        });

        // Clean up after animation
        setTimeout(() => {
          if (animationContainer && animationContainer.parentNode) {
            document.body.removeChild(animationContainer);
          }
          resolve();
        }, 1500);
      }, 4500); // Total animation time
    });
  }

  // Main entry point for compatibility
  async startFullSequence() {
    console.log("🎯 Starting roulette animation sequence");

    // Animate class selection
    await this.animateClassSelection();

    // For now, just use default spin count
    this.selectedSpins = 3;

    // Return the results in the expected format
    return {
      spinCount: this.selectedSpins,
      isJackpot: false,
      chosenClass: this.selectedClass,
    };
  }
}

// Export for use
window.RouletteAnimationSystem = RouletteAnimationSystem;

// Expose the animateClassSelection method directly for overlay-manager.js
window.animateClassSelection = async function () {
  console.log("🎯 animateClassSelection called from overlay-manager");

  const roulette = new RouletteAnimationSystem();
  await roulette.animateClassSelection();

  return roulette.selectedClass;
};
