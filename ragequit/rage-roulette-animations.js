// Rage Quit Roulette Animation System
class RageRouletteAnimationSystem {
  constructor() {
    this.classOptions = ["Light", "Medium", "Heavy"];
    this.spinOptions = [1, 2, 3, 4, 5];
    this.selectedClass = null;
    this.selectedSpins = null;
    this.animating = false;

    // Animation timing configurations (faster for rage mode)
    this.classAnimationConfig = {
      initialSpeed: 30, // Faster initial speed
      finalSpeed: 800,
      totalDuration: 2500, // Shorter duration
      decelerationStart: 0.3,
    };

    this.spinAnimationConfig = {
      initialSpeed: 30,
      finalSpeed: 600,
      totalDuration: 1500, // Even shorter
      decelerationStart: 0.4,
    };
  }

  // Main entry point for the full animation sequence
  async startFullSequence() {
    if (this.animating) return;

    this.animating = true;

    // Hide main UI elements
    document.querySelector(".rage-button-container").style.display = "none";
    document.getElementById("output").style.display = "none";
    document.querySelector(".handicap-section").style.display = "none";

    // Show roulette container
    const rouletteContainer = document.getElementById("rage-roulette-container");
    if (!rouletteContainer) {
      console.error("Rage roulette container not found!");
      return;
    }

    // Show container
    rouletteContainer.classList.remove("hidden");
    rouletteContainer.style.display = "flex";
    rouletteContainer.style.visibility = "visible";
    rouletteContainer.style.opacity = "1";

    // Play alarm sound
    this.playAlarmSound();

    // Run class selection
    await this.animateClassSelection();
    
    // Short pause
    await this.delay(500);
    
    // Run spin count selection
    await this.animateSpinSelection();
    
    // Short pause before revealing
    await this.delay(300);

    // Hide roulette and show results
    rouletteContainer.style.display = "none";
    document.querySelector(".rage-button-container").style.display = "flex";
    document.getElementById("output").style.display = "block";
    document.querySelector(".handicap-section").style.display = "block";

    // Update the selected class display
    document.getElementById("selected-class").textContent = this.selectedClass.toUpperCase();

    // Set the state for the original system
    window.state.selectedClass = this.selectedClass;
    window.state.totalSpins = this.selectedSpins;

    this.animating = false;

    // Trigger the original spin mechanism
    window.spinRageQuitLoadout();
  }

  // Animate class selection roulette
  async animateClassSelection() {
    const classRouletteSection = document.getElementById("rage-class-roulette");
    classRouletteSection.classList.remove("hidden");

    const classOptions = document.querySelectorAll(".rage-class-option");
    const config = this.classAnimationConfig;

    // Pick a random class
    const targetIndex = Math.floor(Math.random() * this.classOptions.length);
    this.selectedClass = this.classOptions[targetIndex];

    // Calculate total cycles for dramatic effect
    const totalCycles = 15 + targetIndex;

    await this.animateRoulette(classOptions, totalCycles, config);

    // Add punishment effect on selection
    this.addPunishmentEffect();

    classRouletteSection.classList.add("hidden");
  }

  // Animate spin count selection
  async animateSpinSelection() {
    const spinRouletteSection = document.getElementById("rage-spin-roulette");
    spinRouletteSection.classList.remove("hidden");

    const spinOptions = document.querySelectorAll(".rage-spin-option");
    const config = this.spinAnimationConfig;

    // Pick a random spin count (biased towards higher numbers for more pain)
    const weights = [1, 2, 3, 4, 5]; // Higher numbers more likely
    const totalWeight = weights.reduce((a, b) => a + b, 0);
    let random = Math.random() * totalWeight;
    let targetIndex = 0;
    
    for (let i = 0; i < weights.length; i++) {
      random -= weights[i];
      if (random <= 0) {
        targetIndex = i;
        break;
      }
    }

    this.selectedSpins = this.spinOptions[targetIndex];

    // Calculate total cycles
    const totalCycles = 12 + targetIndex;

    await this.animateRoulette(spinOptions, totalCycles, config);

    spinRouletteSection.classList.add("hidden");
  }

  // Generic roulette animation function
  async animateRoulette(options, totalCycles, config) {
    const startTime = Date.now();
    let currentIndex = 0;

    // Clear all active states
    options.forEach(opt => opt.classList.remove("active"));

    return new Promise((resolve) => {
      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / config.totalDuration, 1);

        // Calculate current speed with easing
        let speedMultiplier = 1;
        if (progress > config.decelerationStart) {
          const decelerationProgress = (progress - config.decelerationStart) / (1 - config.decelerationStart);
          speedMultiplier = 1 + (decelerationProgress * decelerationProgress) * 20;
        }

        const currentSpeed = config.initialSpeed * speedMultiplier;

        // Remove previous active class
        options.forEach(opt => opt.classList.remove("active"));

        // Add active class to current option
        const currentOption = options[currentIndex % options.length];
        currentOption.classList.add("active");

        // Check if we should continue
        const cyclesCompleted = Math.floor(currentIndex / options.length);
        
        if (cyclesCompleted >= totalCycles && currentIndex % options.length === totalCycles % options.length) {
          // Final selection - add rage effects
          currentOption.classList.add("selected");
          resolve();
        } else {
          currentIndex++;
          setTimeout(() => animate(), currentSpeed);
        }
      };

      animate();
    });
  }

  // Add punishment visual effects
  addPunishmentEffect() {
    // Screen shake
    document.body.classList.add("rage-shake");
    setTimeout(() => document.body.classList.remove("rage-shake"), 500);

    // Red flash
    const flash = document.createElement("div");
    flash.className = "rage-flash";
    document.body.appendChild(flash);
    setTimeout(() => flash.remove(), 600);

    // Add skull particles
    this.createSkullParticles();
  }

  // Create skull/fire particles
  createSkullParticles() {
    const particlesContainer = document.createElement("div");
    particlesContainer.className = "rage-particles-container";
    document.body.appendChild(particlesContainer);

    for (let i = 0; i < 20; i++) {
      setTimeout(() => {
        const particle = document.createElement("div");
        particle.className = "rage-particle";
        particle.innerHTML = Math.random() > 0.5 ? "💀" : "🔥";
        particle.style.left = Math.random() * 100 + "%";
        particle.style.animationDelay = Math.random() * 0.5 + "s";
        particlesContainer.appendChild(particle);
      }, i * 50);
    }

    setTimeout(() => particlesContainer.remove(), 3000);
  }

  // Play alarm/warning sounds
  playAlarmSound() {
    const audio = new Audio('sounds/glitch.mp3');
    audio.volume = 0.5;
    audio.play().catch(e => console.log("Could not play alarm sound"));
  }

  // Utility delay function
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Make it globally available
window.RageRouletteAnimationSystem = RageRouletteAnimationSystem;