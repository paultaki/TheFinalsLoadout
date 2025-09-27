// Rage Quit Roulette Animation System with Realistic Wheel Physics
class RageRouletteAnimationSystem {
  constructor() {
    this.classOptions = ["Light", "Medium", "Heavy"];
    this.spinOptions = [1, 2, 3, 4, 5];
    this.selectedClass = null;
    this.selectedSpins = null;
    this.selectedHandicap = null;
    this.selectedHandicapDesc = null;
    this.animating = false;
    
    // Initialize realistic roulette wheel
    this.rouletteWheel = null;
    this.useRealisticWheel = false; // Disabled - use original animation for rage quit

    // Animation timing configurations (exact copy from main page)
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

    // New handicap animation config
    this.handicapAnimationConfig = {
      initialSpeed: 50,
      finalSpeed: 700,
      totalDuration: 2500,
      decelerationStart: 0.4,
    };
  }

  // Main entry point for the full animation sequence
  async startFullSequence() {
    if (this.animating) {
      console.log("⚠️ Animation already in progress, skipping");
      return;
    }

    console.log("🎬 Starting full animation sequence");
    this.animating = true;

    // Hide main UI elements (check if they exist first)
    const rageButtonContainer = document.querySelector(".rage-button-container");
    if (rageButtonContainer) rageButtonContainer.style.display = "none";
    
    const outputElement = document.getElementById("output");
    if (outputElement) outputElement.style.display = "none";
    
    const handicapSection = document.querySelector(".handicap-section");
    if (handicapSection) handicapSection.style.display = "none";
    
    const doubleOrNothingContainer = document.getElementById("double-or-nothing-container");
    if (doubleOrNothingContainer) doubleOrNothingContainer.style.display = "none";

    // Show roulette container
    console.log("🔍 Looking for rage-roulette-container...");
    const rouletteContainer = document.getElementById("rage-roulette-container");
    console.log("🔍 Rage roulette container found:", !!rouletteContainer);
    console.log("🔍 Container element:", rouletteContainer);
    
    if (!rouletteContainer) {
      console.error("❌ Rage roulette container not found!");
      console.log("🔍 Available containers:", Array.from(document.querySelectorAll('[id*="roulette"]')));
      console.log("🔍 All elements with 'rage' in id:", Array.from(document.querySelectorAll('[id*="rage"]')));
      console.log("🔍 All containers:", Array.from(document.querySelectorAll('div')).filter(el => el.id).map(el => el.id));
      this.animating = false;
      throw new Error("Rage roulette container not found - check HTML");
    }

    // Show container by removing hidden class
    rouletteContainer.classList.remove("hidden");

    // Force container visible with inline styles
    console.log("FORCING RAGE ROULETTE CONTAINER VISIBLE");
    rouletteContainer.style.display = "flex";
    rouletteContainer.style.visibility = "visible";
    rouletteContainer.style.opacity = "1";
    rouletteContainer.style.position = "fixed";
    rouletteContainer.style.top = "0";
    rouletteContainer.style.left = "0";
    rouletteContainer.style.width = "100vw";
    rouletteContainer.style.height = "100vh";
    rouletteContainer.style.zIndex = "999999";
    rouletteContainer.style.background = "rgba(139, 0, 0, 0.95)"; // Dark red for rage theme

    // Debug container visibility
    console.log("Rage roulette container visibility check:", {
      element: rouletteContainer,
      hasHiddenClass: rouletteContainer.classList.contains("hidden"),
      computedDisplay: window.getComputedStyle(rouletteContainer).display,
      computedVisibility: window.getComputedStyle(rouletteContainer).visibility,
      computedOpacity: window.getComputedStyle(rouletteContainer).opacity,
      computedZIndex: window.getComputedStyle(rouletteContainer).zIndex,
    });

    // Prevent body scrolling during animation
    document.body.style.overflow = "hidden";

    try {
      // Phase 1: Class Selection with Realistic Roulette Wheel
      console.log("🎬 Phase 1: Class Selection");
      if (this.useRealisticWheel && window.RealisticRouletteWheel) {
        await this.animateRealisticClassSelection();
      } else {
        await this.animateClassSelection();
      }

      // Brief pause between phases
      await this.delay(500);

      // Phase 2: Spin Count Selection
      console.log("🎬 Phase 2: Spin Count Selection");
      await this.animateSpinSelection();

      // Brief pause before handicap selection
      await this.delay(500);

      // Phase 3: Handicap Selection (NEW for rage quit)
      console.log("🎬 Phase 3: Handicap Selection");
      await this.animateHandicapSelection();

      // Brief pause before starting the actual slot machine
      await this.delay(500);
    } catch (error) {
      console.error("❌ Error during animation phases:", error);
      this.animating = false;
      throw error;
    }

    // Hide roulette container
    rouletteContainer.classList.add("hidden");
    rouletteContainer.style.display = "none";

    // Restore body scrolling
    document.body.style.overflow = "";

    // Show selection display
    this.showSelectionDisplay();

    // Show the main container and output (check if they exist first)
    const rageButtonContainer2 = document.querySelector(".rage-button-container");
    if (rageButtonContainer2) rageButtonContainer2.style.display = "flex";
    
    const outputElement2 = document.getElementById("output");
    if (outputElement2) outputElement2.style.display = "flex";
    
    const handicapSection2 = document.querySelector(".handicap-section");
    if (handicapSection2) handicapSection2.style.display = "block";

    // Set the state for the original system
    if (window.state) {
      window.state.selectedClass = this.selectedClass;
      window.state.totalSpins = this.selectedSpins;
      window.state.selectedHandicap = this.selectedHandicap;
      window.state.selectedHandicapDesc = this.selectedHandicapDesc;
    }

    // Also set in rageState directly
    if (window.rageState) {
      window.rageState.selectedClass = this.selectedClass;
      window.rageState.totalSpins = this.selectedSpins;
      window.rageState.selectedHandicap = this.selectedHandicap;
      window.rageState.selectedHandicapDesc = this.selectedHandicapDesc;
    }

    console.log('🎯 State transfer complete:', {
      handicap: this.selectedHandicap,
      desc: this.selectedHandicapDesc,
      windowState: window.state,
      rageState: window.rageState
    });

    this.animating = false;

    // Trigger the original spin mechanism
    window.spinRageQuitLoadout();
  }

  // Animate class selection roulette (EXACT COPY from main page, with rage styling)
  async animateClassSelection() {
    try {
      console.log("🎯 Starting class selection animation");
      // Create a completely new DOM structure that we control
    const animationContainer = document.createElement("div");
    animationContainer.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background: rgba(139, 0, 0, 0.95);
    z-index: 999999;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
  `;

    // Create the class selection UI from scratch
    const title = document.createElement("h2");
    title.textContent = "SELECTING YOUR DOOM...";
    title.style.cssText = `
    font-size: clamp(28px, 8vw, 48px);
    font-weight: 900;
    letter-spacing: clamp(2px, 2vw, 8px);
    margin-bottom: clamp(20px, 8vw, 50px);
    color: #ff4444;
    text-shadow: 0 0 20px rgba(255, 68, 68, 0.8);
    text-align: center;
    padding: 0 20px;
  `;

    const wheel = document.createElement("div");
    wheel.style.cssText = `
    display: flex;
    justify-content: center;
    gap: clamp(10px, 5vw, 40px);
    height: 300px;
    align-items: center;
    padding: 0 20px;
    box-sizing: border-box;
  `;

    // Create class options
    const classes = ["Light", "Medium", "Heavy"];
    const classElements = [];

    classes.forEach((className, index) => {
      const option = document.createElement("div");
      option.style.cssText = `
      width: clamp(120px, 25vw, 200px);
      height: clamp(150px, 30vw, 250px);
      max-width: 200px;
      background: linear-gradient(135deg, #2e1a1a, #4e2a2a);
      border-radius: 20px;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      transition: all 0.3s ease;
      opacity: 0.5;
      transform: scale(0.8);
      border: 2px solid #660000;
    `;

      const img = document.createElement("img");
      img.src = `https://thefinalsloadout.com/images/${className.toLowerCase()}_active.webp`;
      img.style.cssText = `
      width: clamp(60px, 15vw, 120px);
      height: clamp(60px, 15vw, 120px);
      margin-bottom: clamp(10px, 3vw, 20px);
      filter: brightness(0.5) sepia(1) hue-rotate(320deg);
      object-fit: contain;
      image-rendering: -webkit-optimize-contrast;
      image-rendering: crisp-edges;
    `;

      const label = document.createElement("span");
      label.textContent = className.toUpperCase();
      label.style.cssText = `
      font-size: clamp(16px, 4vw, 24px);
      font-weight: 700;
      letter-spacing: clamp(1px, 0.5vw, 3px);
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
    
    // Append to the rage-roulette-container instead of body
    const rouletteContainer = document.getElementById("rage-roulette-container");
    if (rouletteContainer) {
      rouletteContainer.appendChild(animationContainer);
    } else {
      document.body.appendChild(animationContainer);
    }

    // Now run the animation (EXACT SAME LOGIC as main page)
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
              el.style.boxShadow = "0 0 50px rgba(255, 68, 68, 0.8)";
              el.querySelector("img").style.filter = "brightness(1.2) sepia(1) hue-rotate(320deg)";
              el.querySelector("span").style.opacity = "1";
            }
          });

          this.playClassWinSound();

          setTimeout(() => {
            // Remove from the correct parent
            if (animationContainer.parentNode) {
              animationContainer.parentNode.removeChild(animationContainer);
            }
            resolve();
          }, 500);
          return;
        }

        // Update active state
        classElements.forEach((el, idx) => {
          if (idx === currentIndex) {
            el.style.opacity = "1";
            el.style.transform = "scale(1.1)";
            el.querySelector("img").style.filter = "brightness(1) sepia(1) hue-rotate(320deg)";
            el.querySelector("span").style.opacity = "1";
          } else {
            el.style.opacity = "0.5";
            el.style.transform = "scale(0.8)";
            el.querySelector("img").style.filter = "brightness(0.5) sepia(1) hue-rotate(320deg)";
            el.querySelector("span").style.opacity = "0.5";
          }
        });

        this.playTickSound();

        // Calculate speed (EXACT SAME as main page)
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
    } catch (error) {
      console.error("❌ Error in class selection animation:", error);
      throw error;
    }
  }

  // Animate spin count selection (EXACT COPY from main page, with rage styling)
  async animateSpinSelection() {
    // Create a completely new DOM structure
    const animationContainer = document.createElement("div");
    animationContainer.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background: rgba(139, 0, 0, 0.95);
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
    color: #ff4444;
    text-shadow: 0 0 20px rgba(255, 68, 68, 0.8);
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
      background: linear-gradient(135deg, #2e1a1a, #4e2a2a);
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
      border: 2px solid #660000;
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
    color: #ff6666;
    text-shadow: 0 0 10px rgba(255, 102, 102, 0.8);
    min-height: 30px;
  `;

    animationContainer.appendChild(title);
    animationContainer.appendChild(wheel);
    animationContainer.appendChild(statusEl);
    
    // Append to the rage-roulette-container instead of body
    const rouletteContainer = document.getElementById("rage-roulette-container");
    if (rouletteContainer) {
      rouletteContainer.appendChild(animationContainer);
    } else {
      document.body.appendChild(animationContainer);
    }

    // Animation logic (EXACT SAME as main page)
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
            "0 0 40px rgba(255, 68, 68, 0.8)";

          this.playSpinWinSound();
          statusEl.textContent = `${this.selectedSpins} SPIN${
            this.selectedSpins > 1 ? "S" : ""
          } SELECTED!`;

          setTimeout(() => {
            if (animationContainer.parentNode) {
              animationContainer.parentNode.removeChild(animationContainer);
            };
            resolve();
          }, 500);
          return;
        }

        // Update active state
        try {
          spinElements.forEach((el, idx) => {
            if (idx === currentIndex) {
              el.style.opacity = "1";
              el.style.transform = "scale(1.2)";
              el.style.background = "linear-gradient(135deg, #b83e3e, #ff4444)";
              
              // Create particle effect (less frequent to avoid overwhelming)
              if (elapsed % 200 < 50) { // Reduced frequency
                this.createParticleEffect(el);
              }
            } else {
              el.style.opacity = "0.5";
              el.style.transform = "scale(0.8)";
              el.style.background = "linear-gradient(135deg, #2e1a1a, #4e2a2a)";
            }
          });
        } catch (styleError) {
          console.warn('Style update error:', styleError);
        }

        try {
          this.playTickSound();
        } catch (soundError) {
          console.warn('Sound error:', soundError);
        }

        try {
          // Calculate speed (EXACT SAME as main page)
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

          // Ensure speed is within reasonable bounds
          speed = Math.max(10, Math.min(1000, speed));
          
          setTimeout(animate, speed);
        } catch (animationError) {
          console.error('Animation error:', animationError);
          // Fallback: complete the animation
          try {
            spinElements[winnerIndex].style.opacity = "1";
            spinElements[winnerIndex].style.transform = "scale(1.2)";
            statusEl.textContent = `${this.selectedSpins} SPIN${this.selectedSpins > 1 ? "S" : ""} SELECTED!`;
            setTimeout(() => {
              if (animationContainer.parentNode) {
                if (animationContainer.parentNode) {
              animationContainer.parentNode.removeChild(animationContainer);
            };
              }
              resolve();
            }, 500);
          } catch (fallbackError) {
            console.error('Fallback error:', fallbackError);
            resolve(); // Just resolve to continue
          }
        }
      };

      animate();
    });
  }

  // Animate handicap selection with rotating animation like class selection
  async animateHandicapSelection() {
    console.log("🎯 Starting handicap selection animation");

    // List of handicaps with descriptions
    const handicaps = [
      { name: "ADS Only", desc: "Can only use ADS (Aim Down Sights)" },
      { name: "No Healing", desc: "Cannot use healing items or abilities" },
      { name: "Inverted Controls", desc: "Mouse movement is inverted" },
      { name: "Sloth Mode", desc: "No sprinting - must walk everywhere" },
      { name: "Bunny Hop Ban", desc: "No jumping - stairs and ramps only" },
      { name: "Squirrel Mode", desc: "Max out your mouse DPI/sensitivity" },
      { name: "Snail Aim", desc: "Set sensitivity to the lowest value" },
      { name: "Reload Addict", desc: "Must reload after every kill or 3 shots" },
      { name: "Permanent Crouch", desc: "Must stay crouched the entire game" },
      { name: "Silent Treatment", desc: "Play with all audio muted" },
      { name: "One Life", desc: "No respawning - death ends the round" },
      { name: "Melee Only", desc: "Can only use melee weapons" },
      { name: "Backwards Mode", desc: "Can only move backwards" },
      { name: "No Minimap", desc: "Cover your minimap completely" },
      { name: "Pacifist Run", desc: "Win without eliminating anyone" },
      { name: "Blind Spots", desc: "Cover corners of your screen" },
      { name: "Wrong Hand", desc: "Use opposite hand for mouse/controller" },
      { name: "No Cover", desc: "Cannot hide behind objects" },
      { name: "Panic Mode", desc: "Must constantly move - no standing still" }
    ];

    // Create animation container
    const animationContainer = document.createElement("div");
    animationContainer.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background: rgba(139, 0, 0, 0.95);
      z-index: 999999;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
    `;

    // Create title
    const title = document.createElement("h2");
    title.textContent = "CHOOSING YOUR HANDICAP...";
    title.style.cssText = `
      font-size: clamp(28px, 8vw, 48px);
      font-weight: 900;
      letter-spacing: clamp(2px, 2vw, 8px);
      margin-bottom: clamp(20px, 8vw, 50px);
      color: #ff4444;
      text-shadow: 0 0 20px rgba(255, 68, 68, 0.8);
      text-align: center;
      padding: 0 20px;
    `;

    // Create handicap display
    const handicapDisplay = document.createElement("div");
    handicapDisplay.style.cssText = `
      background: rgba(0, 0, 0, 0.5);
      border: 3px solid #ff4444;
      border-radius: 15px;
      padding: 2rem 3rem;
      min-width: 300px;
      max-width: 600px;
      text-align: center;
      box-shadow: 0 0 30px rgba(255, 68, 68, 0.5);
      transition: all 0.3s ease;
    `;

    const handicapName = document.createElement("h3");
    handicapName.style.cssText = `
      color: #ff6666;
      font-size: 2rem;
      margin-bottom: 1rem;
      font-weight: 900;
      letter-spacing: 2px;
      text-shadow: 0 0 10px rgba(255, 102, 102, 0.8);
    `;

    const handicapDesc = document.createElement("p");
    handicapDesc.style.cssText = `
      color: #ffaaaa;
      font-size: 1.2rem;
      font-style: italic;
      opacity: 0.9;
    `;

    handicapDisplay.appendChild(handicapName);
    handicapDisplay.appendChild(handicapDesc);

    animationContainer.appendChild(title);
    animationContainer.appendChild(handicapDisplay);

    // Append to roulette container or body
    const rouletteContainer = document.getElementById("rage-roulette-container");
    if (rouletteContainer) {
      rouletteContainer.appendChild(animationContainer);
    } else {
      document.body.appendChild(animationContainer);
    }

    // Animation logic
    let currentIndex = 0;
    const startTime = Date.now();
    const winnerIndex = Math.floor(Math.random() * handicaps.length);
    this.selectedHandicap = handicaps[winnerIndex].name;
    this.selectedHandicapDesc = handicaps[winnerIndex].desc;

    return new Promise((resolve) => {
      const animate = () => {
        const elapsed = Date.now() - startTime;

        if (elapsed >= this.handicapAnimationConfig.totalDuration) {
          // Final selection
          handicapName.textContent = "💀 " + this.selectedHandicap + " 💀";
          handicapDesc.textContent = this.selectedHandicapDesc;
          handicapDisplay.style.transform = "scale(1.1)";
          handicapDisplay.style.boxShadow = "0 0 50px rgba(255, 68, 68, 0.8)";

          this.playClassWinSound();

          setTimeout(() => {
            if (animationContainer.parentNode) {
              animationContainer.parentNode.removeChild(animationContainer);
            }
            console.log("✅ Handicap selection complete");
            resolve();
          }, 1000);
          return;
        }

        // Update current handicap
        handicapName.textContent = handicaps[currentIndex].name;
        handicapDesc.textContent = handicaps[currentIndex].desc;

        // Play tick sound
        this.playTickSound();

        // Calculate speed with deceleration
        const progress = elapsed / this.handicapAnimationConfig.totalDuration;
        let speed = this.handicapAnimationConfig.initialSpeed;

        if (progress > this.handicapAnimationConfig.decelerationStart) {
          const decelerationProgress =
            (progress - this.handicapAnimationConfig.decelerationStart) /
            (1 - this.handicapAnimationConfig.decelerationStart);
          speed =
            this.handicapAnimationConfig.initialSpeed +
            (this.handicapAnimationConfig.finalSpeed -
              this.handicapAnimationConfig.initialSpeed) *
              Math.pow(decelerationProgress, 2);
        }

        // Make sure we land on the winner in the last 500ms
        if (elapsed >= this.handicapAnimationConfig.totalDuration - 500) {
          currentIndex = winnerIndex;
        } else {
          currentIndex = (currentIndex + 1) % handicaps.length;
        }

        setTimeout(animate, speed);
      };

      // Start the animation
      animate();
    });
  }

  // Visual effects (EXACT COPY from main page)
  createFlashEffect() {
    const flash = document.createElement("div");
    flash.className = "flash-overlay";
    document.body.appendChild(flash);
    setTimeout(() => flash.remove(), 500);
  }

  createParticleEffect(element) {
    try {
      const rect = element.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      // Reduce particle count for performance
      const particleCount = 4; // Fixed count to avoid crashes

      for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement("div");
        particle.style.cssText = `
          position: fixed;
          width: 4px;
          height: 4px;
          background: #ff4444;
          border-radius: 50%;
          pointer-events: none;
          z-index: 1000001;
          left: ${centerX}px;
          top: ${centerY}px;
          box-shadow: 0 0 6px rgba(255, 68, 68, 0.8);
        `;

        // Random direction
        const angle = (Math.PI * 2 * i) / particleCount + (Math.random() - 0.5) * 0.5;
        const distance = 60 + Math.random() * 80;
        const targetX = centerX + Math.cos(angle) * distance;
        const targetY = centerY + Math.sin(angle) * distance;

        document.body.appendChild(particle);

        // Animate the particle with error handling
        try {
          const animation = particle.animate([
            {
              transform: 'translate(0, 0) scale(1)',
              opacity: 1
            },
            {
              transform: `translate(${targetX - centerX}px, ${targetY - centerY}px) scale(0)`,
              opacity: 0
            }
          ], {
            duration: 800,
            easing: 'ease-out'
          });

          animation.onfinish = () => {
            try {
              if (particle && particle.parentNode) {
                particle.parentNode.removeChild(particle);
              }
            } catch (e) {
              console.warn('Particle cleanup error:', e);
            }
          };
        } catch (animError) {
          // Fallback: just remove the particle after a timeout
          setTimeout(() => {
            try {
              if (particle && particle.parentNode) {
                particle.parentNode.removeChild(particle);
              }
            } catch (e) {
              console.warn('Particle timeout cleanup error:', e);
            }
          }, 800);
        }
      }
    } catch (error) {
      console.warn('Particle effect error:', error);
      // Continue without particles
    }
  }

  // NEW: Create skull particles for handicap effect
  createSkullParticleEffect(element) {
    try {
      const rect = element.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      for (let i = 0; i < 2; i++) { // Reduced count
        const skull = document.createElement("div");
        skull.textContent = "💀";
        skull.style.cssText = `
          position: fixed;
          font-size: 16px;
          pointer-events: none;
          z-index: 1000001;
          left: ${centerX}px;
          top: ${centerY}px;
        `;

        const angle = (Math.PI * 2 * i) / 2;
        const distance = 40 + Math.random() * 60;
        const targetX = centerX + Math.cos(angle) * distance;
        const targetY = centerY + Math.sin(angle) * distance;

        document.body.appendChild(skull);

        try {
          skull.animate([
            { transform: 'translate(0, 0)', opacity: 1 },
            { transform: `translate(${targetX - centerX}px, ${targetY - centerY}px)`, opacity: 0 }
          ], {
            duration: 1000,
            easing: 'ease-out'
          }).onfinish = () => {
            try {
              if (skull && skull.parentNode) {
                skull.remove();
              }
            } catch (e) {
              console.warn('Skull cleanup error:', e);
            }
          };
        } catch (animError) {
          // Fallback cleanup
          setTimeout(() => {
            try {
              if (skull && skull.parentNode) {
                skull.remove();
              }
            } catch (e) {
              console.warn('Skull timeout cleanup error:', e);
            }
          }, 1000);
        }
      }
    } catch (error) {
      console.warn('Skull particle effect error:', error);
    }
  }

  // Sound effects (adapted for rage theme)
  playTickSound() {
    // Check if sound is enabled
    if (!this.isSoundEnabled()) return;

    // Create a tick sound using Web Audio API or play an audio file
    const audio = document.getElementById("rageBuzzerSound");
    if (
      (audio && !this._lastTickTime) ||
      Date.now() - this._lastTickTime > 30
    ) {
      this._lastTickTime = Date.now();
      audio.currentTime = 0;
      audio.volume = 0.1;
      audio.playbackRate = 3.0;
      audio.play().catch(() => {});
    }
  }

  playClassWinSound() {
    if (!this.isSoundEnabled()) return;

    const audio = document.getElementById("rageAlarmSound");
    if (audio) {
      audio.currentTime = 0;
      audio.volume = 0.3;
      audio.play().catch(() => {});
    }
  }

  playSpinWinSound() {
    if (!this.isSoundEnabled()) return;

    const audio = document.getElementById("rageBuzzerSound");
    if (audio) {
      audio.currentTime = 0;
      audio.volume = 0.4;
      audio.play().catch(() => {});
    }
  }

  playHandicapWinSound() {
    if (!this.isSoundEnabled()) return;

    const audio = document.getElementById("rageLaughSound");
    if (audio) {
      audio.currentTime = 0;
      audio.volume = 0.5;
      audio.play().catch(() => {});
    }
  }

  isSoundEnabled() {
    const soundToggle = document.getElementById('rage-sound-toggle');
    return !soundToggle?.classList.contains('muted');
  }

  // Show selection display (adapted for rage theme)
  showSelectionDisplay() {
    const selectedClassElement = document.getElementById("selected-class");
    if (selectedClassElement) {
      selectedClassElement.textContent = 
        `${this.selectedClass.toUpperCase()} • ${this.selectedSpins} SPINS • ${this.selectedHandicap}`;
      selectedClassElement.style.color = "#ff4444";
    }

    // Update handicap display instead of showing banner
    this.updateHandicapDisplay();
  }

  // Update handicap display in the box below slot machine
  updateHandicapDisplay() {
    const handicapContainer = document.querySelector('#handicap-container');
    if (!handicapContainer) return;

    const handicapHTML = `
      <div class="handicap-display">
        <h3>Selected Handicap</h3>
        <div class="handicap-name">${this.selectedHandicap}</div>
        <div class="handicap-desc">${this.selectedHandicapDesc}</div>
      </div>
    `;
    handicapContainer.innerHTML = handicapHTML;
  }

  // NEW: Animate class selection with realistic roulette wheel
  async animateRealisticClassSelection() {
    try {
      console.log('🎯 Starting realistic roulette wheel for class selection');
      
      // Create container for roulette wheel
      const animationContainer = document.createElement("div");
      animationContainer.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        background: rgba(139, 0, 0, 0.95);
        z-index: 999999;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
      `;
      
      // Title
      const title = document.createElement("h2");
      title.textContent = "SPINNING THE WHEEL OF DOOM...";
      title.style.cssText = `
        font-size: clamp(28px, 8vw, 48px);
        font-weight: 900;
        letter-spacing: clamp(2px, 2vw, 8px);
        margin-bottom: 20px;
        color: #ff4444;
        text-shadow: 0 0 20px rgba(255, 68, 68, 0.8);
        text-align: center;
        padding: 0 20px;
      `;
      
      // Roulette wheel container
      const wheelContainer = document.createElement("div");
      wheelContainer.id = "realistic-roulette-wheel";
      wheelContainer.style.cssText = `
        width: 500px;
        height: 500px;
        max-width: 90vw;
        max-height: 60vh;
      `;
      
      animationContainer.appendChild(title);
      animationContainer.appendChild(wheelContainer);
      
      // Append to the rage-roulette-container instead of body
      const rouletteContainer = document.getElementById("rage-roulette-container");
      if (rouletteContainer) {
        rouletteContainer.appendChild(animationContainer);
      } else {
        document.body.appendChild(animationContainer);
      }
      
      // Initialize realistic roulette wheel
      this.rouletteWheel = new window.RealisticRouletteWheel();
      this.rouletteWheel.init('realistic-roulette-wheel');
      
      // Wait for wheel to be ready
      await this.delay(500);
      
      // Set up result listener
      return new Promise((resolve) => {
        const handleResult = (event) => {
          const { pocket, result } = event.detail;
          console.log('🎰 Roulette result:', pocket, result);
          
          // Map pocket to class (0-12: Light, 13-24: Medium, 25-36: Heavy)
          if (pocket === 0) {
            // Special case - random class
            this.selectedClass = this.classOptions[Math.floor(Math.random() * 3)];
          } else if (pocket <= 12) {
            this.selectedClass = 'Light';
          } else if (pocket <= 24) {
            this.selectedClass = 'Medium';
          } else {
            this.selectedClass = 'Heavy';
          }
          
          console.log(`🎲 Selected class: ${this.selectedClass}`);
          
          // Show result briefly
          title.textContent = `${this.selectedClass.toUpperCase()} CLASS SELECTED!`;
          title.style.color = '#ffd700';
          
          // Cleanup
          setTimeout(() => {
            document.removeEventListener('rouletteComplete', handleResult);
            if (this.rouletteWheel) {
              this.rouletteWheel.destroy();
              this.rouletteWheel = null;
            }
            if (animationContainer.parentNode) {
              animationContainer.parentNode.removeChild(animationContainer);
            };
            resolve();
          }, 1500);
        };
        
        document.addEventListener('rouletteComplete', handleResult);
        
        // Start the wheel spin
        setTimeout(() => {
          this.rouletteWheel.spin();
        }, 100);
      });
      
    } catch (error) {
      console.error('❌ Error in realistic class selection:', error);
      // Fallback to simple animation
      return this.animateClassSelection();
    }
  }
  
  // Utility
  delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

// Export for use in main app.js
window.RageRouletteAnimationSystem = RageRouletteAnimationSystem;