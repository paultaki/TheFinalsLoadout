/**
 * The Finals Random Loadout Generator v2
 * Integrated with Slot Machine Core System
 */

// ========================================
// State Management
// ========================================
const AppState = {
  // Core state
  isGenerating: false,
  selectedNumber: null,
  selectedClass: null,
  currentLoadout: null,

  // UI state
  soundEnabled: true,
  filtersActive: false,

  // History
  loadoutHistory: [],

  // Animation state
  animationPhase: "idle", // idle, number-selection, class-roulette, slot-spin, complete

  // Spin protection flags
  isSpinning: false,
  isAddingToHistory: false,
  isValidSpinSequence: false,
};

// ========================================
// Data Structure
// ========================================
const GameData = {
  classes: ["Light", "Medium", "Heavy"],

  loadouts: {
    Light: {
      weapons: [
        "93R",
        "Dagger",
        "SR-84",
        "SH1900",
        "LH1",
        "M26 Matter",
        "Recurve Bow",
        "Sword",
        "M11",
        "ARN-220",
        "V9S",
        "XP-54",
        "Throwing Knives",
      ],
      specializations: ["Cloaking Device", "Evasive Dash", "Grappling Hook"],
      gadgets: [
        "Breach Charge",
        "Gateway",
        "Glitch Grenade",
        "Flashbang",
        "Frag Grenade",
        "Gas Grenade",
        "Goo Grenade",
        "Pyro Grenade",
        "Smoke Grenade",
        "Stun Gun",
        "Thermal Vision",
        "Tracking Dart",
        "Vanishing Bomb",
        "Zipline",
        "Motion Sensor",
      ],
    },
    Medium: {
      weapons: [
        "AKM",
        "Cerberus 12GA",
        "Dual Blades",
        "FAMAS",
        "CL-40",
        "CB-01 Repeater",
        "FCAR",
        "Model 1887",
        "Pike-556",
        "R.357",
        "Riot Shield",
      ],
      specializations: [
        "Dematerializer",
        "Guardian Turret",
        "Healing Beam",
        "Recon Senses",
      ],
      gadgets: [
        "APS Turret",
        "Data Reshaper",
        "Defibrillator",
        "Explosive Mine",
        "Gas Mine",
        "Glitch Trap",
        "Jump Pad",
        "Sonar Grenade",
        "Zipline",
        "Flashbang",
        "Frag Grenade",
        "Gas Grenade",
        "Goo Grenade",
        "Pyro Grenade",
        "Smoke Grenade",
      ],
    },
    Heavy: {
      weapons: [
        ".50 Akimbo",
        "Flamethrower",
        "KS-23",
        "Lewis Gun",
        "M60",
        "M134 Minigun",
        "MGL32",
        "SA1216",
        "Sledgehammer",
        "ShAK-50",
        "Spear",
        "Lockbolt Launcher",
      ],
      specializations: [
        "Charge N Slam",
        "Goo Gun",
        "Mesh Shield",
        "Winch Claw",
      ],
      gadgets: [
        "Barricade",
        "C4",
        "Dome Shield",
        "Explosive Mine",
        "RPG-7",
        "Anti-Gravity Cube",
        "Flashbang",
        "Frag Grenade",
        "Gas Grenade",
        "Goo Grenade",
        "Pyro Grenade",
        "Smoke Grenade",
      ],
    },
  },
};

// ========================================
// DOM Elements
// ========================================
const DOM = {
  // Navigation
  scrollProgress: null,
  returnToTop: null,
  soundToggle: null,
  filterToggle: null,

  // Filter Panel
  filterPanel: null,
  filterOverlay: null,
  filterClose: null,

  // Pre-slot animations
  numberSelector: null,
  classRoulette: null,

  // Slot Machine
  slotContainer: null,
  slotColumns: null,
  selectedClassDisplay: null,

  // Controls
  generateBtn: null,
  spinAgainBtn: null,

  // History
  historyContainer: null,

  // Audio
  sounds: {},
};

// ========================================
// Global Instances
// ========================================
let slotMachine = null;
let selectionManager = null;

// ========================================
// Initialization
// ========================================
document.addEventListener("DOMContentLoaded", () => {
  initializeDOMElements();
  loadSavedState();
  attachEventListeners();
  initializeScrollEffects();
  initializeSlotMachine();
  console.log("✨ The Finals Loadout Generator v2 initialized");
});

function initializeDOMElements() {
  // Navigation
  DOM.scrollProgress = document.getElementById("scrollProgressBar");
  DOM.returnToTop = document.getElementById("returnToTop");
  DOM.soundToggle = document.getElementById("sound-toggle");
  DOM.filterToggle = document.getElementById("filter-toggle");

  // Filter Panel
  DOM.filterPanel = document.getElementById("filter-panel");
  DOM.filterOverlay = document.getElementById("filter-panel-overlay");
  DOM.filterClose = document.getElementById("close-filter-panel");

  // Pre-slot animations
  DOM.numberSelector = document.getElementById("number-selector");
  DOM.classRoulette = document.getElementById("class-roulette");

  // Slot Machine
  DOM.slotContainer = document.getElementById("slot-machine-container");
  DOM.slotColumns = document.querySelectorAll(".slot-column");
  DOM.selectedClassDisplay = document.getElementById("selected-class");

  // Controls
  DOM.generateBtn = document.getElementById("generate-btn");
  DOM.spinAgainBtn = document.getElementById("spin-again-btn");

  // History
  DOM.historyContainer = document.getElementById("history-container");

  // Audio
  DOM.sounds = {
    click: document.getElementById("clickSound"),
    spin: document.getElementById("spinSound"),
    win: document.getElementById("winSound"),
  };
}

function loadSavedState() {
  // Load from localStorage
  const savedSound = localStorage.getItem("soundEnabled");
  if (savedSound !== null) {
    AppState.soundEnabled = savedSound === "true";
    updateSoundToggle();
  }

  const savedHistory = localStorage.getItem("loadoutHistory");
  if (savedHistory) {
    try {
      AppState.loadoutHistory = JSON.parse(savedHistory);
      renderHistory();
    } catch (e) {
      console.error("Failed to load history:", e);
    }
  }
}

// ========================================
// Event Listeners
// ========================================
function attachEventListeners() {
  // Main generate button
  DOM.generateBtn?.addEventListener("click", handleGenerateClick);
  DOM.spinAgainBtn?.addEventListener("click", handleSpinAgainClick);

  // Sound toggle
  DOM.soundToggle?.addEventListener("click", toggleSound);

  // Filter panel
  DOM.filterToggle?.addEventListener("click", toggleFilterPanel);
  DOM.filterClose?.addEventListener("click", closeFilterPanel);
  DOM.filterOverlay?.addEventListener("click", closeFilterPanel);

  // Return to top
  DOM.returnToTop?.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
}

// ========================================
// Slot Machine Initialization
// ========================================
function initializeSlotMachine() {
  // Load required scripts
  const scriptsToLoad = [
    { name: "SlotMachine", src: "slot-machine.js" },
    { name: "AnimationEngine", src: "animation-engine.js" },
  ];

  let scriptsLoaded = 0;

  scriptsToLoad.forEach((script) => {
    if (typeof window[script.name] === "undefined") {
      const scriptElement = document.createElement("script");
      scriptElement.src = script.src;
      scriptElement.onload = () => {
        scriptsLoaded++;
        console.log(`✅ ${script.name} loaded`);

        // Initialize everything when all scripts are loaded
        if (scriptsLoaded === scriptsToLoad.length) {
          initializeComponents();
        }
      };
      document.head.appendChild(scriptElement);
    } else {
      scriptsLoaded++;
    }
  });

  // If all scripts were already loaded
  if (scriptsLoaded === scriptsToLoad.length) {
    initializeComponents();
  }
}

/**
 * Initialize all components
 */
function initializeComponents() {
  // Make GameData globally available
  window.GameData = GameData;

  // Verify AnimationEngine is loaded
  if (typeof AnimationEngine === 'undefined') {
    console.error('❌ AnimationEngine not loaded!');
  } else {
    console.log('✅ AnimationEngine available');
  }

  // Initialize slot machine
  slotMachine = new SlotMachine();
  window.slotMachine = slotMachine; // Make globally available
  console.log("🎰 Slot machine initialized:", window.slotMachine);
  console.log("🎮 Animation engine status:", window.slotMachine.animationEngine ? 'Ready' : 'Not initialized');

  // Make display function globally available
  window.displayLoadoutResult = displayLoadoutResult;
  window.saveLoadoutToHistory = saveLoadoutToHistory;

  // Listen for loadout generated events from slot machine
  window.addEventListener("loadoutGenerated", (event) => {
    const loadout = event.detail;
    console.log("📝 loadoutGenerated event received:", loadout);
    if (loadout && !AppState.isAddingToHistory) {
      AppState.currentLoadout = loadout;
      saveLoadoutToHistory();
    }
  });

  // The automated flow manager handles all selections now
  console.log("🎮 All components initialized");
}

// ========================================
// Core Functions
// ========================================
async function handleGenerateClick() {
  // Now handled by automated flow
  if (window.automatedFlow) {
    window.automatedFlow.startAutomatedFlow();
  }
}

/**
 * Handle when selections are complete (from automated flow)
 */
async function handleSelectionsComplete(selections) {
  // This is now handled internally by automated flow
  console.log("Selections complete:", selections);
}

async function handleSpinAgainClick() {
  // Now triggers automated flow again
  if (window.automatedFlow) {
    window.automatedFlow.startAutomatedFlow();
  }
}

// ========================================
// Animation Functions (Placeholders)
// ========================================
async function runNumberSelectorAnimation() {
  console.log("🎲 Running number selector animation...");
  DOM.numberSelector.style.display = "block";

  // Placeholder: Simulate number selection
  await delay(1000);
  AppState.selectedNumber = Math.floor(Math.random() * 10) + 1;
  console.log(`Selected number: ${AppState.selectedNumber}`);

  DOM.numberSelector.style.display = "none";
}

async function runClassRouletteAnimation() {
  console.log("🎰 Running class roulette animation...");
  DOM.classRoulette.style.display = "block";

  // Placeholder: Simulate class selection
  await delay(1000);
  const classes = ["Light", "Medium", "Heavy"];
  AppState.selectedClass = classes[Math.floor(Math.random() * classes.length)];
  console.log(`Selected class: ${AppState.selectedClass}`);

  DOM.classRoulette.style.display = "none";
}

async function runSlotMachineAnimation() {
  console.log("🎯 Running slot machine animation...");

  if (!slotMachine) {
    console.error("Slot machine not initialized!");
    return;
  }

  DOM.slotContainer.style.display = "block";
  DOM.selectedClassDisplay.textContent = AppState.selectedClass;

  // Use the slot machine's spin method with deception engine
  const loadout = await slotMachine.spin(AppState.selectedClass);

  if (loadout) {
    AppState.currentLoadout = loadout;

    // Placeholder animation (will be enhanced later)
    playSound("spin");

    // Simulate spinning animation
    DOM.slotColumns.forEach((column, index) => {
      column.classList.add("spinning");

      // Stagger the stops
      setTimeout(() => {
        column.classList.remove("spinning");
        column.classList.add("stopped");
        playSound("click");
      }, 2000 + index * 200);
    });

    // Wait for all columns to stop
    await delay(2000 + DOM.slotColumns.length * 200);
    playSound("win");

    // Display results
    displayLoadoutResult(loadout);

    // The history will be handled by the loadoutGenerated event listener
    // Just trigger the event from slot machine
    slotMachine.addToHistory(loadout);
  }
}

// ========================================
// Loadout Generation
// ========================================
function generateRandomLoadout(classType) {
  const classData = GameData.loadouts[classType];

  // Get unique random gadgets
  const gadgets = getUniqueRandomItems(classData.gadgets, 3);

  return {
    class: classType,
    weapon: getRandomItem(classData.weapons),
    specialization: getRandomItem(classData.specializations),
    gadgets: gadgets,
    timestamp: Date.now(),
  };
}

function getRandomItem(array) {
  return array[Math.floor(Math.random() * array.length)];
}

function getUniqueRandomItems(array, count) {
  const shuffled = [...array].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

// ========================================
// Display Functions
// ========================================
function displayLoadoutResult(loadout) {
  const resultDiv = document.getElementById("loadout-result");
  if (!resultDiv) return;

  resultDiv.style.display = "block";

  const itemsDiv = resultDiv.querySelector(".result-items");
  if (!itemsDiv) return;

  // Check if it's a double loadout from bonus
  if (loadout.isDouble && loadout.secondLoadout) {
    itemsDiv.innerHTML = `
            <div class="double-loadout-container">
                <div class="double-loadout-card">
                    <div class="loadout-item">
                        <span class="item-label">Class:</span>
                        <span class="item-value">${loadout.class}</span>
                    </div>
                    <div class="loadout-item">
                        <span class="item-label">Weapon:</span>
                        <span class="item-value">${loadout.weapon}</span>
                    </div>
                    <div class="loadout-item">
                        <span class="item-label">Specialization:</span>
                        <span class="item-value">${
                          loadout.specialization
                        }</span>
                    </div>
                    <div class="loadout-item">
                        <span class="item-label">Gadgets:</span>
                        <span class="item-value">${loadout.gadgets.join(
                          ", "
                        )}</span>
                    </div>
                </div>
                <div class="double-loadout-card">
                    <div class="loadout-item">
                        <span class="item-label">Class:</span>
                        <span class="item-value">${
                          loadout.secondLoadout.class
                        }</span>
                    </div>
                    <div class="loadout-item">
                        <span class="item-label">Weapon:</span>
                        <span class="item-value">${
                          loadout.secondLoadout.weapon
                        }</span>
                    </div>
                    <div class="loadout-item">
                        <span class="item-label">Specialization:</span>
                        <span class="item-value">${
                          loadout.secondLoadout.specialization
                        }</span>
                    </div>
                    <div class="loadout-item">
                        <span class="item-label">Gadgets:</span>
                        <span class="item-value">${loadout.secondLoadout.gadgets.join(
                          ", "
                        )}</span>
                    </div>
                </div>
            </div>
        `;
  } else {
    // Regular single loadout display
    let bonusIndicator = "";
    if (loadout.isJackpot) {
      bonusIndicator = '<span class="jackpot-badge">💎 JACKPOT!</span>';
    } else if (loadout.isMetaBonus) {
      bonusIndicator = '<span class="meta-badge">⭐ META GUARANTEED</span>';
    } else if (loadout.isWild) {
      bonusIndicator = '<span class="wild-badge">🃏 WILD CARD</span>';
    }

    itemsDiv.innerHTML = `
            ${bonusIndicator}
            <div class="loadout-item">
                <span class="item-label">Class:</span>
                <span class="item-value">${loadout.class}</span>
            </div>
            <div class="loadout-item">
                <span class="item-label">Weapon:</span>
                <span class="item-value">${loadout.weapon}</span>
            </div>
            <div class="loadout-item">
                <span class="item-label">Specialization:</span>
                <span class="item-value">${loadout.specialization}</span>
            </div>
            <div class="loadout-item">
                <span class="item-label">Gadgets:</span>
                <span class="item-value">${loadout.gadgets.join(", ")}</span>
            </div>
        `;
  }

  // Add jackpot effect if applicable
  if (loadout.isJackpot) {
    const effect = document.createElement("div");
    effect.className = "jackpot-effect";
    document.body.appendChild(effect);
    setTimeout(() => effect.remove(), 5000);
  }
}

// ========================================
// History Management
// ========================================
async function saveLoadoutToHistory() {
  // Protection against duplicate adds
  if (AppState.isAddingToHistory) {
    console.warn("Already adding to history");
    return;
  }

  if (!AppState.currentLoadout) return;

  AppState.isAddingToHistory = true;

  try {
    AppState.loadoutHistory.unshift(AppState.currentLoadout);

    // Keep only last 10 loadouts
    if (AppState.loadoutHistory.length > 10) {
      AppState.loadoutHistory = AppState.loadoutHistory.slice(0, 10);
    }

    // Save to localStorage
    localStorage.setItem(
      "loadoutHistory",
      JSON.stringify(AppState.loadoutHistory)
    );

    renderHistory();
  } finally {
    // Reset flag after delay
    setTimeout(() => {
      AppState.isAddingToHistory = false;
    }, 500);
  }
}

function renderHistory() {
  if (!DOM.historyContainer) return;

  if (AppState.loadoutHistory.length === 0) {
    DOM.historyContainer.innerHTML =
      '<p class="empty-history">No loadouts generated yet. Click the button above to start!</p>';
    return;
  }

  const historyHTML = AppState.loadoutHistory
    .map(
      (loadout, index) => `
        <div class="history-item">
            <h4>Loadout #${AppState.loadoutHistory.length - index}</h4>
            <p>${loadout.class} - ${loadout.weapon} - ${
        loadout.specialization
      }</p>
            <p>Gadgets: ${loadout.gadgets.join(", ")}</p>
        </div>
    `
    )
    .join("");

  DOM.historyContainer.innerHTML = historyHTML;
}

// ========================================
// UI Functions
// ========================================
function toggleSound() {
  AppState.soundEnabled = !AppState.soundEnabled;
  localStorage.setItem("soundEnabled", AppState.soundEnabled);
  updateSoundToggle();
  playSound("click");
}

function updateSoundToggle() {
  if (!DOM.soundToggle) return;

  const soundOn = DOM.soundToggle.querySelector(".sound-on");
  const soundOff = DOM.soundToggle.querySelector(".sound-off");

  if (AppState.soundEnabled) {
    soundOn.style.display = "block";
    soundOff.style.display = "none";
  } else {
    soundOn.style.display = "none";
    soundOff.style.display = "block";
  }
}

function toggleFilterPanel() {
  AppState.filtersActive = !AppState.filtersActive;

  if (AppState.filtersActive) {
    DOM.filterPanel?.classList.add("active");
    DOM.filterOverlay?.classList.add("active");
  } else {
    closeFilterPanel();
  }
}

function closeFilterPanel() {
  AppState.filtersActive = false;
  DOM.filterPanel?.classList.remove("active");
  DOM.filterOverlay?.classList.remove("active");
}

// ========================================
// Scroll Effects
// ========================================
function initializeScrollEffects() {
  let lastScrollTop = 0;

  window.addEventListener("scroll", () => {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const scrollHeight =
      document.documentElement.scrollHeight - window.innerHeight;
    const scrollPercent = (scrollTop / scrollHeight) * 100;

    // Update progress bar
    if (DOM.scrollProgress) {
      DOM.scrollProgress.style.width = `${scrollPercent}%`;
    }

    // Show/hide return to top button
    if (DOM.returnToTop) {
      if (scrollTop > 300) {
        DOM.returnToTop.classList.add("visible");
      } else {
        DOM.returnToTop.classList.remove("visible");
      }
    }

    lastScrollTop = scrollTop;
  });
}

// ========================================
// Utility Functions
// ========================================
function playSound(soundName) {
  if (!AppState.soundEnabled) return;

  const sound = DOM.sounds[soundName];
  if (sound) {
    sound.currentTime = 0;
    sound.volume = 0.3; // Keep volume low
    sound.play().catch((e) => {
      console.log("Sound play failed:", e);
    });
  }
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ========================================
// Debug Functions
// ========================================
window.debugState = () => {
  console.log("Current App State:", AppState);
  console.log("Game Data:", GameData);
};

window.resetApp = () => {
  localStorage.clear();
  location.reload();
};
