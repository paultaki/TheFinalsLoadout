/**
 * Automated Single-Button Flow System
 * 6-second thrill ride from click to loadout
 */

// ========================================
// Flow Configuration
// ========================================
const FLOW_CONFIG = {
  // Detect mobile for optimized timings
  isMobile:
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    ),

  // Desktop timings (in ms)
  desktop: {
    spinSelection: 1500,
    classSelection: 1500,
    transitionDelay: 300,
    slotMachine: 3500,
    totalExperience: 6800,
  },

  // Mobile timings (20% faster)
  mobile: {
    spinSelection: 1200,
    classSelection: 1200,
    transitionDelay: 200,
    slotMachine: 3000,
    totalExperience: 5600,
  },

  // Get current timings based on device
  get timings() {
    return this.isMobile ? this.mobile : this.desktop;
  },

  // Animation curves
  animations: {
    easeOut: "cubic-bezier(0.25, 0.46, 0.45, 0.94)",
    easeInOut: "cubic-bezier(0.645, 0.045, 0.355, 1)",
    bounce: "cubic-bezier(0.68, -0.55, 0.265, 1.55)",
  },
};

// ========================================
// Automated Flow Manager
// ========================================
class AutomatedFlowManager {
  constructor() {
    this.isRunning = false;
    this.currentPhase = null;
    this.selections = {
      spins: null,
      class: null,
      loadout: null,
    };
    this.initialize();
  }

  /**
   * Initialize the automated flow system
   */
  initialize() {
    this.createFlowUI();
    this.attachEventListeners();
    console.log("🎰 Automated flow system initialized");
  }

  /**
   * Create the streamlined UI
   */
  createFlowUI() {
    // Create main container
    const container = document.createElement("div");
    container.id = "automated-flow-container";
    container.className = "automated-flow-container";
    container.innerHTML = `
            <!-- Phase 1: Number Selection -->
            <div id="auto-number-phase" class="flow-phase">
                <h2 class="phase-title">SELECTING SPINS...</h2>
                <div class="auto-number-display">
                    <div class="number-roulette">
                        <div class="number-strip">
                            ${[3, 4, 5, 1, 2, 3, 4, 5, 1, 2, 3, 4, 5, 1, 2]
                              .map(
                                (n) => `<div class="roulette-number">${n}</div>`
                              )
                              .join("")}
                        </div>
                    </div>
                    <div class="selection-indicator"></div>
                </div>
                <div class="phase-progress">
                    <div class="progress-fill"></div>
                </div>
            </div>
            
            <!-- Phase 2: Class Selection -->
            <div id="auto-class-phase" class="flow-phase" style="display: none;">
                <h2 class="phase-title">CHOOSING CLASS...</h2>
                <div class="auto-class-display">
                    <div class="class-carousel">
                        <div class="class-card light-card">
                            <span class="class-icon">⚡</span>
                            <span class="class-name">LIGHT</span>
                        </div>
                        <div class="class-card medium-card">
                            <span class="class-icon">⚖️</span>
                            <span class="class-name">MEDIUM</span>
                        </div>
                        <div class="class-card heavy-card">
                            <span class="class-icon">🛡️</span>
                            <span class="class-name">HEAVY</span>
                        </div>
                    </div>
                </div>
                <div class="phase-progress">
                    <div class="progress-fill"></div>
                </div>
            </div>
            
            <!-- Phase 3: Loading Transition -->
            <div id="auto-loading-phase" class="flow-phase" style="display: none;">
                <div class="loading-spinner-custom">
                    <div class="spinner-ring"></div>
                    <div class="spinner-ring"></div>
                    <div class="spinner-ring"></div>
                </div>
                <h2 class="loading-text">INITIALIZING SLOTS...</h2>
            </div>
        `;

    // Insert into pre-slot container
    const preSlotContainer = document.getElementById("pre-slot-container");
    if (preSlotContainer) {
      preSlotContainer.innerHTML = "";
      preSlotContainer.appendChild(container);
    }
  }

  /**
   * Start the automated flow
   */
  async startAutomatedFlow() {
    if (this.isRunning) return;

    this.isRunning = true;
    this.selections = { spins: null, class: null, loadout: null };

    try {
      // Hide main button
      const generateBtn = document.getElementById("generate-btn");
      if (generateBtn) generateBtn.style.display = "none";

      // Show flow container
      const container = document.getElementById("automated-flow-container");
      if (container) container.style.display = "block";

      // Phase 1: Auto-select number of spins
      await this.autoSelectSpins();

      // Short transition
      await this.delay(FLOW_CONFIG.timings.transitionDelay);

      // Phase 2: Auto-select class
      await this.autoSelectClass();

      // Short transition
      await this.delay(FLOW_CONFIG.timings.transitionDelay);

      // Phase 3: Show loading transition
      await this.showLoadingTransition();

      // Phase 4: Run slot machine
      await this.runSlotMachine();
    } catch (error) {
      console.error("Automated flow error:", error);
    } finally {
      this.isRunning = false;
    }
  }

  /**
   * Phase 1: Auto-select number of spins
   */
  async autoSelectSpins() {
    this.currentPhase = "spins";

    const phase = document.getElementById("auto-number-phase");
    if (!phase) return;

    phase.style.display = "block";
    phase.classList.add("active");

    // Randomly select 1-5
    const targetNumber = Math.floor(Math.random() * 5) + 1;
    this.selections.spins = targetNumber;

    // Animate the number strip
    const strip = phase.querySelector(".number-strip");
    const progressBar = phase.querySelector(".progress-fill");

    if (strip && progressBar) {
      // Start progress bar
      progressBar.style.transition = `width ${FLOW_CONFIG.timings.spinSelection}ms linear`;
      progressBar.style.width = "100%";

      // Calculate scroll position to center the target number
      // The viewport shows 3 numbers (180px tall, 60px per number)
      // The strip starts at -30px (half a number above viewport)
      // We want the target number to be in the center (90px from viewport top)
      const targetPositions = {
        1: [3, 8, 13], // Positions of '1' in the strip (0-indexed)
        2: [4, 9, 14], // Positions of '2' in the strip
        3: [0, 5, 10], // Positions of '3' in the strip
        4: [1, 6, 11], // Positions of '4' in the strip
        5: [2, 7, 12], // Positions of '5' in the strip
      };

      // Pick the middle occurrence of our target number for best visual effect
      const targetIndex = targetPositions[targetNumber][1];

      // Calculate scroll amount to center the target
      // To center position N, we need to move it to 60px from top (center of 180px viewport)
      // Current position of item N is N * 60px from strip top
      // Strip starts at -30px, so we need to scroll: (N * 60) - 60 - 30 = (N * 60) - 90
      const scrollAmount = targetIndex * 60 - 90;

      // Animate with easing
      strip.style.transition = `transform ${FLOW_CONFIG.timings.spinSelection}ms ${FLOW_CONFIG.animations.easeOut}`;
      strip.style.transform = `translateY(-${scrollAmount}px)`;

      // Play tick sounds
      this.playTickSounds(FLOW_CONFIG.timings.spinSelection);

      // Add glow effect at the end
      setTimeout(() => {
        const indicator = phase.querySelector(".selection-indicator");
        if (indicator) {
          indicator.classList.add("locked");
          this.playSound("lock");
        }
      }, FLOW_CONFIG.timings.spinSelection - 100);
    }

    await this.delay(FLOW_CONFIG.timings.spinSelection);

    // Fade out
    phase.classList.add("fade-out");
    await this.delay(300);
    phase.style.display = "none";
    phase.classList.remove("active", "fade-out");
  }

  /**
   * Phase 2: Auto-select class
   */
  async autoSelectClass() {
    this.currentPhase = "class";

    const phase = document.getElementById("auto-class-phase");
    if (!phase) return;

    phase.style.display = "block";
    phase.classList.add("active");

    // Randomly select class
    const classes = ["Light", "Medium", "Heavy"];
    const targetClass = classes[Math.floor(Math.random() * 3)];
    this.selections.class = targetClass;

    const carousel = phase.querySelector(".class-carousel");
    const progressBar = phase.querySelector(".progress-fill");
    const cards = phase.querySelectorAll(".class-card");

    if (carousel && progressBar && cards.length) {
      // Start progress bar
      progressBar.style.transition = `width ${FLOW_CONFIG.timings.classSelection}ms linear`;
      progressBar.style.width = "100%";

      // Animate cards cycling
      let cycleCount = 0;
      const cycleInterval = 150; // Fast cycling
      const totalCycles =
        Math.floor(FLOW_CONFIG.timings.classSelection / cycleInterval) - 2;

      const cycleTimer = setInterval(() => {
        cards.forEach((card) => card.classList.remove("highlight"));
        const currentIndex = cycleCount % 3;
        cards[currentIndex].classList.add("highlight");
        this.playSound("tick");

        cycleCount++;
        if (cycleCount >= totalCycles) {
          clearInterval(cycleTimer);

          // Final selection
          setTimeout(() => {
            cards.forEach((card) =>
              card.classList.remove("highlight", "selected")
            );
            const selectedIndex = classes.indexOf(targetClass);
            cards[selectedIndex].classList.add("selected");
            this.playSound("lock");

            // Scale effect
            cards[selectedIndex].style.transform = "scale(1.2)";
          }, 200);
        }
      }, cycleInterval);
    }

    await this.delay(FLOW_CONFIG.timings.classSelection);

    // Fade out
    phase.classList.add("fade-out");
    await this.delay(300);
    phase.style.display = "none";
    phase.classList.remove("active", "fade-out");
  }

  /**
   * Phase 3: Show loading transition
   */
  async showLoadingTransition() {
    const phase = document.getElementById("auto-loading-phase");
    if (!phase) return;

    phase.style.display = "block";
    phase.classList.add("active");

    // Quick loading animation
    await this.delay(800);

    phase.classList.add("fade-out");
    await this.delay(200);
    phase.style.display = "none";
  }

  /**
   * Phase 4: Run the main slot machine
   */
  async runSlotMachine() {
    // Hide automated container
    const autoContainer = document.getElementById("automated-flow-container");
    if (autoContainer) {
      autoContainer.style.display = "none";
    }

    // Show slot machine
    const slotContainer = document.getElementById("slot-machine-container");
    if (slotContainer) {
      slotContainer.style.display = "block";
      slotContainer.classList.add("fade-in");
    }

    // Update selected class display
    const classDisplay = document.getElementById("selected-class");
    if (classDisplay) {
      classDisplay.textContent = this.selections.class;
    }

    // Small delay to ensure DOM is ready
    await this.delay(100);

    // Trigger slot machine spin
    if (window.slotMachine) {
      console.log(
        "🎰 Starting slot machine spin for class:",
        this.selections.class
      );

      try {
        const loadout = await window.slotMachine.spin(
          this.selections.class,
          this.selections.spins
        );
        this.selections.loadout = loadout;

        console.log("✅ Loadout generated:", loadout);

        // Display results
        if (window.displayLoadoutResult) {
          window.displayLoadoutResult(loadout);
        }

        // Save to history (commented out - handled by event listener)
        // The loadoutGenerated event will handle history saving
        console.log("🎮 Automated flow loadout:", loadout);
        // if (window.AppState && !window.AppState.isAddingToHistory && loadout) {
        //     window.AppState.currentLoadout = loadout;
        //     if (window.saveLoadoutToHistory) {
        //         await window.saveLoadoutToHistory();
        //     }
        // }

        // Show spin again button
        const spinAgainBtn = document.getElementById("spin-again-btn");
        if (spinAgainBtn) {
          setTimeout(() => {
            spinAgainBtn.style.display = "block";
          }, 1000);
        }
      } catch (error) {
        console.error("❌ Slot machine error:", error);
      }
    } else {
      console.error("❌ Slot machine not initialized!");
    }
  }

  /**
   * Play tick sounds during selection
   */
  playTickSounds(duration) {
    const tickCount = Math.floor(duration / 100);
    let currentTick = 0;

    const tickInterval = setInterval(() => {
      this.playSound("tick");
      currentTick++;

      if (currentTick >= tickCount) {
        clearInterval(tickInterval);
      }
    }, 100);
  }

  /**
   * Play sound effect
   */
  playSound(type) {
    // Sounds disabled - files not in v2 directory
    return;

    /*
        if (!window.AppState?.soundEnabled) return;
        
        const sounds = {
            tick: '../sounds/tick.mp3',
            lock: '../sounds/lock.mp3',
            transition: '../sounds/whoosh.mp3'
        };
        
        // Use existing audio elements or create new ones
        const audio = new Audio(sounds[type] || sounds.tick);
        audio.volume = 0.3;
        audio.play().catch(e => console.log('Sound failed:', e));
        */
  }

  /**
   * Attach event listeners
   */
  attachEventListeners() {
    // Replace generate button click
    const generateBtn = document.getElementById("generate-btn");
    if (generateBtn) {
      // Remove old listeners
      const newBtn = generateBtn.cloneNode(true);
      generateBtn.parentNode.replaceChild(newBtn, generateBtn);

      // Add new automated flow trigger
      newBtn.addEventListener("click", () => {
        this.startAutomatedFlow();
      });
    }

    // Update spin again button
    const spinAgainBtn = document.getElementById("spin-again-btn");
    if (spinAgainBtn) {
      // Remove old listeners
      const newSpinBtn = spinAgainBtn.cloneNode(true);
      spinAgainBtn.parentNode.replaceChild(newSpinBtn, spinAgainBtn);

      // Add new automated flow trigger
      newSpinBtn.addEventListener("click", () => {
        // Reset UI
        const slotContainer = document.getElementById("slot-machine-container");
        const resultDiv = document.getElementById("loadout-result");

        if (slotContainer) slotContainer.style.display = "none";
        if (resultDiv) resultDiv.style.display = "none";

        newSpinBtn.style.display = "none";

        // Start new flow
        this.startAutomatedFlow();
      });
    }
  }

  /**
   * Utility delay function
   */
  delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Get current selections
   */
  getSelections() {
    return this.selections;
  }
}

// ========================================
// Initialize on DOM ready
// ========================================
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => {
    window.automatedFlow = new AutomatedFlowManager();
    console.log(
      "🎰 Automated flow ready - single button experience activated!"
    );
  });
} else {
  window.automatedFlow = new AutomatedFlowManager();
  console.log("🎰 Automated flow ready - single button experience activated!");
}
