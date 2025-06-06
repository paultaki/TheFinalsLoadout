// Global state
const state = {
  selectedClass: null,
  isSpinning: false,
  currentSpin: 1,
  totalSpins: 0,
  selectedGadgets: new Set(),
  currentGadgetPool: new Set(),
};

// Make state globally accessible
window.state = state;

// Global variables for DOM elements
let spinButtons;
let classButtons;
let spinSelection;
let outputDiv;

// Physics constants for animations
const PHYSICS = {
  ACCELERATION: 6000,
  MAX_VELOCITY: 4000,
  DECELERATION: -3000,
  BOUNCE_DAMPENING: 0.3,
  ITEM_HEIGHT: 188,
  TIMING: {
    REGULAR_SPIN: {
      COLUMN_DELAY: 250, // 0.25s between stops for regular spins
      BASE_DURATION: 800,
      DECELERATION_TIME: 400,
    },
    FINAL_SPIN: {
      COLUMN_DELAY: 700, // 0.6s between stops for final spin
      BASE_DURATION: 2500,
      DECELERATION_TIME: 800,
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

    const timing = isFinalSpin
      ? PHYSICS.TIMING.FINAL_SPIN
      : PHYSICS.TIMING.REGULAR_SPIN;
    this.stopDelay = timing.COLUMN_DELAY * index;
    this.totalDuration = timing.BASE_DURATION + this.stopDelay;
    this.decelerationTime = timing.DECELERATION_TIME;

    this.targetPosition = 0;
    this.initialPosition = 0;
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

    switch (this.state) {
      case "accelerating":
        this.velocity += PHYSICS.ACCELERATION * dt * 1.5; // Increased acceleration
        if (this.velocity >= PHYSICS.MAX_VELOCITY) {
          this.velocity = PHYSICS.MAX_VELOCITY;
          this.state = "spinning";
        }
        break;

      case "spinning":
        if (elapsed >= this.totalDuration - this.decelerationTime) {
          this.state = "decelerating";
          // Calculate target position for all columns
          this.targetPosition =
            Math.ceil(this.position / PHYSICS.ITEM_HEIGHT) *
            PHYSICS.ITEM_HEIGHT;
            
          // For gadget columns, use normal positioning and see which index is visible
          if (this.index >= 2) {
            this.targetPosition = 0; // Back to normal positioning to find out which index is visible
            console.log(`🎯 Gadget column ${this.index} targeting position ${this.targetPosition} - let's see which index shows up`);
          } else {
            console.log(`🎯 Column ${this.index} targeting position ${this.targetPosition}`);
          }
        }
        break;

      case "decelerating":
        this.velocity += PHYSICS.DECELERATION * dt * 1.2; // Smoother deceleration
        
        // Use consistent stopping logic for all columns
        if (
          Math.abs(this.position - this.targetPosition) < 10 &&
          Math.abs(this.velocity) < 100
        ) {
          this.forceStop();
          return;
        }
        
        if (this.velocity <= 0) {
          if (Math.abs(this.velocity) < 150) {
            // Make stopping less abrupt
            this.forceStop();
          } else {
            this.velocity = -this.velocity * (PHYSICS.BOUNCE_DAMPENING * 1.2);
            this.state = "bouncing";
          }
        }
        break;

      case "bouncing":
        this.velocity += PHYSICS.DECELERATION * 1.2 * dt;

        // Enhanced bounce completion check for all columns
        if (
          Math.abs(this.velocity) < 50 ||
          Math.abs(this.position - this.targetPosition) < 5
        ) {
          this.forceStop();
          return;
        }
        break;
    }

    // Update position with boundary checking
    this.position += this.velocity * dt;
    
    // Don't normalize position for gadget columns when targeting position 0
    if (this.index >= 2 && this.targetPosition === 0 && this.state === "stopped") {
      // Keep exact position for gadgets targeting 0
      console.log(`🔒 Gadget column ${this.index} keeping exact position: ${this.position}`);
    } else {
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
    
    // Debug logging for gadget columns
    if (this.index >= 2) {
      console.log(`🛑 Gadget column ${this.index} FORCE STOPPED at position: ${this.position} (target: ${this.targetPosition})`);
      console.log(`🎯 Setting visual transform: translateY(${this.position}px)`);
    }
    
    this.updateVisuals();
    
    // Additional debug after visual update
    if (this.index >= 2) {
      const currentTransform = this.element.style.transform;
      console.log(`🔍 Gadget column ${this.index} final transform: ${currentTransform}`);
    }
  }

  updateVisuals() {
    let blur = 0;
    if (Math.abs(this.velocity) > 3500)
      blur = 15; // Increased blur for high-speed effect
    else if (Math.abs(this.velocity) > 2500) blur = 10;
    else if (Math.abs(this.velocity) > 1500) blur = 6;
    // Shake effect when stopping
    let shakeX =
      this.state === "bouncing" ? Math.sin(performance.now() / 100) * 2 : 0;

    this.element.style.transform = `translate(${shakeX}px, ${this.position}px)`;
    this.element.style.filter = blur > 0 ? `blur(${blur}px)` : "none";
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
  
  // Play spinning sound
  const spinningSound = document.getElementById('spinningSound');
  if (spinningSound) {
    spinningSound.currentTime = 0;
    spinningSound.volume = 0.25; // Reduced by 50%
    spinningSound.play().catch(() => {});
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

      // Also stop background sound immediately (mobile fix)
      const spinBackgroundSound = document.getElementById('spinBackgroundSound');
      if (spinBackgroundSound && !spinBackgroundSound.paused) {
        spinBackgroundSound.pause();
        spinBackgroundSound.currentTime = 0;
        spinBackgroundSound.volume = 0;
        try {
          // Force stop on mobile by removing and re-adding src
          const originalSrc = spinBackgroundSound.src;
          spinBackgroundSound.removeAttribute('src');
          spinBackgroundSound.load();
          setTimeout(() => {
            spinBackgroundSound.src = originalSrc;
            spinBackgroundSound.volume = 0.3; // Reset volume for next time
          }, 100);
        } catch (e) {
          console.log("Mobile background audio stop failed:", e);
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
              if (index === 0) {
                const finalSound = document.getElementById('finalSound');
                if (finalSound) {
                  finalSound.currentTime = 0;
                  finalSound.volume = 0.7;
                  finalSound.play().catch((err) => {
                    console.log("Could not play final sound:", err);
                  });
                }
              }

              // If this is the last column, disable buttons when its tag appears
              if (index === lastColumnIndex) {
                console.log("🔒 Last locked tag added, disabling spin buttons");
                const spinBtns = document.querySelectorAll(".spin-button");
                spinBtns.forEach((button) => {
                  button.disabled = true;
                  button.setAttribute("disabled", "disabled");
                  button.classList.add("dimmed");
                });
                console.log(`Disabled ${spinBtns.length} spin buttons`);
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
  console.log("🔍 Setting up filter system...");

  // Toggle filter panel visibility
  const toggleBtn = document.getElementById("toggle-filters");
  const filterPanel = document.getElementById("filter-panel");
  const toggleIcon = document.querySelector(".toggle-icon");

  if (toggleBtn && filterPanel) {
    console.log("✅ Found toggle button and filter panel");

    toggleBtn.addEventListener("click", () => {
      console.log("🖱️ Filter toggle button clicked");
      const isVisible = filterPanel.style.display === "block";

      if (isVisible) {
        toggleIcon.textContent = "+";
        toggleIcon.classList.remove("open");
        filterPanel.classList.add("closing");

        // Allow animation to complete before hiding
        setTimeout(() => {
          filterPanel.style.display = "none";
          filterPanel.classList.remove("closing");
        }, 300);
      } else {
        filterPanel.style.display = "block";
        toggleIcon.textContent = "×";
        toggleIcon.classList.add("open");

        // Force reflow to ensure animation works
        filterPanel.offsetHeight;
        filterPanel.classList.remove("closing");
      }
    });
  } else {
    console.error("❌ Could not find toggle button or filter panel");
    console.log("Toggle button:", toggleBtn);
    console.log("Filter panel:", filterPanel);
  }

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

function finalizeSpin(columns) {
  console.log("⚠️ Running finalizeSpin with currentSpin:", state.currentSpin);

  // Check if there are more spins to do
  if (state.currentSpin > 1) {
    console.log(
      "🔄 Not final spin, continue sequence. Current spin:",
      state.currentSpin
    );
    
    // Play transition sound between spins
    const transitionSound = document.getElementById('transitionSound');
    if (transitionSound) {
      transitionSound.currentTime = 0;
      transitionSound.volume = 0.6;
      transitionSound.play().catch(() => {});
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
  
  // Stop background music when final spin completes
  const spinBackgroundSound = document.getElementById('spinBackgroundSound');
  if (spinBackgroundSound) {
    // Immediately stop sound for mobile compatibility
    spinBackgroundSound.pause();
    spinBackgroundSound.currentTime = 0;
    
    // For mobile browsers, force a complete stop
    try {
      // Remove loop attribute temporarily
      spinBackgroundSound.loop = false;
      
      // Force stop on mobile by clearing and reloading
      const originalSrc = spinBackgroundSound.src;
      spinBackgroundSound.removeAttribute('src');
      spinBackgroundSound.load();
      
      // Restore src and loop after a delay
      setTimeout(() => {
        spinBackgroundSound.src = originalSrc;
        spinBackgroundSound.loop = true;
        spinBackgroundSound.volume = 0.3; // Reset volume for next time
      }, 200);
    } catch (e) {
      console.log("Mobile background audio force stop failed:", e);
    }
  }
  
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
  classButtons.forEach((button) => {
    button.removeAttribute("disabled");
  });

  // DIRECT BUTTON MANIPULATION - 100% reliable method
  console.log("🔒 Getting direct references to all spin buttons");
  // Get a direct reference to each button by ID if possible
  const spinBtns = document.querySelectorAll(".spin-button");
  console.log(`Found ${spinBtns.length} spin buttons`);

  // Force disable ALL spin buttons
  spinBtns.forEach((btn, index) => {
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

      // Add to history after a delay (helps prevent race conditions)
      setTimeout(() => {
        // Use savedClass instead of state.selectedClass
        addToHistory(savedClass, weapon, specialization, gadgets);

        console.log("✅ Successfully added to history:", loadoutString);
        isAddingToHistory = false; // Reset the flag
      }, 500);

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
  
  // Start background music for the entire spin sequence
  const spinBackgroundSound = document.getElementById('spinBackgroundSound');
  if (spinBackgroundSound) {
    spinBackgroundSound.currentTime = 0;
    spinBackgroundSound.volume = 0.3; // Lower volume for background
    spinBackgroundSound.play().catch(() => {});
  }

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
function addToHistory(
  classType,
  selectedWeapon,
  selectedSpec,
  selectedGadgets
) {
  const historyList = document.getElementById("history-list");
  const newEntry = document.createElement("div");
  newEntry.classList.add("history-entry");

  newEntry.innerHTML = `
    <p><strong>Class:</strong> ${classType}</p>
    <p><strong>Weapon:</strong> ${selectedWeapon}</p>
    <p><strong>Specialization:</strong> ${selectedSpec}</p>
    <p><strong>Gadgets:</strong> ${selectedGadgets.join(", ")}</p>
    <button class="copy-loadout" onclick="copyLoadoutText(this)">Copy</button>
  `;

  historyList.prepend(newEntry);

  // Remove excess entries beyond 5
  while (historyList.children.length > 5) {
    historyList.removeChild(historyList.lastChild);
  }

  saveHistory();
}

function saveHistory() {
  const entries = Array.from(document.querySelectorAll(".history-entry")).map(
    (entry) => entry.innerHTML
  );

  // Limit to the most recent 5 entries
  const cappedEntries = entries.slice(0, 5);

  localStorage.setItem("loadoutHistory", JSON.stringify(cappedEntries));
}

function loadHistory() {
  const historyList = document.getElementById("history-list");
  const savedEntries = JSON.parse(localStorage.getItem("loadoutHistory")) || [];
  historyList.innerHTML = "";
  savedEntries.forEach((html) => {
    const entry = document.createElement("div");
    entry.classList.add("history-entry");
    entry.innerHTML = html;
    historyList.appendChild(entry);
  });
}

// Make copyLoadoutText available globally
window.copyLoadoutText = function (button) {
  const entry = button.closest(".history-entry");

  if (!entry) {
    console.error("Error: No history entry found.");
    return;
  }

  const text = Array.from(entry.querySelectorAll("p"))
    .map((p) => p.textContent)
    .join("\n");

  navigator.clipboard
    .writeText(text)
    .then(() => {
      button.textContent = "Copied!";
      setTimeout(() => {
        button.textContent = "Copy";
      }, 2000);
    })
    .catch((err) => {
      console.error("Could not copy text: ", err);
      alert("Failed to copy loadout to clipboard");
    });
};

// Initialize everything when DOM is ready
document.addEventListener("DOMContentLoaded", () => {
  console.log("✅ DOM fully loaded");

  // Get DOM elements
  classButtons = document.querySelectorAll(".class-button");
  spinButtons = document.querySelectorAll(".spin-button");
  spinSelection = document.getElementById("spinSelection");
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
      
      // Start the full roulette sequence
      await rouletteSystem.startFullSequence();
    });
  }

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

  // Hide original spin selection UI
  if (spinSelection) {
    spinSelection.style.display = 'none';
  }
  
  // Spin button logic (kept for internal use but hidden)
  if (spinButtons.length > 0) {
    spinButtons.forEach((button) => {
      button.addEventListener("click", () => {
        if (button.disabled || state.isSpinning) return;

        console.log(`🎲 Spin button clicked: ${button.dataset.spins} spins`);

        // Update the selected number of spins
        state.totalSpins = parseInt(button.dataset.spins);

        // Visual feedback - highlight the selected button
        spinButtons.forEach((btn) =>
          btn.classList.remove("selected", "active")
        );
        button.classList.add("selected", "active");

        // Start the spin process
        spinLoadout();
      });
    });
  }

  // Hide original class selection UI
  const classSelection = document.querySelector('.class-selection');
  if (classSelection) {
    classSelection.style.display = 'none';
  }
  
  // Class button event listeners (kept for internal use)
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

  // Initialize loadout history
  loadHistory();

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
