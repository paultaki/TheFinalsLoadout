const state = {
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

let spinButtons;
let classButtons;
let spinSelection;
let outputDiv;

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

// Helper functions
document.addEventListener("DOMContentLoaded", () => {
  // DOM element queries after loaded
  classButtons = document.querySelectorAll(".class-button");
  spinButtons = document.querySelectorAll(".spin-button");
  spinSelection = document.getElementById("spinSelection");
  outputDiv = document.getElementById("output"); // assign here after DOM loaded

  console.log("✅ DOM fully loaded");

  if (!state.selectedClass) {
    spinButtons.forEach((button) => {
      button.disabled = true;
      button.classList.add("dimmed");
    });
  }

  // Class button event listeners
  // Class button event listeners
  classButtons.forEach((button) => {
    button.addEventListener("click", () => {
      if (state.isSpinning) return;

      console.log(`✅ Class Selected: ${button.dataset.class}`);

      // Clear previous selections and reset images
      classButtons.forEach((b) => {
        b.classList.remove("selected", "active");
        b.src = b.dataset.default; // Reset image to default
      });

      // Select current button
      button.classList.add("selected", "active");
      button.src = button.dataset.active; // Change image to active

      // Handle "Random" class selection
      if (button.dataset.class.toLowerCase() === "random") {
        // Get a random class
        const classes = ["Light", "Medium", "Heavy"];
        const randomClass = classes[Math.floor(Math.random() * classes.length)];
        state.selectedClass = randomClass;
        console.log(`🎲 Randomly Chosen Class: ${randomClass}`);

        // Pick a random spin count (1-5)
        const randomSpins = Math.floor(Math.random() * 5) + 1;
        state.totalSpins = randomSpins;
        console.log(`🔄 Random Spins: ${randomSpins}`);

        // Highlight the randomly selected class button
        classButtons.forEach((b) => {
          if (b.dataset.class.toLowerCase() === randomClass.toLowerCase()) {
            b.classList.add("selected");
            b.src = b.dataset.active; // Switch image for selected class
          }
        });

        // Highlight the randomly selected spin button
        spinButtons.forEach((b) => {
          b.classList.toggle(
            "selected",
            parseInt(b.dataset.spins) === randomSpins
          );
        });

        // Start the spin process immediately
        spinLoadout();
      } else {
        // Set selected class and enable spin buttons
        state.selectedClass = button.dataset.class;
        console.log(`✅ Selected Class Stored: ${state.selectedClass}`);

        // Remove disabled class from spin selection container
        if (spinSelection) {
          spinSelection.classList.remove("disabled");
        } else {
          console.warn("spinSelection element not found");
        }

        // Enable all spin buttons when a class is selected
        // This ensures they can be re-enabled after being disabled at the end of a spin
        spinButtons.forEach((btn) => {
          btn.disabled = false; // Enable buttons
          btn.removeAttribute("disabled"); // Make sure the attribute is removed
          btn.classList.remove("dimmed"); // Remove dimming effect
          btn.style.opacity = ""; // Reset any inline opacity
          btn.style.pointerEvents = ""; // Reset any inline pointer-events
        });
      }
    });

    // Add hover effect to switch images
    button.addEventListener("mouseenter", () => {
      button.src = button.dataset.active;
    });

    button.addEventListener("mouseleave", () => {
      if (!button.classList.contains("selected")) {
        button.src = button.dataset.default;
      }
    });
  });
  // Add spin button click handlers
  spinButtons.forEach((button) => {
    button.addEventListener("click", () => {
      if (button.disabled || state.isSpinning) return;

      console.log(`🎲 Spin button clicked: ${button.dataset.spins} spins`);

      // Update the selected number of spins
      state.totalSpins = parseInt(button.dataset.spins);

      // Visual feedback - highlight the selected button
      spinButtons.forEach((btn) => btn.classList.remove("selected", "active"));
      button.classList.add("selected", "active");

      // Start the spin process
      spinLoadout();
    });
  });

  // 👉 Copy loadout functionality
  document
    .getElementById("copyLoadoutButton")
    ?.addEventListener("click", () => {
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
          "Error: Not all items were properly selected. Try again after the spin completes."
        );
        return;
      }

      const activeClassButton = document.querySelector(
        ".class-button.selected, .class-button.active"
      );
      const selectedClass = activeClassButton
        ? activeClassButton.dataset.class.toLowerCase() === "random"
          ? document.querySelector(
              ".class-button.selected:not([data-class='Random'])"
            )?.dataset.class
          : activeClassButton.dataset.class
        : "Unknown";

      const copyText = `Class: ${selectedClass}
Weapon: ${selectedItems[0]}
Specialization: ${selectedItems[1]}
Gadget 1: ${selectedItems[2]}
Gadget 2: ${selectedItems[3]}
Gadget 3: ${selectedItems[4]}`;

      navigator.clipboard
        .writeText(copyText)
        .then(() => alert("Loadout copied to clipboard!"))
        .catch((err) => {
          console.error("Could not copy text: ", err);
          alert("Failed to copy loadout to clipboard");
        });
    });

  // Load history when page loads (only once)
  loadHistory();

  // Clear history button (moved out of copyLoadoutButton event handler)
  document.getElementById("clear-history")?.addEventListener("click", () => {
    localStorage.removeItem("loadoutHistory");
    document.getElementById("history-list").innerHTML = "";
    console.log("🗑️ Loadout history cleared.");
  });

  // FAQ Toggle (moved out of copyLoadoutButton event handler)
  const faqToggle = document.getElementById("faq-toggle-button");
  const faqContent = document.getElementById("faq-content");
  const faqToggleIcon = document.querySelector(".faq-toggle");

  if (faqToggle && faqContent) {
    faqToggle.addEventListener("click", () => {
      faqContent.classList.toggle("open");
      faqToggleIcon.innerText = faqContent.classList.contains("open")
        ? "−"
        : "+";
    });
  }
}); // ✅ DOMContentLoaded CLOSES HERE!

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
        this.velocity += PHYSICS.ACCELERATION * dt * 1.5; // Increased acceleration
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
        this.velocity += PHYSICS.DECELERATION * dt * 1.2; // Smoother deceleration
        if (
          Math.abs(this.position - this.targetPosition) < 3 &&
          Math.abs(this.velocity) < 50
        ) {
          this.forceStop();
          return;
        }
        if (this.velocity <= 0) {
          if (Math.abs(this.velocity) < 150) {
            // Make stopping less abrupt
            this.forceStop();
          } else {
            this.velocity = -this.velocity * (PHYSICS.BOUNCE_DAMPENING * 1.2);
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
    if (Math.abs(this.velocity) > 3500)
      blur = 15; // Increased blur for high-speed effect
    else if (Math.abs(this.velocity) > 2500) blur = 10;
    else if (Math.abs(this.velocity) > 1500) blur = 6;
    // Shake effect when stopping
    let shakeX =
      this.state === "bouncing" ? Math.sin(performance.now() / 100) * 2 : 0;

    this.element.style.transform = `translate(${shakeX}px, ${this.position}px)`;
    this.element.style.filter = blur > 0 ? `blur(${blur}px)` : "none";
  }
}

function startSpinAnimation(columns) {
  // Final spin is when we're on the last spin (currentSpin === 1)
  const isFinalSpin = state.currentSpin === 1;
  console.log(
    `🎲 Animation starting with currentSpin = ${state.currentSpin}, isFinalSpin = ${isFinalSpin}`
  );

  const startTime = performance.now();

  const slotColumns = columns.map(
    (element, index) => new SlotColumn(element, index, isFinalSpin)
  );

  // Reset containers
  columns.forEach((column) => {
    const container = column.closest(".item-container");
    if (container) {
      container.classList.remove("landing-flash", "winner-pulsate");
      const lockedTag = container.querySelector(".locked-tag");
      if (lockedTag) lockedTag.remove();
    }
    column.style.transform = "translateY(0)";
    column.style.transition = "none";
  });

  // Initialize animation states clearly
  slotColumns.forEach((column) => {
    column.state = "accelerating";
    column.velocity = 0;
    column.position = 0;
    column.lastTimestamp = null;
  });

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
      // IMPORTANT CHANGE: Always call finalizeSpin after any spin completes
      // Just like in your old working version
      console.log("✅ All columns stopped, calling finalizeSpin");

      // Add visual effects only for final spin
      if (isFinalSpin) {
        let lastColumnIndex = columns.length - 1;

        columns.forEach((column, index) => {
          const container = column.closest(".item-container");
          if (container) {
            setTimeout(() => {
              container.classList.add("landing-flash");

              let lockedTag = container.querySelector(".locked-tag");
              if (!lockedTag) {
                lockedTag = document.createElement("div");
                lockedTag.className = "locked-tag show";
                lockedTag.textContent = "Locked In!";
                container.appendChild(lockedTag);
              }

              // If this is the last column, disable buttons when its tag appears
              if (index === lastColumnIndex) {
                console.log("🔒 Last locked tag added, disabling spin buttons");
                const spinBtns = document.querySelectorAll(".spin-button");
                spinBtns.forEach((button) => {
                  button.disabled = true;
                  button.setAttribute("disabled", "disabled");
                  button.classList.add("dimmed");
                });
                console.log(`Disabled ${spinBtns.length} spin buttons`);
              }

              setTimeout(() => container.classList.add("winner-pulsate"), 300);
            }, index * 200);
          }
        });
      }

      // Let finalizeSpin handle whether to continue or end the sequence
      setTimeout(
        () => {
          finalizeSpin(columns);
        },
        isFinalSpin ? 1000 : 300
      ); // Longer delay for final spin
    }
  }

  requestAnimationFrame(animate);
}

const spinLoadout = () => {
  if (state.isSpinning || !state.selectedClass) {
    console.log("⚠️ Cannot start spin - already spinning or no class selected");
    return;
  }

  console.log(`🌀 Starting spin sequence: ${state.totalSpins} total spins`);

  state.isSpinning = true;
  state.currentSpin = state.totalSpins;

  // Disable ONLY class buttons during the spin, leave spin buttons enabled
  document.querySelectorAll(".class-button").forEach((btn) => {
    btn.setAttribute("disabled", "true");
  });

  document.getElementById("output").scrollIntoView({
    behavior: "smooth",
    block: "center",
  });

  // Update visuals for spin
  updateSpinCountdown(state.currentSpin);

  console.log(`🎲 Starting first spin with currentSpin = ${state.currentSpin}`);

  // Start the first spin
  if (state.selectedClass === "random") {
    displayRandomLoadout();
  } else {
    displayManualLoadout(state.selectedClass);
  }
};

// Add this at the top of your file with other variables
let isAddingToHistory = false;
let lastAddedLoadout = null;

function finalizeSpin(columns) {
  console.log("⚠️ Running finalizeSpin with currentSpin:", state.currentSpin);

  // Check if there are more spins to do
  if (state.currentSpin > 1) {
    console.log(
      "🔄 Not final spin, continue sequence. Current spin:",
      state.currentSpin
    );

    // Decrement spin counter
    state.currentSpin--;

    // Update UI to show remaining spins
    updateSpinCountdown(state.currentSpin);

    // Clear isSpinning flag to allow next spin
    state.isSpinning = false;

    // Start next spin after a short delay
    setTimeout(() => {
      console.log(
        "🎲 Starting next spin in sequence. Remaining:",
        state.currentSpin
      );
      if (state.selectedClass === "random") {
        displayRandomLoadout();
      } else {
        displayManualLoadout(state.selectedClass);
      }
    }, 500);

    return; // Exit early - we're handling next spin
  }

  console.log("🎯 Final spin, recording loadout");

  // Prevent duplicate processing
  if (isAddingToHistory) {
    console.log("🛑 Already adding to history, preventing duplicate call");
    return;
  }

  state.isSpinning = false;

  // Re-enable class buttons after spin is complete
  classButtons.forEach((button) => {
    button.removeAttribute("disabled");
  });

  // DIRECT BUTTON MANIPULATION - 100% reliable method
  console.log("🔒 Getting direct references to all spin buttons");
  // Get a direct reference to each button by ID if possible
  const spinBtns = document.querySelectorAll(".spin-button");
  console.log(`Found ${spinBtns.length} spin buttons`);

  // Force disable ALL spin buttons
  spinBtns.forEach((btn, index) => {
    console.log(`Disabling spin button ${index + 1}`);
    // Use all possible disabling methods to guarantee they work
    btn.disabled = true;
    btn.setAttribute("disabled", "true");
    btn.classList.add("dimmed");

    // Add a data attribute for debugging
    btn.dataset.disabledAt = new Date().toISOString();

    // Apply inline style as a last resort
    btn.style.opacity = "0.5";
    btn.style.pointerEvents = "none";
  });

  // Get the final selections from the DOM
  const itemContainers = document.querySelectorAll(
    ".slot-machine-wrapper .items-container .item-container"
  );

  if (itemContainers && itemContainers.length > 0) {
    isAddingToHistory = true; // Set the flag to prevent duplicate calls
    console.log("🔒 Setting isAddingToHistory flag to prevent duplicates");

    // ✅ Save the selected class BEFORE doing anything else
    let savedClass = state.selectedClass;
    console.log("💾 Selected Class Before Processing:", savedClass);

    // If we're using the random class mode, get the actual selected class
    if (savedClass && savedClass.toLowerCase() === "random") {
      const activeClassButton = document.querySelector(
        ".class-button.selected:not([data-class='Random'])"
      );
      savedClass = activeClassButton
        ? activeClassButton.dataset.class
        : savedClass;
    }

    // Get all the selected items using the OLD working method
    const selectedItems = Array.from(itemContainers).map((container) => {
      const scrollContainer = container.querySelector(".scroll-container");
      if (!scrollContainer) return "Unknown";

      // Find all item columns
      const allItems = scrollContainer.querySelectorAll(".itemCol");

      // Use the EXACT method from old working version
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

    // Debug the selected items
    console.log("🔍 Selected Items:", selectedItems);

    // Make sure we have all items and none are 'Unknown'
    if (selectedItems.length >= 5 && !selectedItems.includes("Unknown")) {
      console.log("💾 Selected items for history:", selectedItems);

      // Create a loadout string to check for duplicates
      const weapon = selectedItems[0];
      const specialization = selectedItems[1];
      const gadgets = selectedItems.slice(2, 5);

      const loadoutString = `${savedClass}-${weapon}-${specialization}-${gadgets.join(
        "-"
      )}`;
      console.log("🚨 Loadout to be recorded:", loadoutString);
      console.log("Last Added Loadout:", lastAddedLoadout);

      if (loadoutString === lastAddedLoadout) {
        console.log("🔍 Duplicate loadout detected, not adding to history");
        isAddingToHistory = false;
        // Reset the class even if we don't add to history
        state.selectedClass = null;
        return;
      }
      lastAddedLoadout = loadoutString;

      // Add to history after a delay (helps prevent race conditions)
      setTimeout(() => {
        // Use savedClass instead of state.selectedClass
        addToHistory(savedClass, weapon, specialization, gadgets);

        console.log("✅ Successfully added to history:", loadoutString);
        isAddingToHistory = false; // Reset the flag
      }, 500);

      // Reset the class AFTER saving it
      state.selectedClass = null;
    } else {
      console.warn(
        "⚠️ Could not record loadout - incomplete data:",
        selectedItems
      );
      isAddingToHistory = false; // Reset the flag
      // Reset selected class even if we don't add to history
      state.selectedClass = null;
    }
  } else {
    isAddingToHistory = false; // Reset the flag
    // Reset selected class
    state.selectedClass = null;
  }

  // REMOVED re-enabling code - buttons will stay disabled until user selects a class
  console.log(
    "✅ Spin completed and finalized! Buttons remain disabled until class selection."
  );
}

// Helper function to update the spin countdown display
function updateSpinCountdown(spinsRemaining) {
  console.log(`🔢 Updating spin countdown: ${spinsRemaining} spins left`);

  const spinButtons = document.querySelectorAll(".spin-button");

  spinButtons.forEach((button) => {
    const spinValue = parseInt(button.dataset.spins);
    button.classList.remove("active", "selected");

    if (spinValue === spinsRemaining) {
      button.classList.add("active", "selected");
      button.style.animation = "moveLeft 0.5s ease-in-out forwards";
    } else {
      button.style.animation = "none";
    }
  });
}

function startSpinAnimation(columns) {
  // Final spin is when we're on the last spin (currentSpin === 1)
  const isFinalSpin = state.currentSpin === 1;
  console.log(
    `🎲 Animation starting with currentSpin = ${state.currentSpin}, isFinalSpin = ${isFinalSpin}`
  );

  const startTime = performance.now();

  const slotColumns = columns.map(
    (element, index) => new SlotColumn(element, index, isFinalSpin)
  );

  // Reset containers
  columns.forEach((column) => {
    const container = column.closest(".item-container");
    if (container) {
      container.classList.remove("landing-flash", "winner-pulsate");
      const lockedTag = container.querySelector(".locked-tag");
      if (lockedTag) lockedTag.remove();
    }
    column.style.transform = "translateY(0)";
    column.style.transition = "none";
  });

  // Initialize animation states clearly
  slotColumns.forEach((column) => {
    column.state = "accelerating";
    column.velocity = 0;
    column.position = 0;
    column.lastTimestamp = null;
  });

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
      console.log("✅ All columns stopped, calling finalizeSpin");

      // Add visual effects only for final spin
      if (isFinalSpin) {
        columns.forEach((column, index) => {
          const container = column.closest(".item-container");
          if (container) {
            setTimeout(() => {
              container.classList.add("landing-flash");

              let lockedTag = container.querySelector(".locked-tag");
              if (!lockedTag) {
                lockedTag = document.createElement("div");
                lockedTag.className = "locked-tag show";
                lockedTag.textContent = "Locked In!";
                container.appendChild(lockedTag);
              }

              setTimeout(() => container.classList.add("winner-pulsate"), 300);
            }, index * 200);
          }
        });
      }

      // Let finalizeSpin handle whether to continue or end the sequence
      setTimeout(
        () => {
          finalizeSpin(columns);
        },
        isFinalSpin ? 1000 : 300
      ); // Longer delay for final spin
    }
  }

  requestAnimationFrame(animate);
}

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

  // Remove excess entries beyond 5
  while (historyList.children.length > 5) {
    historyList.removeChild(historyList.lastChild);
  }

  saveHistory();
}

function saveHistory() {
  const entries = Array.from(document.querySelectorAll(".history-entry")).map(
    (entry) => entry.innerHTML
  );

  // Limit to the most recent 5 entries
  const cappedEntries = entries.slice(0, 5);

  localStorage.setItem("loadoutHistory", JSON.stringify(cappedEntries));
}

// Loadout history
const loadHistory = () => {
  const historyList = document.getElementById("history-list");
  const savedEntries = JSON.parse(localStorage.getItem("loadoutHistory")) || [];
  historyList.innerHTML = "";
  savedEntries.forEach((html) => {
    const entry = document.createElement("div");
    entry.classList.add("history-entry");
    entry.innerHTML = html;
    historyList.appendChild(entry);
  });
};

loadHistory();

// Update spin countdown display by shifting highlight left
function updateSpinCountdown(spinsRemaining) {
  console.log(`🔢 Updating spin countdown: ${spinsRemaining} spins left`);

  const spinButtons = document.querySelectorAll(".spin-button");

  spinButtons.forEach((button) => {
    const spinValue = parseInt(button.dataset.spins);
    button.classList.remove("active", "selected");

    if (spinValue === spinsRemaining) {
      button.classList.add("active", "selected");
      button.style.animation = "moveLeft 0.5s ease-in-out forwards";
    } else {
      button.style.animation = "none";
    }
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
