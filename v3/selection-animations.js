/**
 * Pre-Slot Selection Animations
 * Dramatic casino-style number and class selection
 */

// ========================================
// Number Selector Configuration
// ========================================
const NUMBER_SELECTOR_CONFIG = {
  indicators: 5, // 1-5 spins available
  layout: "horizontal",
  size: {
    circleSize: 80, // px
    spacing: 100, // px between circles
    containerHeight: 120, // px
  },
  animation: {
    lightSpeed: 120, // ms per indicator
    accelerationTime: 1800, // Speed up phase
    decelerationTime: 2200, // Slow down phase
    finalPause: 600, // Dramatic pause before reveal
    glowEffect: "rgba(255, 215, 0, 0.9)",
    pulseScale: 1.3,
  },
  colors: {
    inactive: "#333333",
    active: "#ffcc00",
    selected: "#ffd700",
    glow: "rgba(255, 215, 0, 0.5)",
  },
};

// ========================================
// Class Roulette Configuration
// ========================================
const CLASS_ROULETTE_CONFIG = {
  classes: ["Light", "Medium", "Heavy"],
  colors: {
    Light: { primary: "#4fc3f7", glow: "rgba(79, 195, 247, 0.5)" },
    Medium: { primary: "#ab47bc", glow: "rgba(171, 71, 188, 0.5)" },
    Heavy: { primary: "#ff1744", glow: "rgba(255, 23, 68, 0.5)" },
  },
  animation: {
    spotlightSpeed: 180, // ms per class
    buildupTime: 2000, // Tension building
    finalReveal: 800, // Lock-in effect
    pulseIntensity: 1.2, // Scale factor
    rotationSpeed: 2000, // ms for full rotation during buildup
  },
  layout: {
    boxSize: { width: 150, height: 200 },
    spacing: 30,
    iconSize: 60,
  },
};

// ========================================
// Sound Configuration
// ========================================
const SELECTION_SOUNDS = {
  lightRotation: { volume: 0.03, loop: true },
  lockIn: { volume: 0.05 },
  transition: { volume: 0.04 },
  buildup: { volume: 0.03, loop: true },
  reveal: { volume: 0.06 },
};

// ========================================
// Number Selector Class
// ========================================
class NumberSelector {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.selectedNumber = null;
    this.isAnimating = false;
    this.indicators = [];
    this.lightPosition = 0;
    this.animationFrameId = null;

    this.createUI();
    this.setupEventListeners();
  }

  /**
   * Create the number selector UI
   */
  createUI() {
    if (!this.container) return;

    this.container.innerHTML = "";
    this.container.className = "number-selector-container";

    // Create title
    const title = document.createElement("div");
    title.className = "selector-title";
    title.innerHTML = "<h2>SELECT YOUR SPIN COUNT</h2>";
    this.container.appendChild(title);

    // Create indicators container
    const indicatorsContainer = document.createElement("div");
    indicatorsContainer.className = "number-indicators";

    // Create circular indicators
    for (let i = 1; i <= NUMBER_SELECTOR_CONFIG.indicators; i++) {
      const indicator = document.createElement("div");
      indicator.className = "number-indicator";
      indicator.dataset.number = i;

      // Inner content
      indicator.innerHTML = `
                <div class="indicator-inner">
                    <span class="indicator-number">${i}</span>
                    <span class="indicator-label">SPIN${i > 1 ? "S" : ""}</span>
                </div>
                <div class="indicator-glow"></div>
            `;

      indicatorsContainer.appendChild(indicator);
      this.indicators.push(indicator);
    }

    this.container.appendChild(indicatorsContainer);

    // Create rotating light effect
    const lightEffect = document.createElement("div");
    lightEffect.className = "rotating-light";
    this.container.appendChild(lightEffect);

    // Create action button
    const buttonContainer = document.createElement("div");
    buttonContainer.className = "selector-button-container";
    buttonContainer.innerHTML = `
            <button class="selector-button" id="number-selector-btn">
                <span class="button-text">SELECT NUMBER</span>
                <span class="button-glow"></span>
            </button>
        `;
    this.container.appendChild(buttonContainer);
  }

  /**
   * Setup event listeners
   */
  setupEventListeners() {
    const button = document.getElementById("number-selector-btn");
    if (button) {
      button.addEventListener("click", () => this.startSelection());
    }

    // Allow clicking on indicators when not animating
    this.indicators.forEach((indicator) => {
      indicator.addEventListener("click", () => {
        if (!this.isAnimating) {
          this.selectNumber(parseInt(indicator.dataset.number));
        }
      });
    });
  }

  /**
   * Start the selection animation
   */
  async startSelection() {
    if (this.isAnimating) return;

    this.isAnimating = true;
    this.resetIndicators();

    // Play buildup sound
    this.playSound("lightRotation");

    // Run the animation phases
    await this.runAcceleration();
    await this.runHighSpeed();
    await this.runDeceleration();
    await this.runFinalReveal();

    this.isAnimating = false;

    // Stop rotation sound
    this.stopSound("lightRotation");

    // Dispatch selection event
    this.dispatchSelectionEvent();
  }

  /**
   * Acceleration phase
   */
  async runAcceleration() {
    return new Promise((resolve) => {
      const startTime = performance.now();
      const duration = NUMBER_SELECTOR_CONFIG.animation.accelerationTime;

      const animate = (currentTime) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);

        // Exponential acceleration
        const speed = this.easeInExpo(progress);

        // Update light position
        this.updateLightPosition(speed * 10);

        if (progress < 1) {
          this.animationFrameId = requestAnimationFrame(animate);
        } else {
          resolve();
        }
      };

      this.animationFrameId = requestAnimationFrame(animate);
    });
  }

  /**
   * High-speed phase
   */
  async runHighSpeed() {
    return new Promise((resolve) => {
      const startTime = performance.now();
      const duration = 1000; // 1 second of high speed

      const animate = (currentTime) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);

        // Maximum speed with slight variations
        const variation = Math.sin(elapsed * 0.01) * 0.2;
        this.updateLightPosition(15 + variation);

        // Add blur effect to all indicators
        this.indicators.forEach((ind) => {
          ind.style.filter = "blur(1px)";
        });

        if (progress < 1) {
          this.animationFrameId = requestAnimationFrame(animate);
        } else {
          resolve();
        }
      };

      this.animationFrameId = requestAnimationFrame(animate);
    });
  }

  /**
   * Deceleration phase
   */
  async runDeceleration() {
    // Randomly select the winning number
    this.selectedNumber =
      Math.floor(Math.random() * NUMBER_SELECTOR_CONFIG.indicators) + 1;

    return new Promise((resolve) => {
      const startTime = performance.now();
      const duration = NUMBER_SELECTOR_CONFIG.animation.decelerationTime;

      // Calculate target position
      const targetPosition = (this.selectedNumber - 1) * 100;
      const startPosition =
        this.lightPosition % (NUMBER_SELECTOR_CONFIG.indicators * 100);

      const animate = (currentTime) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);

        // Ease out deceleration
        const eased = this.easeOutCubic(progress);

        // Slow down to target
        const currentSpeed = 15 * (1 - eased);
        this.updateLightPosition(currentSpeed);

        // Remove blur gradually
        this.indicators.forEach((ind) => {
          ind.style.filter = `blur(${1 - eased}px)`;
        });

        // Start highlighting target as we approach
        if (progress > 0.7) {
          const targetIndicator = this.indicators[this.selectedNumber - 1];
          targetIndicator.classList.add("approaching");
        }

        if (progress < 1) {
          this.animationFrameId = requestAnimationFrame(animate);
        } else {
          resolve();
        }
      };

      this.animationFrameId = requestAnimationFrame(animate);
    });
  }

  /**
   * Final reveal with dramatic pause
   */
  async runFinalReveal() {
    // Clear all effects
    this.indicators.forEach((ind) => {
      ind.style.filter = "none";
      ind.classList.remove("approaching", "active");
    });

    // Dramatic pause
    await this.delay(NUMBER_SELECTOR_CONFIG.animation.finalPause);

    // Lock in the selection
    this.selectNumber(this.selectedNumber);

    // Play lock-in sound
    this.playSound("lockIn");

    // Pulse animation
    const selected = this.indicators[this.selectedNumber - 1];
    selected.classList.add("selected", "pulse");

    // Victory glow
    this.createVictoryGlow(selected);
  }

  /**
   * Update rotating light position
   */
  updateLightPosition(speed) {
    this.lightPosition += speed;

    // Highlight indicators based on light position
    const currentIndex = Math.floor(
      (this.lightPosition / 100) % NUMBER_SELECTOR_CONFIG.indicators
    );

    this.indicators.forEach((ind, index) => {
      if (index === currentIndex) {
        ind.classList.add("active");
        ind.style.transform = "scale(1.1)";
      } else {
        ind.classList.remove("active");
        ind.style.transform = "scale(1)";
      }
    });
  }

  /**
   * Select a specific number
   */
  selectNumber(number) {
    this.selectedNumber = number;

    // Update UI
    this.indicators.forEach((ind, index) => {
      if (index === number - 1) {
        ind.classList.add("selected");
      } else {
        ind.classList.remove("selected", "active");
        ind.style.opacity = "0.3";
      }
    });

    // Update button
    const button = document.getElementById("number-selector-btn");
    if (button) {
      button.innerHTML = `
                <span class="button-text">${number} SPIN${
        number > 1 ? "S" : ""
      } SELECTED</span>
                <span class="button-glow"></span>
            `;
      button.disabled = true;
    }
  }

  /**
   * Create victory glow effect
   */
  createVictoryGlow(element) {
    const rect = element.getBoundingClientRect();
    const containerRect = this.container.getBoundingClientRect();

    const glow = document.createElement("div");
    glow.className = "victory-glow";
    glow.style.left = `${rect.left - containerRect.left + rect.width / 2}px`;
    glow.style.top = `${rect.top - containerRect.top + rect.height / 2}px`;

    this.container.appendChild(glow);

    setTimeout(() => glow.remove(), 1000);
  }

  /**
   * Reset all indicators
   */
  resetIndicators() {
    this.indicators.forEach((ind) => {
      ind.classList.remove("active", "selected", "approaching", "pulse");
      ind.style.opacity = "1";
      ind.style.transform = "scale(1)";
      ind.style.filter = "none";
    });
  }

  /**
   * Dispatch selection event
   */
  dispatchSelectionEvent() {
    window.dispatchEvent(
      new CustomEvent("numberSelected", {
        detail: { number: this.selectedNumber },
      })
    );
  }

  // Utility functions
  delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  playSound(key) {
    // Sound implementation would go here
    console.log(`🔊 Playing sound: ${key}`);
  }

  stopSound(key) {
    // Sound implementation would go here
    console.log(`🔇 Stopping sound: ${key}`);
  }

  // Easing functions
  easeInExpo(t) {
    return t === 0 ? 0 : Math.pow(2, 10 * (t - 1));
  }

  easeOutCubic(t) {
    return 1 - Math.pow(1 - t, 3);
  }
}

// ========================================
// Class Roulette Class
// ========================================
class ClassRoulette {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.selectedClass = null;
    this.isAnimating = false;
    this.classBoxes = [];
    this.spotlightPosition = 0;
    this.animationFrameId = null;

    this.createUI();
    this.setupEventListeners();
  }

  /**
   * Create the class roulette UI
   */
  createUI() {
    if (!this.container) return;

    this.container.innerHTML = "";
    this.container.className = "class-roulette-container";

    // Create title
    const title = document.createElement("div");
    title.className = "roulette-title";
    title.innerHTML = "<h2>SELECT YOUR CLASS</h2>";
    this.container.appendChild(title);

    // Create class boxes container
    const boxesContainer = document.createElement("div");
    boxesContainer.className = "class-boxes";

    // Create boxes for each class
    CLASS_ROULETTE_CONFIG.classes.forEach((className) => {
      const box = document.createElement("div");
      box.className = "class-box";
      box.dataset.class = className;

      const color = CLASS_ROULETTE_CONFIG.colors[className];
      box.style.setProperty("--class-color", color.primary);
      box.style.setProperty("--class-glow", color.glow);

      box.innerHTML = `
                <div class="class-box-inner">
                    <div class="class-icon">${this.getClassIcon(
                      className
                    )}</div>
                    <div class="class-name">${className.toUpperCase()}</div>
                    <div class="class-description">${this.getClassDescription(
                      className
                    )}</div>
                </div>
                <div class="class-box-glow"></div>
                <div class="spotlight-effect"></div>
            `;

      boxesContainer.appendChild(box);
      this.classBoxes.push(box);
    });

    this.container.appendChild(boxesContainer);

    // Create spinning spotlight
    const spotlight = document.createElement("div");
    spotlight.className = "spinning-spotlight";
    this.container.appendChild(spotlight);

    // Create action button
    const buttonContainer = document.createElement("div");
    buttonContainer.className = "roulette-button-container";
    buttonContainer.innerHTML = `
            <button class="roulette-button" id="class-roulette-btn">
                <span class="button-text">SPIN FOR CLASS</span>
                <span class="button-glow"></span>
            </button>
        `;
    this.container.appendChild(buttonContainer);
  }

  /**
   * Get class icon
   */
  getClassIcon(className) {
    const icons = {
      Light: "⚡",
      Medium: "🛡️",
      Heavy: "💪",
    };
    return icons[className] || "❓";
  }

  /**
   * Get class description
   */
  getClassDescription(className) {
    const descriptions = {
      Light: "Fast & Agile",
      Medium: "Balanced & Versatile",
      Heavy: "Tanky & Powerful",
    };
    return descriptions[className] || "";
  }

  /**
   * Setup event listeners
   */
  setupEventListeners() {
    const button = document.getElementById("class-roulette-btn");
    if (button) {
      button.addEventListener("click", () => this.startRoulette());
    }

    // Allow clicking on boxes when not animating
    this.classBoxes.forEach((box) => {
      box.addEventListener("click", () => {
        if (!this.isAnimating) {
          this.selectClass(box.dataset.class);
        }
      });
    });
  }

  /**
   * Start the roulette animation
   */
  async startRoulette() {
    if (this.isAnimating) return;

    this.isAnimating = true;
    this.resetBoxes();

    // Play buildup sound
    this.playSound("buildup");

    // Run animation phases
    await this.runBuildup();
    await this.runSpotlightSpin();
    await this.runFinalReveal();

    this.isAnimating = false;

    // Stop buildup sound
    this.stopSound("buildup");

    // Dispatch selection event
    this.dispatchSelectionEvent();
  }

  /**
   * Buildup phase - create tension
   */
  async runBuildup() {
    return new Promise((resolve) => {
      const startTime = performance.now();
      const duration = CLASS_ROULETTE_CONFIG.animation.buildupTime;

      const animate = (currentTime) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);

        // Pulsing intensity increases
        const pulseSpeed = 1 + progress * 3;
        const pulseScale =
          1 + Math.sin(elapsed * pulseSpeed * 0.01) * 0.1 * progress;

        // Apply pulsing to all boxes
        this.classBoxes.forEach((box, index) => {
          box.style.transform = `scale(${pulseScale})`;

          // Rotating glow effect
          const glowIntensity = 0.3 + progress * 0.3;
          box.style.filter = `brightness(${1 + glowIntensity})`;
        });

        if (progress < 1) {
          this.animationFrameId = requestAnimationFrame(animate);
        } else {
          resolve();
        }
      };

      this.animationFrameId = requestAnimationFrame(animate);
    });
  }

  /**
   * Spotlight spinning phase
   */
  async runSpotlightSpin() {
    // Randomly select the winning class
    const randomIndex = Math.floor(
      Math.random() * CLASS_ROULETTE_CONFIG.classes.length
    );
    this.selectedClass = CLASS_ROULETTE_CONFIG.classes[randomIndex];

    return new Promise((resolve) => {
      const startTime = performance.now();
      const duration = 3000; // 3 seconds of spinning
      let currentBoxIndex = 0;
      let lastChangeTime = 0;

      const animate = (currentTime) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);

        // Speed varies over time (fast -> slow)
        const speedMultiplier = 1 - this.easeOutQuad(progress);
        const changeInterval =
          CLASS_ROULETTE_CONFIG.animation.spotlightSpeed *
          (1 + (1 - speedMultiplier) * 5);

        // Move spotlight
        if (currentTime - lastChangeTime > changeInterval) {
          // Remove spotlight from current
          this.classBoxes[currentBoxIndex].classList.remove("spotlighted");

          // Move to next
          currentBoxIndex = (currentBoxIndex + 1) % this.classBoxes.length;
          this.classBoxes[currentBoxIndex].classList.add("spotlighted");

          lastChangeTime = currentTime;

          // Play tick sound
          if (speedMultiplier > 0.2) {
            this.playSound("tick");
          }
        }

        // Ensure we end on the selected class
        if (progress > 0.9) {
          const targetIndex = CLASS_ROULETTE_CONFIG.classes.indexOf(
            this.selectedClass
          );
          if (currentBoxIndex !== targetIndex) {
            currentBoxIndex = targetIndex;
            this.classBoxes.forEach((box, i) => {
              box.classList.toggle("spotlighted", i === targetIndex);
            });
          }
        }

        if (progress < 1) {
          this.animationFrameId = requestAnimationFrame(animate);
        } else {
          resolve();
        }
      };

      this.animationFrameId = requestAnimationFrame(animate);
    });
  }

  /**
   * Final reveal with dramatic effect
   */
  async runFinalReveal() {
    // Clear all effects
    this.classBoxes.forEach((box) => {
      box.classList.remove("spotlighted");
      box.style.transform = "scale(1)";
      box.style.filter = "brightness(1)";
    });

    // Dramatic pause
    await this.delay(CLASS_ROULETTE_CONFIG.animation.finalReveal / 2);

    // Reveal the selected class
    this.selectClass(this.selectedClass);

    // Play reveal sound
    this.playSound("reveal");

    // Victory animation
    const selectedBox = this.classBoxes.find(
      (box) => box.dataset.class === this.selectedClass
    );
    if (selectedBox) {
      selectedBox.classList.add("selected", "victory");
      this.createClassVictoryEffect(selectedBox);
    }
  }

  /**
   * Select a specific class
   */
  selectClass(className) {
    this.selectedClass = className;

    // Update UI
    this.classBoxes.forEach((box) => {
      if (box.dataset.class === className) {
        box.classList.add("selected");
        box.style.transform = "scale(1.1)";
      } else {
        box.style.opacity = "0.3";
        box.style.filter = "grayscale(0.8)";
      }
    });

    // Update button
    const button = document.getElementById("class-roulette-btn");
    if (button) {
      button.innerHTML = `
                <span class="button-text">${className.toUpperCase()} SELECTED</span>
                <span class="button-glow"></span>
            `;
      button.disabled = true;
      button.style.setProperty(
        "--button-color",
        CLASS_ROULETTE_CONFIG.colors[className].primary
      );
    }
  }

  /**
   * Create victory effect for selected class
   */
  createClassVictoryEffect(element) {
    const color = CLASS_ROULETTE_CONFIG.colors[this.selectedClass];

    // Create expanding ring effect
    const ring = document.createElement("div");
    ring.className = "victory-ring";
    ring.style.setProperty("--ring-color", color.primary);

    const rect = element.getBoundingClientRect();
    const containerRect = this.container.getBoundingClientRect();

    ring.style.left = `${rect.left - containerRect.left + rect.width / 2}px`;
    ring.style.top = `${rect.top - containerRect.top + rect.height / 2}px`;

    this.container.appendChild(ring);

    setTimeout(() => ring.remove(), 1500);
  }

  /**
   * Reset all boxes
   */
  resetBoxes() {
    this.classBoxes.forEach((box) => {
      box.classList.remove("spotlighted", "selected", "victory");
      box.style.opacity = "1";
      box.style.transform = "scale(1)";
      box.style.filter = "none";
    });
  }

  /**
   * Dispatch selection event
   */
  dispatchSelectionEvent() {
    window.dispatchEvent(
      new CustomEvent("classSelected", {
        detail: { class: this.selectedClass },
      })
    );
  }

  // Utility functions
  delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  playSound(key) {
    // Sound implementation would go here
    console.log(`🔊 Playing sound: ${key}`);
  }

  stopSound(key) {
    // Sound implementation would go here
    console.log(`🔇 Stopping sound: ${key}`);
  }

  // Easing function
  easeOutQuad(t) {
    return t * (2 - t);
  }
}

// ========================================
// Selection Manager
// ========================================
class SelectionManager {
  constructor() {
    this.numberSelector = null;
    this.classRoulette = null;
    this.selectedNumber = null;
    this.selectedClass = null;
    this.onComplete = null;

    this.initialize();
  }

  /**
   * Initialize selectors
   */
  initialize() {
    // Setup event listeners for selections
    window.addEventListener("numberSelected", (e) => {
      this.selectedNumber = e.detail.number;
      console.log(`✅ Number selected: ${this.selectedNumber}`);

      // Transition to class selection
      this.transitionToClassSelection();
    });

    window.addEventListener("classSelected", (e) => {
      this.selectedClass = e.detail.class;
      console.log(`✅ Class selected: ${this.selectedClass}`);

      // Show spin button
      this.showSpinButton();
    });
  }

  /**
   * Start selection process
   */
  startSelection() {
    // Create number selector
    this.numberSelector = new NumberSelector("number-selector");

    // Hide class selector initially
    const classContainer = document.getElementById("class-roulette");
    if (classContainer) {
      classContainer.style.display = "none";
    }
  }

  /**
   * Transition to class selection
   */
  async transitionToClassSelection() {
    // Play transition sound
    this.playSound("transition");

    // Fade out number selector
    const numberContainer = document.getElementById("number-selector");
    if (numberContainer) {
      numberContainer.style.opacity = "0";
      await this.delay(500);
      numberContainer.style.display = "none";
    }

    // Show and fade in class selector
    const classContainer = document.getElementById("class-roulette");
    if (classContainer) {
      classContainer.style.display = "block";
      classContainer.style.opacity = "0";

      // Create class roulette
      this.classRoulette = new ClassRoulette("class-roulette");

      await this.delay(100);
      classContainer.style.opacity = "1";
    }
  }

  /**
   * Show the main spin button
   */
  showSpinButton() {
    // Create or show the main spin button
    const button = document.getElementById("main-spin-btn");
    if (button) {
      button.style.display = "block";
      button.classList.add("ready");
      button.innerHTML = `
                <span class="spin-text">SPIN ${
                  this.selectedNumber
                }x ${this.selectedClass.toUpperCase()}</span>
                <span class="spin-glow"></span>
            `;

      button.onclick = () => {
        if (this.onComplete) {
          this.onComplete({
            spins: this.selectedNumber,
            class: this.selectedClass,
          });
        }
      };
    }
  }

  /**
   * Reset selections
   */
  reset() {
    this.selectedNumber = null;
    this.selectedClass = null;

    // Reset UI
    const numberContainer = document.getElementById("number-selector");
    const classContainer = document.getElementById("class-roulette");
    const spinButton = document.getElementById("main-spin-btn");

    if (numberContainer) {
      numberContainer.style.display = "block";
      numberContainer.style.opacity = "1";
    }

    if (classContainer) {
      classContainer.style.display = "none";
    }

    if (spinButton) {
      spinButton.style.display = "none";
    }

    // Reinitialize
    this.startSelection();
  }

  // Utility functions
  delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  playSound(key) {
    console.log(`🔊 Playing sound: ${key}`);
  }
}

// ========================================
// Export for use
// ========================================
window.NumberSelector = NumberSelector;
window.ClassRoulette = ClassRoulette;
window.SelectionManager = SelectionManager;
