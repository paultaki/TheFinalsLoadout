let state = {
  isSpinning: false,
  selectedGadgets: new Set(),
  gadgetQueue: [],
  currentGadgetPool: new Set(),
  handicap: null,
  selectedClass: null, // Add this property
};
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

        // Get the actual class that was selected (or use random if not available)
        const selectedClass =
          state.selectedClass ||
          ["Light", "Medium", "Heavy"][Math.floor(Math.random() * 3)];

        // Fixed template string - using backticks instead of regular quotes
        const copyText = `RAGE QUIT LOADOUT
Class: ${selectedClass}
Weapon: ${selectedItems[0]}
Specialization: ${selectedItems[1]}
Gadget 1: ${selectedItems[2]}
Gadget 2: ${selectedItems[3]}
Gadget 3: ${selectedItems[4]}
Handicap: ${handicapText}`;

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
    "KS-23", // Heavy - Very slow reload
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

  // Replace the handicaps array in your rageQuitLoadouts object with this expanded list

  handicaps: [
    // Movement Handicaps
    {
      name: "Sloth Mode",
      description: "No Sprinting – Must walk everywhere",
      icon: "🦥",
      category: "Movement",
    },
    {
      name: "Bunny Hop Ban",
      description: "No Jumping – Stairs and ramps only",
      icon: "🐰",
      category: "Movement",
    },
    {
      name: "Permanent Crouch",
      description: "You must stay crouched the entire game",
      icon: "🧎",
      category: "Movement",
    },
    {
      name: "Opposite Day",
      description: "Swap forward/backward and left/right",
      icon: "🔄",
      category: "Movement",
    },
    {
      name: "Moonwalk Mode",
      description: "Walk backward only",
      icon: "🕴️",
      category: "Movement",
    },
    {
      name: "Controller Drift",
      description: "Cannot stop moving unless using an ability",
      icon: "🎮",
      category: "Movement",
    },
    {
      name: "Strafe Master",
      description: "Never move forward - only sideways",
      icon: "↔️",
      category: "Movement",
    },
    {
      name: "Zig Zag Only",
      description: "Must constantly alternate left and right while moving",
      icon: "⚡",
      category: "Movement",
    },
    {
      name: "Jump Addict",
      description: "Must jump constantly while moving",
      icon: "🏃",
      category: "Movement",
    },
    {
      name: "Scenic Route",
      description: "Never take the direct path to objectives",
      icon: "🗺️",
      category: "Movement",
    },

    // Aiming Handicaps
    {
      name: "No Scope Challenge",
      description: "Unmap the ADS button; hipfire only",
      icon: "🎯",
      category: "Aiming",
    },
    {
      name: "Flip 'n' Rage",
      description: "Swap up/down and left/right for aiming",
      icon: "🔃",
      category: "Aiming",
    },
    {
      name: "Squirrel Mode",
      description: "Max out your mouse DPI/sensitivity",
      icon: "🐿️",
      category: "Aiming",
    },
    {
      name: "Snail Aim",
      description: "Set mouse/controller sensitivity to the lowest value",
      icon: "🐌",
      category: "Aiming",
    },
    {
      name: "Tunnel Vision",
      description: "Use only 50% of your normal FOV",
      icon: "👁️",
      category: "Aiming",
    },
    {
      name: "Acrobat",
      description: "You can only shoot while jumping or crouched",
      icon: "🤸",
      category: "Aiming",
    },
    {
      name: "Reload Addict",
      description: "Must reload after every kill or every 3 shots",
      icon: "🔄",
      category: "Aiming",
    },
    {
      name: "Quick Draw",
      description: "No aiming down sights for more than 2 seconds",
      icon: "⏱️",
      category: "Aiming",
    },

    // Audio Handicaps
    {
      name: "Mute All",
      description: "Play with no game sounds",
      icon: "🔇",
      category: "Audio",
    },
    {
      name: "Music Only",
      description: "Turn off all sound effects, keep only music",
      icon: "🎵",
      category: "Audio",
    },
    {
      name: "Static Earrape",
      description: "Set voice chat volume to maximum",
      icon: "📢",
      category: "Audio",
    },

    // Communication Handicaps
    {
      name: "Chat Roulette",
      description: "Must type every action in team chat",
      icon: "💬",
      category: "Communication",
    },
    {
      name: "Commentator",
      description: "Must narrate everything you do on voice chat",
      icon: "🎙️",
      category: "Communication",
    },
    {
      name: "Radio Silence",
      description: "No communication with teammates",
      icon: "🤐",
      category: "Communication",
    },

    {
      name: "Sing It",
      description: "Must sing your callouts instead of speaking them",
      icon: "🎤",
      category: "Communication",
    },

    // Gameplay Handicaps
    {
      name: "Pacifist Run",
      description: "Can only engage enemies after teammates do",
      icon: "☮️",
      category: "Gameplay",
    },
    {
      name: "Kamikaze",
      description: "You must rush and melee every enemy you see",
      icon: "💥",
      category: "Gameplay",
    },

    {
      name: "Collector",
      description: "Must pick up every item you see",
      icon: "🧲",
      category: "Gameplay",
    },
    {
      name: "No Healing",
      description: "Cannot use healing items or abilities",
      icon: "❤️‍🩹",
      category: "Gameplay",
    },
    {
      name: "Lone Wolf",
      description: "Must stay at least 50m away from teammates",
      icon: "🐺",
      category: "Gameplay",
    },
    {
      name: "Shadow",
      description: "Must follow exactly 10m behind a teammate",
      icon: "👥",
      category: "Gameplay",
    },
    {
      name: "Half Magazine",
      description: "Can only use half of each magazine before reloading",
      icon: "🔫",
      category: "Gameplay",
    },
    {
      name: "Countdown",
      description: "Can only stay in one spot for 5 seconds max",
      icon: "⏲️",
      category: "Gameplay",
    },

    // Visual Handicaps
    {
      name: "Low Resolution",
      description: "Set your resolution to 800x600",
      icon: "📉",
      category: "Visual",
    },
    {
      name: "Dark Mode Extreme",
      description: "Turn brightness to minimum",
      icon: "🌚",
      category: "Visual",
    },
    {
      name: "Colorblind Simulation",
      description: "Enable colorblind mode even if you're not colorblind",
      icon: "🌈",
      category: "Visual",
    },
    {
      name: "HUD Free",
      description: "Disable all HUD elements",
      icon: "🚫",
      category: "Visual",
    },
    {
      name: "Motion Blur",
      description: "Max out motion blur settings",
      icon: "💫",
      category: "Visual",
    },

    // Challenge Handicaps
    {
      name: "Melee Only",
      description: "Can only use melee attacks",
      icon: "🔪",
      category: "Challenge",
    },
    {
      name: "No Gadgets",
      description: "Cannot use any gadgets or abilities",
      icon: "🛠️",
      category: "Challenge",
    },
    {
      name: "Grenade Spam",
      description: "Must throw all grenades immediately when available",
      icon: "💣",
      category: "Challenge",
    },

    {
      name: "Exposed",
      description: "Never take cover during firefights",
      icon: "🎯",
      category: "Challenge",
    },
    {
      name: "YOLO",
      description: "If you die, you must quit the match",
      icon: "💀",
      category: "Challenge",
    },
    {
      name: "Distracted Gamer",
      description: "Must watch a video on your phone while playing",
      icon: "📱",
      category: "Challenge",
    },
    {
      name: "Bravado",
      description: "Must emote after every kill",
      icon: "💃",
      category: "Challenge",
    },
    {
      name: "The Floor is Lava",
      description: "Stay off the ground as much as possible",
      icon: "🌋",
      category: "Challenge",
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
          <img src="../images/${item.replace(
            / /g,
            "_"
          )}.webp" alt="${item}" onerror="this.src='../images/placeholder.webp'">
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
        <img src="../images/${item.replace(
          / /g,
          "_"
        )}.webp" alt="${item}" onerror="this.src='../images/placeholder.webp'">
        <p>${item}</p>
      </div>
    `
    )
    .join("");
}

const displayRageQuitLoadout = () => {
  const outputDiv = document.getElementById("output");
  const classes = ["Light", "Medium", "Heavy"];
  const selectedClass = classes[Math.floor(Math.random() * classes.length)];

  // ✅ Store the selected class in state for later use
  state.selectedClass = selectedClass;

  // ✅ Update the selected class text in the UI
  const selectedClassElement = document.getElementById("selected-class");
  if (selectedClassElement) {
    selectedClassElement.innerText = selectedClass;
  } else {
    console.warn("⚠️ Warning: #selected-class not found in the DOM!");
  }

  // ✅ Ensure weapons, specializations, and gadgets match the selected class
  const classSpecificLoadouts = {
    Light: {
      weapons: ["Throwing Knives", "Recurve Bow", "SR-84", "Dagger"],
      specializations: ["Cloaking Device"],
      gadgets: [
        "Breach Charge",
        "Glitch Grenade",
        "Gravity Vortex",
        "Tracking Dart",
        "Flashbang",
        "Thermal Bore",
      ],
    },
    Medium: {
      weapons: [
        "Model 1887",
        "R.357",
        "Dual Blades",
        "Pike-556",
        "Riot Shield",
      ],
      specializations: ["Guardian Turret"],
      gadgets: [
        "APS Turret",
        "Data Reshaper",
        "Smoke Grenade",
        "Flashbang",
        "Gas Mine",
        "Glitch Trap",
      ],
    },
    Heavy: {
      weapons: ["KS-23", "Spear", "M60", "M32GL"],
      specializations: ["Mesh Shield", "Goo Gun"],
      gadgets: [
        "Anti-Gravity Cube",
        "C4",
        "Goo Grenade",
        "Lockbolt Launcher",
        "Pyro Mine",
        "Gas Grenade",
        "Proximity Sensor",
      ],
    },
  };

  // ✅ Select the correct items based on the chosen class
  const selectedWeapon = getRandomUniqueItems(
    classSpecificLoadouts[selectedClass].weapons,
    1
  )[0];
  const selectedSpec = getRandomUniqueItems(
    classSpecificLoadouts[selectedClass].specializations,
    1
  )[0];

  // ✅ Pick 3 unique gadgets using the **working method**
  const allGadgets = [...classSpecificLoadouts[selectedClass].gadgets];
  const gadgetChunks = [[], [], []];
  const selectedGadgets = [];

  // Pick 3 unique gadgets for the loadout
  for (let i = 0; i < 3; i++) {
    const index = Math.floor(Math.random() * allGadgets.length);
    selectedGadgets.push(allGadgets[index]);
    allGadgets.splice(index, 1);
  }

  // Shuffle the remaining gadgets for visual spin randomness
  while (allGadgets.length > 0) {
    for (let i = 0; i < 3 && allGadgets.length > 0; i++) {
      const index = Math.floor(Math.random() * allGadgets.length);
      gadgetChunks[i].push(allGadgets[index]);
      allGadgets.splice(index, 1);
    }
  }

  // ✅ Store the final loadout BEFORE the spin animation starts
  state.finalLoadout = {
    classType: selectedClass,
    weapon: selectedWeapon,
    specialization: selectedSpec,
    gadgets: selectedGadgets,
  };

  // Function to create a randomized spin sequence for gadgets
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

  // ✅ Build the UI correctly
  const loadoutHTML = `
    <div class="slot-machine-wrapper">
      <div class="items-container">
        <div class="item-container">
          <div class="scroll-container">
            ${createItemContainer(
              classSpecificLoadouts[selectedClass].weapons,
              selectedWeapon
            )}
          </div>
        </div>
        <div class="item-container">
          <div class="scroll-container">
            ${createItemContainer(
              classSpecificLoadouts[selectedClass].specializations,
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
  ACCELERATION: 3000, // Slower acceleration for gradual build-up
  MAX_VELOCITY: 3000, // Lower velocity for a controlled spin
  DECELERATION: -1500, // Gradual slow down for suspense
  BOUNCE_DAMPENING: 0.2, // Less bouncing to keep the focus on suspense
  ITEM_HEIGHT: 188,
  TIMING: {
    COLUMN_DELAY: 1000, // Increased delay between stops for drama
    BASE_DURATION: 4000, // Longer spin duration for suspense
    DECELERATION_TIME: 1800, // Extended deceleration phase
  },
};

function finalVictoryFlash(columns) {
  setTimeout(() => {
    const allContainers = columns.map((col) => col.closest(".item-container"));
    const itemsContainer = document.querySelector(".items-container");

    allContainers.forEach((container, index) => {
      setTimeout(() => {
        container.classList.remove("mega-flash");
        void container.offsetWidth; // Force reflow
        container.classList.add("mega-flash");

        if (index === allContainers.length - 1) {
          setTimeout(() => {
            if (itemsContainer) {
            }
          }, 100);
        }
      }, index * 150);
    });
  }, 800);
}

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
function saveHistory() {
  const entries = Array.from(document.querySelectorAll(".history-entry")).map(
    (entry) => entry.innerHTML
  );
  localStorage.setItem("rageQuitHistory", JSON.stringify(entries));
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

        if (index === allContainers.length - 1) {
          // Create a positioned flash overlay
          setTimeout(() => {
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
      }, index * 550); // Staggered timing - 150ms between each
    });
  }, 800); // Wait for last column's individual animation to finish
}

// Replace the spinHandicap function in your ragequit-app.js file with this improved version

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

  // Placeholder texts to cycle through for suspense
  const placeholderTexts = [
    "?? ??????? ????",
    "MYSTERY HANDICAP...",
    "SPINNING...",
    "WHAT WILL IT BE?",
    "?? ??? ??? ???",
  ];

  // Create initial spinning UI with placeholder text
  const wheelHTML = `
    <div class="handicap-wheel-container handicap-glow">
      <div class="handicap-title">EXTRA HANDICAP</div>
      <div class="handicap-wheel">
        <div class="handicap-spinner">
          <div class="handicap-result">
            <span class="handicap-icon">🎰</span>
            <span class="handicap-name">${placeholderTexts[0]}</span>
          </div>
        </div>
      </div>
      <div class="handicap-description"></div> <!-- Empty at first for suspense -->
    </div>
  `;

  handicapContainer.innerHTML = wheelHTML;

  const resultName = handicapContainer.querySelector(".handicap-name");
  const resultDescription = handicapContainer.querySelector(
    ".handicap-description"
  );
  const spinner = handicapContainer.querySelector(".handicap-spinner");

  if (spinner) {
    // Spin animation
    spinner.style.animation =
      "spin-wheel 3s cubic-bezier(0.2, 0.8, 0.3, 1) forwards";

    // Cycle through placeholder texts while spinning
    let textIndex = 0;
    const textInterval = setInterval(() => {
      textIndex = (textIndex + 1) % placeholderTexts.length;
      resultName.textContent = placeholderTexts[textIndex];
    }, 250); // Change text every 250ms for more randomness

    // After spin completes
    setTimeout(() => {
      clearInterval(textInterval); // Stop placeholder text changes

      // Reveal final handicap
      resultName.textContent = randomHandicap.name;
      resultDescription.textContent = randomHandicap.description;

      // Flash effect
      spinner.style.animation = "flash-handicap 0.5s ease-out";

      // Add a dramatic sound effect (optional)
      const handicapSound = document.getElementById("handicapSound");
      if (handicapSound && handicapSound.readyState >= 2) {
        handicapSound.currentTime = 0;
        handicapSound
          .play()
          .catch((err) => console.warn("Error playing handicap sound:", err));
      }

      // Finalize the spin and update history
      setTimeout(() => {
        handicapContainer.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
        finalizeSpin();
      }, 1000);
    }, 3000); // Total spin time before revealing final result
  } else {
    finalizeSpin();
  }
}
function addToHistory(
  classType,
  weapon,
  specialization,
  gadgets,
  handicapName,
  handicapDesc
) {
  const historyList = document.getElementById("history-list");
  if (!historyList) return;

  const newEntry = document.createElement("div");
  newEntry.classList.add("history-entry");

  newEntry.innerHTML = `
    <p><strong>Class:</strong> ${classType}</p>
    <p><strong>Weapon:</strong> ${weapon || "Unknown"}</p>
    <p><strong>Specialization:</strong> ${specialization || "Unknown"}</p>
    <p><strong>Gadgets:</strong> ${gadgets || "Unknown"}</p>
    <p><strong>Handicap:</strong> ${handicapName || "None"} - ${
    handicapDesc || "No handicap selected"
  }</p>
    <button class="copy-loadout" onclick="copyLoadoutText(this)">Copy</button>
  `;

  historyList.prepend(newEntry); // ✅ Adds new entry at the top

  // ✅ Ensure history does not exceed 5 entries
  while (historyList.children.length > 5) {
    historyList.removeChild(historyList.lastChild);
  }

  // ✅ Save updated history to localStorage
  if (typeof saveHistory === "function") {
    saveHistory();
  } else {
    console.error("⚠️ Warning: saveHistory function is missing.");
  }
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

// Replace the finalizeSpin function in ragequit-app.js with this version:
function finalizeSpin() {
  // ✅ Capture the selected items directly from the UI
  const itemContainers = document.querySelectorAll(
    ".slot-machine-wrapper .items-container .item-container"
  );

  if (itemContainers.length < 5) {
    console.error("⚠️ ERROR: Not enough items in slot machine.");
    return;
  }

  try {
    // ✅ Extract the visible items from the UI
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

      return visibleItem
        ? visibleItem.querySelector("p").textContent.trim()
        : "Unknown";
    });

    // ✅ Ensure all selections are valid
    if (selectedItems.includes("Unknown") || selectedItems.length < 5) {
      console.error("⚠️ ERROR: Some selected items are missing.");
      return;
    }

    // ✅ Get the class and handicap
    const selectedClass = state.selectedClass || "Unknown";
    const handicapName = state.handicap ? state.handicap.name : "None";
    const handicapDesc = state.handicap
      ? state.handicap.description
      : "No handicap selected";

    // ✅ Format data correctly
    const weapon = selectedItems[0];
    const specialization = selectedItems[1];
    const gadgets = selectedItems.slice(2).join(", ");

    // ✅ Add to history
    addToHistory(
      selectedClass,
      weapon,
      specialization,
      gadgets,
      handicapName,
      handicapDesc
    );

    // ✅ Re-enable the "Generate Rage Loadout" button
    setTimeout(() => {
      document.getElementById("rage-quit-btn").removeAttribute("disabled");
      state.isSpinning = false; // Reset state to allow new spin
      console.log("✅ Button re-enabled and ready for next spin");
    }, 1000);
  } catch (error) {
    console.error("⚠️ ERROR: Something went wrong finalizing spin:", error);
  }
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
