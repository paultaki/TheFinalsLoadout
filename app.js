let state = {
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
};

document.addEventListener("DOMContentLoaded", () => {
  // Code continues...
});

// Loadouts object
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
      "Sonar Grenade",
      "Thermal Bore",
      "Gas Grenade",
      "Gravity Vortex",
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

// Get DOM elements
const classButtons = document.querySelectorAll(".class-button");
const spinButtons = document.querySelectorAll(".spin-button");
const spinSelection = document.getElementById("spinSelection");
const outputDiv = document.getElementById("output");

// Add GPU hints to columns on load for better performance
const addGPUHints = () => {
  const columns = document.querySelectorAll(".scroll-container");
  columns.forEach((column) => {
    column.style.willChange = "transform";
    column.style.backfaceVisibility = "hidden";
    column.style.perspective = "1000px";
    column.style.transform = "translate3d(0,0,0)";
  });
};

// Call it once on load
addGPUHints();

// Helper functions
const getRandomUniqueItems = (array, n) => {
  const shuffled = [...array].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, n);
};

const getUniqueGadgets = (classType, loadout) => {
  if (state.gadgetQueue[classType].length < 3) {
    state.gadgetQueue[classType] = [...loadout.gadgets].sort(
      () => Math.random() - 0.5
    );
  }
  const selectedGadgets = state.gadgetQueue[classType].splice(0, 3);
  state.currentGadgetPool = new Set(selectedGadgets);
  return selectedGadgets;
};

const displayLoadout = (classType, loadout) => {
  const selectedWeapon = getRandomUniqueItems(loadout.weapons, 1)[0];
  const selectedSpec = getRandomUniqueItems(loadout.specializations, 1)[0];

  const allGadgets = [...loadout.gadgets];
  const gadgetChunks = [[], [], []];
  const selectedGadgets = [];

  for (let i = 0; i < 3; i++) {
    const index = Math.floor(Math.random() * allGadgets.length);
    selectedGadgets.push(allGadgets[index]);
    allGadgets.splice(index, 1);
  }

  while (allGadgets.length > 0) {
    for (let i = 0; i < 3 && allGadgets.length > 0; i++) {
      const index = Math.floor(Math.random() * allGadgets.length);
      gadgetChunks[i].push(allGadgets[index]);
      allGadgets.splice(index, 1);
    }
  }

  const createGadgetSpinSequence = (winningGadget, chunkIndex) => {
    const sequence = new Array(8);
    sequence[4] = winningGadget;

    const chunk = gadgetChunks[chunkIndex];
    for (let i = 0; i < 8; i++) {
      if (i !== 4) {
        const randomIndex = Math.floor(Math.random() * chunk.length);
        sequence[i] = chunk[randomIndex];
      }
    }
    return sequence;
  };

  const loadoutHTML = `
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
            (gadget, index) => `
            <div class="item-container">
              <div class="scroll-container" data-gadget-index="${index}">
                ${createItemContainer(
                  createGadgetSpinSequence(gadget, index),
                  gadget,
                  true
                )}
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

const displayRandomLoadout = () => {
  const classes = ["Light", "Medium", "Heavy"];
  const randomClass = classes[Math.floor(Math.random() * classes.length)];
  const loadout = loadouts[randomClass];
  displayLoadout(randomClass, loadout);
};

const displayManualLoadout = (classType) => {
  const loadout = loadouts[classType];
  displayLoadout(classType, loadout);
};

const spinLoadout = (spins) => {
  if (state.isSpinning) return;

  // Disable buttons during spin
  document.querySelectorAll(".class-button, .spin-button").forEach((btn) => {
    btn.setAttribute("disabled", "true");
  });

  state.isSpinning = true;
  state.currentSpin = spins || state.currentSpin;
  state.totalSpins = spins || state.totalSpins;

  state.currentGadgetPool.clear();
  updateSpinCountdown();

  if (!state.selectedClass && state.selectedClass !== "random") {
    state.isSpinning = false; // Make sure to reset spinning state
    return;
  }

  // Display initial loadout
  if (state.selectedClass === "random") {
    displayRandomLoadout();
  } else {
    displayManualLoadout(state.selectedClass);
  }
};

// Updated physics constants for smoother animation

// Updated physics constants with separate timing for regular vs final spins

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
      COLUMN_DELAY: 600, // 0.6s between stops for final spin
      BASE_DURATION: 2500,
      DECELERATION_TIME: 800,
    },
  },
};

class SlotColumn {
  constructor(element, index, isFinalSpin) {
    this.element = element;
    this.index = index;
    this.velocity = 0;
    this.position = 0;
    this.state = "waiting";
    this.lastTimestamp = null;
    this.isFinalSpin = isFinalSpin;

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
    if (this.state === "stopped") return;

    const dt = deltaTime / 1000;

    switch (this.state) {
      case "accelerating":
        this.velocity += PHYSICS.ACCELERATION * dt;
        if (this.velocity >= PHYSICS.MAX_VELOCITY) {
          this.velocity = PHYSICS.MAX_VELOCITY;
          this.state = "spinning";
        }
        break;

      case "spinning":
        this.velocity = PHYSICS.MAX_VELOCITY;

        if (elapsed >= this.totalDuration - this.decelerationTime) {
          this.state = "decelerating";
          this.targetPosition =
            Math.ceil(this.position / PHYSICS.ITEM_HEIGHT) *
            PHYSICS.ITEM_HEIGHT;
        }
        break;

      case "decelerating":
        this.velocity += PHYSICS.DECELERATION * dt;

        if (this.velocity <= 0) {
          if (Math.abs(this.velocity) < 100) {
            this.velocity = 0;
            this.position = this.targetPosition;
            this.state = "stopped";
          } else {
            this.velocity = -this.velocity * PHYSICS.BOUNCE_DAMPENING;
            this.state = "bouncing";
          }
        }
        break;

      case "bouncing":
        this.velocity += PHYSICS.DECELERATION * 1.2 * dt;

        if (
          Math.abs(this.velocity) < 50 &&
          Math.abs(this.position - this.targetPosition) < 5
        ) {
          this.velocity = 0;
          this.position = this.targetPosition;
          this.state = "stopped";
        }
        break;
    }

    this.position += this.velocity * dt;
    const wrappedPosition = this.position % PHYSICS.ITEM_HEIGHT;
    this.position =
      wrappedPosition >= 0
        ? wrappedPosition
        : wrappedPosition + PHYSICS.ITEM_HEIGHT;

    this.updateVisuals();
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

function startSpinAnimation(columns) {
  const isFinalSpin = state.currentSpin === 1;
  const startTime = performance.now();

  const slotColumns = columns.map(
    (element, index) => new SlotColumn(element, index, isFinalSpin)
  );

  // Reset columns - remove all animations
  columns.forEach((column) => {
    const container = column.closest(".item-container");
    if (container) {
      container.classList.remove("landing-flash", "winner-pulsate");
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
      if (isFinalSpin) {
        // Only add flash animations on the final spin
        columns.forEach((column, index) => {
          const container = column.closest(".item-container");
          if (container) {
            setTimeout(() => {
              container.classList.add("landing-flash");
              setTimeout(() => {
                container.classList.add("winner-pulsate");
              }, 300);
            }, index * 200);
          }
        });
        finalizeSpin(columns);
      } else {
        // For non-final spins, just move to the next spin
        setTimeout(() => {
          if (state.selectedClass === "random") {
            displayRandomLoadout();
          } else {
            displayManualLoadout(state.selectedClass);
          }
        }, 300);
      }
    }
  }

  requestAnimationFrame(animate);
}

// Other physics constants remain the same...
function startSpinAnimation(columns) {
  const isFinalSpin = state.currentSpin === 1;
  const startTime = performance.now();

  const slotColumns = columns.map(
    (element, index) => new SlotColumn(element, index, isFinalSpin)
  );

  // Reset columns - simply reset position, no animation handling here
  columns.forEach((column) => {
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
      // Simply call finalizeSpin, which will handle all end-of-spin logic
      finalizeSpin(columns);
    }
  }

  requestAnimationFrame(animate);
}

function finalizeSpin(columns) {
  const isFinalSpin = state.currentSpin === 1;

  // Only do flash animation on the final spin
  if (isFinalSpin) {
    columns.forEach((column, index) => {
      const container = column.closest(".item-container");
      if (container) {
        // Remove any existing animations first
        container.classList.remove("landing-flash", "winner-pulsate");

        setTimeout(() => {
          container.classList.add("landing-flash");
          setTimeout(() => {
            container.classList.add("winner-pulsate");
          }, 300);
        }, index * 200);
      }
    });
  }

  if (state.currentSpin > 1) {
    state.currentSpin--;
    updateSpinCountdown();

    setTimeout(() => {
      if (state.selectedClass === "random") {
        displayRandomLoadout();
      } else {
        displayManualLoadout(state.selectedClass);
      }
    }, 300);
  } else {
    state.isSpinning = false;
    state.currentSpin = 1;
    state.totalSpins = 0;
    state.selectedGadgets.clear();
    state.selectedClass = null;

    document
      .querySelectorAll(".class-button, .spin-button")
      .forEach((button) => {
        button.classList.remove("active", "selected");
        button.removeAttribute("disabled");
      });

    document.getElementById("spinSelection").classList.add("disabled");
  }
}

function updateSpinCountdown() {
  spinButtons.forEach((button) => {
    button.classList.remove("active", "selected");
  });

  const currentButton = [...spinButtons].find(
    (b) => parseInt(b.dataset.spins) === state.currentSpin
  );
  if (currentButton) {
    currentButton.classList.add("active");
  }
}

function createItemContainer(items, winningItem = null, isGadget = false) {
  if (isGadget) {
    return items
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
const randomButton = document.getElementById("randomButton");

if (!randomButton) {
  console.error("Random button not found! Check your HTML.");
} else {
  randomButton.addEventListener("click", () => {
    console.log("🎲 Random button clicked!"); // Debugging

    if (state.isSpinning) {
      console.log("⚠️ Already spinning! Ignoring click.");
      return;
    }

    // Pick a random class
    const classes = ["Light", "Medium", "Heavy"];
    const randomClass = classes[Math.floor(Math.random() * classes.length)];
    state.selectedClass = randomClass;

    // Update UI to show the selected class
    document.querySelectorAll(".class-button").forEach((b) => {
      b.classList.remove("selected", "active");

      // Keep the selected class highlighted
      if (b.dataset.class.toLowerCase() === state.selectedClass.toLowerCase()) {
        b.classList.add("selected", "active");
      }
    });

    // Pick a random number of spins (between 1 and 5)
    const randomSpins = Math.floor(Math.random() * 5) + 1;
    state.totalSpins = randomSpins;
    state.currentSpin = randomSpins;

    // Update UI to show the selected spin count
    document.querySelectorAll(".spin-button").forEach((b) => {
      if (parseInt(b.dataset.spins) === randomSpins) {
        b.classList.add("selected", "active");
      } else {
        b.classList.remove("selected", "active");
      }
    });

    // Start spinning
    console.log(
      `🌀 Spinning ${state.totalSpins} times as ${state.selectedClass}`
    );
    spinLoadout();
  });
}

// Event Listeners
classButtons.forEach((button) => {
  button.addEventListener("click", () => {
    if (state.isSpinning) return; // Prevent changing selection mid-spin

    // Remove highlight from all class buttons
    classButtons.forEach((b) => b.classList.remove("selected", "active"));

    // Highlight the selected button
    button.classList.add("selected", "active");

    if (button.dataset.class === "random") {
      const classes = ["Light", "Medium", "Heavy"];
      const randomClass = classes[Math.floor(Math.random() * classes.length)];
      state.selectedClass = randomClass;

      // Ensure the randomly chosen class gets highlighted
      classButtons.forEach((b) => {
        if (b.dataset.class === randomClass) {
          b.classList.add("selected", "active");
        }
      });

      // Pick a random number of spins (between 1 and 5)
      const randomSpins = Math.floor(Math.random() * 5) + 1;
      state.totalSpins = randomSpins;
      state.currentSpin = randomSpins;

      // Highlight the correct spin count
      spinButtons.forEach((b) => {
        if (parseInt(b.dataset.spins) === randomSpins) {
          b.classList.add("selected", "active");
        } else {
          b.classList.remove("selected", "active");
        }
      });

      spinLoadout();
    } else {
      state.selectedClass = button.dataset.class;
      spinSelection.classList.remove("disabled");
    }
  });
});

spinButtons.forEach((button) => {
  button.addEventListener("click", () => {
    if (state.isSpinning) return;

    spinButtons.forEach((b) => b.classList.remove("selected", "active"));
    button.classList.add("selected", "active");
    state.totalSpins = parseInt(button.dataset.spins);
    state.currentSpin = state.totalSpins;

    if (state.selectedClass) {
      spinLoadout();
    }
  });
});

// Copy loadout functionality
document.getElementById("copyLoadoutButton")?.addEventListener("click", () => {
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
      "Error: Not all items were properly selected. Please try again after the spin completes."
    );
    return;
  }

  const activeClassButton = document.querySelector(
    ".class-button.selected, .class-button.active"
  );
  const selectedClass = activeClassButton
    ? activeClassButton.dataset.class === "random"
      ? document.querySelector(".class-button.selected:not(.random)")?.dataset
          .class
      : activeClassButton.dataset.class
    : "Unknown";

  const copyText =
    "Class: " +
    selectedClass +
    "\n" +
    "Weapon: " +
    selectedItems[0] +
    "\n" +
    "Specialization: " +
    selectedItems[1] +
    "\n" +
    "Gadget 1: " +
    selectedItems[2] +
    "\n" +
    "Gadget 2: " +
    selectedItems[3] +
    "\n" +
    "Gadget 3: " +
    selectedItems[4];

  navigator.clipboard
    .writeText(copyText)
    .then(() => alert("Loadout copied to clipboard!"))
    .catch((err) => {
      console.error("Could not copy text: ", err);
      alert("Failed to copy loadout to clipboard");
    });
});

function resetSpin() {
  state.isSpinning = false;
  state.currentSpin = 1;
  state.totalSpins = 0;
  state.selectedGadgets.clear();
  state.selectedClass = null;

  // Reset UI elements
  spinButtons.forEach((button) => {
    button.classList.remove("active", "selected");
    button.removeAttribute("disabled");
  });

  // Reset class highlight **only after the spin is fully done**
  setTimeout(() => {
    classButtons.forEach((button) => {
      button.classList.remove("active", "selected");
      button.removeAttribute("disabled");
    });
  }, 1000); // Small delay to ensure spin animation finishes

  spinSelection.classList.add("disabled");
}
