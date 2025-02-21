let state = {
  // ✅ Now it's globally accessible
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

// Animation Constants
const ANIMATION_PHASES = {
  ACCELERATION: "acceleration",
  HIGH_SPEED: "highSpeed",
  DECELERATION: "deceleration",
  STOPPING: "stopping",
};

const ANIMATION_TIMINGS = {
  // Phase durations in milliseconds
  INITIAL_SPIN: {
    ACCELERATION: 500,
    HIGH_SPEED: 2000,
    DECELERATION: 1500,
    STOPPING: 800,
  },
  // Shorter durations for subsequent spins
  REGULAR_SPIN: {
    ACCELERATION: 300,
    HIGH_SPEED: 1200,
    DECELERATION: 1000,
    STOPPING: 500,
  },
  // Delays between column stops
  COLUMN_STOP_DELAY: 300,
  FINAL_COLUMN_DELAY: 500,
};

const ANIMATION_SPEEDS = {
  MIN: 2, // Minimum speed (pixels per frame)
  MAX: 50, // Maximum speed during high-speed phase
  BLUR: {
    // Speed thresholds for blur effects
    HEAVY: 40,
    MEDIUM: 25,
    LIGHT: 10,
  },
};

// Loadouts object
const loadouts = {
  Light: {
    weapons: [
      "93R",
      "Dagger",
      "SR-84",
      "SH190",
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
                            ${createItemContainer(
                              loadout.weapons,
                              selectedWeapon
                            )}
                        </div>
                    </div>
                    <div class="item-container">
                        <div class="scroll-container">
                            ${createItemContainer(
                              loadout.specializations,
                              selectedSpec
                            )}
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

  document.querySelectorAll(".class-button, .spin-button").forEach((btn) => {
    btn.removeAttribute("disabled");
  });

  state.isSpinning = true;
  state.currentSpin = spins || state.currentSpin;
  state.totalSpins = spins || state.totalSpins;

  state.currentGadgetPool.clear();

  updateSpinCountdown();

  if (!state.selectedClass && state.selectedClass !== "random") {
    return;
  }

  if (state.selectedClass === "random") {
    displayRandomLoadout();
  } else {
    displayManualLoadout(state.selectedClass);
  }
};

// Function to update slot image based on speed phase
function updateSlotImage(slotElement, baseImageName, state) {
  let imagePath;
  switch (state) {
    case "fast":
      imagePath = `${baseImageName}_blur2.webp`; // Medium blur
      break;
    case "medium":
      imagePath = `${baseImageName}_blur1.webp`; // Light blur
      break;
    case "slow":
      imagePath = `${baseImageName}.webp`; // Clear image
      break;
  }
  slotElement.src = `images/${imagePath}`;
}

function getRandomItemFromColumn(column, loadout) {
  if (column.dataset.type === "weapon") {
    return getRandomUniqueItems(loadout.weapons, 1)[0];
  }
  if (column.dataset.type === "specialization") {
    return getRandomUniqueItems(loadout.specializations, 1)[0];
  }
  if (column.dataset.type === "gadget") {
    return getRandomUniqueItems(loadout.gadgets, 1)[0];
  }
  return "placeholder"; // Default fallback if nothing is found
}

const startSpinAnimation = (columns) => {
  const itemHeight = 188;
  const isFirstSpin = state.currentSpin === state.totalSpins;
  const columnDelay = 700; // Consistent dramatic delay between columns
  const spinDuration = 3000; // Same longer duration for all spins
  const decelerationTime = 1500; // Same deceleration time for all spins
  let startTime = performance.now();

  // Initialize state for each column
  const columnStates = columns.map((column, index) => ({
    element: column,
    speed: 0,
    offset: 0,
    phase: "spinning",
    stopTime: spinDuration + index * columnDelay, // Each column stops later than the previous
    container: column.closest(".item-container"),
  }));

  // Reset any existing animations
  columns.forEach((column) => {
    const container = column.closest(".item-container");
    if (container) {
      container.classList.remove(
        "landing-flash",
        "winner-pulsate",
        "final-glow"
      );
      container.style.animation = "none";
    }
    column.style.transition = "none";
    column.style.transform = "translateY(0)";
  });

  function animate(currentTime) {
    const elapsed = currentTime - startTime;

    // Update each column
    columnStates.forEach((columnState, index) => {
      // Calculate the column's current speed and position
      if (elapsed < columnState.stopTime - 1000) {
        // Full speed phase
        columnState.speed = ANIMATION_SPEEDS.MAX;
        columnState.phase = "spinning";
      } else if (elapsed < columnState.stopTime) {
        // Deceleration phase
        const timeLeft = columnState.stopTime - elapsed;
        const progress = timeLeft / decelerationTime;
        const easeProgress = progress * progress;

        // Add natural bounce near the end of deceleration
        if (progress < 0.3) {
          // Last 30% of deceleration for longer bounce
          const bounceProgress = 1 - progress / 0.3; // Normalize to 0-1 for bounce
          // Larger bounce (15px) with a sharper curve
          const bounceOffset =
            Math.sin(bounceProgress * Math.PI) *
            15 *
            Math.pow(1 - bounceProgress, 0.5);
          columnState.offset += bounceOffset;
        }

        // Ensure we're grid-aligned during deceleration
        const baseOffset =
          Math.round(columnState.offset / itemHeight) * itemHeight;
        columnState.speed = ANIMATION_SPEEDS.MAX * easeProgress;

        // Apply speed to base-aligned position
        if (progress > 0.3) {
          // Only apply speed before bounce phase
          columnState.offset = baseOffset + (columnState.speed % itemHeight);
        }

        columnState.phase = "slowing";
      }

      // Update position
      columnState.offset = columnState.offset + columnState.speed;
      if (columnState.offset >= itemHeight) {
        columnState.offset = columnState.offset % itemHeight;
      }
      // When nearly stopped, align to grid
      if (columnState.speed < 2) {
        columnState.offset =
          Math.round(columnState.offset / itemHeight) * itemHeight;
      }

      // Apply blur based on speed
      if (columnState.speed >= ANIMATION_SPEEDS.BLUR.HEAVY) {
        columnState.element.style.filter = "blur(15px)";
      } else if (columnState.speed >= ANIMATION_SPEEDS.BLUR.MEDIUM) {
        columnState.element.style.filter = "blur(10px)";
      } else if (columnState.speed >= ANIMATION_SPEEDS.BLUR.LIGHT) {
        columnState.element.style.filter = "blur(5px)";
      } else {
        columnState.element.style.filter = "none";
      }

      // Apply transform
      columnState.element.style.transform = `translateY(${columnState.offset}px)`;
    });

    // Continue animation if any column is still moving
    const lastColumn = columnStates[columnStates.length - 1];
    if (!lastColumn.stopped || elapsed < lastColumn.stopTime + 400) {
      requestAnimationFrame(animate);
    } else {
      finalizeSpin(columns);
    }
  }

  requestAnimationFrame(animate);
};

// Stopping boxes one at a time
function finalizeSpin(columns) {
  if (state.currentSpin > 1) {
    state.currentSpin--;
    updateSpinCountdown();

    // Short delay before next spin
    setTimeout(() => {
      if (state.selectedClass === "random") {
        displayRandomLoadout();
      } else {
        displayManualLoadout(state.selectedClass);
      }
    }, 1500); // Wait 1.5s before next spin
  } else {
    // Reset everything after the final spin
    state.isSpinning = false;
    state.currentSpin = 1;
    state.totalSpins = 0;
    state.selectedGadgets.clear();
    state.selectedClass = null;

    // Reset all buttons
    spinButtons.forEach((button) => {
      button.classList.remove("active", "selected");
      button.removeAttribute("disabled");
    });

    classButtons.forEach((button) => {
      button.classList.remove("active", "selected");
      button.removeAttribute("disabled");
    });

    spinSelection.classList.add("disabled");

    const spinSelectionHeading = document.querySelector("#spinSelection h2");
    if (spinSelectionHeading) {
      spinSelectionHeading.style.opacity = "0.5";
    }
  }
}

const handleSpinComplete = (columns) => {
  columns.forEach((column, index) => {
    column.style.willChange = "auto";
    const itemContainer = column.closest(".item-container");
    const winner = column.querySelector(".winner");

    if (winner) {
      // Reset any existing animations
      winner.style.animation = "none";
      winner.offsetHeight; // Force reflow
      winner.style.animation = null;

      // Add selected class with delay based on index
      setTimeout(() => {
        winner.classList.add("selected");

        // Add final-glow to the container
        if (itemContainer) {
          // Remove any existing animation
          itemContainer.style.animation = "none";
          itemContainer.offsetHeight; // Force reflow
          itemContainer.style.animation = null;

          // Add the glow class
          itemContainer.classList.add("final-glow");
        }
      }, index * 200);
    }
  });

  if (state.currentSpin > 1) {
    state.currentSpin--;
    updateSpinCountdown();

    setTimeout(() => {
      if (state.selectedClass === "random") {
        displayRandomLoadout();
      } else {
        displayManualLoadout(state.selectedClass);
      }
    }, 1000);
  } else {
    // Reset everything after the final spin
    state.isSpinning = false;
    state.currentSpin = 1;
    state.totalSpins = 0;
    state.selectedGadgets.clear();
    state.selectedClass = null; // Reset selected class

    // Reset all spin buttons
    spinButtons.forEach((button) => {
      button.classList.remove("active", "selected");
      button.removeAttribute("disabled");
    });

    // Reset class buttons
    classButtons.forEach((button) => {
      button.classList.remove("active", "selected");
      button.removeAttribute("disabled");
    });

    // Reset spin selection section
    spinSelection.classList.add("disabled");

    // Update the step headings if you want
    const spinSelectionHeading = document.querySelector("#spinSelection h2");
    if (spinSelectionHeading) {
      spinSelectionHeading.style.opacity = "0.5";
    }
    // Clean up animation classes
    document.querySelectorAll(".item-container").forEach((container) => {
      container.classList.remove(
        "landing-flash",
        "winner-pulsate",
        "final-glow"
      );
    });
  }
};

const updateSpinCountdown = () => {
  // Remove 'active' and 'selected' from ALL spin buttons
  spinButtons.forEach((button) => {
    button.classList.remove("active", "selected");
  });

  // Highlight only the button corresponding to the current remaining spins
  const currentButton = [...spinButtons].find(
    (b) => parseInt(b.dataset.spins) === state.currentSpin
  );
  if (currentButton) {
    currentButton.classList.add("active");
  }
};

const createItemContainer = (items, winningItem = null, isGadget = false) => {
  if (isGadget) {
    return items
      .map(
        (item, index) => `
                    <div class="itemCol ${index === 4 ? "winner" : ""}">
                        <img src="images/${item.replace(
                          / /g,
                          "_"
                        )}.webp" alt="${item}">
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
                    <img src="images/${item.replace(
                      / /g,
                      "_"
                    )}.webp" alt="${item}">
                    <p>${item}</p>
                </div>
            `
    )
    .join("");
};

// Add click handlers

classButtons.forEach((button) => {
  button.addEventListener("click", () => {
    if (state.isSpinning) return;

    classButtons.forEach((b) => b.classList.remove("selected", "active"));
    button.classList.add("selected", "active");

    if (button.dataset.class === "random") {
      // Choose random class
      const classes = ["Light", "Medium", "Heavy"];
      // Using a more explicit randomization
      const randomIndex = Math.floor(Math.random() * 3); // 0, 1, or 2
      const randomClass = classes[randomIndex];
      state.selectedClass = randomClass;
      console.log("Random class selected:", randomClass); // Debug log

      // Illuminate the randomly selected class button
      classButtons.forEach((b) => {
        if (b.dataset.class === randomClass) {
          b.classList.add("selected", "active");
        }
      });

      // Choose random number of spins (1-5)
      const randomSpins = Math.floor(Math.random() * 5) + 1;
      state.totalSpins = randomSpins;
      state.currentSpin = randomSpins;

      // Illuminate the randomly selected spin button
      spinButtons.forEach((b) => {
        if (parseInt(b.dataset.spins) === randomSpins) {
          b.classList.add("selected", "active");
        } else {
          b.classList.remove("selected", "active");
        }
      });

      // Start spinning immediately
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

    // Only spin if a class is selected
    if (state.selectedClass) {
      spinLoadout();
    }
  });
});

// Copy loadout functionality
document.getElementById("copyLoadoutButton")?.addEventListener("click", () => {
  // Get all item containers after spin has completed
  const itemContainers = document.querySelectorAll(
    ".slot-machine-wrapper .items-container .item-container"
  );

  if (!itemContainers || itemContainers.length === 0) {
    alert("Error: No items found to copy");
    return;
  }

  // Get the final items that are actually visible in each container
  const selectedItems = Array.from(itemContainers).map((container) => {
    // Get the scroll container
    const scrollContainer = container.querySelector(".scroll-container");
    if (!scrollContainer) return "Unknown";

    // Find the item in the winning position (should have class 'selected' or be visible)
    const allItems = scrollContainer.querySelectorAll(".itemCol");
    const visibleItem = Array.from(allItems).find((item) => {
      const rect = item.getBoundingClientRect();
      const containerRect = container.getBoundingClientRect();
      // Check if this item is in the visible/winning position
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

  // Get the currently selected class
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

  classButtons.forEach((button) => {
    button.classList.remove("active", "selected");
    button.removeAttribute("disabled");
  });

  spinSelection.classList.add("disabled");
}
