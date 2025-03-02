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
// Move this function declaration to the top of your file
function createItemContainer(items, winningItem = null, isGadget = false) {
  if (isGadget) {
    // For gadgets, use the full gadget list but ensure the winning item is included and properly marked
    const gadgetList = [...loadout.gadgets];

    // Make sure the winning item is in the list
    if (winningItem && !gadgetList.includes(winningItem)) {
      gadgetList.push(winningItem);
    }

    // Shuffle the list
    const shuffledList = gadgetList.sort(() => Math.random() - 0.5);

    // Make sure winning item is at a specific position (e.g., middle)
    const winnerIndex = 4; // Position in the middle
    const winnerPosition = shuffledList.indexOf(winningItem);
    if (winnerPosition !== -1 && winnerPosition !== winnerIndex) {
      // Swap to put winner in the right position
      [shuffledList[winnerIndex], shuffledList[winnerPosition]] = [
        shuffledList[winnerPosition],
        shuffledList[winnerIndex],
      ];
    }

    return shuffledList
      .map(
        (item, index) => `
        <div class="itemCol ${index === winnerIndex ? "winner" : ""}">
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

  // For non-gadgets (weapons, specializations), use similar logic
  const itemList = [...items];
  const winnerIndex = Math.floor(itemList.length / 2); // Middle position
  const winnerPosition = itemList.indexOf(winningItem);
  if (winnerPosition !== -1 && winnerPosition !== winnerIndex) {
    [itemList[winnerIndex], itemList[winnerPosition]] = [
      itemList[winnerPosition],
      itemList[winnerIndex],
    ];
  }

  return itemList
    .map(
      (item, index) => `
      <div class="itemCol ${index === winnerIndex ? "winner" : ""}">
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
// Define outputDiv at the global scope, before any functions
const outputDiv = document.getElementById("output");

document.addEventListener("DOMContentLoaded", () => {
  // Code continues...
});

// Loadouts object
const loadouts = {
  Light: {
    weapons: [
      "Dagger",
      "SR-84",
      "Recurve Bow",
      "Sword",
      "XP-54",
      "Throwing Knives",
    ],
    specializations: ["Cloaking Device", "Evasive Dash"],
    gadgets: [
      "Breach Charge",
      "Gravity Vortex",
      "Sonar Grenade",
      "Thermal Bore",
      "Tracking Dart",
      "Smoke Grenade",
    ],
  },
  Medium: {
    weapons: ["CL-40", "Model 1887", "Pike-556", "R.357", "Riot Shield"],
    specializations: ["Dematerializer"],
    gadgets: [
      "APS Turret",
      "Data Reshaper",
      "Gas Mine",
      "Zipline",
      "Smoke Grenade",
    ],
  },
  Heavy: {
    weapons: ["Flamethrower", "KS-23", "M32GL", "Spear"],
    specializations: ["Charge N Slam", "Goo Gun"],
    gadgets: [
      "Anti-Gravity Cube",
      "C4",
      "Proximity Sensor",
      "Goo Grenade",
      "Smoke Grenade",
      "Flashbang",
    ],
  },
};

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
document.getElementById("copyLoadoutButton")?.addEventListener("click", () => {
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
    const handicapText = handicapElement ? handicapElement.textContent : "None";

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

// Replace the handicaps array in your rageQuitLoadouts object with this expanded list
const rageQuitLoadouts = {
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
      name: "One Stick",
      description: "Use only one joystick/WASD or mouse",
      icon: "🕹️",
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
      name: "Glass Cannon",
      description: "No armor or defensive abilities allowed",
      icon: "🔮",
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
      name: "Last Bullet",
      description: "Only the last bullet in your magazine deals damage",
      icon: "🎲",
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
  // Create a copy to avoid modifying the original array
  const available = [...array];
  const result = [];

  // Ensure we don't request more items than are available
  const count = Math.min(n, available.length);

  for (let i = 0; i < count; i++) {
    // Get a random index from remaining items
    const randomIndex = Math.floor(Math.random() * available.length);
    // Add the item to our results
    result.push(available[randomIndex]);
    // Remove the item so it can't be selected again
    available.splice(randomIndex, 1);
  }

  return result;
};

// Fixed function to create item containers with proper winner class
function createItemContainer(items, winningItem = null, isGadget = false) {
  // When creating the container, make sure to mark the winning item
  return items
    .map((item) => {
      const isWinner = item === winningItem;
      return `
        <div class="itemCol ${isWinner ? "winner" : ""}">
          <img src="../images/${item.replace(
            / /g,
            "_"
          )}.webp" alt="${item}" onerror="this.src='../images/placeholder.webp'">
          <p>${item}</p>
        </div>
      `;
    })
    .join("");
}

// Then update the displayRageQuitLoadout function:

const displayRageQuitLoadout = () => {
  // Randomly select a class
  const classes = ["Light", "Medium", "Heavy"];
  const randomClass = classes[Math.floor(Math.random() * classes.length)];

  state.selectedClass = randomClass;

  // Update the selected class text
  const selectedClassElement = document.getElementById("selected-class");
  if (selectedClassElement) {
    selectedClassElement.textContent = randomClass;
  }

  // Get the loadout for the selected class
  const loadout = loadouts[randomClass];

  // Debug logging to verify items are being selected
  console.log(`Class: ${randomClass}`);
  console.log(`Available weapons: ${loadout.weapons.join(", ")}`);
  console.log(
    `Available specializations: ${loadout.specializations.join(", ")}`
  );
  console.log(`Available gadgets: ${loadout.gadgets.join(", ")}`);

  // Make sure we have items to select from
  if (
    !loadout ||
    !loadout.weapons.length ||
    !loadout.specializations.length ||
    !loadout.gadgets.length
  ) {
    console.error("Missing loadout items for class:", randomClass);
    return;
  }

  // Select random items for each category
  const selectedWeapon = getRandomUniqueItems(loadout.weapons, 1)[0];
  const selectedSpec = getRandomUniqueItems(loadout.specializations, 1)[0];

  // Make sure gadgets are unique by using getRandomUniqueItems
  const selectedGadgets = getRandomUniqueItems(loadout.gadgets, 3);

  console.log(`Selected weapon: ${selectedWeapon}`);
  console.log(`Selected specialization: ${selectedSpec}`);
  console.log(`Selected gadgets: ${selectedGadgets.join(", ")}`);
  console.log(
    "Are gadgets unique?",
    new Set(selectedGadgets).size === selectedGadgets.length
  );

  // Create HTML with explicit separate gadget creation
  const gadgetHtml = selectedGadgets
    .map((gadget, index) => {
      // Log each gadget being rendered to help debug
      console.log(`Creating container for gadget ${index}: ${gadget}`);
      return `<div class="item-container">
      <div class="scroll-container" data-gadget-index="${index}">
        ${createItemContainer([gadget], gadget, true)}
      </div>
    </div>`;
    })
    .join("");

  // Create the complete loadout HTML - ensuring weapon and specialization are included
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
        ${gadgetHtml}
      </div>
    </div>
  `;

  // Add the HTML to the output div
  const outputDiv = document.getElementById("output");
  if (outputDiv) {
    outputDiv.innerHTML = loadoutHTML;
  } else {
    console.error("Output div not found");
    return;
  }

  // Start the spin animation after a short delay
  setTimeout(() => {
    const scrollContainers = Array.from(
      document.querySelectorAll(".scroll-container")
    );
    startSpinAnimation(scrollContainers);
  }, 100);
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

document.addEventListener("DOMContentLoaded", () => {
  console.log("✅ DOM fully loaded for Rage Quit Simulator");

  loadHistory(); // Load saved history when page loads
  addGPUHints(); // Add GPU performance hints

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
      // Your existing copy loadout code...
    });

  // Other initialization code...
});

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

  // Continue with normal animation initialization
  const startTime = performance.now();

  // Create slot columns
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

  // Set all columns to accelerating state to start animation
  slotColumns.forEach((column) => (column.state = "accelerating"));

  // Animation loop function
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

  // Start the animation loop
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

  // Create HTML for the handicap wheel
  const wheelHTML = `
    <div class="handicap-wheel-container handicap-glow">
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

      // Add a dramatic sound effect (optional - if you have a sound file)
      const handicapSound = document.getElementById("handicapSound");
      if (handicapSound && handicapSound.readyState >= 2) {
        handicapSound.currentTime = 0;
        handicapSound
          .play()
          .catch((err) => console.warn("Error playing handicap sound:", err));
      }

      // Finalize the spin and update history
      setTimeout(() => {
        // Scroll to ensure the handicap is visible
        handicapContainer.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
        finalizeSpin();
      }, 1000);
    }, 3000);
  } else {
    // Fallback if spinner element not found
    finalizeSpin();
  }
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

// Replace the finalizeSpin function in ragequit-app.js with this version:

function finalizeSpin() {
  // Capture the selected items for history
  const itemContainers = document.querySelectorAll(
    ".slot-machine-wrapper .items-container .item-container"
  );

  if (itemContainers && itemContainers.length >= 3) {
    try {
      const selectedItems = Array.from(itemContainers).map((container) => {
        const winnerElement = container.querySelector(".itemCol.winner");
        if (winnerElement) {
          return winnerElement.querySelector("p").textContent.trim();
        }
        return "Unknown";
      });

      // Use the class stored in state
      const selectedClass = state.selectedClass || "Unknown";

      // Add to history if we have valid data
      if (
        selectedItems.length >= 3 &&
        !selectedItems.includes("Unknown") &&
        state.handicap
      ) {
        const weapon = selectedItems[0];
        const specialization = selectedItems[1];
        const gadgets = selectedItems.slice(2); // Get all gadgets

        // Add correct class to history
        addToHistory(
          selectedClass,
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

  // Re-enable the Rage Quit button
  document.getElementById("rage-quit-btn").removeAttribute("disabled");
  state.isSpinning = false;
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
