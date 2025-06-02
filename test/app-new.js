// Enhanced Slot Machine Engine with Vegas-style animations
// Built by a former Vegas slot machine designer

// Global state
const state = {
  selectedClass: null,
  isSpinning: false,
  currentSpin: 1,
  totalSpins: 0,
  selectedGadgets: new Set(),
  gadgetQueue: {
    Light: [],
    Medium: [],
    Heavy: [],
  },
  currentGadgetPool: new Set(),
  audioEnabled: true,
};

// Global variables for DOM elements
let spinButtons;
let classButtons;
let spinSelection;
let outputDiv;

// Enhanced Physics constants for Vegas-style animations
const PHYSICS = {
  ACCELERATION: 8000,
  MAX_VELOCITY: 5000,
  DECELERATION: -2500,
  BOUNCE_DAMPENING: 0.4,
  ITEM_HEIGHT: 188,
  TIMING: {
    REGULAR_SPIN: {
      COLUMN_DELAY: 300,
      BASE_DURATION: 1000,
      DECELERATION_TIME: 500,
    },
    FINAL_SPIN: {
      COLUMN_DELAY: 800,
      BASE_DURATION: 3000,
      DECELERATION_TIME: 1000,
    },
  },
};

const loadouts = {
  Light: {
    weapons: [
      "93R", "Dagger", "SR-84", "SH1900", "LH1", "M26 Matter",
      "Recurve Bow", "Sword", "M11", "ARN-220", "V9S", "XP-54", "Throwing Knives"
    ],
    specializations: ["Cloaking Device", "Evasive Dash", "Grappling Hook"],
    gadgets: [
      "Breach Charge", "Gateway", "Glitch Grenade", "Gravity Vortex",
      "Nullifier", "Sonar Grenade", "Thermal Bore", "Gas Grenade",
      "Thermal Vision", "Tracking Dart", "Vanishing Bomb", "Goo Grenade",
      "Pyro Grenade", "Smoke Grenade", "Frag Grenade", "Flashbang"
    ],
  },
  Medium: {
    weapons: [
      "AKM", "Cerberus 12GA", "Dual Blades", "FAMAS", "CL-40",
      "CB-01 Repeater", "FCAR", "Model 1887", "Pike-556", "R.357", "Riot Shield"
    ],
    specializations: ["Dematerializer", "Guardian Turret", "Healing Beam"],
    gadgets: [
      "APS Turret", "Data Reshaper", "Defibrillator", "Explosive Mine",
      "Gas Mine", "Glitch Trap", "Jump Pad", "Zipline", "Gas Grenade",
      "Goo Grenade", "Pyro Grenade", "Smoke Grenade", "Frag Grenade",
      "Flashbang", "Proximity Sensor"
    ],
  },
  Heavy: {
    weapons: [
      "50 Akimbo", "Flamethrower", "KS-23", "Lewis Gun", "M60",
      "M134 Minigun", "M32GL", "SA_1216", "Sledgehammer", "SHAK-50", "Spear"
    ],
    specializations: ["Charge N Slam", "Goo Gun", "Mesh Shield", "Winch Claw"],
    gadgets: [
      "Anti-Gravity Cube", "Barricade", "C4", "Dome Shield",
      "Lockbolt Launcher", "Pyro Mine", "Proximity Sensor", "RPG-7",
      "Goo Grenade", "Pyro Grenade", "Smoke Grenade", "Frag Grenade",
      "Flashbang", "Explosive Mine", "Gas Grenade"
    ],
  },
};

// Function to get filtered loadouts based on checkbox selections
function getFilteredLoadouts() {
  const filteredLoadouts = JSON.parse(JSON.stringify(loadouts));

  let checkedWeapons = Array.from(
    document.querySelectorAll('.item-grid input[data-type="weapon"]:checked')
  ).map((checkbox) => checkbox.value);

  let checkedSpecializations = Array.from(
    document.querySelectorAll('.item-grid input[data-type="specialization"]:checked')
  ).map((checkbox) => checkbox.value);

  let checkedGadgets = Array.from(
    document.querySelectorAll('.item-grid input[data-type="gadget"]:checked')
  ).map((checkbox) => checkbox.value);

  // Apply filters to each class
  for (const classType of ["Light", "Medium", "Heavy"]) {
    const originalWeapons = loadouts[classType].weapons;
    const originalSpecs = loadouts[classType].specializations;
    const originalGadgets = loadouts[classType].gadgets;
    
    if (checkedWeapons.length > 0) {
      filteredLoadouts[classType].weapons = originalWeapons.filter(
        (weapon) => checkedWeapons.includes(weapon)
      );
    }

    if (checkedSpecializations.length > 0) {
      filteredLoadouts[classType].specializations = originalSpecs.filter(
        (spec) => checkedSpecializations.includes(spec)
      );
    }

    if (checkedGadgets.length > 0) {
      filteredLoadouts[classType].gadgets = originalGadgets.filter(
        (gadget) => checkedGadgets.includes(gadget)
      );
    }

    // Ensure we have at least enough items
    if (filteredLoadouts[classType].weapons.length === 0) {
      filteredLoadouts[classType].weapons = loadouts[classType].weapons;
    }
    if (filteredLoadouts[classType].specializations.length === 0) {
      filteredLoadouts[classType].specializations = loadouts[classType].specializations;
    }
    if (filteredLoadouts[classType].gadgets.length < 3) {
      filteredLoadouts[classType].gadgets = loadouts[classType].gadgets;
    }
  }

  return filteredLoadouts;
}

// Helper functions
const getRandomUniqueItems = (array, n) => {
  const shuffled = [...array].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, n);
};

// Enhanced item container with Vegas-style animations
function createItemContainer(items, winningItem = null, isGadget = false) {
  winningItem = winningItem || items[Math.floor(Math.random() * items.length)];
  
  // Create a longer sequence for more dramatic spinning
  const sequenceLength = 12; // Increased for longer spin
  let sequence = [];
  
  // Build sequence ensuring no adjacent duplicates
  for (let i = 0; i < sequenceLength; i++) {
    if (i === 7) { // Winner position moved further down
      sequence.push(winningItem);
    } else {
      let availableItems = items.filter(item => 
        item !== winningItem && 
        (i === 0 || item !== sequence[i - 1]) // No adjacent duplicates
      );
      
      if (availableItems.length === 0) {
        availableItems = items.filter(item => item !== winningItem);
      }
      
      const randomItem = availableItems[Math.floor(Math.random() * availableItems.length)];
      sequence.push(randomItem);
    }
  }

  return sequence.map((item, index) => `
    <div class="itemCol ${index === 7 ? "winner" : ""}" data-item="${item}" style="transform: translateY(${index * PHYSICS.ITEM_HEIGHT}px);">
      <div class="item-inner">
        <img src="images/${item.replace(/ /g, "_")}.webp" alt="${item}" onerror="this.src='images/placeholder.webp'; console.error('Failed to load image:', this.src);">
        <p>${item}</p>
      </div>
    </div>
  `).join("");
}

// Vegas-style SlotColumn class with enhanced animations
class SlotColumn {
  constructor(element, index, isFinalSpin, totalColumns) {
    this.element = element;
    this.index = index;
    this.totalColumns = totalColumns;
    this.velocity = 0;
    this.position = 0;
    this.state = "waiting";
    this.lastTimestamp = null;
    this.isFinalSpin = isFinalSpin;
    this.animationStartTime = null;
    this.maxAnimationDuration = 15000;
    
    console.log(`🎰 SlotColumn ${index} initialized, isFinalSpin: ${isFinalSpin}`);
    
    // Staggered timing for cascade effect
    const timing = isFinalSpin ? PHYSICS.TIMING.FINAL_SPIN : PHYSICS.TIMING.REGULAR_SPIN;
    this.stopDelay = timing.COLUMN_DELAY * index;
    this.totalDuration = timing.BASE_DURATION + this.stopDelay;
    this.decelerationTime = timing.DECELERATION_TIME;
    
    this.targetPosition = 0;
    this.initialPosition = 0;
    this.anticipationComplete = false;
  }

  update(elapsed, deltaTime) {
    if (!this.animationStartTime) {
      this.animationStartTime = performance.now();
    }
    
    if (this.state === "stopped") return;

    const dt = Math.min(deltaTime, 50) / 1000;

    switch (this.state) {
      case "anticipation":
        // Pull back slightly before spinning
        if (elapsed < 200) {
          this.position = Math.sin(elapsed / 200 * Math.PI) * -20;
        } else {
          this.state = "accelerating";
          this.position = 0;
        }
        break;

      case "accelerating":
        this.velocity += PHYSICS.ACCELERATION * dt * 1.8;
        if (this.velocity >= PHYSICS.MAX_VELOCITY) {
          this.velocity = PHYSICS.MAX_VELOCITY;
          this.state = "spinning";
        }
        break;

      case "spinning":
        // Add slight velocity variations for realism
        this.velocity = PHYSICS.MAX_VELOCITY + Math.sin(elapsed / 100) * 200;
        
        if (elapsed >= this.totalDuration - this.decelerationTime) {
          this.state = "decelerating";
          // Calculate target to land on winner (index 7)
          // We want to show the item at index 7 in the center of the view
          // Since items move up (negative transform), we need positive position
          const totalHeight = PHYSICS.ITEM_HEIGHT * 12;
          const currentCycles = Math.floor(this.position / totalHeight);
          this.targetPosition = (currentCycles + 1) * totalHeight - (PHYSICS.ITEM_HEIGHT * 7);
        }
        break;

      case "decelerating":
        const distanceToTarget = Math.abs(this.targetPosition - this.position);
        
        // Smooth deceleration curve
        if (distanceToTarget > 100) {
          this.velocity *= 0.95;
        } else if (distanceToTarget > 10) {
          this.velocity *= 0.85;
        } else {
          // Snap to position
          this.position = this.targetPosition;
          this.velocity = 0;
          this.state = "landing";
          console.log(`🎯 Column ${this.index} landed at position ${this.position}`);
        }
        break;

      case "landing":
        // Bounce effect
        if (!this.landingStartTime) {
          this.landingStartTime = elapsed;
          this.bounceVelocity = -150;
        }
        
        const landingElapsed = elapsed - this.landingStartTime;
        if (landingElapsed < 300) {
          this.bounceVelocity += 1500 * dt;
          this.position = this.targetPosition + Math.sin(landingElapsed / 300 * Math.PI) * 10;
        } else {
          this.position = this.targetPosition;
          this.state = "stopped";
        }
        break;
    }

    if (this.state !== "landing" && this.state !== "stopped" && this.state !== "anticipation") {
      this.position += this.velocity * dt;
    }
    
    this.updateVisuals();
  }

  updateVisuals() {
    let blur = 0;
    let scale = 1;
    
    if (Math.abs(this.velocity) > 4000) blur = 20;
    else if (Math.abs(this.velocity) > 3000) blur = 15;
    else if (Math.abs(this.velocity) > 2000) blur = 10;
    else if (Math.abs(this.velocity) > 1000) blur = 5;
    
    // Add subtle scaling during acceleration
    if (this.state === "accelerating") {
      scale = 1 + (this.velocity / PHYSICS.MAX_VELOCITY) * 0.05;
    }
    
    // Shake effect when landing
    let shakeX = 0;
    if (this.state === "landing") {
      shakeX = Math.sin(performance.now() / 50) * 3 * (1 - (performance.now() - this.landingStartTime) / 300);
    }

    this.element.style.transform = `translate(${shakeX}px, ${-this.position}px) scale(${scale})`;
    this.element.style.filter = blur > 0 ? `blur(${blur}px)` : "none";
  }

  forceStop() {
    this.velocity = 0;
    this.position = this.targetPosition;
    this.state = "stopped";
    this.updateVisuals();
  }
}

// Flag to prevent duplicate history entries
let isAddingToHistory = false;
let lastAddedLoadout = null;

// Main display function with enhanced animations
const displayLoadout = (classType) => {
  const filteredLoadouts = getFilteredLoadouts();
  const loadout = filteredLoadouts[classType];

  // Select random items
  const selectedWeapon = getRandomUniqueItems(loadout.weapons, 1)[0];
  const selectedSpec = getRandomUniqueItems(loadout.specializations, 1)[0];
  
  // FIXED: Ensure 3 unique gadgets
  const selectedGadgets = getRandomUniqueItems(loadout.gadgets, 3);
  
  // Create the enhanced slot machine HTML
  const loadoutHTML = `
    <div class="slot-machine-wrapper vegas-style">
      <div class="slot-machine-frame">
        <div class="slot-machine-top">
          <div class="jackpot-lights">
            ${Array(15).fill().map((_, i) => `<div class="light light-${i % 3}"></div>`).join('')}
          </div>
          <h3 class="slot-title">${classType.toUpperCase()} LOADOUT</h3>
        </div>
        
        <div class="items-container">
          <div class="item-container reel">
            <div class="reel-shadow"></div>
            <div class="scroll-container">
              ${createItemContainer(loadout.weapons, selectedWeapon)}
            </div>
            <div class="reel-label">WEAPON</div>
          </div>
          
          <div class="item-container reel">
            <div class="reel-shadow"></div>
            <div class="scroll-container">
              ${createItemContainer(loadout.specializations, selectedSpec)}
            </div>
            <div class="reel-label">SPECIAL</div>
          </div>
          
          ${selectedGadgets.map((gadget, index) => `
            <div class="item-container reel">
              <div class="reel-shadow"></div>
              <div class="scroll-container" data-gadget-index="${index}">
                ${createItemContainer(loadout.gadgets, gadget, true)}
              </div>
              <div class="reel-label">GADGET ${index + 1}</div>
            </div>
          `).join('')}
        </div>
        
        <div class="slot-machine-bottom">
          <div class="win-indicator" id="win-indicator">
            <span class="win-text">LOADOUT READY!</span>
          </div>
        </div>
      </div>
    </div>
  `;

  outputDiv.innerHTML = loadoutHTML;

  // Add enhanced styles
  addVegasStyles();
  
  console.log("🎲 Loadout HTML set, items created:", {
    weapon: selectedWeapon,
    spec: selectedSpec,
    gadgets: selectedGadgets
  });

  // Use requestAnimationFrame to ensure DOM is ready
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      const scrollContainers = Array.from(document.querySelectorAll(".scroll-container"));
      console.log(`🎯 Found ${scrollContainers.length} scroll containers`);
      console.log("Scroll container details:", scrollContainers.map(c => ({
        element: c,
        children: c.children.length,
        innerHTML: c.innerHTML.substring(0, 100) + "..."
      })));
      
      if (scrollContainers.length > 0) {
        startEnhancedSpinAnimation(scrollContainers);
      } else {
        console.error("❌ No scroll containers found!");
      }
    });
  });
};

const displayRandomLoadout = () => {
  const classes = ["Light", "Medium", "Heavy"];
  const randomClass = classes[Math.floor(Math.random() * classes.length)];
  displayLoadout(randomClass);
};

// Enhanced spin animation with Vegas effects
function startEnhancedSpinAnimation(columns) {
  const isFinalSpin = state.currentSpin === 1;
  const startTime = performance.now();
  
  // Start jackpot lights animation
  const lights = document.querySelectorAll('.light');
  let lightInterval = setInterval(() => {
    lights.forEach((light, i) => {
      light.classList.toggle('active', Math.random() > 0.5);
    });
  }, 100);

  const slotColumns = columns.map(
    (element, index) => new SlotColumn(element, index, isFinalSpin, columns.length)
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

  // Initialize with anticipation
  slotColumns.forEach((column) => {
    column.state = "anticipation";
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
        const deltaTime = column.lastTimestamp ? currentTime - column.lastTimestamp : 16.67;
        column.update(elapsed, deltaTime);
        column.lastTimestamp = currentTime;
      }
    });

    if (isAnimating) {
      requestAnimationFrame(animate);
    } else {
      // All stopped
      clearInterval(lightInterval);
      onSpinComplete(columns, isFinalSpin);
    }
  }

  requestAnimationFrame(animate);
}

// Vegas-style completion effects
function onSpinComplete(columns, isFinalSpin) {
  if (isFinalSpin) {
    // Show win indicator
    const winIndicator = document.getElementById('win-indicator');
    if (winIndicator) {
      winIndicator.classList.add('show');
    }
    
    // Flash winning items and ensure winner class is properly set
    columns.forEach((column, index) => {
      setTimeout(() => {
        const container = column.closest(".item-container");
        container.classList.add("winner-flash");
        
        // Ensure the winner item is properly marked
        const items = column.querySelectorAll('.itemCol');
        items.forEach((item, idx) => {
          if (idx === 7) { // Winner is at index 7
            item.classList.add('winner');
          }
        });
        
        // Add locked tag with animation
        const lockedTag = document.createElement("div");
        lockedTag.className = "locked-tag vegas-locked";
        lockedTag.innerHTML = '<span>✓</span> LOCKED';
        container.appendChild(lockedTag);
        
        setTimeout(() => lockedTag.classList.add('show'), 50);
      }, index * 150);
    });
    
    // Celebration lights
    setTimeout(() => {
      const lights = document.querySelectorAll('.light');
      let celebrationCount = 0;
      const celebrationInterval = setInterval(() => {
        lights.forEach((light, i) => {
          light.classList.toggle('active', (i + celebrationCount) % 3 === 0);
        });
        celebrationCount++;
        if (celebrationCount > 20) clearInterval(celebrationInterval);
      }, 50);
    }, columns.length * 150);
    
    // Disable spin buttons
    spinButtons.forEach((button) => {
      button.disabled = true;
      button.setAttribute("disabled", "disabled");
      button.classList.add("dimmed");
    });
  }
  
  setTimeout(() => finalizeSpin(columns), isFinalSpin ? 1500 : 300);
}

// Update finalizeSpin to work with the new system
function finalizeSpin(columns) {
  console.log(`⚠️ Running finalizeSpin with currentSpin: ${state.currentSpin}`);

  if (state.currentSpin > 1) {
    console.log(`🔄 Not final spin, continue sequence. Current spin: ${state.currentSpin}`);
    state.currentSpin--;
    updateSpinCountdown(state.currentSpin);
    state.isSpinning = false;
    
    setTimeout(() => {
      console.log(`🎲 Starting next spin in sequence. Remaining: ${state.currentSpin}`);
      if (state.selectedClass === "random") {
        displayRandomLoadout();
      } else {
        displayLoadout(state.selectedClass);
      }
    }, 500);
    return;
  }

  console.log("🎯 Final spin, recording loadout");
  
  // Prevent duplicate processing
  if (isAddingToHistory) {
    console.log("🛑 Already adding to history, preventing duplicate call");
    return;
  }

  state.isSpinning = false;
  
  // Re-enable class buttons
  classButtons.forEach((button) => {
    button.removeAttribute("disabled");
  });
  
  // Get the final selections from the DOM
  const itemContainers = document.querySelectorAll(".slot-machine-wrapper .items-container .item-container");
  
  if (itemContainers && itemContainers.length > 0) {
    isAddingToHistory = true;
    
    let savedClass = state.selectedClass;
    console.log("💾 Selected Class Before Processing:", savedClass);
    
    // If we're using the random class mode, get the actual selected class
    if (savedClass && savedClass.toLowerCase() === "random") {
      const slotTitle = document.querySelector('.slot-title');
      if (slotTitle) {
        const titleText = slotTitle.textContent.trim();
        savedClass = titleText.replace(' LOADOUT', '').toLowerCase();
        savedClass = savedClass.charAt(0).toUpperCase() + savedClass.slice(1);
      }
    }
    
    const selectedItems = Array.from(itemContainers).map((container) => {
      const scrollContainer = container.querySelector('.scroll-container');
      if (!scrollContainer) return "Unknown";
      
      // Get all items and find the one at index 7 (winner position)
      const items = scrollContainer.querySelectorAll('.itemCol');
      const winnerItem = items[7]; // Winner is always at index 7
      
      if (!winnerItem) return "Unknown";
      
      const itemText = winnerItem.querySelector('p')?.innerText.trim();
      return itemText || "Unknown";
    });
    
    if (selectedItems.length >= 5 && !selectedItems.includes("Unknown")) {
      const weapon = selectedItems[0];
      const specialization = selectedItems[1];
      const gadgets = selectedItems.slice(2, 5);
      
      const loadoutString = `${savedClass}-${weapon}-${specialization}-${gadgets.join("-")}`;
      console.log("🚨 Loadout to be recorded:", loadoutString);
      
      if (loadoutString === lastAddedLoadout) {
        console.log("🔍 Duplicate loadout detected, not adding to history");
        isAddingToHistory = false;
        state.selectedClass = null;
        return;
      }
      lastAddedLoadout = loadoutString;
      
      setTimeout(() => {
        addToHistory(savedClass, weapon, specialization, gadgets);
        console.log("✅ Successfully added to history:", loadoutString);
        isAddingToHistory = false;
      }, 500);
      
      state.selectedClass = null;
    } else {
      console.warn("⚠️ Could not record loadout - incomplete data:", selectedItems);
      isAddingToHistory = false;
      state.selectedClass = null;
    }
  } else {
    isAddingToHistory = false;
    state.selectedClass = null;
  }
  
  console.log("✅ Spin completed and finalized! Buttons remain disabled until class selection.");
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
  
  // Disable ONLY class buttons during the spin
  document.querySelectorAll(".class-button").forEach((btn) => {
    btn.setAttribute("disabled", "true");
  });
  
  document.getElementById("output").scrollIntoView({
    behavior: "smooth",
    block: "center",
  });
  
  updateSpinCountdown(state.currentSpin);
  
  console.log(`🎲 Starting first spin with currentSpin = ${state.currentSpin}`);
  
  if (state.selectedClass === "random") {
    displayRandomLoadout();
  } else {
    displayLoadout(state.selectedClass);
  }
};

// Include all the history functions from the original
function addToHistory(classType, selectedWeapon, selectedSpec, selectedGadgets) {
  const historyList = document.getElementById("history-list");
  const newEntry = document.createElement("div");
  newEntry.classList.add("history-entry", "glass");

  newEntry.innerHTML = `
    <p><strong>Class:</strong> ${classType}</p>
    <p><strong>Weapon:</strong> ${selectedWeapon}</p>
    <p><strong>Specialization:</strong> ${selectedSpec}</p>
    <p><strong>Gadgets:</strong> ${selectedGadgets.join(", ")}</p>
    <button class="copy-loadout" onclick="copyLoadoutText(this)">Copy</button>
  `;

  historyList.prepend(newEntry);

  while (historyList.children.length > 5) {
    historyList.removeChild(historyList.lastChild);
  }

  saveHistory();
}

function saveHistory() {
  const entries = Array.from(document.querySelectorAll(".history-entry")).map(
    (entry) => entry.innerHTML
  );
  const cappedEntries = entries.slice(0, 5);
  localStorage.setItem("loadoutHistory", JSON.stringify(cappedEntries));
}

function loadHistory() {
  const historyList = document.getElementById("history-list");
  const savedEntries = JSON.parse(localStorage.getItem("loadoutHistory")) || [];
  historyList.innerHTML = "";
  savedEntries.forEach((html) => {
    const entry = document.createElement("div");
    entry.classList.add("history-entry", "glass");
    entry.innerHTML = html;
    historyList.appendChild(entry);
  });
}

window.copyLoadoutText = function (button) {
  const entry = button.closest(".history-entry");
  if (!entry) return;

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

// Add Vegas-style CSS
function addVegasStyles() {
  if (document.getElementById('vegas-styles')) return;
  
  const style = document.createElement('style');
  style.id = 'vegas-styles';
  style.textContent = `
    .vegas-style {
      position: relative;
      padding: 20px;
    }
    
    .slot-machine-frame {
      background: linear-gradient(145deg, #2a2a3e, #1a1a2e);
      border-radius: 20px;
      padding: 0;
      box-shadow: 
        0 0 50px rgba(255, 184, 0, 0.3),
        inset 0 0 20px rgba(0, 0, 0, 0.5);
      overflow: hidden;
    }
    
    .slot-machine-top {
      background: linear-gradient(to bottom, #3a3a4e, #2a2a3e);
      padding: 15px;
      text-align: center;
      border-bottom: 3px solid #ffb800;
    }
    
    .jackpot-lights {
      display: flex;
      justify-content: center;
      gap: 10px;
      margin-bottom: 10px;
    }
    
    .light {
      width: 12px;
      height: 12px;
      border-radius: 50%;
      background: #444;
      transition: all 0.2s;
      box-shadow: inset 0 0 3px rgba(0,0,0,0.5);
    }
    
    .light.active {
      box-shadow: 0 0 15px currentColor, 0 0 30px currentColor;
    }
    
    .light-0.active { background: #ff0000; color: #ff0000; }
    .light-1.active { background: #ffb800; color: #ffb800; }
    .light-2.active { background: #00ff00; color: #00ff00; }
    
    .slot-title {
      margin: 0;
      font-size: 24px;
      color: #ffb800;
      text-shadow: 2px 2px 4px rgba(0,0,0,0.5);
      letter-spacing: 2px;
    }
    
    .items-container {
      display: flex;
      gap: 15px;
      padding: 30px;
      background: #1a1a2e;
      justify-content: center;
    }
    
    .item-container {
      position: relative;
      width: 140px;
      height: 180px;
      overflow: hidden;
    }
    
    .item-container.reel {
      background: #0a0a1e;
      border-radius: 10px;
      box-shadow: 
        inset 0 0 30px rgba(0,0,0,0.8),
        0 0 20px rgba(255,184,0,0.1);
    }
    
    .reel-shadow {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 100%;
      background: linear-gradient(
        to bottom,
        rgba(0,0,0,0.8) 0%,
        transparent 20%,
        transparent 80%,
        rgba(0,0,0,0.8) 100%
      );
      pointer-events: none;
      z-index: 10;
    }
    
    .reel-label {
      position: absolute;
      bottom: -25px;
      left: 50%;
      transform: translateX(-50%);
      font-size: 12px;
      color: #888;
      letter-spacing: 1px;
      white-space: nowrap;
    }
    
    .scroll-container {
      position: relative;
      height: 100%;
      width: 100%;
    }
    
    .item-inner {
      padding: 10px;
      text-align: center;
    }
    
    .item-inner img {
      width: 80px;
      height: 80px;
      object-contain: contain;
      margin-bottom: 10px;
    }
    
    .item-inner p {
      margin: 0;
      font-size: 14px;
      color: #fff;
    }
    
    .itemCol {
      height: ${PHYSICS.ITEM_HEIGHT}px;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: transform 0.1s;
      position: absolute;
      width: 100%;
      left: 0;
    }
    
    .itemCol.winner .item-inner {
      background: linear-gradient(145deg, #2a2a3e, #3a3a4e);
      border-radius: 10px;
    }
    
    .winner-flash {
      animation: winnerFlash 0.5s ease-out;
    }
    
    @keyframes winnerFlash {
      0%, 100% { transform: scale(1); }
      50% { transform: scale(1.1); box-shadow: 0 0 30px #ffb800; }
    }
    
    .slot-machine-bottom {
      background: linear-gradient(to top, #3a3a4e, #2a2a3e);
      padding: 20px;
      text-align: center;
      border-top: 3px solid #ffb800;
    }
    
    .win-indicator {
      opacity: 0;
      transform: scale(0.8);
      transition: all 0.5s;
    }
    
    .win-indicator.show {
      opacity: 1;
      transform: scale(1);
    }
    
    .win-text {
      font-size: 28px;
      color: #ffb800;
      text-shadow: 0 0 20px #ffb800;
      letter-spacing: 3px;
      font-weight: bold;
      animation: pulse 1s infinite;
    }
    
    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.7; }
    }
    
    .locked-tag.vegas-locked {
      position: absolute;
      top: 10px;
      right: 10px;
      background: linear-gradient(145deg, #4a7c59, #66b032);
      color: white;
      padding: 5px 10px;
      border-radius: 5px;
      font-size: 12px;
      font-weight: bold;
      opacity: 0;
      transform: scale(0);
      transition: all 0.3s;
      box-shadow: 0 2px 10px rgba(102, 176, 50, 0.5);
      z-index: 20;
    }
    
    .locked-tag.vegas-locked.show {
      opacity: 1;
      transform: scale(1);
    }
    
    .locked-tag.vegas-locked span {
      margin-right: 3px;
    }
  `;
  
  document.head.appendChild(style);
}

// Initialize everything when DOM is ready
document.addEventListener("DOMContentLoaded", () => {
  console.log("✅ DOM fully loaded");
  
  // Get DOM elements
  classButtons = document.querySelectorAll(".class-button");
  spinButtons = document.querySelectorAll(".spin-button");
  spinSelection = document.getElementById("spinSelection");
  outputDiv = document.getElementById("output");
  
  const toggleBtn = document.getElementById("toggle-customization");
  const customizationPanel = document.getElementById("customization-panel");
  
  // Toggle customization panel
  if (toggleBtn && customizationPanel) {
    toggleBtn.addEventListener("click", () => {
      customizationPanel.style.display = 
        customizationPanel.style.display === "block" ? "none" : "block";
    });
  }
  
  // Setup filter system
  setupFilterSystem();
  populateFilterItems();
  
  // Spin button logic
  if (spinButtons.length > 0) {
    spinButtons.forEach((button) => {
      button.addEventListener("click", () => {
        if (button.disabled || state.isSpinning) return;
        
        console.log(`🎲 Spin button clicked: ${button.dataset.spins} spins`);
        
        state.totalSpins = parseInt(button.dataset.spins);
        
        spinButtons.forEach((btn) => btn.classList.remove("selected", "active"));
        button.classList.add("selected", "active");
        
        spinLoadout();
      });
    });
  }
  
  // Class button event listeners
  classButtons.forEach((button) => {
    button.addEventListener("click", () => {
      if (state.isSpinning) return;
      
      console.log(`✅ Class Selected: ${button.dataset.class}`);
      
      classButtons.forEach((b) => {
        b.classList.remove("selected", "active");
        const img = b.querySelector('img');
        if (img) img.src = img.dataset.default;
      });
      
      button.classList.add("selected", "active");
      const buttonImg = button.querySelector('img');
      if (buttonImg) buttonImg.src = buttonImg.dataset.active;
      
      if (button.dataset.class.toLowerCase() === "random") {
        const classes = ["Light", "Medium", "Heavy"];
        const randomClass = classes[Math.floor(Math.random() * classes.length)];
        state.selectedClass = randomClass;
        console.log(`🎲 Randomly Chosen Class: ${randomClass}`);
        
        const randomSpins = Math.floor(Math.random() * 5) + 1;
        state.totalSpins = randomSpins;
        console.log(`🔄 Random Spins: ${randomSpins}`);
        
        classButtons.forEach((b) => {
          if (b.dataset.class.toLowerCase() === randomClass.toLowerCase()) {
            b.classList.add("selected");
            const img = b.querySelector('img');
            if (img) img.src = img.dataset.active;
          }
        });
        
        spinButtons.forEach((b) => {
          b.classList.toggle("selected", parseInt(b.dataset.spins) === randomSpins);
        });
        
        spinLoadout();
      } else {
        state.selectedClass = button.dataset.class;
        console.log(`✅ Selected Class Stored: ${state.selectedClass}`);
        
        if (spinSelection) {
          spinSelection.classList.remove("disabled");
        }
        
        spinButtons.forEach((btn) => {
          btn.disabled = false;
          btn.removeAttribute("disabled");
          btn.classList.remove("dimmed");
          btn.style.opacity = "";
          btn.style.pointerEvents = "";
        });
      }
    });
    
    button.addEventListener("mouseenter", () => {
      const img = button.querySelector('img');
      if (img) img.src = img.dataset.active;
    });
    
    button.addEventListener("mouseleave", () => {
      if (!button.classList.contains("selected")) {
        const img = button.querySelector('img');
        if (img) img.src = img.dataset.default;
      }
    });
  });
  
  // Initialize history
  loadHistory();
  
  // Clear history button
  document.getElementById("clear-history")?.addEventListener("click", () => {
    localStorage.removeItem("loadoutHistory");
    document.getElementById("history-list").innerHTML = "";
    console.log("🗑️ Loadout history cleared.");
  });
});

// Filter system setup (simplified version)
function setupFilterSystem() {
  console.log("🔍 Setting up filter system...");
  
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
        
        setTimeout(() => {
          filterPanel.style.display = "none";
          filterPanel.classList.remove("closing");
        }, 300);
      } else {
        filterPanel.style.display = "block";
        toggleIcon.textContent = "×";
        toggleIcon.classList.add("open");
        filterPanel.offsetHeight;
        filterPanel.classList.remove("closing");
      }
    });
  }
  
  // Tab switching
  const tabButtons = document.querySelectorAll(".tab-button");
  const tabContents = document.querySelectorAll(".tab-content");
  
  if (tabButtons.length > 0 && tabContents.length > 0) {
    tabButtons.forEach((button) => {
      button.addEventListener("click", () => {
        const tabName = button.getAttribute("data-tab");
        
        tabButtons.forEach((btn) => btn.classList.remove("active"));
        button.classList.add("active");
        
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
  }
  
  // Apply button
  const applyBtn = document.getElementById("apply-filters");
  if (applyBtn) {
    applyBtn.addEventListener("click", () => {
      if (state.isSpinning) return;
      
      state.gadgetQueue = {
        Light: [],
        Medium: [],
        Heavy: [],
      };
      
      if (filterPanel) {
        filterPanel.style.display = "none";
        if (toggleIcon) {
          toggleIcon.textContent = "+";
          toggleIcon.classList.remove("open");
        }
      }
      
      const filterStatus = document.createElement("div");
      filterStatus.className = "filter-status";
      filterStatus.textContent = "Filters applied!";
      document.body.appendChild(filterStatus);
      
      setTimeout(() => {
        if (filterStatus && filterStatus.parentNode) {
          filterStatus.parentNode.removeChild(filterStatus);
        }
      }, 2000);
    });
  }
}

function populateFilterItems() {
  console.log("🔄 Populating filter items...");
  
  // Placeholder function - the full implementation would populate the filter grids
  // For now, this prevents errors when the customize button is clicked
}

function setupSelectAllCheckboxes() {
  // Placeholder function for select all functionality
}