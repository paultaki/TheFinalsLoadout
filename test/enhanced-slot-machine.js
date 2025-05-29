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

// Sound effects
const SOUNDS = {
  spin: new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUarm7blmFgU7k9n1unEiBC13yO/eizEIHWq+8+OWT') // Placeholder for spin sound
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
      "M134 Minigun", "M32GL", "SA 1216", "Sledgehammer", "SHAK-50", "Spear"
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
    <div class="itemCol ${index === 7 ? "winner" : ""}" data-item="${item}">
      <div class="item-inner">
        <img src="images/${item.replace(/ /g, "_")}.webp" alt="${item}">
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
          const currentOffset = this.position % (PHYSICS.ITEM_HEIGHT * 12);
          this.targetPosition = this.position - currentOffset + (PHYSICS.ITEM_HEIGHT * 7);
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

    this.element.style.transform = `translate(${shakeX}px, ${this.position}px) scale(${scale})`;
    this.element.style.filter = blur > 0 ? `blur(${blur}px)` : "none";
  }

  forceStop() {
    this.velocity = 0;
    this.position = this.targetPosition;
    this.state = "stopped";
    this.updateVisuals();
  }
}

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

  setTimeout(() => {
    const scrollContainers = Array.from(document.querySelectorAll(".scroll-container"));
    startEnhancedSpinAnimation(scrollContainers);
  }, 100);
};

// Enhanced spin animation with Vegas effects
function startEnhancedSpinAnimation(columns) {
  const isFinalSpin = state.currentSpin === 1;
  const startTime = performance.now();
  
  // Play spin sound if enabled
  if (state.audioEnabled && SOUNDS.spin) {
    SOUNDS.spin.play().catch(() => {});
  }
  
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
    
    // Flash winning items
    columns.forEach((column, index) => {
      setTimeout(() => {
        const container = column.closest(".item-container");
        container.classList.add("winner-flash");
        
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
  }
  
  setTimeout(() => finalizeSpin(columns), isFinalSpin ? 1500 : 300);
}

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
    
    .item-container.reel {
      position: relative;
      background: #0a0a1e;
      border-radius: 10px;
      box-shadow: 
        inset 0 0 30px rgba(0,0,0,0.8),
        0 0 20px rgba(255,184,0,0.1);
      overflow: hidden;
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
    
    .item-inner {
      padding: 10px;
      text-align: center;
    }
    
    .itemCol {
      height: ${PHYSICS.ITEM_HEIGHT}px;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: transform 0.1s;
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

// Update finalizeSpin to work with the new system
function finalizeSpin(columns) {
  if (state.currentSpin > 1) {
    state.currentSpin--;
    updateSpinCountdown(state.currentSpin);
    state.isSpinning = false;
    
    setTimeout(() => {
      if (state.selectedClass === "random") {
        displayRandomLoadout();
      } else {
        displayLoadout(state.selectedClass);
      }
    }, 500);
    return;
  }

  state.isSpinning = false;
  
  // Re-enable class buttons
  classButtons.forEach((button) => {
    button.removeAttribute("disabled");
  });
  
  // Record in history
  const itemContainers = document.querySelectorAll(".slot-machine-wrapper .items-container .item-container");
  
  if (itemContainers && itemContainers.length > 0) {
    const selectedItems = Array.from(itemContainers).map((container) => {
      const winnerItem = container.querySelector('.itemCol.winner');
      if (!winnerItem) return "Unknown";
      
      const itemText = winnerItem.querySelector('p')?.innerText.trim();
      return itemText || "Unknown";
    });
    
    if (selectedItems.length >= 5 && !selectedItems.includes("Unknown")) {
      const weapon = selectedItems[0];
      const specialization = selectedItems[1];
      const gadgets = selectedItems.slice(2, 5);
      
      let classType = state.selectedClass;
      if (classType === "random") {
        // Determine actual class from weapon
        for (const [cls, data] of Object.entries(loadouts)) {
          if (data.weapons.includes(weapon)) {
            classType = cls;
            break;
          }
        }
      }
      
      addToHistory(classType, weapon, specialization, gadgets);
    }
  }
  
  state.selectedClass = null;
}

// Keep all other functions from the original (displayRandomLoadout, updateSpinCountdown, etc.)
const displayRandomLoadout = () => {
  const classes = ["Light", "Medium", "Heavy"];
  const randomClass = classes[Math.floor(Math.random() * classes.length)];
  displayLoadout(randomClass);
};

function updateSpinCountdown(spinsRemaining) {
  const spinButtons = document.querySelectorAll(".spin-button");
  
  spinButtons.forEach((button) => {
    const spinValue = parseInt(button.dataset.spins);
    button.classList.remove("active", "selected");
    
    if (spinValue === spinsRemaining) {
      button.classList.add("active", "selected");
    }
  });
}

const spinLoadout = () => {
  if (state.isSpinning || !state.selectedClass) return;
  
  state.isSpinning = true;
  state.currentSpin = state.totalSpins;
  
  document.querySelectorAll(".class-button").forEach((btn) => {
    btn.setAttribute("disabled", "true");
  });
  
  document.getElementById("output").scrollIntoView({
    behavior: "smooth",
    block: "center",
  });
  
  updateSpinCountdown(state.currentSpin);
  
  if (state.selectedClass === "random") {
    displayRandomLoadout();
  } else {
    displayLoadout(state.selectedClass);
  }
};

// Include all the history, filter, and initialization functions from the original
function addToHistory(classType, selectedWeapon, selectedSpec, selectedGadgets) {
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
    entry.classList.add("history-entry");
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

// Initialize everything when DOM is ready
document.addEventListener("DOMContentLoaded", () => {
  // Get DOM elements
  classButtons = document.querySelectorAll(".class-button");
  spinButtons = document.querySelectorAll(".spin-button");
  spinSelection = document.getElementById("spinSelection");
  outputDiv = document.getElementById("output");

  // Setup filter system
  setupFilterSystem();
  populateFilterItems();
  setupSelectAllCheckboxes();

  // Class button event listeners
  classButtons.forEach((button) => {
    button.addEventListener("click", () => {
      if (state.isSpinning) return;

      classButtons.forEach((b) => {
        b.classList.remove("selected", "active");
        b.src = b.dataset.default;
      });

      button.classList.add("selected", "active");
      button.src = button.dataset.active;

      if (button.dataset.class.toLowerCase() === "random") {
        const classes = ["Light", "Medium", "Heavy"];
        const randomClass = classes[Math.floor(Math.random() * classes.length)];
        state.selectedClass = randomClass;
        
        const randomSpins = Math.floor(Math.random() * 5) + 1;
        state.totalSpins = randomSpins;
        
        classButtons.forEach((b) => {
          if (b.dataset.class.toLowerCase() === randomClass.toLowerCase()) {
            b.classList.add("selected");
            b.src = b.dataset.active;
          }
        });
        
        spinButtons.forEach((b) => {
          b.classList.toggle("selected", parseInt(b.dataset.spins) === randomSpins);
        });
        
        spinLoadout();
      } else {
        state.selectedClass = button.dataset.class;
        
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
      button.src = button.dataset.active;
    });

    button.addEventListener("mouseleave", () => {
      if (!button.classList.contains("selected")) {
        button.src = button.dataset.default;
      }
    });
  });

  // Spin button logic
  spinButtons.forEach((button) => {
    button.addEventListener("click", () => {
      if (button.disabled || state.isSpinning) return;
      
      state.totalSpins = parseInt(button.dataset.spins);
      
      spinButtons.forEach((btn) => btn.classList.remove("selected", "active"));
      button.classList.add("selected", "active");
      
      spinLoadout();
    });
  });

  // Initialize history
  loadHistory();

  // Clear history button
  document.getElementById("clear-history")?.addEventListener("click", () => {
    localStorage.removeItem("loadoutHistory");
    document.getElementById("history-list").innerHTML = "";
  });
});

// Include all filter setup functions from original
function setupFilterSystem() {
  const toggleBtn = document.getElementById("toggle-filters");
  const filterPanel = document.getElementById("filter-panel");
  const toggleIcon = document.querySelector(".toggle-icon");

  if (toggleBtn && filterPanel) {
    toggleBtn.addEventListener("click", () => {
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

  // Class filter buttons
  const classFilters = document.querySelectorAll(".class-filter");
  const itemCategories = document.querySelectorAll(".item-category");

  classFilters.forEach((filter) => {
    filter.addEventListener("click", () => {
      const selectedClass = filter.getAttribute("data-class");

      classFilters.forEach((btn) => btn.classList.remove("active"));
      filter.classList.add("active");

      itemCategories.forEach((category) => {
        if (selectedClass === "all" || category.classList.contains(`${selectedClass}-category`)) {
          category.style.display = "block";
        } else {
          category.style.display = "none";
        }
      });
    });
  });

  // Category expand/collapse
  const categoryHeaders = document.querySelectorAll(".category-header");

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

  // Search functionality
  const searchInput = document.getElementById("filter-search");

  if (searchInput) {
    searchInput.addEventListener("input", () => {
      const searchTerm = searchInput.value.toLowerCase();
      const allItems = document.querySelectorAll(".item-checkbox");

      allItems.forEach((item) => {
        const itemName = item.querySelector("span")?.textContent.toLowerCase() || "";
        if (itemName.includes(searchTerm)) {
          item.style.display = "flex";
        } else {
          item.style.display = "none";
        }
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
  const lightWeaponsGrid = document.getElementById("light-weapons-grid");
  const mediumWeaponsGrid = document.getElementById("medium-weapons-grid");
  const heavyWeaponsGrid = document.getElementById("heavy-weapons-grid");
  
  const lightSpecsGrid = document.getElementById("light-specializations-grid");
  const mediumSpecsGrid = document.getElementById("medium-specializations-grid");
  const heavySpecsGrid = document.getElementById("heavy-specializations-grid");
  
  const lightGadgetsGrid = document.getElementById("light-gadgets-grid");
  const mediumGadgetsGrid = document.getElementById("medium-gadgets-grid");
  const heavyGadgetsGrid = document.getElementById("heavy-gadgets-grid");

  // Clear existing
  [lightWeaponsGrid, mediumWeaponsGrid, heavyWeaponsGrid,
   lightSpecsGrid, mediumSpecsGrid, heavySpecsGrid,
   lightGadgetsGrid, mediumGadgetsGrid, heavyGadgetsGrid].forEach(grid => {
    if (grid) grid.innerHTML = "";
  });

  // Populate items
  populateItemGrid(lightWeaponsGrid, loadouts.Light.weapons, "weapon", "light", "Light Weapons");
  populateItemGrid(mediumWeaponsGrid, loadouts.Medium.weapons, "weapon", "medium", "Medium Weapons");
  populateItemGrid(heavyWeaponsGrid, loadouts.Heavy.weapons, "weapon", "heavy", "Heavy Weapons");
  
  populateItemGrid(lightSpecsGrid, loadouts.Light.specializations, "specialization", "light", "Light Specializations");
  populateItemGrid(mediumSpecsGrid, loadouts.Medium.specializations, "specialization", "medium", "Medium Specializations");
  populateItemGrid(heavySpecsGrid, loadouts.Heavy.specializations, "specialization", "heavy", "Heavy Specializations");
  
  populateItemGrid(lightGadgetsGrid, loadouts.Light.gadgets, "gadget", "light", "Light Gadgets");
  populateItemGrid(mediumGadgetsGrid, loadouts.Medium.gadgets, "gadget", "medium", "Medium Gadgets");
  populateItemGrid(heavyGadgetsGrid, loadouts.Heavy.gadgets, "gadget", "heavy", "Heavy Gadgets");

  setupSelectAllCheckboxes();
  setupTabSearchPlaceholder();
}

function populateItemGrid(gridElement, items, type, classType, labelText) {
  if (!gridElement || !items || items.length === 0) return;
  
  // Add Select All
  const selectAllItem = document.createElement("label");
  selectAllItem.className = "item-checkbox select-all-checkbox";
  selectAllItem.innerHTML = `
    <input type="checkbox" checked data-type="${type}-selectall" data-class="${classType}">
    <span><strong>Select All ${labelText}</strong></span>
  `;
  gridElement.appendChild(selectAllItem);
  
  // Add items
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

function setupTabSearchPlaceholder() {
  const searchInput = document.getElementById("filter-search");
  const tabButtons = document.querySelectorAll(".tab-button");
  
  if (!searchInput || tabButtons.length === 0) return;
  
  searchInput.placeholder = "Search weapons...";
  
  tabButtons.forEach(button => {
    button.addEventListener("click", () => {
      const tabName = button.getAttribute("data-tab");
      searchInput.placeholder = `Search ${tabName}...`;
    });
  });
}

function setupSelectAllCheckboxes() {
  const selectAllCheckboxes = document.querySelectorAll('input[data-type$="selectall"]');
  
  selectAllCheckboxes.forEach((checkbox) => {
    checkbox.addEventListener("change", function () {
      const classType = this.dataset.class;
      const selectType = this.dataset.type.replace("-selectall", "");
      const isChecked = this.checked;
      
      const typeCheckboxes = document.querySelectorAll(
        `input[data-type="${selectType}"][data-class="${classType}"]`
      );
      
      typeCheckboxes.forEach((itemCheckbox) => {
        itemCheckbox.checked = isChecked;
      });
    });
  });
  
  const typeCheckboxes = document.querySelectorAll(
    'input[data-type="weapon"], input[data-type="specialization"], input[data-type="gadget"]'
  );

  typeCheckboxes.forEach((checkbox) => {
    checkbox.addEventListener("change", function () {
      const classType = this.dataset.class;
      const selectType = this.dataset.type;
      
      const allTypeCheckboxes = document.querySelectorAll(
        `input[data-type="${selectType}"][data-class="${classType}"]`
      );
      
      const allChecked = Array.from(allTypeCheckboxes).every((cb) => cb.checked);
      
      const selectAllCheckbox = document.querySelector(
        `input[data-type="${selectType}-selectall"][data-class="${classType}"]`
      );
      
      if (selectAllCheckbox) {
        selectAllCheckbox.checked = allChecked;
      }
    });
  });
}