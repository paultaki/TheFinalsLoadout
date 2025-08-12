/**
 * The Finals Slot Machine Core System
 * Bulletproof data integrity with deception engine
 */

// ========================================
// Slot Machine Configuration
// ========================================
const SlotConfig = {
  columns: ["weapon", "specialization", "gadget-1", "gadget-2", "gadget-3"],
  itemsPerScroll: 100, // Increased for seamless scrolling
  nearMissOffset: 2, // Items above/below winner for near-miss effect
  spinDuration: 3000, // Base spin duration in ms
  columnDelay: 200, // Delay between column stops

  // High-value items for near-miss psychology
  highValueItems: {
    Light: {
      weapons: ["SR-84", "LH1", "Sword"],
      specializations: ["Cloaking Device"],
      gadgets: ["Gateway", "Vanishing Bomb"],
    },
    Medium: {
      weapons: ["FCAR", "AKM", "Model 1887"],
      specializations: ["Healing Beam", "Guardian Turret"],
      gadgets: ["Defibrillator", "Jump Pad"],
    },
    Heavy: {
      weapons: ["M134 Minigun", "ShAK-50", ".50 Akimbo"],
      specializations: ["Mesh Shield", "Charge N Slam"],
      gadgets: ["RPG-7", "C4", "Dome Shield"],
    },
  },
};

// ========================================
// Class Data with Complete Pools
// ========================================
const ClassData = {
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
      "Flashbang",
      "Frag Grenade",
      "Gas Grenade",
      "Goo Grenade",
      "Pyro Grenade",
      "Smoke Grenade",
      "Stun Gun",
      "Thermal Vision",
      "Tracking Dart",
      "Vanishing Bomb",
      "Zipline",
      "Motion Sensor",
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
    specializations: [
      "Dematerializer",
      "Guardian Turret",
      "Healing Beam",
      "Recon Senses",
    ],
    gadgets: [
      "APS Turret",
      "Data Reshaper",
      "Defibrillator",
      "Explosive Mine",
      "Gas Mine",
      "Glitch Trap",
      "Jump Pad",
      "Sonar Grenade",
      "Zipline",
      "Flashbang",
      "Frag Grenade",
      "Gas Grenade",
      "Goo Grenade",
      "Pyro Grenade",
      "Smoke Grenade",
    ],
  },
  Heavy: {
    weapons: [
      ".50 Akimbo",
      "Flamethrower",
      "KS-23",
      "Lewis Gun",
      "M60",
      "M134 Minigun",
      "MGL32",
      "SA1216",
      "Sledgehammer",
      "ShAK-50",
      "Spear",
      "Lockbolt Launcher",
    ],
    specializations: ["Charge N Slam", "Goo Gun", "Mesh Shield", "Winch Claw"],
    gadgets: [
      "Barricade",
      "C4",
      "Dome Shield",
      "Explosive Mine",
      "RPG-7",
      "Anti-Gravity Cube",
      "Flashbang",
      "Frag Grenade",
      "Gas Grenade",
      "Goo Grenade",
      "Pyro Grenade",
      "Smoke Grenade",
    ],
  },
};

// ========================================
// Filter System
// ========================================
class FilterSystem {
  constructor() {
    this.activeFilters = {
      weapons: new Set(),
      specializations: new Set(),
      gadgets: new Set(),
    };
  }

  /**
   * Apply filters to class data
   * @param {string} classType - Light, Medium, or Heavy
   * @returns {object} Filtered class data
   */
  getFilteredData(classType) {
    const baseData = ClassData[classType];
    if (!baseData) {
      console.error(`Invalid class type: ${classType}`);
      return null;
    }

    // Deep clone the base data
    const filteredData = JSON.parse(JSON.stringify(baseData));

    // Apply weapon filters
    if (this.activeFilters.weapons.size > 0) {
      filteredData.weapons = filteredData.weapons.filter(
        (weapon) => !this.activeFilters.weapons.has(weapon)
      );
    }

    // Apply specialization filters
    if (this.activeFilters.specializations.size > 0) {
      filteredData.specializations = filteredData.specializations.filter(
        (spec) => !this.activeFilters.specializations.has(spec)
      );
    }

    // Apply gadget filters
    if (this.activeFilters.gadgets.size > 0) {
      filteredData.gadgets = filteredData.gadgets.filter(
        (gadget) => !this.activeFilters.gadgets.has(gadget)
      );
    }

    // Ensure we have minimum items (fallback to base data if filtered too much)
    if (filteredData.weapons.length === 0) {
      console.warn("All weapons filtered out, using fallback");
      filteredData.weapons = baseData.weapons.slice(0, 3);
    }

    if (filteredData.specializations.length === 0) {
      console.warn("All specializations filtered out, using fallback");
      filteredData.specializations = baseData.specializations.slice(0, 1);
    }

    if (filteredData.gadgets.length < 3) {
      console.warn("Too many gadgets filtered out, using fallback");
      filteredData.gadgets = baseData.gadgets.slice(0, 5);
    }

    return filteredData;
  }

  toggleFilter(category, item) {
    if (this.activeFilters[category]) {
      if (this.activeFilters[category].has(item)) {
        this.activeFilters[category].delete(item);
      } else {
        this.activeFilters[category].add(item);
      }
    }
  }

  clearFilters() {
    this.activeFilters.weapons.clear();
    this.activeFilters.specializations.clear();
    this.activeFilters.gadgets.clear();
  }
}

// ========================================
// Unique Gadget Selection System
// ========================================
class GadgetSelector {
  /**
   * BULLETPROOF unique gadget selection with 10-attempt system
   * @param {array} gadgetPool - Available gadgets
   * @returns {array} Exactly 3 unique gadgets
   */
  static getUniqueGadgets(gadgetPool) {
    // Input validation
    if (!Array.isArray(gadgetPool) || gadgetPool.length < 3) {
      console.error("Invalid gadget pool:", gadgetPool);
      return ["Flashbang", "Frag Grenade", "Smoke Grenade"]; // Emergency fallback
    }

    // Remove any duplicates from input pool
    const cleanPool = [...new Set(gadgetPool)];

    // If we still don't have enough unique gadgets, add defaults
    if (cleanPool.length < 3) {
      const defaults = [
        "Flashbang",
        "Frag Grenade",
        "Smoke Grenade",
        "Goo Grenade",
        "Pyro Grenade",
      ];
      for (const defaultGadget of defaults) {
        if (cleanPool.length < 3 && !cleanPool.includes(defaultGadget)) {
          cleanPool.push(defaultGadget);
        }
      }
    }

    let selectedGadgets = [];
    let attempts = 0;
    const maxAttempts = 10;

    while (attempts < maxAttempts) {
      attempts++;

      // Fisher-Yates shuffle for true randomness
      const shuffled = [...cleanPool];
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }

      // Take first 3 items
      selectedGadgets = shuffled.slice(0, 3);

      // Verify uniqueness
      const uniqueSet = new Set(selectedGadgets);
      if (uniqueSet.size === 3) {
        console.log(
          `✅ Got 3 unique gadgets in ${attempts} attempt(s):`,
          selectedGadgets
        );
        break;
      }

      console.warn(`Attempt ${attempts}: Duplicate detected, retrying...`);
    }

    // Final safety check
    const finalCheck = new Set(selectedGadgets);
    if (finalCheck.size !== 3) {
      console.error(
        "CRITICAL: Failed to get unique gadgets after 10 attempts!"
      );
      // Ultimate fallback - just take first 3 from clean pool
      selectedGadgets = cleanPool.slice(0, 3);
    }

    return selectedGadgets;
  }
}

// ========================================
// Deception Engine
// ========================================
class DeceptionEngine {
  constructor() {
    this.predeterminedLoadout = null;
    this.scrollContents = {};
  }

  /**
   * Predetermine the loadout BEFORE any animation
   * @param {string} classType - Selected class
   * @param {object} filteredData - Filtered class data
   * @returns {object} The predetermined loadout
   */
  predetermineLoadout(classType, filteredData) {
    // Select random weapon
    const weapon = this.selectRandom(filteredData.weapons);

    // Select random specialization
    const specialization = this.selectRandom(filteredData.specializations);

    // Get 3 unique gadgets
    const gadgets = GadgetSelector.getUniqueGadgets(filteredData.gadgets);

    this.predeterminedLoadout = {
      class: classType,
      weapon,
      specialization,
      gadgets,
      timestamp: Date.now(),
    };

    console.log("🎯 Predetermined loadout:", this.predeterminedLoadout);
    return this.predeterminedLoadout;
  }

  /**
   * Build scroll content with near-miss psychology
   * @param {array} itemPool - Available items for this column
   * @param {string} winner - The predetermined winner
   * @param {array} highValueItems - Items to use for near-miss effect
   * @returns {array} Scroll content array
   */
  buildScrollContent(itemPool, winner, highValueItems = []) {
    const content = [];
    const targetCount = SlotConfig.itemsPerScroll;

    // Ensure we have enough items in the pool
    if (itemPool.length === 0) {
      console.error("Empty item pool!");
      return Array(targetCount).fill("ERROR");
    }

    // CRITICAL: Winner must be at position 20 for correct final positioning
    const winnerPosition = 20;

    // Fill content with random items
    for (let i = 0; i < targetCount; i++) {
      if (i === winnerPosition) {
        // Place the winner at position 20
        content.push(winner);
      } else if (i === winnerPosition - 1 || i === winnerPosition + 1) {
        // Near-miss positions (just above and below winner)
        if (highValueItems.length > 0 && Math.random() < 0.7) {
          // 70% chance for high-value near-miss
          const nearMissItem =
            this.selectRandom(
              highValueItems.filter((item) => item !== winner)
            ) || this.selectRandom(itemPool);
          content.push(nearMissItem);
        } else {
          content.push(this.selectRandom(itemPool));
        }
      } else {
        // Regular positions - mix of items
        if (i % 4 === 0 && highValueItems.length > 0 && Math.random() < 0.3) {
          // 30% chance for occasional high-value items
          content.push(this.selectRandom(highValueItems));
        } else {
          // Regular random items
          content.push(this.selectRandom(itemPool));
        }
      }
    }

    // Add duplicate items at the end for seamless looping
    // This ensures no gaps when the scroll loops back
    const loopBuffer = 20; // Add extra items for smooth looping
    for (let i = 0; i < loopBuffer; i++) {
      content.push(this.selectRandom(itemPool));
    }

    return content;
  }

  /**
   * Generate all scroll contents for the spin
   * @param {string} classType - Selected class
   * @param {object} filteredData - Filtered class data
   */
  generateScrollContents(classType, filteredData) {
    if (!this.predeterminedLoadout) {
      console.error("No predetermined loadout!");
      return;
    }

    const highValue = SlotConfig.highValueItems[classType];

    // Build weapon scroll
    this.scrollContents.weapon = this.buildScrollContent(
      filteredData.weapons,
      this.predeterminedLoadout.weapon,
      highValue.weapons
    );

    // Build specialization scroll
    this.scrollContents.specialization = this.buildScrollContent(
      filteredData.specializations,
      this.predeterminedLoadout.specialization,
      highValue.specializations
    );

    // Build gadget scrolls
    this.scrollContents["gadget-1"] = this.buildScrollContent(
      filteredData.gadgets,
      this.predeterminedLoadout.gadgets[0],
      highValue.gadgets
    );

    this.scrollContents["gadget-2"] = this.buildScrollContent(
      filteredData.gadgets,
      this.predeterminedLoadout.gadgets[1],
      highValue.gadgets
    );

    this.scrollContents["gadget-3"] = this.buildScrollContent(
      filteredData.gadgets,
      this.predeterminedLoadout.gadgets[2],
      highValue.gadgets
    );

    console.log("📜 Scroll contents generated:", this.scrollContents);
  }

  selectRandom(array) {
    return array[Math.floor(Math.random() * array.length)];
  }
}

// ========================================
// Slot Machine Manager
// ========================================
class SlotMachine {
  constructor() {
    this.filterSystem = new FilterSystem();
    this.deceptionEngine = new DeceptionEngine();
    this.animationEngine = null; // Will be initialized when AnimationEngine is loaded
    this.bonusManager = null; // Will be initialized when BonusManager is loaded
    this.isSpinning = false;
    this.isAddingToHistory = false;
    this.currentClass = null;
    this.columns = {};

    this.initializeColumns();
    this.initializeAnimationEngine();
    this.initializeBonusManager();
  }

  initializeColumns() {
    // Get all slot columns
    SlotConfig.columns.forEach((columnType) => {
      const element = document.querySelector(
        `.slot-column[data-type="${columnType}"]`
      );
      if (element) {
        this.columns[columnType] = {
          element: element,
          itemsContainer: element.querySelector(".slot-items"),
          window: element.querySelector(".slot-window"),
        };
      }
    });
  }

  /**
   * Initialize animation engine
   */
  initializeAnimationEngine() {
    // Clean up any existing animation engine
    if (this.animationEngine) {
      if (this.animationEngine.isAnimating) {
        this.animationEngine.forceStopAnimation();
      }
      this.animationEngine = null;
    }
    
    // Try V2 engine first (improved physics)
    if (typeof AnimationEngineV2 !== "undefined") {
      this.animationEngine = new AnimationEngineV2();
      return;
    }
    
    // Fall back to V1 engine
    if (typeof AnimationEngine !== "undefined") {
      this.animationEngine = new AnimationEngine();
    } else {
      // Try to load V2 first
      const script = document.createElement("script");
      script.src = "animation-engine-v2.js";
      script.onload = () => {
        if (typeof AnimationEngineV2 !== "undefined") {
          this.animationEngine = new AnimationEngineV2();
        }
      };
      script.onerror = () => {
        // Fall back to V1
        const scriptV1 = document.createElement("script");
        scriptV1.src = "animation-engine.js";
        scriptV1.onload = () => {
          if (typeof AnimationEngine !== "undefined") {
            this.animationEngine = new AnimationEngine();
          }
        };
        document.head.appendChild(scriptV1);
      };
      document.head.appendChild(script);
    }
  }

  /**
   * Initialize bonus manager
   */
  initializeBonusManager() {
    // Load bonus manager if available
    if (typeof BonusManager !== "undefined") {
      this.bonusManager = new BonusManager();
      console.log("🎁 Bonus manager initialized");
    } else {
      // Try to load it dynamically
      const script = document.createElement("script");
      script.src = "bonus-system.js";
      script.onload = () => {
        this.bonusManager = new BonusManager();
        console.log("🎁 Bonus manager loaded and initialized");
      };
      document.head.appendChild(script);
    }
  }

  /**
   * Apply external filters from filter panel
   * @param {object} filters - Filter configuration from FilterManager
   */
  applyFilters(filters) {
    if (!filters) return;

    // Clear existing filters
    this.filterSystem.clearFilters();

    // Apply new filters
    if (filters.weapons) {
      filters.weapons.forEach((weapon) => {
        this.filterSystem.activeFilters.weapons.add(weapon);
      });
    }

    if (filters.specializations) {
      filters.specializations.forEach((spec) => {
        this.filterSystem.activeFilters.specializations.add(spec);
      });
    }

    if (filters.gadgets) {
      filters.gadgets.forEach((gadget) => {
        this.filterSystem.activeFilters.gadgets.add(gadget);
      });
    }

    console.log("🎯 Filters applied:", this.filterSystem.activeFilters);
  }

  /**
   * Main spin function - orchestrates the entire slot machine
   * @param {string} classType - Selected class (Light/Medium/Heavy)
   * @param {number} spinCount - Number of spins to perform (1-5)
   */
  async spin(classType, spinCount = 1) {
    // Spin protection
    if (this.isSpinning) {
      console.warn("Already spinning! Checking animation engine state...");
      
      // If animation engine exists and is stuck, force stop it
      if (this.animationEngine && this.animationEngine.isAnimating) {
        console.log('🔄 Forcing animation engine reset');
        this.animationEngine.forceStopAnimation();
        await new Promise(resolve => setTimeout(resolve, 200));
      }
      
      // Reset our spinning flag if animation is cleared
      if (this.animationEngine && !this.animationEngine.isAnimating) {
        console.log('✅ Animation cleared, allowing new spin');
        this.isSpinning = false;
      } else {
        return null;
      }
    }

    this.isSpinning = true;
    this.currentClass = classType;
    const totalSpins = Math.min(Math.max(spinCount || 1, 1), 5); // Clamp to 1-5

    console.log(
      `🎰 Starting ${totalSpins} spin${
        totalSpins > 1 ? "s" : ""
      } for ${classType} class`
    );

    try {
      // Create spin counter display
      this.showSpinCounter(totalSpins);

      // Perform multiple spin cycles
      let finalLoadout = null; // Define at outer scope
      
      for (let currentSpin = 1; currentSpin <= totalSpins; currentSpin++) {
        console.log(`🔄 Spin ${currentSpin} of ${totalSpins}`);

        // Update spin counter
        this.updateSpinCounter(currentSpin, totalSpins);

        // Get filtered data
        const filteredData = this.filterSystem.getFilteredData(classType);

        let loadout = null;

        // Only predetermine outcome on FINAL spin
        if (currentSpin === totalSpins) {
          // Final spin - dramatic with predetermined outcome
          loadout = this.deceptionEngine.predetermineLoadout(
            classType,
            filteredData
          );
          finalLoadout = loadout;

          // CRITICAL: Ensure no duplicate gadgets
          const uniqueGadgets = [...new Set(loadout.gadgets)];
          if (uniqueGadgets.length !== 3) {
            console.error("Duplicate gadgets detected! Regenerating...");
            loadout.gadgets = GadgetSelector.getUniqueGadgets(
              filteredData.gadgets
            );
            finalLoadout = loadout;
          }

          // Generate scroll contents with deception for final spin
          this.deceptionEngine.generateScrollContents(classType, filteredData);

          // Check for bonus trigger
          if (this.bonusManager) {
            document.dispatchEvent(new CustomEvent("slotSpinStart"));
            const bonus = await this.bonusManager.triggerBonus();
            if (bonus) {
              console.log("🎁 Bonus triggered! Type:", bonus.type);
            }
          }
        } else {
          // Quick spin - random items, no predetermined outcome
          this.generateRandomScrollContents(classType, filteredData);
        }

        // Populate scroll containers
        this.populateScrollContainers();

        // Run animation with appropriate timing
        console.log('🎮 Animation check - Engine available:', !!this.animationEngine);
        console.log('🔍 Scroll contents generated:', this.deceptionEngine.scrollContents);
        
        if (this.animationEngine) {
          // Pass the actual slot-items containers to the animation engine
          const columnElements = Object.values(this.columns).map(
            (col) => col.element
          );
          console.log('🎲 Column elements found:', columnElements.length);
          
          // Verify slot-items containers exist
          const hasAllContainers = columnElements.every(col => col.querySelector('.slot-items'));
          if (!hasAllContainers) {
            console.error('❌ Missing slot-items containers!');
            await this.basicAnimation();
            return;
          }

          if (currentSpin === totalSpins) {
            // Final spin - full dramatic animation
            console.log('🎆 Starting FINAL spin animation with loadout:', loadout);
            try {
              await this.animationEngine.animateSlotMachine(
                columnElements,
                this.deceptionEngine.scrollContents,
                loadout
              );
              console.log('✅ Final animation completed');
            } catch (error) {
              console.error('❌ Animation failed:', error);
              await this.basicAnimation();
            }
          } else {
            // Quick spin - shortened animation
            console.log('⚡ Starting quick spin animation');
            try {
              await this.animationEngine.animateQuickSpin(
                columnElements,
                this.deceptionEngine.scrollContents
              );
              console.log('✅ Quick animation completed');
            } catch (error) {
              console.error('❌ Quick animation failed:', error);
              await this.basicAnimation();
            }

            // Brief pause between spins
            await new Promise((resolve) => setTimeout(resolve, 500));
          }
        } else {
          // Animation engine not available, use basic animation
          await this.basicAnimation();
        }

        // Only process final results on the last spin
        if (currentSpin === totalSpins) {
          // Apply bonus effect if active
          if (this.bonusManager && this.bonusManager.currentBonus) {
            finalLoadout = await this.bonusManager.applyBonusEffect(
              loadout,
              this
            );

            // Dispatch bonus complete event
            document.dispatchEvent(
              new CustomEvent("bonusLoadoutReady", {
                detail: {
                  loadout: finalLoadout,
                  bonus: this.bonusManager.currentBonus,
                },
              })
            );
          } else {
            // Dispatch normal spin complete event
            document.dispatchEvent(
              new CustomEvent("slotSpinComplete", {
                detail: {
                  loadout: finalLoadout,
                  slotMachine: this,
                },
              })
            );
          }

          // Record in history after final spin completes
          if (finalLoadout) {
            await this.addToHistory(finalLoadout);
          }
        }
      } // End of spin loop

      // Hide spin counter
      this.hideSpinCounter();

      // Return the final loadout after all spins
      console.log("🎯 RETURNING LOADOUT FROM SPIN:", finalLoadout);
      return finalLoadout;
    } catch (error) {
      console.error("Spin error:", error);
      return null;
    } finally {
      // Reset spin lock after a delay
      setTimeout(() => {
        this.isSpinning = false;
      }, SlotConfig.spinDuration + 1000);
    }
  }

  /**
   * Populate the scroll containers with items
   */
  populateScrollContainers() {
    SlotConfig.columns.forEach((columnType) => {
      const column = this.columns[columnType];
      if (!column || !column.itemsContainer) return;
      
      // Disable CSS transitions during spin
      column.itemsContainer.style.transition = 'none';
      column.element.style.transition = 'none';

      const items = this.deceptionEngine.scrollContents[columnType];
      if (!items) return;

      // Get the predetermined winner for this column
      let winner = null;
      if (this.deceptionEngine.predeterminedLoadout) {
        if (columnType === "weapon") {
          winner = this.deceptionEngine.predeterminedLoadout.weapon;
        } else if (columnType === "specialization") {
          winner = this.deceptionEngine.predeterminedLoadout.specialization;
        } else if (columnType.startsWith("gadget-")) {
          const gadgetIndex = parseInt(columnType.split("-")[1]) - 1;
          winner =
            this.deceptionEngine.predeterminedLoadout.gadgets[gadgetIndex];
        }
      }

      // Clear existing items
      column.itemsContainer.innerHTML = "";

      // Position container for initial visibility
      // Start with items positioned so winner is just above viewport
      // Winner at index 20 = 20 * 80px = 1600px from top
      // To place winner just above viewport: -1600px
      const initialTranslate = -1600;
      column.itemsContainer.style.transform = `translateY(${initialTranslate}px)`;
      console.log(`🎰 ${columnType} initial position: ${initialTranslate}px (winner at index 20 above viewport)`);

      // Add items to scroll container
      items.forEach((item, index) => {
        const itemElement = document.createElement("div");
        itemElement.className = "slot-item";

        // Mark the winner item (position 20)
        if (index === 20 && item === winner) {
          itemElement.classList.add("winner-item");
          itemElement.style.border = "2px solid red"; // Visual debug marker
          console.log(`🎯 Winner "${item}" placed at index 20 in ${columnType} column`);
        }

        // Create image element
        const img = document.createElement("img");
        // Map item names to image filenames
        const imageNameMap = {
          "R.357": "R.357",
          ".50 Akimbo": "placeholder",
          "CB-01 Repeater": "CB-01_Repeater",
          SA1216: "SA1216",
          "ShAK-50": "ShAK-50",
          MGL32: "MGL32",
          "Pike-556": "Pike-556",
          "M26 Matter": "M26_Matter",
          "H+ Infuser": "H+_Infuser",
          "Recon Senses": "placeholder",
          "Stun Gun": "Stun_Gun",
          "Motion Sensor": "Motion_Sensor",
        };

        // Use mapped name if it exists, otherwise convert spaces to underscores
        const imageName = imageNameMap[item] || item.replace(/\s+/g, "_");
        img.src = `../images/${imageName}.webp`;
        img.alt = item;
        img.onerror = function () {
          // Fallback to text if image doesn't load
          this.style.display = "none";
          const textSpan = document.createElement("span");
          textSpan.textContent = item;
          itemElement.appendChild(textSpan);
        };

        // Create label
        const label = document.createElement("div");
        label.className = "item-label";
        label.textContent = item;

        itemElement.appendChild(img);
        itemElement.appendChild(label);

        // Mark near-miss items (around winner position)
        if (index === 19 || index === 21) {
          itemElement.classList.add("near-miss");
        }

        column.itemsContainer.appendChild(itemElement);
      });
    });
  }

  /**
   * Basic fallback animation
   */
  async basicAnimation() {
    // Simple animation for fallback
    const duration = 3000;
    const columns = Object.values(this.columns);

    return new Promise((resolve) => {
      columns.forEach((col, index) => {
        if (col.itemsContainer) {
          col.element.classList.add("spinning");

          // Stagger the stops
          setTimeout(() => {
            col.element.classList.remove("spinning");
            col.element.classList.add("stopped");
          }, duration + index * 200);
        }
      });

      setTimeout(resolve, duration + columns.length * 200);
    });
  }

  /**
   * Show spin counter overlay
   */
  showSpinCounter(totalSpins) {
    // Remove existing counter if any
    this.hideSpinCounter();

    // Create counter display
    const counter = document.createElement("div");
    counter.id = "spin-counter";
    counter.className = "spin-counter";
    counter.innerHTML = `
            <div class="spin-counter-content">
                <div class="spin-counter-number">1</div>
                <div class="spin-counter-label">of ${totalSpins} spins</div>
            </div>
        `;

    // Add styles - position below header to avoid overlap
    counter.style.cssText = `
            position: absolute;
            top: 80px;
            right: 20px;
            background: linear-gradient(135deg, rgba(26, 26, 26, 0.95), rgba(0, 0, 0, 0.95));
            border: 2px solid var(--primary-color);
            border-radius: 12px;
            padding: 15px 20px;
            z-index: 100;
            font-family: var(--font-display);
            text-align: center;
            box-shadow: 0 4px 20px rgba(255, 51, 102, 0.3);
            min-width: 120px;
        `;

    const slotMachine = document.querySelector(".slot-machine");
    if (slotMachine) {
      slotMachine.style.position = "relative";
      slotMachine.appendChild(counter);
    }
  }

  /**
   * Update spin counter
   */
  updateSpinCounter(current, total) {
    const counter = document.getElementById("spin-counter");
    if (counter) {
      const numberEl = counter.querySelector(".spin-counter-number");
      if (numberEl) {
        numberEl.textContent = current;

        // Add pulse animation on update
        numberEl.style.animation = "none";
        setTimeout(() => {
          numberEl.style.animation = "counterPulse 0.3s ease";
        }, 10);

        // Make it more dramatic on final spin
        if (current === total) {
          counter.style.borderColor = "#ffd700";
          counter.style.boxShadow = "0 4px 30px rgba(255, 215, 0, 0.5)";
        }
      }
    }
  }

  /**
   * Hide spin counter
   */
  hideSpinCounter() {
    const counter = document.getElementById("spin-counter");
    if (counter) {
      counter.style.animation = "fadeOut 0.3s ease";
      setTimeout(() => counter.remove(), 300);
    }
  }

  /**
   * Generate random scroll contents for quick spins
   */
  generateRandomScrollContents(classType, filteredData) {
    const scrollContents = {};

    // Generate random items for each column
    SlotConfig.columns.forEach((columnType) => {
      let items = [];

      switch (columnType) {
        case "weapon":
          items = this.shuffleArray([...filteredData.weapons]);
          break;
        case "specialization":
          items = this.shuffleArray([...filteredData.specializations]);
          break;
        default:
          items = this.shuffleArray([...filteredData.gadgets]);
      }

      // Create scrollable list with duplicates for seamless loop
      const scrollItems = [];
      for (let i = 0; i < 15; i++) {
        // 15 items for smooth scroll
        scrollItems.push(items[i % items.length]);
      }

      scrollContents[columnType] = scrollItems;
    });

    this.deceptionEngine.scrollContents = scrollContents;
  }

  /**
   * Utility: Shuffle array
   */
  shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  /**
   * Add loadout to history (with duplicate prevention)
   */
  async addToHistory(loadout) {
    if (this.isAddingToHistory) {
      console.warn("Already adding to history");
      return;
    }

    this.isAddingToHistory = true;

    try {
      // This is where we'd add to history
      console.log("Adding to history:", loadout);

      // Trigger history event
      window.dispatchEvent(
        new CustomEvent("loadoutGenerated", {
          detail: loadout,
        })
      );
    } finally {
      setTimeout(() => {
        this.isAddingToHistory = false;
      }, 500);
    }
  }
}

// ========================================
// Export for use in app.js
// ========================================
window.SlotMachine = SlotMachine;
window.FilterSystem = FilterSystem;
window.GadgetSelector = GadgetSelector;
window.ClassData = ClassData;
