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

// Helper function to check if sound is enabled
function isSoundEnabled() {
  return localStorage.getItem('rageSoundEnabled') !== 'false';
}

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
          <img src="../images/${item.replace(/ /g, "_")}.webp" alt="${item}" onerror="this.src='../images/placeholder.webp'">
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
        <img src="../images/${item.replace(/ /g, "_")}.webp" alt="${item}" onerror="this.src='../images/placeholder.webp'">
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

// Get available classes (respecting exclusions)
function getAvailableClasses() {
  const allClasses = ["Light", "Medium", "Heavy"];
  const includedClasses = [];
  
  console.log('\ud83d\udcca [RAGEQUIT] getAvailableClasses: Starting class filtering...');
  console.log('\ud83d\udcca [RAGEQUIT] localStorage debug values:', {
    'exclude-light': localStorage.getItem('exclude-light'),
    'exclude-medium': localStorage.getItem('exclude-medium'), 
    'exclude-heavy': localStorage.getItem('exclude-heavy'),
    'class-system-updated': localStorage.getItem('class-system-updated')
  });
  
  // Check which classes are included (checked = included, unchecked = excluded)
  // The checkboxes are "Select Classes to Include" - when checked, the class should be included
  // localStorage stores 'false' when checked (included) and 'true' when unchecked (excluded)
  ['light', 'medium', 'heavy'].forEach(className => {
    const saved = localStorage.getItem(`exclude-${className}`);
    const isExcluded = saved === 'true';
    const capitalizedClass = className.charAt(0).toUpperCase() + className.slice(1);
    
    if (!isExcluded) {
      // If not excluded, then it's included
      includedClasses.push(capitalizedClass);
      console.log(`\u2705 [RAGEQUIT] ${capitalizedClass} included in rage loadout (localStorage: ${saved})`);
    } else {
      console.log(`\ud83d\udeab [RAGEQUIT] ${capitalizedClass} excluded from rage loadout (localStorage: ${saved})`);
    }
  });
  
  // If no classes are explicitly included, include all classes
  const availableClasses = includedClasses.length > 0 ? includedClasses : allClasses;
  
  console.log('\ud83c\udfb2 [RAGEQUIT] Final available classes:', availableClasses);
  console.log('\u2705 [RAGEQUIT] Non-excluded classes:', includedClasses);
  
  return availableClasses;
}

// Display rage quit loadout
const displayRageQuitLoadout = () => {
  // Center the slot machine section during animation
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
  
  // Use the class already selected by the roulette system, or fallback to random selection with exclusions
  let selectedClass = rageState.selectedClass;
  
  if (!selectedClass) {
    console.log('🎲 [RAGEQUIT] No class selected by roulette, using fallback selection with exclusions');
    console.log('🎯 [RAGEQUIT] Fetching available classes for fallback selection...');
    const availableClasses = getAvailableClasses();
    console.log('🎯 [RAGEQUIT] Received available classes for fallback:', availableClasses);
    if (availableClasses.length === 0) {
      console.warn('⚠️ All classes excluded! Using all classes instead.');
      selectedClass = ["Light", "Medium", "Heavy"][Math.floor(Math.random() * 3)];
    } else {
      selectedClass = availableClasses[Math.floor(Math.random() * availableClasses.length)];
    }
    rageState.selectedClass = selectedClass;
  }
  
  console.log(`🎯 Using selected class: ${selectedClass}`);

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

  // Build the slot machine UI (simplified structure without wrapper)
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
  
  // Play spinning start sound
  const spinStartSound = document.getElementById("spinStart");
  if (spinStartSound && isSoundEnabled()) {
    spinStartSound.currentTime = 0;
    spinStartSound.volume = 0.3;
    spinStartSound.play().catch(() => {});
  }
  
  // Play continuous spinning sound
  const spinningSound = document.getElementById("spinningSound");
  if (spinningSound && isSoundEnabled()) {
    spinningSound.currentTime = 0;
    spinningSound.volume = 0.2;
    spinningSound.loop = true;
    spinningSound.play().catch(() => {});
  }

  const slotColumns = columns.map((element, index) => {
    const column = new SlotColumn(element, index);

    // Add the onStop callback for flash effects
    column.onStop = (columnElement) => {
      // Play column stop sound
      const columnStopSound = document.getElementById("columnStop");
      if (columnStopSound && isSoundEnabled()) {
        columnStopSound.currentTime = 0;
        columnStopSound.volume = 0.4;
        columnStopSound.play().catch(() => {});
      }
      
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
    try {
      // Safety timeout to prevent infinite animations
      const elapsed = currentTime - startTime;
      if (elapsed > 15000) { // 15 second timeout
        console.warn('⚠️ Rage quit slot machine animation safety timeout triggered');
        // Force stop all columns
        slotColumns.forEach(column => {
          try {
            if (column && typeof column.forceStop === 'function') {
              column.forceStop();
            }
          } catch (stopError) {
            console.warn('Rage column force stop error:', stopError);
          }
        });
        // Stop spinning sound
        try {
          const spinningSound = document.getElementById('spinningSound');
          if (spinningSound) {
            spinningSound.pause();
            spinningSound.currentTime = 0;
          }
        } catch (soundError) {
          console.warn('Rage sound stop error:', soundError);
        }
        // Force finalize
        try {
          finalizeSpin();
        } catch (finalizeError) {
          console.error('Rage force finalize error:', finalizeError);
        }
        return;
      }
      
      let isAnimating = false;

      slotColumns.forEach((column, index) => {
        try {
          if (column && column.state !== "stopped") {
            isAnimating = true;
            const deltaTime = column.lastTimestamp
              ? currentTime - column.lastTimestamp
              : 16.67;
            
            // Validate deltaTime is reasonable
            const safeDeltaTime = Math.max(0, Math.min(deltaTime, 100));
            
            if (typeof column.update === 'function') {
              column.update(elapsed, safeDeltaTime);
            } else {
              console.warn(`Rage column ${index} missing update method`);
              // Force stop this broken column
              if (column) {
                column.state = "stopped";
              }
            }
            column.lastTimestamp = currentTime;
          }
        } catch (columnError) {
          console.error(`Error updating rage column ${index}:`, columnError);
          // Force stop the problematic column to prevent further crashes
          try {
            if (column) {
              column.state = "stopped";
              if (typeof column.forceStop === 'function') {
                column.forceStop();
              }
            }
          } catch (stopError) {
            console.warn(`Failed to stop rage column ${index}:`, stopError);
          }
        }
      });

      if (isAnimating) {
        try {
          requestAnimationFrame(animate);
        } catch (rafError) {
          console.error('Rage RequestAnimationFrame error:', rafError);
          // Fallback: use setTimeout
          setTimeout(() => {
            try {
              animate(performance.now());
            } catch (fallbackError) {
              console.error('Rage fallback animation error:', fallbackError);
              // Force completion
              try {
                finalizeSpin();
              } catch (finalError) {
                console.error('Rage final completion error:', finalError);
              }
            }
          }, 16);
        }
      } else {
        try {
          // Stop spinning sound when all columns finish
          const spinningSound = document.getElementById("spinningSound");
          if (spinningSound) {
            spinningSound.pause();
            spinningSound.currentTime = 0;
          }
          
          // Play final lock sound
          const finalLockSound = document.getElementById("finalLock");
          if (finalLockSound && isSoundEnabled()) {
            finalLockSound.currentTime = 0;
            finalLockSound.volume = 0.5;
            finalLockSound.play().catch(() => {});
          }
          
          // When all columns are stopped, trigger the victory flash and finalize spin
          try {
            finalVictoryFlash(columns);
          } catch (flashError) {
            console.warn('Victory flash error:', flashError);
          }
          
          setTimeout(() => {
            try {
              finalizeSpin();
            } catch (finalizeError) {
              console.error('Rage finalize spin error:', finalizeError);
              // Emergency state reset
              try {
                rageState.isSpinning = false;
                resetSpinState();
              } catch (resetError) {
                console.error('Emergency reset error:', resetError);
              }
            }
          }, 1000);
        } catch (completionError) {
          console.error('Rage animation completion error:', completionError);
          // Force completion with minimal functionality
          try {
            setTimeout(() => {
              try {
                finalizeSpin();
              } catch (forceError) {
                console.error('Rage force finalize error:', forceError);
                rageState.isSpinning = false;
              }
            }, 1000);
          } catch (timeoutError) {
            console.error('Rage timeout creation error:', timeoutError);
            rageState.isSpinning = false;
          }
        }
      }
    } catch (animateError) {
      console.error('Critical rage animation error:', animateError);
      // Emergency shutdown
      try {
        rageState.isSpinning = false;
        const spinningSound = document.getElementById('spinningSound');
        if (spinningSound) {
          spinningSound.pause();
          spinningSound.currentTime = 0;
        }
        resetSpinState();
        // Try to finalize anyway
        setTimeout(() => {
          try {
            finalizeSpin();
          } catch (emergencyFinalizeError) {
            console.error('Emergency rage finalize error:', emergencyFinalizeError);
          }
        }, 100);
      } catch (emergencyError) {
        console.error('Emergency rage shutdown error:', emergencyError);
      }
    }
  }

  requestAnimationFrame(animate);
}

// Enhanced final victory flash for rage quit
function finalVictoryFlash(columns) {
  // Play final sound effect
  const finalSound = document.getElementById("finalSound");
  if (finalSound && isSoundEnabled()) {
    finalSound.currentTime = 0;
    finalSound.volume = 0.6;
    finalSound.play().catch(() => {});
  }
  
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

  console.log("🎯 Handicap data for history:", {
    handicapName,
    handicapDesc,
    rageStateHandicap: rageState.selectedHandicap,
    rageStateHandicapDesc: rageState.selectedHandicapDesc
  });

  // Add to history
  addToRageHistory(classType, weapon, specialization, gadgets, handicapName, handicapDesc);

  // Display the selected handicap
  displaySelectedHandicap();
  
  // Reset state and re-enable button
  setTimeout(() => {
    resetSpinState();
    showDoubleOrNothingOption();
    
    // Scroll to show the final loadout and handicap
    const slotMachineSection = document.querySelector('.slot-machine-section');
    if (slotMachineSection) {
      slotMachineSection.scrollIntoView({
        behavior: 'smooth',
        block: 'center'
      });
    }
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
      // Remove scroll to prevent page jumping during animations
      // handicapContainer.scrollIntoView({
      //   behavior: "smooth",
      //   block: "center",
      // });
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
  
  // Remove centering and restore normal layout
  const slotMachineSection = document.querySelector('.slot-machine-section');
  const heroSection = document.querySelector('.hero');
  
  if (slotMachineSection) {
    slotMachineSection.classList.remove('centered');
  }
  if (heroSection) {
    heroSection.style.opacity = '';
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

// History Management Functions
function generateRageLoadoutName(classType, weapon, specialization) {
  const rageNames = [
    `${classType} Nightmare`,
    `${weapon} of Suffering`,
    `Pain Train`,
    `Torment Build`,
    `Misery Configuration`,
    `Doom Setup`,
    `Agony Assault`,
    `Punishment Package`,
    `Suffering Simulator`,
    `Rage Inducer`
  ];
  return rageNames[Math.floor(Math.random() * rageNames.length)];
}

function calculatePunishmentLevel(weapon, specialization, gadgets, handicapName) {
  let level = 1;
  
  // Base punishment from weapon quality
  const badWeapons = ["Throwing Knives", "V9S", "Dagger"];
  const okWeapons = ["XP-54", "Recurve Bow", "Model 1887"];
  
  if (badWeapons.some(w => weapon.includes(w))) level += 3;
  else if (okWeapons.some(w => weapon.includes(w))) level += 2;
  else level += 1;
  
  // Punishment from gadgets
  const badGadgets = ["Tracking Dart", "Data Reshaper", "Anti-Gravity Cube"];
  gadgets.forEach(gadget => {
    if (badGadgets.some(g => gadget.includes(g))) level += 2;
    else level += 1;
  });
  
  // Extra punishment for handicap
  if (handicapName && handicapName !== "None") level += 3;
  
  return Math.min(level, 10);
}

function generateRageRoast(weapon, specialization, gadgets, handicapName) {
  const roasts = [
    `${weapon} + ${handicapName || "no handicap"} = instant uninstall. -15/10`,
    `Even masochists think this is too much. -20/10`,
    `${weapon} with ${handicapName || "this setup"}? Your controller will quit before you do. -12/10`,
    `This combo makes bronze rank look like pro play. -18/10`,
    `${specialization} + ${handicapName || "this disaster"} = tutorial difficulty feels impossible. -25/10`,
    `Your enemies will feel bad for killing you with this setup. -14/10`,
    `This loadout broke the rage meter. -∞/10`,
    `${weapon}? More like ${handicapName || "pain generator"}. Time to delete the game. -16/10`,
    `This setup makes watching paint dry seem exciting. -22/10`,
    `Your teammates will report you for griefing yourself. -19/10`
  ];
  
  return roasts[Math.floor(Math.random() * roasts.length)];
}

function isSpicyRageLoadout(weapon, specialization, gadgets, handicapName) {
  const badWeapons = ["Throwing Knives", "V9S", "Dagger"];
  const badGadgets = ["Tracking Dart", "Data Reshaper", "Anti-Gravity Cube"];
  
  const hasBadWeapon = badWeapons.some(w => weapon.includes(w));
  const hasBadGadgets = gadgets.some(g => badGadgets.some(bg => g.includes(bg)));
  const hasHandicap = handicapName && handicapName !== "None";
  
  return hasBadWeapon && hasBadGadgets && hasHandicap;
}

function addToRageHistory(classType, weapon, specialization, gadgets, handicapName, handicapDesc) {
  const historyList = document.getElementById("history-list");
  if (!historyList) return;

  console.log("📝 Adding to rage history:", { classType, weapon, specialization, gadgets, handicapName });

  const newEntry = document.createElement("div");
  newEntry.classList.add("history-row");
  
  // Generate punishment level based on gear and handicap
  const punishmentLevel = calculatePunishmentLevel(weapon, specialization, gadgets, handicapName);
  
  // Determine if this is a "spicy" (extra bad) loadout
  const isSpicyLoadout = isSpicyRageLoadout(weapon, specialization, gadgets, handicapName);
  if (isSpicyLoadout) {
    newEntry.classList.add("spicy-loadout");
  }

  // Add timestamp data attribute for sorting
  const timestamp = new Date().toISOString();
  newEntry.dataset.timestamp = timestamp;
  newEntry.dataset.punishmentLevel = punishmentLevel;
  newEntry.dataset.classType = classType.toLowerCase();

  // Generate compact loadout description
  const loadoutName = `${weapon} + ${gadgets.slice(0, 2).join('/')}`;

  // Create clean text-based history entry (NO IMAGES)
  newEntry.innerHTML = `
    <span class="history-class-tag">${classType.toUpperCase()}</span>
    ${weapon} + ${specialization} + ${gadgets.join(' + ')}
    <span class="history-punishment">Level ${punishmentLevel}</span>
    <!-- Store full data for modal/copy functionality -->
    <div style="display: none;">
      <span class="hidden-weapon">${weapon}</span>
      <span class="hidden-spec">${specialization}</span>
      <span class="hidden-gadgets">${gadgets.join('|')}</span>
      <span class="hidden-handicap">${handicapName || "None"}</span>
      <span class="hidden-handicap-desc">${handicapDesc || "No handicap selected"}</span>
      <span class="hidden-roast">${generateRageRoast(weapon, specialization, gadgets, handicapName)}</span>
      <span class="hidden-loadout-name">${generateRageLoadoutName(classType, weapon, specialization)}</span>
    </div>
  `;

  // Add click handler for the whole row to show details
  newEntry.addEventListener('click', function() {
    viewFullDetails(this);
  });

  // Add right-click context menu for actions
  newEntry.addEventListener('contextmenu', function(e) {
    e.preventDefault();
    showContextMenu(e, this);
  });

  historyList.prepend(newEntry);
  
  // Animate entry
  setTimeout(() => newEntry.style.opacity = '1', 10);

  // Limit to last 5 entries
  while (historyList.children.length > 5) {
    historyList.removeChild(historyList.lastChild);
  }

  // Update timestamps
  updateRageTimestamps();

  // Save updated history to localStorage
  saveRageHistory();
}

function saveRageHistory() {
  const entries = Array.from(document.querySelectorAll(".history-row")).map((entry) => ({
    html: entry.innerHTML,
    timestamp: entry.dataset.timestamp,
    punishmentLevel: entry.dataset.punishmentLevel,
    classType: entry.dataset.classType,
    survived: entry.classList.contains('survived')
  }));
  localStorage.setItem("rageQuitHistory", JSON.stringify(entries));
}

function loadRageHistory() {
  const historyList = document.getElementById("history-list");
  if (!historyList) return;
  
  const savedEntries = JSON.parse(localStorage.getItem("rageQuitHistory")) || [];
  historyList.innerHTML = "";

  savedEntries.forEach((entry) => {
    const newEntry = document.createElement("div");
    newEntry.classList.add("history-row");
    if (entry.survived) newEntry.classList.add("survived");
    newEntry.dataset.timestamp = entry.timestamp || new Date().toISOString();
    newEntry.dataset.punishmentLevel = entry.punishmentLevel || 0;
    newEntry.dataset.classType = entry.classType || 'unknown';
    newEntry.innerHTML = entry.html || entry; // Support old format
    historyList.appendChild(newEntry);
  });

  updateHistoryVisibility();
  applyHistoryFilters();
}

function updateRageTimestamps() {
  const timestamps = document.querySelectorAll('.history-time');
  timestamps.forEach(timestamp => {
    const now = new Date();
    const created = timestamp.dataset.created ? new Date(timestamp.dataset.created) : now;
    const elapsed = Math.floor((now - created) / 1000);
    
    if (elapsed < 60) {
      timestamp.textContent = 'now';
    } else if (elapsed < 3600) {
      timestamp.textContent = `${Math.floor(elapsed / 60)}m`;
    } else if (elapsed < 86400) {
      timestamp.textContent = `${Math.floor(elapsed / 3600)}h`;
    } else {
      timestamp.textContent = `${Math.floor(elapsed / 86400)}d`;
    }
  });
}

// Update timestamps every minute
setInterval(updateRageTimestamps, 60000);

// New Compact Row Functions
function copyCompactLoadout(row) {
  if (!row) return;

  const classType = row.dataset.classType.toUpperCase();
  const weapon = row.querySelector('.hidden-weapon').textContent;
  const spec = row.querySelector('.hidden-spec').textContent;
  const gadgets = row.querySelector('.hidden-gadgets').textContent.split('|');
  const handicap = row.querySelector('.hidden-handicap').textContent;
  const handicapDesc = row.querySelector('.hidden-handicap-desc').textContent;
  const punishmentLevel = row.dataset.punishmentLevel;

  const text = `🔥 THE FINALS RAGE LOADOUT 🔥
Class: ${classType}
Weapon: ${weapon}
Specialization: ${spec}
Gadgets: ${gadgets.join(', ')}
Punishment Level: ${punishmentLevel}
Handicap: ${handicap} - ${handicapDesc}

Generated by thefinalsloadout.com/ragequit/`;

  navigator.clipboard.writeText(text)
    .then(() => {
      // Show a brief flash to indicate copy success
      const originalStyle = row.style.background;
      row.style.background = 'rgba(0, 255, 0, 0.2)';
      setTimeout(() => {
        row.style.background = originalStyle;
      }, 500);
    })
    .catch((err) => {
      console.error("Could not copy text: ", err);
      alert("Failed to copy rage loadout to clipboard");
    });
}

function viewFullDetails(element) {
  const row = element.classList.contains('history-row') ? element : element.closest(".history-row");
  if (!row) return;

  // Create modal if it doesn't exist
  let modal = document.getElementById('history-modal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'history-modal';
    modal.className = 'history-modal';
    modal.innerHTML = `
      <div class="history-modal-content">
        <button class="modal-close" onclick="closeHistoryModal()">&times;</button>
        <div id="modal-body"></div>
      </div>
    `;
    document.body.appendChild(modal);
  }

  // Populate modal with full details
  const classType = row.dataset.classType.toUpperCase();
  const weapon = row.querySelector('.hidden-weapon').textContent;
  const spec = row.querySelector('.hidden-spec').textContent;
  const gadgets = row.querySelector('.hidden-gadgets').textContent.split('|');
  const handicap = row.querySelector('.hidden-handicap').textContent;
  const handicapDesc = row.querySelector('.hidden-handicap-desc').textContent;
  const roast = row.querySelector('.hidden-roast').textContent;
  const loadoutName = row.querySelector('.hidden-loadout-name').textContent;
  const punishmentLevel = row.dataset.punishmentLevel;

  document.getElementById('modal-body').innerHTML = `
    <h2>${loadoutName}</h2>
    <div class="modal-class-badge ${row.dataset.classType}">${classType}</div>
    <div class="modal-punishment">
      <span>${'💀'.repeat(Math.min(punishmentLevel, 5))}</span>
      Punishment Level: ${punishmentLevel}
    </div>
    <div class="modal-items">
      <div class="modal-item">
        <img src="../images/${weapon.replace(/ /g, "_")}.webp" alt="${weapon}" onerror="this.src='../images/placeholder.webp'">
        <p>Weapon: ${weapon}</p>
      </div>
      <div class="modal-item">
        <img src="../images/${spec.replace(/ /g, "_")}.webp" alt="${spec}" onerror="this.src='../images/placeholder.webp'">
        <p>Specialization: ${spec}</p>
      </div>
      ${gadgets.map((g, i) => `
        <div class="modal-item">
          <img src="../images/${g.replace(/ /g, "_")}.webp" alt="${g}" onerror="this.src='../images/placeholder.webp'">
          <p>Gadget ${i + 1}: ${g}</p>
        </div>
      `).join('')}
    </div>
    <div class="modal-handicap">
      <h3>Active Handicap</h3>
      <p><strong>${handicap}</strong></p>
      <p>${handicapDesc}</p>
    </div>
    <div class="modal-roast">
      <span>🔥</span> ${roast}
    </div>
  `;

  modal.classList.add('active');
}

function closeHistoryModal() {
  const modal = document.getElementById('history-modal');
  if (modal) modal.classList.remove('active');
}

function showContextMenu(event, row) {
  // Remove any existing context menu
  const existingMenu = document.getElementById('history-context-menu');
  if (existingMenu) existingMenu.remove();

  // Create context menu
  const menu = document.createElement('div');
  menu.id = 'history-context-menu';
  menu.style.cssText = `
    position: fixed;
    left: ${event.clientX}px;
    top: ${event.clientY}px;
    background: #1a1a1a;
    border: 1px solid #2a2a2a;
    border-radius: 6px;
    padding: 4px 0;
    z-index: 10000;
    min-width: 120px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  `;

  const actions = [
    { text: 'Copy Loadout', action: () => copyCompactLoadout(row) },
    { text: 'Mark Survived', action: () => markCompactSurvived(row) },
  ];

  actions.forEach(item => {
    const menuItem = document.createElement('div');
    menuItem.textContent = item.text;
    menuItem.style.cssText = `
      padding: 8px 12px;
      cursor: pointer;
      font-size: 0.9rem;
      color: #ffffff;
      transition: background 0.2s;
    `;
    
    menuItem.addEventListener('mouseenter', () => {
      menuItem.style.background = '#2a2a2a'; // var(--medium-gray)
    });
    
    menuItem.addEventListener('mouseleave', () => {
      menuItem.style.background = 'transparent';
    });
    
    menuItem.addEventListener('click', () => {
      item.action();
      menu.remove();
    });
    
    menu.appendChild(menuItem);
  });

  document.body.appendChild(menu);

  // Remove menu on click outside
  const removeMenu = (e) => {
    if (!menu.contains(e.target)) {
      menu.remove();
      document.removeEventListener('click', removeMenu);
    }
  };
  setTimeout(() => document.addEventListener('click', removeMenu), 0);
}

function markCompactSurvived(row) {
  if (!row || row.classList.contains('survived')) return;
  
  row.classList.add('survived');
  
  // Show a brief flash to indicate survival
  const originalStyle = row.style.background;
  row.style.background = 'rgba(255, 215, 0, 0.3)';
  setTimeout(() => {
    row.style.background = originalStyle;
  }, 1000);
  
  saveRageHistory();
}

// Pagination and Filtering Functions
function updateHistoryVisibility() {
  const rows = document.querySelectorAll('.history-row');
  const loadMoreBtn = document.getElementById('load-more');
  const itemsPerPage = 20; // More items since they're much smaller
  
  rows.forEach((row, index) => {
    if (index < itemsPerPage) {
      row.style.display = 'flex';
    } else {
      row.style.display = 'none';
    }
  });
  
  if (rows.length > itemsPerPage && loadMoreBtn) {
    loadMoreBtn.style.display = 'block';
    loadMoreBtn.onclick = () => {
      rows.forEach(row => row.style.display = 'flex');
      loadMoreBtn.style.display = 'none';
    };
  } else if (loadMoreBtn) {
    loadMoreBtn.style.display = 'none';
  }
}

function applyHistoryFilters() {
  const filterSelect = document.getElementById('history-filter');
  const sortSelect = document.getElementById('history-sort');
  
  if (!filterSelect || !sortSelect) return;
  
  filterSelect.addEventListener('change', filterHistory);
  sortSelect.addEventListener('change', sortHistory);
}

function filterHistory() {
  const filter = document.getElementById('history-filter').value;
  const rows = Array.from(document.querySelectorAll('.history-row'));
  
  rows.forEach(row => {
    let show = true;
    
    switch(filter) {
      case 'survived':
        show = row.classList.contains('survived');
        break;
      case 'high-punishment':
        show = parseInt(row.dataset.punishmentLevel) >= 8;
        break;
      case 'recent':
        const timestamp = new Date(row.dataset.timestamp);
        const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
        show = timestamp > dayAgo;
        break;
    }
    
    row.style.display = show ? 'flex' : 'none';
  });
  
  // Re-sort after filtering
  sortHistory();
}

function sortHistory() {
  const sort = document.getElementById('history-sort').value;
  const historyList = document.getElementById('history-list');
  const rows = Array.from(document.querySelectorAll('.history-row'));
  
  rows.sort((a, b) => {
    switch(sort) {
      case 'oldest':
        return new Date(a.dataset.timestamp) - new Date(b.dataset.timestamp);
      case 'punishment':
        return parseInt(b.dataset.punishmentLevel) - parseInt(a.dataset.punishmentLevel);
      default: // newest
        return new Date(b.dataset.timestamp) - new Date(a.dataset.timestamp);
    }
  });
  
  // Re-append in sorted order
  rows.forEach(row => historyList.appendChild(row));
}

// Sound Toggle Functionality
function initializeRageSoundToggle() {
  const soundToggle = document.getElementById('rage-sound-toggle');
  if (!soundToggle) return;

  const soundEnabled = localStorage.getItem('rageSoundEnabled') !== 'false';
  if (!soundEnabled) {
    soundToggle.classList.add('muted');
    toggleSoundIcons(soundToggle, false);
  }

  soundToggle.addEventListener('click', () => {
    const isMuted = soundToggle.classList.contains('muted');
    
    if (isMuted) {
      soundToggle.classList.remove('muted');
      localStorage.setItem('rageSoundEnabled', 'true');
      toggleSoundIcons(soundToggle, true);
    } else {
      soundToggle.classList.add('muted');
      localStorage.setItem('rageSoundEnabled', 'false');
      toggleSoundIcons(soundToggle, false);
      stopAllRageSounds();
    }
  });
}

function toggleSoundIcons(button, soundOn) {
  const soundOnIcon = button.querySelector('.sound-on');
  const soundOffIcon = button.querySelector('.sound-off');
  
  if (soundOn) {
    soundOnIcon.style.display = 'block';
    soundOffIcon.style.display = 'none';
  } else {
    soundOnIcon.style.display = 'none';
    soundOffIcon.style.display = 'block';
  }
}

function stopAllRageSounds() {
  const sounds = ['rageAlarmSound', 'rageBuzzerSound', 'rageLaughSound', 'rageBackgroundMusic'];
  sounds.forEach(soundId => {
    const audio = document.getElementById(soundId);
    if (audio) {
      audio.pause();
      audio.currentTime = 0;
    }
  });
}

// DOM Ready Event Handler
document.addEventListener("DOMContentLoaded", () => {
  console.log("✅ Rage Quit Loadout App loaded");

  // Clear ALL history to force clean text-based format with correct data
  localStorage.removeItem("rageQuitHistory");
  console.log("🗑️ Cleared all history to force new format with complete loadout data");

  loadRageHistory(); // Load saved history when page loads
  applyHistoryFilters(); // Initialize filters

  // Clear Loadout History
  document.getElementById("clear-history")?.addEventListener("click", () => {
    if (confirm("Are you sure you want to clear all history? This cannot be undone.")) {
      localStorage.removeItem("rageQuitHistory");
      document.getElementById("history-list").innerHTML = "";
      console.log("🗑️ Rage Quit history cleared.");
    }
  });

  // Initialize the rage roulette animation system
  console.log("🔧 Initializing RageRouletteAnimationSystem...");
  console.log("📦 RageRouletteAnimationSystem available:", !!window.RageRouletteAnimationSystem);
  
  if (!window.RageRouletteAnimationSystem) {
    console.error("❌ RageRouletteAnimationSystem class not found! Check if rage-roulette-animations.js is loaded.");
    return;
  }
  
  const rageRouletteSystem = new window.RageRouletteAnimationSystem();
  window.rageRouletteSystem = rageRouletteSystem;
  console.log("✅ RageRouletteAnimationSystem initialized successfully");
  
  // Initialize sound toggle
  initializeRageSoundToggle();
  
  // Check if button exists and add debugging
  const rageQuitButton = document.getElementById("rage-quit-btn");
  console.log("🔍 Rage Quit Button found:", !!rageQuitButton);
  
  if (rageQuitButton) {
    console.log("✅ Adding click event listener to rage quit button");
    
    // Rage Quit Button Click Event
    rageQuitButton.addEventListener("click", async function () {
      console.log("🎯 Rage Quit button clicked!");
      console.log("📊 Current state:", {
        isSpinning: rageState.isSpinning,
        animating: window.rageRouletteSystem?.animating,
        rageRouletteSystemExists: !!window.rageRouletteSystem
      });
    
    if (rageState.isSpinning || (window.rageRouletteSystem && window.rageRouletteSystem.animating)) {
      console.log("❌ Animation already in progress, skipping");
      return;
    }

    // Play click sound
    const clickSound = document.getElementById("clickSound");
    if (clickSound && clickSound.readyState >= 2) {
      clickSound.currentTime = 0;
      clickSound.play().catch((err) => console.warn("Error playing sound:", err));
    }

    // Add spinning animation to button
    this.classList.add('spinning');
    
    try {
      console.log("🚀 Starting rage roulette sequence...");
      console.log("🔍 RageRouletteAnimationSystem exists:", !!window.rageRouletteSystem);
      console.log("🔍 RageRouletteAnimationSystem type:", typeof window.rageRouletteSystem);
      
      // Check if roulette system is available and working
      if (!window.rageRouletteSystem) {
        console.error("❌ RageRouletteAnimationSystem not available!");
        // Try to reinitialize
        if (window.RageRouletteAnimationSystem) {
          console.log("🔄 Attempting to reinitialize RageRouletteAnimationSystem...");
          window.rageRouletteSystem = new window.RageRouletteAnimationSystem();
        } else {
          console.error("❌ RageRouletteAnimationSystem class not found, falling back to direct loadout");
          spinRageQuitLoadout();
          return;
        }
      }
      
      console.log("🎬 Starting full roulette sequence...");
      console.log("🔍 Checking rageRouletteSystem methods:", {
        hasStartFullSequence: typeof window.rageRouletteSystem.startFullSequence === 'function',
        hasAnimateClassSelection: typeof window.rageRouletteSystem.animateClassSelection === 'function',
        hasAnimateSpinSelection: typeof window.rageRouletteSystem.animateSpinSelection === 'function',
        hasAnimateHandicapSelection: typeof window.rageRouletteSystem.animateHandicapSelection === 'function'
      });
      
      // Start the full roulette sequence with error handling
      await window.rageRouletteSystem.startFullSequence();
      console.log("✅ Rage roulette sequence completed successfully");
    } catch (error) {
      console.error("❌ Error in rage roulette sequence:", error);
      console.log("🔄 Falling back to direct loadout generation...");
      
      // Reset animation state
      if (window.rageRouletteSystem) {
        window.rageRouletteSystem.animating = false;
      }
      
      // Hide roulette container if it's showing
      const rouletteContainer = document.getElementById("rage-roulette-container");
      if (rouletteContainer) {
        rouletteContainer.classList.add("hidden");
        rouletteContainer.style.display = "none";
      }
      
      // Restore body scrolling
      document.body.style.overflow = "";
      
      // Fall back to direct loadout generation
      spinRageQuitLoadout();
    } finally {
      // Remove spinning animation when done
      this.classList.remove('spinning');
    }
    });
  } else {
    console.error("❌ Rage Quit Button not found in DOM!");
    // Try to find it with a slight delay in case DOM isn't fully loaded
    setTimeout(() => {
      const delayedButton = document.getElementById("rage-quit-btn");
      if (delayedButton) {
        console.log("✅ Found button on retry, adding listener");
        delayedButton.addEventListener("click", async function () {
          console.log("🎯 Delayed Rage Quit button clicked!");
          if (!rageState.isSpinning) {
            spinRageQuitLoadout();
          }
        });
      }
    }, 500);
  }

  // Copy Loadout Button
  document.getElementById("copyLoadoutButton")?.addEventListener("click", () => {
    try {
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
        return visibleItem.querySelector("p")?.innerText.trim() || "Unknown";
      });

      // Get handicaps from the stack or fallback to single handicap
      let handicapText = "None";
      if (rageState.handicapStack && rageState.handicapStack.length > 0) {
        handicapText = rageState.handicapStack.map(h => `${h.name} (${h.description})`).join(', ');
      } else {
        handicapText = rageState.selectedHandicap || 
          (document.querySelector(".handicap-result")?.textContent) || "None";
      }

      if (selectedItems.includes("Unknown") || selectedItems.length < 5) {
        alert(
          "Error: Not all items were properly selected. Please try again after the spin completes."
        );
        return;
      }

      const selectedClass = rageState.selectedClass || ["Light", "Medium", "Heavy"][Math.floor(Math.random() * 3)];

      const sufferingLevel = rageState.sufferingLevel > 0 ? `\nSuffering Level: ${rageState.sufferingLevel}x` : "";
      const copyText = `🔥 RAGE QUIT LOADOUT ${sufferingLevel ? '- STACKED HANDICAPS' : ''} 🔥
Class: ${selectedClass}
Weapon: ${selectedItems[0]}
Specialization: ${selectedItems[1]}
Gadget 1: ${selectedItems[2]}
Gadget 2: ${selectedItems[3]}
Gadget 3: ${selectedItems[4]}
Active Handicaps: ${handicapText}${sufferingLevel}

Generated by thefinalsloadout.com/ragequit/`;

      navigator.clipboard
        .writeText(copyText)
        .then(() => alert("Rage Quit Loadout copied to clipboard!"))
        .catch((err) => {
          console.error("Could not copy text:", err);
          alert("Failed to copy loadout to clipboard");
        });
    } catch (error) {
      console.error("Error in copy loadout handler:", error);
      alert("An error occurred while copying the loadout");
    }
  });
});