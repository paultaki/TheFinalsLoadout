let state = {
  isSpinning: false,
  selectedGadgets: new Set(),
  gadgetQueue: [],
  currentGadgetPool: new Set(),
  handicap: null,
};
// Add this at the beginning of your ragequit-app.js file, right after the state object

// Debug logging function
function debugLog(message, data) {
  console.log(
    `%c${message}`,
    "background: #ff0000; color: white; padding: 2px 5px; border-radius: 3px;",
    data || ""
  );
}

// Debug the DOM elements and event listeners
document.addEventListener("DOMContentLoaded", () => {
  debugLog("DOM fully loaded - Starting debug");

  // Check if the button exists
  const rageQuitBtn = document.getElementById("rage-quit-btn");
  debugLog("Rage Quit Button exists:", !!rageQuitBtn);

  if (rageQuitBtn) {
    // Add an explicit click handler for testing
    rageQuitBtn.addEventListener("click", function () {
      debugLog("Button clicked directly from debug listener");
      // Test direct call to the spin function
      if (typeof spinRageQuitLoadout === "function") {
        debugLog("Calling spinRageQuitLoadout directly");
        spinRageQuitLoadout();
      } else {
        debugLog(
          "ERROR: spinRageQuitLoadout is not a function",
          typeof spinRageQuitLoadout
        );
      }
    });

    // Simulate a click for testing
    debugLog("Button is clickable:", !rageQuitBtn.disabled);
  }

  // Debug other key functions
  debugLog(
    "spinRageQuitLoadout exists:",
    typeof spinRageQuitLoadout === "function"
  );
  debugLog(
    "displayRageQuitLoadout exists:",
    typeof displayRageQuitLoadout === "function"
  );
  debugLog(
    "startSpinAnimation exists:",
    typeof startSpinAnimation === "function"
  );
  debugLog("finalizeSpin exists:", typeof finalizeSpin === "function");
});

// Debug version of spinRageQuitLoadout
const originalSpinRageQuitLoadout = spinRageQuitLoadout;
spinRageQuitLoadout = function () {
  debugLog("spinRageQuitLoadout called");

  // Check state
  debugLog("Current state:", JSON.stringify(state));

  if (state.isSpinning) {
    debugLog("Already spinning, returning early");
    return;
  }

  try {
    debugLog("Setting disabled attribute on button");
    const btn = document.getElementById("rage-quit-btn");
    if (btn) {
      btn.setAttribute("disabled", "true");
      debugLog("Button disabled:", btn.disabled);
    } else {
      debugLog("ERROR: Button not found when trying to disable");
    }

    debugLog("Setting isSpinning to true");
    state.isSpinning = true;

    debugLog("Clearing currentGadgetPool");
    state.currentGadgetPool.clear();

    debugLog("Calling displayRageQuitLoadout");
    displayRageQuitLoadout();
  } catch (error) {
    debugLog("ERROR in spinRageQuitLoadout:", error.message);
    console.error(error);
  }
};

// Debug version of displayRageQuitLoadout
const originalDisplayRageQuitLoadout = displayRageQuitLoadout;
displayRageQuitLoadout = function () {
  debugLog("displayRageQuitLoadout called");

  try {
    const outputDiv = document.getElementById("output");
    debugLog("Output div exists:", !!outputDiv);

    // Call the original function
    originalDisplayRageQuitLoadout();

    // Check if scroll containers were created
    setTimeout(() => {
      const scrollContainers = document.querySelectorAll(".scroll-container");
      debugLog("Scroll containers created:", scrollContainers.length);
    }, 100);
  } catch (error) {
    debugLog("ERROR in displayRageQuitLoadout:", error.message);
    console.error(error);
  }
};

// Debug version of startSpinAnimation
const originalStartSpinAnimation = startSpinAnimation;
startSpinAnimation = function (columns) {
  debugLog("startSpinAnimation called with columns:", columns.length);

  try {
    // Call the original function
    originalStartSpinAnimation(columns);
  } catch (error) {
    debugLog("ERROR in startSpinAnimation:", error.message);
    console.error(error);
  }
};

// Fix for the finalizeSpin function - redefine it completely
function finalizeSpin() {
  debugLog("finalizeSpin called");

  try {
    // Capture the selected items for history
    const itemContainers = document.querySelectorAll(
      ".slot-machine-wrapper .items-container .item-container"
    );

    debugLog("Item containers found:", itemContainers.length);

    if (itemContainers && itemContainers.length >= 5) {
      try {
        const selectedItems = Array.from(itemContainers).map((container) => {
          const winnerElement = container.querySelector(".itemCol.winner");
          if (winnerElement) {
            return winnerElement.querySelector("p").textContent.trim();
          }
          return "Unknown";
        });

        debugLog("Selected items:", selectedItems);

        // Get a random class for the rage quit loadout
        const classes = ["Light", "Medium", "Heavy"];
        const randomClass = classes[Math.floor(Math.random() * classes.length)];
        debugLog("Random class selected:", randomClass);

        // Add to history if we have valid data
        if (
          selectedItems.length >= 5 &&
          !selectedItems.includes("Unknown") &&
          state.handicap
        ) {
          const weapon = selectedItems[0];
          const specialization = selectedItems[1];
          const gadgets = selectedItems.slice(2, 5);

          debugLog("Adding to history");
          // Add to history
          addToHistory(
            randomClass,
            weapon,
            specialization,
            gadgets,
            state.handicap
          );
        } else {
          debugLog("Not adding to history - conditions not met", {
            hasItems: selectedItems.length >= 5,
            noUnknowns: !selectedItems.includes("Unknown"),
            hasHandicap: !!state.handicap,
          });
        }
      } catch (error) {
        debugLog("ERROR in history collection:", error.message);
        console.error("Error saving loadout history:", error);
      }
    }

    // Re-enable spin button
    debugLog("Re-enabling spin button");
    const btn = document.getElementById("rage-quit-btn");
    if (btn) {
      btn.removeAttribute("disabled");
      debugLog("Button re-enabled");
    } else {
      debugLog("ERROR: Button not found when trying to re-enable");
    }

    // Reset state after spin is complete
    debugLog("Resetting state.isSpinning to false");
    state.isSpinning = false;
  } catch (error) {
    debugLog("ERROR in finalizeSpin:", error.message);
    console.error(error);

    // Emergency recovery - make sure button is re-enabled and state is reset
    try {
      document.getElementById("rage-quit-btn")?.removeAttribute("disabled");
      state.isSpinning = false;
      debugLog("Emergency recovery applied");
    } catch (e) {
      debugLog("ERROR in emergency recovery:", e.message);
    }
  }
}
document.addEventListener("DOMContentLoaded", () => {
  console.log("✅ DOM fully loaded for Rage Quit Simulator");

  loadHistory(); // Load saved history when page loads
  addGPUHints(); // Add GPU performance hints

  // 🔥 Clear Loadout History
  document.getElementById("clear-history")?.addEventListener("click", () => {
    localStorage.removeItem("rageQuitHistory");
    document.getElementById("history-list").innerHTML = "";
    console.log("🗑️ Rage Quit history cleared.");
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

  // Rage Quit Button Click Event
  document
    .getElementById("rage-quit-btn")
    ?.addEventListener("click", function () {
      if (state.isSpinning) return;

      // Play click sound (if file is valid)
      const clickSound = document.getElementById("clickSound");
      if (clickSound && clickSound.readyState >= 2) {
        clickSound.currentTime = 0;
        clickSound
          .play()
          .catch((err) => console.warn("Error playing sound:", err));
      }

      // Start the spin animation
      spinRageQuitLoadout();
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

        const handicapElement = document.querySelector(".handicap-result");
        const handicapText = handicapElement
          ? handicapElement.textContent
          : "None";

        if (selectedItems.includes("Unknown") || selectedItems.length < 5) {
          alert(
            "Error: Not all items were properly selected. Please try again after the spin completes."
          );
          return;
        }

        // Random class selection for rage quit loadout
        const classes = ["Light", "Medium", "Heavy"];
        const randomClass = classes[Math.floor(Math.random() * classes.length)];

        const copyText = `RAGE QUIT LOADOUT\nClass: ${randomClass}\nWeapon: ${selectedItems[0]}\nSpecialization: ${selectedItems[1]}\nGadget 1: ${selectedItems[2]}\nGadget 2: ${selectedItems[3]}\nGadget 3: ${selectedItems[4]}\nHandicap: ${handicapText}`;

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

// Loadouts object - Only the worst items for Rage Quit Simulator
const rageQuitLoadouts = {
  weapons: [
    "Throwing Knives", // Light - Low damage, difficult to aim
    "V9S", // Light - Low damage pistol
    "XP-54", // Light - Challenging to use effectively
    "Model 1887", // Medium - Slow reload, limited use
    "R.357", // Medium - Slow rate of fire, hard to use in close quarters
    "Riot Shield", // Medium - Limits mobility and offensive capability
    "50 Akimbo", // Heavy - Inaccurate, excessive recoil
    "KS-23", // Heavy - Very slow reload
    "SHAK-50", // Heavy - Slow, unwieldy
    "Spear", // Heavy - Limited range and difficult to master
  ],
  specializations: [
    "Cloaking Device", // Limited duration, situational
    "Guardian Turret", // Stationary, can be easily destroyed
    "Mesh Shield", // Blocks your own line of sight
    "Winch Claw", // Very situational
  ],
  gadgets: [
    "Breach Charge", // Situational, can self-damage
    "Thermal Bore", // Limited utility
    "Vanishing Bomb", // Confusing to use effectively
    "Glitch Trap", // Situational
    "Jump Pad", // Very situational
    "Zipline", // Limited use cases
    "Anti-Gravity Cube", // Difficult to use properly
    "Dome Shield", // Can trap yourself
    "Lockbolt Launcher", // Hard to use effectively
    "Flashbang", // Can blind yourself
    "Data Reshaper", // Limited functionality
    "Proximity Sensor", // Often doesn't help in fast-paced combat
  ],
  // New handicaps list
  handicaps: [
    {
      name: "Sloth Mode",
      description: "No Sprinting – Must walk everywhere",
      icon: "🦥",
    },
    {
      name: "Bunny Hop Ban",
      description: "No Jumping – Stairs and ramps only",
      icon: "🐰",
    },
    {
      name: "Permanent Crouch",
      description: "You must stay crouched the entire game",
      icon: "🧎",
    },
    {
      name: "Opposite Day",
      description: "Swap forward/backward and left/right",
      icon: "🔄",
    },
    { name: "Moonwalk Mode", description: "Walk backward only", icon: "🕴️" },
    {
      name: "Controller Drift",
      description: "Cannot stop moving unless using an ability",
      icon: "🎮",
    },
    {
      name: "No Scope Challenge",
      description: "Unmap the ADS button; hipfire only",
      icon: "🎯",
    },
    {
      name: "Flip 'n' Rage",
      description: "Swap up/down and left/right for aiming",
      icon: "🔃",
    },
    {
      name: "Squirrel Mode",
      description: "Max out your mouse DPI/sensitivity",
      icon: "🐿️",
    },
    {
      name: "Snail Aim",
      description: "Set mouse/controller sensitivity to the lowest value",
      icon: "🐌",
    },
    {
      name: "One Stick",
      description: "Use only one joystick/WASD or mouse",
      icon: "🕹️",
    },
    { name: "Mute All", description: "Play with no game sounds", icon: "🔇" },
    {
      name: "Chat Roulette",
      description: "Must type every action in team chat",
      icon: "💬",
    },
    {
      name: "Pacifist Run",
      description: "Can only engage enemies after teammates do",
      icon: "☮️",
    },
    {
      name: "Kamikaze",
      description: "You must rush and melee every enemy you see",
      icon: "💥",
    },
  ],
};

// Helper functions
const getRandomUniqueItems = (array, n) => {
  const shuffled = [...array].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, n);
};

function createItemContainer(items, winningItem = null, isGadget = false) {
  if (isGadget) {
    return items
      .map(
        (item, index) => `
        <div class="itemCol ${index === 4 ? "winner" : ""}">
          <img src="images/${item.replace(
            / /g,
            "_"
          )}.webp" alt="${item}" onerror="this.src='images/placeholder.webp'">
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
        )}.webp" alt="${item}" onerror="this.src='images/placeholder.webp'">
        <p>${item}</p>
      </div>
    `
    )
    .join("");
}

const displayRageQuitLoadout = () => {
  const outputDiv = document.getElementById("output");
  const selectedWeapon = getRandomUniqueItems(rageQuitLoadouts.weapons, 1)[0];
  const selectedSpec = getRandomUniqueItems(
    rageQuitLoadouts.specializations,
    1
  )[0];

  const allGadgets = [...rageQuitLoadouts.gadgets];
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
            ${createItemContainer(rageQuitLoadouts.weapons, selectedWeapon)}
          </div>
        </div>
        <div class="item-container">
          <div class="scroll-container">
            ${createItemContainer(
              rageQuitLoadouts.specializations,
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

const spinRageQuitLoadout = () => {
  if (state.isSpinning) return;

  // Disable button during spin
  document.getElementById("rage-quit-btn").setAttribute("disabled", "true");

  state.isSpinning = true;
  state.currentGadgetPool.clear();

  // Display loadout and start spinning
  displayRageQuitLoadout();
};

// Slightly modified physics constants for the Rage Quit Simulator
const PHYSICS = {
  ACCELERATION: 6500, // Slightly faster for more rage
  MAX_VELOCITY: 4200, // Slightly faster for more rage
  DECELERATION: -3000,
  BOUNCE_DAMPENING: 0.3,
  ITEM_HEIGHT: 188,
  TIMING: {
    COLUMN_DELAY: 400, // Increased delay between columns
    BASE_DURATION: 1500, // Longer base duration
    DECELERATION_TIME: 600, // Longer deceleration time
  },
};

class SlotColumn {
  constructor(element, index) {
    this.element = element;
    this.index = index;
    this.velocity = 0;
    this.position = 0;
    this.state = "waiting";
    this.lastTimestamp = null;
    this.animationStartTime = null;
    this.maxAnimationDuration = 10000; // 10 second safety timeout
    this.onStop = null; // Add this callback property

    this.stopDelay = PHYSICS.TIMING.COLUMN_DELAY * index;
    this.totalDuration = PHYSICS.TIMING.BASE_DURATION + this.stopDelay;
    this.decelerationTime = PHYSICS.TIMING.DECELERATION_TIME;

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
  const startTime = performance.now();

  const slotColumns = columns.map((element, index) => {
    const column = new SlotColumn(element, index);

    // Add the onStop callback for flash effects
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

      // Remove existing locked tag
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
      // When all columns are stopped, trigger the victory flash and spin handicap
      finalVictoryFlash(columns);
      setTimeout(() => {
        spinHandicap();
      }, 1000);
    }
  }

  requestAnimationFrame(animate);
}

// Final victory flash with enhanced effects for Rage Quit
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
          // Create a positioned flash overlay
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

// New function to spin the handicap wheel
function spinHandicap() {
  const handicapContainer = document.getElementById("handicap-container");

  if (!handicapContainer) {
    console.error("Handicap container not found");
    finalizeSpin();
    return;
  }

  // Select a random handicap
  const handicaps = rageQuitLoadouts.handicaps;
  const randomHandicap =
    handicaps[Math.floor(Math.random() * handicaps.length)];
  state.handicap = randomHandicap;

  // Create HTML for the handicap wheel
  const wheelHTML = `
    <div class="handicap-wheel-container">
      <div class="handicap-title">EXTRA PUNISHMENT</div>
      <div class="handicap-wheel">
        <div class="handicap-spinner">
          <div class="handicap-result">
            <span class="handicap-icon">${randomHandicap.icon}</span>
            <span class="handicap-name">${randomHandicap.name}</span>
          </div>
        </div>
      </div>
      <div class="handicap-description">${randomHandicap.description}</div>
    </div>
  `;

  handicapContainer.innerHTML = wheelHTML;

  // Animate the handicap wheel
  const spinner = handicapContainer.querySelector(".handicap-spinner");
  if (spinner) {
    // Spin animation
    spinner.style.animation =
      "spin-wheel 3s cubic-bezier(0.2, 0.8, 0.3, 1) forwards";

    // After spin completes
    setTimeout(() => {
      // Flash effect
      spinner.style.animation = "flash-handicap 0.5s ease-out";

      // Show the result with growing effect
      const result = handicapContainer.querySelector(".handicap-result");
      if (result) {
        result.style.animation = "grow-result 0.5s ease-out forwards";
        result.style.opacity = "1";
      }

      // Finalize the spin and update history
      setTimeout(() => {
        finalizeSpin();
      }, 1000);
    }, 3000);
  } else {
    // Fallback if spinner element not found
    finalizeSpin();
  }
}

// Create confetti effect
function createConfetti() {
  // Create a container for the confetti
  const confettiContainer = document.createElement("div");
  confettiContainer.className = "confetti-container";
  document.body.appendChild(confettiContainer);

  // Confetti colors suited for rage (reds, oranges)
  const colors = [
    "#FF5252",
    "#FF1744",
    "#D50000",
    "#FF4081",
    "#FF9100",
    "#FF6D00",
  ];

  // Create confetti pieces
  for (let i = 0; i < 100; i++) {
    const confetti = document.createElement("div");
    confetti.className = "confetti";
    confetti.style.left = Math.random() * 100 + "vw";
    confetti.style.backgroundColor =
      colors[Math.floor(Math.random() * colors.length)];
    confetti.style.width = Math.random() * 10 + 5 + "px";
    confetti.style.height = Math.random() * 10 + 5 + "px";
    confetti.style.animationDuration = Math.random() * 3 + 2 + "s";

    confettiContainer.appendChild(confetti);
  }

  // Remove the confetti container after animations complete
  setTimeout(() => {
    confettiContainer.remove();
  }, 5000);
}

function addToHistory(
  classType,
  selectedWeapon,
  selectedSpec,
  selectedGadgets,
  handicap
) {
  const historyList = document.getElementById("history-list");
  const newEntry = document.createElement("div");
  newEntry.classList.add("history-entry");

  newEntry.innerHTML = `
    <p><strong>Class:</strong> ${classType}</p>
    <p><strong>Weapon:</strong> ${selectedWeapon}</p>
    <p><strong>Specialization:</strong> ${selectedSpec}</p>
    <p><strong>Gadgets:</strong> ${selectedGadgets.join(", ")}</p>
    <p><strong>Handicap:</strong> ${handicap.name} - ${handicap.description}</p>
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
  localStorage.setItem("rageQuitHistory", JSON.stringify(entries));
}

function loadHistory() {
  const historyList = document.getElementById("history-list");
  const savedEntries =
    JSON.parse(localStorage.getItem("rageQuitHistory")) || [];
  historyList.innerHTML = "";

  savedEntries.forEach((html) => {
    const newEntry = document.createElement("div");
    newEntry.classList.add("history-entry");
    newEntry.innerHTML = html;
    historyList.appendChild(newEntry);
  });
}

function finalizeSpin() {
  // Capture the selected items for history
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

      // Get a random class for the rage quit loadout
      const classes = ["Light", "Medium", "Heavy"];
      const randomClass = classes[Math.floor(Math.random() * classes.length)];

      // Add to history if we have valid data
      if (
        selectedItems.length >= 5 &&
        !selectedItems.includes("Unknown") &&
        state.handicap
      ) {
        const weapon = selectedItems[0];
        const specialization = selectedItems[1];
        const gadgets = selectedItems.slice(2, 5);

        // Add to history
        addToHistory(
          randomClass,
          weapon,
          specialization,
          gadgets,
          state.handicap
        );
      }
    } catch (error) {
      console.error("Error saving loadout history:", error);
    }
  }

  // Re-enable spin button
  document.getElementById("rage-quit-btn").removeAttribute("disabled");

  // Reset state after spin is complete
  state.isSpinning = false;
}

// Function to copy loadout text from history
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
document.addEventListener("click", function (e) {
  console.log("Element clicked:", e.target);
});
