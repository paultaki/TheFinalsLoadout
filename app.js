// Global state
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

// Global variables for DOM elements
let spinButtons;
let classButtons;
let spinSelection;
let outputDiv;

// Physics constants for animations
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
      "ARN-220",
      "V9S",
      "XP-54",
      "Throwing Knives",
    ],
    specializations: ["Cloaking Device", "Evasive Dash", "Grappling Hook"],
    gadgets: [
      "Breach Charge",
      "Gateway",
      "Glitch Grenade",
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
      "CB-01 Repeater",
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
      "M134 Minigun",
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

// Function to get filtered loadouts based on checkbox selections
function getFilteredLoadouts() {
  const filteredLoadouts = JSON.parse(JSON.stringify(loadouts));

  for (const classType of ["Light", "Medium", "Heavy"]) {
    const typeLower = classType.toLowerCase();

    const checkedWeapons = Array.from(
      document.querySelectorAll(
        `.item-grid input[data-type="weapon"][data-class="${typeLower}"]:checked`
      )
    ).map((cb) => cb.value);

    const checkedSpecs = Array.from(
      document.querySelectorAll(
        `.item-grid input[data-type="specialization"][data-class="${typeLower}"]:checked`
      )
    ).map((cb) => cb.value);

    const checkedGadgets = Array.from(
      document.querySelectorAll(
        `.item-grid input[data-type="gadget"][data-class="${typeLower}"]:checked`
      )
    ).map((cb) => cb.value);

    // Weapons
    if (checkedWeapons.length > 0) {
      filteredLoadouts[classType].weapons = filteredLoadouts[
        classType
      ].weapons.filter((w) => checkedWeapons.includes(w));
    }

    // Specs
    if (checkedSpecs.length > 0) {
      filteredLoadouts[classType].specializations = filteredLoadouts[
        classType
      ].specializations.filter((s) => checkedSpecs.includes(s));
    }

    // Gadgets (fixed!)
    if (checkedGadgets.length > 0) {
      filteredLoadouts[classType].gadgets = filteredLoadouts[
        classType
      ].gadgets.filter((g) => checkedGadgets.includes(g));
    }

    // Fallbacks
    if (filteredLoadouts[classType].weapons.length === 0) {
      filteredLoadouts[classType].weapons = loadouts[classType].weapons;
    }

    if (filteredLoadouts[classType].specializations.length === 0) {
      filteredLoadouts[classType].specializations =
        loadouts[classType].specializations;
    }

    if (filteredLoadouts[classType].gadgets.length === 0) {
      filteredLoadouts[classType].gadgets = loadouts[classType].gadgets;
    }
  }

  return filteredLoadouts;
}

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

// SlotColumn class for animation
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

// Flag to prevent duplicate history entries
let isAddingToHistory = false;
let lastAddedLoadout = null;

// DOM manipulation functions
function populateCheckboxes(items, container, type) {
  console.log(`✅ Populating ${type} checkboxes...`, items);

  if (!container) {
    console.error(`❌ Container for ${type} not found!`);
    return;
  }

  container.innerHTML = "";
  if (items.length === 0) {
    container.innerHTML = "<p style='color: gray;'>No options available</p>";
    return;
  }

  items.forEach((item) => {
    const label = document.createElement("label");
    label.style.display = "block";
    label.style.marginBottom = "5px";

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.value = item;
    checkbox.checked = true;
    checkbox.dataset.type = type;

    label.appendChild(checkbox);
    label.appendChild(document.createTextNode(` ${item}`));
    container.appendChild(label);
  });

  console.log(`✅ Successfully populated ${type} checkboxes.`);
}
const displayLoadout = (classType) => {
  const filteredLoadouts = getFilteredLoadouts();
  const loadout = filteredLoadouts[classType];

  const selectedWeapon = getRandomUniqueItems(loadout.weapons, 1)[0];
  const selectedSpec = getRandomUniqueItems(loadout.specializations, 1)[0];

  const gadgets = [...filteredLoadouts[classType].gadgets];

  // ✅ Safety check: if fewer than 3 gadgets, bail and alert
  if (!gadgets || gadgets.length < 3) {
    alert("Not enough gadgets selected! Please select at least 3.");
    state.isSpinning = false;
    return;
  }

  // ✅ Select 3 unique gadgets for final lock-in
  const allGadgets = [...gadgets];
  const selectedGadgets = [];
  while (selectedGadgets.length < 3 && allGadgets.length > 0) {
    const index = Math.floor(Math.random() * allGadgets.length);
    const picked = allGadgets.splice(index, 1)[0];
    if (!selectedGadgets.includes(picked)) {
      selectedGadgets.push(picked);
    }
  }

  // 🎰 Fill gadgetChunks with rich spin animation pools (20 items each)
  const gadgetChunks = [[], [], []];
  for (let i = 0; i < 3; i++) {
    const spinPool = [];
    while (spinPool.length < 20) {
      const randomItem = gadgets[Math.floor(Math.random() * gadgets.length)];
      spinPool.push(randomItem);
    }
    gadgetChunks[i] = spinPool;
  }

  // ✨ Create gadget spin sequence (winner in center, unique shuffle around it)
  const createGadgetSpinSequence = (winningGadget, chunkIndex) => {
    const chunk = gadgetChunks[chunkIndex] || [];

    const uniquePool = [
      ...new Set(chunk.filter((item) => item !== winningGadget)),
    ];

    const shuffled = uniquePool.sort(() => Math.random() - 0.5);

    const result = [];
    for (let i = 0; i < 8; i++) {
      if (i === 4) {
        result.push(winningGadget);
      } else {
        result.push(shuffled.length ? shuffled.pop() : winningGadget);
      }
    }

    return result;
  };

  // 🧱 Build the HTML output
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
  displayLoadout(randomClass);
};

// Animation function
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

// Filter Tab System
function setupFilterSystem() {
  console.log("🔍 Setting up filter system...");

  // Toggle filter panel visibility
  const toggleBtn = document.getElementById("toggle-filters");
  const filterPanel = document.getElementById("filter-panel");
  const toggleIcon = document.querySelector(".toggle-icon");

  if (toggleBtn && filterPanel) {
    console.log("✅ Found toggle button and filter panel");

    toggleBtn.addEventListener("click", () => {
      console.log("🖱️ Filter toggle button clicked");
      const isVisible = filterPanel.style.display === "block";

      if (isVisible) {
        toggleIcon.textContent = "+";
        toggleIcon.classList.remove("open");
        filterPanel.classList.add("closing");

        // Allow animation to complete before hiding
        setTimeout(() => {
          filterPanel.style.display = "none";
          filterPanel.classList.remove("closing");
        }, 300);
      } else {
        filterPanel.style.display = "block";
        toggleIcon.textContent = "×";
        toggleIcon.classList.add("open");

        // Force reflow to ensure animation works
        filterPanel.offsetHeight;
        filterPanel.classList.remove("closing");
      }
    });
  } else {
    console.error("❌ Could not find toggle button or filter panel");
    console.log("Toggle button:", toggleBtn);
    console.log("Filter panel:", filterPanel);
  }

  // Tab switching
  const tabButtons = document.querySelectorAll(".tab-button");
  const tabContents = document.querySelectorAll(".tab-content");

  if (tabButtons.length > 0 && tabContents.length > 0) {
    console.log(
      `✅ Found ${tabButtons.length} tab buttons and ${tabContents.length} tab contents`
    );

    tabButtons.forEach((button) => {
      button.addEventListener("click", () => {
        const tabName = button.getAttribute("data-tab");
        console.log(`🖱️ Tab button clicked: ${tabName}`);

        // Update active tab button
        tabButtons.forEach((btn) => btn.classList.remove("active"));
        button.classList.add("active");

        // Show selected tab content, hide others
        tabContents.forEach((content) => {
          if (content.id === `${tabName}-tab`) {
            content.style.display = "block";
            content.classList.add("active");
          } else {
            content.style.display = "none";
            content.classList.remove("active");
          }
        });
      });
    });
  } else {
    console.error("❌ Could not find tab buttons or tab contents");
  }

  // Class filter buttons
  const classFilters = document.querySelectorAll(".class-filter");
  const itemCategories = document.querySelectorAll(".item-category");

  if (classFilters.length > 0 && itemCategories.length > 0) {
    console.log(
      `✅ Found ${classFilters.length} class filters and ${itemCategories.length} item categories`
    );

    classFilters.forEach((filter) => {
      filter.addEventListener("click", () => {
        const selectedClass = filter.getAttribute("data-class");
        console.log(`🖱️ Class filter clicked: ${selectedClass}`);

        // Update active filter button
        classFilters.forEach((btn) => btn.classList.remove("active"));
        filter.classList.add("active");

        // Show/hide categories based on selection
        itemCategories.forEach((category) => {
          if (
            selectedClass === "all" ||
            category.classList.contains(`${selectedClass}-category`)
          ) {
            category.style.display = "block";
          } else {
            category.style.display = "none";
          }
        });
      });
    });
  } else {
    console.error("❌ Could not find class filters or item categories");
  }

  // Category expand/collapse
  const categoryHeaders = document.querySelectorAll(".category-header");

  if (categoryHeaders.length > 0) {
    console.log(`✅ Found ${categoryHeaders.length} category headers`);

    categoryHeaders.forEach((header) => {
      header.addEventListener("click", () => {
        const category = header.parentElement;
        const itemGrid = category.querySelector(".item-grid");
        const toggleBtn = header.querySelector(".category-toggle");

        if (itemGrid && toggleBtn) {
          if (itemGrid.style.display === "none") {
            itemGrid.style.display = "grid";
            toggleBtn.classList.remove("collapsed");
            toggleBtn.textContent = "▼";
          } else {
            itemGrid.style.display = "none";
            toggleBtn.classList.add("collapsed");
            toggleBtn.textContent = "▶";
          }
        }
      });
    });
  } else {
    console.error("❌ Could not find category headers");
  }

  // Search functionality
  const searchInput = document.getElementById("filter-search");

  if (searchInput) {
    console.log("✅ Found search input");

    searchInput.addEventListener("input", () => {
      const searchTerm = searchInput.value.toLowerCase();
      const allItems = document.querySelectorAll(".item-checkbox");

      console.log(
        `🔍 Searching for: ${searchTerm} (found ${allItems.length} items)`
      );

      allItems.forEach((item) => {
        const itemName =
          item.querySelector("span")?.textContent.toLowerCase() || "";
        if (itemName.includes(searchTerm)) {
          item.style.display = "flex";
        } else {
          item.style.display = "none";
        }
      });
    });
  } else {
    console.error("❌ Could not find search input");
  }

  // Apply button functionality
  const applyBtn = document.getElementById("apply-filters");
  if (applyBtn) {
    console.log("✅ Found apply button");

    applyBtn.addEventListener("click", () => {
      console.log("✅ Filters applied!");

      // If a spin is currently in progress, don't do anything
      if (state.isSpinning) {
        console.log("⚠️ Cannot apply filters during spin");
        return;
      }

      // Close the filter panel
      if (filterPanel) {
        filterPanel.style.display = "none";
        if (toggleIcon) {
          toggleIcon.textContent = "+";
          toggleIcon.classList.remove("open");
        }
      }
    });
  } else {
    console.error("❌ Could not find apply button");
  }

  console.log("✅ Filter system setup complete");
}

// Function to populate filter items from loadouts
function populateFilterItems() {
  console.log("🔄 Populating filter items...");

  // Get item containers
  const lightWeaponsGrid = document.getElementById("light-weapons-grid");
  const mediumWeaponsGrid = document.getElementById("medium-weapons-grid");
  const heavyWeaponsGrid = document.getElementById("heavy-weapons-grid");

  // Clear existing items if any
  if (lightWeaponsGrid) lightWeaponsGrid.innerHTML = "";
  if (mediumWeaponsGrid) mediumWeaponsGrid.innerHTML = "";
  if (heavyWeaponsGrid) heavyWeaponsGrid.innerHTML = "";

  // Add weapons
  if (lightWeaponsGrid && loadouts.Light.weapons) {
    console.log(`✅ Adding ${loadouts.Light.weapons.length} Light weapons`);
    loadouts.Light.weapons.forEach((weapon) => {
      const item = document.createElement("label");
      item.className = "item-checkbox";
      item.innerHTML = `
        <input type="checkbox" value="${weapon}" checked data-type="weapon" data-class="light">
        <span>${weapon}</span>
      `;
      lightWeaponsGrid.appendChild(item);
    });
  } else {
    console.warn("⚠️ Could not find light weapons grid or weapons");
  }

  if (mediumWeaponsGrid && loadouts.Medium.weapons) {
    console.log(`✅ Adding ${loadouts.Medium.weapons.length} Medium weapons`);
    loadouts.Medium.weapons.forEach((weapon) => {
      const item = document.createElement("label");
      item.className = "item-checkbox";
      item.innerHTML = `
        <input type="checkbox" value="${weapon}" checked data-type="weapon" data-class="medium">
        <span>${weapon}</span>
      `;
      mediumWeaponsGrid.appendChild(item);
    });
  } else {
    console.warn("⚠️ Could not find medium weapons grid or weapons");
  }

  if (heavyWeaponsGrid && loadouts.Heavy.weapons) {
    console.log(`✅ Adding ${loadouts.Heavy.weapons.length} Heavy weapons`);
    loadouts.Heavy.weapons.forEach((weapon) => {
      const item = document.createElement("label");
      item.className = "item-checkbox";
      item.innerHTML = `
        <input type="checkbox" value="${weapon}" checked data-type="weapon" data-class="heavy">
        <span>${weapon}</span>
      `;
      heavyWeaponsGrid.appendChild(item);
    });
  } else {
    console.warn("⚠️ Could not find heavy weapons grid or weapons");
  }

  // Populate specializations tab
  const lightSpecsGrid = document.getElementById("light-specs-grid");
  const mediumSpecsGrid = document.getElementById("medium-specs-grid");
  const heavySpecsGrid = document.getElementById("heavy-specs-grid");

  if (lightSpecsGrid && loadouts.Light.specializations) {
    console.log(
      `✅ Adding ${loadouts.Light.specializations.length} Light specializations`
    );
    loadouts.Light.specializations.forEach((spec) => {
      const item = document.createElement("label");
      item.className = "item-checkbox";
      item.innerHTML = `
        <input type="checkbox" value="${spec}" checked data-type="specialization" data-class="light">
        <span>${spec}</span>
      `;
      lightSpecsGrid.appendChild(item);
    });
  } else {
    console.warn(
      "⚠️ Could not find light specializations grid or specializations"
    );
  }

  if (mediumSpecsGrid && loadouts.Medium.specializations) {
    console.log(
      `✅ Adding ${loadouts.Medium.specializations.length} Medium specializations`
    );
    loadouts.Medium.specializations.forEach((spec) => {
      const item = document.createElement("label");
      item.className = "item-checkbox";
      item.innerHTML = `
        <input type="checkbox" value="${spec}" checked data-type="specialization" data-class="medium">
        <span>${spec}</span>
      `;
      mediumSpecsGrid.appendChild(item);
    });
  } else {
    console.warn(
      "⚠️ Could not find medium specializations grid or specializations"
    );
  }

  if (heavySpecsGrid && loadouts.Heavy.specializations) {
    console.log(
      `✅ Adding ${loadouts.Heavy.specializations.length} Heavy specializations`
    );
    loadouts.Heavy.specializations.forEach((spec) => {
      const item = document.createElement("label");
      item.className = "item-checkbox";
      item.innerHTML = `
        <input type="checkbox" value="${spec}" checked data-type="specialization" data-class="heavy">
        <span>${spec}</span>
      `;
      heavySpecsGrid.appendChild(item);
    });
  } else {
    console.warn(
      "⚠️ Could not find heavy specializations grid or specializations"
    );
  }

  // Populate gadgets tab
  const lightGadgetsGrid = document.getElementById("light-gadgets-grid");
  const mediumGadgetsGrid = document.getElementById("medium-gadgets-grid");
  const heavyGadgetsGrid = document.getElementById("heavy-gadgets-grid");

  if (lightGadgetsGrid && loadouts.Light.gadgets) {
    console.log(`✅ Adding ${loadouts.Light.gadgets.length} Light gadgets`);
    loadouts.Light.gadgets.forEach((gadget) => {
      const item = document.createElement("label");
      item.className = "item-checkbox";
      item.innerHTML = `
        <input type="checkbox" value="${gadget}" checked data-type="gadget" data-class="light">
        <span>${gadget}</span>
      `;
      lightGadgetsGrid.appendChild(item);
    });
  } else {
    console.warn("⚠️ Could not find light gadgets grid or gadgets");
  }

  if (mediumGadgetsGrid && loadouts.Medium.gadgets) {
    console.log(`✅ Adding ${loadouts.Medium.gadgets.length} Medium gadgets`);
    loadouts.Medium.gadgets.forEach((gadget) => {
      const item = document.createElement("label");
      item.className = "item-checkbox";
      item.innerHTML = `
        <input type="checkbox" value="${gadget}" checked data-type="gadget" data-class="medium">
        <span>${gadget}</span>
      `;
      mediumGadgetsGrid.appendChild(item);
    });
  } else {
    console.warn("⚠️ Could not find medium gadgets grid or gadgets");
  }

  if (heavyGadgetsGrid && loadouts.Heavy.gadgets) {
    console.log(`✅ Adding ${loadouts.Heavy.gadgets.length} Heavy gadgets`);
    loadouts.Heavy.gadgets.forEach((gadget) => {
      const item = document.createElement("label");
      item.className = "item-checkbox";
      item.innerHTML = `
        <input type="checkbox" value="${gadget}" checked data-type="gadget" data-class="heavy">
        <span>${gadget}</span>
      `;
      heavyGadgetsGrid.appendChild(item);
    });
  } else {
    console.warn("⚠️ Could not find heavy gadgets grid or gadgets");
  }

  console.log("✅ Filter items population complete");
}

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
        displayLoadout(state.selectedClass);
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
    btn.setAttribute("disabled", "disabled");
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

// Update UI functions
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

// Main spin function
const spinLoadout = () => {
  if (state.isSpinning || !state.selectedClass) {
    console.log("⚠️ Cannot start spin - already spinning or no class selected");
    return;
  }

  // ✅ Add idle animation to selected character AFTER we know spin is allowed
  const selectedCharacter = document.querySelector(".class-button.selected");
  if (selectedCharacter) {
    selectedCharacter.classList.add("character-idle-animate");
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
    displayLoadout(state.selectedClass);
  }
};

// Loadout history functions
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

function loadHistory() {
  const historyList = document.getElementById("history-list");
  const savedEntries = JSON.parse(localStorage.getItem("loadoutHistory")) || [];
  historyList.innerHTML = "";
  savedEntries.forEach((html) => {
    const entry = document.createElement("div");
    entry.classList.add("history-entry");
    entry.innerHTML = html;
    historyList.appendChild(entry);
  });
}

// Make copyLoadoutText available globally
window.copyLoadoutText = function (button) {
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
};

// Initialize everything when DOM is ready
document.addEventListener("DOMContentLoaded", () => {
  console.log("✅ DOM fully loaded");

  // Get DOM elements
  classButtons = document.querySelectorAll(".class-button");
  spinButtons = document.querySelectorAll(".spin-button");
  spinSelection = document.getElementById("spinSelection");
  outputDiv = document.getElementById("output");

  const toggleBtn = document.getElementById("toggle-customization");
  const customizationPanel = document.getElementById("customization-panel");

  // Toggle customization panel (old system)
  if (toggleBtn && customizationPanel) {
    toggleBtn.addEventListener("click", () => {
      customizationPanel.style.display =
        customizationPanel.style.display === "block" ? "none" : "block";
    });
  }

  // Spin button logic
  if (spinButtons.length > 0) {
    spinButtons.forEach((button) => {
      button.addEventListener("click", () => {
        if (button.disabled || state.isSpinning) return;

        console.log(`🎲 Spin button clicked: ${button.dataset.spins} spins`);

        // Update the selected number of spins
        state.totalSpins = parseInt(button.dataset.spins);

        // Visual feedback - highlight the selected button
        spinButtons.forEach((btn) =>
          btn.classList.remove("selected", "active")
        );
        button.classList.add("selected", "active");

        // Start the spin process
        spinLoadout();
      });
    });
  }

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

  // Copy loadout functionality
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

  // Initialize loadout history
  loadHistory();

  // Clear history button
  document.getElementById("clear-history")?.addEventListener("click", () => {
    localStorage.removeItem("loadoutHistory");
    document.getElementById("history-list").innerHTML = "";
    console.log("🗑️ Loadout history cleared.");
  });

  // FAQ Toggle
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

  // Fetch and populate checkboxes for customization
  fetch("loadouts.json")
    .catch(() => {
      // If fetch fails, use the built-in loadouts object
      console.log("Using built-in loadouts as fallback");
      return { json: () => Promise.resolve(loadouts) };
    })
    .then((res) => res.json())
    .then((data) => {
      const allWeapons = [
        ...new Set([
          ...data.Light.weapons,
          ...data.Medium.weapons,
          ...data.Heavy.weapons,
        ]),
      ];
      const allSpecializations = [
        ...new Set([
          ...data.Light.specializations,
          ...data.Medium.specializations,
          ...data.Heavy.specializations,
        ]),
      ];
      const allGadgets = [
        ...new Set([
          ...data.Light.gadgets,
          ...data.Medium.gadgets,
          ...data.Heavy.gadgets,
        ]),
      ];

      // Populate the old checkbox system (for compatibility)
      populateCheckboxes(
        allWeapons,
        document.getElementById("weapon-options"),
        "weapons"
      );
      populateCheckboxes(
        allSpecializations,
        document.getElementById("specialization-options"),
        "specializations"
      );
      populateCheckboxes(
        allGadgets,
        document.getElementById("gadget-options"),
        "gadgets"
      );

      // Initialize the new filter system
      setupFilterSystem();
      populateFilterItems();
    })
    .catch((err) => console.error("❌ Error loading JSON", err));
});
