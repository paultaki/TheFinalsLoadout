// =====================================================
// SLOT MACHINE COMPONENT - MODULAR JAVASCRIPT
// =====================================================

class SlotMachine {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.statusBar = null;
    this.itemsContainer = null;
    this.columns = [];
    this.isAnimating = false;
    this.currentLoadout = null;
  }

  // Initialize the slot machine
  init() {
    if (!this.container) {
      console.error("Slot machine container not found");
      return;
    }

    // Set up the HTML structure
    this.container.innerHTML = `
      <div class="slot-status-bar">
        <span id="slot-status-text"></span>
      </div>
      <div class="slot-machine-items"></div>
    `;

    this.statusBar = this.container.querySelector(".slot-status-bar");
    this.itemsContainer = this.container.querySelector(".slot-machine-items");
  }

  // Display a loadout in the slot machine
  displayLoadout(loadout) {
    if (!loadout || this.isAnimating) return;

    this.currentLoadout = loadout;
    const { classType, weapons, specializations, gadgets, spinsRemaining } =
      loadout;

    // Update status bar
    this.updateStatus(classType, spinsRemaining);

    // Build slot machine items
    const slots = this.buildSlots(weapons, specializations, gadgets);
    this.itemsContainer.innerHTML = slots;

    // Store column references
    this.columns = Array.from(
      this.itemsContainer.querySelectorAll(".slot-scroll")
    );
  }

  // Update status bar
  updateStatus(classType, spinsRemaining) {
    const statusText = this.statusBar.querySelector("#slot-status-text");
    if (statusText) {
      let status = `${classType} Class`;
      if (spinsRemaining !== undefined && spinsRemaining !== null) {
        status += ` - ${spinsRemaining} spins remaining`;
      }
      statusText.textContent = status;
    }
  }

  // Build slot HTML
  buildSlots(weapon, spec, gadgets) {
    const slots = [];

    // Weapon slot
    slots.push(this.createSlot(weapon, "weapon"));

    // Specialization slot
    slots.push(this.createSlot(spec, "spec"));

    // Gadget slots
    gadgets.forEach((gadget, index) => {
      slots.push(this.createSlot(gadget, `gadget-${index}`));
    });

    return slots.join("");
  }

  // Create individual slot
  createSlot(item, type) {
    return `
      <div class="slot-item" data-slot-type="${type}">
        <div class="slot-scroll">
          ${this.createSlotCell(item, true)}
        </div>
      </div>
    `;
  }

  // Create slot cell
  createSlotCell(item, isWinner = false) {
    const imageName = item.replace(/ /g, "_");
    return `
      <div class="slot-cell ${isWinner ? "winner" : ""}">
        <img src="images/${imageName}.webp" alt="${item}" loading="lazy">
        <p>${item}</p>
      </div>
    `;
  }

  // Animate slot machine
  async animateSlots(loadout, onComplete) {
    if (this.isAnimating || !this.columns.length) return;

    this.isAnimating = true;
    this.currentLoadout = loadout;

    // First display the initial state
    this.displayLoadout(loadout);

    // Prepare columns for animation
    const animationData = this.prepareAnimation(loadout);

    // Start spinning sound if available
    this.playSound("spinningSound");

    // Animate each column
    try {
      await this.runAnimation(animationData);

      // Stop spinning sound
      this.stopSound("spinningSound");

      // Play final sound
      this.playSound("finalSound");

      // Apply winner effects
      this.applyWinnerEffects();

      // Callback
      if (onComplete) onComplete();
    } catch (error) {
      console.error("Animation error:", error);
    } finally {
      this.isAnimating = false;
    }
  }

  // Prepare animation data
  prepareAnimation(loadout) {
    const { weapons, specializations, gadgets, allItems } = loadout;
    const animationData = [];

    // Prepare each column
    this.columns.forEach((column, index) => {
      let items, winner;

      if (index === 0) {
        items = allItems.weapons;
        winner = weapons;
      } else if (index === 1) {
        items = allItems.specializations;
        winner = specializations;
      } else {
        items = allItems.gadgets;
        winner = gadgets[index - 2];
      }

      animationData.push({
        column,
        items,
        winner,
        index,
      });
    });

    return animationData;
  }

  // Run the animation
  async runAnimation(animationData) {
    // Build scroll content for each column
    animationData.forEach((data) => {
      const scrollContent = this.buildScrollContent(data.items, data.winner);
      data.column.innerHTML = scrollContent;
    });

    // Create animation promises
    const animations = animationData.map((data) =>
      this.animateColumn(data.column, data.index)
    );

    // Wait for all animations to complete
    await Promise.all(animations);
  }

  // Build scroll content with repeated items
  buildScrollContent(items, winner) {
    // Create a sequence of items for scrolling
    const sequence = [];

    // Add random items
    for (let i = 0; i < 8; i++) {
      const randomItem = items[Math.floor(Math.random() * items.length)];
      sequence.push(this.createSlotCell(randomItem));
    }

    // Add the winner in the middle
    sequence.push(this.createSlotCell(winner, true));

    // Add more random items
    for (let i = 0; i < 3; i++) {
      const randomItem = items[Math.floor(Math.random() * items.length)];
      sequence.push(this.createSlotCell(randomItem));
    }

    return sequence.join("");
  }

  // Animate individual column
  animateColumn(column, index) {
    return new Promise((resolve) => {
      const duration = 2000 + index * 300; // Stagger the stops
      const startTime = Date.now();

      // Apply blur effect
      column.parentElement.classList.add("high-speed-blur");

      // Calculate target position (winner is at index 8)
      const cellHeight = 120; // Height of each cell
      const targetPosition = -(8 * cellHeight);

      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);

        // Easing function for smooth deceleration
        const easeOut = 1 - Math.pow(1 - progress, 3);

        // Calculate current position
        const currentPosition = targetPosition * easeOut;

        // Apply transform
        column.style.transform = `translateY(${currentPosition}px)`;

        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          // Animation complete
          column.parentElement.classList.remove("high-speed-blur");
          column.parentElement.classList.add("landing-flash");

          // Play tick sound
          this.playSound("tickSound");

          resolve();
        }
      };

      requestAnimationFrame(animate);
    });
  }

  // Apply winner effects
  applyWinnerEffects() {
    this.columns.forEach((column) => {
      const winner = column.querySelector(".slot-cell.winner");
      if (winner) {
        winner.closest(".slot-item").classList.add("winner-pulsate");
      }
    });
  }

  // Sound management
  playSound(soundId) {
    const sound = document.getElementById(soundId);
    if (sound && window.state?.soundEnabled) {
      sound.currentTime = 0;
      sound.play().catch(() => {});
    }
  }

  stopSound(soundId) {
    const sound = document.getElementById(soundId);
    if (sound) {
      sound.pause();
      sound.currentTime = 0;
    }
  }

  // Add roast display
  async displayRoast(classType, weapon, spec, gadgets) {
    const roastContainer = document.createElement("div");
    roastContainer.className = "slot-machine-roast";
    roastContainer.innerHTML = `
      <div class="roast-content">
        <span class="fire-emoji">🔥</span>
        <span class="roast-text">Analyzing loadout...</span>
      </div>
    `;

    this.container.appendChild(roastContainer);

    // Simulate roast generation
    setTimeout(() => {
      const roastText = roastContainer.querySelector(".roast-text");
      const roasts = [
        `${classType} with ${weapon}? Bold choice for someone who can't aim.`,
        `This ${weapon} loadout screams "I watched one YouTube guide."`,
        `${spec} on ${classType}? Tell me you're new without telling me you're new.`,
      ];
      roastText.textContent = roasts[Math.floor(Math.random() * roasts.length)];

      // Remove after delay
      setTimeout(() => {
        roastContainer.style.opacity = "0";
        setTimeout(() => roastContainer.remove(), 500);
      }, 8000);
    }, 1000);
  }

  // Reset slot machine
  reset() {
    this.columns = [];
    this.currentLoadout = null;
    this.isAnimating = false;
    if (this.itemsContainer) {
      this.itemsContainer.innerHTML = "";
    }
    if (this.statusBar) {
      this.statusBar.querySelector("#slot-status-text").textContent = "";
    }
  }
}

// Export for use
window.SlotMachine = SlotMachine;
