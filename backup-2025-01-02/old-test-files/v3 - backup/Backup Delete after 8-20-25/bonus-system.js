/**
 * Bonus Respin System for The Finals Loadout Generator
 * 15% chance to trigger bonus spins with special effects
 */

// ========================================
// Bonus Configuration
// ========================================
const BONUS_CONFIG = {
  triggerChance: 0.15, // 15% chance

  // Bonus types with different rarities
  bonusTypes: [
    {
      type: "DOUBLE_SPIN",
      weight: 40,
      name: "Double Trouble",
      description: "Get 2 loadouts for the price of 1!",
      color: "#00ffcc",
      icon: "🎰🎰",
    },
    {
      type: "GUARANTEED_META",
      weight: 25,
      name: "Meta Madness",
      description: "Guaranteed S-tier weapon!",
      color: "#ffd700",
      icon: "⭐",
    },
    {
      type: "CLASS_CHOICE",
      weight: 20,
      name: "Class Master",
      description: "Choose any class for next spin!",
      color: "#ff69b4",
      icon: "🎯",
    },
    {
      type: "WILD_CARD",
      weight: 10,
      name: "Wild Card",
      description: "Mix items from ALL classes!",
      color: "#ff0066",
      icon: "🃏",
    },
    {
      type: "JACKPOT",
      weight: 5,
      name: "JACKPOT",
      description: "Perfect synergy loadout guaranteed!",
      color: "#ff0000",
      icon: "💎",
    },
  ],

  // Visual effects configuration
  effects: {
    particles: true,
    screenShake: true,
    glowIntensity: 2,
    soundVolume: 0.5,
  },

  // Celebration messages
  messages: {
    trigger: [
      "BONUS ROUND ACTIVATED!",
      "LUCKY SPIN INCOMING!",
      "RNG GODS SMILE UPON YOU!",
      "SPECIAL DELIVERY!",
      "WINNER WINNER!",
    ],
    complete: [
      "BONUS COMPLETE!",
      "EXTRA SPINS DELIVERED!",
      "LUCK STAT MAXED!",
      "GG EZ!",
      "CALCULATED.",
    ],
  },
};

// ========================================
// Bonus Manager Class
// ========================================
class BonusManager {
  constructor() {
    this.isActive = false;
    this.currentBonus = null;
    this.bonusHistory = [];
    this.consecutiveNonBonus = 0;
    this.initialize();
  }

  /**
   * Initialize bonus system
   */
  initialize() {
    this.createBonusUI();
    this.loadBonusHistory();
    this.attachEventListeners();
    console.log("🎁 Bonus system initialized");
  }

  /**
   * Create bonus UI elements
   */
  createBonusUI() {
    // Create bonus overlay
    const overlay = document.createElement("div");
    overlay.id = "bonus-overlay";
    overlay.className = "bonus-overlay";
    overlay.innerHTML = `
            <div class="bonus-container">
                <div class="bonus-glow"></div>
                <div class="bonus-content">
                    <div class="bonus-icon"></div>
                    <h2 class="bonus-title"></h2>
                    <p class="bonus-description"></p>
                    <div class="bonus-progress">
                        <div class="bonus-progress-bar"></div>
                    </div>
                </div>
                <div class="bonus-particles"></div>
            </div>
        `;
    document.body.appendChild(overlay);

    // Create bonus indicator
    const indicator = document.createElement("div");
    indicator.id = "bonus-indicator";
    indicator.className = "bonus-indicator";
    indicator.innerHTML = `
            <span class="bonus-chance">15%</span>
            <span class="bonus-label">BONUS CHANCE</span>
        `;

    // Add to slot machine container
    const slotContainer = document.getElementById("slot-machine-container");
    if (slotContainer) {
      slotContainer.appendChild(indicator);
    }
  }

  /**
   * Check if bonus should trigger
   */
  checkBonusTrigger() {
    // Increase chance slightly if no bonus for a while
    let chance = BONUS_CONFIG.triggerChance;
    if (this.consecutiveNonBonus > 5) {
      chance += 0.05; // +5% after 5 non-bonus spins
    }
    if (this.consecutiveNonBonus > 10) {
      chance += 0.1; // +15% total after 10 non-bonus spins
    }

    const roll = Math.random();
    const triggered = roll < chance;

    if (triggered) {
      this.consecutiveNonBonus = 0;
      return true;
    } else {
      this.consecutiveNonBonus++;
      return false;
    }
  }

  /**
   * Trigger bonus round
   */
  async triggerBonus() {
    if (this.isActive) return null;

    this.isActive = true;

    // Check if bonus triggers
    if (!this.checkBonusTrigger()) {
      this.isActive = false;
      return null;
    }

    // Select bonus type
    const bonusType = this.selectBonusType();
    this.currentBonus = bonusType;

    console.log("🎁 BONUS TRIGGERED:", bonusType);

    // Show bonus animation
    await this.showBonusAnimation(bonusType);

    // Add to history
    this.bonusHistory.push({
      type: bonusType.type,
      timestamp: Date.now(),
    });
    this.saveBonusHistory();

    return bonusType;
  }

  /**
   * Select bonus type based on weights
   */
  selectBonusType() {
    const totalWeight = BONUS_CONFIG.bonusTypes.reduce(
      (sum, b) => sum + b.weight,
      0
    );
    let random = Math.random() * totalWeight;

    for (const bonus of BONUS_CONFIG.bonusTypes) {
      random -= bonus.weight;
      if (random <= 0) {
        return bonus;
      }
    }

    return BONUS_CONFIG.bonusTypes[0]; // Fallback
  }

  /**
   * Show bonus animation
   */
  async showBonusAnimation(bonusType) {
    const overlay = document.getElementById("bonus-overlay");
    if (!overlay) return;

    // Update content
    const icon = overlay.querySelector(".bonus-icon");
    const title = overlay.querySelector(".bonus-title");
    const description = overlay.querySelector(".bonus-description");

    icon.textContent = bonusType.icon;
    title.textContent = bonusType.name;
    description.textContent = bonusType.description;

    // Set color theme
    overlay.style.setProperty("--bonus-color", bonusType.color);

    // Show overlay
    overlay.classList.add("active");

    // Play sound
    this.playBonusSound();

    // Trigger effects
    if (BONUS_CONFIG.effects.particles) {
      this.createParticles();
    }

    if (BONUS_CONFIG.effects.screenShake) {
      this.shakeScreen();
    }

    // Show random message
    const message = this.getRandomMessage("trigger");
    this.showBonusMessage(message);

    // Wait for animation
    await new Promise((resolve) => setTimeout(resolve, 3000));

    // Hide overlay
    overlay.classList.remove("active");
  }

  /**
   * Apply bonus effect to loadout generation
   */
  async applyBonusEffect(baseLoadout, slotMachine) {
    if (!this.currentBonus) return baseLoadout;

    const bonus = this.currentBonus;
    let result = baseLoadout;

    switch (bonus.type) {
      case "DOUBLE_SPIN":
        result = await this.applyDoubleSpin(baseLoadout, slotMachine);
        break;

      case "GUARANTEED_META":
        result = this.applyGuaranteedMeta(baseLoadout);
        break;

      case "CLASS_CHOICE":
        result = await this.applyClassChoice(baseLoadout, slotMachine);
        break;

      case "WILD_CARD":
        result = this.applyWildCard(baseLoadout);
        break;

      case "JACKPOT":
        result = this.applyJackpot(baseLoadout);
        break;
    }

    // Reset current bonus
    this.currentBonus = null;
    this.isActive = false;

    // Show completion message
    const message = this.getRandomMessage("complete");
    this.showBonusMessage(message);

    return result;
  }

  /**
   * Double spin - generate two loadouts
   */
  async applyDoubleSpin(baseLoadout, slotMachine) {
    // Generate second loadout
    const secondLoadout = await slotMachine.spin(baseLoadout.class);

    // Return both loadouts
    return {
      ...baseLoadout,
      isDouble: true,
      secondLoadout: secondLoadout,
      bonusType: "DOUBLE_SPIN",
    };
  }

  /**
   * Guaranteed meta - ensure S-tier weapon
   */
  applyGuaranteedMeta(baseLoadout) {
    const metaWeapons = {
      Light: ["SR-84", "V9S", "XP-54"],
      Medium: ["FCAR", "AKM"],
      Heavy: ["M134 Minigun", "ShAK-50"],
    };

    const classMetaWeapons = metaWeapons[baseLoadout.class] || [];
    if (classMetaWeapons.length > 0) {
      baseLoadout.weapon =
        classMetaWeapons[Math.floor(Math.random() * classMetaWeapons.length)];
      baseLoadout.bonusType = "GUARANTEED_META";
      baseLoadout.isMetaBonus = true;
    }

    return baseLoadout;
  }

  /**
   * Class choice - let player choose next class
   */
  async applyClassChoice(baseLoadout, slotMachine) {
    // Show class selection UI
    const selectedClass = await this.showClassSelector();

    if (selectedClass && selectedClass !== baseLoadout.class) {
      // Generate new loadout with selected class
      const newLoadout = await slotMachine.spin(selectedClass);
      newLoadout.bonusType = "CLASS_CHOICE";
      newLoadout.wasClassChoice = true;
      return newLoadout;
    }

    return baseLoadout;
  }

  /**
   * Wild card - mix items from all classes
   */
  applyWildCard(baseLoadout) {
    // Get all available items across classes
    const allWeapons = [];
    const allSpecs = [];
    const allGadgets = [];

    ["Light", "Medium", "Heavy"].forEach((className) => {
      const classData = window.GameData?.loadouts[className];
      if (classData) {
        allWeapons.push(...classData.weapons);
        allSpecs.push(...classData.specializations);
        allGadgets.push(...classData.gadgets);
      }
    });

    // Create wild loadout
    const wildLoadout = {
      ...baseLoadout,
      weapon: allWeapons[Math.floor(Math.random() * allWeapons.length)],
      specialization: allSpecs[Math.floor(Math.random() * allSpecs.length)],
      gadgets: this.getUniqueRandomItems(allGadgets, 3),
      bonusType: "WILD_CARD",
      isWild: true,
    };

    return wildLoadout;
  }

  /**
   * Jackpot - perfect synergy loadout
   */
  applyJackpot(baseLoadout) {
    const perfectLoadouts = {
      Light: {
        weapon: "SR-84",
        specialization: "Cloaking Device",
        gadgets: ["Stun Gun", "Vanishing Bomb", "Flashbang"],
      },
      Medium: {
        weapon: "FCAR",
        specialization: "Healing Beam",
        gadgets: ["Defibrillator", "Jump Pad", "Frag Grenade"],
      },
      Heavy: {
        weapon: "M134 Minigun",
        specialization: "Mesh Shield",
        gadgets: ["RPG-7", "C4", "Dome Shield"],
      },
    };

    const perfect = perfectLoadouts[baseLoadout.class];
    if (perfect) {
      return {
        ...baseLoadout,
        ...perfect,
        bonusType: "JACKPOT",
        isJackpot: true,
        synergyScore: 10,
      };
    }

    return baseLoadout;
  }

  /**
   * Show class selector UI
   */
  async showClassSelector() {
    return new Promise((resolve) => {
      const modal = document.createElement("div");
      modal.className = "bonus-class-selector";
      modal.innerHTML = `
                <div class="selector-content">
                    <h3>CHOOSE YOUR CLASS!</h3>
                    <div class="class-options">
                        <button class="class-option" data-class="Light">
                            <span class="class-icon">⚡</span>
                            <span>LIGHT</span>
                        </button>
                        <button class="class-option" data-class="Medium">
                            <span class="class-icon">⚖️</span>
                            <span>MEDIUM</span>
                        </button>
                        <button class="class-option" data-class="Heavy">
                            <span class="class-icon">🛡️</span>
                            <span>HEAVY</span>
                        </button>
                    </div>
                </div>
            `;

      document.body.appendChild(modal);

      // Handle selection
      modal.addEventListener("click", (e) => {
        const option = e.target.closest(".class-option");
        if (option) {
          const selectedClass = option.dataset.class;
          modal.remove();
          resolve(selectedClass);
        }
      });

      // Auto-close after 10 seconds
      setTimeout(() => {
        if (modal.parentNode) {
          modal.remove();
          resolve(null);
        }
      }, 10000);
    });
  }

  /**
   * Create particle effects
   */
  createParticles() {
    const container = document.querySelector(".bonus-particles");
    if (!container) return;

    for (let i = 0; i < 50; i++) {
      const particle = document.createElement("div");
      particle.className = "particle";
      particle.style.left = Math.random() * 100 + "%";
      particle.style.animationDelay = Math.random() * 2 + "s";
      particle.style.animationDuration = 2 + Math.random() * 3 + "s";
      container.appendChild(particle);

      // Remove after animation
      setTimeout(() => particle.remove(), 5000);
    }
  }

  /**
   * Shake screen effect
   */
  shakeScreen() {
    document.body.classList.add("screen-shake");
    setTimeout(() => {
      document.body.classList.remove("screen-shake");
    }, 500);
  }

  /**
   * Play bonus sound
   */
  playBonusSound() {
    // Use existing sound system or create new audio
    const audio = new Audio("../sounds/bonus.mp3");
    audio.volume = BONUS_CONFIG.effects.soundVolume;
    audio.play().catch((e) => console.log("Bonus sound failed:", e));
  }

  /**
   * Show bonus message
   */
  showBonusMessage(message) {
    const messageEl = document.createElement("div");
    messageEl.className = "bonus-message";
    messageEl.textContent = message;
    document.body.appendChild(messageEl);

    setTimeout(() => {
      messageEl.classList.add("show");
    }, 10);

    setTimeout(() => {
      messageEl.classList.remove("show");
      setTimeout(() => messageEl.remove(), 500);
    }, 2000);
  }

  /**
   * Get random message
   */
  getRandomMessage(type) {
    const messages = BONUS_CONFIG.messages[type];
    return messages[Math.floor(Math.random() * messages.length)];
  }

  /**
   * Get unique random items
   */
  getUniqueRandomItems(array, count) {
    const shuffled = [...array].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, count);
  }

  /**
   * Attach event listeners
   */
  attachEventListeners() {
    // Listen for spin events
    document.addEventListener("slotSpinStart", () => {
      this.updateIndicator();
    });

    document.addEventListener("slotSpinComplete", async (e) => {
      // The bonus system is now handled WITHIN the slot machine spin process
      // This listener is kept for monitoring purposes but doesn't trigger additional bonuses
      console.log("🎁 BonusManager received slotSpinComplete event:", e.detail?.loadout);
      
      // Just update the indicator after spin
      this.updateIndicator();
    });
  }

  /**
   * Update bonus indicator
   */
  updateIndicator() {
    const indicator = document.getElementById("bonus-indicator");
    if (!indicator) return;

    const chance = Math.min(
      BONUS_CONFIG.triggerChance + this.consecutiveNonBonus * 0.01,
      0.5
    );

    const chanceEl = indicator.querySelector(".bonus-chance");
    if (chanceEl) {
      chanceEl.textContent = Math.round(chance * 100) + "%";
    }

    // Add glow effect when chance is high
    if (chance > 0.25) {
      indicator.classList.add("high-chance");
    } else {
      indicator.classList.remove("high-chance");
    }
  }

  /**
   * Load bonus history
   */
  loadBonusHistory() {
    try {
      const saved = localStorage.getItem("bonus_history_v2");
      if (saved) {
        this.bonusHistory = JSON.parse(saved);
      }
    } catch (error) {
      console.error("Failed to load bonus history:", error);
    }
  }

  /**
   * Save bonus history
   */
  saveBonusHistory() {
    try {
      localStorage.setItem(
        "bonus_history_v2",
        JSON.stringify(this.bonusHistory)
      );
    } catch (error) {
      console.error("Failed to save bonus history:", error);
    }
  }

  /**
   * Get bonus statistics
   */
  getStatistics() {
    const total = this.bonusHistory.length;
    const types = {};

    this.bonusHistory.forEach((entry) => {
      types[entry.type] = (types[entry.type] || 0) + 1;
    });

    return {
      totalBonuses: total,
      consecutiveNonBonus: this.consecutiveNonBonus,
      typeBreakdown: types,
      lastBonus: this.bonusHistory[this.bonusHistory.length - 1],
    };
  }
}

// ========================================
// Export for use
// ========================================
window.BonusManager = BonusManager;
