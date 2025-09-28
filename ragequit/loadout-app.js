// Rage Quit Loadout Generator - Bulletproof Edition
console.log("🚀 RAGE QUIT: loadout-app.js loading on live site...");

// Global state - available IMMEDIATELY
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
  sufferingLevel: 0,
  sufferingStreak: parseInt(localStorage.getItem('rageSufferingStreak')) || 0,
  aiRoast: null
};

// Make state globally accessible IMMEDIATELY
window.rageState = rageState;
window.state = rageState; // For compatibility
console.log("✅ RAGE QUIT: window.rageState initialized");


// Rage Quit Loadouts – Season 7 (worst‑of‑the‑worst)
const rageQuitLoadouts = {
  Light: {
    // weapons that struggle to secure TTK and have very low usage
    weapons: [
      "Recurve Bow",
      "M26 Matter",
      "Dagger",
      "Throwing Knives"
    ],
    // only “bad” option left after Dash & Grapple
    specializations: ["Cloaking Device"],      // B‑tier but still the least effective of the three
    // all C‑, D‑ or E‑tier gadgets
    gadgets: [
      "Gravity Vortex",
      "Tracking Dart",
      "Smoke Grenade",
      "Flashbang",
      "Nullifier",
      "Breach Charge"
    ]
  },

  Medium: {
    weapons: [
      "CL-40",
      "Dual Blades",
      "Riot Shield",
      "R.357",
      "Model 1887"
    ],
    specializations: ["Guardian Turret"],       // least impact after Demat & Beam
    gadgets: [
      "Glitch Trap",
      "Proximity Sensor",
      "Smoke Grenade",
      "Data Reshaper",
      "Breach Drill"
    ]
  },

  Heavy: {
    weapons: [
      "MGL32",
      "KS-23",
      "Lewis Gun",
      "SA1216"
    ],
    specializations: ["Goo Gun", "Mesh Shield"],
    gadgets: [
      "Anti-Gravity Cube",
      "Gas Grenade",
      "Flashbang",
      "Explosive Mine",
      "Smoke Grenade"
    ]
  }
};



// Physics constants
const PHYSICS = {
  ACCELERATION: 8000,
  MAX_VELOCITY: 5000,
  DECELERATION: -3500,
  BOUNCE_DAMPENING: 0.4,
  ITEM_HEIGHT: 188,
  TIMING: {
    COLUMN_DELAY: 1000,
    BASE_DURATION: 4000,
    DECELERATION_TIME: 1800,
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

  const shuffledGadgets = [...cleanedGadgets];
  for (let i = shuffledGadgets.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffledGadgets[i], shuffledGadgets[j]] = [shuffledGadgets[j], shuffledGadgets[i]];
  }

  const selectedGadgets = shuffledGadgets.slice(0, 3);
  console.log(`✅ Selected gadgets:`, selectedGadgets);
  return selectedGadgets;
};

// SlotColumn class for animations
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
    try {
      if (!this.animationStartTime) {
        this.animationStartTime = performance.now();
      } else if (performance.now() - this.animationStartTime > this.maxAnimationDuration) {
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
            const itemsCount = this.element.querySelectorAll('.itemCol').length;
            this.targetPosition = itemsCount === 1 ? 0 : 4 * PHYSICS.ITEM_HEIGHT;
          }
          break;

        case "decelerating":
          this.velocity += PHYSICS.DECELERATION * dt;
          if (Math.abs(this.position - this.targetPosition) < 1 && Math.abs(this.velocity) < 50) {
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
          if (Math.abs(this.velocity) < 50 || Math.abs(this.position - this.targetPosition) < 5) {
            this.forceStop();
            return;
          }
          break;
      }

      if (!isNaN(this.velocity) && !isNaN(dt)) {
        this.position += this.velocity * dt;
        this.position = this.normalizePosition(this.position);
        this.updateVisuals();
      } else {
        console.error('Invalid velocity or dt:', { velocity: this.velocity, dt });
        this.forceStop();
      }
    } catch (error) {
      console.error('SlotColumn update error:', error);
      try {
        this.forceStop();
      } catch (stopError) {
        console.error('Force stop error:', stopError);
        this.state = "stopped";
      }
    }
  }

  normalizePosition(pos) {
    const wrappedPosition = pos % PHYSICS.ITEM_HEIGHT;
    return wrappedPosition >= 0 ? wrappedPosition : wrappedPosition + PHYSICS.ITEM_HEIGHT;
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

// Main spin function
const spinRageQuitLoadout = () => {
  console.log("🎰 spinRageQuitLoadout called!");

  if (rageState.isSpinning) {
    console.log("⚠️ Already spinning, ignoring");
    return;
  }

  const spinButton = document.getElementById("rage-quit-btn");
  if (spinButton) {
    spinButton.disabled = true;
    spinButton.classList.add('disabled', 'spinning');
  }

  rageState.isSpinning = true;
  rageState.currentGadgetPool.clear();

  if (!document.getElementById('double-or-nothing-container')?.style.display ||
      document.getElementById('double-or-nothing-container')?.style.display === 'none') {
    rageState.handicapStack = [];
    rageState.sufferingLevel = 0;
  }

  displayRageQuitLoadout();
};

// Display the loadout
const displayRageQuitLoadout = () => {
  const slotMachineSection = document.querySelector('.slot-machine-section');
  const handicapSection = document.querySelector('.handicap-section');
  const heroSection = document.querySelector('.hero');

  if (slotMachineSection) {
    slotMachineSection.classList.add('centered');
  }
  if (handicapSection) {
    handicapSection.style.display = 'block';
  }
  if (heroSection) {
    heroSection.style.opacity = '0.3';
  }

  const outputDiv = document.getElementById("output");

  let selectedClass = rageState.selectedClass;
  if (!selectedClass) {
    const availableClasses = getAvailableClasses();
    selectedClass = availableClasses.length === 0
      ? ["Light", "Medium", "Heavy"][Math.floor(Math.random() * 3)]
      : availableClasses[Math.floor(Math.random() * availableClasses.length)];
    rageState.selectedClass = selectedClass;
  }

  console.log(`🎯 Using selected class: ${selectedClass}`);

  const selectedClassElement = document.getElementById("selected-class");
  const selectedClassContainer = document.getElementById("selected-class-container");
  if (selectedClassElement) selectedClassElement.innerText = selectedClass;
  if (selectedClassContainer) selectedClassContainer.style.display = "block";

  const classLoadout = rageQuitLoadouts[selectedClass];
  const selectedWeapon = getRandomUniqueItems(classLoadout.weapons, 1)[0];
  const selectedSpec = getRandomUniqueItems(classLoadout.specializations, 1)[0];
  const selectedGadgets = getUniqueGadgets(selectedClass, classLoadout);

  rageState.finalLoadout = {
    classType: selectedClass,
    weapon: selectedWeapon,
    specialization: selectedSpec,
    gadgets: selectedGadgets,
  };

  const loadoutHTML = `
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
      ${selectedGadgets.map((gadget, index) => `
        <div class="item-container">
          <div class="scroll-container" data-gadget-index="${index}">
            ${createItemContainer([gadget, ...classLoadout.gadgets.filter(g => g !== gadget)], gadget, true)}
          </div>
        </div>
      `).join("")}
    </div>
  `;

  outputDiv.innerHTML = loadoutHTML;

  setTimeout(() => {
    const scrollContainers = Array.from(document.querySelectorAll(".scroll-container"));
    startSpinAnimation(scrollContainers);
  }, 50);
};

// Create item container HTML
function createItemContainer(items, winningItem = null, isGadget = false) {
  if (isGadget) {
    return items.map((item, index) => `
      <div class="itemCol ${index === 0 ? "winner" : ""}" data-item-name="${item}">
        <img src="../images/${item.replace(/ /g, "_")}.webp" alt="${item}" onerror="this.src='../images/placeholder.webp'">
        <p>${item}</p>
      </div>
    `).join("");
  }

  winningItem = winningItem || items[Math.floor(Math.random() * items.length)];
  let repeatedItems = items.filter((item) => item !== winningItem).sort(() => Math.random() - 0.5).slice(0, 7);
  repeatedItems = [...repeatedItems.slice(0, 4), winningItem, ...repeatedItems.slice(4)];

  while (repeatedItems.length < 8) {
    const randomItem = items[Math.floor(Math.random() * items.length)];
    repeatedItems.push(randomItem);
  }

  return repeatedItems.map((item, index) => `
    <div class="itemCol ${index === 4 ? "winner" : ""}" data-item-name="${item}">
      <img src="../images/${item.replace(/ /g, "_")}.webp" alt="${item}" onerror="this.src='../images/placeholder.webp'">
      <p>${item}</p>
    </div>
  `).join("");
}

// Start animation
function startSpinAnimation(columns) {
  const startTime = performance.now();

  // Play spinning start sound
  const spinStartSound = document.getElementById("spinStart");
  if (spinStartSound && localStorage.getItem('rageSoundEnabled') !== 'false') {
    spinStartSound.currentTime = 0;
    spinStartSound.volume = 0.3;
    spinStartSound.play().catch(() => {});
  }

  // Play continuous spinning sound
  const spinningSound = document.getElementById("spinningSound");
  if (spinningSound && localStorage.getItem('rageSoundEnabled') !== 'false') {
    spinningSound.currentTime = 0;
    spinningSound.volume = 0.2;
    spinningSound.loop = true;
    spinningSound.play().catch(() => {});
  }

  const slotColumns = columns.map((element, index) => {
    const column = new SlotColumn(element, index);
    column.onStop = (columnElement) => {
      // Play column stop sound
      const columnStopSound = document.getElementById("columnStop");
      if (columnStopSound && localStorage.getItem('rageSoundEnabled') !== 'false') {
        columnStopSound.currentTime = 0;
        columnStopSound.volume = 0.4;
        columnStopSound.play().catch(() => {});
      }

      const container = columnElement.closest(".item-container");
      if (container) {
        container.classList.add("final-flash");
        if (!container.querySelector(".locked-tag")) {
          const lockedTag = document.createElement("div");
          lockedTag.className = "locked-tag";
          lockedTag.textContent = "LOCKED IN!";
          container.appendChild(lockedTag);
          setTimeout(() => lockedTag.classList.add("show"), 150);
        }
        setTimeout(() => {
          container.classList.remove("final-flash");
          container.classList.add("winner-pulsate");
        }, 500);
      }
    };
    return column;
  });

  columns.forEach((column) => {
    const container = column.closest(".item-container");
    if (container) {
      container.classList.remove("landing-flash", "winner-pulsate", "final-flash");
      const existingTag = container.querySelector(".locked-tag");
      if (existingTag) existingTag.remove();
    }
    column.style.transform = "translateY(0)";
    column.style.transition = "none";
  });

  slotColumns.forEach((column) => (column.state = "accelerating"));

  function animate(currentTime) {
    try {
      const elapsed = currentTime - startTime;
      if (elapsed > 15000) {
        console.warn('⚠️ Animation timeout');
        slotColumns.forEach(column => {
          if (column && typeof column.forceStop === 'function') {
            column.forceStop();
          }
        });
        finalizeSpin();
        return;
      }

      let isAnimating = false;
      slotColumns.forEach((column, index) => {
        try {
          if (column && column.state !== "stopped") {
            isAnimating = true;
            const deltaTime = column.lastTimestamp ? currentTime - column.lastTimestamp : 16.67;
            const safeDeltaTime = Math.max(0, Math.min(deltaTime, 100));
            column.update(elapsed, safeDeltaTime);
            column.lastTimestamp = currentTime;
          }
        } catch (columnError) {
          console.error(`Error updating column ${index}:`, columnError);
          if (column) {
            column.state = "stopped";
            if (typeof column.forceStop === 'function') {
              column.forceStop();
            }
          }
        }
      });

      if (isAnimating) {
        requestAnimationFrame(animate);
      } else {
        setTimeout(() => finalizeSpin(), 1000);
      }
    } catch (animateError) {
      console.error('Critical animation error:', animateError);
      rageState.isSpinning = false;
      resetSpinState();
    }
  }

  requestAnimationFrame(animate);
}

// Finalize spin
function finalizeSpin() {
  console.log("🎯 Finalizing spin");

  // Stop the spinning sound
  const spinningSound = document.getElementById("spinningSound");
  if (spinningSound) {
    spinningSound.pause();
    spinningSound.currentTime = 0;
  }

  // Play final sound
  const finalSound = document.getElementById("finalSound");
  if (finalSound && localStorage.getItem('rageSoundEnabled') !== 'false') {
    finalSound.currentTime = 0;
    finalSound.volume = 0.5;
    finalSound.play().catch(() => {});
  }

  updateSufferingStreak();
  updateTotalRageQuits();
  displaySelectedHandicap();

  // Record this spin in history after a short delay to ensure DOM is ready
  setTimeout(() => {
    console.log('⏰ Recording history after delay...');
    if (typeof recordSpinInHistory === 'function') {
      recordSpinInHistory();
    }
  }, 500);

  // Track the spin in Supabase
  if (window.StatsTracker) {
    window.StatsTracker.track('ragequit');
  }

  // Display handicap description in the new section
  const handicapDescSection = document.getElementById('handicap-description-section');
  const handicapNameDisplay = document.getElementById('handicap-name-display');
  const handicapDescDisplay = document.getElementById('handicap-desc-display');

  if (handicapDescSection && handicapNameDisplay && handicapDescDisplay) {
    const selectedHandicap = window.state?.selectedHandicap || rageState.selectedHandicap;
    const selectedHandicapDesc = window.state?.selectedHandicapDesc || rageState.selectedHandicapDesc;

    console.log('🎯 Handicap Display Debug:', {
      selectedHandicap,
      selectedHandicapDesc,
      windowState: window.state,
      rageState: rageState
    });

    if (selectedHandicap && selectedHandicap !== 'None') {
      handicapNameDisplay.textContent = selectedHandicap.toUpperCase();
      handicapDescDisplay.textContent = selectedHandicapDesc || 'No description available';
      handicapDescSection.style.display = 'block';

      // Ensure it's visible with smooth scroll
      setTimeout(() => {
        handicapDescSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 500);
    } else {
      handicapDescSection.style.display = 'none';
    }
  } else {
    console.error('❌ Handicap display elements not found:', {
      section: !!handicapDescSection,
      nameDisplay: !!handicapNameDisplay,
      descDisplay: !!handicapDescDisplay
    });
  }

  // Save to history if we have a valid loadout
  if (rageState.finalLoadout && window.addToHistory) {
    const { classType, weapon, specialization, gadgets } = rageState.finalLoadout;
    window.addToHistory(
      classType,
      weapon,
      specialization,
      gadgets,
      rageState.selectedHandicap || "None",
      rageState.selectedHandicapDesc || "No handicap selected"
    );
  } else if (rageState.finalLoadout) {
    console.warn("⚠️ addToHistory function not found - history won't be saved");
  }

  setTimeout(() => {
    resetSpinStateWithoutClearingDisplay();
    showDoubleOrNothingOption();
  }, 2000);
}

// Reset state
function resetSpinState() {
  console.log("🔄 Resetting spin state");

  // Stop the spinning sound
  const spinningSound = document.getElementById("spinningSound");
  if (spinningSound) {
    spinningSound.pause();
    spinningSound.currentTime = 0;
  }

  const spinButton = document.getElementById("rage-quit-btn");
  if (spinButton) {
    spinButton.disabled = false;
    spinButton.classList.remove('spinning', 'disabled');
  }
  rageState.isSpinning = false;
  if (window.rageRouletteSystem) {
    window.rageRouletteSystem.animating = false;
  }
  const slotMachineSection = document.querySelector('.slot-machine-section');
  const heroSection = document.querySelector('.hero');
  if (slotMachineSection) slotMachineSection.classList.remove('centered');
  if (heroSection) heroSection.style.opacity = '';
  document.querySelectorAll('.item-container').forEach(container => {
    container.classList.remove('mega-flash', 'spinning');
  });
}

function resetSpinStateWithoutClearingDisplay() {
  console.log("🔄 Resetting spin state (preserving display)");

  // Stop the spinning sound
  const spinningSound = document.getElementById("spinningSound");
  if (spinningSound) {
    spinningSound.pause();
    spinningSound.currentTime = 0;
  }

  const spinButton = document.getElementById("rage-quit-btn");
  if (spinButton) {
    spinButton.disabled = false;
    spinButton.classList.remove('spinning', 'disabled');
  }
  rageState.isSpinning = false;
  if (window.rageRouletteSystem) {
    window.rageRouletteSystem.animating = false;
  }
  const slotMachineSection = document.querySelector('.slot-machine-section');
  const heroSection = document.querySelector('.hero');
  if (slotMachineSection) slotMachineSection.classList.remove('centered');
  if (heroSection) heroSection.style.opacity = '';
  document.querySelectorAll('.item-container').forEach(container => {
    container.classList.remove('mega-flash', 'spinning');
  });
}

// Helper functions
function getAvailableClasses() {
  const allClasses = ["Light", "Medium", "Heavy"];
  const includedClasses = [];
  ['light', 'medium', 'heavy'].forEach(className => {
    const saved = localStorage.getItem(`exclude-${className}`);
    const isExcluded = saved === 'true';
    const capitalizedClass = className.charAt(0).toUpperCase() + className.slice(1);
    if (!isExcluded) {
      includedClasses.push(capitalizedClass);
    }
  });
  return includedClasses.length > 0 ? includedClasses : allClasses;
}

function updateSufferingStreak() {
  rageState.sufferingStreak++;
  localStorage.setItem('rageSufferingStreak', rageState.sufferingStreak.toString());
  const streakElement = document.getElementById('currentStreak');
  if (streakElement) {
    streakElement.textContent = rageState.sufferingStreak.toLocaleString();
  }
}

function updateTotalRageQuits() {
  let totalRageQuits = parseInt(localStorage.getItem('totalRageQuits')) || 3144;
  totalRageQuits++;
  localStorage.setItem('totalRageQuits', totalRageQuits.toString());
  const totalElement = document.getElementById('totalRageQuits');
  if (totalElement) {
    totalElement.textContent = totalRageQuits.toLocaleString();
  }
}

function displaySelectedHandicap() {
  const handicapContainer = document.getElementById("handicap-container");
  if (!handicapContainer) return;

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
    handicapContainer.style.display = "block";
  }
}

function showDoubleOrNothingOption() {
  const container = document.getElementById('double-or-nothing-container');
  if (container) {
    container.style.display = 'block';
    setTimeout(() => {
      container.style.display = 'none';
    }, 30000);
  }
}

// Expose everything globally
window.spinRageQuitLoadout = spinRageQuitLoadout;
window.rageRouletteSystem = null; // Will be set if rage-roulette-animations.js loads
window.resetSpinState = resetSpinState;
window.displayRageQuitLoadout = displayRageQuitLoadout;
window.rageQuitDebug = {
  state: rageState,
  spin: spinRageQuitLoadout,
  reset: resetSpinState,
  display: displayRageQuitLoadout,
  PHYSICS,
  SlotColumn
};

// BULLETPROOF BUTTON SETUP
function attachButtonHandler() {
  const btn = document.getElementById("rage-quit-btn");

  if (!btn) {
    console.error("❌ RAGE QUIT: rage-quit-btn not found!");
    return false;
  }

  if (btn.hasAttribute("data-handler-attached")) {
    console.log("⚠️ RAGE QUIT: Handler already attached");
    return true;
  }

  console.log("🎯 RAGE QUIT: Attaching click handler to button");
  btn.setAttribute("data-handler-attached", "true");

  btn.onclick = async function(e) {
    e.preventDefault();
    console.log("🔥 RAGE QUIT: Button clicked!");

    if (rageState.isSpinning) {
      console.log("⚠️ Already spinning");
      return;
    }

    // Ensure animation system is loaded
    if (!window.rageRouletteSystem) {
      console.log("⏳ Initializing animation system...");
      if (window.RageRouletteAnimationSystem) {
        try {
          window.rageRouletteSystem = new window.RageRouletteAnimationSystem();
          console.log("✅ Animation system initialized");
        } catch (err) {
          console.error("❌ Failed to initialize animation system:", err);
        }
      }
    }

    // Check if roulette system exists and use it, otherwise direct spin
    if (window.rageRouletteSystem && typeof window.rageRouletteSystem.startFullSequence === 'function') {
      console.log("🎬 Using RageRouletteAnimationSystem");
      try {
        await window.rageRouletteSystem.startFullSequence();
        console.log("✅ Animation sequence completed");
      } catch(err) {
        console.error("❌ Roulette error, falling back:", err);
        spinRageQuitLoadout();
      }
    } else {
      console.log("🎰 Using direct spin");
      spinRageQuitLoadout();
    }
  };

  console.log("✅ RAGE QUIT: Button handler attached successfully!");
  return true;
}

// Immediate button setup
const buttonReady = attachButtonHandler();
console.log("🔍 RAGE QUIT: Initial button setup:", buttonReady ? "SUCCESS" : "FAILED");

// Retry after small delay
if (!buttonReady) {
  setTimeout(() => {
    console.log("⏰ RAGE QUIT: Retrying button setup...");
    const retrySuccess = attachButtonHandler();
    console.log("🔍 RAGE QUIT: Retry result:", retrySuccess ? "SUCCESS" : "FAILED");

    if (!retrySuccess) {
      // Final fallback with mutation observer
      const observer = new MutationObserver(() => {
        const btn = document.getElementById("rage-quit-btn");
        if (btn && !btn.hasAttribute("data-handler-attached")) {
          console.log("👁️ RAGE QUIT: Button found by observer!");
          attachButtonHandler();
          observer.disconnect();
        }
      });

      observer.observe(document.body, { childList: true, subtree: true });
      setTimeout(() => observer.disconnect(), 10000); // Stop after 10 seconds
    }
  }, 100);
}

// Initialize displays
if (document.readyState !== 'loading') {
  const streakEl = document.getElementById('currentStreak');
  if (streakEl) streakEl.textContent = rageState.sufferingStreak.toLocaleString();

  const totalEl = document.getElementById('totalRageQuits');
  if (totalEl) {
    const total = parseInt(localStorage.getItem('totalRageQuits')) || 3144;
    totalEl.textContent = total.toLocaleString();
  }
}

// When roulette system loads, set it globally
// Check if it's already initialized by app.js
if (!window.rageRouletteSystem && window.RageRouletteAnimationSystem) {
  try {
    window.rageRouletteSystem = new window.RageRouletteAnimationSystem();
    console.log("✅ RAGE QUIT: RageRouletteAnimationSystem initialized in loadout-app.js");
  } catch (e) {
    console.error("❌ RAGE QUIT: Failed to initialize RageRouletteAnimationSystem:", e);
  }
} else if (window.rageRouletteSystem) {
  console.log("✅ RAGE QUIT: RageRouletteAnimationSystem already initialized by app.js");
}

console.log("✅ RAGE QUIT: loadout-app.js fully loaded on live site!");
console.log("🔍 RAGE QUIT: Available globals:", {
  rageState: !!window.rageState,
  spinRageQuitLoadout: !!window.spinRageQuitLoadout,
  rageRouletteSystem: !!window.rageRouletteSystem,
  buttonElement: !!document.getElementById("rage-quit-btn")
});
