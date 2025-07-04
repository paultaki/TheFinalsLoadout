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
    filterOverlay.classList.add("active");

    // Slide in panel
    filterPanel.classList.add("active");

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
    filterOverlay.classList.remove("active");

    // Slide out panel
    filterPanel.classList.remove("active");

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
      showErrorModal(
        "Spin In Progress",
        "Cannot apply filters while a spin is in progress. Please wait for the current spin to complete."
      );
      return;
    }

    // Validate filter selection
    const validation = validateFilterSelection();
    if (!validation.isValid) {
      console.log("❌ Filter validation failed:", validation.errors);
      showErrorModal(
        "Invalid Filter Selection",
        validation.errors.join("\n\n")
      );
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

  // DIRECT BUTTON MANIPULATION - 100% reliable method
  console.log("🔒 Getting direct references to all spin buttons");
  const spinBtns = document.querySelectorAll(".spin-button");
  console.log(`Found ${spinBtns.length} spin buttons`);

  // Force disable ALL spin buttons EXCEPT the main spin button
  spinBtns.forEach((btn, index) => {
    if (btn.id === "main-spin-button") {
      console.log(`Skipping main spin button`);
      return;
    }

    console.log(`Disabling spin button ${index + 1}`);
    btn.disabled = true;
    btn.setAttribute("disabled", "disabled");
    btn.classList.add("dimmed");
    btn.dataset.disabledAt = new Date().toISOString();
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

      // ✅ Add to history using the new SlotHistoryManager
      const loadout = {
          class: savedClass,
          weapon: { name: weapon, image: `images/${weapon.replace(/ /g, '_')}.webp` },
          specialization: { name: specialization, image: `images/${specialization.replace(/ /g, '_')}.webp` },
          gadgets: gadgets.map(g => ({ name: g, image: `images/${g.replace(/ /g, '_')}.webp` }))
      };
      slotHistoryManager.addToHistory(loadout);

              // Display roast immediately below the slot machine and get the generated roast
        displayRoastBelowSlotMachine(savedClass, weapon, specialization, gadgets)
          .then((generatedRoast) => {
            console.log("✅ Successfully displayed roast:", loadoutString);
            isAddingToHistory = false; // Reset the flag
          })
          .catch((error) => {
            console.error("❌ Error displaying roast:", error);
            isAddingToHistory = false; // Reset the flag
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
// OLD addToHistory function removed - now using SlotHistoryManager

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

// OLD saveHistory function removed - now using SlotHistoryManager

// OLD loadHistory function removed - now using SlotHistoryManager

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

// ===========================
// SLOT HISTORY MANAGER CLASS
// ===========================
class SlotHistoryManager {
    constructor() {
        this.history = [];
        this.maxHistory = 5; // Display 5 by default
        this.spinCounter = 0;
        this.soundEnabled = true;
        this.showAll = false;
        this.loadFromStorage();
    }

    loadFromStorage() {
        try {
            const savedHistory = localStorage.getItem('slotMachineHistory');
            const savedCounter = localStorage.getItem('slotMachineSpinCounter');
            if (savedHistory) {
                this.history = JSON.parse(savedHistory);
            }
            if (savedCounter) {
                this.spinCounter = parseInt(savedCounter, 10);
            }
        } catch (error) {
            console.error('Failed to load history from storage:', error);
        }
    }

    saveToStorage() {
        try {
            localStorage.setItem('slotMachineHistory', JSON.stringify(this.history));
            localStorage.setItem('slotMachineSpinCounter', this.spinCounter.toString());
        } catch (error) {
            console.error('Failed to save history to storage:', error);
        }
    }

    addToHistory(loadout) {
        loadout.spinNumber = ++this.spinCounter;
        loadout.timestamp = new Date();
        this.history.unshift(loadout);
        this.saveToStorage();
        this.render();
        this.playSound('addSound');
        this.showToast('Loadout saved to history!');

        // Generate AI analysis for the new loadout (index 0)
        setTimeout(() => {
            this.generateAIAnalysis(0);
        }, 1000);
    }

    clearHistory() {
        this.history = [];
        this.spinCounter = 0;
        this.saveToStorage();
        this.render();
        this.showToast('History cleared!');
    }

    toggleShowAll() {
        this.showAll = !this.showAll;
        this.render();
    }

    render() {
        const historyList = document.getElementById('history-list');
        const historyCount = document.getElementById('history-count');
        if (!historyList || !historyCount) {
            console.error('SlotHistoryManager: Could not find history-list or history-count elements');
            return;
        }

        console.log('SlotHistoryManager: Rendering history with', this.history.length, 'items');
        historyCount.textContent = `(${this.history.length})`;

        if (this.history.length === 0) {
            historyList.innerHTML = `<div class="empty-state"><p>No loadouts yet. Spin the wheel!</p></div>`;
            return;
        }

        const itemsToShow = this.showAll ? this.history : this.history.slice(0, this.maxHistory);
        const htmlContent = itemsToShow.map((loadout, index) => this.createHistoryItemHTML(loadout, index)).join('');
        console.log('SlotHistoryManager: Generated HTML preview:', htmlContent.substring(0, 500) + '...');
        historyList.innerHTML = htmlContent;

        if (this.history.length > this.maxHistory) {
            const expandButton = document.createElement('button');
            expandButton.className = 'expand-history-btn';
            expandButton.textContent = this.showAll ? 'Show Less' : `Show All (${this.history.length} total)`;
            expandButton.onclick = () => this.toggleShowAll();
            historyList.appendChild(expandButton);
        }

        this.attachEventListeners();

        // Generate AI analysis for each item after rendering
        itemsToShow.forEach((loadout, index) => {
            setTimeout(() => {
                this.generateAIAnalysis(index);
            }, 100 * index); // Stagger the API calls to avoid overwhelming the server
        });
    }

    createHistoryItemHTML(loadout, index) {
        const timeAgo = this.getTimeAgo(loadout.timestamp);
        return `
            <div class="static-slot-item" data-index="${index}">
                <div class="item-header">
                    <div class="item-metadata">
                        <span class="class-badge ${loadout.class.toLowerCase()}">${loadout.class.toUpperCase()} CLASS</span>
                        <span class="spin-number">#${loadout.spinNumber}</span>
                        <span class="timestamp">${timeAgo}</span>
                    </div>
                    <div class="action-buttons">
                        <button class="action-btn copy-text" data-index="${index}">Copy Text</button>
                        <button class="action-btn copy-image" data-index="${index}">Copy Image</button>
                    </div>
                </div>
                <div class="slot-display" id="slot-display-${index}">
                    <div class="slot-box ${loadout.class.toLowerCase()}">
                        <div class="slot-label">WEAPON</div>
                        <img src="${loadout.weapon.image}" alt="${loadout.weapon.name}" class="slot-image" onerror="this.src='images/placeholder.webp';">
                        <div class="slot-name">${loadout.weapon.name}</div>
                    </div>
                    <div class="slot-box ${loadout.class.toLowerCase()}">
                        <div class="slot-label">SPECIAL</div>
                        <img src="${loadout.specialization.image}" alt="${loadout.specialization.name}" class="slot-image" onerror="this.src='images/placeholder.webp';">
                        <div class="slot-name">${loadout.specialization.name}</div>
                    </div>
                    ${loadout.gadgets.map((gadget, i) => `
                        <div class="slot-box ${loadout.class.toLowerCase()}">
                            <div class="slot-label">GADGET ${i + 1}</div>
                            <img src="${gadget.image}" alt="${gadget.name}" class="slot-image" onerror="this.src='images/placeholder.webp';">
                            <div class="slot-name">${gadget.name}</div>
                        </div>
                    `).join('')}
                </div>
                <div class="ai-analysis loading" id="ai-analysis-${index}">
                    <div class="ai-icon">🤖</div>
                    <div class="roast-text">Generating AI analysis...</div>
                    <div class="score-badge">?/10</div>
                </div>
                <div class="particles"></div>
            </div>`;
    }

    getTimeAgo(timestamp) {
        const now = new Date();
        const diff = now - new Date(timestamp);
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);

        if (days > 0) return `${days}d ago`;
        if (hours > 0) return `${hours}h ago`;
        if (minutes > 0) return `${minutes}m ago`;
        return 'Just now';
    }

    copyAsText(index) {
        const loadout = this.history[index];
        if (!loadout) return;

        const text = `${loadout.class.toUpperCase()} CLASS LOADOUT #${loadout.spinNumber}
Weapon: ${loadout.weapon.name}
Specialization: ${loadout.specialization.name}
Gadgets: ${loadout.gadgets.map(g => g.name).join(', ')}

Generated by thefinalsloadout.com`;

        navigator.clipboard.writeText(text).then(() => {
            this.showToast('Loadout copied to clipboard!');
        }).catch(err => {
            console.error('Failed to copy text: ', err);
            this.showToast('Failed to copy text');
        });
    }

    async copyAsImage(index) {
        const loadout = this.history[index];
        if (!loadout) return;

        try {
            const slotDisplay = document.getElementById(`slot-display-${index}`);
            if (!slotDisplay) return;

            // Add class badge and watermark for image export
            const tempContainer = document.createElement('div');
            tempContainer.style.cssText = `
                position: absolute;
                top: -9999px;
                left: -9999px;
                background: #1a1a1a;
                padding: 20px;
                border-radius: 15px;
                font-family: 'Orbitron', monospace;
            `;

            const classBadge = document.createElement('div');
            classBadge.textContent = `${loadout.class.toUpperCase()} CLASS`;
            classBadge.style.cssText = `
                text-align: center;
                font-size: 18px;
                font-weight: bold;
                color: ${loadout.class.toLowerCase() === 'light' ? '#00bcd4' :
                       loadout.class.toLowerCase() === 'medium' ? '#9c27b0' : '#f44336'};
                margin-bottom: 15px;
                text-shadow: 0 0 10px currentColor;
            `;

            const clonedDisplay = slotDisplay.cloneNode(true);
            clonedDisplay.style.margin = '0';

            const watermark = document.createElement('div');
            watermark.textContent = 'thefinalsloadout.com';
            watermark.style.cssText = `
                text-align: center;
                margin-top: 15px;
                font-size: 12px;
                color: #666;
                font-weight: normal;
            `;

            tempContainer.appendChild(classBadge);
            tempContainer.appendChild(clonedDisplay);
            tempContainer.appendChild(watermark);
            document.body.appendChild(tempContainer);

            const canvas = await html2canvas(tempContainer, {
                backgroundColor: '#1a1a1a',
                scale: 2,
                useCORS: true
            });

            document.body.removeChild(tempContainer);

            canvas.toBlob(blob => {
                const item = new ClipboardItem({ 'image/png': blob });
                navigator.clipboard.write([item]).then(() => {
                    this.showToast('Image copied to clipboard!');
                }).catch(err => {
                    console.error('Failed to copy image: ', err);
                    this.showToast('Failed to copy image');
                });
            });
        } catch (error) {
            console.error('Failed to copy as image:', error);
            this.showToast('Failed to copy image');
        }
    }

    attachEventListeners() {
        document.querySelectorAll('.copy-text').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const index = parseInt(e.target.dataset.index);
                this.copyAsText(index);
            });
        });

        document.querySelectorAll('.copy-image').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const index = parseInt(e.target.dataset.index);
                this.copyAsImage(index);
            });
        });
    }

    async generateAIAnalysis(index) {
        const loadout = this.history[index];
        if (!loadout) return;

        const analysisElement = document.getElementById(`ai-analysis-${index}`);
        if (!analysisElement) return;

        const roastText = analysisElement.querySelector('.roast-text');
        const scoreBadge = analysisElement.querySelector('.score-badge');

        try {
            // Prepare data for the API call
            const requestData = {
                class: loadout.class,
                weapon: loadout.weapon.name,
                specialization: loadout.specialization.name,
                gadgets: loadout.gadgets.map(g => g.name)
            };

            console.log('🚀 Generating AI analysis for loadout:', requestData);

            // Call the analysis API
            const response = await fetch('/api/loadout-analysis', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestData)
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            console.log('🎯 Received AI analysis:', data);

            // Update the analysis display
            analysisElement.classList.remove('loading');
            roastText.textContent = data.analysis || data.roast;

            // Extract and display score
            const scoreMatch = (data.analysis || data.roast).match(/(\d+)\/10/);
            if (scoreMatch) {
                scoreBadge.textContent = scoreMatch[0];
                const score = parseInt(scoreMatch[1]);
                if (score >= 8) analysisElement.classList.add('high-score');
                else if (score >= 5) analysisElement.classList.add('mid-score');
                else analysisElement.classList.add('low-score');
            }

            // Add fallback indicator if API failed
            if (data.fallback) {
                analysisElement.classList.add('fallback');
            }

        } catch (error) {
            console.error('Error generating AI analysis:', error);

            // Use fallback analysis logic
            const weapon = loadout.weapon.name;
            const specialization = loadout.specialization.name;
            const gadgets = loadout.gadgets.map(g => g.name);

            // Categorize weapons for fallback
            const annoyingWeapons = ['Sword', 'Lockbolt X', 'SH1900', 'Throwing Knives', 'Dual Blades', 'Riot Shield', 'Flamethrower', 'Spear', 'M32-GL', 'CL-40'];
            const difficultWeapons = ['M60', 'R.357', 'CB-01 Repeater', 'Recurve Bow', 'Dagger', 'AKM'];

            const isAnnoying = annoyingWeapons.includes(weapon);
            const isDifficult = difficultWeapons.includes(weapon);

            let fallbackAnalysis = [];

            if (isAnnoying) {
                fallbackAnalysis = [
                    `${weapon} and ${specialization}? You're here to ruin someone's day - I like your style! 8/10`,
                    `${loadout.class} with ${weapon}? Maximum tilt potential achieved. The salt will flow! 7/10`,
                    `${specialization} + ${gadgets[0]}? Chaotic evil, but make it fun! 8/10`,
                ];
            } else if (isDifficult) {
                fallbackAnalysis = [
                    `${weapon} and ${specialization}? Playing on expert mode - respect the grind! 8/10`,
                    `${loadout.class} with ${weapon}? You're not here for easy wins, you're here for glory! 9/10`,
                    `Mastering ${weapon} with these gadgets? That's champion mentality right there! 8/10`,
                ];
            } else {
                fallbackAnalysis = [
                    `${weapon} and ${specialization}? Unconventional but intriguing. Science requires sacrifice! 6/10`,
                    `${loadout.class} with ${weapon}? You're inventing the meta, one match at a time! 7/10`,
                    `${specialization} + ${gadgets[0]}? Creative loadout! Success not guaranteed, fun definitely is! 7/10`,
                ];
            }

            const selectedAnalysis = fallbackAnalysis[Math.floor(Math.random() * fallbackAnalysis.length)];

            analysisElement.classList.remove('loading');
            analysisElement.classList.add('fallback');
            roastText.textContent = selectedAnalysis;

            // Extract and display score
            const scoreMatch = selectedAnalysis.match(/(\d+)\/10/);
            if (scoreMatch) {
                scoreBadge.textContent = scoreMatch[0];
                const score = parseInt(scoreMatch[1]);
                if (score >= 8) analysisElement.classList.add('high-score');
                else if (score >= 5) analysisElement.classList.add('mid-score');
                else analysisElement.classList.add('low-score');
            }
        }
    }

    createParticles(element) {
        for (let i = 0; i < 6; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle';
            particle.style.cssText = `
                position: absolute;
                width: 4px;
                height: 4px;
                background: linear-gradient(45deg, #00bcd4, #9c27b0);
                border-radius: 50%;
                pointer-events: none;
                animation: particleFloat 2s ease-out forwards;
                left: ${Math.random() * 100}%;
                top: ${Math.random() * 100}%;
                animation-delay: ${Math.random() * 0.5}s;
            `;
            element.appendChild(particle);
            setTimeout(() => particle.remove(), 2000);
        }
    }

    playSound(soundId) {
        if (!this.soundEnabled) return;
        const audio = document.getElementById(soundId);
        if (audio) {
            audio.currentTime = 0;
            audio.play().catch(e => console.log('Audio play failed:', e));
        }
    }

    showToast(message) {
        const toast = document.createElement('div');
        toast.textContent = message;
        toast.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: rgba(0, 188, 212, 0.9);
            color: white;
            padding: 12px 20px;
            border-radius: 8px;
            font-family: 'Orbitron', monospace;
            font-size: 14px;
            z-index: 10000;
            animation: slideIn 0.3s ease-out;
        `;
        document.body.appendChild(toast);
        setTimeout(() => {
            toast.style.animation = 'slideOut 0.3s ease-out forwards';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }
}

// Initialize SlotHistoryManager instance (must be before DOMContentLoaded)
const slotHistoryManager = new SlotHistoryManager();

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

  // Initialize error modal system
  initializeErrorModal();

  // Initialize mobile performance optimizations
  initializeMobileOptimizations();

  // Initialize SlotHistoryManager
  console.log("🎰 Initializing SlotHistoryManager...");
  slotHistoryManager.render();
  console.log("✅ SlotHistoryManager initialized");

  // Set up clear history button
  const clearButton = document.getElementById('clear-history');
  if (clearButton) {
    clearButton.addEventListener('click', () => {
      if (confirm('Are you sure you want to clear all history?')) {
        slotHistoryManager.clearHistory();
      }
    });
    console.log("✅ Clear history button initialized");
  }

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

  // Set up the main SPIN button with overlay integration
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
          if (state.isSpinning) {
            return;
          }

          // Check if any classes are available
          const availableClasses = getAvailableClasses();
          if (availableClasses.length === 0) {
            alert("Please select at least one class in the filters before spinning!");
            return;
          }

          retryButton.classList.add("spinning");

          try {
            console.log("🚀 Starting overlay sequence (retry)...");
            // Use overlay manager if available
            if (window.overlayManager && window.overlayManager.startLoadoutGeneration) {
              window.overlayManager.startLoadoutGeneration();
            } else {
              console.log("⚠️ Overlay manager not loaded, falling back to direct spin");
              displayRandomLoadout();
            }
          } catch (error) {
            console.error("❌ Retry overlay error:", error);
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

  // OLD loadHistory calls removed - now using SlotHistoryManager initialization

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

  // ===========================
  // History Manager
// =====================================================
// GLOBAL AUDIO MANAGEMENT SYSTEM
  // ... existing code ...
  async function finalizeSpin(columns) {
    // ... existing code ...

    // ✅ Add to history
    const loadout = {
        class: classType,
        weapon: { name: selectedWeapon, image: `images/${selectedWeapon.replace(/ /g, '_')}.webp` },
        specialization: { name: selectedSpec, image: `images/${selectedSpec.replace(/ /g, '_')}.webp` },
        gadgets: selectedGadgets.map(g => ({ name: g, image: `images/${g.replace(/ /g, '_')}.webp` }))
    };
    slotHistoryManager.addToHistory(loadout);

    // ... existing code ...
  }
  // ... existing code ...
  // Remove old history functions: addToHistory, saveHistory, loadHistory, and the clear-history listener.
  // ... existing code ...
  document.addEventListener("DOMContentLoaded", () => {
    // ... (existing initializations)

    // Initial render of history
    slotHistoryManager.render();

    // Clear history button
    const clearButton = document.getElementById('clear-history');
    if(clearButton) {
        clearButton.addEventListener('click', () => {
            if (confirm('Are you sure you want to clear all history?')) {
                slotHistoryManager.clearHistory();
            }
        });
    }
  });
});

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
      const availableClasses = getAvailableClasses();
      console.log(
        "✅ Class validation: Available classes after toggle:",
        availableClasses
      );
      if (availableClasses.length === 0) {
        console.warn("⚠️ All classes would be excluded! Reverting change.");
        showErrorModal(
          "Class Selection Required",
          "You cannot uncheck all classes! At least one class must remain selected for random generation."
        );

        // Revert the change - since we inverted the logic, restore the checkbox to checked
        this.checked = true;
        localStorage.setItem(`exclude-${className}`, "false"); // false = included
        console.log(`🔄 Reverted ${className} back to included state`);
        return; // Don't repopulate if we reverted
      }

      // Repopulate filter items when class inclusion changes
      console.log("🔄 Class inclusion changed, repopulating filter items...");
      populateFilterItems();
    });
  });

  console.log("✅ Class inclusion system initialized");
}

// =====================================================
// ERROR MODAL SYSTEM
// =====================================================

function showErrorModal(title, message) {
  const modal = document.getElementById('filter-error-modal');
  const titleElement = modal.querySelector('.error-modal-header h3');
  const messageElement = document.getElementById('error-modal-message');

  // Update content
  titleElement.textContent = `⚠️ ${title}`;
  messageElement.textContent = message;

  // Show modal
  modal.style.display = 'flex';

  // Focus management
  const okButton = document.getElementById('error-modal-ok');
  if (okButton) {
    okButton.focus();
  }
}

function hideErrorModal() {
  const modal = document.getElementById('filter-error-modal');
  modal.style.display = 'none';
}

// Initialize error modal event listeners
function initializeErrorModal() {
  const modal = document.getElementById('filter-error-modal');
  const closeButton = document.getElementById('close-error-modal');
  const okButton = document.getElementById('error-modal-ok');

  if (!modal || !closeButton || !okButton) {
    console.warn('⚠️ Error modal elements not found');
    return;
  }

  // Close button
  closeButton.addEventListener('click', hideErrorModal);

  // OK button
  okButton.addEventListener('click', hideErrorModal);

  // Click outside to close
  modal.addEventListener('click', function(e) {
    if (e.target === modal) {
      hideErrorModal();
    }
  });

  // Escape key to close
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && modal.style.display === 'flex') {
      hideErrorModal();
    }
  });

  console.log('✅ Error modal initialized');
}

// =====================================================
// FILTER VALIDATION SYSTEM
// =====================================================

function validateFilterSelection() {
  const includedClasses = getIncludedClasses();
  const errors = [];

  // Check each included class for minimum requirements
  for (const className of includedClasses) {
    const classCapitalized = className.charAt(0).toUpperCase() + className.slice(1);

    // Check weapons (minimum 1)
    const weaponCheckboxes = document.querySelectorAll(
      `#filter-panel input[data-type="weapon"][data-class="${className}"]:checked`
    );
    if (weaponCheckboxes.length === 0) {
      errors.push(`${classCapitalized} class requires at least 1 weapon selected.`);
    }

    // Check specializations (minimum 1)
    const specCheckboxes = document.querySelectorAll(
      `#filter-panel input[data-type="specialization"][data-class="${className}"]:checked`
    );
    if (specCheckboxes.length === 0) {
      errors.push(`${classCapitalized} class requires at least 1 specialization selected.`);
    }

    // Check gadgets (minimum 3)
    const gadgetCheckboxes = document.querySelectorAll(
      `#filter-panel input[data-type="gadget"][data-class="${className}"]:checked`
    );
    if (gadgetCheckboxes.length < 3) {
      errors.push(`${classCapitalized} class requires at least 3 gadgets selected (currently ${gadgetCheckboxes.length}).`);
    }
  }

  return {
    isValid: errors.length === 0,
    errors: errors
  };
}
