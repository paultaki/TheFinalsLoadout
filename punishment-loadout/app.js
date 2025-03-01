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

// Loadouts object
const loadouts = {
  Light: {
    weapons: ["93R", "Dagger", "SR-84", "Recurve Bow", "Throwing Knives"],
    specializations: ["Cloaking Device", "Evasive Dash"],
    gadgets: [
      "Breach Charge",
      "Gravity Vortex",
      "Thermal Bore",
      "Gravity Vortex",
      "Tracking Dart",
      "Goo Grenade",
      "Pyro Grenade",
      "Smoke Grenade",
    ],
  },
  Medium: {
    weapons: [
      "Dual Blades",
      "FAMAS",
      "CL-40",
      "Model 1887",
      "Pike-556",
      "R.357",
      "Riot Shield",
    ],
    specializations: ["Dematerializer"],
    gadgets: [
      "APS Turret",
      "Data Reshaper",
      "Goo Grenade",
      "Smoke Grenade",
      "Flashbang",
      "Proximity Sensor",
    ],
  },
  Heavy: {
    weapons: ["Flamethrower", "KS-23", "M32GL", "Sledgehammer", "Spear"],
    specializations: ["Charge N Slam", "Goo Gun"],
    gadgets: [
      "Anti-Gravity Cube",
      "C4",
      "Proximity Sensor",
      "RPG-7",
      "Goo Grenade",
      "Smoke Grenade",
      "Flashbang",
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

// Add this to the top of your displayLoadout function to handle the transition
// from placeholder items to actual items

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
      COLUMN_DELAY: 400, // Increase delay to 0.4s for suspense
      BASE_DURATION: 1200, // Extend spin time
      DECELERATION_TIME: 600, // Smoothly slow down
    },
    FINAL_SPIN: {
      COLUMN_DELAY: 800, // Increase final suspense between stops
      BASE_DURATION: 3000, // Extend the final spin
      DECELERATION_TIME: 1000, // More dramatic slow down
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
        this.velocity += PHYSICS.ACCELERATION * dt;
        if (this.velocity >= PHYSICS.MAX_VELOCITY) {
          this.velocity = PHYSICS.MAX_VELOCITY;
          this.state = "spinning";
        }
        break;

      case "spinning":
        if (elapsed >= this.totalDuration - this.decelerationTime) {
          this.state = "decelerating";
          // Ensure target position is aligned with item height
          this.targetPosition =
            Math.ceil(this.position / PHYSICS.ITEM_HEIGHT) *
            PHYSICS.ITEM_HEIGHT;
        }
        break;

      case "decelerating":
        this.velocity += PHYSICS.DECELERATION * dt;

        // Added safety check for deceleration
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

        // Enhanced bounce completion check
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

// Load Sound Effects
const metalClank = new Audio("sounds/metal-clank.mp3");

// 🔊 Reduce volume (0.0 = silent, 1.0 = full volume)
metalClank.volume = 0.1; // Keep metal clank at the right volume

function startSpinAnimation(columns) {
  const slotMachine = document.querySelector(".slot-machine-wrapper");

  // Add flicker effect on spin start
  slotMachine.classList.add("spinning");

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

  // Ensure "LOCKED IN" only appears when the last column stops
  slotColumns.forEach((column, index) => {
    column.updateVisuals = function () {
      let blur = 0;
      if (Math.abs(this.velocity) > 3000) blur = 12;
      else if (Math.abs(this.velocity) > 2000) blur = 8;
      else if (Math.abs(this.velocity) > 1000) blur = 5;

      this.element.style.transform = `translateY(${this.position}px)`;
      this.element.style.filter = blur > 0 ? `blur(${blur}px)` : "none";

      // ✅ Play metal clank only when the LAST column stops and add "LOCKED IN"
      if (this.state === "stopped" && index === slotColumns.length - 1) {
        console.log(
          "🔊 Metal clank playing exactly when the last column stops!"
        );
        metalClank.play();

        // Add the locked-in tag AFTER all columns have stopped
        document.querySelectorAll(".item-container").forEach((container) => {
          if (!container.querySelector(".locked-tag")) {
            const lockedTag = document.createElement("div");
            lockedTag.className = "locked-tag";
            lockedTag.textContent = "LOCKED IN!";
            container.appendChild(lockedTag);

            // Apply animation delay to match final stop
            setTimeout(() => {
              lockedTag.classList.add("show");
            }, 300);
          }
        });
      }
    };
  });

  slotColumns.forEach((column) => (column.state = "accelerating"));

  function animate(currentTime) {
    const elapsed = currentTime - startTime;
    let isAnimating = false;

    slotColumns.forEach((column, index) => {
      if (column.state !== "stopped") {
        isAnimating = true;
        const deltaTime = column.lastTimestamp
          ? currentTime - column.lastTimestamp
          : 16.67;
        column.update(elapsed, deltaTime);
        column.lastTimestamp = currentTime;
      } else {
        // Show locked tag when column stops
        const container = column.element.closest(".item-container");
        const tag = container.querySelector(".locked-tag");
        if (tag) {
          tag.classList.add("show");
        }

        // ✅ Play metal clank only when the LAST column stops
        if (index === slotColumns.length - 1) {
          console.log(
            "🔊 Metal clank playing exactly when the last column stops!"
          );
          metalClank.play();
        }
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

        // ✅ Force remove flicker even if finalizeSpin is slow
        setTimeout(() => {
          console.log("Removing flicker effect..."); // Debugging
          slotMachine.classList.remove("spinning");
        }, 1500); // Ensure flicker is removed after animations
      } else {
        // For non-final spins, just move to the next spin
        setTimeout(() => {
          if (state.selectedClass === "random") {
            displayRandomLoadout();
          } else {
            displayManualLoadout(state.selectedClass);
          }
        }, 300);

        // ✅ Also remove flicker after non-final spins
        setTimeout(() => {
          console.log("Removing flicker effect after normal spin...");
          slotMachine.classList.remove("spinning");
        }, 1500);
      }
    }
  }

  requestAnimationFrame(animate);
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
          <img src="../images/${item.replace(/ /g, "_")}.webp" alt="${item}">
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
        <img src="../images/${item.replace(/ /g, "_")}.webp" alt="${item}">
        <p>${item}</p>
      </div>
    `
    )
    .join("");
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

document.addEventListener("DOMContentLoaded", () => {
  // Set up FAQ toggle
  setupFaqToggle();

  // Set up Generate Punishment button
  setupGeneratePunishment();

  // Default to Medium class
  state.selectedClass = "Medium";
  document.getElementById("selectedClassName").textContent = "Medium";
  document.getElementById("selectedClassText").style.display = "block";

  // Keep your other existing initialization code here
});

function finalizeSpin(columns) {
  console.log("finalizeSpin() called - Finalizing spin.");

  const isFinalSpin = state.currentSpin === 1;

  if (isFinalSpin) {
    console.log("Final spin detected.");

    columns.forEach((column, index) => {
      const container = column.closest(".item-container");
      if (container) {
        // Ensure locked-in visuals
        const lockedTag = document.createElement("div");
        lockedTag.className = "locked-tag";
        lockedTag.textContent = "LOCKED IN";
        container.appendChild(lockedTag);

        setTimeout(() => {
          container.classList.add("landing-flash");
          lockedTag.classList.add("show");

          setTimeout(() => {
            container.classList.add("winner-pulsate");
          }, 300);
        }, index * 200);
      }
    });

    // Reset the state
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

// 🔥 Failsafe: Force Remove Flickering Every 5 Seconds
setInterval(() => {
  const slotMachine = document.querySelector(".slot-machine-wrapper");
  if (slotMachine.classList.contains("spinning")) {
    console.log(
      "🔥 Failsafe Triggered: Removing .spinning to stop flickering."
    );
    slotMachine.classList.remove("spinning");
  }
}, 5000); // Runs every 5 seconds
function setupFaqToggle() {
  const faqToggleButton = document.getElementById("faq-toggle-button");
  const faqContent = document.getElementById("faq-content");
  const faqToggle = document.querySelector(".faq-toggle");

  if (faqToggleButton && faqContent && faqToggle) {
    faqToggleButton.addEventListener("click", function () {
      faqContent.classList.toggle("open");
      faqToggle.textContent = faqToggle.textContent === "+" ? "×" : "+";
      faqToggle.classList.toggle("open");
    });
  }
}

function setupGeneratePunishment() {
  const generateButton = document.getElementById("generatePunishment");

  if (generateButton) {
    generateButton.addEventListener("click", function () {
      if (state.isSpinning) return; // Prevent multiple spins at once

      console.log("🎲 Generating Challenge Loadout...");

      // Pick a random class
      const classes = ["Light", "Medium", "Heavy"];
      const randomClass = classes[Math.floor(Math.random() * classes.length)];
      state.selectedClass = randomClass;

      console.log(`🌀 Selected Class: ${randomClass}`);

      // Display the selected class text
      document.getElementById("selectedClassText").style.display = "block";
      document.getElementById("selectedClassName").textContent = randomClass;

      // Only do ONE spin
      state.totalSpins = 1;
      state.currentSpin = 1;

      // Display and animate the random loadout
      displayLoadout(state.selectedClass, loadouts[state.selectedClass]);
    });
  }
}
