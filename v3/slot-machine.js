/**
 * The Finals Slot Machine Core System
 * Bulletproof data integrity with deception engine
 */

// ========================================
// Slot Machine Configuration
// ========================================
const SlotConfig = {
  columns: ["weapon", "specialization", "gadget-1", "gadget-2", "gadget-3"],
  itemsPerScroll: 200, // Increased for better viewport coverage
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
// Class Data - Will use GameData from app.js if available
// ========================================
let ClassData = {
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

    // CRITICAL: Winner must be at position adjusted for start padding
    const winnerPosition = 40; // Adjusted for start padding (20 + original 20)

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
    // Need larger buffer to ensure viewport is always filled (240px = 3 items)
    // With animation speeds up to 2400px/s, we need extra coverage
    const loopBuffer = 100; // Much larger buffer for seamless looping
    for (let i = 0; i < loopBuffer; i++) {
      content.push(this.selectRandom(itemPool));
    }

    // CRITICAL FIX: Add additional padding at start to prevent gaps at top
    const startPadding = [];
    for (let i = 0; i < 20; i++) {
      startPadding.push(this.selectRandom(itemPool));
    }
    // Insert padding at the beginning
    content.unshift(...startPadding);
    
    console.log(`📊 Built scroll content: ${content.length} total items for seamless looping`);
    
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
    // Sync ClassData with GameData from app.js if available
    if (typeof GameData !== 'undefined' && GameData.loadouts) {
      console.log("✅ Using GameData from app.js for slot machine");
      ClassData.Light = GameData.loadouts.Light;
      ClassData.Medium = GameData.loadouts.Medium;
      ClassData.Heavy = GameData.loadouts.Heavy;
    } else {
      console.log("⚠️ Using fallback ClassData in slot machine");
    }
    
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
    
    // Use V2 engine (improved physics)
    if (typeof AnimationEngineV2 !== "undefined") {
      this.animationEngine = new AnimationEngineV2();
      return;
    } else {
      // Try to load V2 first
      const script = document.createElement("script");
      script.src = "/v3/animation-engine-v2.js";
      script.onload = () => {
        if (typeof AnimationEngineV2 !== "undefined") {
          this.animationEngine = new AnimationEngineV2();
        }
      };
      script.onerror = () => {
        // No fallback - V2 is required
        console.error('Failed to load animation engine');
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

    // CRITICAL: Remove all winner highlighting before starting spin
    this.removeAllWinnerHighlighting();

    console.log(
      `🎰 Starting ${totalSpins} spin${
        totalSpins > 1 ? "s" : ""
      } for ${classType} class`
    );
    
    // Prevent re-entry during spin
    if (this.spinInProgress) {
      console.warn("⚠️ Spin already in progress, ignoring duplicate call");
      this.isSpinning = false;
      return null;
    }
    this.spinInProgress = true;

    try {
      // Create spin counter display
      this.showSpinCounter(totalSpins);

      // Perform multiple spin cycles
      let finalLoadout = null; // Define at outer scope
      
      for (let currentSpin = 1; currentSpin <= totalSpins; currentSpin++) {
        // CRITICAL FIX: Capture the current spin value to prevent closure issues
        const capturedSpin = currentSpin;
        const capturedTotal = totalSpins;
        
        console.log(`🔄 Spin ${capturedSpin} of ${capturedTotal}`);
        console.log(`[COUNTER] Loop iteration: i=${currentSpin}, capturedSpin=${capturedSpin}, totalSpins=${capturedTotal}`);

        // Update spin counter with captured values
        this.updateSpinCounter(capturedSpin, capturedTotal);

        // Get filtered data
        const filteredData = this.filterSystem.getFilteredData(classType);

        let loadout = null;
        const isFirstSpin = capturedSpin === 1;
        const isFinalSpin = capturedSpin === capturedTotal;

        // Only predetermine outcome on FINAL spin
        if (isFinalSpin) {
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

          // Force rebuild DOM with winners for final spin
          this.populateScrollContainers(true, false);
          
        } else {
          // Intermediate spins - random items, no predetermined outcome
          this.generateRandomScrollContents(classType, filteredData);

          if (isFirstSpin) {
            // First spin: build DOM with random content
            this.populateScrollContainers(true, false);
          } else {
            // Intermediate spins: preserve position and DOM
            this.populateScrollContainers(false, true);
          }
        }

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

          if (capturedSpin === capturedTotal) {
            // Final spin - full dramatic animation with predetermined outcome
            console.log('🎆 Starting FINAL spin animation with loadout:', loadout);
            try {
              await this.animationEngine.animateSlotMachine(
                columnElements,
                this.deceptionEngine.scrollContents,
                loadout,
                false // Don't preserve position for final spin (need winners)
              );
              console.log('✅ Final animation completed');
            } catch (error) {
              console.error('❌ Animation failed:', error);
              await this.basicAnimation();
            }
          } else {
            // Quick spin - maintain velocity and position continuity
            const preservePosition = !isFirstSpin; // Preserve position for spins 2, 3, 4...
            console.log(`⚡ Starting quick spin animation (preservePosition=${preservePosition})`);
            try {
              await this.animationEngine.animateQuickSpin(
                columnElements,
                this.deceptionEngine.scrollContents,
                preservePosition
              );
              console.log('✅ Quick animation completed');
            } catch (error) {
              console.error('❌ Quick animation failed:', error);
              await this.basicAnimation();
            }

            // No pause between spins for seamless continuity
            console.log('🔄 Seamless transition to next spin...');
          }
        } else {
          // Animation engine not available, use basic animation
          await this.basicAnimation();
        }

        // Only process final results on the last spin
        if (capturedSpin === capturedTotal) {
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
          }
          
          // ALWAYS dispatch slotSpinComplete event regardless of bonus
          console.log("🎯 Dispatching slotSpinComplete event with loadout:", finalLoadout);
          document.dispatchEvent(
            new CustomEvent("slotSpinComplete", {
              detail: {
                loadout: finalLoadout,
                slotMachine: this,
              },
            })
          );
        }
      } // End of spin loop

      // Hide spin counter
      this.hideSpinCounter();
      
      // Clear spin in progress flag
      this.spinInProgress = false;

      // Return the final loadout after all spins
      console.log("🎯 RETURNING LOADOUT FROM SPIN:", finalLoadout);
      return finalLoadout;
    } catch (error) {
      console.error("Spin error:", error);
      this.spinInProgress = false;
      return null;
    } finally {
      // Reset spin lock after a delay
      setTimeout(() => {
        this.isSpinning = false;
        this.spinInProgress = false;
      }, SlotConfig.spinDuration + 1000);
    }
  }

  /**
   * Populate the scroll containers with items
   * @param {boolean} forceBuild - Force rebuild DOM even if already exists
   * @param {boolean} preservePosition - Keep current position instead of resetting
   */
  populateScrollContainers(forceBuild = false, preservePosition = false) {
    SlotConfig.columns.forEach((columnType) => {
      const column = this.columns[columnType];
      if (!column || !column.itemsContainer) return;
      
      // Disable CSS transitions during spin
      column.itemsContainer.style.transition = 'none';
      column.element.style.transition = 'none';

      const items = this.deceptionEngine.scrollContents[columnType];
      if (!items) {
        console.error(`No items for column ${columnType}`);
        return;
      }
      
      console.log(`📊 Column ${columnType}: ${items.length} items, first 5:`, items.slice(0, 5));

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

      // Store current position if preserving
      let currentPosition = -1680; // Default position
      if (preservePosition) {
        const currentTransform = column.itemsContainer.style.transform;
        const match = currentTransform.match(/translateY\((-?\d+(?:\.\d+)?)px\)/);
        if (match) {
          currentPosition = parseFloat(match[1]);
          console.log(`💾 Preserving position for ${columnType}: ${currentPosition}px`);
        }
      }

      // Only rebuild DOM if forced or container is empty
      const needsBuild = forceBuild || column.itemsContainer.children.length === 0;
      
      if (needsBuild) {
        console.log(`🔨 Building DOM for ${columnType} (forceBuild=${forceBuild})`);
        
        // Clear existing items only when rebuilding
        column.itemsContainer.innerHTML = "";

        // CRITICAL FIX: Verify we have enough items to prevent blank areas
        if (items.length < 30) {
          console.error(`❌ Insufficient items for column ${columnType}: ${items.length} items. Need at least 30.`);
          // Add fallback items to prevent blanks
          while (items.length < 30) {
            items.push(items[items.length % Math.max(1, items.length)] || "Fallback Item");
          }
          console.log(`🔧 Added fallback items, now have ${items.length} items for ${columnType}`);
        }

        // Add items to scroll container
        items.forEach((item, index) => {
          const itemElement = document.createElement("div");
          itemElement.className = "slot-item";

          // Winner item will be at position 40 (no visual highlighting during spin)
          if (index === 40 && item === winner) {
            console.log(`🎯 Winner "${item}" placed at index 40 in ${columnType} column (no highlighting during spin)`);
          }

          // Create image element using preloader if available
          let img;
          if (typeof ImagePreloader !== 'undefined') {
            img = ImagePreloader.createImageElement(item);
          } else {
            // Fallback to basic image creation
            img = document.createElement("img");
            const imagePath = typeof getImagePath !== 'undefined' 
              ? getImagePath(item) 
              : `/images/${item.replace(/\s+/g, "_")}.webp`;
            
            img.src = imagePath;
            img.alt = item;
            img.loading = "eager";
            
            img.onerror = function () {
              console.warn(`❌ Failed to load image: ${imagePath} for item: ${item}`);
              this.style.display = "none";
              const textSpan = document.createElement("span");
              textSpan.textContent = item;
              textSpan.style.color = "#fff";
              textSpan.style.fontSize = "14px";
              textSpan.style.textAlign = "center";
              itemElement.appendChild(textSpan);
            };
          }

          // Create label
          const label = document.createElement("div");
          label.className = "item-label";
          label.textContent = item;

          itemElement.appendChild(img);
          itemElement.appendChild(label);

          // Near-miss items will be marked only after landing for psychological effect
          // No visual indicators during spin

          column.itemsContainer.appendChild(itemElement);
        });
      } else {
        console.log(`♻️ Reusing existing DOM for ${columnType} (${column.itemsContainer.children.length} items)`);
      }

      // Set position: preserve current position or use default
      if (!preservePosition) {
        // Only reset position if not preserving (first spin or forced rebuild)
        const initialTranslate = -1680; // 20 items above viewport + small buffer
        column.itemsContainer.style.transform = `translateY(${initialTranslate}px)`;
        console.log(`🎰 ${columnType} reset position: ${initialTranslate}px (winner at effective position 20)`);
      } else {
        // Keep the current position for continuity
        column.itemsContainer.style.transform = `translateY(${currentPosition}px)`;
        console.log(`🔄 ${columnType} preserved position: ${currentPosition}px`);
      }
      
      // CRITICAL FIX: Ensure viewport is always filled by checking visible items
      this.ensureViewportCoverage(column, columnType);
    });
  }

  /**
   * Ensure the viewport always has visible items (no blanks)
   */
  ensureViewportCoverage(column, columnType) {
    if (!column || !column.itemsContainer) return;
    
    const itemsContainer = column.itemsContainer;
    const items = itemsContainer.querySelectorAll('.slot-item');
    
    // Get current transform to understand positioning
    const currentTransform = itemsContainer.style.transform;
    let translateY = -1680; // Default (consistent with winner at effective position 20)
    const match = currentTransform.match(/translateY\((-?\d+(?:\.\d+)?)px\)/);
    if (match) {
      translateY = parseFloat(match[1]);
    }
    
    // Calculate which items should be visible in 240px viewport
    // Item height is 80px, so we need items from index = Math.floor(-translateY / 80) to index + 4
    const startIndex = Math.floor(-translateY / 80);
    const endIndex = startIndex + 4; // Show at least 4 items (3 visible + 1 buffer)
    
    // Ensure we have items in the visible range
    let hasVisibleItems = false;
    for (let i = startIndex; i < endIndex && i < items.length; i++) {
      if (i >= 0 && items[i]) {
        hasVisibleItems = true;
        break;
      }
    }
    
    if (!hasVisibleItems) {
      console.warn(`⚠️ No visible items in viewport for ${columnType}! translateY=${translateY}, startIndex=${startIndex}, totalItems=${items.length}`);
      
      // Emergency fix: adjust position to ensure items are visible
      if (items.length > 0) {
        const safeTranslateY = Math.max(-((items.length - 3) * 80), -1680);
        itemsContainer.style.transform = `translateY(${safeTranslateY}px)`;
        console.log(`🔧 Adjusted ${columnType} position to ${safeTranslateY}px for visibility`);
      }
    } else {
      console.log(`✅ ${columnType} viewport coverage verified: ${items.length} items, translateY=${translateY}px`);
    }
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
    console.log(`[COUNTER] showSpinCounter called with totalSpins=${totalSpins}`);
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
    console.log(`[COUNTER] updateSpinCounter called with current=${current}, total=${total}`);
    const counter = document.getElementById("spin-counter");
    if (counter) {
      const numberEl = counter.querySelector(".spin-counter-number");
      if (numberEl) {
        console.log(`[COUNTER] Updating display from "${numberEl.textContent}" to "${current}"`);
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
      // CRITICAL FIX: Need many more items to fill viewport properly
      const scrollItems = [];
      const minItems = 50; // Much more items for proper viewport coverage
      for (let i = 0; i < minItems; i++) {
        scrollItems.push(items[i % items.length]);
      }
      
      // Add extra padding to prevent gaps
      for (let i = 0; i < 20; i++) {
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
   * Add loadout to history (DEPRECATED - now handled by slotSpinComplete event)
   */
  async addToHistory(loadout) {
    // History recording is now handled by slotSpinComplete event listener in app.js
    // This method is kept for compatibility but does nothing
    console.log("📝 addToHistory called but history is now handled by slotSpinComplete event");
  }

  /**
   * Post-landing highlight system with delay for better visual effect
   * Called ONLY after slotSpinComplete event with 100ms delay
   */
  async highlightWinnersAfterLanding(loadout) {
    console.log("🎯 Starting winner highlighting with 100ms delay...");
    
    // Remove any existing highlighting first
    this.removeAllWinnerHighlighting();
    
    // Add 100ms delay for all five center cells to highlight simultaneously
    await new Promise(resolve => setTimeout(resolve, 100));
    
    console.log("✨ Highlighting winners:", loadout);
    
    SlotConfig.columns.forEach((columnType) => {
      const column = this.columns[columnType];
      if (!column || !column.itemsContainer) return;

      // Get winner item for this column
      let winnerName = null;
      if (columnType === "weapon") {
        winnerName = loadout.weapon;
      } else if (columnType === "specialization") {
        winnerName = loadout.specialization;
      } else if (columnType.startsWith("gadget-")) {
        const gadgetIndex = parseInt(columnType.split("-")[1]) - 1;
        winnerName = loadout.gadgets[gadgetIndex];
      }

      if (!winnerName) return;

      // Find the center cell in viewport (should be the visible winner)
      // The viewport is 240px tall, showing 3 items of 80px each
      // Center row is at 80-160px, so we look for items in that range
      const items = column.itemsContainer.querySelectorAll('.slot-item');
      const containerRect = column.itemsContainer.getBoundingClientRect();
      const windowRect = column.window.getBoundingClientRect();
      
      let centerItem = null;
      let bestDistance = Infinity;
      
      items.forEach((item) => {
        const itemRect = item.getBoundingClientRect();
        const itemCenter = itemRect.top + itemRect.height / 2;
        const windowCenter = windowRect.top + windowRect.height / 2;
        const distance = Math.abs(itemCenter - windowCenter);
        
        // Check if this item contains our winner and is closest to center
        if (item.textContent.includes(winnerName) && distance < bestDistance) {
          bestDistance = distance;
          centerItem = item;
        }
      });

      if (centerItem) {
        // Add winner highlighting with orange glow and star
        this.addWinnerHighlight(centerItem, columnType);
        
        // Also add near-miss highlighting to adjacent items for psychological effect
        this.addNearMissHighlighting(centerItem, column);
        
        console.log(`✨ Winner "${winnerName}" highlighted in ${columnType} column`);
      }
    });
  }

  /**
   * Remove all winner highlighting from all columns
   */
  removeAllWinnerHighlighting() {
    SlotConfig.columns.forEach((columnType) => {
      const column = this.columns[columnType];
      if (!column || !column.itemsContainer) return;
      
      // Remove all winner classes and highlighting
      const allItems = column.itemsContainer.querySelectorAll('.slot-item');
      allItems.forEach(item => {
        item.classList.remove('winner-item', 'winner-highlight', 'winner-celebration', 'near-miss');
        
        // Remove any inline styles added by highlighting
        item.style.background = '';
        item.style.borderColor = '';
        item.style.boxShadow = '';
        item.style.transform = '';
        item.style.zIndex = '';
        item.style.animation = '';
        
        // Remove star elements
        const star = item.querySelector('.winner-star');
        if (star) star.remove();
      });
    });
  }

  /**
   * Add near-miss highlighting to items adjacent to the winner
   */
  addNearMissHighlighting(centerItem, column) {
    if (!centerItem || !column || !column.itemsContainer) return;
    
    const allItems = Array.from(column.itemsContainer.querySelectorAll('.slot-item'));
    const centerIndex = allItems.indexOf(centerItem);
    
    if (centerIndex === -1) return;
    
    // Add near-miss class to items above and below the winner
    const nearMissIndices = [centerIndex - 1, centerIndex + 1];
    
    nearMissIndices.forEach(index => {
      if (index >= 0 && index < allItems.length) {
        allItems[index].classList.add('near-miss');
      }
    });
  }

  /**
   * Add winner highlighting (orange + star) to a specific item
   */
  addWinnerHighlight(item, columnType) {
    // Remove any existing winner highlights from this column
    const column = this.columns[columnType];
    if (column && column.itemsContainer) {
      const existingWinners = column.itemsContainer.querySelectorAll('.winner-highlight');
      existingWinners.forEach(winner => {
        winner.classList.remove('winner-highlight');
        const star = winner.querySelector('.winner-star');
        if (star) star.remove();
      });
    }

    // Add winner highlight class
    item.classList.add('winner-highlight');

    // Add initial celebration animation (700ms burst)
    item.classList.add('winner-celebration');

    // Add star indicator
    const star = document.createElement('div');
    star.className = 'winner-star';
    star.innerHTML = '★';
    star.style.cssText = `
      position: absolute;
      top: 5px;
      right: 5px;
      color: #ff6600;
      font-size: 1.5rem;
      text-shadow: 0 0 8px rgba(255, 102, 0, 0.8);
      animation: starPulse 2s ease-in-out infinite;
      z-index: 10;
      pointer-events: none;
    `;
    
    item.style.position = 'relative';
    item.appendChild(star);

    // Add orange glow effect
    item.style.background = 'linear-gradient(135deg, rgba(255, 102, 0, 0.3), rgba(255, 165, 0, 0.2))';
    item.style.borderColor = '#ff6600';
    item.style.boxShadow = '0 0 20px rgba(255, 102, 0, 0.6), inset 0 0 10px rgba(255, 102, 0, 0.2)';
    item.style.transform = 'scale(1.05)';
    item.style.zIndex = '5';

    // After celebration animation completes (700ms), remove celebration class and start continuous pulse
    setTimeout(() => {
      item.classList.remove('winner-celebration');
      item.style.animation = 'winnerPulse 3s ease-in-out infinite';
    }, 700);
  }
}

// ========================================
// Export for use in app.js
// ========================================
window.SlotMachine = SlotMachine;
window.FilterSystem = FilterSystem;
window.GadgetSelector = GadgetSelector;
window.ClassData = ClassData;
