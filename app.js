// Counter loading functionality
async function loadCounter() {
  try {
    // Check if we're in local development
    const isLocal = window.location.hostname === 'localhost' || 
                   window.location.hostname === '127.0.0.1' || 
                   window.location.hostname === '';
    
    // TEMPORARILY COMMENTED OUT FOR TESTING - UNCOMMENT FOR PRODUCTION
    // if (isLocal) {
    //   // Use fallback counter for local development
    //   const fallbackCount = localStorage.getItem('localCounter') || '31846';
    //   document.querySelectorAll('.loadouts-counter').forEach(el => {
    //     el.textContent = parseInt(fallbackCount).toLocaleString();
    //   });
    //   return;
    // }
    
    // Production API call
    const response = await fetch('/api/counter');
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    
    const data = await response.json();
    document.querySelectorAll('.loadouts-counter').forEach(el => {
      el.textContent = (data.count || 0).toLocaleString();
    });
  } catch (error) {
    console.warn('Counter load failed, using fallback:', error.message);
    // Fallback to a default count
    document.querySelectorAll('.loadouts-counter').forEach(el => {
      el.textContent = '31,846';
    });
  }
}

// Call it when page loads
document.addEventListener('DOMContentLoaded', loadCounter);

// Mobile detection and performance state
const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth <= 768;

// Global state
const state = {
  selectedClass: null,
  isSpinning: false,
  currentSpin: 1,
  totalSpins: 0,
  selectedGadgets: new Set(),
  currentGadgetPool: new Set(),
  soundEnabled: localStorage.getItem('soundEnabled') !== 'false', // Default to true
  isMobile: isMobile,
  sidebarOpen: false,
};

// Make state globally accessible
window.state = state;

// Load initial counter value
async function loadInitialCounter() {
  try {
    console.log('📊 Loading initial counter value...');
    
    const response = await fetch('/api/counter');
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Initial counter loaded:', data.totalGenerated);
      
      // Update all counter displays
      updateCounterDisplay(data.totalGenerated);
      updateTotalLoadoutsDisplay(data.totalGenerated);
    } else {
      console.warn('⚠️ Failed to load initial counter, using default 1231');
      // Fallback to 1231
      updateCounterDisplay(1231);
      updateTotalLoadoutsDisplay(1231);
    }
  } catch (error) {
    console.warn('⚠️ Error loading initial counter, using default 1231:', error);
    // Fallback to 1231
    updateCounterDisplay(1231);
    updateTotalLoadoutsDisplay(1231);
  }
}

// Global variables for DOM elements
let spinButtons;
let classButtons;
let spinSelection;
let outputDiv;

// Physics constants for animations
const PHYSICS = {
  ACCELERATION: 8000,  // Increased for more dramatic start
  MAX_VELOCITY: 5000,  // Higher max speed for blur effect
  DECELERATION: -3500, // Smoother deceleration
  BOUNCE_DAMPENING: 0.4, // More pronounced bounce
  ITEM_HEIGHT: 188,
  TIMING: {
    REGULAR_SPIN: {
      COLUMN_DELAY: 250, // 0.25s between stops for regular spins
      BASE_DURATION: 800,
      DECELERATION_TIME: 400,
    },
    FINAL_SPIN: {
      COLUMN_DELAY: 200, // Base delay (not used with explicit stops)
      BASE_DURATION: 2500,
      DECELERATION_TIME: 800,
      COLUMN_STOPS: [3000, 4000, 5200, 6000, 7000] // More dramatic timing for final spin
    },
  },
};

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

  // Always use the new filter system
  let checkedWeapons = Array.from(
    document.querySelectorAll('.item-grid input[data-type="weapon"]:checked')
  ).map((checkbox) => checkbox.value);

  let checkedSpecializations = Array.from(
    document.querySelectorAll(
      '.item-grid input[data-type="specialization"]:checked'
    )
  ).map((checkbox) => checkbox.value);

  let checkedGadgets = Array.from(
    document.querySelectorAll(
      '.item-grid input[data-type="gadget"]:checked'
    )
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
      filteredLoadouts[classType].weapons = originalWeapons.filter(
        (weapon) => checkedWeapons.includes(weapon)
      );
      console.log(`${classType} weapons filtered from ${originalWeapons.length} to ${filteredLoadouts[classType].weapons.length}`);
    }

    if (checkedSpecializations.length > 0) {
      filteredLoadouts[classType].specializations = originalSpecs.filter(
        (spec) => checkedSpecializations.includes(spec)
      );
      console.log(`${classType} specializations filtered from ${originalSpecs.length} to ${filteredLoadouts[classType].specializations.length}`);
    }

    if (checkedGadgets.length > 0) {
      filteredLoadouts[classType].gadgets = originalGadgets.filter(
        (gadget) => checkedGadgets.includes(gadget)
      );
      console.log(`${classType} gadgets filtered from ${originalGadgets.length} to ${filteredLoadouts[classType].gadgets.length}`);
    }
  }

  // Safety check: make sure we have at least one item in each category for each class
  for (const classType of ["Light", "Medium", "Heavy"]) {
    // If any category is empty, revert to the original items for that category
    if (filteredLoadouts[classType].weapons.length === 0) {
      console.warn(`⚠️ No weapons selected for ${classType} class, reverting to defaults`);
      filteredLoadouts[classType].weapons = loadouts[classType].weapons;
    }

    if (filteredLoadouts[classType].specializations.length === 0) {
      console.warn(`⚠️ No specializations selected for ${classType} class, reverting to defaults`);
      filteredLoadouts[classType].specializations = loadouts[classType].specializations;
    }

    if (filteredLoadouts[classType].gadgets.length === 0) {
      console.warn(`⚠️ No gadgets selected for ${classType} class, reverting to defaults`);
      filteredLoadouts[classType].gadgets = loadouts[classType].gadgets;
    }
  }

  // Debug output
  console.log("Final filtered loadouts:", {
    Light: {
      weapons: filteredLoadouts.Light.weapons.length,
      specializations: filteredLoadouts.Light.specializations.length,
      gadgets: filteredLoadouts.Light.gadgets.length
    },
    Medium: {
      weapons: filteredLoadouts.Medium.weapons.length,
      specializations: filteredLoadouts.Medium.specializations.length,
      gadgets: filteredLoadouts.Medium.gadgets.length
    },
    Heavy: {
      weapons: filteredLoadouts.Heavy.weapons.length,
      specializations: filteredLoadouts.Heavy.specializations.length,
      gadgets: filteredLoadouts.Heavy.gadgets.length
    }
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
  console.log(`Available gadgets (${loadout.gadgets.length}):`, loadout.gadgets);
  
  // First, ensure the input array itself has no duplicates
  const cleanedGadgets = [...new Set(loadout.gadgets)];
  console.log(`🧹 Cleaned gadgets (${cleanedGadgets.length}):`, cleanedGadgets);
  
  if (cleanedGadgets.length < 3) {
    console.error(`❌ Not enough unique gadgets for ${classType}! Only ${cleanedGadgets.length} available.`);
    // Fallback: return what we have
    return cleanedGadgets;
  }
  
  // Create multiple attempts to ensure we never get duplicates
  let attempts = 0;
  let selectedGadgets = [];
  
  while (attempts < 10) { // Maximum 10 attempts
    attempts++;
    
    // Fisher-Yates shuffle for true randomness
    const shuffledGadgets = [...cleanedGadgets];
    for (let i = shuffledGadgets.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffledGadgets[i], shuffledGadgets[j]] = [shuffledGadgets[j], shuffledGadgets[i]];
    }
    
    // Take the first 3 items from the shuffled array
    selectedGadgets = shuffledGadgets.slice(0, 3);
    
    // Verify uniqueness (this should ALWAYS pass, but let's be 100% sure)
    const uniqueSet = new Set(selectedGadgets);
    if (uniqueSet.size === 3) {
      console.log(`✅ SUCCESS on attempt ${attempts}! Selected gadgets:`, selectedGadgets);
      break;
    } else {
      console.error(`🚨 ATTEMPT ${attempts} FAILED! Duplicates found:`, selectedGadgets);
    }
  }
  
  // Final safety check
  const finalUniqueSet = new Set(selectedGadgets);
  if (finalUniqueSet.size !== 3) {
    console.error("🚨 CRITICAL FAILURE: Could not select 3 unique gadgets after 10 attempts!");
    console.error("Selected:", selectedGadgets);
    console.error("Available:", cleanedGadgets);
    // Emergency fallback: manually pick first 3
    selectedGadgets = cleanedGadgets.slice(0, 3);
  }
  
  // Store for reference and debugging
  state.currentGadgetPool = new Set(selectedGadgets);
  window.lastSelectedGadgets = [...selectedGadgets];
  
  console.log(`🎯 FINAL RESULT: ${classType} gadgets:`, selectedGadgets);
  console.log(`🔐 Stored in window.lastSelectedGadgets:`, window.lastSelectedGadgets);
  
  return selectedGadgets;
};

function createItemContainer(items, winningItem = null, isGadget = false) {
  if (isGadget) {
    // For gadgets, the first item in the array should be the winner (displayed in center)
    // The animation will be set up to land on the first item (index 0)
    console.log(`🎰 Creating gadget container with winner: "${items[0]}" and full sequence:`, items);
    return items
      .map(
        (item, index) => `
        <div class="itemCol ${index === 0 ? "winner" : ""}" data-item-name="${item}">
          <img src="images/${item.replace(/ /g, "_")}.webp" alt="${item}">
          <p>${item}</p>
        </div>
      `
      )
      .join("");
  }

  winningItem = winningItem || items[Math.floor(Math.random() * items.length)];
  let repeatedItems = items
    .filter((item) => item !== winningItem)
    .sort(() => Math.random() - 0.5)
    .slice(0, 7);

  repeatedItems = [
    ...repeatedItems.slice(0, 4),
    winningItem,
    ...repeatedItems.slice(4),
  ];

  while (repeatedItems.length < 8) {
    const randomItem = items[Math.floor(Math.random() * items.length)];
    repeatedItems.push(randomItem);
  }

  return repeatedItems
    .map(
      (item, index) => `
      <div class="itemCol ${index === 4 ? "winner" : ""}">
        <img src="images/${item.replace(/ /g, "_")}.webp" alt="${item}">
        <p>${item}</p>
      </div>
    `
    )
    .join("");
}

// SlotColumn class for animation
class SlotColumn {
  constructor(element, index, isFinalSpin) {
    this.element = element;
    this.index = index;
    this.velocity = 0;
    this.position = 0;
    this.state = "waiting";
    this.lastTimestamp = null;
    this.isFinalSpin = isFinalSpin;
    this.animationStartTime = null;
    this.maxAnimationDuration = 10000; // 10 second safety timeout
    this.overshootAmount = 0;
    this.snapbackComplete = false;

    const timing = isFinalSpin
      ? PHYSICS.TIMING.FINAL_SPIN
      : PHYSICS.TIMING.REGULAR_SPIN;
    
    // Use explicit stop times for final spin columns
    if (isFinalSpin && timing.COLUMN_STOPS && timing.COLUMN_STOPS[index]) {
      this.totalDuration = timing.COLUMN_STOPS[index];
    } else {
      this.stopDelay = timing.COLUMN_DELAY * index;
      this.totalDuration = timing.BASE_DURATION + this.stopDelay;
    }
    
    this.decelerationTime = timing.DECELERATION_TIME;
    this.targetPosition = 0;
    this.initialPosition = 0;
    
    // Add reference to container for visual effects
    this.container = element.closest('.item-container');
  }

  update(elapsed, deltaTime) {
    // Safety check for runaway animations
    if (!this.animationStartTime) {
      this.animationStartTime = performance.now();
    } else if (
      performance.now() - this.animationStartTime >
      this.maxAnimationDuration
    ) {
      console.warn("Animation timeout - forcing stop");
      this.forceStop();
      return;
    }

    if (this.state === "stopped") return;

    // Ensure deltaTime is reasonable
    const dt = Math.min(deltaTime, 50) / 1000; // Cap at 50ms, convert to seconds

    // Vegas-style physics with distinct phases
    const accelerationPhase = 500; // 0-500ms
    const maxSpeedPhase = this.totalDuration - this.decelerationTime - 200; // Account for overshoot
    
    switch (this.state) {
      case "accelerating":
        // Exponential acceleration for dramatic start
        const accelProgress = Math.min(elapsed / accelerationPhase, 1);
        const accelMultiplier = 1 + Math.pow(accelProgress, 2) * 2; // Up to 3x acceleration
        
        this.velocity += PHYSICS.ACCELERATION * dt * accelMultiplier;
        
        if (elapsed >= accelerationPhase || this.velocity >= PHYSICS.MAX_VELOCITY) {
          this.velocity = PHYSICS.MAX_VELOCITY;
          this.state = "spinning";
        }
        break;

      case "spinning":
        // Maintain max velocity with slight variations for realism
        this.velocity = PHYSICS.MAX_VELOCITY + Math.sin(elapsed / 100) * 200;
        
        if (elapsed >= maxSpeedPhase) {
          this.state = "decelerating";
          // Calculate target position with overshoot
          const baseTarget = Math.ceil(this.position / PHYSICS.ITEM_HEIGHT) * PHYSICS.ITEM_HEIGHT;
          this.overshootAmount = PHYSICS.ITEM_HEIGHT * 0.3; // 30% overshoot
          this.targetPosition = baseTarget;
            
          // For gadget columns, use normal positioning
          if (this.index >= 2) {
            this.targetPosition = 0;
            this.overshootAmount = PHYSICS.ITEM_HEIGHT * 0.2;
          }
        }
        break;

      case "decelerating":
        // Smooth exponential deceleration
        const decelProgress = (elapsed - maxSpeedPhase) / this.decelerationTime;
        const decelMultiplier = Math.pow(1 - Math.min(decelProgress, 1), 2);
        
        this.velocity = PHYSICS.MAX_VELOCITY * decelMultiplier;
        
        // Check if we've reached the overshoot point
        if (!this.snapbackComplete && this.position >= this.targetPosition + this.overshootAmount) {
          this.state = "snapback";
          this.velocity = -Math.abs(this.velocity) * 0.5; // Reverse at 50% speed
        } else if (this.velocity < 100) {
          this.forceStop();
        }
        break;

      case "snapback":
        // Snap back to final position
        this.velocity += PHYSICS.ACCELERATION * dt * 0.8; // Gentler snapback
        
        if (this.position <= this.targetPosition || Math.abs(this.velocity) < 50) {
          this.position = this.targetPosition;
          this.forceStop();
        }
        break;

      case "bouncing":
        // Legacy bounce state (kept for compatibility)
        this.velocity += PHYSICS.DECELERATION * 1.2 * dt;
        if (Math.abs(this.velocity) < 50) {
          this.forceStop();
        }
        break;
    }

    // Update position
    this.position += this.velocity * dt;
    
    // Don't normalize position for gadget columns when targeting position 0
    if (this.index >= 2 && this.targetPosition === 0 && this.state === "stopped") {
      // Keep exact position for gadgets
    } else if (this.state !== "snapback") {
      this.position = this.normalizePosition(this.position);
    }
    
    this.updateVisuals();
  }

  normalizePosition(pos) {
    const wrappedPosition = pos % PHYSICS.ITEM_HEIGHT;
    return wrappedPosition >= 0
      ? wrappedPosition
      : wrappedPosition + PHYSICS.ITEM_HEIGHT;
  }

  forceStop() {
    this.velocity = 0;
    this.position = this.targetPosition;
    this.state = "stopped";
    
    // Remove blur classes
    if (this.container) {
      this.container.classList.remove('high-speed-blur', 'extreme-blur');
      
      // Add lock-in animation
      this.container.classList.add('locked', 'locking');
      
      // Flash effect
      setTimeout(() => {
        this.container.classList.remove('locking');
      }, 300);
      
      // Play column stop sound
      if (window.state && window.state.soundEnabled) {
        const columnStopSound = document.getElementById('columnStop');
        if (columnStopSound) {
          columnStopSound.currentTime = 0;
          columnStopSound.volume = 0.5;
          columnStopSound.play().catch(() => {});
        }
      }
      
      // Add screen shake for dramatic effect (only on final spin)
      if (this.isFinalSpin && this.index === 0) {
        document.querySelector('.slot-machine-wrapper')?.classList.add('screen-shake');
        setTimeout(() => {
          document.querySelector('.slot-machine-wrapper')?.classList.remove('screen-shake');
        }, 200);
      }
    }
    
    this.updateVisuals();
    
    // Reset box shadow
    if (this.container) {
      this.container.style.boxShadow = '';
    }
  }

  updateVisuals() {
    // Vegas-style blur effects based on velocity
    let blur = 0;
    let containerClass = '';
    
    if (Math.abs(this.velocity) > 3500) {
      blur = 8;
      containerClass = 'extreme-blur';
    } else if (Math.abs(this.velocity) > 2000) {
      blur = 3;
      containerClass = 'high-speed-blur';
    } else if (Math.abs(this.velocity) > 1000) {
      blur = 1;
    }
    
    // Add/remove blur classes on container
    if (this.container) {
      this.container.classList.remove('high-speed-blur', 'extreme-blur');
      if (containerClass) {
        this.container.classList.add(containerClass);
      }
    }
    
    // Shake effect during snapback
    let shakeX = 0;
    if (this.state === "snapback") {
      shakeX = Math.sin(performance.now() / 50) * 3;
    }
    
    // Apply transform and filter
    this.element.style.transform = `translate(${shakeX}px, ${this.position}px)`;
    this.element.style.filter = blur > 0 ? `blur(${blur}px)` : "none";
    
    // Add slot glow effect at high speeds
    if (this.container && Math.abs(this.velocity) > 2000) {
      this.container.style.boxShadow = `
        inset 0 10px 30px rgba(0,0,0,0.8),
        0 0 ${20 + Math.abs(this.velocity) / 100}px rgba(255, 215, 0, ${0.2 + Math.abs(this.velocity) / 10000})
      `;
    }
  }
}

// Flag to prevent duplicate history entries
let isAddingToHistory = false;
let lastAddedLoadout = null;

// Main functions for displaying loadouts
const displayLoadout = (classType) => {
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
    console.error(`⚠️ Not enough gadgets for ${classType}! Only ${loadout.gadgets.length} available.`);
  }
  
  // Use the getUniqueGadgets function to ensure uniqueness
  const selectedGadgetsRaw = getUniqueGadgets(classType, loadout);
  
  // Make a defensive copy and ensure it's truly immutable
  const selectedGadgets = Object.freeze([...selectedGadgetsRaw]);
  
  console.log(`🎯 Final gadgets for display: ${selectedGadgets.join(', ')}`);
  console.log(`🎯 Gadget 1: "${selectedGadgets[0]}"`);
  console.log(`🎯 Gadget 2: "${selectedGadgets[1]}"`);
  console.log(`🎯 Gadget 3: "${selectedGadgets[2]}"`);
  
  // Store the selected gadgets globally for history recording
  window.currentDisplayedGadgets = [...selectedGadgets];
  console.log(`💾 Stored globally: window.currentDisplayedGadgets =`, window.currentDisplayedGadgets);
  
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
    console.log(`🎬 Creating animation for gadget ${gadgetIndex + 1}: "${winningGadget}"`);
    console.log(`🎬 All selected gadgets:`, selectedGadgets);
    
    // Create a pool of gadgets for this specific animation slot that excludes the selected gadgets
    const otherSelectedGadgets = selectedGadgets.filter(g => g !== winningGadget);
    const availableForAnimation = loadout.gadgets.filter(g => !otherSelectedGadgets.includes(g));
    
    console.log(`🎬 Other selected gadgets to exclude:`, otherSelectedGadgets);
    console.log(`🎬 Animation pool for ${winningGadget} has ${availableForAnimation.length} gadgets:`, availableForAnimation);
    
    // Shuffle the available gadgets to ensure variety
    const shuffledAnimation = [...availableForAnimation].sort(() => Math.random() - 0.5);
    
    // Create sequence with winning gadget at index 7 (last position)
    // Since position 0 shows index 7, we need to put the winner at the end
    const sequence = new Array(8); // Create array with 8 slots
    sequence[7] = winningGadget; // Winner goes at index 7
    
    // Fill remaining 7 positions with unique gadgets (no duplicates)
    const usedGadgets = new Set([winningGadget]);
    let availableIndex = 0;
    
    for (let i = 0; i < 7; i++) { // Fill indices 0-6
      if (shuffledAnimation.length > 0) {
        // Find next unused gadget
        let attempts = 0;
        while (attempts < shuffledAnimation.length * 2) {
          const candidateGadget = shuffledAnimation[availableIndex % shuffledAnimation.length];
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
    
    console.log(`🎬 Final animation sequence for gadget ${gadgetIndex + 1}:`, sequence);
    console.log(`🎬 Winner at index 7: "${sequence[7]}" (should match "${winningGadget}")`);
    console.log(`🎬 Full sequence:`, sequence);
    
    // Check for duplicates in sequence
    const uniqueInSequence = new Set(sequence);
    if (uniqueInSequence.size !== sequence.length) {
      console.warn(`⚠️ DUPLICATES in animation sequence for gadget ${gadgetIndex + 1}!`);
      console.warn('Sequence:', sequence);
      console.warn('Unique items:', Array.from(uniqueInSequence));
    } else {
      console.log(`✅ No duplicates in animation sequence for gadget ${gadgetIndex + 1}`);
    }
    
    return sequence;
  };

  const loadoutHTML = `
    <div class="class-info-display" style="text-align: center; margin-bottom: 20px; font-size: 24px; font-weight: bold; color: #fff;">
      ${classType} Class${state.currentSpin > 1 ? ` - ${state.currentSpin} spins remaining` : ''}
    </div>
    <div class="slot-machine-wrapper">
      <div class="items-container">
        <div class="item-container">
          <div class="scroll-container">
            ${createItemContainer(loadout.weapons, selectedWeapon)}
          </div>
        </div>
        <div class="item-container">
          <div class="scroll-container">
            ${createItemContainer(loadout.specializations, selectedSpec)}
          </div>
        </div>
        ${selectedGadgets
          .map(
            (gadget, index) => {
              // Escape the gadget name for HTML attributes
              const escapedGadget = gadget.replace(/"/g, '&quot;').replace(/'/g, '&#39;');
              console.log(`🏷️ Creating HTML for Gadget ${index + 1}: Original="${gadget}", Escaped="${escapedGadget}"`);
              
              // Debug: Store the original gadget name in a separate attribute for debugging
              const htmlResult = `
            <div class="item-container" data-winning-gadget="${escapedGadget}" data-original-gadget="${gadget}" data-gadget-position="${index}">
              <div class="scroll-container" data-gadget-index="${index}" data-winning-gadget="${escapedGadget}">
                ${createItemContainer(
                  createGadgetSpinSequence(gadget, index),
                  gadget,
                  true
                )}
              </div>
            </div>
          `;
              
              console.log(`🏗️ Generated HTML for gadget ${index + 1}:`, htmlResult.substring(0, 200) + '...');
              return htmlResult;
            }
          )
          .join("")}
      </div>
    </div>
  `;

  outputDiv.innerHTML = loadoutHTML;

  setTimeout(() => {
    const scrollContainers = Array.from(
      document.querySelectorAll(".scroll-container")
    );
    startSpinAnimation(scrollContainers);
  }, 50);
};

const displayRandomLoadout = () => {
  const classes = ["Light", "Medium", "Heavy"];
  const randomClass = classes[Math.floor(Math.random() * classes.length)];
  displayLoadout(randomClass);
};

// Animation function
function startSpinAnimation(columns) {
  // Final spin is when we're on the last spin (currentSpin === 1)
  const isFinalSpin = state.currentSpin === 1;
  console.log(
    `🎲 Animation starting with currentSpin = ${state.currentSpin}, isFinalSpin = ${isFinalSpin}`
  );
  
  // Play spin start sound
  if (state.soundEnabled) {
    const spinStartSound = document.getElementById('spinStart');
    if (spinStartSound) {
      spinStartSound.currentTime = 0;
      spinStartSound.volume = 0.6;
      spinStartSound.play().catch(() => {});
    }
  }
  
  // Play spinning sound
  if (state.soundEnabled) {
    const spinningSound = document.getElementById('spinningSound');
    if (spinningSound) {
      spinningSound.currentTime = 0;
      spinningSound.volume = 0.25; // Reduced by 50%
      spinningSound.play().catch(() => {});
    }
  }

  const startTime = performance.now();

  const slotColumns = columns.map(
    (element, index) => new SlotColumn(element, index, isFinalSpin)
  );

  // Reset containers
  columns.forEach((column) => {
    const container = column.closest(".item-container");
    if (container) {
      container.classList.remove("landing-flash", "winner-pulsate");
      const lockedTag = container.querySelector(".locked-tag");
      if (lockedTag) lockedTag.remove();
    }
    column.style.transform = "translateY(0)";
    column.style.transition = "none";
  });

  // Initialize animation states clearly
  slotColumns.forEach((column) => {
    column.state = "accelerating";
    column.velocity = 0;
    column.position = 0;
    column.lastTimestamp = null;
  });

  function animate(currentTime) {
    const elapsed = currentTime - startTime;
    let isAnimating = false;

    slotColumns.forEach((column) => {
      if (column.state !== "stopped") {
        isAnimating = true;
        const deltaTime = column.lastTimestamp
          ? currentTime - column.lastTimestamp
          : 16.67;
        column.update(elapsed, deltaTime);
        column.lastTimestamp = currentTime;
      }
    });

    if (isAnimating) {
      requestAnimationFrame(animate);
    } else {
      console.log("✅ All columns stopped, calling finalizeSpin");
      
      // Stop spinning sound with mobile fix
      const spinningSound = document.getElementById('spinningSound');
      if (spinningSound) {
        spinningSound.pause();
        spinningSound.currentTime = 0;
        // Additional stop mechanism for mobile browsers
        try {
          spinningSound.src = spinningSound.src; // Force reload on mobile
        } catch (e) {
          console.log("Mobile audio reload failed:", e);
        }
      }


      // Add visual effects only for final spin
      if (isFinalSpin) {
        let lastColumnIndex = columns.length - 1;

        columns.forEach((column, index) => {
          const container = column.closest(".item-container");
          if (container) {
            setTimeout(() => {
              container.classList.add("landing-flash");

              let lockedTag = container.querySelector(".locked-tag");
              if (!lockedTag) {
                lockedTag = document.createElement("div");
                lockedTag.className = "locked-tag show";
                lockedTag.textContent = "Locked In!";
                container.appendChild(lockedTag);
              }

              // Play final sound on FIRST locked tag
              if (index === 0 && state.soundEnabled) {
                const finalSound = document.getElementById('finalSound');
                if (finalSound) {
                  finalSound.currentTime = 0;
                  finalSound.volume = 0.7;
                  finalSound.play().catch((err) => {
                    console.log("Could not play final sound:", err);
                  });
                }
              }

              // If this is the last column, add celebration effects
              if (index === lastColumnIndex) {
                console.log("🔒 Last locked tag added, disabling spin buttons");
                const spinBtns = document.querySelectorAll(".spin-button");
                spinBtns.forEach((button) => {
                  button.disabled = true;
                  button.setAttribute("disabled", "disabled");
                  button.classList.add("dimmed");
                });
                console.log(`Disabled ${spinBtns.length} spin buttons`);
                
                // Add celebration effects
                setTimeout(() => {
                  addCelebrationEffects();
                }, 500);
              }

              setTimeout(() => container.classList.add("winner-pulsate"), 300);
            }, index * 200);
          }
        });
      }

      // Let finalizeSpin handle whether to continue or end the sequence
      setTimeout(
        () => {
          finalizeSpin(columns);
        },
        isFinalSpin ? 1000 : 300
      ); // Longer delay for final spin
    }
  }

  requestAnimationFrame(animate);
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
    filterOverlay.classList.add('active');
    
    // Slide in panel
    filterPanel.classList.add('active');
    
    // Lock body scroll
    document.body.style.overflow = 'hidden';
    
    // Focus management
    filterPanel.setAttribute('aria-hidden', 'false');
    closePanelBtn.focus();
  }

  // Function to close panel
  function closePanel() {
    if (!isPanelOpen) return;
    
    isPanelOpen = false;
    console.log("🖱️ Closing filter panel");
    
    // Hide overlay
    filterOverlay.classList.remove('active');
    
    // Slide out panel
    filterPanel.classList.remove('active');
    
    // Restore body scroll
    document.body.style.overflow = '';
    
    // Focus management
    filterPanel.setAttribute('aria-hidden', 'true');
    filterToggleBtn.focus();
  }

  // Event listeners
  filterToggleBtn.addEventListener("click", openPanel);
  closePanelBtn.addEventListener("click", closePanel);
  filterOverlay.addEventListener("click", closePanel);
  
  // Apply button closes panel
  applyFiltersBtn.addEventListener("click", () => {
    console.log("🔄 Applying filters and closing panel");
    closePanel();
  });

  // Escape key closes panel
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && isPanelOpen) {
      closePanel();
    }
  });

  // Initialize panel as closed
  filterPanel.setAttribute('aria-hidden', 'true');

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
      });
    });
  } else {
    console.error("❌ Could not find tab buttons or tab contents");
  }

  // Class filter buttons
  const classFilters = document.querySelectorAll(".class-filter");
  const itemCategories = document.querySelectorAll(".item-category");

  if (classFilters.length > 0 && itemCategories.length > 0) {
    console.log(
      `✅ Found ${classFilters.length} class filters and ${itemCategories.length} item categories`
    );

    classFilters.forEach((filter) => {
      filter.addEventListener("click", () => {
        const selectedClass = filter.getAttribute("data-class");
        console.log(`🖱️ Class filter clicked: ${selectedClass}`);

        // Update active filter button
        classFilters.forEach((btn) => btn.classList.remove("active"));
        filter.classList.add("active");

        // Show/hide categories based on selection
        itemCategories.forEach((category) => {
          if (
            selectedClass === "all" ||
            category.classList.contains(`${selectedClass}-category`)
          ) {
            category.style.display = "block";
          } else {
            category.style.display = "none";
          }
        });
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

  // Apply button functionality
  const applyBtn = document.getElementById("apply-filters");
  if (applyBtn) {
    console.log("✅ Found apply button");

    applyBtn.addEventListener("click", () => {
      console.log("✅ Filters applied!");

      // If a spin is currently in progress, don't do anything
      if (state.isSpinning) {
        console.log("⚠️ Cannot apply filters during spin");
        return;
      }
      
      // Force a test calculation of filtered loadouts to make sure filters work
      const testFiltered = getFilteredLoadouts();
      console.log("Filter test result:", testFiltered);

      // No longer using gadget queues - each spin gets fresh random selection
      
      // Close the filter panel
      if (filterPanel) {
        filterPanel.style.display = "none";
        if (toggleIcon) {
          toggleIcon.textContent = "+";
          toggleIcon.classList.remove("open");
        }
      }
      
      // Show confirmation message
      const filterStatus = document.createElement("div");
      filterStatus.className = "filter-status";
      filterStatus.textContent = "Filters applied!";
      document.body.appendChild(filterStatus);
      
      // Remove after 2 seconds
      setTimeout(() => {
        if (filterStatus && filterStatus.parentNode) {
          filterStatus.parentNode.removeChild(filterStatus);
        }
      }, 2000);
    });
  } else {
    console.error("❌ Could not find apply button");
  }
  
  // Reset button functionality
  const resetBtn = document.getElementById("reset-filters");
  if (resetBtn) {
    console.log("✅ Found reset button");
    
    resetBtn.addEventListener("click", () => {
      console.log("🔄 Resetting all filters...");
      
      // Select all checkboxes in the filter panel
      const allCheckboxes = document.querySelectorAll('#filter-panel input[type="checkbox"]');
      
      // Check all checkboxes
      allCheckboxes.forEach(checkbox => {
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
      }, 2000);
      
      console.log("✅ All filters have been reset");
    });
  } else {
    console.error("❌ Could not find reset button");
  }

  console.log("✅ Filter system setup complete");
}

// Function to populate filter items from loadouts
function populateFilterItems() {
  console.log("🔄 Populating filter items...");

  // Get weapon grid containers
  const lightWeaponsGrid = document.getElementById("light-weapons-grid");
  const mediumWeaponsGrid = document.getElementById("medium-weapons-grid");
  const heavyWeaponsGrid = document.getElementById("heavy-weapons-grid");
  
  // Get specialization grid containers
  const lightSpecsGrid = document.getElementById("light-specializations-grid");
  const mediumSpecsGrid = document.getElementById("medium-specializations-grid");
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

  // Populate weapons
  populateItemGrid(lightWeaponsGrid, loadouts.Light.weapons, "weapon", "light", "Light Weapons");
  populateItemGrid(mediumWeaponsGrid, loadouts.Medium.weapons, "weapon", "medium", "Medium Weapons");
  populateItemGrid(heavyWeaponsGrid, loadouts.Heavy.weapons, "weapon", "heavy", "Heavy Weapons");
  
  // Populate specializations
  populateItemGrid(lightSpecsGrid, loadouts.Light.specializations, "specialization", "light", "Light Specializations");
  populateItemGrid(mediumSpecsGrid, loadouts.Medium.specializations, "specialization", "medium", "Medium Specializations");
  populateItemGrid(heavySpecsGrid, loadouts.Heavy.specializations, "specialization", "heavy", "Heavy Specializations");
  
  // Populate gadgets
  populateItemGrid(lightGadgetsGrid, loadouts.Light.gadgets, "gadget", "light", "Light Gadgets");
  populateItemGrid(mediumGadgetsGrid, loadouts.Medium.gadgets, "gadget", "medium", "Medium Gadgets");
  populateItemGrid(heavyGadgetsGrid, loadouts.Heavy.gadgets, "gadget", "heavy", "Heavy Gadgets");
  
  console.log("✅ Filter items population complete");

  // Setup Select All functionality once items are populated
  if (typeof setupSelectAllCheckboxes === 'function') {
    setupSelectAllCheckboxes();
  }
  
  // Setup tab content search placeholder update
  setupTabSearchPlaceholder();
}

// Helper function to populate item grids
function populateItemGrid(gridElement, items, type, classType, labelText) {
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
    <span><strong>Select All ${labelText}</strong></span>
  `;
  gridElement.appendChild(selectAllItem);
  
  // Then add individual items
  items.forEach((item) => {
    const itemElement = document.createElement("label");
    itemElement.className = "item-checkbox";
    itemElement.innerHTML = `
      <input type="checkbox" value="${item}" checked data-type="${type}" data-class="${classType}">
      <span>${item}</span>
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
  tabButtons.forEach(button => {
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
      const transitionSound = document.getElementById('transitionSound');
      if (transitionSound) {
        transitionSound.currentTime = 0;
        transitionSound.volume = 0.6;
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
    }, 500);

    return; // Exit early - we're handling next spin
  }

  console.log("🎯 Final spin, recording loadout");
  
  // Add celebration effects
  addCelebrationEffects();
  
  // Also ensure spinning sound is fully stopped (mobile fix)
  const spinningSound = document.getElementById('spinningSound');
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
    if (btn.id === 'main-spin-button') {
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

  // Get the final selections from the DOM
  const itemContainers = document.querySelectorAll(
    ".slot-machine-wrapper .items-container .item-container"
  );

  if (itemContainers && itemContainers.length > 0) {
    isAddingToHistory = true; // Set the flag to prevent duplicate calls
    console.log("🔒 Setting isAddingToHistory flag to prevent duplicates");

    // ✅ Save the selected class BEFORE doing anything else
    let savedClass = state.selectedClass;
    console.log("💾 Selected Class Before Processing:", savedClass);

    // If we're using the random class mode, get the actual selected class
    if (savedClass && savedClass.toLowerCase() === "random") {
      const activeClassButton = document.querySelector(
        ".class-button.selected:not([data-class='Random'])"
      );
      savedClass = activeClassButton
        ? activeClassButton.dataset.class
        : savedClass;
    }

    // BEFORE processing anything, let's debug the containers
    console.log(`🔍 DEBUGGING: Found ${itemContainers.length} item containers`);
    itemContainers.forEach((container, index) => {
      console.log(`Container ${index}:`, {
        'data-winning-gadget': container.dataset.winningGadget,
        'data-original-gadget': container.dataset.originalGadget,
        'data-gadget-position': container.dataset.gadgetPosition,
        classList: Array.from(container.classList)
      });
    });

    // Get all the selected items - use data attributes for gadgets to ensure accuracy
    const selectedItems = Array.from(itemContainers).map((container, index) => {
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
          position: container.dataset.gadgetPosition
        });
        
        // Method 2: Try data attribute on scroll container
        const scrollContainer = container.querySelector('.scroll-container');
        const scrollWinningGadget = scrollContainer?.dataset.winningGadget;
        
        // Method 3: Use global storage as ultimate fallback
        const globalGadget = window.currentDisplayedGadgets && window.currentDisplayedGadgets[gadgetIndex];
        
        // Debug what's actually visible in this container
        const allItems = scrollContainer?.querySelectorAll(".itemCol");
        if (allItems && allItems.length > 0) {
          console.log(`🔍 Visual debug for gadget ${gadgetIndex + 1} - found ${allItems.length} items:`);
          const containerRect = container.getBoundingClientRect();
          const visibleTexts = Array.from(allItems).map((item, i) => {
            const text = item.querySelector("p")?.textContent;
            const isVisible = item.getBoundingClientRect().height > 0;
            const rect = item.getBoundingClientRect();
            const isInViewport = rect.top >= containerRect.top && rect.bottom <= containerRect.bottom;
            return `[${i}] ${text} (visible: ${isVisible}, inViewport: ${isInViewport}, transform: ${getComputedStyle(item.parentElement).transform})`;
          });
          console.log(`🔍 All items in container:`, visibleTexts);
          console.log(`🔍 First item should be: "${winningGadget}"`);
          console.log(`🔍 Container transform: ${getComputedStyle(scrollContainer).transform}`);
          
          // Check what's actually in the center of the container
          const containerCenter = containerRect.top + containerRect.height / 2;
          const actualVisibleItem = Array.from(allItems).find(item => {
            const itemRect = item.getBoundingClientRect();
            return itemRect.top <= containerCenter && itemRect.bottom >= containerCenter;
          });
          
          if (actualVisibleItem) {
            const actualText = actualVisibleItem.querySelector("p")?.textContent;
            console.log(`🎯 ACTUAL VISIBLE ITEM IN CENTER: "${actualText}"`);
            if (actualText !== winningGadget) {
              console.error(`🚨 MISMATCH! Expected: "${winningGadget}", Actually visible: "${actualText}"`);
            }
          }
        }
        
        console.log(`📋 All gadget retrieval methods for gadget ${gadgetIndex + 1}:`, {
          containerData: winningGadget,
          originalData: originalGadget,
          scrollData: scrollWinningGadget,
          globalFallback: globalGadget
        });
        
        // Use the first available method
        if (winningGadget) {
          console.log(`✅ Using container data: "${winningGadget}"`);
          return winningGadget;
        } else if (originalGadget) {
          console.log(`⚠️ Using original-gadget fallback: "${originalGadget}"`);
          return originalGadget;
        } else if (scrollWinningGadget) {
          console.log(`⚠️ Using scroll container data: "${scrollWinningGadget}"`);
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
      console.log(`📋 ${index === 0 ? 'Weapon' : 'Specialization'} from visible item: "${itemText}"`);
      return itemText || "Unknown";
    });

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
      // console.log('🚀🚀🚀 ABOUT TO CALL incrementLoadoutCounter 🚀🚀🚀');
      // alert('About to increment counter!');
      // await incrementLoadoutCounter();
      // console.log('✅✅✅ incrementLoadoutCounter COMPLETED ✅✅✅');
      
      // Also fetch and update counter display as backup
      // console.log('🚀🚀🚀 ABOUT TO CALL fetchAndUpdateCounter 🚀🚀🚀');
      // fetchAndUpdateCounter();

      // Display roast immediately below the slot machine and get the generated roast
      displayRoastBelowSlotMachine(savedClass, weapon, specialization, gadgets).then(generatedRoast => {
        // Add to history after a delay (helps prevent race conditions) with the same roast
        setTimeout(() => {
          // Use savedClass instead of state.selectedClass and pass the generated roast
          addToHistory(savedClass, weapon, specialization, gadgets, generatedRoast);

          console.log("✅ Successfully added to history:", loadoutString);
          isAddingToHistory = false; // Reset the flag
        }, 500);
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
      button.style.animation = "moveLeft 0.5s ease-in-out forwards";
    } else {
      button.style.animation = "none";
    }
  });
  */
}

// Main spin function
const spinLoadout = () => {
  if (state.isSpinning || !state.selectedClass) {
    console.log("⚠️ Cannot start spin - already spinning or no class selected");
    return;
  }

  console.log(`🌀 Starting spin sequence: ${state.totalSpins} total spins`);

  state.isSpinning = true;
  state.currentSpin = state.totalSpins;
  

  // Disable ONLY class buttons during the spin, leave spin buttons enabled
  document.querySelectorAll(".class-button").forEach((btn) => {
    btn.setAttribute("disabled", "true");
  });

  document.getElementById("output").scrollIntoView({
    behavior: "smooth",
    block: "center",
  });

  // Update visuals for spin
  updateSpinCountdown(state.currentSpin);

  console.log(`🎲 Starting first spin with currentSpin = ${state.currentSpin}`);

  // Start the first spin
  if (state.selectedClass === "random") {
    displayRandomLoadout();
  } else {
    displayLoadout(state.selectedClass);
  }
};

// Make spinLoadout globally accessible
window.spinLoadout = spinLoadout;

// Celebration effects function
function addCelebrationEffects() {
  const slotMachineWrapper = document.querySelector('.slot-machine-wrapper');
  if (!slotMachineWrapper) return;
  
  // Add a "LOADOUT LOCKED!" banner
  const banner = document.createElement('div');
  banner.className = 'celebration-banner';
  banner.innerHTML = `
    <div class="banner-text">LOADOUT LOCKED!</div>
    <div class="banner-subtext">Ready to dominate The Finals</div>
  `;
  slotMachineWrapper.appendChild(banner);
  
  // Flash the entire loadout container
  slotMachineWrapper.classList.add('celebration-flash');
  
  // Celebration words array
  const celebrationWords = [
    'LETSGO!',
    'WOW!',
    'OZPUZE!',
    'SCOTTY!',
    'JUNE!',
    'OH MY!',
    'HOLTOW',
    'DISSUN',
    'ISSULT',
    'VAIIYA',
    'CNS',
    'ENSIMO'
  ];
  
  // Add floating celebration words
  const positions = [
    { x: '20%', y: '30%' },
    { x: '80%', y: '40%' },
    { x: '50%', y: '20%' },
    { x: '30%', y: '60%' },
    { x: '70%', y: '50%' }
  ];
  
  positions.forEach((pos, index) => {
    setTimeout(() => {
      const floatingText = document.createElement('div');
      floatingText.className = 'floating-celebration-text';
      // Pick a random word from the celebration words
      floatingText.textContent = celebrationWords[Math.floor(Math.random() * celebrationWords.length)];
      floatingText.style.left = pos.x;
      floatingText.style.top = pos.y;
      slotMachineWrapper.appendChild(floatingText);
      
      // Remove after animation
      setTimeout(() => floatingText.remove(), 2000);
    }, index * 100);
  });
  
  // Remove banner after 3 seconds
  setTimeout(() => {
    banner.classList.add('fade-out');
    setTimeout(() => banner.remove(), 500);
    slotMachineWrapper.classList.remove('celebration-flash');
  }, 3000);
}

// Global function to stop all audio (useful for mobile)
window.stopAllAudio = function() {
  const allAudio = document.querySelectorAll('audio');
  allAudio.forEach(audio => {
    audio.pause();
    audio.currentTime = 0;
    // Special handling for looped audio
    if (audio.loop) {
      audio.loop = false;
      const src = audio.src;
      audio.removeAttribute('src');
      audio.load();
      setTimeout(() => {
        audio.src = src;
        audio.loop = true;
      }, 100);
    }
  });
  console.log('All audio stopped');
};

// Loadout history functions
async function addToHistory(
  classType,
  selectedWeapon,
  selectedSpec,
  selectedGadgets,
  providedRoast = null
) {
  const historyList = document.getElementById("history-list");
  const newEntry = document.createElement("div");
  newEntry.classList.add("history-entry");
  
  // Generate a fun name based on the loadout
  const loadoutName = generateLoadoutName(classType, selectedWeapon, selectedSpec);
  
  // Add spicy class if it's a weird combo
  if (isSpicyLoadout(selectedWeapon, selectedSpec, selectedGadgets)) {
    newEntry.classList.add("spicy-loadout");
  }
  
  // Generate optional badge
  const optionalBadge = generateOptionalBadge(selectedWeapon, selectedSpec, selectedGadgets, classType);
  const badgeHTML = optionalBadge ? 
    `<div class="loadout-badge ${optionalBadge.type}" title="${optionalBadge.tooltip}">${optionalBadge.text}</div>` : '';
  
  // Create initial entry with loading roast state
  newEntry.innerHTML = `
    <div class="meme-export-container">
      ${badgeHTML}
      <div class="loadout-header">
        <span class="class-badge ${classType.toLowerCase()}">${classType.toUpperCase()}</span>
        <span class="loadout-name">${loadoutName}</span>
        <span class="timestamp">Just now</span>
      </div>
      <div class="loadout-details">
        <div class="loadout-item weapon-item">
          <img src="images/${selectedWeapon.replace(/ /g, "_")}.webp" alt="${selectedWeapon}" class="item-icon">
          <span class="item-name">${selectedWeapon}</span>
        </div>
        <div class="loadout-item spec-item">
          <img src="images/${selectedSpec.replace(/ /g, "_")}.webp" alt="${selectedSpec}" class="item-icon">
          <span class="item-name">${selectedSpec}</span>
        </div>
        <div class="gadget-group">
          ${selectedGadgets.map(g => `
            <div class="loadout-item gadget-item">
              <img src="images/${g.replace(/ /g, "_")}.webp" alt="${g}" class="item-icon small">
              <span class="item-name small">${g}</span>
            </div>
          `).join('')}
        </div>
      </div>
      <div class="roast-section loading">
        <div class="roast-content">
          <span class="fire-emoji">🔥</span>
          <span class="roast-text">Analyzing loadout configuration...</span>
        </div>
      </div>
      <div class="meme-footer">
        <span class="meme-watermark">Analyzed by thefinalsloadout.com</span>
      </div>
    </div>
    <div class="loadout-actions">
      <button class="copy-build" onclick="copyLoadoutText(this)">
        <span>📋</span> COPY
      </button>
      <button class="meme-card-btn" onclick="exportMemeCard(this)">
        <span>🧠</span> MEME CARD
      </button>
      <button class="roast-again-btn" onclick="roastMeAgain(this)" title="Get a new breakdown for this exact loadout">
        <span>🔁</span> RUN ANALYSIS AGAIN
      </button>
    </div>
  `;
  
  historyList.prepend(newEntry);
  
  // Animate entry
  setTimeout(() => newEntry.classList.add('visible'), 10);
  
  // Use provided roast or generate new one
  if (providedRoast) {
    // Use the roast that was already generated
    const roastSection = newEntry.querySelector('.roast-section');
    const roastText = newEntry.querySelector('.roast-text');
    roastSection.classList.remove('loading');
    roastText.textContent = providedRoast;
  } else {
    // Generate roast asynchronously (fallback for cases where no roast is provided)
    generateRoast(newEntry, classType, selectedWeapon, selectedSpec, selectedGadgets);
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
  const slotMachineWrapper = document.querySelector('.slot-machine-wrapper');
  if (!slotMachineWrapper) return null;
  
  // Remove any existing roast display
  const existingRoast = document.getElementById('slot-machine-roast');
  if (existingRoast) {
    existingRoast.remove();
  }
  
  // Create roast container
  const roastContainer = document.createElement('div');
  roastContainer.id = 'slot-machine-roast';
  roastContainer.className = 'slot-machine-roast loading';
  roastContainer.innerHTML = `
    <div class="roast-content">
      <span class="fire-emoji">🔥</span>
      <span class="roast-text">Analyzing loadout configuration...</span>
    </div>
  `;
  
  // Insert after slot machine
  slotMachineWrapper.insertAdjacentElement('afterend', roastContainer);
  
  let generatedRoast = null;
  
  // Generate roast
  try {
    const requestData = {
      class: classType,
      weapon: weapon,
      specialization: spec,
      gadgets: gadgets
    };
    
    console.log('🚀 Sending roast request:', requestData);
    
    const response = await fetch('/api/roast', {
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
    console.log('🔥 Received roast response:', data);
    
    generatedRoast = data.roast;
    
    // Update the roast display
    roastContainer.classList.remove('loading');
    const roastText = roastContainer.querySelector('.roast-text');
    roastText.textContent = generatedRoast;
    
    // Remove roast after 10 seconds
    setTimeout(() => {
      roastContainer.classList.add('fade-out');
      setTimeout(() => roastContainer.remove(), 500);
    }, 10000);
    
  } catch (error) {
    console.error('Error generating roast:', error);
    
    // Fallback roast
    const fallbackRoasts = [
      `That ${weapon} on ${classType}? The Finals servers just crashed from cringe. -10/10`,
      `This ${weapon} combo broke our analysis system. That says enough. 0/10`,
      `${classType} with ${weapon}? Even the AI is speechless. That's a new low.`,
      `I've seen bad loadouts, but ${weapon} with ${spec}? This is a war crime.`,
      `${weapon} + ${spec} = Mathematical proof that some combinations shouldn't exist.`
    ];
    
    generatedRoast = fallbackRoasts[Math.floor(Math.random() * fallbackRoasts.length)];
    
    roastContainer.classList.remove('loading');
    roastContainer.classList.add('fallback');
    const roastText = roastContainer.querySelector('.roast-text');
    roastText.textContent = generatedRoast;
    
    // Remove roast after 10 seconds
    setTimeout(() => {
      roastContainer.classList.add('fade-out');
      setTimeout(() => roastContainer.remove(), 500);
    }, 10000);
  }
  
  return generatedRoast;
}

// Generate AI roast for loadout
async function generateRoast(entryElement, classType, weapon, specialization, gadgets) {
  const roastSection = entryElement.querySelector('.roast-section');
  const roastText = entryElement.querySelector('.roast-text');
  
  try {
    // Debug - log what we're sending to the API
    const requestData = {
      class: classType,
      weapon: weapon,
      specialization: specialization,
      gadgets: gadgets
    };
    console.log('🚀 Sending roast request:', requestData);
    
    // Call our Vercel API endpoint
    const response = await fetch('/api/roast', {
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
    console.log('🔥 Received roast response:', data);
    
    // Update the roast section with the AI-generated roast
    roastSection.classList.remove('loading');
    roastText.textContent = data.roast;
    
    // Add fallback indicator if API failed
    if (data.fallback) {
      roastSection.classList.add('fallback');
    }
    
  } catch (error) {
    console.error('Error generating roast:', error);
    
    // Fallback to a generic roast that tries to be more specific
    const fallbackRoasts = [
      `${weapon} and ${specialization}? Bold choice, terrible execution. 1/10`,
      `${classType} with ${weapon}? Your enemies are laughing already. 0/10`,
      `${specialization} + ${gadgets[0]}? Creative chaos, emphasis on chaos. 2/10`,
      `This ${weapon} combo broke our analysis system. That says enough. 0/10`,
      `${classType} class deserves better than this mess. 1/10`,
      `${weapon} with these gadgets? Identity crisis much? 2/10`
    ];
    
    roastSection.classList.remove('loading');
    roastSection.classList.add('fallback');
    roastText.textContent = fallbackRoasts[Math.floor(Math.random() * fallbackRoasts.length)];
  }
  
  // Save history after roast is generated
  saveHistory();
}

function saveHistory() {
  console.log("💾 Saving history to localStorage...");
  const entries = Array.from(document.querySelectorAll(".history-entry")).map(
    (entry) => {
      // Extract data from each entry to save as structured data
      const classType = entry.querySelector('.class-badge')?.textContent.trim();
      const loadoutName = entry.querySelector('.loadout-name')?.textContent.trim();
      const weapon = entry.querySelector('.weapon-item .item-name')?.textContent;
      const specialization = entry.querySelector('.spec-item .item-name')?.textContent;
      const gadgets = Array.from(entry.querySelectorAll('.gadget-item .item-name'))
        .map(el => el.textContent);
      const isSpicy = entry.classList.contains('spicy-loadout');
      
      // Extract badge data
      const badgeElement = entry.querySelector('.loadout-badge');
      const badge = badgeElement ? {
        text: badgeElement.textContent,
        type: badgeElement.classList.contains('legendary-trash') ? 'legendary-trash' : 'special',
        tooltip: badgeElement.getAttribute('title') || ''
      } : null;
      
      // Extract roast data
      const roastSection = entry.querySelector('.roast-section');
      const roastText = entry.querySelector('.roast-text')?.textContent;
      const isRoastLoading = roastSection?.classList.contains('loading');
      const isRoastFallback = roastSection?.classList.contains('fallback');
      
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
        timestamp: Date.now()
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
  console.log("📚 Loading history from localStorage:", savedEntries.length, "entries");
  historyList.innerHTML = "";
  
  savedEntries.forEach((entryData, index) => {
    // Skip if data is malformed
    if (!entryData.classType || !entryData.weapon) return;
    
    const entry = document.createElement("div");
    entry.classList.add("history-entry", "visible"); // Add visible class immediately
    
    // Add spicy class if needed
    if (entryData.isSpicy) {
      entry.classList.add("spicy-loadout");
    }
    
    // Calculate relative timestamp
    const timeAgo = index === 0 ? 'Just now' : `${index + 1} min ago`;
    
    // Determine roast section content
    let roastSectionHTML = '';
    if (entryData.roast) {
      const fallbackClass = entryData.roastFallback ? ' fallback' : '';
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
    const badgeHTML = entryData.badge ? 
      `<div class="loadout-badge ${entryData.badge.type}" title="${entryData.badge.tooltip}">${entryData.badge.text}</div>` : '';
    
    entry.innerHTML = `
      <div class="meme-export-container">
        ${badgeHTML}
        <div class="loadout-header">
          <span class="class-badge ${entryData.classType.toLowerCase()}">${entryData.classType.toUpperCase()}</span>
          <span class="loadout-name">${entryData.loadoutName}</span>
          <span class="timestamp">${timeAgo}</span>
        </div>
        <div class="loadout-details">
          <div class="loadout-item weapon-item">
            <img src="images/${entryData.weapon.replace(/ /g, "_")}.webp" alt="${entryData.weapon}" class="item-icon">
            <span class="item-name">${entryData.weapon}</span>
          </div>
          <div class="loadout-item spec-item">
            <img src="images/${entryData.specialization.replace(/ /g, "_")}.webp" alt="${entryData.specialization}" class="item-icon">
            <span class="item-name">${entryData.specialization}</span>
          </div>
          <div class="gadget-group">
            ${entryData.gadgets.map(g => `
              <div class="loadout-item gadget-item">
                <img src="images/${g.replace(/ /g, "_")}.webp" alt="${g}" class="item-icon small">
                <span class="item-name small">${g}</span>
              </div>
            `).join('')}
          </div>
        </div>
        ${roastSectionHTML}
        <div class="meme-footer">
          <span class="meme-watermark">Analyzed by thefinalsloadout.com</span>
        </div>
      </div>
      <div class="loadout-actions">
        <button class="copy-build" onclick="copyLoadoutText(this)">
          <span>📋</span> COPY
        </button>
        <button class="meme-card-btn" onclick="exportMemeCard(this)">
          <span>🧠</span> MEME CARD
        </button>
      </div>
    `;
    
    historyList.appendChild(entry);
  });
}

function generateLoadoutName(classType, weapon, spec) {
  // Weapon-based adjectives
  const weaponAdjectives = {
    // Light weapons
    "93R": "Burst",
    "Dagger": "Shadow",
    "SR-84": "Sniper",
    "SH1900": "Boom",
    "LH1": "Laser",
    "M26 Matter": "Matter",
    "Recurve Bow": "Archer",
    "Sword": "Blade",
    "M11": "Spray",
    "ARN-220": "Tactical",
    "V9S": "Silent",
    "XP-54": "Rapid",
    "Throwing Knives": "Knife",
    
    // Medium weapons
    "AKM": "Classic",
    "Cerberus 12GA": "Triple",
    "Dual Blades": "Twin",
    "FAMAS": "Burst",
    "CL-40": "Launcher",
    "CB-01 Repeater": "Repeater",
    "FCAR": "Assault",
    "Model 1887": "Lever",
    "Pike-556": "Pike",
    "R.357": "Revolver",
    "Riot Shield": "Shield",
    
    // Heavy weapons
    "50 Akimbo": "Dual",
    "Flamethrower": "Pyro",
    "KS-23": "Pump",
    "Lewis Gun": "Vintage",
    "M60": "Support",
    "M134 Minigun": "Minigun",
    "M32GL": "Grenade",
    "SA 1216": "Auto",
    "Sledgehammer": "Hammer",
    "SHAK-50": "Shak",
    "Spear": "Spear"
  };
  
  // Specialization-based roles
  const specRoles = {
    // Light
    "Cloaking Device": "Ghost",
    "Evasive Dash": "Dasher",
    "Grappling Hook": "Spider",
    
    // Medium
    "Dematerializer": "Phaser",
    "Guardian Turret": "Engineer",
    "Healing Beam": "Medic",
    
    // Heavy
    "Charge N Slam": "Meteor",
    "Goo Gun": "Gooer",
    "Mesh Shield": "Fortress",
    "Winch Claw": "Grappler"
  };
  
  const adjective = weaponAdjectives[weapon] || "Chaos";
  const role = specRoles[spec] || "Agent";
  
  // Create variations to avoid repetition
  const templates = [
    `The ${adjective} ${role}`,
    `${role} of ${adjective}`,
    `${adjective} ${classType}`,
    `${role}'s ${adjective}`
  ];
  
  // Use a consistent template based on hash of weapon+spec
  const hash = (weapon + spec).split('').reduce((a, b) => a + b.charCodeAt(0), 0);
  const template = templates[hash % templates.length];
  
  return template;
}

// Check if loadout deserves LEGENDARY TRASH badge
function shouldShowLegendaryTrashBadge(weapon, spec, gadgets, analysisRating = null) {
  // Define dumpster tier items (notorious bad combinations or items)
  const dumpsterTier = {
    weapons: ['Dagger', 'Throwing Knives'], // Melee in a gun game
    specializations: [], // Add any particularly bad specs
    gadgets: ['Proximity Sensor'] // Generally considered weak
  };
  
  // Check if analysis rating is 3/10 or lower
  if (analysisRating !== null && analysisRating <= 3) {
    return true;
  }
  
  // Check for dumpster tier items
  if (dumpsterTier.weapons.includes(weapon) ||
      dumpsterTier.specializations.includes(spec) ||
      gadgets.some(gadget => dumpsterTier.gadgets.includes(gadget))) {
    return true;
  }
  
  // Check for particularly bad combinations
  const trashCombos = [
    // Heavy class with light weapons
    weapon === 'LH1' || weapon === 'V9S' || weapon === 'Throwing Knives',
    // Multiple movement gadgets (overkill)
    gadgets.includes('Jump Pad') && gadgets.includes('Zipline'),
    // Contradictory playstyles
    weapon === 'Sledgehammer' && gadgets.includes('Cloaking Device'),
    weapon === 'SR-84' && spec === 'Charge N Slam', // Sniper with rush spec
    // Purely comedic bad choices
    weapon === 'Dagger' && gadgets.includes('Riot Shield')
  ];
  
  return trashCombos.some(combo => combo);
}

// Generate optional badges based on loadout characteristics  
function generateOptionalBadge(weapon, spec, gadgets, classType, analysisRating = null) {
  // Check for LEGENDARY TRASH first (highest priority)
  if (shouldShowLegendaryTrashBadge(weapon, spec, gadgets, analysisRating)) {
    return {
      text: '🔥 LEGENDARY TRASH',
      type: 'legendary-trash',
      tooltip: 'This loadout broke the meta—in the worst possible way.'
    };
  }
  
  // Future: Add other badge types like META MONSTER, CHAOS BUILD, etc.
  const specialBadges = [
    { condition: () => weapon === 'M134 Minigun' && spec === 'Dome Shield', text: '🛡️ FORTRESS MODE', type: 'special' },
    { condition: () => gadgets.includes('Flamethrower') && gadgets.includes('Gas Grenade'), text: '🔥 CHAOS INCARNATE', type: 'special' }
  ];
  
  for (const badge of specialBadges) {
    if (badge.condition()) {
      return {
        text: badge.text,
        type: badge.type || 'special',
        tooltip: 'Unique combination detected!'
      };
    }
  }
  
  return null; // No badge for normal combinations
}

function isSpicyLoadout(weapon, spec, gadgets) {
  // Flag weird combos as "spicy"
  const spicyCombos = [
    weapon.includes("Sledgehammer") && gadgets.some(g => g.includes("Smoke Grenade")),
    weapon.includes("SR-84") && spec.includes("Charge N Slam"),
    weapon.includes("Throwing Knives") && spec.includes("Grappling Hook"),
    gadgets.filter(g => g.includes("Mine")).length >= 2,
    weapon.includes("Flamethrower") && gadgets.some(g => g.includes("Gas")),
    weapon.includes("Sword") && spec.includes("Evasive Dash"),
    gadgets.filter(g => g.includes("Grenade")).length >= 2
  ];
  
  return spicyCombos.some(combo => combo);
}

function updateTimestamps() {
  // Simple implementation for now - could be enhanced with real relative time
  const timestamps = document.querySelectorAll('.timestamp');
  timestamps.forEach((timestamp, index) => {
    if (index === 0) {
      timestamp.textContent = 'Just now';
    } else {
      timestamp.textContent = `${index + 1} min ago`;
    }
  });
}

// Make exportMemeCard globally accessible
window.exportMemeCard = function(button) {
  const entry = button.closest('.history-entry');
  const memeContainer = entry.querySelector('.meme-export-container');
  
  if (!memeContainer) {
    console.error('Meme container not found');
    return;
  }
  
  // Show loading state
  const originalText = button.innerHTML;
  button.innerHTML = '<span>⏳</span> GENERATING...';
  button.disabled = true;
  
  // Configure html2canvas options for better quality
  const options = {
    backgroundColor: '#000000',
    scale: 2, // Higher quality
    useCORS: true,
    allowTaint: true,
    width: memeContainer.offsetWidth,
    height: memeContainer.offsetHeight,
    scrollX: 0,
    scrollY: 0
  };
  
  html2canvas(memeContainer, options).then(canvas => {
    // Create download link
    const link = document.createElement('a');
    const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
    link.download = `loadout-roast-${timestamp}.png`;
    link.href = canvas.toDataURL('image/png', 1.0);
    
    // Trigger download
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Success feedback
    button.innerHTML = '<span>✅</span> DOWNLOADED!';
    button.style.background = '#4CAF50';
    
    setTimeout(() => {
      button.innerHTML = originalText;
      button.style.background = '';
      button.disabled = false;
    }, 2000);
    
  }).catch(err => {
    console.error('Failed to generate meme card:', err);
    
    // Error feedback
    button.innerHTML = '<span>❌</span> FAILED';
    button.style.background = '#f44336';
    
    setTimeout(() => {
      button.innerHTML = originalText;
      button.style.background = '';
      button.disabled = false;
    }, 2000);
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
  const classType = entry.querySelector('.class-badge').textContent.trim();
  const loadoutName = entry.querySelector('.loadout-name').textContent.trim();
  
  // Get weapon and specialization from text
  const weapon = entry.querySelector('.weapon-item .item-name')?.textContent || 'Unknown Weapon';
  const specialization = entry.querySelector('.spec-item .item-name')?.textContent || 'Unknown Specialization';
  
  // Get gadgets from text
  const gadgets = Array.from(entry.querySelectorAll('.gadget-item .item-name'))
    .map(el => el.textContent);

  // Create the copy text
  const copyText = `${loadoutName}
Class: ${classType}
Weapon: ${weapon}
Specialization: ${specialization}
Gadgets: ${gadgets.join(', ')}`;

  navigator.clipboard
    .writeText(copyText)
    .then(() => {
      button.innerHTML = '<span>✅</span> COPIED!';
      setTimeout(() => {
        button.innerHTML = '<span>📋</span> COPY';
      }, 2000);
    })
    .catch((err) => {
      console.error("Could not copy text: ", err);
      alert("Failed to copy loadout to clipboard");
    });
};

// Initialize everything when DOM is ready
// Sound helper function
function playSound(soundId) {
  if (!state.soundEnabled) return;
  
  const sound = document.getElementById(soundId);
  if (sound) {
    sound.play().catch(() => {});
  }
}

// Initialize sound toggle functionality
function initializeSoundToggle() {
  const soundToggle = document.getElementById('sound-toggle');
  if (!soundToggle) return;
  
  // Set initial state
  if (!state.soundEnabled) {
    soundToggle.classList.add('muted');
  }
  
  // Add click handler
  soundToggle.addEventListener('click', () => {
    state.soundEnabled = !state.soundEnabled;
    localStorage.setItem('soundEnabled', state.soundEnabled);
    
    if (state.soundEnabled) {
      soundToggle.classList.remove('muted');
    } else {
      soundToggle.classList.add('muted');
      // Stop all currently playing sounds
      const allAudio = document.querySelectorAll('audio');
      allAudio.forEach(audio => {
        audio.pause();
        audio.currentTime = 0;
      });
    }
  });
}

// Season 6 countdown function
function initializeSeasonCountdown() {
  const seasonStatus = document.getElementById('seasonStatus');
  const daysSpan = seasonStatus.querySelector('.days-remaining');
  
  // Calculate end date at midnight PST, 5 days from now
  function getEndDate() {
    const storedEndDate = localStorage.getItem('season6EndDatePST');
    
    if (storedEndDate) {
      return new Date(storedEndDate);
    } else {
      // Create new end date at midnight PST
      const now = new Date();
      const pstOffset = -8; // PST is UTC-8
      
      // Get current time in PST
      const utcTime = now.getTime() + (now.getTimezoneOffset() * 60000);
      const pstTime = new Date(utcTime + (3600000 * pstOffset));
      
      // Set to 5 days from now at midnight PST
      const endDate = new Date(pstTime);
      endDate.setDate(endDate.getDate() + 5);
      endDate.setHours(0, 0, 0, 0); // Midnight
      
      // Store it
      localStorage.setItem('season6EndDatePST', endDate.toISOString());
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
      seasonStatus.textContent = 'Season 6 Has Ended!';
      seasonStatus.classList.add('ended');
      clearInterval(countdownInterval);
      return;
    }
    
    // Calculate days remaining (round up to show "1 day" until the very end)
    const daysRemaining = Math.ceil(diff / (1000 * 60 * 60 * 24));
    
    // Update the display
    if (daysRemaining === 1) {
      seasonStatus.innerHTML = 'Season 6 ends in <span class="days-remaining">1</span> day';
      seasonStatus.classList.add('urgent');
    } else {
      seasonStatus.innerHTML = `Season 6 ends in <span class="days-remaining">${daysRemaining}</span> days`;
      seasonStatus.classList.remove('urgent');
    }
  }
  
  // Update immediately
  updateCountdown();
  
  // Update every hour (more frequent updates aren't needed for day-based countdown)
  const countdownInterval = setInterval(updateCountdown, 1000 * 60 * 60);
}

// Sidebar functionality
function initializeSidebar() {
  const sidebar = document.getElementById('filter-sidebar');
  const mobileToggle = document.getElementById('mobile-filter-toggle');
  const closeSidebar = document.getElementById('close-sidebar');
  
  if (!sidebar || !mobileToggle || !closeSidebar) return;
  
  // Mobile toggle functionality
  mobileToggle.addEventListener('click', () => {
    state.sidebarOpen = !state.sidebarOpen;
    sidebar.classList.toggle('open', state.sidebarOpen);
    
    // Animate hamburger lines
    const lines = mobileToggle.querySelectorAll('.hamburger-line');
    if (state.sidebarOpen) {
      lines[0].style.transform = 'rotate(45deg) translate(5px, 5px)';
      lines[1].style.opacity = '0';
      lines[2].style.transform = 'rotate(-45deg) translate(7px, -6px)';
    } else {
      lines.forEach(line => {
        line.style.transform = '';
        line.style.opacity = '';
      });
    }
  });
  
  // Close sidebar
  closeSidebar.addEventListener('click', () => {
    state.sidebarOpen = false;
    sidebar.classList.remove('open');
    const lines = mobileToggle.querySelectorAll('.hamburger-line');
    lines.forEach(line => {
      line.style.transform = '';
      line.style.opacity = '';
    });
  });
  
  // Close sidebar on backdrop click (mobile)
  sidebar.addEventListener('click', (e) => {
    if (e.target === sidebar && state.isMobile) {
      closeSidebar.click();
    }
  });
  
  // Close sidebar on escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && state.sidebarOpen) {
      closeSidebar.click();
    }
  });
}

// Mobile performance optimizations
function initializeMobileOptimizations() {
  if (!state.isMobile) return;
  
  console.log('🔧 Applying mobile optimizations');
  
  // Add mobile-optimized class to body
  document.body.classList.add('mobile-optimized');
  
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
  const style = document.createElement('style');
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
  const style = document.createElement('style');
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
    '.item-container, .slot-column, .spin-button, .main-spin-button'
  );
  
  animatedElements.forEach(element => {
    element.style.willChange = 'transform';
  });
}

// Implement Intersection Observer for lazy loading
function initializeLazyLoading() {
  const images = document.querySelectorAll('img[loading="lazy"]');
  
  if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          img.src = img.dataset.src || img.src;
          img.classList.remove('lazy');
          observer.unobserve(img);
        }
      });
    }, {
      rootMargin: '50px'
    });
    
    images.forEach(img => {
      imageObserver.observe(img);
    });
  }
}

document.addEventListener("DOMContentLoaded", () => {
  console.log("✅ DOM fully loaded");

  // Load initial counter value
  // loadInitialCounter();
  
  // Also fetch counter as backup
  // setTimeout(() => {
  //   fetchAndUpdateCounter();
  // }, 1000);

  // Initialize sound toggle
  initializeSoundToggle();
  
  // Initialize sidebar functionality
  initializeSidebar();
  
  // Initialize mobile performance optimizations
  initializeMobileOptimizations();
  
  // Initialize season countdown - DISABLED (using new countdown in HTML)
  // initializeSeasonCountdown();

  // Get DOM elements (disabled - using RouletteAnimationSystem instead)
  // classButtons = document.querySelectorAll(".class-button");
  // spinButtons = document.querySelectorAll(".spin-button");
  // spinSelection = document.getElementById("spinSelection");
  outputDiv = document.getElementById("output");
  
  // Mobile audio failsafe - stop all sounds when page loses focus
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      // Stop all audio when page is hidden
      const allAudio = document.querySelectorAll('audio');
      allAudio.forEach(audio => {
        if (!audio.paused) {
          audio.pause();
          audio.currentTime = 0;
        }
      });
    }
  });
  
  // Additional mobile failsafe for iOS
  window.addEventListener('pagehide', () => {
    const allAudio = document.querySelectorAll('audio');
    allAudio.forEach(audio => {
      audio.pause();
      audio.currentTime = 0;
    });
  });
  
  // Initialize roulette system with retry mechanism
  function initializeRouletteSystem() {
    if (!window.RouletteAnimationSystem) {
      console.warn('RouletteAnimationSystem not yet available, retrying in 100ms...');
      setTimeout(initializeRouletteSystem, 100);
      return;
    }
    
    console.log('✅ RouletteAnimationSystem loaded successfully');
    
    // Optimize audio for mobile by reducing concurrent sounds
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    if (isMobile) {
      // Override tick sound frequency on mobile
      const originalPlayTick = window.RouletteAnimationSystem.prototype.playTickSound;
      window.RouletteAnimationSystem.prototype.playTickSound = function() {
        // Only play every 3rd tick on mobile to reduce audio overhead
        if (!this._tickCounter) this._tickCounter = 0;
        this._tickCounter++;
        if (this._tickCounter % 3 === 0) {
          originalPlayTick.call(this);
        }
      };
    }
    
    // Initialize the roulette animation system
    const rouletteSystem = new window.RouletteAnimationSystem();
    
    // Set up the main SPIN button
    const mainSpinButton = document.getElementById('main-spin-button');
    if (mainSpinButton) {
      mainSpinButton.addEventListener('click', async () => {
        if (state.isSpinning || rouletteSystem.animating) return;
        
        // Add spinning animation
        mainSpinButton.classList.add('spinning');
        
        // Start the full roulette sequence
        await rouletteSystem.startFullSequence();
        
        // Remove spinning animation when done
        mainSpinButton.classList.remove('spinning');
      });
    }
  }
  
  // Start the initialization process
  initializeRouletteSystem();

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
  const classSelection = document.querySelector('.class-selection');
  if (classSelection) {
    classSelection.style.display = 'none';
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
        // Get a random class
        const classes = ["Light", "Medium", "Heavy"];
        const randomClass = classes[Math.floor(Math.random() * classes.length)];
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
        ".slot-machine-wrapper .items-container .item-container"
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

      const activeClassButton = document.querySelector(
        ".class-button.selected, .class-button.active"
      );
      const selectedClass = activeClassButton
        ? activeClassButton.dataset.class.toLowerCase() === "random"
          ? document.querySelector(
              ".class-button.selected:not([data-class='Random'])"
            )?.dataset.class
          : activeClassButton.dataset.class
        : "Unknown";

      const copyText = `Class: ${selectedClass}
Weapon: ${selectedItems[0]}
Specialization: ${selectedItems[1]}
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
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadHistory);
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

  // Direct implementation of Select All functionality - no dependencies
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
});

// Increment loadout counter on backend
// Update the total loadouts counter element specifically
function updateTotalLoadoutsDisplay(count) {
  const totalLoadoutsElement = document.getElementById('total-loadouts');
  if (totalLoadoutsElement) {
    const formattedCount = count.toLocaleString();
    totalLoadoutsElement.innerHTML = `🔥 <span class="loadouts-counter">${formattedCount}</span> total analyses delivered`;
    console.log('✅ Updated total-loadouts display:', formattedCount);
  }
}

async function incrementLoadoutCounter() {
  try {
    console.log('📊 Incrementing loadout counter...');
    
    const response = await fetch('/api/spin', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      }
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Counter incremented successfully:', data.totalGenerated);
      
      // Update both the general counter display and the specific total-loadouts element
      updateCounterDisplay(data.totalGenerated);
      updateTotalLoadoutsDisplay(data.totalGenerated);
      
      // Also re-fetch from counter API to ensure accuracy
      await refreshCounterFromAPI();
    } else {
      console.warn('⚠️ Failed to increment counter, but continuing...');
      // Try to refresh from API anyway
      await refreshCounterFromAPI();
    }
  } catch (error) {
    console.warn('⚠️ Error incrementing counter:', error);
    // Try to refresh from API as fallback
    await refreshCounterFromAPI();
  }
}

// Re-fetch counter from API to ensure accuracy
async function refreshCounterFromAPI() {
  try {
    console.log('🔄 Refreshing counter from API...');
    
    const response = await fetch('/api/counter');
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Refreshed counter from API:', data.totalGenerated);
      
      updateCounterDisplay(data.totalGenerated);
      updateTotalLoadoutsDisplay(data.totalGenerated);
    } else {
      console.warn('⚠️ Failed to refresh counter from API');
    }
  } catch (error) {
    console.warn('⚠️ Error refreshing counter from API:', error);
  }
}

// Simple function to fetch and update counter display
async function fetchAndUpdateCounter() {
  try {
    console.log('🔄🔄🔄 FETCHANDUPDATECOUNTER CALLED 🔄🔄🔄');
    alert('fetchAndUpdateCounter called!'); // Very visible debugging
    
    const response = await fetch('/api/counter');
    console.log('📡 Response status:', response.status);
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Counter fetched:', data.totalGenerated);
      alert(`Counter fetched: ${data.totalGenerated}`); // Very visible debugging
      
      // Update all elements with class 'loadouts-counter'
      const counterElements = document.querySelectorAll('.loadouts-counter');
      console.log('🎯 Found counter elements:', counterElements.length);
      
      counterElements.forEach((element, index) => {
        const oldValue = element.textContent;
        element.textContent = data.totalGenerated.toLocaleString();
        console.log(`Updated element ${index}: "${oldValue}" → "${element.textContent}"`);
      });
      
      console.log('✅ Updated', counterElements.length, 'counter elements');
      alert(`Updated ${counterElements.length} elements to ${data.totalGenerated.toLocaleString()}`);
    } else {
      console.warn('⚠️ Failed to fetch counter');
      alert('Failed to fetch counter');
    }
  } catch (error) {
    console.warn('⚠️ Error fetching counter:', error);
    alert(`Error: ${error.message}`);
  }
}

// Test function to manually update counter (for debugging)
window.testUpdateCounter = async function() {
  console.log('🧪 Manual counter test started');
  alert('Testing counter update...');
  
  try {
    const response = await fetch('/api/counter');
    const data = await response.json();
    console.log('Test counter value:', data.totalGenerated);
    
    const elements = document.querySelectorAll('.loadouts-counter');
    console.log('Found elements:', elements.length);
    
    elements.forEach(el => {
      console.log('Updating element:', el);
      el.textContent = data.totalGenerated.toLocaleString();
      el.style.color = 'red'; // Make it obvious
      el.style.fontWeight = 'bold';
    });
    
    alert(`Updated ${elements.length} elements to ${data.totalGenerated}`);
  } catch (error) {
    console.error('Test failed:', error);
    alert('Test failed: ' + error.message);
  }
};

// Update counter display on the page
function updateCounterDisplay(newCount) {
  if (!newCount) {
    console.log('⚠️ updateCounterDisplay called with no count:', newCount);
    return;
  }
  
  console.log('📊 Updating counter display to:', newCount);
  const counterElements = document.querySelectorAll('.loadouts-counter');
  console.log('📊 Found counter elements:', counterElements.length);
  
  counterElements.forEach(element => {
    console.log('📊 Updating element:', element);
    if (element.dataset.countup === 'true') {
      // If using countup animation
      animateCounterTo(element, newCount);
    } else {
      // Simple text update
      element.textContent = newCount.toLocaleString();
    }
  });
}

// Animate counter to new value
function animateCounterTo(element, targetValue) {
  const currentValue = parseInt(element.textContent.replace(/,/g, '')) || 0;
  const increment = Math.ceil((targetValue - currentValue) / 30);
  let current = currentValue;
  
  const timer = setInterval(() => {
    current += increment;
    if (current >= targetValue) {
      current = targetValue;
      clearInterval(timer);
    }
    element.textContent = current.toLocaleString();
  }, 50);
}

// Roast Me Again functionality
async function roastMeAgain(button) {
  const historyEntry = button.closest('.history-entry');
  if (!historyEntry) {
    console.error('Could not find history entry');
    return;
  }
  
  // Extract loadout data from the history entry
  const classElement = historyEntry.querySelector('.class-badge');
  const weaponElement = historyEntry.querySelector('.weapon-item .item-name');
  const specElement = historyEntry.querySelector('.spec-item .item-name');
  const gadgetElements = historyEntry.querySelectorAll('.gadget-item .item-name');
  
  if (!classElement || !weaponElement || !specElement || gadgetElements.length === 0) {
    console.error('Could not extract loadout data from history entry');
    return;
  }
  
  const classType = classElement.textContent.trim();
  const weapon = weaponElement.textContent.trim();
  const specialization = specElement.textContent.trim();
  const gadgets = Array.from(gadgetElements).map(el => el.textContent.trim());
  
  console.log('🔁 Roasting again:', { classType, weapon, specialization, gadgets });
  
  // Find the roast section and text elements
  const roastSection = historyEntry.querySelector('.roast-section');
  const roastText = historyEntry.querySelector('.roast-text');
  
  if (!roastSection || !roastText) {
    console.error('Could not find roast elements in history entry');
    return;
  }
  
  // Disable button and show loading state
  button.disabled = true;
  button.style.opacity = '0.5';
  roastSection.classList.add('loading');
  roastText.style.opacity = '0.5';
  roastText.textContent = 'Generating fresh analysis...';
  
  try {
    const requestData = {
      class: classType,
      weapon: weapon,
      specialization: specialization,
      gadgets: gadgets
    };
    
    console.log('🚀 Sending fresh analysis request:', requestData);
    
    const response = await fetch('/api/roast', {
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
    console.log('🔥 Received fresh analysis response:', data);
    
    // Update with new analysis and add visual feedback
    roastSection.classList.remove('loading', 'fallback');
    roastText.style.opacity = '0';
    
    setTimeout(() => {
      roastText.textContent = data.roast;
      roastText.style.opacity = '1';
      roastText.style.transition = 'opacity 0.3s ease';
      
      // Add a pulse effect to show it's fresh
      roastSection.style.animation = 'pulse 0.6s ease-in-out';
      setTimeout(() => {
        roastSection.style.animation = '';
      }, 600);
    }, 150);
    
  } catch (error) {
    console.error('Error generating fresh analysis:', error);
    
    // Show fallback message
    roastSection.classList.remove('loading');
    roastSection.classList.add('fallback');
    roastText.style.opacity = '0';
    
    setTimeout(() => {
      roastText.textContent = "Claude's too stunned to respond. Try again later. 0/10";
      roastText.style.opacity = '1';
      roastText.style.transition = 'opacity 0.3s ease';
    }, 150);
  } finally {
    // Re-enable button
    button.disabled = false;
    button.style.opacity = '1';
  }
}
