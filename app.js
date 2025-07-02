// Import animation constants
import {
  SOUND_VOLUMES,
  ANIMATION_CONSTANTS,
  UI_TIMING,
  CELEBRATION_EFFECTS,
  ROAST_TIMING,
  EXPORT_SETTINGS,
  SLOT_TIMING,
} from "./src/core/Constants.js";

import {
  startSlotAnimation,
  addScreenShake,
  createLockInParticleExplosion,
  animateCounterTo,
} from "./src/animation/AnimationEngine.js";

import { SlotMachine } from "./src/components/slots/SlotMachine.js";

// =====================================================
// GLOBAL AUDIO MANAGEMENT SYSTEM
// =====================================================

// Global flag to track user interaction
window.userHasInteracted = false;

// Set up interaction tracking
document.addEventListener('click', () => {
  window.userHasInteracted = true;
}, { once: true });

document.addEventListener('touchstart', () => {
  window.userHasInteracted = true;
}, { once: true });

// Safe audio play function that respects user interaction
window.safePlay = function(audio) {
  if (!audio) {
    console.warn('safePlay: No audio element provided');
    return Promise.resolve();
  }
  
  // Check if user has interacted and sound is enabled
  if (!window.userHasInteracted) {
    console.log(`safePlay: Blocked ${audio.id || 'audio'} - waiting for user interaction`);
    return Promise.resolve();
  }
  
  // Check if sound is enabled in state
  if (window.state && !window.state.soundEnabled) {
    console.log(`safePlay: Blocked ${audio.id || 'audio'} - sound is disabled`);
    return Promise.resolve();
  }
  
  // Safe play with error handling
  try {
    audio.currentTime = 0;
    return audio.play().catch(err => {
      console.warn(`safePlay: Failed to play ${audio.id || 'audio'}:`, err.message);
    });
  } catch (e) {
    console.warn(`safePlay: Exception playing ${audio.id || 'audio'}:`, e);
    return Promise.resolve();
  }
};

// Global flag to track if we're in a valid spin sequence
window.isValidSpinSequence = false;

// Inline waitForGlobal function to avoid ES6 module issues
function waitForGlobal(
  name,
  timeout = ANIMATION_CONSTANTS.WAIT_FOR_GLOBAL_TIMEOUT
) {
  return new Promise((resolve, reject) => {
    const start = performance.now();
    const id = setInterval(() => {
      if (window[name]) {
        clearInterval(id);
        return resolve(window[name]);
      }
      if (performance.now() - start > timeout) {
        clearInterval(id);
        return reject(new Error(`${name} never loaded`));
      }
    }, ANIMATION_CONSTANTS.WAIT_FOR_GLOBAL_INTERVAL);
  });
}

// Counter loading functionality
async function loadCounter() {
  try {
    // Check if we're in local development
    const isLocal =
      window.location.hostname === "localhost" ||
      window.location.hostname === "127.0.0.1" ||
      window.location.hostname === "";

    if (isLocal) {
      // Use fallback counter for local development
      const fallbackCount = localStorage.getItem("localCounter") || "5321";
      document.querySelectorAll(".loadouts-counter").forEach((el) => {
        el.textContent = parseInt(fallbackCount).toLocaleString();
      });
      return;
    }

    // Production API call
    const response = await fetch("/api/counter");
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();
    document.querySelectorAll(".loadouts-counter").forEach((el) => {
      el.textContent = (data.count || 0).toLocaleString();
    });
  } catch (error) {
    console.warn("Counter load failed, using fallback:", error.message);
    // Fallback to a default count
    document.querySelectorAll(".loadouts-counter").forEach((el) => {
      el.textContent = "31,846";
    });
  }
}

// Call it when page loads
document.addEventListener("DOMContentLoaded", loadCounter);

// Mobile detection and performance state
const isMobile =
  /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  ) || window.innerWidth <= 768;

// Global state
const state = {
  selectedClass: null, // Deprecated - class selection removed
  isSpinning: false,
  currentSpin: 1,
  totalSpins: 0,
  selectedGadgets: new Set(),
  currentGadgetPool: new Set(),
  soundEnabled:
    localStorage.getItem("soundEnabled") === null
      ? true
      : localStorage.getItem("soundEnabled") !== "false", // Default to true
  isMobile: isMobile,
  sidebarOpen: false,
  // isRouletteAnimating: false, // Removed - roulette system deprecated
};

// Make state globally accessible
window.state = state;

// Helper function to get available classes based on filters
function getAvailableClasses() {
  const allClasses = ["Light", "Medium", "Heavy"];
  const availableClasses = [];
  
  // Check localStorage for exclusions (checked = excluded)
  ["light", "medium", "heavy"].forEach((className) => {
    const isExcluded = localStorage.getItem(`exclude-${className}`) === "true";
    if (!isExcluded) {
      const capitalizedClass = className.charAt(0).toUpperCase() + className.slice(1);
      availableClasses.push(capitalizedClass);
    }
  });
  
  // If all classes are excluded, use all classes as fallback
  const finalClasses = availableClasses.length > 0 ? availableClasses : allClasses;
  
  return finalClasses;
}

// Make getAvailableClasses globally accessible
window.getAvailableClasses = getAvailableClasses;

console.log("Initial state:", state);
console.log(
  "soundEnabled from localStorage:",
  localStorage.getItem("soundEnabled")
);
console.log(
  "localStorage value type:",
  typeof localStorage.getItem("soundEnabled")
);
console.log(
  "Computed soundEnabled value:",
  localStorage.getItem("soundEnabled") !== "false"
);
console.log(
  "Computed soundEnabled (null check):",
  localStorage.getItem("soundEnabled") === null
    ? true
    : localStorage.getItem("soundEnabled") !== "false"
);

// Load initial counter value
async function loadInitialCounter() {
  try {
    console.log("📊 Loading initial counter value...");

    const response = await fetch("/api/counter");
    if (response.ok) {
      const data = await response.json();
      console.log("✅ Initial counter loaded:", data.totalGenerated);

      // Counter functionality removed
      // updateCounterDisplay(data.totalGenerated);
      // updateTotalLoadoutsDisplay(data.totalGenerated);
    } else {
      console.warn("⚠️ Failed to load initial counter, using default 1231");
      // Counter functionality removed
      // updateCounterDisplay(1231);
      // updateTotalLoadoutsDisplay(1231);
    }
  } catch (error) {
    console.warn(
      "⚠️ Error loading initial counter, using default 1231:",
      error
    );
    // Counter functionality removed
    // updateCounterDisplay(1231);
    // updateTotalLoadoutsDisplay(1231);
  }
}

// Global variables for DOM elements
let spinButtons;
let classButtons;
let spinSelection;
let outputDiv;

// Physics constants now imported from Constants.js

const loadouts = {
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
      "Gravity Vortex",
      "H+ Infuser",
      "Nullifier",
      "Sonar Grenade",
      "Thermal Bore",
      "Gas Grenade",
      "Thermal Vision",
      "Tracking Dart",
      "Vanishing Bomb",
      "Goo Grenade",
      "Pyro Grenade",
      "Smoke Grenade",
      "Frag Grenade",
      "Flashbang",
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
    specializations: ["Dematerializer", "Guardian Turret", "Healing Beam"],
    gadgets: [
      "APS Turret",
      "Data Reshaper",
      "Defibrillator",
      "Explosive Mine",
      "Gas Mine",
      "Glitch Trap",
      "Jump Pad",
      "Breach Drill",

      "Zipline",
      "Gas Grenade",
      "Goo Grenade",
      "Pyro Grenade",
      "Smoke Grenade",
      "Frag Grenade",
      "Flashbang",
      "Proximity Sensor",
    ],
  },
  Heavy: {
    weapons: [
      "50 Akimbo",
      "Flamethrower",
      "KS-23",
      "Lewis Gun",
      "M60",
      "M134 Minigun",
      "M32GL",
      "SA 1216",
      "Sledgehammer",
      "SHAK-50",
      "Spear",
    ],
    specializations: ["Charge N Slam", "Goo Gun", "Mesh Shield", "Winch Claw"],
    gadgets: [
      "Anti-Gravity Cube",
      "Barricade",
      "C4",
      "Dome Shield",
      "Lockbolt Launcher",
      "Pyro Mine",
      "Proximity Sensor",
      "RPG-7",
      "Goo Grenade",
      "Pyro Grenade",
      "Smoke Grenade",
      "Healing Emitter",
      "Frag Grenade",
      "Flashbang",
      "Explosive Mine",
      "Gas Grenade",
    ],
  },
};

// Function to get filtered loadouts based on checkbox selections
function getFilteredLoadouts() {
  console.log("📋 Getting filtered loadouts...");

  // Create a deep copy of the original loadouts
  const filteredLoadouts = JSON.parse(JSON.stringify(loadouts));

  // Always use the new filter system - look in filter panel
  let checkedWeapons = Array.from(
    document.querySelectorAll('#filter-panel input[data-type="weapon"]:checked')
  ).map((checkbox) => checkbox.value);

  let checkedSpecializations = Array.from(
    document.querySelectorAll(
      '#filter-panel input[data-type="specialization"]:checked'
    )
  ).map((checkbox) => checkbox.value);

  let checkedGadgets = Array.from(
    document.querySelectorAll('#filter-panel input[data-type="gadget"]:checked')
  ).map((checkbox) => checkbox.value);

  console.log("🔸 Filtered weapons:", checkedWeapons);
  console.log("🔸 Filtered specializations:", checkedSpecializations);
  console.log("🔸 Filtered gadgets:", checkedGadgets);

  // Apply filters to each class
  for (const classType of ["Light", "Medium", "Heavy"]) {
    // Get the original items for this class
    const originalWeapons = loadouts[classType].weapons;
    const originalSpecs = loadouts[classType].specializations;
    const originalGadgets = loadouts[classType].gadgets;

    // For each category, only keep items from this class that are checked
    if (checkedWeapons.length > 0) {
      filteredLoadouts[classType].weapons = originalWeapons.filter((weapon) =>
        checkedWeapons.includes(weapon)
      );
      console.log(
        `${classType} weapons filtered from ${originalWeapons.length} to ${filteredLoadouts[classType].weapons.length}`
      );
    }

    if (checkedSpecializations.length > 0) {
      filteredLoadouts[classType].specializations = originalSpecs.filter(
        (spec) => checkedSpecializations.includes(spec)
      );
      console.log(
        `${classType} specializations filtered from ${originalSpecs.length} to ${filteredLoadouts[classType].specializations.length}`
      );
    }

    if (checkedGadgets.length > 0) {
      filteredLoadouts[classType].gadgets = originalGadgets.filter((gadget) =>
        checkedGadgets.includes(gadget)
      );
      console.log(
        `${classType} gadgets filtered from ${originalGadgets.length} to ${filteredLoadouts[classType].gadgets.length}`
      );
    }
  }

  // Safety check: make sure we have at least one item in each category for each class
  for (const classType of ["Light", "Medium", "Heavy"]) {
    // If any category is empty, revert to the original items for that category
    if (filteredLoadouts[classType].weapons.length === 0) {
      console.warn(
        `⚠️ No weapons selected for ${classType} class, reverting to defaults`
      );
      filteredLoadouts[classType].weapons = loadouts[classType].weapons;
    }

    if (filteredLoadouts[classType].specializations.length === 0) {
      console.warn(
        `⚠️ No specializations selected for ${classType} class, reverting to defaults`
      );
      filteredLoadouts[classType].specializations =
        loadouts[classType].specializations;
    }

    if (filteredLoadouts[classType].gadgets.length === 0) {
      console.warn(
        `⚠️ No gadgets selected for ${classType} class, reverting to defaults`
      );
      filteredLoadouts[classType].gadgets = loadouts[classType].gadgets;
    }
  }

  // Debug output
  console.log("Final filtered loadouts:", {
    Light: {
      weapons: filteredLoadouts.Light.weapons.length,
      specializations: filteredLoadouts.Light.specializations.length,
      gadgets: filteredLoadouts.Light.gadgets.length,
    },
    Medium: {
      weapons: filteredLoadouts.Medium.weapons.length,
      specializations: filteredLoadouts.Medium.specializations.length,
      gadgets: filteredLoadouts.Medium.gadgets.length,
    },
    Heavy: {
      weapons: filteredLoadouts.Heavy.weapons.length,
      specializations: filteredLoadouts.Heavy.specializations.length,
      gadgets: filteredLoadouts.Heavy.gadgets.length,
    },
  });

  return filteredLoadouts;
}

// Helper functions
const getRandomUniqueItems = (array, n) => {
  const shuffled = [...array].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, n);
};

const getUniqueGadgets = (classType, loadout) => {
  console.log(`🔍 Starting BULLETPROOF gadget selection for ${classType}`);
  console.log(
    `Available gadgets (${loadout.gadgets.length}):`,
    loadout.gadgets
  );

  // First, ensure the input array itself has no duplicates
  const cleanedGadgets = [...new Set(loadout.gadgets)];
  console.log(`🧹 Cleaned gadgets (${cleanedGadgets.length}):`, cleanedGadgets);

  if (cleanedGadgets.length < 3) {
    console.error(
      `❌ Not enough unique gadgets for ${classType}! Only ${cleanedGadgets.length} available.`
    );
    // Fallback: return what we have
    return cleanedGadgets;
  }

  // Create multiple attempts to ensure we never get duplicates
  let attempts = 0;
  let selectedGadgets = [];

  while (attempts < 10) {
    // Maximum 10 attempts
    attempts++;

    // Fisher-Yates shuffle for true randomness
    const shuffledGadgets = [...cleanedGadgets];
    for (let i = shuffledGadgets.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffledGadgets[i], shuffledGadgets[j]] = [
        shuffledGadgets[j],
        shuffledGadgets[i],
      ];
    }

    // Take the first 3 items from the shuffled array
    selectedGadgets = shuffledGadgets.slice(0, 3);

    // Verify uniqueness (this should ALWAYS pass, but let's be 100% sure)
    const uniqueSet = new Set(selectedGadgets);
    if (uniqueSet.size === 3) {
      console.log(
        `✅ SUCCESS on attempt ${attempts}! Selected gadgets:`,
        selectedGadgets
      );
      break;
    } else {
      console.error(
        `🚨 ATTEMPT ${attempts} FAILED! Duplicates found:`,
        selectedGadgets
      );
    }
  }

  // Final safety check
  const finalUniqueSet = new Set(selectedGadgets);
  if (finalUniqueSet.size !== 3) {
    console.error(
      "🚨 CRITICAL FAILURE: Could not select 3 unique gadgets after 10 attempts!"
    );
    console.error("Selected:", selectedGadgets);
    console.error("Available:", cleanedGadgets);
    // Emergency fallback: manually pick first 3
    selectedGadgets = cleanedGadgets.slice(0, 3);
  }

  // Store for reference and debugging
  state.currentGadgetPool = new Set(selectedGadgets);
  window.lastSelectedGadgets = [...selectedGadgets];

  console.log(`🎯 FINAL RESULT: ${classType} gadgets:`, selectedGadgets);
  console.log(
    `🔐 Stored in window.lastSelectedGadgets:`,
    window.lastSelectedGadgets
  );

  return selectedGadgets;
};

// createItemContainer function removed - now handled by SlotColumn component

// SlotColumn class for animation
// SlotColumn class removed - now in AnimationEngine.js

// Flag to prevent duplicate history entries
let isAddingToHistory = false;
let lastAddedLoadout = null;

// Slot machine instance
let slotMachine = null;

// Main functions for displaying loadouts
const displayLoadout = (classType) => {
  // Don't start if roulette is animating
  if (state.isRouletteAnimating) {
    console.log("⏸️ Roulette animating, skipping displayLoadout");
    return;
  }

  // Check if we're being called from within the overlay system
  const overlayOutput = document.getElementById("output");
  const isInOverlay = overlayOutput && (
    overlayOutput.closest(".slot-machine-overlay") || 
    overlayOutput.id === "output" && document.getElementById("output-backup")
  );
  
  if (
    window.overlayManager &&
    window.overlayManager.overlayState &&
    window.overlayManager.overlayState.isActive &&
    !isInOverlay
  ) {
    console.log("⏸️ Overlay active but not slot machine overlay, skipping displayLoadout");
    return;
  }

  // Get the filtered loadouts
  const filteredLoadouts = getFilteredLoadouts();
  const loadout = filteredLoadouts[classType];

  console.log(`Displaying loadout for ${classType} class`);

  // Select random weapon and specialization
  const selectedWeapon = getRandomUniqueItems(loadout.weapons, 1)[0];
  const selectedSpec = getRandomUniqueItems(loadout.specializations, 1)[0];

  // Select three unique gadgets
  console.log(`Available gadgets for ${classType}:`, loadout.gadgets);
  console.log(`Total available gadgets: ${loadout.gadgets.length}`);

  // Ensure we have enough gadgets available
  if (loadout.gadgets.length < 3) {
    console.error(
      `⚠️ Not enough gadgets for ${classType}! Only ${loadout.gadgets.length} available.`
    );
  }

  // Use the getUniqueGadgets function to ensure uniqueness
  const selectedGadgetsRaw = getUniqueGadgets(classType, loadout);

  // Make a defensive copy and ensure it's truly immutable
  const selectedGadgets = Object.freeze([...selectedGadgetsRaw]);

  console.log(`🎯 Final gadgets for display: ${selectedGadgets.join(", ")}`);
  console.log(`🎯 Gadget 1: "${selectedGadgets[0]}"`);
  console.log(`🎯 Gadget 2: "${selectedGadgets[1]}"`);
  console.log(`🎯 Gadget 3: "${selectedGadgets[2]}"`);

  // Store the selected gadgets globally for history recording
  window.currentDisplayedGadgets = [...selectedGadgets];
  console.log(
    `💾 Stored globally: window.currentDisplayedGadgets =`,
    window.currentDisplayedGadgets
  );

  // Final uniqueness verification
  const uniqueCheck = new Set(selectedGadgets);
  if (uniqueCheck.size !== selectedGadgets.length) {
    console.error("⚠️ CRITICAL ERROR: Duplicate gadgets detected!");
    console.error("This should be impossible with the current algorithm.");
    console.error("Selected:", selectedGadgets);
    console.error("Selected Raw:", selectedGadgetsRaw);
    console.error("Window stored:", window.lastSelectedGadgets);
  }

  // Create animation sequences for each gadget
  const createGadgetSpinSequence = (winningGadget, gadgetIndex) => {
    console.log(
      `🎬 Creating animation for gadget ${gadgetIndex + 1}: "${winningGadget}"`
    );
    console.log(`🎬 All selected gadgets:`, selectedGadgets);

    // Create a pool of gadgets for this specific animation slot that excludes the selected gadgets
    const otherSelectedGadgets = selectedGadgets.filter(
      (g) => g !== winningGadget
    );
    const availableForAnimation = loadout.gadgets.filter(
      (g) => !otherSelectedGadgets.includes(g)
    );

    console.log(`🎬 Other selected gadgets to exclude:`, otherSelectedGadgets);
    console.log(
      `🎬 Animation pool for ${winningGadget} has ${availableForAnimation.length} gadgets:`,
      availableForAnimation
    );

    // Shuffle the available gadgets to ensure variety
    const shuffledAnimation = [...availableForAnimation].sort(
      () => Math.random() - 0.5
    );

    // Create sequence with winning gadget at index 7 (last position)
    // Since position 0 shows index 7, we need to put the winner at the end
    const sequence = new Array(8); // Create array with 8 slots
    sequence[7] = winningGadget; // Winner goes at index 7

    // Fill remaining 7 positions with unique gadgets (no duplicates)
    const usedGadgets = new Set([winningGadget]);
    let availableIndex = 0;

    for (let i = 0; i < 7; i++) {
      // Fill indices 0-6
      if (shuffledAnimation.length > 0) {
        // Find next unused gadget
        let attempts = 0;
        while (attempts < shuffledAnimation.length * 2) {
          const candidateGadget =
            shuffledAnimation[availableIndex % shuffledAnimation.length];
          availableIndex++;

          if (!usedGadgets.has(candidateGadget)) {
            sequence[i] = candidateGadget;
            usedGadgets.add(candidateGadget);
            break;
          }
          attempts++;
        }

        // If we couldn't find a unique gadget, use any available one
        if (!sequence[i]) {
          sequence[i] = shuffledAnimation[(i - 1) % shuffledAnimation.length];
        }
      } else {
        // Fallback if no other gadgets available
        sequence[i] = winningGadget;
      }
    }

    console.log(
      `🎬 Final animation sequence for gadget ${gadgetIndex + 1}:`,
      sequence
    );
    console.log(
      `🎬 Winner at index 7: "${sequence[7]}" (should match "${winningGadget}")`
    );
    console.log(`🎬 Full sequence:`, sequence);

    // Check for duplicates in sequence
    const uniqueInSequence = new Set(sequence);
    if (uniqueInSequence.size !== sequence.length) {
      console.warn(
        `⚠️ DUPLICATES in animation sequence for gadget ${gadgetIndex + 1}!`
      );
      console.warn("Sequence:", sequence);
      console.warn("Unique items:", Array.from(uniqueInSequence));
    } else {
      console.log(
        `✅ No duplicates in animation sequence for gadget ${gadgetIndex + 1}`
      );
    }

    return sequence;
  };

  // Create gadget sequences
  const gadgetSequences = selectedGadgets.map((gadget, index) =>
    createGadgetSpinSequence(gadget, index)
  );

  // Initialize or update slot machine
  if (!slotMachine) {
    slotMachine = new SlotMachine({
      containerId: "output",
      onComplete: (error, results) => {
        if (error) {
          console.error("Slot machine error:", error);
          return;
        }
        // Pass columns to finalizeSpin for backwards compatibility
        finalizeSpin(results.columns);
      },
      onSpinStart: () => {
        console.log("Spin animation started");
      },
    });
  }

  // Configure slot machine with current loadout
  slotMachine.initialize({
    classType,
    loadout,
    selectedWeapon,
    selectedSpec,
    selectedGadgets,
    gadgetSequences,
    currentSpin: state.currentSpin,
    isFinalSpin: state.currentSpin === 1,
  });

  // Render slot machine
  const container = slotMachine.render();

  if (!container) {
    console.error("❌ CRITICAL: Failed to render slot machine");
    return;
  }

  // Start spin animation after delay
  slotMachine.startSpinWithDelay(SLOT_TIMING.ANIMATION_START_DELAY, {
    soundEnabled: state.soundEnabled,
  });
};

// Note: getAvailableClasses is already defined above at line 108

const displayRandomLoadout = () => {
  // Don't start if roulette is animating
  if (state.isRouletteAnimating) {
    console.log("⏸️ Roulette animating, skipping displayRandomLoadout");
    return;
  }

  try {
    console.log("🎯 displayRandomLoadout: Fetching available classes...");
    let availableClasses = getAvailableClasses();
    console.log(
      "🎯 displayRandomLoadout: Received available classes:",
      availableClasses
    );

    // If no classes are available (all excluded), show warning and use all classes
    if (availableClasses.length === 0) {
      console.warn("⚠️ All classes excluded! Using all classes instead.");
      alert(
        "All classes are excluded! Please uncheck at least one class to continue."
      );
      availableClasses = ["Light", "Medium", "Heavy"];
    }

    if (!availableClasses || availableClasses.length === 0) {
      console.error("❌ CRASH PREVENTION: No available classes after fallback");
      availableClasses = ["Light", "Medium", "Heavy"];
    }

    const randomClass =
      availableClasses[Math.floor(Math.random() * availableClasses.length)];
    console.log(`🎲 Random class selected: ${randomClass}`);

    if (!randomClass || !["Light", "Medium", "Heavy"].includes(randomClass)) {
      console.error(
        "❌ CRASH PREVENTION: Invalid random class selected, using Light"
      );
      displayLoadout("Light");
    } else {
      displayLoadout(randomClass);
    }
  } catch (error) {
    console.error("❌ CRASH PREVENTION: displayRandomLoadout failed:", error);
    // Emergency fallback - try to display Light class directly
    try {
      displayLoadout("Light");
    } catch (fallbackError) {
      console.error(
        "❌ CRITICAL: Emergency fallback also failed:",
        fallbackError
      );
    }
  }
};

// Animation function - now a wrapper for backwards compatibility
async function startSpinAnimation(columns) {
  // This function is now called by SlotMachine component
  // Just pass through to the animation engine
  const isFinalSpin = state.currentSpin === 1;

  try {
    await startSlotAnimation(columns, {
      isFinalSpin,
      soundEnabled: state.soundEnabled,
      onComplete: () => finalizeSpin(columns),
    });
  } catch (error) {
    console.error("Animation error:", error);
    state.isSpinning = false;
    finalizeSpin(columns);
  }
}

// Filter Tab System
function setupFilterSystem() {
  console.log("🔍 Setting up slide-out filter panel system...");

  // Get panel elements
  const filterToggleBtn = document.getElementById("filter-toggle");
  const filterPanel = document.getElementById("filter-panel");
  const filterOverlay = document.getElementById("filter-panel-overlay");
  const closePanelBtn = document.getElementById("close-filter-panel");
  const applyFiltersBtn = document.getElementById("apply-filters");

  if (!filterToggleBtn || !filterPanel || !filterOverlay || !closePanelBtn) {
    console.error("❌ Could not find required panel elements");
    return;
  }

  console.log("✅ Found all slide-out panel elements");

  // Panel state
  let isPanelOpen = false;

  // Function to open panel
  function openPanel() {
    if (isPanelOpen) return;

    isPanelOpen = true;
    console.log("🖱️ Opening filter panel");

    // Show overlay
    filterOverlay.classList.add("open");

    // Slide in panel
    filterPanel.classList.add("open");

    // Add visual state to button
    filterToggleBtn.classList.add("panel-open");

    // Lock body scroll
    document.body.style.overflow = "hidden";

    // Focus management
    filterPanel.setAttribute("aria-hidden", "false");
    closePanelBtn.focus();
  }

  // Function to close panel
  function closePanel() {
    if (!isPanelOpen) return;

    isPanelOpen = false;
    console.log("🖱️ Closing filter panel");

    // Hide overlay
    filterOverlay.classList.remove("open");

    // Slide out panel
    filterPanel.classList.remove("open");

    // Remove visual state from button
    filterToggleBtn.classList.remove("panel-open");

    // Restore body scroll
    document.body.style.overflow = "";

    // Focus management
    filterPanel.setAttribute("aria-hidden", "true");
    filterToggleBtn.focus();
  }

  // Event listeners
  filterToggleBtn.addEventListener("click", () => {
    if (isPanelOpen) {
      closePanel();
    } else {
      openPanel();
    }
  });
  closePanelBtn.addEventListener("click", closePanel);
  filterOverlay.addEventListener("click", closePanel);

  // Apply button closes panel
  applyFiltersBtn.addEventListener("click", () => {
    console.log("🔄 Applying filters and closing panel");

    // If a spin is currently in progress, don't do anything
    if (state.isSpinning) {
      console.log("⚠️ Cannot apply filters during spin");
      return;
    }

    // Force a test calculation of filtered loadouts to make sure filters work
    const testFiltered = getFilteredLoadouts();
    console.log("Filter test result:", testFiltered);

    closePanel();

    // Show confirmation message
    const filterStatus = document.createElement("span");
    filterStatus.textContent = "✓ Filters applied!";
    filterStatus.setAttribute(
      "style",
      "position:fixed!important;top:80px!important;left:50%!important;transform:translateX(-50%)!important;background:#00ff00!important;color:#000!important;padding:3px 10px!important;border-radius:15px!important;z-index:99999!important;font-size:12px!important;font-weight:bold!important;line-height:18px!important;height:24px!important;display:flex!important;align-items:center!important;white-space:nowrap!important;"
    );
    document.body.appendChild(filterStatus);

    // Remove after 2 seconds
    setTimeout(() => {
      if (filterStatus && filterStatus.parentNode) {
        filterStatus.parentNode.removeChild(filterStatus);
      }
    }, UI_TIMING.FILTER_STATUS_DURATION);
  });

  // Escape key closes panel
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && isPanelOpen) {
      closePanel();
    }
  });

  // Initialize panel as closed
  filterPanel.setAttribute("aria-hidden", "true");

  // Tab switching
  const tabButtons = document.querySelectorAll(".tab-button");
  const tabContents = document.querySelectorAll(".tab-content");

  if (tabButtons.length > 0 && tabContents.length > 0) {
    console.log(
      `✅ Found ${tabButtons.length} tab buttons and ${tabContents.length} tab contents`
    );

    tabButtons.forEach((button) => {
      button.addEventListener("click", () => {
        const tabName = button.getAttribute("data-tab");
        console.log(`🖱️ Tab button clicked: ${tabName}`);

        // Update active tab button
        tabButtons.forEach((btn) => btn.classList.remove("active"));
        button.classList.add("active");

        // Show selected tab content, hide others
        tabContents.forEach((content) => {
          if (content.id === `${tabName}-tab`) {
            content.style.display = "block";
            content.classList.add("active");
          } else {
            content.style.display = "none";
            content.classList.remove("active");
          }
        });

        // Reset class filters to ALL when switching tabs
        const allFilter = document.querySelector(
          '.class-filter[data-class="all"]'
        );
        if (allFilter && !allFilter.classList.contains("active")) {
          allFilter.click();
        }
      });
    });
  } else {
    console.error("❌ Could not find tab buttons or tab contents");
  }

  // Class filter buttons
  const classFilters = document.querySelectorAll(".class-filter");
  const itemCategories = document.querySelectorAll(".item-category");
  const filterCategories = document.querySelectorAll(".filter-category-card");

  if (classFilters.length > 0) {
    console.log(
      `✅ Found ${classFilters.length} class filters, ${itemCategories.length} item categories, ${filterCategories.length} filter categories`
    );

    classFilters.forEach((filter) => {
      filter.addEventListener("click", () => {
        const selectedClass = filter.getAttribute("data-class");
        console.log(`🖱️ Class filter clicked: ${selectedClass}`);

        // Update active filter button
        classFilters.forEach((btn) => btn.classList.remove("active"));
        filter.classList.add("active");

        // Get the active tab to determine which categories to filter
        const activeTabContent = document.querySelector(".tab-content.active");
        if (!activeTabContent) return;

        // Handle weapons tab (uses filter-category-card)
        if (activeTabContent.id === "weapons-tab") {
          const weaponCategories = activeTabContent.querySelectorAll(
            ".filter-category-card"
          );
          weaponCategories.forEach((category) => {
            const title = category.querySelector(".category-title");
            if (!title) return;

            const categoryClass = title.textContent
              .toLowerCase()
              .includes("light")
              ? "light"
              : title.textContent.toLowerCase().includes("medium")
              ? "medium"
              : title.textContent.toLowerCase().includes("heavy")
              ? "heavy"
              : "";

            if (selectedClass === "all" || categoryClass === selectedClass) {
              category.style.display = "block";
            } else {
              category.style.display = "none";
            }
          });
        } else {
          // Handle specs/gadgets tabs (uses item-category)
          const categories =
            activeTabContent.querySelectorAll(".item-category");
          categories.forEach((category) => {
            if (
              selectedClass === "all" ||
              category.classList.contains(`${selectedClass}-category`)
            ) {
              category.style.display = "block";
            } else {
              category.style.display = "none";
            }
          });
        }
      });
    });
  } else {
    console.error("❌ Could not find class filters or item categories");
  }

  // Category expand/collapse
  const categoryHeaders = document.querySelectorAll(".category-header");

  if (categoryHeaders.length > 0) {
    console.log(`✅ Found ${categoryHeaders.length} category headers`);

    categoryHeaders.forEach((header) => {
      header.addEventListener("click", () => {
        const category = header.parentElement;
        const itemGrid = category.querySelector(".item-grid");
        const toggleBtn = header.querySelector(".category-toggle");

        if (itemGrid && toggleBtn) {
          if (itemGrid.style.display === "none") {
            itemGrid.style.display = "grid";
            toggleBtn.classList.remove("collapsed");
            toggleBtn.textContent = "▼";
          } else {
            itemGrid.style.display = "none";
            toggleBtn.classList.add("collapsed");
            toggleBtn.textContent = "▶";
          }
        }
      });
    });
  } else {
    console.error("❌ Could not find category headers");
  }

  // Search functionality
  const searchInput = document.getElementById("filter-search");

  if (searchInput) {
    console.log("✅ Found search input");

    searchInput.addEventListener("input", () => {
      const searchTerm = searchInput.value.toLowerCase();
      const allItems = document.querySelectorAll(".item-checkbox");

      console.log(
        `🔍 Searching for: ${searchTerm} (found ${allItems.length} items)`
      );

      allItems.forEach((item) => {
        const itemName =
          item.querySelector("span")?.textContent.toLowerCase() || "";
        if (itemName.includes(searchTerm)) {
          item.style.display = "flex";
        } else {
          item.style.display = "none";
        }
      });
    });
  } else {
    console.error("❌ Could not find search input");
  }

  // Apply button functionality - handled above in proper scope

  // Reset button functionality
  const resetBtn = document.getElementById("reset-filters");
  if (resetBtn) {
    console.log("✅ Found reset button");

    resetBtn.addEventListener("click", () => {
      console.log("🔄 Resetting all filters...");

      // Select all checkboxes in the filter panel
      const allCheckboxes = document.querySelectorAll(
        '#filter-panel input[type="checkbox"]'
      );

      // Check all checkboxes
      allCheckboxes.forEach((checkbox) => {
        checkbox.checked = true;
      });

      // No longer using gadget queues - each spin gets fresh random selection

      // Show confirmation message
      const filterStatus = document.createElement("div");
      filterStatus.className = "filter-status";
      filterStatus.textContent = "All filters reset!";
      filterStatus.style.background = "linear-gradient(to right, #666, #888)";
      document.body.appendChild(filterStatus);

      // Remove after 2 seconds
      setTimeout(() => {
        if (filterStatus && filterStatus.parentNode) {
          filterStatus.parentNode.removeChild(filterStatus);
        }
      }, UI_TIMING.FILTER_STATUS_DURATION);

      console.log("✅ All filters have been reset");
    });
  } else {
    console.error("❌ Could not find reset button");
  }

  // Setup event delegation for Select All functionality
  setupSelectAllEventDelegation();

  console.log("✅ Filter system setup complete");
}

// Setup event delegation for Select All checkboxes - survives DOM rebuilds
function setupSelectAllEventDelegation() {
  console.log("🎯 Setting up Select All event delegation");

  // Use event delegation on the filter panel
  const filterPanel = document.getElementById("filter-panel");
  if (!filterPanel) {
    console.error("❌ Filter panel not found for event delegation");
    return;
  }

  // Single delegated listener for all checkbox interactions
  filterPanel.addEventListener(
    "change",
    function (event) {
      const target = event.target;

      // Check if it's a checkbox
      if (target.type !== "checkbox") return;

      // Handle Select All checkbox clicks
      if (
        target.hasAttribute("data-type") &&
        target.getAttribute("data-type").endsWith("-selectall")
      ) {
        const classType = target.getAttribute("data-class");
        const baseType = target
          .getAttribute("data-type")
          .replace("-selectall", "");
        const isChecked = target.checked;

        console.log(
          `🔄 Select All ${classType} ${baseType} clicked: ${isChecked}`
        );

        // Find and update all related item checkboxes
        const relatedBoxes = filterPanel.querySelectorAll(
          `input[data-type="${baseType}"][data-class="${classType}"]:not([data-type$="selectall"])`
        );

        relatedBoxes.forEach((box) => {
          box.checked = isChecked;
        });
      }
      // Handle individual item checkbox clicks
      else if (
        target.hasAttribute("data-type") &&
        target.hasAttribute("data-class")
      ) {
        const classType = target.getAttribute("data-class");
        const itemType = target.getAttribute("data-type");

        // Find and update the related Select All checkbox
        const selectAllBox = filterPanel.querySelector(
          `input[data-type="${itemType}-selectall"][data-class="${classType}"]`
        );

        if (selectAllBox) {
          updateSelectAllState(selectAllBox);
        }
      }
    },
    true
  ); // Use capture phase to ensure we catch events

  console.log("✅ Select All event delegation setup complete");
}

// Helper function to get included classes from master checkboxes
function getIncludedClasses() {
  const classes = [];
  const lightCheckbox = document.getElementById("exclude-light");
  const mediumCheckbox = document.getElementById("exclude-medium");
  const heavyCheckbox = document.getElementById("exclude-heavy");

  if (lightCheckbox && lightCheckbox.checked) classes.push("light");
  if (mediumCheckbox && mediumCheckbox.checked) classes.push("medium");
  if (heavyCheckbox && heavyCheckbox.checked) classes.push("heavy");

  return classes;
}

// Helper function to update Select All checkbox state (checked/indeterminate/unchecked)
function updateSelectAllState(selectAllCheckbox) {
  const classType = selectAllCheckbox.getAttribute("data-class");
  const baseType = selectAllCheckbox
    .getAttribute("data-type")
    .replace("-selectall", "");

  // Find all related item checkboxes
  const relatedBoxes = document.querySelectorAll(
    `#filter-panel input[data-type="${baseType}"][data-class="${classType}"]:not([data-type$="selectall"])`
  );

  if (relatedBoxes.length === 0) return;

  let checkedCount = 0;
  relatedBoxes.forEach((box) => {
    if (box.checked) checkedCount++;
  });

  // Update Select All state
  if (checkedCount === 0) {
    selectAllCheckbox.checked = false;
    selectAllCheckbox.indeterminate = false;
  } else if (checkedCount === relatedBoxes.length) {
    selectAllCheckbox.checked = true;
    selectAllCheckbox.indeterminate = false;
  } else {
    selectAllCheckbox.checked = false;
    selectAllCheckbox.indeterminate = true;
  }
}

// Helper function to update all Select All checkboxes
function updateAllSelectAllStates() {
  const selectAllCheckboxes = document.querySelectorAll(
    '#filter-panel input[data-type$="selectall"]'
  );
  selectAllCheckboxes.forEach((checkbox) => updateSelectAllState(checkbox));
}

// Helper function to update category visibility based on included classes
function updateCategoryVisibility(includedClasses) {
  // Get all tab contents
  const tabContents = document.querySelectorAll(".tab-content");

  tabContents.forEach((tabContent) => {
    // For weapons tab
    const weaponCategories = tabContent.querySelectorAll(
      ".filter-category-card"
    );
    weaponCategories.forEach((category) => {
      const title = category.querySelector(".category-title");
      if (title) {
        const categoryClass = title.textContent.toLowerCase().includes("light")
          ? "light"
          : title.textContent.toLowerCase().includes("medium")
          ? "medium"
          : title.textContent.toLowerCase().includes("heavy")
          ? "heavy"
          : "";

        if (categoryClass && !includedClasses.includes(categoryClass)) {
          category.style.display = "none";
        } else if (categoryClass) {
          category.style.display = "block";
        }
      }
    });

    // For specs/gadgets tabs
    const itemCategories = tabContent.querySelectorAll(".item-category");
    itemCategories.forEach((category) => {
      const isLight = category.classList.contains("light-category");
      const isMedium = category.classList.contains("medium-category");
      const isHeavy = category.classList.contains("heavy-category");

      if (
        (isLight && !includedClasses.includes("light")) ||
        (isMedium && !includedClasses.includes("medium")) ||
        (isHeavy && !includedClasses.includes("heavy"))
      ) {
        category.style.display = "none";
      } else {
        category.style.display = "block";
      }
    });
  });
}

// Function to populate filter items from loadouts
function populateFilterItems() {
  console.log("🔄 Populating filter items...");

  // Save current checkbox states before clearing
  const savedStates = {};
  const allCheckboxes = document.querySelectorAll(
    '#filter-panel input[type="checkbox"][value]'
  );
  allCheckboxes.forEach((checkbox) => {
    const key = `${checkbox.getAttribute("data-type")}-${checkbox.getAttribute(
      "data-class"
    )}-${checkbox.value}`;
    savedStates[key] = checkbox.checked;
  });

  // Get included classes from master checkboxes
  const includedClasses = getIncludedClasses();
  console.log("📋 Included classes:", includedClasses);

  // Get weapon grid containers
  const lightWeaponsGrid = document.getElementById("light-weapons-grid");
  const mediumWeaponsGrid = document.getElementById("medium-weapons-grid");
  const heavyWeaponsGrid = document.getElementById("heavy-weapons-grid");

  // Get specialization grid containers
  const lightSpecsGrid = document.getElementById("light-specializations-grid");
  const mediumSpecsGrid = document.getElementById(
    "medium-specializations-grid"
  );
  const heavySpecsGrid = document.getElementById("heavy-specializations-grid");

  // Get gadgets grid containers
  const lightGadgetsGrid = document.getElementById("light-gadgets-grid");
  const mediumGadgetsGrid = document.getElementById("medium-gadgets-grid");
  const heavyGadgetsGrid = document.getElementById("heavy-gadgets-grid");

  // Clear existing items if any
  if (lightWeaponsGrid) lightWeaponsGrid.innerHTML = "";
  if (mediumWeaponsGrid) mediumWeaponsGrid.innerHTML = "";
  if (heavyWeaponsGrid) heavyWeaponsGrid.innerHTML = "";
  if (lightSpecsGrid) lightSpecsGrid.innerHTML = "";
  if (mediumSpecsGrid) mediumSpecsGrid.innerHTML = "";
  if (heavySpecsGrid) heavySpecsGrid.innerHTML = "";
  if (lightGadgetsGrid) lightGadgetsGrid.innerHTML = "";
  if (mediumGadgetsGrid) mediumGadgetsGrid.innerHTML = "";
  if (heavyGadgetsGrid) heavyGadgetsGrid.innerHTML = "";

  // Hide/show category containers based on included classes
  updateCategoryVisibility(includedClasses);

  // Only populate grids for included classes
  if (includedClasses.includes("light")) {
    // Populate Light items
    populateItemGrid(
      lightWeaponsGrid,
      loadouts.Light.weapons,
      "weapon",
      "light",
      "Light Weapons",
      savedStates
    );
    populateItemGrid(
      lightSpecsGrid,
      loadouts.Light.specializations,
      "specialization",
      "light",
      "Light Specials",
      savedStates
    );
    populateItemGrid(
      lightGadgetsGrid,
      loadouts.Light.gadgets,
      "gadget",
      "light",
      "Light Gadgets",
      savedStates
    );
  }

  if (includedClasses.includes("medium")) {
    // Populate Medium items
    populateItemGrid(
      mediumWeaponsGrid,
      loadouts.Medium.weapons,
      "weapon",
      "medium",
      "Medium Weapons",
      savedStates
    );
    populateItemGrid(
      mediumSpecsGrid,
      loadouts.Medium.specializations,
      "specialization",
      "medium",
      "Medium Specials",
      savedStates
    );
    populateItemGrid(
      mediumGadgetsGrid,
      loadouts.Medium.gadgets,
      "gadget",
      "medium",
      "Medium Gadgets",
      savedStates
    );
  }

  if (includedClasses.includes("heavy")) {
    // Populate Heavy items
    populateItemGrid(
      heavyWeaponsGrid,
      loadouts.Heavy.weapons,
      "weapon",
      "heavy",
      "Heavy Weapons",
      savedStates
    );
    populateItemGrid(
      heavySpecsGrid,
      loadouts.Heavy.specializations,
      "specialization",
      "heavy",
      "Heavy Specials",
      savedStates
    );
    populateItemGrid(
      heavyGadgetsGrid,
      loadouts.Heavy.gadgets,
      "gadget",
      "heavy",
      "Heavy Gadgets",
      savedStates
    );
  }

  console.log("✅ Filter items population complete");

  // Select All functionality now uses event delegation - no need to reinitialize
  updateAllSelectAllStates();

  // Setup tab content search placeholder update
  setupTabSearchPlaceholder();
}

// Helper function to populate item grids
function populateItemGrid(
  gridElement,
  items,
  type,
  classType,
  labelText,
  savedStates = {}
) {
  if (!gridElement || !items || items.length === 0) {
    console.warn(`⚠️ Could not populate ${classType} ${type} grid`);
    return;
  }

  console.log(`✅ Adding ${items.length} ${classType} ${type}s`);

  // Add Select All option first
  const selectAllItem = document.createElement("label");
  selectAllItem.className = "item-checkbox select-all-checkbox";
  selectAllItem.innerHTML = `
    <input type="checkbox" checked data-type="${type}-selectall" data-class="${classType}">
    <span class="checkbox-box"></span>
    <span class="checkbox-label"><strong>Select All ${labelText}</strong></span>
  `;
  gridElement.appendChild(selectAllItem);

  // Sort items alphabetically, then add individual items
  const sortedItems = [...items].sort((a, b) => a.localeCompare(b));
  sortedItems.forEach((item) => {
    const key = `${type}-${classType}-${item}`;
    const isChecked = savedStates[key] !== undefined ? savedStates[key] : true;

    const itemElement = document.createElement("label");
    itemElement.className = "item-checkbox";
    itemElement.innerHTML = `
      <input type="checkbox" value="${item}" ${
      isChecked ? "checked" : ""
    } data-type="${type}" data-class="${classType}">
      <span class="checkbox-box"></span>
      <span class="checkbox-label">${item}</span>
    `;
    gridElement.appendChild(itemElement);
  });
}

// Function to update search placeholder based on active tab
function setupTabSearchPlaceholder() {
  const searchInput = document.getElementById("filter-search");
  const tabButtons = document.querySelectorAll(".tab-button");

  if (!searchInput || tabButtons.length === 0) return;

  // Set initial placeholder
  searchInput.placeholder = "Search weapons...";

  // Update placeholder when tab changes
  tabButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const tabName = button.getAttribute("data-tab");
      searchInput.placeholder = `Search ${tabName}...`;
    });
  });
}

async function finalizeSpin(columns) {
  console.log("⚠️ Running finalizeSpin with currentSpin:", state.currentSpin);

  // Check if there are more spins to do
  if (state.currentSpin > 1) {
    console.log(
      "🔄 Not final spin, continue sequence. Current spin:",
      state.currentSpin
    );

    // Play transition sound between spins
    if (state.soundEnabled) {
      const transitionSound = document.getElementById("transitionSound");
      if (transitionSound) {
        transitionSound.currentTime = 0;
        transitionSound.volume = SOUND_VOLUMES.TRANSITION;
        transitionSound.play().catch(() => {});
      }
    }

    // Decrement spin counter
    state.currentSpin--;

    // Update UI to show remaining spins
    updateSpinCountdown(state.currentSpin);

    // Clear isSpinning flag to allow next spin
    state.isSpinning = false;

    // Start next spin after a short delay
    setTimeout(() => {
      console.log(
        "🎲 Starting next spin in sequence. Remaining:",
        state.currentSpin
      );
      if (state.selectedClass === "random") {
        displayRandomLoadout();
      } else {
        displayLoadout(state.selectedClass);
      }
    }, UI_TIMING.NEXT_SPIN_DELAY);

    return; // Exit early - we're handling next spin
  }

  console.log("🎯 Final spin, recording loadout");

  // Add celebration effects only if we're in a valid spin sequence
  if (window.isValidSpinSequence && window.userHasInteracted) {
    addCelebrationEffects();
  } else {
    console.log("Skipping celebration - not in valid spin sequence or no user interaction");
  }

  // Also ensure spinning sound is fully stopped (mobile fix)
  const spinningSound = document.getElementById("spinningSound");
  if (spinningSound && !spinningSound.paused) {
    spinningSound.pause();
    spinningSound.currentTime = 0;
    try {
      spinningSound.src = spinningSound.src; // Force reload on mobile
    } catch (e) {
      console.log("Mobile audio reload failed:", e);
    }
  }

  // Prevent duplicate processing
  if (isAddingToHistory) {
    console.log("🛑 Already adding to history, preventing duplicate call");
    return;
  }

  state.isSpinning = false;

  // Re-enable class buttons after spin is complete
  // classButtons.forEach((button) => {
  //   button.removeAttribute("disabled");
  // });

  // DIRECT BUTTON MANIPULATION - 100% reliable method
  console.log("🔒 Getting direct references to all spin buttons");
  // Get a direct reference to each button by ID if possible
  const spinBtns = document.querySelectorAll(".spin-button");
  console.log(`Found ${spinBtns.length} spin buttons`);

  // Force disable ALL spin buttons EXCEPT the main spin button
  spinBtns.forEach((btn, index) => {
    // Skip the main spin button
    if (btn.id === "main-spin-button") {
      console.log(`Skipping main spin button`);
      return;
    }

    console.log(`Disabling spin button ${index + 1}`);
    // Use all possible disabling methods to guarantee they work
    btn.disabled = true;
    btn.setAttribute("disabled", "disabled");
    btn.classList.add("dimmed");

    // Add a data attribute for debugging
    btn.dataset.disabledAt = new Date().toISOString();

    // Apply inline style as a last resort
    btn.style.opacity = "0.5";
    btn.style.pointerEvents = "none";
  });

  // Check if items were passed directly (from overlay slot machine)
  let finalItems = null;
  
  if (columns && Array.isArray(columns) && columns.length >= 5) {
    console.log("📦 Using passed items data from overlay slot machine");
    finalItems = columns;
  } else {
    console.log("🔍 Getting items from DOM");
    // Get the final selections from the DOM
    const itemContainers = document.querySelectorAll(
      "#output .items-container .item-container"
    );
    
    if (itemContainers && itemContainers.length > 0) {
      console.log(`🔍 Found ${itemContainers.length} item containers in DOM`);
    }
  }

  if (finalItems || (itemContainers && itemContainers.length > 0)) {
    isAddingToHistory = true; // Set the flag to prevent duplicate calls
    console.log("🔒 Setting isAddingToHistory flag to prevent duplicates");

    // ✅ Save the selected class BEFORE doing anything else
    let savedClass = state.selectedClass;
    console.log("💾 Selected Class Before Processing:", savedClass);

    // Class selection code removed - commenting out
    // if (savedClass && savedClass.toLowerCase() === "random") {
    //   const activeClassButton = document.querySelector(
    //     ".class-button.selected:not([data-class='Random'])"
    //   );
    //   savedClass = activeClassButton
    //     ? activeClassButton.dataset.class
    //     : savedClass;
    // }

    // Process items based on source
    let selectedItems;
    
    if (finalItems) {
      // Items were passed directly - extract the names
      selectedItems = finalItems.map(item => {
        if (typeof item === 'object' && item.name) {
          return item.name;
        }
        return item;
      });
      console.log("📦 Extracted items from passed data:", selectedItems);
    } else {
      // BEFORE processing anything, let's debug the containers
      console.log(`🔍 DEBUGGING: Found ${itemContainers.length} item containers`);
      itemContainers.forEach((container, index) => {
        console.log(`Container ${index}:`, {
          "data-winning-gadget": container.dataset.winningGadget,
          "data-original-gadget": container.dataset.originalGadget,
          "data-gadget-position": container.dataset.gadgetPosition,
          classList: Array.from(container.classList),
        });
      });

      // Get all the selected items - use data attributes for gadgets to ensure accuracy
      selectedItems = Array.from(itemContainers).map((container, index) => {
      console.log(`📋 Processing container ${index}:`, container);

      // For gadgets (index 2, 3, 4), use multiple fallback methods
      if (index >= 2) {
        const gadgetIndex = index - 2; // Convert to 0-based gadget index

        // Method 1: Try data attribute on container
        const winningGadget = container.dataset.winningGadget;
        const originalGadget = container.dataset.originalGadget;

        console.log(`📋 Gadget ${gadgetIndex + 1} data attributes:`, {
          winningGadget,
          originalGadget,
          position: container.dataset.gadgetPosition,
        });

        // Method 2: Try data attribute on scroll container
        const scrollContainer = container.querySelector(".scroll-container");
        const scrollWinningGadget = scrollContainer?.dataset.winningGadget;

        // Method 3: Use global storage as ultimate fallback
        const globalGadget =
          window.currentDisplayedGadgets &&
          window.currentDisplayedGadgets[gadgetIndex];

        // Debug what's actually visible in this container
        const allItems = scrollContainer?.querySelectorAll(".itemCol");
        if (allItems && allItems.length > 0) {
          console.log(
            `🔍 Visual debug for gadget ${gadgetIndex + 1} - found ${
              allItems.length
            } items:`
          );
          const containerRect = container.getBoundingClientRect();
          const visibleTexts = Array.from(allItems).map((item, i) => {
            const text = item.querySelector("p")?.textContent;
            const isVisible = item.getBoundingClientRect().height > 0;
            const rect = item.getBoundingClientRect();
            const isInViewport =
              rect.top >= containerRect.top &&
              rect.bottom <= containerRect.bottom;
            return `[${i}] ${text} (visible: ${isVisible}, inViewport: ${isInViewport}, transform: ${
              getComputedStyle(item.parentElement).transform
            })`;
          });
          console.log(`🔍 All items in container:`, visibleTexts);
          console.log(`🔍 First item should be: "${winningGadget}"`);
          console.log(
            `🔍 Container transform: ${
              getComputedStyle(scrollContainer).transform
            }`
          );

          // Check what's actually in the center of the container
          const containerCenter = containerRect.top + containerRect.height / 2;
          const actualVisibleItem = Array.from(allItems).find((item) => {
            const itemRect = item.getBoundingClientRect();
            return (
              itemRect.top <= containerCenter &&
              itemRect.bottom >= containerCenter
            );
          });

          if (actualVisibleItem) {
            const actualText =
              actualVisibleItem.querySelector("p")?.textContent;
            console.log(`🎯 ACTUAL VISIBLE ITEM IN CENTER: "${actualText}"`);
            if (actualText !== winningGadget) {
              console.error(
                `🚨 MISMATCH! Expected: "${winningGadget}", Actually visible: "${actualText}"`
              );
            }
          }
        }

        console.log(
          `📋 All gadget retrieval methods for gadget ${gadgetIndex + 1}:`,
          {
            containerData: winningGadget,
            originalData: originalGadget,
            scrollData: scrollWinningGadget,
            globalFallback: globalGadget,
          }
        );

        // Use the first available method
        if (winningGadget) {
          console.log(`✅ Using container data: "${winningGadget}"`);
          return winningGadget;
        } else if (originalGadget) {
          console.log(`⚠️ Using original-gadget fallback: "${originalGadget}"`);
          return originalGadget;
        } else if (scrollWinningGadget) {
          console.log(
            `⚠️ Using scroll container data: "${scrollWinningGadget}"`
          );
          return scrollWinningGadget;
        } else if (globalGadget) {
          console.log(`🔄 Using global fallback: "${globalGadget}"`);
          return globalGadget;
        } else {
          console.error(`❌ All methods failed for gadget ${gadgetIndex + 1}`);
          return "Unknown";
        }
      }

      // For weapons and specializations, use the visible item method
      const scrollContainer = container.querySelector(".scroll-container");
      if (!scrollContainer) {
        console.error(`❌ No scroll container found for index ${index}`);
        return "Unknown";
      }

      // Find all item columns
      const allItems = scrollContainer.querySelectorAll(".itemCol");
      console.log(`📋 Found ${allItems.length} items in container ${index}`);

      // Use the EXACT method from old working version
      const visibleItem = Array.from(allItems).find((item) => {
        const rect = item.getBoundingClientRect();
        const containerRect = container.getBoundingClientRect();
        return (
          rect.top >= containerRect.top &&
          rect.bottom <= containerRect.bottom &&
          rect.height > 0 &&
          rect.width > 0
        );
      });

      if (!visibleItem) {
        console.error(`❌ No visible item found for index ${index}`);
        return "Unknown";
      }
      const itemText = visibleItem.querySelector("p")?.innerText.trim();
      console.log(
        `📋 ${
          index === 0 ? "Weapon" : "Specialization"
        } from visible item: "${itemText}"`
      );
      return itemText || "Unknown";
    });
    } // End of else block for DOM processing

    // Debug the selected items
    console.log("🔍 Selected Items:", selectedItems);

    // Make sure we have all items and none are 'Unknown'
    if (selectedItems.length >= 5 && !selectedItems.includes("Unknown")) {
      console.log("💾 Selected items for history:", selectedItems);

      // Create a loadout string to check for duplicates
      const weapon = selectedItems[0];
      const specialization = selectedItems[1];
      const gadgets = selectedItems.slice(2, 5);

      // Check for duplicate gadgets in the final result
      const gadgetSet = new Set(gadgets);
      if (gadgetSet.size !== gadgets.length) {
        console.error("🚨 DUPLICATE GADGETS IN FINAL RESULT!");
        console.error("Gadgets from DOM:", gadgets);
        console.error("Unique gadgets:", Array.from(gadgetSet));
      }

      const loadoutString = `${savedClass}-${weapon}-${specialization}-${gadgets.join(
        "-"
      )}`;
      console.log("🚨 Loadout to be recorded:", loadoutString);
      console.log("Gadgets being recorded:", gadgets);
      console.log("Last Added Loadout:", lastAddedLoadout);

      if (loadoutString === lastAddedLoadout) {
        console.log("🔍 Duplicate loadout detected, not adding to history");
        isAddingToHistory = false;
        // Reset the class even if we don't add to history
        state.selectedClass = null;
        return;
      }
      lastAddedLoadout = loadoutString;

      // Increment the global loadouts counter
      // Counter functionality removed
      // console.log("🚀🚀🚀 ABOUT TO CALL incrementLoadoutCounter 🚀🚀🚀");
      // await incrementLoadoutCounter();
      // console.log("✅✅✅ incrementLoadoutCounter COMPLETED ✅✅✅");

      // Also fetch and update counter display as backup
      // console.log('🚀🚀🚀 ABOUT TO CALL fetchAndUpdateCounter 🚀🚀🚀');
      // fetchAndUpdateCounter();

      // Display roast immediately below the slot machine and get the generated roast
      displayRoastBelowSlotMachine(savedClass, weapon, specialization, gadgets)
        .then((generatedRoast) => {
          // Add to history after a delay (helps prevent race conditions) with the same roast
          setTimeout(() => {
            // Use savedClass instead of state.selectedClass and pass the generated roast
            addToHistory(
              savedClass,
              weapon,
              specialization,
              gadgets,
              generatedRoast
            );

            console.log("✅ Successfully added to history:", loadoutString);
            isAddingToHistory = false; // Reset the flag
          }, UI_TIMING.HISTORY_ADD_DELAY);
        })
        .catch((error) => {
          console.error(
            "❌ Error displaying roast, but still adding to history:",
            error
          );
          // Still add to history even if roast fails
          setTimeout(() => {
            addToHistory(savedClass, weapon, specialization, gadgets, "");
            console.log("✅ Added to history without roast:", loadoutString);
            isAddingToHistory = false; // Reset the flag
          }, UI_TIMING.HISTORY_ADD_DELAY);
        });

      // Reset the class AFTER saving it
      state.selectedClass = null;
    } else {
      console.warn(
        "⚠️ Could not record loadout - incomplete data:",
        selectedItems
      );
      isAddingToHistory = false; // Reset the flag
      // Reset selected class even if we don't add to history
      state.selectedClass = null;
    }
  } else {
    isAddingToHistory = false; // Reset the flag
    // Reset selected class
    state.selectedClass = null;
  }

  // REMOVED re-enabling code - buttons will stay disabled until user selects a class
  
  // Remove the slot machine active class to show selection display again on desktop
  document.body.classList.remove('slot-machine-active');
  
  console.log(
    "✅ Spin completed and finalized! Buttons remain disabled until class selection."
  );
}

// Update UI functions
function updateSpinCountdown(spinsRemaining) {
  console.log(`🔢 Updating spin countdown: ${spinsRemaining} spins left`);

  // Disabled - using RouletteAnimationSystem instead
  /*
  const spinButtons = document.querySelectorAll(".spin-button");

  spinButtons.forEach((button) => {
    const spinValue = parseInt(button.dataset.spins);
    button.classList.remove("active", "selected");

    if (spinValue === spinsRemaining) {
      button.classList.add("active", "selected");
      button.style.animation = `moveLeft ${CELEBRATION_EFFECTS.BUTTON_ANIMATION_DURATION}ms ease-in-out forwards`;
    } else {
      button.style.animation = "none";
    }
  });
  */
}

// Main spin function
const spinLoadout = () => {
  // Class selection check removed - now only check if spinning
  if (state.isSpinning) {
    console.log("⚠️ Cannot start spin - already spinning");
    return;
  }

  console.log(`🌀 Starting spin sequence: ${state.totalSpins} total spins`);

  state.isSpinning = true;
  state.currentSpin = state.totalSpins;

  // Class button disabling removed - class selection system deprecated
  // document.querySelectorAll(".class-button").forEach((btn) => {
  //   btn.setAttribute("disabled", "true");
  // });

  document.getElementById("output").scrollIntoView({
    behavior: "smooth",
    block: "center",
  });

  // Update visuals for spin
  updateSpinCountdown(state.currentSpin);

  console.log(`🎲 Starting first spin with currentSpin = ${state.currentSpin}`);
  console.log(
    `🔍 spinLoadout() called with state.selectedClass = "${
      state.selectedClass
    }" (type: ${typeof state.selectedClass})`
  );

  // Start the first spin
  // Use the selected class if available
  if (
    state.selectedClass &&
    ["Light", "Medium", "Heavy"].includes(state.selectedClass)
  ) {
    console.log(`🎯 Using selected class: ${state.selectedClass}`);
    displayLoadout(state.selectedClass);
  } else if (state.selectedClass === "random" || !state.selectedClass) {
    console.log("🎲 Random mode - selecting from available classes");
    displayRandomLoadout();
  } else {
    console.log(
      `⚠️ Unknown class selection: ${state.selectedClass}, using random`
    );
    displayRandomLoadout();
  }
};

// Make spinLoadout globally accessible
window.spinLoadout = spinLoadout;

// Make displayLoadout globally accessible for overlay manager
window.displayLoadout = displayLoadout;

// Make finalizeSpin globally accessible for overlay manager
window.finalizeSpin = finalizeSpin;

// Make other functions globally accessible for slot machine wrapper
window.getFilteredLoadouts = getFilteredLoadouts;
window.getRandomUniqueItems = getRandomUniqueItems;
window.getUniqueGadgets = getUniqueGadgets;

// Override displayLoadout if new slot machine is available
setTimeout(() => {
  if (typeof window.displayLoadoutWithNewSlotMachine === 'function') {
    console.log('🎰 Overriding displayLoadout with new slot machine implementation');
    window.displayLoadout = window.displayLoadoutWithNewSlotMachine;
  }
}, 100);

// Celebration effects function
function addCelebrationEffects() {
  const itemsContainer = document.querySelector("#output .items-container");
  if (!itemsContainer) return;

  // === Move all .locked-tag elements to body and top layer ===
  const lockedTags = document.querySelectorAll(".locked-tag");
  lockedTags.forEach((tag) => {
    // Get the bounding rect of the tag's parent (item container)
    const parent = tag.parentElement;
    const parentRect = parent.getBoundingClientRect();
    // Set tag to fixed position, centered above its parent
    tag.style.position = "fixed";
    tag.style.left = `${parentRect.left + parentRect.width / 2}px`;
    tag.style.top = `${parentRect.top - 10}px`;
    tag.style.transform = "translate(-50%, 0)";
    tag.style.zIndex = "11000";
    tag.style.pointerEvents = "none";
    document.body.appendChild(tag);
  });

  // Play celebration sound at the beginning of the animation
  if (state.soundEnabled && window.isValidSpinSequence) {
    const celebrationSound = document.getElementById("celebrationSound");
    if (celebrationSound) {
      celebrationSound.volume = SOUND_VOLUMES.CELEBRATION;
      window.safePlay(celebrationSound);
    }
  }

  // Add a "POP. POUR. PERFORM." banner
  const banner = document.createElement("div");
  banner.className = "celebration-banner";
  banner.innerHTML = `
    <div class="banner-text">POP. POUR. PERFORM.</div>
    <div class="banner-subtext">Ready to dominate The Finals</div>
  `;
  itemsContainer.appendChild(banner);

  // Flash the entire loadout container
  itemsContainer.classList.add("celebration-flash");

  // Celebration words array
  const celebrationWords = [
    "LETSGO!",
    "WOW!",
    "OZPUZE!",
    "SCOTTY!",
    "JUNE!",
    "OH MY!",
    "HOLTOW",
    "DISSUN",
    "ISSULT",
    "VAIIYA",
    "CNS",
    "ENSIMO",
  ];

  // Add floating celebration words
  const positions = [
    { x: "20%", y: "30%" },
    { x: "80%", y: "40%" },
    { x: "50%", y: "20%" },
    { x: "30%", y: "60%" },
    { x: "70%", y: "50%" },
  ];

  positions.forEach((pos, index) => {
    setTimeout(() => {
      const floatingText = document.createElement("div");
      floatingText.className = "floating-celebration-text";
      // Pick a random word from the celebration words
      floatingText.textContent =
        celebrationWords[Math.floor(Math.random() * celebrationWords.length)];
      floatingText.style.left = pos.x;
      floatingText.style.top = pos.y;
      itemsContainer.appendChild(floatingText);

      // Remove after animation
      setTimeout(
        () => floatingText.remove(),
        CELEBRATION_EFFECTS.FLOATING_TEXT_DURATION
      );
    }, index * CELEBRATION_EFFECTS.FLOATING_TEXT_STAGGER);
  });

  // Remove banner after 3 seconds
  setTimeout(() => {
    banner.classList.add("fade-out");
    setTimeout(() => banner.remove(), CELEBRATION_EFFECTS.BANNER_FADE_DURATION);
    itemsContainer.classList.remove("celebration-flash");
    // Do NOT restore locked tags to original containers; keep them fixed in place
  }, CELEBRATION_EFFECTS.BANNER_DISPLAY_DURATION);
}

// Screen shake and particle effects removed - now in AnimationEngine.js

// Global function to stop all audio (useful for mobile)
window.stopAllAudio = function () {
  const allAudio = document.querySelectorAll("audio");
  allAudio.forEach((audio) => {
    audio.pause();
    audio.currentTime = 0;
    // Special handling for looped audio
    if (audio.loop) {
      audio.loop = false;
      const src = audio.src;
      audio.removeAttribute("src");
      audio.load();
      setTimeout(() => {
        audio.src = src;
        audio.loop = true;
      }, UI_TIMING.AUDIO_RELOAD_DELAY);
    }
  });
  console.log("All audio stopped");
};

// Loadout history functions
async function addToHistory(
  classType,
  selectedWeapon,
  selectedSpec,
  selectedGadgets,
  providedRoast = null
) {
  // Handle null/undefined classType to prevent TypeError
  if (!classType) {
    console.warn(
      "addToHistory called with null/undefined classType, defaulting to 'Unknown'"
    );
    classType = "Unknown";
  }

  const historyList = document.getElementById("history-list");
  const newEntry = document.createElement("div");
  newEntry.classList.add("history-entry");
  newEntry.setAttribute("data-class", classType.toLowerCase());

  // Generate a fun name based on the loadout
  const loadoutName = generateLoadoutName(
    classType,
    selectedWeapon,
    selectedSpec
  );

  // Add spicy class if it's a weird combo
  if (isSpicyLoadout(selectedWeapon, selectedSpec, selectedGadgets)) {
    newEntry.classList.add("spicy-loadout");
  }

  // Generate optional badge - DISABLED
  // const optionalBadge = generateOptionalBadge(
  //   selectedWeapon,
  //   selectedSpec,
  //   selectedGadgets,
  //   classType
  // );
  // const badgeHTML = optionalBadge
  //   ? `<div class="loadout-badge ${optionalBadge.type}" title="${optionalBadge.tooltip}">${optionalBadge.text}</div>`
  //   : "";
  const badgeHTML = ""; // Overlay tags removed

  // Create initial entry with loading roast state
  newEntry.innerHTML = `
    <article class="casino-history-card">
      ${badgeHTML}
      <header class="loadout-header">
        <span class="class-badge ${classType.toLowerCase()}">${classType.toUpperCase()}</span>
        <h3 class="loadout-name">${loadoutName}</h3>
        <time class="timestamp">Just now</time>
      </header>
      
      <div class="loadout-details">
        <div class="weapon-item">
          <span class="item-label">WEAPON</span>
          <div class="item-content">
            <img src="images/${selectedWeapon.replace(
              / /g,
              "_"
            )}.webp" alt="${selectedWeapon}" class="item-icon">
            <span class="item-name">${selectedWeapon}</span>
          </div>
        </div>
        
        <div class="spec-item">
          <span class="item-label">SPECIALIZATION</span>
          <div class="item-content">
            <img src="images/${selectedSpec.replace(
              / /g,
              "_"
            )}.webp" alt="${selectedSpec}" class="item-icon">
            <span class="item-name">${selectedSpec}</span>
          </div>
        </div>
        
        <div class="gadget-group">
          <span class="item-label">GADGETS</span>
          <div class="gadget-list">
            ${selectedGadgets
              .map(
                (g) => `
              <div class="gadget-item">
                <img src="images/${g.replace(
                  / /g,
                  "_"
                )}.webp" alt="${g}" class="item-icon small">
                <span class="item-name small">${g}</span>
              </div>
            `
              )
              .join("")}
          </div>
        </div>
      </div>
      
      <div class="ai-analysis loading">
        <span class="ai-icon">🤖</span>
        <p class="roast-text">
          <span class="spinner"></span> Generating Loadout Analysis...
        </p>
        <span class="score-badge">?/10</span>
      </div>
      
      <footer class="loadout-actions">
        <button class="copy-text-btn" onclick="copyLoadoutText(this)" title="Copy loadout as text">
          <span>📋</span> Copy Text
        </button>
        <button class="copy-image-btn" onclick="copyLoadoutImage(this)" title="Screenshot this card">
          <span>📸</span> Copy Image
        </button>
      </footer>
    </article>
  `;

  historyList.prepend(newEntry);

  // Animate entry
  setTimeout(() => newEntry.classList.add("visible"), 10);

  // Use provided roast or generate new one
  if (providedRoast) {
    // Use the roast that was already generated
    const analysisSection = newEntry.querySelector(".ai-analysis");
    const roastText = newEntry.querySelector(".roast-text");
    const scoreBadge = newEntry.querySelector(".score-badge");

    analysisSection.classList.remove("loading");
    roastText.textContent = providedRoast;

    // Extract score from roast text
    const scoreMatch = providedRoast.match(/(\d+)\/10/);
    if (scoreMatch) {
      scoreBadge.textContent = scoreMatch[0];
      // Add class based on score
      const score = parseInt(scoreMatch[1]);
      if (score >= 8) analysisSection.classList.add("high-score");
      else if (score >= 5) analysisSection.classList.add("mid-score");
      else analysisSection.classList.add("low-score");
    }
  } else {
    // Generate roast asynchronously (fallback for cases where no roast is provided)
    generateRoast(
      newEntry,
      classType,
      selectedWeapon,
      selectedSpec,
      selectedGadgets
    );
  }

  // Update timestamp every minute
  updateTimestamps();

  // Keep only 5 entries
  while (historyList.children.length > 5) {
    historyList.removeChild(historyList.lastChild);
  }

  // Save the updated history to localStorage
  saveHistory();
}

// Display roast below slot machine
async function displayRoastBelowSlotMachine(classType, weapon, spec, gadgets) {
  const itemsContainer = document.querySelector("#output .items-container");
  if (!itemsContainer) return null;

  // Remove any existing roast display
  const existingRoast = document.getElementById("slot-machine-roast");
  if (existingRoast) {
    existingRoast.remove();
  }

  // Create roast container
  const roastContainer = document.createElement("div");
  roastContainer.id = "slot-machine-roast";
  roastContainer.className = "slot-machine-roast loading";
  roastContainer.innerHTML = `
    <div class="roast-content">
      <span class="fire-emoji">🎯</span>
      <span class="roast-text"><span class='spinner'></span> Generating Loadout Analysis...</span>
    </div>
  `;

  // Insert after slot machine
  itemsContainer.insertAdjacentElement("afterend", roastContainer);

  let generatedRoast = null;

  // Generate analysis
  try {
    // Check if we're in local development
    const isLocal =
      window.location.hostname === "localhost" ||
      window.location.hostname === "127.0.0.1" ||
      window.location.hostname === "";

    if (isLocal) {
      // Skip API call for local development, use fallback immediately
      throw new Error("Local development - using fallback analysis");
    }

    const requestData = {
      class: classType,
      weapon: weapon,
      specialization: spec,
      gadgets: gadgets,
    };

    console.log("🚀 Sending analysis request:", requestData);

    const response = await fetch("/api/loadout-analysis", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestData),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log("🎯 Received analysis response:", data);

    generatedRoast = data.analysis || data.roast;

    // Update the roast display
    roastContainer.classList.remove("loading");
    const roastText = roastContainer.querySelector(".roast-text");
    roastText.textContent = generatedRoast;

    // Remove roast after 10 seconds
    setTimeout(() => {
      roastContainer.classList.add("fade-out");
      setTimeout(() => roastContainer.remove(), ROAST_TIMING.FADE_OUT_DURATION);
    }, ROAST_TIMING.DISPLAY_DURATION);
  } catch (error) {
    console.log(
      "Using fallback analysis for local development:",
      error.message
    );

    // Categorize weapons
    const annoyingWeapons = [
      "Sword",
      "Lockbolt X",
      "SH1900",
      "Throwing Knives",
      "Dual Blades",
      "Riot Shield",
      "Flamethrower",
      "Spear",
      "M32-GL",
      "CL-40",
    ];
    const difficultWeapons = [
      "M60",
      "R.357",
      "CB-01 Repeater",
      "Recurve Bow",
      "Dagger",
      "AKM",
    ];

    const isAnnoying = annoyingWeapons.includes(weapon);
    const isDifficult = difficultWeapons.includes(weapon);

    // Fallback analysis with new tone (50% funny, 30% encouraging, 20% roast)
    let fallbackAnalysis = [];

    if (isAnnoying) {
      fallbackAnalysis = [
        `${weapon} on ${classType}? Your enemies will hate you, but hey, that's half the battle won! Keep tilting them! 7/10`,
        `Running ${weapon} with ${spec}? Psychological warfare at its finest. The rage quits will be legendary! 8/10`,
        `${weapon} + ${gadgets[0]}? You're not here to make friends, and I respect that chaos energy! 7/10`,
        `This ${weapon} loadout is giving 'main character in a comedy show' vibes. Embrace the mayhem! 8/10`,
      ];
    } else if (isDifficult) {
      fallbackAnalysis = [
        `${weapon} on ${classType}? You're playing on hard mode and I'm here for it! Master this and you'll be unstoppable. 9/10`,
        `${weapon} with ${spec}? High risk, high reward - just like ordering sushi from a gas station, but cooler! 8/10`,
        `Choosing ${weapon} shows confidence. Sure, it's tough, but legends aren't made from easy mode! 8/10`,
        `${weapon} takes skill, and you're brave enough to try. That's already better than 90% of players! 7/10`,
      ];
    } else {
      fallbackAnalysis = [
        `${weapon} on ${classType}? Solid choice! You'll confuse enemies AND yourself - perfectly balanced! 6/10`,
        `${weapon} + ${spec} = Chaotic good energy. Will it work? Maybe! Will it be fun? Absolutely! 7/10`,
        `This ${weapon} combo is like pineapple on pizza - controversial but surprisingly effective! 7/10`,
        `${classType} with ${weapon}? You're writing your own meta. Props for creativity! 6/10`,
        `${weapon} and ${gadgets[0]}? That's thinking outside the loot box! Keep experimenting! 7/10`,
      ];
    }

    generatedRoast =
      fallbackAnalysis[Math.floor(Math.random() * fallbackAnalysis.length)];

    roastContainer.classList.remove("loading");
    roastContainer.classList.add("fallback");
    const roastText = roastContainer.querySelector(".roast-text");
    roastText.textContent = generatedRoast;

    // Remove roast after 10 seconds
    setTimeout(() => {
      roastContainer.classList.add("fade-out");
      setTimeout(() => roastContainer.remove(), ROAST_TIMING.FADE_OUT_DURATION);
    }, ROAST_TIMING.DISPLAY_DURATION);
  }

  return generatedRoast;
}

// Generate AI analysis for loadout
async function generateRoast(
  entryElement,
  classType,
  weapon,
  specialization,
  gadgets
) {
  const analysisSection = entryElement.querySelector(".ai-analysis");
  const roastText = entryElement.querySelector(".roast-text");
  const scoreBadge = entryElement.querySelector(".score-badge");

  // Update loading text
  if (roastText && analysisSection.classList.contains("loading")) {
    roastText.innerHTML =
      '<span class="spinner"></span> Generating Loadout Analysis...';
  }

  try {
    // Debug - log what we're sending to the API
    const requestData = {
      class: classType,
      weapon: weapon,
      specialization: specialization,
      gadgets: gadgets,
    };
    console.log("🚀 Sending analysis request:", requestData);

    // Call our Vercel API endpoint
    const response = await fetch("/api/loadout-analysis", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestData),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log("🎯 Received analysis response:", data);

    // Update the analysis section with the AI-generated analysis
    analysisSection.classList.remove("loading");
    roastText.textContent = data.analysis || data.roast;

    // Extract and display score
    const scoreMatch = (data.analysis || data.roast).match(/(\d+)\/10/);
    if (scoreMatch) {
      scoreBadge.textContent = scoreMatch[0];
      const score = parseInt(scoreMatch[1]);
      if (score >= 8) analysisSection.classList.add("high-score");
      else if (score >= 5) analysisSection.classList.add("mid-score");
      else analysisSection.classList.add("low-score");
    }

    // Add fallback indicator if API failed
    if (data.fallback) {
      analysisSection.classList.add("fallback");
    }
  } catch (error) {
    console.error("Error generating analysis:", error);

    // Categorize weapons
    const annoyingWeapons = [
      "Sword",
      "Lockbolt X",
      "SH1900",
      "Throwing Knives",
      "Dual Blades",
      "Riot Shield",
      "Flamethrower",
      "Spear",
      "M32-GL",
      "CL-40",
    ];
    const difficultWeapons = [
      "M60",
      "R.357",
      "CB-01 Repeater",
      "Recurve Bow",
      "Dagger",
      "AKM",
    ];

    const isAnnoying = annoyingWeapons.includes(weapon);
    const isDifficult = difficultWeapons.includes(weapon);

    // Fallback to analysis with new tone
    let fallbackAnalysis = [];

    if (isAnnoying) {
      fallbackAnalysis = [
        `${weapon} and ${specialization}? You're here to ruin someone's day - I like your style! 8/10`,
        `${classType} with ${weapon}? Maximum tilt potential achieved. The salt will flow! 7/10`,
        `${specialization} + ${gadgets[0]}? Chaotic evil, but make it fun! 8/10`,
      ];
    } else if (isDifficult) {
      fallbackAnalysis = [
        `${weapon} and ${specialization}? Playing on expert mode - respect the grind! 8/10`,
        `${classType} with ${weapon}? You're not here for easy wins, you're here for glory! 9/10`,
        `Mastering ${weapon} with these gadgets? That's champion mentality right there! 8/10`,
      ];
    } else {
      fallbackAnalysis = [
        `${weapon} and ${specialization}? Unconventional but intriguing. Science requires sacrifice! 6/10`,
        `${classType} with ${weapon}? You're inventing the meta, one match at a time! 7/10`,
        `${specialization} + ${gadgets[0]}? Creative loadout! Success not guaranteed, fun definitely is! 7/10`,
      ];
    }

    const selectedAnalysis =
      fallbackAnalysis[Math.floor(Math.random() * fallbackAnalysis.length)];

    analysisSection.classList.remove("loading");
    analysisSection.classList.add("fallback");
    roastText.textContent = selectedAnalysis;

    // Extract and display score
    const scoreMatch = selectedAnalysis.match(/(\d+)\/10/);
    if (scoreMatch) {
      scoreBadge.textContent = scoreMatch[0];
      const score = parseInt(scoreMatch[1]);
      if (score >= 8) analysisSection.classList.add("high-score");
      else if (score >= 5) analysisSection.classList.add("mid-score");
      else analysisSection.classList.add("low-score");
    }
  }

  // Save history after roast is generated
  saveHistory();
}

function saveHistory() {
  console.log("💾 Saving history to localStorage...");
  const entries = Array.from(document.querySelectorAll(".history-entry")).map(
    (entry) => {
      // Extract data from each entry to save as structured data
      const classType = entry.querySelector(".class-badge")?.textContent.trim();
      const loadoutName = entry
        .querySelector(".loadout-name")
        ?.textContent.trim();
      const weapon = entry.querySelector(
        ".weapon-item .item-name"
      )?.textContent;
      const specialization = entry.querySelector(
        ".spec-item .item-name"
      )?.textContent;
      const gadgets = Array.from(
        entry.querySelectorAll(".gadget-item .item-name")
      ).map((el) => el.textContent);
      const isSpicy = entry.classList.contains("spicy-loadout");

      // Extract badge data
      const badgeElement = entry.querySelector(".loadout-badge");
      const badge = badgeElement
        ? {
            text: badgeElement.textContent,
            type: badgeElement.classList.contains("legendary-chaos")
              ? "legendary-chaos"
              : "special",
            tooltip: badgeElement.getAttribute("title") || "",
          }
        : null;

      // Extract roast data
      const roastSection = entry.querySelector(".roast-section");
      const roastText = entry.querySelector(".roast-text")?.textContent;
      const isRoastLoading = roastSection?.classList.contains("loading");
      const isRoastFallback = roastSection?.classList.contains("fallback");

      return {
        classType,
        loadoutName,
        weapon,
        specialization,
        gadgets,
        isSpicy,
        badge,
        roast: isRoastLoading ? null : roastText,
        roastFallback: isRoastFallback,
        timestamp: Date.now(),
      };
    }
  );

  // Limit to the most recent 5 entries
  const cappedEntries = entries.slice(0, 5);

  console.log("📝 Saving entries to localStorage:", cappedEntries);
  localStorage.setItem("loadoutHistory", JSON.stringify(cappedEntries));
  console.log("✅ History saved successfully!");
}

function loadHistory() {
  const historyList = document.getElementById("history-list");
  if (!historyList) {
    console.error("❌ History list element not found. Cannot load history.");
    return;
  }

  const savedEntries = JSON.parse(localStorage.getItem("loadoutHistory")) || [];
  console.log(
    "📚 Loading history from localStorage:",
    savedEntries.length,
    "entries"
  );
  historyList.innerHTML = "";

  savedEntries.forEach((entryData, index) => {
    // Skip if data is malformed
    if (!entryData.classType || !entryData.weapon) return;

    // Ensure classType is a valid string to prevent TypeError
    if (typeof entryData.classType !== "string") {
      entryData.classType = "Unknown";
    }

    const entry = document.createElement("div");
    entry.classList.add("history-entry", "visible"); // Add visible class immediately
    entry.setAttribute("data-class", entryData.classType.toLowerCase());

    // Add spicy class if needed
    if (entryData.isSpicy) {
      entry.classList.add("spicy-loadout");
    }

    // Calculate relative timestamp
    const timeAgo = index === 0 ? "Just now" : `${index + 1} min ago`;

    // Determine roast section content
    let roastSectionHTML = "";
    if (entryData.roast) {
      const fallbackClass = entryData.roastFallback ? " fallback" : "";
      roastSectionHTML = `
        <div class="roast-section${fallbackClass}">
          <div class="roast-content">
            <span class="fire-emoji">🔥</span>
            <span class="roast-text">${entryData.roast}</span>
          </div>
        </div>
      `;
    } else {
      // No roast available (older entries or failed to load)
      roastSectionHTML = `
        <div class="roast-section fallback">
          <div class="roast-content">
            <span class="fire-emoji">🔥</span>
            <span class="roast-text">Analysis unavailable. Still questionable though. 1/10</span>
          </div>
        </div>
      `;
    }

    // Generate badge HTML if badge exists
    const badgeHTML = entryData.badge
      ? `<div class="loadout-badge ${entryData.badge.type}" title="${entryData.badge.tooltip}">${entryData.badge.text}</div>`
      : "";

    // Parse roast and extract score
    let roastHTML = "";
    let scoreText = "?/10";
    let scoreClass = "";
    
    if (entryData.roast) {
      const scoreMatch = entryData.roast.match(/(\d+)\/10/);
      if (scoreMatch) {
        scoreText = scoreMatch[0];
        const score = parseInt(scoreMatch[1]);
        if (score >= 8) scoreClass = "high-score";
        else if (score >= 5) scoreClass = "mid-score";
        else scoreClass = "low-score";
      }
      
      roastHTML = `
        <div class="ai-analysis ${scoreClass}">
          <span class="ai-icon">🤖</span>
          <p class="roast-text">${entryData.roast}</p>
          <span class="score-badge">${scoreText}</span>
        </div>
      `;
    } else {
      // Fallback for old entries without roasts
      roastHTML = `
        <div class="ai-analysis low-score">
          <span class="ai-icon">🤖</span>
          <p class="roast-text">Analysis unavailable. Still questionable though.</p>
          <span class="score-badge">1/10</span>
        </div>
      `;
    }

    entry.innerHTML = `
      <article class="casino-history-card">
        ${badgeHTML}
        <header class="loadout-header">
          <span class="class-badge ${entryData.classType.toLowerCase()}">${entryData.classType.toUpperCase()}</span>
          <h3 class="loadout-name">${entryData.loadoutName}</h3>
          <time class="timestamp">${timeAgo}</time>
        </header>
        
        <div class="loadout-details">
          <div class="weapon-item">
            <span class="item-label">WEAPON</span>
            <div class="item-content">
              <img src="images/${entryData.weapon.replace(
                / /g,
                "_"
              )}.webp" alt="${entryData.weapon}" class="item-icon">
              <span class="item-name">${entryData.weapon}</span>
            </div>
          </div>
          
          <div class="spec-item">
            <span class="item-label">SPECIALIZATION</span>
            <div class="item-content">
              <img src="images/${entryData.specialization.replace(
                / /g,
                "_"
              )}.webp" alt="${entryData.specialization}" class="item-icon">
              <span class="item-name">${entryData.specialization}</span>
            </div>
          </div>
          
          <div class="gadget-group">
            <span class="item-label">GADGETS</span>
            <div class="gadget-list">
              ${entryData.gadgets
                .map(
                  (g) => `
                <div class="gadget-item">
                  <img src="images/${g.replace(
                    / /g,
                    "_"
                  )}.webp" alt="${g}" class="item-icon small">
                  <span class="item-name small">${g}</span>
                </div>
              `
                )
                .join("")}
            </div>
          </div>
        </div>
        
        ${roastHTML}
        
        <footer class="loadout-actions">
          <button class="copy-text-btn" onclick="copyLoadoutText(this)" title="Copy loadout as text">
            <span>📋</span> Copy Text
          </button>
          <button class="copy-image-btn" onclick="copyLoadoutImage(this)" title="Screenshot this card">
            <span>📸</span> Copy Image
          </button>
        </footer>
      </article>
    `;

    historyList.appendChild(entry);
  });
}

function generateLoadoutName(classType, weapon, spec) {
  // Handle null/undefined classType to prevent template issues
  if (!classType) {
    classType = "Unknown";
  }

  // Weapon-based adjectives
  const weaponAdjectives = {
    // Light weapons
    "93R": "Burst",
    Dagger: "Shadow",
    "SR-84": "Sniper",
    SH1900: "Boom",
    LH1: "Laser",
    "M26 Matter": "Matter",
    "Recurve Bow": "Archer",
    Sword: "Blade",
    M11: "Spray",
    "ARN-220": "Tactical",
    V9S: "Silent",
    "XP-54": "Rapid",
    "Throwing Knives": "Knife",

    // Medium weapons
    AKM: "Classic",
    "Cerberus 12GA": "Triple",
    "Dual Blades": "Twin",
    FAMAS: "Burst",
    "CL-40": "Launcher",
    "CB-01 Repeater": "Repeater",
    FCAR: "Assault",
    "Model 1887": "Lever",
    "Pike-556": "Pike",
    "R.357": "Revolver",
    "Riot Shield": "Shield",

    // Heavy weapons
    "50 Akimbo": "Dual",
    Flamethrower: "Pyro",
    "KS-23": "Pump",
    "Lewis Gun": "Vintage",
    M60: "Support",
    "M134 Minigun": "Minigun",
    M32GL: "Grenade",
    "SA 1216": "Auto",
    Sledgehammer: "Hammer",
    "SHAK-50": "Shak",
    Spear: "Spear",
  };

  // Specialization-based roles
  const specRoles = {
    // Light
    "Cloaking Device": "Ghost",
    "Evasive Dash": "Dasher",
    "Grappling Hook": "Spider",

    // Medium
    Dematerializer: "Phaser",
    "Guardian Turret": "Engineer",
    "Healing Beam": "Medic",

    // Heavy
    "Charge N Slam": "Meteor",
    "Goo Gun": "Gooer",
    "Mesh Shield": "Fortress",
    "Winch Claw": "Grappler",
  };

  const adjective = weaponAdjectives[weapon] || "Chaos";
  const role = specRoles[spec] || "Agent";

  // Create variations to avoid repetition
  const templates = [
    `The ${adjective} ${role}`,
    `${role} of ${adjective}`,
    `${adjective} ${classType}`,
    `${role}'s ${adjective}`,
  ];

  // Use a consistent template based on hash of weapon+spec
  const hash = (weapon + spec)
    .split("")
    .reduce((a, b) => a + b.charCodeAt(0), 0);
  const template = templates[hash % templates.length];

  return template;
}

// Check if loadout deserves LEGENDARY CHAOS badge
function shouldShowLegendaryChaossBadge(
  weapon,
  spec,
  gadgets,
  analysisRating = null
) {
  // Define dumpster tier items (notorious bad combinations or items)
  const dumpsterTier = {
    weapons: ["Dagger", "Throwing Knives"], // Melee in a gun game
    specializations: [], // Add any particularly bad specs
    gadgets: ["Proximity Sensor"], // Generally considered weak
  };

  // Check if analysis rating is 3/10 or lower
  if (analysisRating !== null && analysisRating <= 3) {
    return true;
  }

  // Check for dumpster tier items
  if (
    dumpsterTier.weapons.includes(weapon) ||
    dumpsterTier.specializations.includes(spec) ||
    gadgets.some((gadget) => dumpsterTier.gadgets.includes(gadget))
  ) {
    return true;
  }

  // Check for particularly bad combinations
  const trashCombos = [
    // Heavy class with light weapons
    weapon === "LH1" || weapon === "V9S" || weapon === "Throwing Knives",
    // Multiple movement gadgets (overkill)
    gadgets.includes("Jump Pad") && gadgets.includes("Zipline"),
    // Contradictory playstyles
    weapon === "Sledgehammer" && gadgets.includes("Cloaking Device"),
    weapon === "SR-84" && spec === "Charge N Slam", // Sniper with rush spec
    // Purely comedic bad choices
    weapon === "Dagger" && gadgets.includes("Riot Shield"),
  ];

  return trashCombos.some((combo) => combo);
}

// Generate optional badges based on loadout characteristics
function generateOptionalBadge(
  weapon,
  spec,
  gadgets,
  classType,
  analysisRating = null
) {
  // Check for LEGENDARY CHAOS first (highest priority)
  if (shouldShowLegendaryChaossBadge(weapon, spec, gadgets, analysisRating)) {
    return {
      text: "🔥 LEGENDARY CHAOS",
      type: "legendary-chaos",
      tooltip: "This loadout is pure chaos—embrace the madness!",
    };
  }

  // Future: Add other badge types like META MONSTER, CHAOS BUILD, etc.
  const specialBadges = [
    {
      condition: () => weapon === "M134 Minigun" && spec === "Dome Shield",
      text: "🛡️ FORTRESS MODE",
      type: "special",
    },
    {
      condition: () =>
        gadgets.includes("Flamethrower") && gadgets.includes("Gas Grenade"),
      text: "🔥 CHAOS INCARNATE",
      type: "special",
    },
  ];

  for (const badge of specialBadges) {
    if (badge.condition()) {
      return {
        text: badge.text,
        type: badge.type || "special",
        tooltip: "Unique combination detected!",
      };
    }
  }

  return null; // No badge for normal combinations
}

function isSpicyLoadout(weapon, spec, gadgets) {
  // Flag weird combos as "spicy"
  const spicyCombos = [
    weapon.includes("Sledgehammer") &&
      gadgets.some((g) => g.includes("Smoke Grenade")),
    weapon.includes("SR-84") && spec.includes("Charge N Slam"),
    weapon.includes("Throwing Knives") && spec.includes("Grappling Hook"),
    gadgets.filter((g) => g.includes("Mine")).length >= 2,
    weapon.includes("Flamethrower") && gadgets.some((g) => g.includes("Gas")),
    weapon.includes("Sword") && spec.includes("Evasive Dash"),
    gadgets.filter((g) => g.includes("Grenade")).length >= 2,
  ];

  return spicyCombos.some((combo) => combo);
}

function updateTimestamps() {
  // Simple implementation for now - could be enhanced with real relative time
  const timestamps = document.querySelectorAll(".timestamp");
  timestamps.forEach((timestamp, index) => {
    if (index === 0) {
      timestamp.textContent = "Just now";
    } else {
      timestamp.textContent = `${index + 1} min ago`;
    }
  });
}

// Make exportMemeCard globally accessible
window.exportMemeCard = function (button) {
  const entry = button.closest(".history-entry");
  const memeContainer = entry.querySelector(".meme-export-container");

  if (!memeContainer) {
    console.error("Meme container not found");
    return;
  }

  // Show loading state
  const originalText = button.innerHTML;
  button.innerHTML = "<span>⏳</span> GENERATING...";
  button.disabled = true;

  // Configure html2canvas options for better quality
  const options = {
    backgroundColor: "#000000",
    scale: EXPORT_SETTINGS.CANVAS_SCALE, // Higher quality
    useCORS: true,
    allowTaint: true,
    width: memeContainer.offsetWidth,
    height: memeContainer.offsetHeight,
    scrollX: 0,
    scrollY: 0,
  };

  html2canvas(memeContainer, options)
    .then((canvas) => {
      // Create download link
      const link = document.createElement("a");
      const timestamp = new Date()
        .toISOString()
        .slice(0, 19)
        .replace(/:/g, "-");
      link.download = `loadout-roast-${timestamp}.png`;
      link.href = canvas.toDataURL("image/png", 1.0);

      // Trigger download
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Success feedback
      button.innerHTML = "<span>✅</span> DOWNLOADED!";
      button.style.background = "#4CAF50";

      setTimeout(() => {
        button.innerHTML = originalText;
        button.style.background = "";
        button.disabled = false;
      }, UI_TIMING.BUTTON_FEEDBACK_DURATION);
    })
    .catch((err) => {
      console.error("Failed to generate meme card:", err);

      // Error feedback
      button.innerHTML = "<span>❌</span> FAILED";
      button.style.background = "#f44336";

      setTimeout(() => {
        button.innerHTML = originalText;
        button.style.background = "";
        button.disabled = false;
      }, UI_TIMING.BUTTON_FEEDBACK_DURATION);
    });
};

// Make copyLoadoutText available globally
window.copyLoadoutText = function (button) {
  const entry = button.closest(".history-entry");

  if (!entry) {
    console.error("Error: No history entry found.");
    return;
  }

  // Extract data from the new card structure
  const classType = entry.querySelector(".class-badge").textContent.trim();
  const loadoutName = entry.querySelector(".loadout-name").textContent.trim();

  // Get weapon and specialization from text
  const weapon =
    entry.querySelector(".weapon-item .item-name")?.textContent ||
    "Unknown Weapon";
  const specialization =
    entry.querySelector(".spec-item .item-name")?.textContent ||
    "Unknown Special";

  // Get gadgets from text
  const gadgets = Array.from(
    entry.querySelectorAll(".gadget-item .item-name")
  ).map((el) => el.textContent);

  // Create the copy text
  const copyText = `${loadoutName}
Class: ${classType}
Weapon: ${weapon}
Special: ${specialization}
Gadgets: ${gadgets.join(", ")}`;

  navigator.clipboard
    .writeText(copyText)
    .then(() => {
      button.innerHTML = "<span>✅</span> COPIED!";
      setTimeout(() => {
        button.innerHTML = "<span>📋</span> COPY";
      }, UI_TIMING.BUTTON_FEEDBACK_DURATION);
    })
    .catch((err) => {
      console.error("Could not copy text: ", err);
      alert("Failed to copy loadout to clipboard");
    });
};

// Initialize everything when DOM is ready
// Sound helper function
function playSound(soundId) {
  if (!state.soundEnabled) {
    console.log("Sound disabled, not playing:", soundId);
    return;
  }

  const sound = document.getElementById(soundId);
  if (sound) {
    console.log("Playing sound:", soundId, "soundEnabled:", state.soundEnabled);
    sound.play().catch((err) => {
      console.log("Sound play error:", soundId, err);
    });
  }
}

// REMOVED: Old sound toggle functionality - now handled in index.html initAudioToggle()

// Season 6 countdown function
function initializeSeasonCountdown() {
  const seasonStatus = document.getElementById("seasonStatus");
  const daysSpan = seasonStatus.querySelector(".days-remaining");

  // Calculate end date at midnight PST, 5 days from now
  function getEndDate() {
    const storedEndDate = localStorage.getItem("season6EndDatePST");

    if (storedEndDate) {
      return new Date(storedEndDate);
    } else {
      // Create new end date at midnight PST
      const now = new Date();
      const pstOffset = -8; // PST is UTC-8

      // Get current time in PST
      const utcTime = now.getTime() + now.getTimezoneOffset() * 60000;
      const pstTime = new Date(utcTime + 3600000 * pstOffset);

      // Set to 5 days from now at midnight PST
      const endDate = new Date(pstTime);
      endDate.setDate(endDate.getDate() + 5);
      endDate.setHours(0, 0, 0, 0); // Midnight

      // Store it
      localStorage.setItem("season6EndDatePST", endDate.toISOString());
      return endDate;
    }
  }

  function updateCountdown() {
    const endDate = getEndDate();
    const now = new Date();

    // Calculate difference in milliseconds
    const diff = endDate.getTime() - now.getTime();

    if (diff <= 0) {
      // Season has ended
      seasonStatus.textContent = "Season 6 Has Ended!";
      seasonStatus.classList.add("ended");
      clearInterval(countdownInterval);
      return;
    }

    // Calculate days remaining (round up to show "1 day" until the very end)
    const daysRemaining = Math.ceil(diff / (1000 * 60 * 60 * 24));

    // Update the display
    if (daysRemaining === 1) {
      seasonStatus.innerHTML =
        'Season 6 ends in <span class="days-remaining">1</span> day';
      seasonStatus.classList.add("urgent");
    } else {
      seasonStatus.innerHTML = `Season 6 ends in <span class="days-remaining">${daysRemaining}</span> days`;
      seasonStatus.classList.remove("urgent");
    }
  }

  // Update immediately
  updateCountdown();

  // Update every hour (more frequent updates aren't needed for day-based countdown)
  const countdownInterval = setInterval(
    updateCountdown,
    UI_TIMING.COUNTDOWN_UPDATE_INTERVAL
  );
}

// Sidebar functionality
function initializeSidebar() {
  const sidebar = document.getElementById("filter-sidebar");
  const mobileToggle = document.getElementById("mobile-filter-toggle");
  const closeSidebar = document.getElementById("close-sidebar");

  if (!sidebar || !mobileToggle || !closeSidebar) return;

  // Mobile toggle functionality
  mobileToggle.addEventListener("click", () => {
    state.sidebarOpen = !state.sidebarOpen;
    sidebar.classList.toggle("open", state.sidebarOpen);

    // Animate hamburger lines
    const lines = mobileToggle.querySelectorAll(".hamburger-line");
    if (state.sidebarOpen) {
      lines[0].style.transform = "rotate(45deg) translate(5px, 5px)";
      lines[1].style.opacity = "0";
      lines[2].style.transform = "rotate(-45deg) translate(7px, -6px)";
    } else {
      lines.forEach((line) => {
        line.style.transform = "";
        line.style.opacity = "";
      });
    }
  });

  // Close sidebar
  closeSidebar.addEventListener("click", () => {
    state.sidebarOpen = false;
    sidebar.classList.remove("open");
    const lines = mobileToggle.querySelectorAll(".hamburger-line");
    lines.forEach((line) => {
      line.style.transform = "";
      line.style.opacity = "";
    });
  });

  // Close sidebar on backdrop click (mobile)
  sidebar.addEventListener("click", (e) => {
    if (e.target === sidebar && state.isMobile) {
      closeSidebar.click();
    }
  });

  // Close sidebar on escape key
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && state.sidebarOpen) {
      closeSidebar.click();
    }
  });
}

// Mobile performance optimizations
function initializeMobileOptimizations() {
  if (!state.isMobile) return;

  console.log("🔧 Applying mobile optimizations");

  // Add mobile-optimized class to body
  document.body.classList.add("mobile-optimized");

  // Disable blur effects on mobile
  disableBlurEffectsOnMobile();

  // Reduce animation durations by 50%
  reduceMobileAnimationDurations();

  // Add will-change to animated elements
  optimizeAnimatedElements();

  // Implement lazy loading with Intersection Observer
  initializeLazyLoading();
}

// Disable blur effects on mobile for performance
function disableBlurEffectsOnMobile() {
  const style = document.createElement("style");
  style.textContent = `
    @media (max-width: 768px) {
      .high-speed-blur,
      .extreme-blur,
      .velocity-blur {
        filter: none !important;
      }
      
      .item-container.spinning {
        filter: none !important;
      }
    }
  `;
  document.head.appendChild(style);
}

// Reduce animation durations by 50% on mobile
function reduceMobileAnimationDurations() {
  const style = document.createElement("style");
  style.textContent = `
    @media (max-width: 768px) {
      .item-container,
      .slot-column,
      .spin-button,
      .celebration-animation,
      .particle {
        animation-duration: 0.5s !important;
        transition-duration: 0.15s !important;
      }
      
      .winner {
        animation-duration: 0.5s !important;
      }
      
      @keyframes winnerFlash {
        0%, 100% { box-shadow: 0 0 15px rgba(255, 215, 0, 0.8); }
        50% { box-shadow: 0 0 25px rgba(255, 183, 0, 0.7); }
      }
    }
  `;
  document.head.appendChild(style);
}

// Add will-change property to animated elements
function optimizeAnimatedElements() {
  const animatedElements = document.querySelectorAll(
    ".item-container, .slot-column, .spin-button, .main-spin-button"
  );

  animatedElements.forEach((element) => {
    element.style.willChange = "transform";
  });
}

// Implement Intersection Observer for lazy loading
function initializeLazyLoading() {
  const images = document.querySelectorAll('img[loading="lazy"]');

  if ("IntersectionObserver" in window) {
    const imageObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const img = entry.target;
            img.src = img.dataset.src || img.src;
            img.classList.remove("lazy");
            observer.unobserve(img);
          }
        });
      },
      {
        rootMargin: "50px",
      }
    );

    images.forEach((img) => {
      imageObserver.observe(img);
    });
  }
}

// Initialize empty slot machine on page load
function initializeEmptySlotMachine() {
  console.log("🎰 Initializing empty slot machine");

  const placeholderItems = ["?", "?", "?", "?", "?"];
  const placeholderHTML = `
    <div class="slot-machine-wrapper">
      <div class="items-container">
        <div class="item-container">
          <div class="scroll-container">
            <div class="itemCol">
              <img src="images/placeholder-question.webp" alt="?" loading="lazy">
              <p></p>
            </div>
          </div>
        </div>
        <div class="item-container">
          <div class="scroll-container">
            <div class="itemCol">
              <img src="images/placeholder-question.webp" alt="?" loading="lazy">
              <p></p>
            </div>
          </div>
        </div>
        <div class="item-container">
          <div class="scroll-container">
            <div class="itemCol">
              <img src="images/placeholder-question.webp" alt="?" loading="lazy">
              <p></p>
            </div>
          </div>
        </div>
        <div class="item-container">
          <div class="scroll-container">
            <div class="itemCol">
              <img src="images/placeholder-question.webp" alt="?" loading="lazy">
              <p></p>
            </div>
          </div>
        </div>
        <div class="item-container">
          <div class="scroll-container">
            <div class="itemCol">
              <img src="images/placeholder-question.webp" alt="?" loading="lazy">
              <p></p>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;

  if (outputDiv) {
    outputDiv.innerHTML = placeholderHTML;
    outputDiv.style.opacity = "0.7"; // Slightly faded to indicate it's a placeholder
  }
}

// Clean up old cached data to prevent memory buildup
function cleanupOldCachedData() {
  try {
    // Clean up localStorage data older than 7 days
    const savedHistory = JSON.parse(localStorage.getItem("loadoutHistory")) || [];
    const oneWeekAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
    
    const recentHistory = savedHistory.filter(entry => {
      return !entry.timestamp || entry.timestamp > oneWeekAgo;
    });
    
    if (recentHistory.length < savedHistory.length) {
      console.log(`🧹 Cleaned up ${savedHistory.length - recentHistory.length} old history entries`);
      localStorage.setItem("loadoutHistory", JSON.stringify(recentHistory));
    }
    
    // Clear any orphaned performance cache
    if (window.performanceCache) {
      window.performanceCache.clear();
    }
    
    console.log("✅ Memory cleanup completed");
  } catch (error) {
    console.error("Error during cleanup:", error);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  console.log("✅ DOM fully loaded");
  
  // Clean up old cached data to prevent memory buildup
  cleanupOldCachedData();

  // Load initial counter value
  // loadInitialCounter();

  // Also fetch counter as backup
  // setTimeout(() => {
  //   fetchAndUpdateCounter();
  // }, 1000);

  // Sound toggle now handled in index.html initAudioToggle()
  // initializeSoundToggle();

  // Initialize sidebar functionality
  initializeSidebar();

  // Initialize class exclusion system
  initializeClassExclusion();

  // Initialize mobile performance optimizations
  initializeMobileOptimizations();

  // Initialize season countdown - DISABLED (using new countdown in HTML)
  // initializeSeasonCountdown();

  // Get DOM elements (disabled - using RouletteAnimationSystem instead)
  // classButtons = document.querySelectorAll(".class-button"); // Removed - class selection deprecated
  // spinButtons = document.querySelectorAll(".spin-button");
  // spinSelection = document.getElementById("spinSelection");
  try {
    outputDiv = document.getElementById("output");
    if (!outputDiv) {
      console.error(
        "❌ CRASH PREVENTION: Could not find output element during initialization"
      );
    } else {
      // Initialize empty slot machine on page load - DISABLED
      // initializeEmptySlotMachine();
      // Keep output hidden until user generates a loadout
      outputDiv.style.display = "none";
      outputDiv.style.opacity = "0";
    }
  } catch (error) {
    console.error("❌ CRASH PREVENTION: Error during initialization:", error);
  }

  // Mobile audio failsafe - stop all sounds when page loses focus
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      // Stop all audio when page is hidden
      const allAudio = document.querySelectorAll("audio");
      allAudio.forEach((audio) => {
        if (!audio.paused) {
          audio.pause();
          audio.currentTime = 0;
        }
      });
    }
  });

  // Additional mobile failsafe for iOS
  window.addEventListener("pagehide", () => {
    const allAudio = document.querySelectorAll("audio");
    allAudio.forEach((audio) => {
      audio.pause();
      audio.currentTime = 0;
    });
  });

  // Roulette system removed - commenting out initialization
  /*
  async function initializeRouletteSystem() {
    // Ensure roulette container is hidden on init
    const rouletteContainer = document.getElementById("roulette-container");
    const rouletteOverlay = document.getElementById("roulette-overlay");
    if (rouletteContainer) {
      rouletteContainer.style.display = "none";
      rouletteContainer.classList.add("hidden");
      console.log("🎯 Hiding roulette container on init");
    }
    if (rouletteOverlay) {
      rouletteOverlay.style.display = "none";
      rouletteOverlay.classList.add("hidden");
    }

    // Wait for RouletteAnimationSystem to be available
    let RouletteAnimationSystem;
    try {
      RouletteAnimationSystem = await waitForGlobal('RouletteAnimationSystem');
      console.log("✅ RouletteAnimationSystem loaded successfully");
    } catch (error) {
      console.error("❌ RouletteAnimationSystem failed to load:", error);
      return;
    }

    // Optimize audio for mobile by reducing concurrent sounds
    const isMobile =
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent
      );
    if (isMobile) {
      // Override tick sound frequency on mobile
      const originalPlayTick =
        RouletteAnimationSystem.prototype.playTickSound;
      RouletteAnimationSystem.prototype.playTickSound = function () {
        // Only play every 3rd tick on mobile to reduce audio overhead
        if (!this._tickCounter) this._tickCounter = 0;
        this._tickCounter++;
        if (this._tickCounter % 3 === 0) {
          originalPlayTick.call(this);
        }
      };
    }

    // Initialize the roulette animation system
    const rouletteSystem = new RouletteAnimationSystem();

    // Set up the main SPIN button with debugging
    const mainSpinButton = document.getElementById("main-spin-button");
    console.log("🔍 Looking for main-spin-button:", !!mainSpinButton);

    if (mainSpinButton) {
      console.log("✅ Found main-spin-button, adding event listener");
      mainSpinButton.addEventListener("click", async () => {
        console.log("🎯 MAIN SPIN BUTTON CLICKED!");
        console.log("🔍 Current state:", {
          isSpinning: state.isSpinning,
          selectedClass: state.selectedClass,
        });

        if (state.isSpinning) {
          console.log("❌ Animation already in progress, skipping");
          return;
        }
        
        // Check if any classes are available
        const availableClasses = getAvailableClasses();
        if (availableClasses.length === 0) {
          alert("Please select at least one class in the filters before spinning!");
          return;
        }

        // Add spinning animation
        mainSpinButton.classList.add("spinning");

        try {
          console.log("🚀 Starting overlay sequence...");
          // Use overlay manager if available
          if (window.overlayManager && window.overlayManager.startLoadoutGeneration) {
            window.overlayManager.startLoadoutGeneration();
          } else {
            console.log("⚠️ Overlay manager not loaded, falling back to direct spin");
            displayRandomLoadout();
          }
        } catch (error) {
          console.error("❌ Error in overlay sequence:", error);
          console.log("🔄 Falling back to direct random loadout...");
          // Fallback to old system
          displayRandomLoadout();
        }

        // Remove spinning animation when done
        mainSpinButton.classList.remove("spinning");
      });

      // Test the button is clickable
      console.log("🧪 Button properties:", {
        disabled: mainSpinButton.disabled,
        style: mainSpinButton.style.display,
        classes: mainSpinButton.className,
      });
    } else {
      console.error("❌ Main spin button not found! Retrying in 500ms...");
      // Retry finding and setting up the button
      setTimeout(() => {
        const retryButton = document.getElementById("main-spin-button");
        if (retryButton) {
          console.log("✅ Found button on retry, setting up...");
          retryButton.addEventListener("click", async () => {
            console.log("🎯 RETRY MAIN SPIN BUTTON CLICKED!");
            if (state.isSpinning || rouletteSystem.animating) {
              return;
            }

            retryButton.classList.add("spinning");

            try {
              const { spinCount, chosenClass } = await rouletteSystem.startFullSequence();
              console.log(`✅ Retry roulette completed - ${spinCount} spins, ${chosenClass} class`);
              
              // Set state and start the slot machine
              if (window.state) {
                window.state.totalSpins = spinCount;
                window.state.selectedClass = chosenClass;
              }
              
              // Start the real slot machine
              spinLoadout();
            } catch (error) {
              console.error("❌ Retry roulette error:", error);
              displayRandomLoadout();
            }

            retryButton.classList.remove("spinning");
          });
        } else {
          console.error(
            "❌ Still could not find main-spin-button after retry!"
          );
        }
      }, 500);
    }
  }
  */

  // Roulette system initialization removed
  /*
  console.log("🚀 About to call initializeRouletteSystem()");
  initializeRouletteSystem().then(() => {
    console.log("✅ initializeRouletteSystem() completed successfully");
  }).catch(error => {
    console.error("❌ Error in initializeRouletteSystem():", error);
  });
  */

  // EMERGENCY FALLBACK: Removed - was interfering with overlay flow

  const toggleBtn = document.getElementById("toggle-customization");
  const customizationPanel = document.getElementById("customization-panel");

  // Toggle customization panel (old system)
  if (toggleBtn && customizationPanel) {
    toggleBtn.addEventListener("click", () => {
      customizationPanel.style.display =
        customizationPanel.style.display === "block" ? "none" : "block";
    });
  }

  // Add this to your existing JavaScript code, after the document is loaded
  document.addEventListener("DOMContentLoaded", function () {
    // Set up "Select All" functionality
    setupSelectAllCheckboxes();

    // Run immediate cleanup on page load
    if (
      window.RouletteAnimationSystem &&
      window.RouletteAnimationSystem.cleanupAllAnimationContainers
    ) {
      window.RouletteAnimationSystem.cleanupAllAnimationContainers();
    }
  });

  // Function to setup Select All checkboxes (moved outside event listener)
  function setupSelectAllCheckboxes() {
    // Get all "Select All" checkboxes
    const selectAllCheckboxes = document.querySelectorAll(
      'input[data-type$="selectall"]'
    );

    console.log(
      "Setting up Select All checkboxes:",
      selectAllCheckboxes.length
    );

    // Add event listeners to each "Select All" checkbox
    selectAllCheckboxes.forEach((checkbox) => {
      checkbox.addEventListener("change", function () {
        const classType = this.dataset.class; // "light", "medium", or "heavy"
        const selectType = this.dataset.type.replace("-selectall", ""); // "weapon", "specialization", or "gadget"
        const isChecked = this.checked;

        console.log(
          `Select All ${classType} ${selectType}s changed to: ${isChecked}`
        );

        // Find all checkboxes of the same class and type
        const typeCheckboxes = document.querySelectorAll(
          `input[data-type="${selectType}"][data-class="${classType}"]`
        );

        console.log(
          `Found ${typeCheckboxes.length} ${classType} ${selectType}s to update`
        );

        // Set all checkboxes to match the "Select All" state
        typeCheckboxes.forEach((itemCheckbox) => {
          itemCheckbox.checked = isChecked;
        });
      });
    });

    // Also add listeners to individual checkboxes to update "Select All" state
    const typeCheckboxes = document.querySelectorAll(
      'input[data-type="weapon"], input[data-type="specialization"], input[data-type="gadget"]'
    );

    typeCheckboxes.forEach((checkbox) => {
      checkbox.addEventListener("change", function () {
        const classType = this.dataset.class; // "light", "medium", or "heavy"
        const selectType = this.dataset.type; // "weapon", "specialization", or "gadget"

        // Find all checkboxes of the same class and type
        const allTypeCheckboxes = document.querySelectorAll(
          `input[data-type="${selectType}"][data-class="${classType}"]`
        );

        // Check if all are checked
        const allChecked = Array.from(allTypeCheckboxes).every(
          (cb) => cb.checked
        );

        // Update the "Select All" checkbox state
        const selectAllCheckbox = document.querySelector(
          `input[data-type="${selectType}-selectall"][data-class="${classType}"]`
        );

        if (selectAllCheckbox) {
          selectAllCheckbox.checked = allChecked;
          console.log(
            `Updated Select All ${classType} ${selectType}s to: ${allChecked}`
          );
        }
      });
    });

    console.log("Select All setup complete");
  }

  // Make sure this function is called after the DOM is loaded
  document.addEventListener("DOMContentLoaded", function () {
    console.log("DOM loaded, setting up Select All functionality");
    setupSelectAllCheckboxes();
  });

  // Hide original spin selection UI (disabled - using RouletteAnimationSystem)
  // if (spinSelection) {
  //   spinSelection.style.display = 'none';
  // }

  // Spin button logic (disabled - using RouletteAnimationSystem instead)
  // if (spinButtons && spinButtons.length > 0) {
  //   spinButtons.forEach((button) => {
  //     button.addEventListener("click", () => {
  //       if (button.disabled || state.isSpinning) return;

  //       console.log(`🎲 Spin button clicked: ${button.dataset.spins} spins`);

  //       // Update the selected number of spins
  //       state.totalSpins = parseInt(button.dataset.spins);

  //       // Visual feedback - highlight the selected button
  //       spinButtons.forEach((btn) =>
  //         btn.classList.remove("selected", "active")
  //       );
  //       button.classList.add("selected", "active");

  //       // Start the spin process
  //       spinLoadout();
  //     });
  //   });
  // }

  // Hide original class selection UI
  const classSelection = document.querySelector(".class-selection");
  if (classSelection) {
    classSelection.style.display = "none";
  }

  // Class button event listeners (disabled - using RouletteAnimationSystem instead)
  /*
  classButtons.forEach((button) => {
    button.addEventListener("click", () => {
      if (state.isSpinning) return;

      console.log(`✅ Class Selected: ${button.dataset.class}`);

      // Clear previous selections and reset images
      classButtons.forEach((b) => {
        b.classList.remove("selected", "active");
        b.src = b.dataset.default; // Reset image to default
      });

      // Select current button
      button.classList.add("selected", "active");
      button.src = button.dataset.active; // Change image to active
      
      // No longer using gadget queues - each spin gets fresh random selection

      // Handle "Random" class selection
      if (button.dataset.class.toLowerCase() === "random") {
        // Get available classes (excluding user exclusions)
        console.log('🎲 Random class button: Fetching available classes...');
        let availableClasses = getAvailableClasses();
        console.log('🎲 Random class button: Received available classes:', availableClasses);
        
        // If no classes are available (all excluded), show warning and use all classes
        if (availableClasses.length === 0) {
          console.warn('⚠️ All classes excluded! Using all classes instead.');
          alert('All classes are excluded! Please uncheck at least one class to continue.');
          availableClasses = ["Light", "Medium", "Heavy"];
        }
        
        const randomClass = availableClasses[Math.floor(Math.random() * availableClasses.length)];
        state.selectedClass = randomClass;
        console.log(`🎲 Randomly Chosen Class: ${randomClass}`);

        // Pick a random spin count (1-5)
        const randomSpins = Math.floor(Math.random() * 5) + 1;
        state.totalSpins = randomSpins;
        console.log(`🔄 Random Spins: ${randomSpins}`);

        // Highlight the randomly selected class button
        classButtons.forEach((b) => {
          if (b.dataset.class.toLowerCase() === randomClass.toLowerCase()) {
            b.classList.add("selected");
            b.src = b.dataset.active; // Switch image for selected class
          }
        });

        // Highlight the randomly selected spin button
        spinButtons.forEach((b) => {
          b.classList.toggle(
            "selected",
            parseInt(b.dataset.spins) === randomSpins
          );
        });

        // Start the spin process immediately
        spinLoadout();
      } else {
        // Set selected class and enable spin buttons
        state.selectedClass = button.dataset.class;
        console.log(`✅ Selected Class Stored: ${state.selectedClass}`);

        // Remove disabled class from spin selection container
        if (spinSelection) {
          spinSelection.classList.remove("disabled");
        } else {
          console.warn("spinSelection element not found");
        }

        // Enable all spin buttons when a class is selected
        spinButtons.forEach((btn) => {
          btn.disabled = false; // Enable buttons
          btn.removeAttribute("disabled"); // Make sure the attribute is removed
          btn.classList.remove("dimmed"); // Remove dimming effect
          btn.style.opacity = ""; // Reset any inline opacity
          btn.style.pointerEvents = ""; // Reset any inline pointer-events
        });
      }
    });

    // Add hover effect to switch images
    button.addEventListener("mouseenter", () => {
      button.src = button.dataset.active;
    });

    button.addEventListener("mouseleave", () => {
      if (!button.classList.contains("selected")) {
        button.src = button.dataset.default;
      }
    });
  });
  */

  // Copy loadout functionality
  document
    .getElementById("copyLoadoutButton")
    ?.addEventListener("click", () => {
      const itemContainers = document.querySelectorAll(
        "#output .items-container .item-container"
      );

      if (!itemContainers || itemContainers.length === 0) {
        alert("Error: No items found to copy");
        return;
      }

      const selectedItems = Array.from(itemContainers).map((container) => {
        const scrollContainer = container.querySelector(".scroll-container");
        if (!scrollContainer) return "Unknown";

        const allItems = scrollContainer.querySelectorAll(".itemCol");
        const visibleItem = Array.from(allItems).find((item) => {
          const rect = item.getBoundingClientRect();
          const containerRect = container.getBoundingClientRect();
          return (
            rect.top >= containerRect.top &&
            rect.bottom <= containerRect.bottom &&
            rect.height > 0 &&
            rect.width > 0
          );
        });

        if (!visibleItem) return "Unknown";
        const itemText = visibleItem.querySelector("p")?.innerText.trim();
        return itemText || "Unknown";
      });

      if (selectedItems.includes("Unknown") || selectedItems.length < 5) {
        alert(
          "Error: Not all items were properly selected. Try again after the spin completes."
        );
        return;
      }

      // Class button code removed - using default class selection
      // const activeClassButton = document.querySelector(
      //   ".class-button.selected, .class-button.active"
      // );
      // const selectedClass = activeClassButton
      //   ? activeClassButton.dataset.class.toLowerCase() === "random"
      //     ? document.querySelector(
      //         ".class-button.selected:not([data-class='Random'])"
      //       )?.dataset.class
      //     : activeClassButton.dataset.class
      //   : "Unknown";
      const selectedClass = "Unknown"; // Default value since class selection removed

      const copyText = `Class: ${selectedClass}
Weapon: ${selectedItems[0]}
Special: ${selectedItems[1]}
Gadget 1: ${selectedItems[2]}
Gadget 2: ${selectedItems[3]}
Gadget 3: ${selectedItems[4]}`;

      navigator.clipboard
        .writeText(copyText)
        .then(() => alert("Loadout copied to clipboard!"))
        .catch((err) => {
          console.error("Could not copy text: ", err);
          alert("Failed to copy loadout to clipboard");
        });
    });

  // Initialize loadout history when DOM is ready
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", loadHistory);
  } else {
    // DOM is already loaded
    loadHistory();
  }

  // Clear history button
  document.getElementById("clear-history")?.addEventListener("click", () => {
    localStorage.removeItem("loadoutHistory");
    document.getElementById("history-list").innerHTML = "";
    console.log("🗑️ Loadout history cleared.");
  });

  // FAQ Toggle
  const faqToggle = document.getElementById("faq-toggle-button");
  const faqContent = document.getElementById("faq-content");
  const faqToggleIcon = document.querySelector(".faq-toggle");

  if (faqToggle && faqContent) {
    faqToggle.addEventListener("click", () => {
      faqContent.classList.toggle("open");
      faqToggleIcon.innerText = faqContent.classList.contains("open")
        ? "−"
        : "+";
    });
  }

  // Fetch and populate checkboxes for customization
  fetch("loadouts.json")
    .catch(() => {
      // If fetch fails, use the built-in loadouts object
      console.log("Using built-in loadouts as fallback");
      return { json: () => Promise.resolve(loadouts) };
    })
    .then((res) => res.json())
    .then((data) => {
      const allWeapons = [
        ...new Set([
          ...data.Light.weapons,
          ...data.Medium.weapons,
          ...data.Heavy.weapons,
        ]),
      ];
      const allSpecializations = [
        ...new Set([
          ...data.Light.specializations,
          ...data.Medium.specializations,
          ...data.Heavy.specializations,
        ]),
      ];
      const allGadgets = [
        ...new Set([
          ...data.Light.gadgets,
          ...data.Medium.gadgets,
          ...data.Heavy.gadgets,
        ]),
      ];

      // ✅ Use new filtering system only
      setupFilterSystem();
      populateFilterItems();
    })
    .catch((err) => console.error("❌ Error loading JSON", err));

  // This code should be added at the end of your app.js file or
  // wrapped in a DOMContentLoaded event handler

  // Old Select All implementation removed - now using event delegation
  /*
  (function () {
    // Function to immediately set up Select All checkboxes
    function initSelectAll() {
      console.log("🔍 Initializing robust Select All functionality");

      // Find all "Select All" checkboxes
      const selectAllCheckboxes = document.querySelectorAll(
        '[data-type$="selectall"]'
      );
      console.log(`Found ${selectAllCheckboxes.length} Select All checkboxes`);

      // Process each Select All checkbox
      selectAllCheckboxes.forEach(function (selectAllBox) {
        // Get necessary data attributes
        const classType = selectAllBox.getAttribute("data-class"); // light, medium, heavy
        const baseType = selectAllBox
          .getAttribute("data-type")
          .replace("-selectall", ""); // weapon

        console.log(`Setting up ${classType} ${baseType} Select All`);

        // Add click handler (works more reliably than change in some browsers)
        selectAllBox.onclick = function () {
          // Current state of the Select All checkbox
          const isChecked = this.checked;
          console.log(
            `${classType} ${baseType} Select All clicked: ${isChecked}`
          );

          // Find all related checkboxes
          const relatedBoxes = document.querySelectorAll(
            `input[data-type="${baseType}"][data-class="${classType}"]`
          );

          console.log(
            `Found ${relatedBoxes.length} ${classType} ${baseType}s to update`
          );

          // Update all related checkboxes
          relatedBoxes.forEach(function (box) {
            box.checked = isChecked;
          });
        };

        // Initial setup: Check if all individual items are checked
        updateSelectAllState(selectAllBox);
      });

      // Add listeners to individual checkboxes
      const allItemCheckboxes = document.querySelectorAll(
        '[data-type="weapon"], [data-type="specialization"], [data-type="gadget"]'
      );
      console.log(`Found ${allItemCheckboxes.length} individual checkboxes`);

      allItemCheckboxes.forEach(function (checkbox) {
        // Add click handler
        checkbox.onclick = function () {
          const classType = this.getAttribute("data-class");
          const itemType = this.getAttribute("data-type");

          // Find related Select All checkbox
          const selectAllBox = document.querySelector(
            `input[data-type="${itemType}-selectall"][data-class="${classType}"]`
          );

          if (selectAllBox) {
            updateSelectAllState(selectAllBox);
          }
        };
      });
    }

    // Function to update Select All checkbox state based on individual items
    function updateSelectAllState(selectAllBox) {
      const classType = selectAllBox.getAttribute("data-class");
      const baseType = selectAllBox
        .getAttribute("data-type")
        .replace("-selectall", "");

      // Find all related checkboxes
      const relatedBoxes = document.querySelectorAll(
        `input[data-type="${baseType}"][data-class="${classType}"]`
      );

      // Check if all are checked
      let allChecked = true;
      relatedBoxes.forEach(function (box) {
        if (!box.checked) {
          allChecked = false;
        }
      });

      // Update Select All state without triggering its change event
      selectAllBox.checked = allChecked;
    }

    // Run the initialization function
    // Try several approaches to ensure it runs at the right time

    // Approach 1: If document is already loaded
    if (
      document.readyState === "complete" ||
      document.readyState === "interactive"
    ) {
      console.log("Document already loaded, initializing Select All");
      setTimeout(initSelectAll, 100); // Small delay to ensure DOM is fully processed
    }

    // Approach 2: Wait for DOM content loaded
    document.addEventListener("DOMContentLoaded", function () {
      console.log("DOMContentLoaded fired, initializing Select All");
      initSelectAll();
    });

    // Approach 3: Fallback to window load event
    window.addEventListener("load", function () {
      console.log("Window load event, initializing Select All");
      initSelectAll();
    });

    // Approach 4: Try again after a delay as final fallback
    setTimeout(function () {
      console.log("Delayed initialization of Select All");
      initSelectAll();
    }, 1000);
  })();
  */

  /*
  // Additionally, add a global function to manually trigger setup if needed
  window.reinitializeSelectAll = function () {
    console.log("Manually reinitializing Select All functionality");
    (function () {
      // Find all "Select All" checkboxes
      const selectAllCheckboxes = document.querySelectorAll(
        '[data-type$="selectall"]'
      );

      // Process each Select All checkbox
      selectAllCheckboxes.forEach(function (selectAllBox) {
        // Get necessary data attributes
        const classType = selectAllBox.getAttribute("data-class");
        const baseType = selectAllBox
          .getAttribute("data-type")
          .replace("-selectall", "");

        // Add click handler
        selectAllBox.onclick = function () {
          const isChecked = this.checked;

          // Find all related checkboxes
          const relatedBoxes = document.querySelectorAll(
            `input[data-type="${baseType}"][data-class="${classType}"]`
          );

          // Update all related checkboxes
          relatedBoxes.forEach(function (box) {
            box.checked = isChecked;
          });
        };
      });
    })();
  };
  */
});

// Increment loadout counter on backend
// Update the total loadouts counter element specifically
function updateTotalLoadoutsDisplay(count) {
  const totalLoadoutsElement = document.getElementById("total-loadouts");
  if (totalLoadoutsElement) {
    // Add null/undefined check to prevent toLocaleString error
    const safeCount = count != null ? count : 0;
    const formattedCount = safeCount.toLocaleString();
    // Counter display removed
    // totalLoadoutsElement.innerHTML = `🔥 <span class="loadouts-counter">${formattedCount}</span> total analyses delivered`;
    console.log("✅ Updated total-loadouts display:", formattedCount);
  }
}

async function incrementLoadoutCounter() {
  try {
    console.log("📊 Incrementing loadout counter...");

    // Check if we're in local development
    const isLocal =
      window.location.hostname === "localhost" ||
      window.location.hostname === "127.0.0.1" ||
      window.location.hostname === "";

    if (isLocal) {
      // Use local fallback for development
      const currentCount = parseInt(
        localStorage.getItem("localCounter") || "5321"
      );
      const newCount = currentCount + 1;
      localStorage.setItem("localCounter", newCount.toString());

      console.log("✅ Local counter incremented to:", newCount);
      updateCounterDisplay(newCount);
      updateTotalLoadoutsDisplay(newCount);
      return;
    }

    const response = await fetch("/api/spin", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    });

    console.log(
      "📡 API Response status:",
      response.status,
      response.statusText
    );

    if (response.ok) {
      const data = await response.json();
      console.log("✅ Counter incremented successfully:", data.totalGenerated);

      // Update both the general counter display and the specific total-loadouts element
      updateCounterDisplay(data.totalGenerated);
      updateTotalLoadoutsDisplay(data.totalGenerated);

      // Also re-fetch from counter API to ensure accuracy
      await refreshCounterFromAPI();
    } else {
      const errorText = await response.text();
      console.error(
        "❌ Failed to increment counter:",
        response.status,
        errorText
      );
      // Try to refresh from API anyway
      await refreshCounterFromAPI();
    }
  } catch (error) {
    console.error("❌ Network error incrementing counter:", error.message);
    console.error("❌ Full error:", error);

    // Try to refresh from API as fallback
    try {
      await refreshCounterFromAPI();
    } catch (refreshError) {
      console.error(
        "❌ Also failed to refresh counter from API:",
        refreshError
      );
      // As final fallback, just show that we tried
      console.warn(
        "🔢 Counter update failed completely - continuing with cached value"
      );
    }
  }
}

// Re-fetch counter from API to ensure accuracy
async function refreshCounterFromAPI() {
  try {
    console.log("🔄 Refreshing counter from API...");

    const response = await fetch("/api/counter");
    if (response.ok) {
      const data = await response.json();
      console.log("✅ Refreshed counter from API:", data.totalGenerated);

      updateCounterDisplay(data.totalGenerated);
      updateTotalLoadoutsDisplay(data.totalGenerated);
    } else {
      console.warn("⚠️ Failed to refresh counter from API");
    }
  } catch (error) {
    console.warn("⚠️ Error refreshing counter from API:", error);
  }
}

// Simple function to fetch and update counter display
async function fetchAndUpdateCounter() {
  try {
    console.log("🔄🔄🔄 FETCHANDUPDATECOUNTER CALLED 🔄🔄🔄");
    alert("fetchAndUpdateCounter called!"); // Very visible debugging

    const response = await fetch("/api/counter");
    console.log("📡 Response status:", response.status);

    if (response.ok) {
      const data = await response.json();
      console.log("✅ Counter fetched:", data.totalGenerated);
      alert(`Counter fetched: ${data.totalGenerated}`); // Very visible debugging

      // Update all elements with class 'loadouts-counter'
      const counterElements = document.querySelectorAll(".loadouts-counter");
      console.log("🎯 Found counter elements:", counterElements.length);

      counterElements.forEach((element, index) => {
        const oldValue = element.textContent;
        element.textContent = data.totalGenerated.toLocaleString();
        console.log(
          `Updated element ${index}: "${oldValue}" → "${element.textContent}"`
        );
      });

      console.log("✅ Updated", counterElements.length, "counter elements");
      alert(
        `Updated ${
          counterElements.length
        } elements to ${data.totalGenerated.toLocaleString()}`
      );
    } else {
      console.warn("⚠️ Failed to fetch counter");
      alert("Failed to fetch counter");
    }
  } catch (error) {
    console.warn("⚠️ Error fetching counter:", error);
    alert(`Error: ${error.message}`);
  }
}

// Test function to manually update counter (for debugging)
window.testUpdateCounter = async function () {
  console.log("🧪 Manual counter test started");
  alert("Testing counter update...");

  try {
    const response = await fetch("/api/counter");
    const data = await response.json();
    console.log("Test counter value:", data.totalGenerated);

    const elements = document.querySelectorAll(".loadouts-counter");
    console.log("Found elements:", elements.length);

    elements.forEach((el) => {
      console.log("Updating element:", el);
      el.textContent = data.totalGenerated.toLocaleString();
      el.style.color = "red"; // Make it obvious
      el.style.fontWeight = "bold";
    });

    alert(`Updated ${elements.length} elements to ${data.totalGenerated}`);
  } catch (error) {
    console.error("Test failed:", error);
    alert("Test failed: " + error.message);
  }
};

// Update counter display on the page
function updateCounterDisplay(newCount) {
  if (!newCount) {
    console.log("⚠️ updateCounterDisplay called with no count:", newCount);
    return;
  }

  console.log("📊 Updating counter display to:", newCount);
  const counterElements = document.querySelectorAll(".loadouts-counter");
  console.log("📊 Found counter elements:", counterElements.length);

  counterElements.forEach((element) => {
    console.log("📊 Updating element:", element);
    if (element.dataset.countup === "true") {
      // If using countup animation
      animateCounterTo(element, newCount);
    } else {
      // Simple text update
      element.textContent = newCount.toLocaleString();
    }
  });
}

// animateCounterTo function removed - now in AnimationEngine.js

// Roast Me Again functionality
// Analysis button removed - commenting out function
/*
window.roastMeAgain = async function (button) {
  const historyEntry = button.closest(".history-entry");
  if (!historyEntry) {
    console.error("Could not find history entry");
    return;
  }

  // Extract loadout data from the history entry
  const classElement = historyEntry.querySelector(".class-badge");
  const weaponElement = historyEntry.querySelector(".weapon-item .item-name");
  const specElement = historyEntry.querySelector(".spec-item .item-name");
  const gadgetElements = historyEntry.querySelectorAll(
    ".gadget-item .item-name"
  );

  if (
    !classElement ||
    !weaponElement ||
    !specElement ||
    gadgetElements.length === 0
  ) {
    console.error("Could not extract loadout data from history entry");
    return;
  }

  const classType = classElement.textContent.trim();
  const weapon = weaponElement.textContent.trim();
  const specialization = specElement.textContent.trim();
  const gadgets = Array.from(gadgetElements).map((el) => el.textContent.trim());

  console.log("🔁 Roasting again:", {
    classType,
    weapon,
    specialization,
    gadgets,
  });

  // Find the AI analysis section and text elements
  const analysisSection = historyEntry.querySelector(".ai-analysis");
  const roastText = historyEntry.querySelector(".roast-text");
  const scoreBadge = historyEntry.querySelector(".score-badge");

  if (!analysisSection || !roastText) {
    console.error("Could not find analysis elements in history entry");
    return;
  }

  // Disable button and show loading state
  button.disabled = true;
  button.style.opacity = "0.5";
  analysisSection.classList.add("loading");
  analysisSection.classList.remove("high-score", "mid-score", "low-score");
  roastText.style.opacity = "0.5";
  roastText.innerHTML =
    '<span class="spinner"></span> Generating Loadout Analysis...';
  scoreBadge.textContent = "?/10";

  try {
    const requestData = {
      class: classType,
      weapon: weapon,
      specialization: specialization,
      gadgets: gadgets,
    };

    console.log("🚀 Sending fresh analysis request:", requestData);

    const response = await fetch("/api/loadout-analysis", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestData),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log("🎯 Received fresh analysis response:", data);

    // Update with new analysis and add visual feedback
    analysisSection.classList.remove("loading", "fallback");
    roastText.style.opacity = "0";

    setTimeout(() => {
      const analysisText = data.analysis || data.roast;
      roastText.textContent = analysisText;
      roastText.style.opacity = "1";
      roastText.style.transition = "opacity 0.3s ease";

      // Extract and update score
      const scoreMatch = analysisText.match(/(\d+)\/10/);
      if (scoreMatch) {
        scoreBadge.textContent = scoreMatch[0];
        const score = parseInt(scoreMatch[1]);
        if (score >= 8) analysisSection.classList.add("high-score");
        else if (score >= 5) analysisSection.classList.add("mid-score");
        else analysisSection.classList.add("low-score");
      }

      // Add a pulse effect to show it's fresh
      analysisSection.style.animation = "pulse 0.6s ease-in-out";
      setTimeout(() => {
        analysisSection.style.animation = "";
      }, 600);
    }, 150);
  } catch (error) {
    console.error("Error generating fresh analysis:", error);

    // Show fallback message
    analysisSection.classList.remove("loading");
    analysisSection.classList.add("fallback", "low-score");
    roastText.style.opacity = "0";

    setTimeout(() => {
      roastText.textContent =
        "Claude's too stunned to respond. Try again later.";
      roastText.style.opacity = "1";
      roastText.style.transition = "opacity 0.3s ease";
      scoreBadge.textContent = "0/10";
    }, 150);
  } finally {
    // Re-enable button
    button.disabled = false;
    button.style.opacity = "1";
  }
};
*/

// Initialize class exclusion system
function initializeClassExclusion() {
  console.log("✅ Initializing class inclusion system...");

  // One-time cleanup: Reset class preferences for new intuitive system
  if (!localStorage.getItem("class-system-updated")) {
    console.log("🔄 Updating class system to new intuitive logic...");
    localStorage.removeItem("exclude-light");
    localStorage.removeItem("exclude-medium");
    localStorage.removeItem("exclude-heavy");
    localStorage.setItem("class-system-updated", "true");
    console.log("✅ Class system updated to intuitive logic");
  }

  // Get all exclusion checkboxes
  const exclusionCheckboxes = document.querySelectorAll("[data-exclude-class]");

  if (exclusionCheckboxes.length === 0) {
    console.warn("⚠️ No class exclusion checkboxes found");
    return;
  }

  console.log(`✅ Found ${exclusionCheckboxes.length} inclusion checkboxes`);

  // Load saved settings from localStorage
  // Remember: checked=included, localStorage exclude='true' means excluded
  exclusionCheckboxes.forEach((checkbox) => {
    const className = checkbox.getAttribute("data-exclude-class");
    const saved = localStorage.getItem(`exclude-${className}`);
    if (saved === "true") {
      // exclude='true' means class is excluded, so checkbox should be unchecked
      checkbox.checked = false;
      console.log(`🚫 Loaded exclusion for ${className} (unchecked)`);
    } else if (saved === "false") {
      // exclude='false' means class is included, so checkbox should be checked
      checkbox.checked = true;
      console.log(`✅ Loaded inclusion for ${className} (checked)`);
    } else if (saved === null) {
      // Default to all classes included (checked) for new users
      checkbox.checked = true;
      localStorage.setItem(`exclude-${className}`, "false");
      console.log(`✅ Defaulted inclusion for ${className} (checked)`);
    }
  });

  // Add event listeners to save preferences
  exclusionCheckboxes.forEach((checkbox) => {
    checkbox.addEventListener("change", function () {
      const className = this.getAttribute("data-exclude-class");
      const isChecked = this.checked;

      // Save to localStorage
      // UI says "Select Classes to Include" so checked should mean INCLUDED
      // We invert the logic: checked=included means exclude=false in localStorage
      const localStorageKey = `exclude-${className}`;
      const valueToSave = (!isChecked).toString(); // Invert: checked=included means exclude=false
      localStorage.setItem(localStorageKey, valueToSave);

      // Detailed debugging logging
      console.log("🔍 CHECKBOX DEBUG INFO:");
      console.log(`  1) Checkbox ID: ${this.id || "No ID set"}`);
      console.log(`  2) Checked state: ${isChecked}`);
      console.log(`  3) localStorage key: ${localStorageKey}`);
      console.log(`  4) Value being saved: ${valueToSave}`);

      // Verification read-back
      const verificationValue = localStorage.getItem(localStorageKey);
      console.log(`  5) Verification read-back: ${verificationValue}`);
      console.log(
        `  📝 Summary: ${isChecked ? "✅" : "🚫"} ${className} class ${
          isChecked ? "included" : "excluded"
        }`
      );

      // Validate that at least one class remains available
      console.log(
        "✅ Class validation: Checking available classes after toggle..."
      );

      // Count how many checkboxes would be checked after this change
      let checkedCount = 0;
      exclusionCheckboxes.forEach((cb) => {
        if (cb === this) {
          // For the current checkbox, use the new state
          if (isChecked) checkedCount++;
        } else {
          // For other checkboxes, use their current state
          if (cb.checked) checkedCount++;
        }
      });

      console.log(`✅ Checked count after change: ${checkedCount}`);

      if (checkedCount === 0) {
        console.warn("⚠️ Cannot deselect all classes! Reverting change.");

        // Prevent the change
        this.checked = true;

        // Show banner inside filter panel
        const filterPanel = document.getElementById("filter-panel");
        if (!filterPanel) return;

        // Check if banner already exists
        let banner = filterPanel.querySelector(".constraint-banner");
        if (!banner) {
          banner = document.createElement("div");
          banner.className = "constraint-banner";
          banner.style.cssText = `
            position: absolute;
            top: 60px;
            left: 0;
            right: 0;
            background: linear-gradient(135deg, #ff6b35, #ff8e53);
            color: white;
            padding: 12px 20px;
            font-size: 14px;
            font-weight: 600;
            box-shadow: 0 4px 20px rgba(255, 107, 53, 0.6);
            z-index: 100;
            animation: bannerSlideDown 0.3s ease;
            text-align: center;
          `;

          // Add close button
          const closeBtn = document.createElement("button");
          closeBtn.innerHTML = "×";
          closeBtn.style.cssText = `
            position: absolute;
            right: 10px;
            top: 50%;
            transform: translateY(-50%);
            background: none;
            border: none;
            color: white;
            font-size: 20px;
            cursor: pointer;
            padding: 0 5px;
            opacity: 0.8;
            transition: opacity 0.2s;
          `;
          closeBtn.onmouseover = () => (closeBtn.style.opacity = "1");
          closeBtn.onmouseout = () => (closeBtn.style.opacity = "0.8");
          closeBtn.onclick = () => banner.remove();

          banner.textContent = "At least one class must remain selected!";
          banner.appendChild(closeBtn);

          // Insert after header
          const filterHeader = filterPanel.querySelector(".filter-header");
          if (filterHeader) {
            filterHeader.insertAdjacentElement("afterend", banner);
          } else {
            filterPanel.insertBefore(banner, filterPanel.firstChild);
          }
        }

        // Auto-remove banner after 5 seconds
        setTimeout(() => {
          if (banner && banner.parentNode) {
            banner.style.opacity = "0";
            banner.style.transform = "translateY(-20px)";
            setTimeout(() => banner.remove(), 300);
          }
        }, 5000);

        return; // Exit early, don't save the change
      }

      const availableClasses = getAvailableClasses();
      console.log(
        "✅ Class validation: Available classes after toggle:",
        availableClasses
      );

      // Repopulate filter items to reflect new class selection
      console.log("🔄 Repopulating filter items after class change...");
      populateFilterItems();
    });
  });

  console.log("✅ Class inclusion system initialized");
}

// Auto-dismiss the filters promotional banner after 7 seconds
document.addEventListener("DOMContentLoaded", function () {
  setTimeout(() => {
    const promoFlag = document.getElementById("filters-promo-flag");
    if (promoFlag && !promoFlag.classList.contains("dismissed")) {
      console.log("🏷️ Auto-dismissing filters promo flag after 7 seconds");
      promoFlag.classList.add("dismissed");

      // Remove from DOM after fade animation completes
      setTimeout(() => {
        if (promoFlag.parentNode) {
          promoFlag.remove();
        }
      }, 500);
    }
  }, 7000); // 7 seconds - middle of the 5-10 second range requested

  // Simple direct spin button setup
  const setupDirectSpinButton = () => {
    const spinButton = document.getElementById("main-spin-button");
    if (!spinButton) {
      console.error("❌ Could not find main-spin-button");
      return;
    }

    console.log("✅ Setting up direct spin button handler");

    // Remove any existing listeners first
    const newButton = spinButton.cloneNode(true);
    spinButton.parentNode.replaceChild(newButton, spinButton);

    newButton.addEventListener("click", () => {
      console.log("🎰 Generate Loadout button clicked!");

      if (state.isSpinning) {
        console.log("⚠️ Already spinning, ignoring click");
        return;
      }

      // Check if overlay manager is loaded
      if (
        window.overlayManager &&
        window.overlayManager.startLoadoutGeneration
      ) {
        console.log("🎭 Starting overlay flow...");
        window.overlayManager.startLoadoutGeneration();
      } else {
        console.log(
          "⚠️ Overlay manager not loaded, falling back to direct spin"
        );

        // Fallback to original behavior
        // Set default values if not set
        if (!state.totalSpins || state.totalSpins === 0) {
          state.totalSpins = 3; // Default to 3 spins
          console.log("📊 Setting default spin count to 3");
        }

        // Select a random class if none selected
        if (!state.selectedClass) {
          // Use the existing getAvailableClasses function which handles localStorage correctly
          const availableClasses = getAvailableClasses();

          state.selectedClass =
            availableClasses[
              Math.floor(Math.random() * availableClasses.length)
            ];
          console.log(`🎲 Randomly selected class: ${state.selectedClass}`);
        }

        // Start the spin
        try {
          spinLoadout();
        } catch (error) {
          console.error("❌ Error starting spin:", error);
          state.isSpinning = false;
        }
      }
    });

    console.log("✅ Direct spin button handler attached successfully");
  };

  // Set up the spin button immediately
  setupDirectSpinButton();

  // Sound toggle is now handled in index.html - removed duplicate handler

  // Initialize filter panel functionality
  const filterToggle = document.getElementById("filter-toggle");
  const filterPanel = document.getElementById("filter-panel");
  const filterOverlay = document.getElementById("filter-panel-overlay");
  const closeFilterBtn = document.getElementById("close-filter-panel");

  if (filterToggle && filterPanel && filterOverlay) {
    console.log("🎛️ Initializing filter panel");

    // Open filter panel
    filterToggle.addEventListener("click", function () {
      console.log("🎛️ Opening filter panel");
      filterPanel.classList.remove("slide-out");
      filterPanel.classList.add("active");
      filterOverlay.classList.add("active");
      filterPanel.style.display = "block";

      // Play click sound
      playSound("clickSound");
    });

    // Close filter panel
    const closeFilterPanel = () => {
      console.log("🎛️ Closing filter panel");
      filterPanel.classList.remove("active");
      filterPanel.classList.add("slide-out");
      filterOverlay.classList.remove("active");

      // Hide after animation
      setTimeout(() => {
        if (!filterPanel.classList.contains("active")) {
          filterPanel.style.display = "none";
        }
      }, 300);

      // Play click sound
      playSound("clickSound");
    };

    // Close button handler
    if (closeFilterBtn) {
      closeFilterBtn.addEventListener("click", closeFilterPanel);
    }

    // Close on overlay click
    filterOverlay.addEventListener("click", closeFilterPanel);

    // Close on ESC key
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && filterPanel.classList.contains("active")) {
        closeFilterPanel();
      }
    });
  } else {
    console.warn("⚠️ Filter panel elements not found");
  }
});

fetch("https://api.github.com/repos/paultaki/TheFinalsLoadout/commits/main")
  .then((res) => res.json())
  .then((data) => {
    const hash = data.sha.slice(0, 7);
    const date = new Date(data.commit.author.date).toLocaleDateString();
    const el = document.getElementById("deploy-version");
    if (el) {
      el.innerHTML = `Version: <a href="https://github.com/paultaki/TheFinalsLoadout/commit/${hash}" target="_blank">${hash}</a> (${date})`;
    }
  })
  .catch(() => {
    const el = document.getElementById("deploy-version");
    if (el) el.textContent = "Version: unknown";
  });

// Copy loadout as formatted text
window.copyLoadoutText = function (button) {
  const entry = button.closest(".history-entry");
  const classType =
    entry.querySelector(".class-badge")?.textContent || "Unknown";
  const loadoutName =
    entry.querySelector(".loadout-name")?.textContent || "Unnamed Loadout";
  const weapon =
    entry.querySelector(".weapon-item .item-name")?.textContent ||
    "Unknown Weapon";
  const spec =
    entry.querySelector(".spec-item .item-name")?.textContent || "Unknown Spec";
  const gadgets = Array.from(entry.querySelectorAll(".gadget-item .item-name"))
    .map((el) => el.textContent)
    .join(", ");
  const analysis =
    entry.querySelector(".roast-text")?.textContent || "No analysis available";
  const score = entry.querySelector(".score-badge")?.textContent || "?/10";

  const text = `${loadoutName} (${classType})
WEAPON: ${weapon}
SPECIALIZATION: ${spec}
GADGETS: ${gadgets}

AI ANALYSIS: ${analysis} ${score}

Generated by thefinalsloadout.com`;

  navigator.clipboard
    .writeText(text)
    .then(() => {
      // Show success animation
      const originalText = button.innerHTML;
      button.innerHTML = "<span>✅</span> Copied!";
      button.classList.add("success");

      setTimeout(() => {
        button.innerHTML = originalText;
        button.classList.remove("success");
      }, 2000);
    })
    .catch((err) => {
      console.error("Failed to copy text:", err);
      alert("Failed to copy to clipboard");
    });
};

// Copy loadout as image
window.copyLoadoutImage = function (button) {
  const entry = button.closest(".history-entry");
  const cardContent = entry.querySelector(".casino-history-card");

  if (!cardContent) {
    console.error("Card content not found");
    return;
  }

  // Show loading state
  const originalText = button.innerHTML;
  button.innerHTML = "<span>⏳</span> Capturing...";
  button.disabled = true;

  // Ensure container and all children are fully visible
  const originalStyles = {
    opacity: cardContent.style.opacity,
    display: cardContent.style.display,
    visibility: cardContent.style.visibility,
    minHeight: cardContent.style.minHeight
  };

  // Force visibility
  cardContent.style.opacity = '1';
  cardContent.style.display = 'block';
  cardContent.style.visibility = 'visible';
  cardContent.style.minHeight = '1px';

  // Find all images within the container
  const images = cardContent.querySelectorAll('img');
  const imagePromises = [];

  // Create promises for each image to ensure they're loaded
  images.forEach(img => {
    if (!img.complete || img.naturalHeight === 0) {
      const promise = new Promise((resolve, reject) => {
        const tempImg = new Image();
        tempImg.onload = () => {
          // Ensure the original img element is properly sized
          if (img.naturalHeight === 0 || img.naturalWidth === 0) {
            img.style.minWidth = '1px';
            img.style.minHeight = '1px';
          }
          resolve();
        };
        tempImg.onerror = () => {
          console.warn('Failed to load image:', img.src);
          // Set minimum dimensions to prevent canvas errors
          img.style.minWidth = '50px';
          img.style.minHeight = '50px';
          resolve(); // Resolve anyway to continue with capture
        };
        tempImg.src = img.src;
      });
      imagePromises.push(promise);
    }
  });

  // Wait for all images to load
  Promise.all(imagePromises).then(() => {
    // Force reflow to ensure dimensions are calculated
    cardContent.offsetHeight; // This forces a reflow

    // Check if container has valid dimensions
    if (cardContent.offsetWidth === 0 || cardContent.offsetHeight === 0) {
      console.error('Container has zero dimensions, forcing minimum size');
      cardContent.style.minWidth = '300px';
      cardContent.style.minHeight = '200px';
      cardContent.style.display = 'block';
    }

    // Configure html2canvas for high quality casino mode capture
    const options = {
      backgroundColor: "#1a0f3d",
      scale: 2,
      useCORS: true,
      allowTaint: true,
      logging: false,
      width: Math.max(cardContent.offsetWidth, 300),
      height: Math.max(cardContent.offsetHeight, 200),
      scrollX: 0,
      scrollY: 0,
      // Add some padding for the glow effects
      x: -10,
      y: -10,
      windowWidth: Math.max(cardContent.offsetWidth + 20, 320),
      windowHeight: Math.max(cardContent.offsetHeight + 20, 220),
      onclone: (clonedDoc, element) => {
        // Ensure cloned element is visible
        element.style.opacity = '1';
        element.style.display = 'block';
        element.style.visibility = 'visible';
        element.style.minHeight = '1px';
        
        // Fix any images in the cloned document
        const clonedImages = element.querySelectorAll('img');
        clonedImages.forEach(img => {
          if (img.naturalWidth === 0 || img.naturalHeight === 0) {
            img.style.minWidth = '50px';
            img.style.minHeight = '50px';
          }
        });
      }
    };

    html2canvas(cardContent, options)
    .then((canvas) => {
      canvas.toBlob(
        (blob) => {
          // Try to copy to clipboard first
          if (navigator.clipboard && window.ClipboardItem) {
            navigator.clipboard
              .write([new ClipboardItem({ "image/png": blob })])
              .then(() => {
                // Success - image copied to clipboard
                button.innerHTML = "<span>✅</span> Copied!";
                button.classList.add("success");

                setTimeout(() => {
                  button.innerHTML = originalText;
                  button.classList.remove("success");
                  button.disabled = false;
                }, 2000);
              })
              .catch((err) => {
                // Fallback to download if clipboard API fails
                console.log("Clipboard API failed, downloading instead:", err);
                downloadImage(canvas, button, originalText);
              });
          } else {
            // Browser doesn't support clipboard API, download instead
            downloadImage(canvas, button, originalText);
          }
        },
        "image/png",
        1.0
      );
    })
    .catch((err) => {
      console.error("Screenshot failed:", err);
      button.innerHTML = "<span>❌</span> Failed";
      
      // Restore original styles
      cardContent.style.opacity = originalStyles.opacity || '';
      cardContent.style.display = originalStyles.display || '';
      cardContent.style.visibility = originalStyles.visibility || '';
      cardContent.style.minHeight = originalStyles.minHeight || '';
      
      setTimeout(() => {
        button.innerHTML = originalText;
        button.disabled = false;
      }, UI_TIMING.BUTTON_FEEDBACK_DURATION);
    })
    .finally(() => {
      // Always restore original styles after capture attempt
      setTimeout(() => {
        cardContent.style.opacity = originalStyles.opacity || '';
        cardContent.style.display = originalStyles.display || '';
        cardContent.style.visibility = originalStyles.visibility || '';
        cardContent.style.minHeight = originalStyles.minHeight || '';
      }, 100);
    });
  }).catch(err => {
    console.error("Failed to load images:", err);
    button.innerHTML = "<span>❌</span> Failed";
    
    // Restore original styles
    cardContent.style.opacity = originalStyles.opacity || '';
    cardContent.style.display = originalStyles.display || '';
    cardContent.style.visibility = originalStyles.visibility || '';
    cardContent.style.minHeight = originalStyles.minHeight || '';
    
    setTimeout(() => {
      button.innerHTML = originalText;
      button.disabled = false;
    }, 2000);
  });
};

// Helper function to download image
function downloadImage(canvas, button, originalText) {
  const link = document.createElement("a");
  const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, "-");
  link.download = `finals-loadout-${timestamp}.png`;
  link.href = canvas.toDataURL("image/png", 1.0);

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  button.innerHTML = "<span>⬇️</span> Downloaded!";
  setTimeout(() => {
    button.innerHTML = originalText;
    button.disabled = false;
  }, 2000);
}

// ===== Overlay Sequence for Generate Loadout =====
// Assumes overlay container exists in index.html and CSS is present

// Utility: Show/hide overlay container
function showOverlay(contentHtml) {
  const overlay = document.getElementById("overlay-container");
  overlay.innerHTML = contentHtml;
  overlay.style.display = "flex";
}
function hideOverlay() {
  const overlay = document.getElementById("overlay-container");
  overlay.style.display = "none";
  overlay.innerHTML = "";
}

// Overlay function stubs - COMMENTED OUT - Real implementations are in overlay-manager.js
/*
function showSpinWheelOverlay() {
  return new Promise((resolve) => {
    // TODO: Replace with ported Price is Right wheel overlay
    showOverlay('<div class="overlay-card">Spinning for # of Spins...</div>');
    setTimeout(() => {
      // Simulate result: 3 spins or 'JACKPOT'
      const result =
        Math.random() < 0.15 ? "JACKPOT" : Math.floor(Math.random() * 5) + 1;
      hideOverlay();
      resolve(result);
    }, 2000);
  });
}

function showOverlayCard(text) {
  return new Promise((resolve) => {
    showOverlay(`<div class="overlay-card">${text}</div>`);
    setTimeout(() => {
      hideOverlay();
      resolve();
    }, 2000);
  });
}

function showClassRouletteOverlay() {
  return new Promise((resolve) => {
    // TODO: Replace with ported class roulette overlay
    showOverlay('<div class="overlay-card">Spinning for Class...</div>');
    setTimeout(() => {
      // Simulate class selection
      const classes = ["Light", "Medium", "Heavy"];
      const selected = classes[Math.floor(Math.random() * classes.length)];
      hideOverlay();
      resolve(selected);
    }, 2000);
  });
}

function showClassPickerOverlay() {
  return new Promise((resolve) => {
    // TODO: Replace with ported class picker overlay
    // For now, just pick randomly after 2s
    showOverlay('<div class="overlay-card">Pick your class! (Simulated)</div>');
    setTimeout(() => {
      const classes = ["Light", "Medium", "Heavy"];
      const selected = classes[Math.floor(Math.random() * classes.length)];
      hideOverlay();
      resolve(selected);
    }, 2000);
  });
}
*/

// Main async sequence for Generate Loadout - COMMENTED OUT - Using overlay-manager.js instead
/*
async function handleGenerateLoadout() {
  if (window.state && window.state.isSpinning) return;
  if (!window.state) window.state = {};
  window.state.isSpinning = true;

  // Step 1: Spin wheel overlay
  const spinCount = await showSpinWheelOverlay();
  await showOverlayCard(`Number of Spins: ${spinCount}`);

  // Step 2: Jackpot logic
  if (spinCount === "JACKPOT") {
    const chosenClass = await showClassPickerOverlay();
    await showOverlayCard(`You Picked: ${chosenClass}`);
    // If your card UI provides a random spin number, use it here
    const randomSpin = Math.floor(Math.random() * 5) + 1;
    startSlotMachineSequence(chosenClass, randomSpin);
    window.state.isSpinning = false;
    return;
  }

  // Step 3: Class roulette overlay
  const selectedClass = await showClassRouletteOverlay();
  await showOverlayCard(`Class Selected: ${selectedClass}`);

  // Step 4: Start slot machine
  startSlotMachineSequence(selectedClass, spinCount);
  window.state.isSpinning = false;
}
*/

// Slot machine integration
function startSlotMachineSequence(classType, spins) {
  // Set state and call your existing slot machine logic
  if (!window.state) window.state = {};
  window.state.selectedClass = classType;
  window.state.totalSpins = spins;
  // TODO: Replace with your actual slot machine function
  if (typeof spinLoadout === "function") {
    spinLoadout(classType, spins);
  } else {
    console.log("Slot machine would start with:", classType, spins);
  }
}

// REMOVED: Duplicate event listener - already handled in setupDirectSpinButton()
