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

function updateSpinCountdown() {
  document.querySelectorAll(".spin-button").forEach((button) => {
    button.classList.remove("active", "selected");
  });

  const currentButton = [...document.querySelectorAll(".spin-button")].find(
    (b) => parseInt(b.dataset.spins) === state.currentSpin
  );

  if (currentButton) {
    currentButton.classList.add("active");
  }
}

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
    document.querySelectorAll(".class-button, .spin-button").forEach((btn) => {
      btn.removeAttribute("disabled");
    });
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
      BASE_DURATION: 600,
      DECELERATION_TIME: 400,
    },
    FINAL_SPIN: {
      COLUMN_DELAY: 900, // 0.6s between stops for final spin
      BASE_DURATION: 2500,
      DECELERATION_TIME: 900,
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
    this.onStop = null; // Add this callback property

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

    // Call the onStop callback if it exists
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

function startSpinAnimation(columns) {
  const isFinalSpin = state.currentSpin === 1;
  const startTime = performance.now();

  const slotColumns = columns.map((element, index) => {
    const column = new SlotColumn(element, index, isFinalSpin);

    // Add the onStop callback for final spin effects
    if (isFinalSpin) {
      column.onStop = (columnElement) => {
        const container = columnElement.closest(".item-container");
        if (container) {
          // Apply initial flash effect
          container.classList.remove("final-flash"); // Ensure restart
          void container.offsetWidth; // Force reflow
          container.classList.add("final-flash");

          // Add locked in tag with animation
          if (!container.querySelector(".locked-tag")) {
            const lockedTag = document.createElement("div");
            lockedTag.className = "locked-tag";
            lockedTag.textContent = "LOCKED IN!";
            container.appendChild(lockedTag);

            // Small delay for tag animation
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
    }

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

      // Remove existing locked tag for non-final spins
      if (!isFinalSpin) {
        const existingTag = container.querySelector(".locked-tag");
        if (existingTag) {
          existingTag.remove();
        }
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
      // When all columns are stopped, if this is the final spin, trigger the victory flash
      if (isFinalSpin) {
        finalVictoryFlash(columns);
      }
      finalizeSpin(columns);
    }
  }

  requestAnimationFrame(animate);
}

// These should be defined outside finalizeSpin, at the top level of your file
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

  // Ensure the history list contains only the last 5 entries
  while (historyList.children.length > 5) {
    historyList.removeChild(historyList.lastChild);
  }

  saveHistory();
}

function saveHistory() {
  const entries = Array.from(document.querySelectorAll(".history-entry")).map(
    (entry) => entry.innerHTML
  );
  localStorage.setItem("loadoutHistory", JSON.stringify(entries));
}

function loadHistory() {
  const historyList = document.getElementById("history-list");
  const savedEntries = JSON.parse(localStorage.getItem("loadoutHistory")) || [];
  historyList.innerHTML = "";

  savedEntries.forEach((html) => {
    const newEntry = document.createElement("div");
    newEntry.classList.add("history-entry");
    newEntry.innerHTML = html;
    historyList.appendChild(newEntry);
  });
}

function copyLoadoutText(button) {
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
}

// Fix for the finalizeSpin function to capture and save history
function finalizeSpin(columns) {
  const isFinalSpin = state.currentSpin === 1;

  if (state.currentSpin > 1) {
    state.currentSpin--;
    updateSpinCountdown();

    document
      .querySelectorAll(".class-button, .spin-button")
      .forEach((button) => button.removeAttribute("disabled"));

    setTimeout(() => {
      if (state.selectedClass === "random") {
        displayRandomLoadout();
      } else {
        displayManualLoadout(state.selectedClass);
      }
    }, 400);
    return;
  }

  if (isFinalSpin) {
    // Capture the selected items for history before resetting state
    const itemContainers = document.querySelectorAll(
      ".slot-machine-wrapper .items-container .item-container"
    );

    if (itemContainers && itemContainers.length >= 5) {
      try {
        const selectedItems = Array.from(itemContainers).map((container) => {
          const winnerElement = container.querySelector(".itemCol.winner");
          if (winnerElement) {
            return winnerElement.querySelector("p").textContent.trim();
          }
          return "Unknown";
        });

        // Get the currently selected class
        const selectedClass = state.selectedClass || "Unknown";

        // Add to history if we have valid data
        if (selectedItems.length >= 5 && !selectedItems.includes("Unknown")) {
          const weapon = selectedItems[0];
          const specialization = selectedItems[1];
          const gadgets = selectedItems.slice(2, 5);

          // Add to history
          addToHistory(selectedClass, weapon, specialization, gadgets);
        }
      } catch (error) {
        console.error("Error saving loadout history:", error);
      }
    }

    // Reset state after final spin
    state.isSpinning = false;
    state.currentSpin = 1;
    state.totalSpins = 0;
    state.selectedGadgets.clear();
    state.selectedClass = null;

    document
      .querySelectorAll(".class-button, .spin-button")
      .forEach((button) => button.classList.remove("active", "selected"));

    document.getElementById("spinSelection").classList.remove("disabled");
  }
}

// Improved final victory flash function with contained effects
function finalVictoryFlash(columns) {
  // Wait for the last column to finish its individual animation
  setTimeout(() => {
    const allContainers = columns.map((col) => col.closest(".item-container"));
    const itemsContainer = document.querySelector(".items-container");

    // Add a big flash animation to each container in sequence
    allContainers.forEach((container, index) => {
      setTimeout(() => {
        // Remove any existing animation to reset
        container.classList.remove("mega-flash");
        void container.offsetWidth; // Force reflow

        // Add the mega flash
        container.classList.add("mega-flash");

        // If this is the last container, trigger confetti and final flash
        if (index === allContainers.length - 1) {
          // Trigger confetti in the container
          setTimeout(() => {
            createConfetti();

            // Add a flash effect just to the items container
            if (itemsContainer) {
              // Create a positioned flash overlay
              const flashOverlay = document.createElement("div");

              // Ensure container has positioning for absolute children
              if (getComputedStyle(itemsContainer).position === "static") {
                itemsContainer.style.position = "relative";
              }

              // Style the flash element
              flashOverlay.style.position = "absolute";
              flashOverlay.style.top = "0";
              flashOverlay.style.left = "0";
              flashOverlay.style.width = "100%";
              flashOverlay.style.height = "100%";
              flashOverlay.style.backgroundColor = "rgba(255, 255, 255, 0)";
              flashOverlay.style.pointerEvents = "none";
              flashOverlay.style.zIndex = "90";

              // Add it to the container
              itemsContainer.appendChild(flashOverlay);

              // Create and apply the flash animation
              flashOverlay.animate(
                [
                  { backgroundColor: "rgba(255, 255, 255, 0)" },
                  { backgroundColor: "rgba(255, 255, 255, 0.7)" },
                  { backgroundColor: "rgba(255, 255, 255, 0)" },
                ],
                {
                  duration: 600,
                  easing: "ease-out",
                  fill: "forwards",
                }
              );

              // Remove the overlay after animation
              setTimeout(() => {
                flashOverlay.remove();
              }, 700);
            }
          }, 100); // Small delay after the last mega-flash starts
        }
      }, index * 150); // Staggered timing - 150ms between each
    });
  }, 800); // Wait for last column's individual animation to finish
}

document.addEventListener("DOMContentLoaded", () => {
  console.log("✅ DOM fully loaded");

  loadHistory(); // Load saved history when page loads

  // 🔥 Clear Loadout History
  document.getElementById("clear-history")?.addEventListener("click", () => {
    localStorage.removeItem("loadoutHistory");
    document.getElementById("history-list").innerHTML = "";
    console.log("🗑️ Loadout history cleared.");
  });

  // 🔥 Dark Mode Toggle Logic
  const darkModeToggle = document.getElementById("darkModeToggle");
  if (darkModeToggle) {
    if (localStorage.getItem("darkMode") === "enabled") {
      document.body.classList.add("dark-mode");
    }

    darkModeToggle.addEventListener("click", () => {
      document.body.classList.toggle("dark-mode");

      if (document.body.classList.contains("dark-mode")) {
        localStorage.setItem("darkMode", "enabled");
      } else {
        localStorage.removeItem("darkMode");
      }
    });
  }

  // Class Button Click Event
  document.querySelectorAll(".class-button").forEach((button) => {
    button.addEventListener("click", function () {
      if (state.isSpinning) return;

      // Reset all buttons to their default images
      document.querySelectorAll(".class-button").forEach((btn) => {
        let classType = btn.dataset.class.toLowerCase();

        if (classType === "random") {
          btn.src = `images/random_dice.webp`;
          btn.classList.remove("active", "pulsing");
        } else {
          btn.src = `images/${classType}_silhouette.webp`;
          btn.classList.remove("active", "selected");
        }
      });

      // Handle the clicked button
      let selectedClass = this.dataset.class.toLowerCase();

      if (selectedClass === "random") {
        this.classList.add("pulsing");

        // Select a random class
        const classes = ["Light", "Medium", "Heavy"];
        const randomClass = classes[Math.floor(Math.random() * classes.length)];
        state.selectedClass = randomClass;

        // Highlight the selected class and update its image
        document.querySelectorAll(".class-button").forEach((b) => {
          b.classList.remove("selected", "active");
          if (b.dataset.class === randomClass) {
            b.classList.add("selected", "active");
            // Update the image to the active variant
            b.src = `images/${randomClass.toLowerCase()}_active.webp`;
          }
        });

        // Select random spins (1-5)
        const randomSpins = Math.floor(Math.random() * 5) + 1;
        state.totalSpins = randomSpins;
        state.currentSpin = randomSpins;

        // Highlight the selected spin button
        document.querySelectorAll(".spin-button").forEach((b) => {
          if (parseInt(b.dataset.spins) === randomSpins) {
            b.classList.add("selected", "active");
          } else {
            b.classList.remove("selected", "active");
          }
        });

        // Enable spin buttons
        document
          .querySelectorAll(".spin-button")
          .forEach((btn) => btn.removeAttribute("disabled"));
        document.getElementById("spinSelection").classList.remove("disabled");

        // Start spin animation automatically
        setTimeout(() => {
          spinLoadout(state.totalSpins);
        }, 300);
      } else {
        // Manual class selection
        this.src = `images/${selectedClass}_active.webp`;
        state.selectedClass = this.dataset.class;
        this.classList.add("active", "selected");

        // Enable spin buttons for manual selection
        document.querySelectorAll(".spin-button").forEach((btn) => {
          btn.removeAttribute("disabled");
        });
        document.getElementById("spinSelection").classList.remove("disabled");
      }

      console.log(`Selected class: ${state.selectedClass}`);
    });
  });

  // Spin Button Click Event
  document.querySelectorAll(".spin-button").forEach((button) => {
    button.addEventListener("click", () => {
      if (state.isSpinning) return;

      try {
        // Play click sound (if file is valid)
        const clickSound = document.getElementById("clickSound");
        if (clickSound && clickSound.readyState >= 2) {
          clickSound.currentTime = 0;
          clickSound
            .play()
            .catch((err) => console.warn("Error playing sound:", err));
        }

        document
          .querySelectorAll(".spin-button")
          .forEach((b) => b.classList.remove("selected", "active"));
        button.classList.add("selected", "active");

        state.totalSpins = parseInt(button.dataset.spins);
        state.currentSpin = state.totalSpins;

        // Always trigger spinLoadout when both class and spins are selected
        if (state.selectedClass) {
          spinLoadout(state.totalSpins); // Pass the number of spins explicitly
        } else {
          console.warn("No class selected!");
        }
      } catch (error) {
        console.error("Error in spin button handler:", error);
      }
    });
  });

  // 🔥 Copy Loadout Button
  document
    .getElementById("copyLoadoutButton")
    ?.addEventListener("click", () => {
      try {
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
          return visibleItem.querySelector("p")?.innerText.trim() || "Unknown";
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
            ? document.querySelector(".class-button.selected:not(.random)")
                ?.dataset.class
            : activeClassButton.dataset.class
          : "Unknown";

        const copyText = `Class: ${selectedClass}\nWeapon: ${selectedItems[0]}\nSpecialization: ${selectedItems[1]}\nGadget 1: ${selectedItems[2]}\nGadget 2: ${selectedItems[3]}\nGadget 3: ${selectedItems[4]}`;

        navigator.clipboard
          .writeText(copyText)
          .then(() => alert("Loadout copied to clipboard!"))
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
