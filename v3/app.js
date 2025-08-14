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
// Make GameData globally accessible for slot-machine.js
const GameData = window.GameData = {
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
  clearAllFilters: null,

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
document.addEventListener("DOMContentLoaded", async () => {
  // Try to load data from loadouts.json
  if (typeof loadLoadoutsData !== 'undefined') {
    const loadoutsData = await loadLoadoutsData();
    if (loadoutsData) {
      GameData.loadouts = loadoutsData;
      window.GameData.loadouts = loadoutsData; // Update global reference
      console.log("✅ Loaded weapon data from loadouts.json");
    } else {
      console.log("⚠️ Using fallback weapon data");
    }
  }
  
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
  DOM.clearAllFilters = document.getElementById("clear-all-filters");

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
  DOM.clearAllFilters?.addEventListener("click", clearAllFilters);

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
    // AnimationEngineV2 is loaded via index.html
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

  // Verify AnimationEngineV2 is loaded (silent check)
  if (typeof AnimationEngineV2 === 'undefined') {
    console.error('AnimationEngineV2 not loaded');
  }

  // Initialize slot machine
  slotMachine = new SlotMachine();
  window.slotMachine = slotMachine; // Make globally available
  console.log("🎰 Slot machine initialized:", window.slotMachine);
  console.log("🎮 Animation engine status:", window.slotMachine.animationEngine ? 'Ready' : 'Not initialized');

  // Make display function globally available
  window.displayLoadoutResult = displayLoadoutResult;
  window.saveLoadoutToHistory = saveLoadoutToHistory;
  
  // Add global reset function
  window.resetSlotMachine = () => {
    console.log('🔄 Resetting slot machine...');
    if (window.slotMachine) {
      // Reset spinning flag
      window.slotMachine.isSpinning = false;
      
      // Reset animation engine
      if (window.slotMachine.animationEngine) {
        window.slotMachine.animationEngine.forceStopAnimation();
      }
      
      // Reinitialize animation engine
      window.slotMachine.initializeAnimationEngine();
      
      console.log('✅ Slot machine reset complete');
    }
  };

  // Listen for slotSpinComplete events from slot machine
  document.addEventListener("slotSpinComplete", (event) => {
    const { loadout, slotMachine } = event.detail;
    console.log("🎯 slotSpinComplete event received:", loadout);
    console.log("📊 Loadout structure:", {
      class: loadout?.class,
      weapon: loadout?.weapon,
      specialization: loadout?.specialization,
      gadgets: loadout?.gadgets
    });
    console.log("🔍 AppState.isAddingToHistory:", AppState.isAddingToHistory);
    console.log("🔍 window.historyManager exists:", !!window.historyManager);
    
    if (loadout && !AppState.isAddingToHistory) {
      AppState.currentLoadout = loadout;
      
      // Set flag to prevent duplicate recording
      AppState.isAddingToHistory = true;
      
      // Use new HistoryManager if available
      if (window.historyManager) {
        console.log("✅ Using new HistoryManager to record history");
        // The history system expects simple format (strings, not objects)
        let formattedLoadout = {
          class: loadout.class,
          weapon: loadout.weapon,
          specialization: loadout.specialization,
          gadgets: loadout.gadgets,
          timestamp: loadout.timestamp || Date.now(),
          // Preserve bonus properties if they exist
          isJackpot: loadout.isJackpot,
          isMetaBonus: loadout.isMetaBonus,
          isWild: loadout.isWild,
          bonusType: loadout.bonusType
        };
        
        console.log("📤 Sending to HistoryManager:", formattedLoadout);
        window.historyManager.addEntry(formattedLoadout).then(() => {
          console.log("✅ History entry added successfully");
          // Reset flag after successful recording
          setTimeout(() => {
            AppState.isAddingToHistory = false;
          }, 500);
        }).catch((error) => {
          console.error("❌ Failed to add history entry:", error);
          AppState.isAddingToHistory = false;
        });
      } else {
        console.log("⚠️ Fallback to old system");
        // Fallback to old system
        saveLoadoutToHistory();
        // Reset flag after fallback
        setTimeout(() => {
          AppState.isAddingToHistory = false;
        }, 500);
      }
    }
  });

  // DEPRECATED: Keep old loadoutGenerated listener for compatibility but mark it as deprecated
  window.addEventListener("loadoutGenerated", (event) => {
    console.log("⚠️ DEPRECATED: loadoutGenerated event received - this should now be handled by slotSpinComplete");
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

    // History is now handled automatically by the slotSpinComplete event listener
    // No manual history recording needed here
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

function clearAllFilters() {
  // Clear all filter checkboxes
  const allCheckboxes = document.querySelectorAll('#filter-panel input[type="checkbox"]');
  allCheckboxes.forEach(checkbox => {
    checkbox.checked = false;
  });
  
  // Clear the filter system's active filters
  if (window.slotMachine && window.slotMachine.filterSystem) {
    window.slotMachine.filterSystem.activeFilters.weapons.clear();
    window.slotMachine.filterSystem.activeFilters.specializations.clear();
    window.slotMachine.filterSystem.activeFilters.gadgets.clear();
  }
  
  // Update filter counts
  updateFilterCounts();
  
  console.log("✅ All filters cleared");
}

function updateFilterCounts() {
  // Update weapon count
  const weaponCheckboxes = document.querySelectorAll('#weapons-filters input[type="checkbox"]');
  const weaponChecked = document.querySelectorAll('#weapons-filters input[type="checkbox"]:checked');
  const weaponCount = document.getElementById('weapons-count');
  if (weaponCount) {
    weaponCount.textContent = `${weaponChecked.length}/${weaponCheckboxes.length}`;
  }
  
  // Update specialization count
  const specCheckboxes = document.querySelectorAll('#specializations-filters input[type="checkbox"]');
  const specChecked = document.querySelectorAll('#specializations-filters input[type="checkbox"]:checked');
  const specCount = document.getElementById('specializations-count');
  if (specCount) {
    specCount.textContent = `${specChecked.length}/${specCheckboxes.length}`;
  }
  
  // Update gadget count
  const gadgetCheckboxes = document.querySelectorAll('#gadgets-filters input[type="checkbox"]');
  const gadgetChecked = document.querySelectorAll('#gadgets-filters input[type="checkbox"]:checked');
  const gadgetCount = document.getElementById('gadgets-count');
  if (gadgetCount) {
    gadgetCount.textContent = `${gadgetChecked.length}/${gadgetCheckboxes.length}`;
  }
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

// ========================================
// Post-Landing Winner Highlighting System
// ========================================

// Listen for slotSpinComplete event to trigger winner highlighting
document.addEventListener("slotSpinComplete", (event) => {
  const { loadout, slotMachine } = event.detail;
  
  if (loadout && slotMachine) {
    console.log("🎯 Slot spin completed, highlighting winners after delay...");
    
    // Add a brief delay to let the animation settle, then highlight winners
    setTimeout(() => {
      slotMachine.highlightWinnersAfterLanding(loadout);
    }, 100); // 100ms delay for all five center cells to highlight simultaneously
  }
});
