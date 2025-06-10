// Rage Quit Loadout Generator - Vegas Style Slot Machine with Handicap System
// Based on main page app.js but adapted for rage quit functionality

// Global state for rage quit simulator
const rageState = {
  selectedClass: null,
  isSpinning: false,
  currentSpin: 1,
  totalSpins: 0,
  selectedGadgets: new Set(),
  currentGadgetPool: new Set(),
  soundEnabled: localStorage.getItem('rageSoundEnabled') !== 'false',
  isMobile: /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth <= 768,
  selectedHandicap: null,
  selectedHandicapDesc: null,
  finalLoadout: null,
  handicapStack: [],
  sufferingLevel: 0
};

// Make state globally accessible
window.rageState = rageState;
window.state = rageState; // For compatibility

// Physics constants for Vegas-style animations (from main page)
const PHYSICS = {
  ACCELERATION: 8000,  // Dramatic start
  MAX_VELOCITY: 5000,  // High speed for blur effect
  DECELERATION: -3500, // Smooth deceleration
  BOUNCE_DAMPENING: 0.4, // Pronounced bounce
  ITEM_HEIGHT: 188,
  TIMING: {
    COLUMN_DELAY: 1000, // Delay between stops for drama
    BASE_DURATION: 4000, // Longer spin duration for suspense
    DECELERATION_TIME: 1800, // Extended deceleration phase
  },
};

// Rage Quit Loadouts - Only the worst items
const rageQuitLoadouts = {
  Light: {
    weapons: [
      "Throwing Knives", // Low damage, difficult to aim
      "V9S", // Low damage pistol
      "XP-54", // Challenging to use effectively
      "Dagger", // Melee only
      "Recurve Bow", // Slow and difficult
    ],
    specializations: ["Cloaking Device"], // Limited duration, situational
    gadgets: [
      "Breach Charge", // Situational, can self-damage
      "Thermal Bore", // Limited utility
      "Vanishing Bomb", // Confusing to use effectively
      "Glitch Grenade", // Situational
      "Tracking Dart", // Often doesn't help
      "Flashbang", // Can blind yourself
    ],
  },
  Medium: {
    weapons: [
      "Model 1887", // Slow reload, limited use
      "R.357", // Slow rate of fire, hard to use in close quarters
      "Riot Shield", // Limits mobility and offensive capability
      "Dual Blades", // Melee range limitation
      "CB-01 Repeater", // Generally considered weak
    ],
    specializations: ["Guardian Turret"], // Stationary, can be easily destroyed
    gadgets: [
      "APS Turret", // Stationary, limited coverage
      "Data Reshaper", // Limited functionality
      "Jump Pad", // Very situational
      "Zipline", // Limited use cases
      "Glitch Trap", // Situational
      "Proximity Sensor", // Often doesn't help in fast-paced combat
      "Smoke Grenade", // Can obscure your own vision
      "Flashbang", // Can blind yourself
      "Gas Mine", // Limited utility
    ],
  },
  Heavy: {
    weapons: [
      "KS-23", // Very slow reload
      "Spear", // Limited range and difficult to master
      "M60", // Slow and unwieldy
      "Sledgehammer", // Melee only
    ],
    specializations: [
      "Mesh Shield", // Blocks your own line of sight
      "Goo Gun", // Difficult to use effectively
    ],
    gadgets: [
      "Anti-Gravity Cube", // Difficult to use properly
      "Dome Shield", // Can trap yourself
      "Lockbolt Launcher", // Hard to use effectively
      "Pyro Mine", // Limited utility
      "Gas Grenade", // Can affect you too
      "C4", // Can self-damage
      "Proximity Sensor", // Often doesn't help
    ],
  },
};

// Helper functions
const getRandomUniqueItems = (array, n) => {
  const shuffled = [...array].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, n);
};

const getUniqueGadgets = (classType, loadout) => {
  console.log(`🔍 Selecting unique gadgets for ${classType}`);
  
  const cleanedGadgets = [...new Set(loadout.gadgets)];
  
  if (cleanedGadgets.length < 3) {
    console.error(`❌ Not enough unique gadgets for ${classType}!`);
    return cleanedGadgets;
  }
  
  // Fisher-Yates shuffle for true randomness
  const shuffledGadgets = [...cleanedGadgets];
  for (let i = shuffledGadgets.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffledGadgets[i], shuffledGadgets[j]] = [shuffledGadgets[j], shuffledGadgets[i]];
  }
  
  const selectedGadgets = shuffledGadgets.slice(0, 3);
  console.log(`✅ Selected gadgets:`, selectedGadgets);
  
  return selectedGadgets;
};

function createItemContainer(items, winningItem = null, isGadget = false) {
  if (isGadget) {
    console.log(`🎰 Creating gadget container with winner: "${items[0]}"`);
    return items
      .map(
        (item, index) => `
        <div class="itemCol ${index === 0 ? "winner" : ""}" data-item-name="${item}">
          <img src="images/${item.replace(/ /g, "_")}.webp" alt="${item}" onerror="this.src='images/placeholder.webp'">
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
        <img src="images/${item.replace(/ /g, "_")}.webp" alt="${item}" onerror="this.src='images/placeholder.webp'">
        <p>${item}</p>
      </div>
    `
    )
    .join("");
}

// SlotColumn class for Vegas-style animation (adapted from main page)
class SlotColumn {
  constructor(element, index) {
    this.element = element;
    this.index = index;
    this.velocity = 0;
    this.position = 0;
    this.state = "waiting";
    this.lastTimestamp = null;
    this.animationStartTime = null;
    this.maxAnimationDuration = 10000;
    this.onStop = null;

    this.stopDelay = PHYSICS.TIMING.COLUMN_DELAY * index;
    this.totalDuration = PHYSICS.TIMING.BASE_DURATION + this.stopDelay;
    this.decelerationTime = PHYSICS.TIMING.DECELERATION_TIME;

    this.targetPosition = 0;
    this.initialPosition = 0;
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

    const dt = Math.min(deltaTime, 50) / 1000;

    switch (this.state) {
      case "accelerating":
        this.velocity += PHYSICS.ACCELERATION * dt;
        if (this.velocity >= PHYSICS.MAX_VELOCITY) {
          this.velocity = PHYSICS.MAX_VELOCITY;
          this.state = "spinning";
        }
        break;

      case "spinning":
        if (elapsed >= this.totalDuration - this.decelerationTime) {
          this.state = "decelerating";
          this.targetPosition =
            Math.ceil(this.position / PHYSICS.ITEM_HEIGHT) *
            PHYSICS.ITEM_HEIGHT;
        }
        break;

      case "decelerating":
        this.velocity += PHYSICS.DECELERATION * dt;

        if (
          Math.abs(this.position - this.targetPosition) < 1 &&
          Math.abs(this.velocity) < 50
        ) {
          this.forceStop();
          return;
        }

        if (this.velocity <= 0) {
          if (Math.abs(this.velocity) < 100) {
            this.forceStop();
          } else {
            this.velocity = -this.velocity * PHYSICS.BOUNCE_DAMPENING;
            this.state = "bouncing";
          }
        }
        break;

      case "bouncing":
        this.velocity += PHYSICS.DECELERATION * 1.2 * dt;

        if (
          Math.abs(this.velocity) < 50 ||
          Math.abs(this.position - this.targetPosition) < 5
        ) {
          this.forceStop();
          return;
        }
        break;
    }

    this.position += this.velocity * dt;
    this.position = this.normalizePosition(this.position);
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
    this.updateVisuals();

    if (this.onStop && typeof this.onStop === "function") {
      this.onStop(this.element);
    }
  }

  updateVisuals() {
    let blur = 0;
    if (Math.abs(this.velocity) > 3000) blur = 12;
    else if (Math.abs(this.velocity) > 2000) blur = 8;
    else if (Math.abs(this.velocity) > 1000) blur = 5;

    this.element.style.transform = `translateY(${this.position}px)`;
    this.element.style.filter = blur > 0 ? `blur(${blur}px)` : "none";
  }
}

// Display rage quit loadout
const displayRageQuitLoadout = () => {
  const outputDiv = document.getElementById("output");
  const classes = ["Light", "Medium", "Heavy"];
  const selectedClass = classes[Math.floor(Math.random() * classes.length)];

  // Store the selected class
  rageState.selectedClass = selectedClass;

  // Update the selected class text in the UI
  const selectedClassElement = document.getElementById("selected-class");
  if (selectedClassElement) {
    selectedClassElement.innerText = selectedClass;
  }

  // Get class-specific loadouts
  const classLoadout = rageQuitLoadouts[selectedClass];
  
  // Select items
  const selectedWeapon = getRandomUniqueItems(classLoadout.weapons, 1)[0];
  const selectedSpec = getRandomUniqueItems(classLoadout.specializations, 1)[0];
  const selectedGadgets = getUniqueGadgets(selectedClass, classLoadout);

  // Store the final loadout BEFORE the spin animation starts
  rageState.finalLoadout = {
    classType: selectedClass,
    weapon: selectedWeapon,
    specialization: selectedSpec,
    gadgets: selectedGadgets,
  };

  console.log("🎯 Final loadout stored:", rageState.finalLoadout);

  // Build the slot machine UI
  const loadoutHTML = `
    <div class="slot-machine-wrapper">
      <div class="items-container">
        <div class="item-container">
          <div class="scroll-container">
            ${createItemContainer(classLoadout.weapons, selectedWeapon)}
          </div>
        </div>
        <div class="item-container">
          <div class="scroll-container">
            ${createItemContainer(classLoadout.specializations, selectedSpec)}
          </div>
        </div>
        ${selectedGadgets
          .map(
            (gadget, index) => `
            <div class="item-container">
              <div class="scroll-container" data-gadget-index="${index}">
                ${createItemContainer([gadget, ...classLoadout.gadgets.filter(g => g !== gadget)], gadget, true)}
              </div>
            </div>
          `
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

// Start spin animation
function startSpinAnimation(columns) {
  const startTime = performance.now();

  const slotColumns = columns.map((element, index) => {
    const column = new SlotColumn(element, index);

    // Add the onStop callback for flash effects
    column.onStop = (columnElement) => {
      const container = columnElement.closest(".item-container");
      if (container) {
        // Apply initial flash effect
        container.classList.remove("final-flash");
        void container.offsetWidth;
        container.classList.add("final-flash");

        // Add locked in tag with animation
        if (!container.querySelector(".locked-tag")) {
          const lockedTag = document.createElement("div");
          lockedTag.className = "locked-tag";
          lockedTag.textContent = "LOCKED IN!";
          container.appendChild(lockedTag);

          setTimeout(() => {
            lockedTag.classList.add("show");
          }, 150);
        }

        // Transition from flash to pulse effect
        setTimeout(() => {
          container.classList.remove("final-flash");
          container.classList.add("winner-pulsate");
        }, 500);
      }
    };

    return column;
  });

  // Reset columns - remove all animations
  columns.forEach((column) => {
    const container = column.closest(".item-container");
    if (container) {
      container.classList.remove(
        "landing-flash",
        "winner-pulsate",
        "final-flash"
      );

      const existingTag = container.querySelector(".locked-tag");
      if (existingTag) {
        existingTag.remove();
      }
    }
    column.style.transform = "translateY(0)";
    column.style.transition = "none";
  });

  slotColumns.forEach((column) => (column.state = "accelerating"));

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
      // When all columns are stopped, trigger the victory flash and finalize spin
      finalVictoryFlash(columns);
      setTimeout(() => {
        finalizeSpin();
      }, 1000);
    }
  }

  requestAnimationFrame(animate);
}

// Enhanced final victory flash for rage quit
function finalVictoryFlash(columns) {
  setTimeout(() => {
    const allContainers = columns.map((col) => col.closest(".item-container"));

    // FIRST WAVE: Rapid mega flashes
    allContainers.forEach((container, index) => {
      setTimeout(() => {
        container.classList.remove("mega-flash", "ultra-flash");
        void container.offsetWidth;
        container.classList.add("mega-flash");
        container.style.animation = "rapidPulse 0.1s ease-in-out 3";
      }, index * 100);
    });

    // SECOND WAVE: Ultra flash after mega flash
    setTimeout(() => {
      allContainers.forEach((container, index) => {
        setTimeout(() => {
          container.classList.add("ultra-flash");
          createExplosiveParticles(container);
        }, index * 50);
      });
    }, 500);

    // FINAL EXPLOSION: All containers flash together
    setTimeout(() => {
      createScreenFlash();
      
      allContainers.forEach((container) => {
        container.style.animation = "explosiveFlash 0.3s ease-out, superPulse 0.2s ease-in-out 5";
        container.style.boxShadow = "0 0 100px rgba(255, 215, 0, 1), 0 0 200px rgba(255, 140, 0, 0.8)";
      });
      
      document.body.style.animation = "victoryShake 0.5s ease-in-out";
      setTimeout(() => {
        document.body.style.animation = "";
      }, 500);
      
    }, 1000);

    // CLEANUP
    setTimeout(() => {
      allContainers.forEach((container) => {
        container.style.animation = "";
        container.classList.remove("mega-flash", "ultra-flash");
      });
    }, 2000);

  }, 400);
}

// Create explosive particle effect
function createExplosiveParticles(container) {
  const rect = container.getBoundingClientRect();
  const centerX = rect.left + rect.width / 2;
  const centerY = rect.top + rect.height / 2;

  for (let i = 0; i < 12; i++) {
    const particle = document.createElement("div");
    particle.style.cssText = `
      position: fixed;
      width: 8px;
      height: 8px;
      background: linear-gradient(45deg, #ffb700, #ff7b00);
      border-radius: 50%;
      pointer-events: none;
      z-index: 1000;
      left: ${centerX}px;
      top: ${centerY}px;
      box-shadow: 0 0 10px rgba(255, 183, 0, 0.8);
    `;

    const angle = (Math.PI * 2 * i) / 12;
    const distance = 150 + Math.random() * 100;
    const targetX = centerX + Math.cos(angle) * distance;
    const targetY = centerY + Math.sin(angle) * distance;

    document.body.appendChild(particle);

    particle.animate([
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

    setTimeout(() => {
      if (particle.parentNode) {
        particle.parentNode.removeChild(particle);
      }
    }, 800);
  }
}

// Create screen flash effect
function createScreenFlash() {
  const flashOverlay = document.createElement("div");
  flashOverlay.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background: radial-gradient(circle, rgba(255, 215, 0, 0.8) 0%, rgba(255, 140, 0, 0.4) 50%, transparent 100%);
    pointer-events: none;
    z-index: 9999;
  `;

  document.body.appendChild(flashOverlay);

  flashOverlay.animate([
    { opacity: 0 },
    { opacity: 1 },
    { opacity: 0 }
  ], {
    duration: 400,
    easing: 'ease-out'
  });

  setTimeout(() => {
    if (flashOverlay.parentNode) {
      flashOverlay.parentNode.removeChild(flashOverlay);
    }
  }, 400);
}

// Finalize spin - record results and add to history
function finalizeSpin() {
  console.log("🎯 Finalizing spin with stored loadout:", rageState.finalLoadout);

  if (!rageState.finalLoadout) {
    console.error("❌ No final loadout stored!");
    return;
  }

  const { classType, weapon, specialization, gadgets } = rageState.finalLoadout;
  const handicapName = rageState.selectedHandicap || "None";
  const handicapDesc = rageState.selectedHandicapDesc || "No handicap selected";

  // Add to history
  addToRageHistory(classType, weapon, specialization, gadgets, handicapName, handicapDesc);

  // Display the selected handicap
  displaySelectedHandicap();
  
  // Reset state and re-enable button
  setTimeout(() => {
    resetSpinState();
    showDoubleOrNothingOption();
  }, 1000);
}

// Display selected handicap
function displaySelectedHandicap() {
  const handicapContainer = document.getElementById("handicap-container");
  
  if (!handicapContainer) {
    console.error("Handicap container not found");
    return;
  }

  const selectedHandicap = rageState.selectedHandicap;
  const selectedHandicapDesc = rageState.selectedHandicapDesc;
  
  if (selectedHandicap) {
    const handicapHTML = `
      <div class="handicap-display">
        <h3>💀 ACTIVE HANDICAP 💀</h3>
        <div class="handicap-name">${selectedHandicap}</div>
        <div class="handicap-desc">${selectedHandicapDesc}</div>
      </div>
    `;
    handicapContainer.innerHTML = handicapHTML;
    
    setTimeout(() => {
      handicapContainer.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }, 500);
  }
}

// Reset spin state
function resetSpinState() {
  console.log("🔄 Resetting spin state");
  
  const spinButton = document.getElementById("rage-quit-btn");
  if (spinButton) {
    spinButton.removeAttribute("disabled");
    spinButton.classList.remove('spinning', 'disabled');
    spinButton.disabled = false;
    console.log("✅ Button re-enabled");
  }
  
  rageState.isSpinning = false;
  if (window.rageRouletteSystem) {
    window.rageRouletteSystem.animating = false;
  }
  
  document.querySelectorAll('.item-container').forEach(container => {
    container.classList.remove('mega-flash', 'spinning');
  });
  
  console.log("✅ State reset complete - ready for next spin");
}

// Show Double or Nothing option
function showDoubleOrNothingOption() {
  const container = document.getElementById('double-or-nothing-container');
  if (container) {
    container.style.display = 'block';
    setTimeout(() => {
      container.style.display = 'none';
    }, 30000);
  }
}

// Spin rage quit loadout - main entry point
const spinRageQuitLoadout = () => {
  if (rageState.isSpinning) return;

  const spinButton = document.getElementById("rage-quit-btn");
  if (spinButton) {
    spinButton.setAttribute("disabled", "true");
    spinButton.classList.add('disabled');
  }

  rageState.isSpinning = true;
  rageState.currentGadgetPool.clear();
  
  // Clear previous handicap stack for new game
  if (!document.getElementById('double-or-nothing-container')?.style.display || 
      document.getElementById('double-or-nothing-container')?.style.display === 'none') {
    rageState.handicapStack = [];
    rageState.sufferingLevel = 0;
  }

  displayRageQuitLoadout();
};

// Make globally available
window.spinRageQuitLoadout = spinRageQuitLoadout;

// History functions will be added next...