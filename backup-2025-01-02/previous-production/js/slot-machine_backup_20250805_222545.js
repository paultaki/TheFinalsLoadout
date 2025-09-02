// =====================================================
// SLOT MACHINE COMPONENT - SIMPLIFIED VERSION
// =====================================================

class SlotMachine {
  // Animation timing constants (in ms)
  static TIMING = {
    FINAL_SPIN: {
      SPIN_DURATION: 2000,
      STOP_DURATION: 3000,
      STAGGER_DELAY: 800,
      FINAL_COLUMN_PAUSE: 200,
    },
    NORMAL_SPIN: {
      SPIN_DURATION: 400,
      STOP_DURATION: 600,
      STAGGER_DELAY: 200,
    },
    EFFECTS: {
      SCREEN_SHAKE: 400,
      SCREEN_FLASH: 300,
      LANDING_FLASH: 600,
      ALMOST_WON_FLASH: 600,
      PARTICLE_DURATION_MIN: 800,
      PARTICLE_DURATION_MAX: 1200,
      HAPTIC_DURATION: 100,
    },
  };

  // Animation physics constants
  static PHYSICS = {
    CELL_HEIGHT: 120,
    FINAL_SPIN_START: -900,
    NORMAL_SPIN_START: -720,
    FINAL_OVERSHOOT: 50,
    NORMAL_OVERSHOOT: 20,
    SCROLL_SPEED_FINAL: 25,
    SCROLL_SPEED_BASE: 30,
    SCROLL_SPEED_INCREMENT: 3,
    LOOP_THRESHOLD: 200,
    LOOP_RESET: 400,
    FPS_ASSUMPTION: 16, // ~60fps
  };

  // Visual constants
  static VISUAL = {
    PARTICLE_COUNT: 12,
    PARTICLE_DISTANCE_MIN: 100,
    PARTICLE_DISTANCE_MAX: 150,
    PARTICLE_SIZE: 6,
    BLUR_REMOVE_FINAL: 0.7,
    BLUR_REMOVE_FAST: 0.85,
    BLUR_REMOVE_NORMAL: 0.5,
  };

  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.statusBar = null;
    this.itemsContainer = null;
    this.columns = [];
    this.isAnimating = false;
    this.currentLoadout = null;
  }

  // =====================================================
  // INITIALIZATION & SETUP
  // =====================================================

  // Initialize the slot machine
  init() {
    if (!this.container) {
      console.error("Slot machine container not found");
      return;
    }

    // Set up the HTML structure with placeholders
    this.container.innerHTML = `
      <div class="slot-status-bar">
        <span id="slot-status-text">Ready to spin!</span>
      </div>
      <div class="slot-machine-items">
        ${this.createPlaceholderSlots()}
      </div>
    `;

    this.statusBar = this.container.querySelector(".slot-status-bar");
    this.itemsContainer = this.container.querySelector(".slot-machine-items");
  }

  // Create placeholder slots
  createPlaceholderSlots() {
    const placeholders = [
      { type: "weapon", label: "WEAPON" },
      { type: "spec", label: "SPECIALIZATION" },
      { type: "gadget-1", label: "GADGET 1" },
      { type: "gadget-2", label: "GADGET 2" },
      { type: "gadget-3", label: "GADGET 3" },
    ];

    return placeholders
      .map(
        (placeholder) => `
      <div class="slot-item" data-slot-type="${placeholder.type}">
        <div class="slot-scroll">
          <div class="slot-cell placeholder">
            <div class="placeholder-content">
              <span>?</span>
              <p>${placeholder.label}</p>
            </div>
          </div>
        </div>
      </div>
    `
      )
      .join("");
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

  // Build slot HTML - Updated for 5 slots
  buildSlots(weapon, spec, gadgets) {
    const slots = [];

    // Weapon slot
    slots.push(this.createSlot(weapon, "weapon"));

    // Specialization slot
    slots.push(this.createSlot(spec, "spec"));

    // Gadget slots (3 gadgets for 5 total slots)
    gadgets.forEach((gadget, index) => {
      slots.push(this.createSlot(gadget, `gadget-${index + 1}`));
    });

    return slots.join("");
  }

  // Create individual slot
  createSlot(item, type) {
    return `
      <div class="slot-item" data-slot-type="${type}">
        <div class="slot-scroll" style="transform: translateY(-50%); opacity: 0;">
          ${this.createSlotCell("Loading...", false)}
        </div>
      </div>
    `;
  }

  // Create slot cell with enhanced visual markers
  createSlotCell(item, isWinner = false, isNearMiss = false) {
    const classes = ["slot-cell"];
    if (isWinner) classes.push("winner");
    if (isNearMiss) classes.push("near-miss");

    // Special handling for loading state
    if (item === "Loading...") {
      return (
        '<div class="' +
        classes.join(" ") +
        ' loading-cell">' +
        '<div class="loading-spinner"></div>' +
        "<p>" +
        item +
        "</p>" +
        "</div>"
      );
    }

    const imageName = item.replace(/ /g, "_");
    
    // Add rarity indicators for psychological impact
    const rarity = this.getItemRarity(item);
    if (rarity) classes.push(`rarity-${rarity}`);

    return (
      '<div class="' +
      classes.join(" ") +
      '">' +
      '<img src="images/' +
      imageName +
      '.webp" alt="' +
      item +
      "\" loading=\"eager\" onerror=\"this.style.display='none'; this.nextElementSibling.style.fontSize='14px'; this.nextElementSibling.style.fontWeight='bold';\">" +
      "<p>" +
      item +
      "</p>" +
      "</div>"
    );
  }

  // =====================================================
  // MAIN ANIMATION CONTROL
  // =====================================================

  // Animate slot machine
  async animateSlots(loadout, onComplete) {
    if (this.isAnimating) return;

    this.isAnimating = true;
    this.currentLoadout = loadout;
    this.isFinalSpin = loadout.spinsRemaining === 0;

    // Update status
    this.updateStatus(loadout.classType, loadout.spinsRemaining);

    // Update countdown badge
    this.updateSpinCountdown(loadout.spinsRemaining);

    // Ensure we have the slot structure - if not, create placeholders
    if (
      !this.itemsContainer ||
      !this.itemsContainer.querySelector(".slot-item")
    ) {
      // Re-init if needed
      if (!this.itemsContainer) {
        this.init();
      }
      // Now display the loadout structure
      this.displayLoadout(loadout);
    }

    // Get fresh references
    this.columns = Array.from(
      this.itemsContainer.querySelectorAll(".slot-scroll")
    );

    // Clean up any lingering animation classes
    this.cleanupAnimationClasses();

    // Disable UI during spin
    this.setUIEnabled(false);

    // Add pulsing to spin button on final spin
    if (this.isFinalSpin) {
      const spinButton = document.querySelector("#spinButton, .spin-button");
      if (spinButton) {
        spinButton.classList.add("button-pulsing");
      }
    }

    // Prepare animation data
    const animationData = this.prepareAnimationData(loadout);

    // Add pre-spin effects for final spin
    if (this.isFinalSpin) {
      await this.addPreSpinEffects();
    }

    // Start spinning sound if available
    this.playSound("spinningSound");

    // Animate each column
    try {
      console.log("Starting runAnimation...");
      await this.runAnimation(animationData);
      console.log("runAnimation completed successfully");

      // Stop spinning sound
      this.stopSound("spinningSound");

      // Breathing room pause before results
      if (this.isFinalSpin) {
        await this.delay(300);
      }

      // Only play final sound if this is the last spin
      if (this.isFinalSpin) {
        console.log("Playing final sound (last spin)");
        this.playSound("finalSound");
        // Apply dramatic winner effects
        await this.applyDramaticWinnerEffects();
      } else if (loadout.spinsRemaining === 1) {
        // Play Tabby Tune only on the 2nd to last spin
        console.log("Playing Tabby Tune (2nd to last spin)");
        this.playSound("spinWinSound");
        // Apply simple winner effects
        this.applyWinnerEffects();
      } else {
        // No sound for other intermediate spins
        console.log(
          `Intermediate spin (${loadout.spinsRemaining} spins remaining) - no sound`
        );
        // Apply simple winner effects
        this.applyWinnerEffects();
      }

      console.log("Animation finished, calling onComplete callback");
      // Callback
      if (onComplete) {
        onComplete();
      }
    } catch (error) {
      console.error("Animation error:", error);
    } finally {
      this.isAnimating = false;
      this.removeSpotlightOverlay();

      // Re-enable UI
      this.setUIEnabled(true);

      // Remove button pulsing
      const spinButton = document.querySelector("#spinButton, .spin-button");
      if (spinButton) {
        spinButton.classList.remove("button-pulsing");
      }

      console.log("Animation flag reset, isAnimating = false");
    }
  }

  // Prepare animation data
  prepareAnimationData(loadout) {
    const { weapons, specializations, gadgets, allItems } = loadout;
    const animationData = [];

    // Get fresh column references from the current state
    const columns = Array.from(
      this.itemsContainer.querySelectorAll(".slot-scroll")
    );

    // Prepare each column
    columns.forEach((column, index) => {
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
    // Get the slot items (parent containers)
    const slotItems = this.itemsContainer.querySelectorAll(".slot-item");
    console.log(`Found ${slotItems.length} slot items for animation`);

    // Build scroll content for each column and preload images
    const preloadPromises = animationData.map(async (data, index) => {
      const scrollContent = this.buildScrollContent(data.items, data.winner);

      // Find the scroll container within the slot item
      const slotItem = slotItems[index];
      const scrollContainer = slotItem.querySelector(".slot-scroll");

      if (scrollContainer) {
        scrollContainer.innerHTML = scrollContent;
        // Start with strip pushed up to show random items
        const startOffset = this.isFinalSpin ? -900 : -720;
        scrollContainer.style.transform = `translateY(${startOffset}px)`;
        // Make content visible now that we have the proper animation content
        scrollContainer.style.opacity = "1";
        console.log(
          `Column ${index}: Initial transform set to ${startOffset}px`
        );
        // Store reference for animation
        data.column = scrollContainer;
        // Ensure images are loaded before starting animation
        await this.preloadImages(scrollContainer);
      } else {
        console.error(`Column ${index}: No scroll container found!`);
      }
    });

    // Wait for all images to be preloaded
    await Promise.all(preloadPromises);

    // Create staggered animations - each column keeps spinning until its turn to stop
    const animationPromises = [];

    for (let i = 0; i < animationData.length; i++) {
      const data = animationData[i];
      // Start all columns spinning immediately
      const animPromise = this.animateColumnStaggered(
        data.column,
        i,
        animationData.length
      );
      animationPromises.push(animPromise);
    }

    // Wait for all animations to complete
    await Promise.all(animationPromises);
    console.log("All column animations completed");
  }

  // Build scroll content with repeated items and near-miss setup
  buildScrollContent(items, winner) {
    // Create a sequence of items for scrolling
    const sequence = [];

    // Add winner at the TOP (it will be above viewport initially)
    sequence.push(this.createSlotCell(winner, true));

    // Strategic near-miss placement for psychological impact
    let jackpotItems = [];
    if (this.isFinalSpin && items.length > 1) {
      // Find jackpot or high-value items for near-miss effect
      jackpotItems = this.identifyJackpotItems(items);
      const nearMissItem =
        jackpotItems.find((item) => item !== winner) ||
        items.find((item) => item !== winner) ||
        items[0];
      sequence.push(this.createSlotCell(nearMissItem, false, true)); // Mark as near-miss

      // Add another near-miss slightly further down
      const secondNearMiss =
        items.find((item) => item !== winner && item !== nearMissItem) ||
        items[1];
      sequence.push(this.createSlotCell(secondNearMiss));
    }

    // Pattern-based item placement for subconscious recognition
    const patternCount = this.isFinalSpin ? 8 : 5;
    for (let i = 0; i < patternCount; i++) {
      // Create patterns of items that build anticipation
      if (i % 3 === 0 && jackpotItems.length > 0) {
        // Sprinkle jackpot items periodically
        sequence.push(
          this.createSlotCell(jackpotItems[i % jackpotItems.length])
        );
      } else {
        sequence.push(this.createSlotCell(items[i % items.length]));
      }
    }

    // Fill remaining scroll area with accelerated variety
    const scrollItemCount = this.isFinalSpin ? 40 : 25;
    const recentItems = new Set();

    for (let i = 0; i < scrollItemCount; i++) {
      // Avoid too much repetition in visible area
      let itemIndex;
      do {
        itemIndex = Math.floor(Math.random() * items.length);
      } while (
        recentItems.has(itemIndex) &&
        recentItems.size < items.length - 1
      );

      recentItems.add(itemIndex);
      if (recentItems.size > 3) {
        recentItems.delete(recentItems.values().next().value);
      }

      sequence.push(this.createSlotCell(items[itemIndex]));
    }

    return sequence.join("");
  }

  // =====================================================
  // COLUMN ANIMATION
  // =====================================================

  // Calculate position for final spin deceleration
  calculateFinalSpinPosition(
    decelProgress,
    scrollPosition,
    finalPosition,
    overshoot,
    column,
    hasFlashedAlmostWon
  ) {
    if (decelProgress < 0.75) {
      // Continue fast spinning with gradual slowdown
      const slowdownFactor = 1 - decelProgress * 0.3; // Only slow down by 30% max
      const scrollSpeed = 15 * slowdownFactor;
      scrollPosition += scrollSpeed * SlotMachine.PHYSICS.FPS_ASSUMPTION;

      // Loop position
      if (scrollPosition > 200) {
        scrollPosition = (scrollPosition % 400) - 400;
      }

      // Flash "almost won" items when slowing down
      if (decelProgress > 0.6 && !hasFlashedAlmostWon && Math.random() > 0.5) {
        this.addAlmostWonFlash(column.parentElement);
      }

      return { position: scrollPosition, scrollPosition: scrollPosition };
    } else if (decelProgress < 0.9) {
      // Rapid deceleration to overshoot
      const rapidDecelProgress = (decelProgress - 0.75) / 0.15;
      const position =
        scrollPosition +
        this.easeOutQuart(rapidDecelProgress) *
          (finalPosition + overshoot - scrollPosition);
      return { position: position };
    } else {
      // Quick bounce back
      const bounceProgress = (decelProgress - 0.9) / 0.1;
      const position =
        finalPosition +
        overshoot -
        overshoot * this.easeOutCubic(bounceProgress);
      return { position: position };
    }
  }

  // Calculate position for normal spin deceleration
  calculateNormalSpinPosition(
    decelProgress,
    startPosition,
    finalPosition,
    overshoot
  ) {
    if (decelProgress < 0.7) {
      return (
        startPosition +
        this.easeOutCubic(decelProgress / 0.7) *
          (finalPosition + overshoot - startPosition)
      );
    } else {
      const bounceProgress = (decelProgress - 0.7) / 0.3;
      return (
        finalPosition + overshoot - overshoot * this.easeOutQuad(bounceProgress)
      );
    }
  }

  // Animate column with staggered timing - all columns spin fast, then stop one by one
  animateColumnStaggered(column, index, totalColumns) {
    return new Promise((resolve) => {
      const startTime = Date.now();
      const cellHeight = SlotMachine.PHYSICS.CELL_HEIGHT;

      // Different timing for final vs non-final spins
      let spinDuration, stopDuration, staggerDelay;

      if (this.isFinalSpin) {
        // Final spin - dramatic and extended
        spinDuration = SlotMachine.TIMING.FINAL_SPIN.SPIN_DURATION;
        stopDuration = SlotMachine.TIMING.FINAL_SPIN.STOP_DURATION;
        staggerDelay = SlotMachine.TIMING.FINAL_SPIN.STAGGER_DELAY;

        // Add extra pause before final column
        if (index === totalColumns - 1) {
          spinDuration += SlotMachine.TIMING.FINAL_SPIN.FINAL_COLUMN_PAUSE;
        }
      } else {
        // Non-final spins - quick and snappy
        spinDuration = SlotMachine.TIMING.NORMAL_SPIN.SPIN_DURATION;
        stopDuration = SlotMachine.TIMING.NORMAL_SPIN.STOP_DURATION;
        staggerDelay = SlotMachine.TIMING.NORMAL_SPIN.STAGGER_DELAY;
      }

      // Calculate when this column should start decelerating
      const startDecelerationTime = spinDuration + index * staggerDelay;
      const totalDuration = startDecelerationTime + stopDuration;

      // Starting position
      const startPosition = this.isFinalSpin
        ? SlotMachine.PHYSICS.FINAL_SPIN_START
        : SlotMachine.PHYSICS.NORMAL_SPIN_START;
      const finalPosition = -(cellHeight / 2);

      // Add animation classes
      column.parentElement.classList.add(
        "animating",
        "extreme-blur",
        "speed-lines"
      );

      // Add glow trail effect for final spin
      if (this.isFinalSpin) {
        column.classList.add("glow-trail");
      }

      // Track position for continuous scrolling
      let scrollPosition = startPosition;
      let lastTime = startTime;
      let hasFlashedAlmostWon = false;

      const animate = () => {
        const currentTime = Date.now();
        const elapsed = currentTime - startTime;
        const deltaTime = currentTime - lastTime;
        lastTime = currentTime;

        const progress = Math.min(elapsed / totalDuration, 1);

        if (elapsed < startDecelerationTime) {
          // Fast spinning phase - continuous scrolling
          let baseSpeed;
          if (this.isFinalSpin) {
            baseSpeed = SlotMachine.PHYSICS.SCROLL_SPEED_FINAL;
          } else {
            // Progressive speed ramping - get faster with each spin
            const spinNumber = 4 - (this.currentLoadout?.spinsRemaining || 0);
            baseSpeed =
              SlotMachine.PHYSICS.SCROLL_SPEED_BASE +
              spinNumber * SlotMachine.PHYSICS.SCROLL_SPEED_INCREMENT;
          }
          const scrollSpeed = baseSpeed; // pixels per millisecond
          scrollPosition += scrollSpeed * deltaTime;

          // Loop the position to create endless scrolling effect
          if (scrollPosition > SlotMachine.PHYSICS.LOOP_THRESHOLD) {
            scrollPosition =
              (scrollPosition % SlotMachine.PHYSICS.LOOP_RESET) -
              SlotMachine.PHYSICS.LOOP_RESET;
          }

          column.style.transform = `translateY(${scrollPosition}px)`;
        } else {
          // Deceleration phase
          const decelProgress =
            (elapsed - startDecelerationTime) / stopDuration;

          // Adjust blur removal based on spin type
          if (this.isFinalSpin) {
            // Keep blur longer for final spin - less predictable
            if (decelProgress > SlotMachine.VISUAL.BLUR_REMOVE_FINAL) {
              column.parentElement.classList.remove("extreme-blur");
              column.parentElement.classList.add("high-speed-blur");
            }
            if (decelProgress > SlotMachine.VISUAL.BLUR_REMOVE_FAST) {
              column.parentElement.classList.remove(
                "high-speed-blur",
                "speed-lines"
              );
            }
          } else {
            // Quick blur removal for non-final spins
            if (decelProgress > SlotMachine.VISUAL.BLUR_REMOVE_NORMAL) {
              column.parentElement.classList.remove(
                "extreme-blur",
                "high-speed-blur",
                "speed-lines"
              );
            }
          }

          // Different deceleration curves for final vs non-final
          const overshoot = this.isFinalSpin
            ? SlotMachine.PHYSICS.FINAL_OVERSHOOT
            : SlotMachine.PHYSICS.NORMAL_OVERSHOOT;
          let currentPosition;

          if (this.isFinalSpin) {
            const result = this.calculateFinalSpinPosition(
              decelProgress,
              scrollPosition,
              finalPosition,
              overshoot,
              column,
              hasFlashedAlmostWon
            );
            currentPosition = result.position;
            scrollPosition = result.scrollPosition || scrollPosition;
            hasFlashedAlmostWon = hasFlashedAlmostWon || decelProgress > 0.6;
          } else {
            currentPosition = this.calculateNormalSpinPosition(
              decelProgress,
              startPosition,
              finalPosition,
              overshoot
            );
          }

          column.style.transform = `translateY(${currentPosition}px)`;

          // Add landing flash when close to final position
          const flashTiming = this.isFinalSpin ? 0.95 : 0.8;
          if (
            decelProgress > flashTiming &&
            !column.parentElement.classList.contains("landing-flash")
          ) {
            column.parentElement.classList.add("landing-flash");
            this.playSound("tickSound");
          }
        }

        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          // Complete the animation
          column.style.transform = `translateY(${finalPosition}px)`;
          column.parentElement.classList.remove("animating", "landing-flash");
          column.classList.remove("glow-trail");

          // Final column effects
          if (this.isFinalSpin && index === totalColumns - 1) {
            // Screen shake on final column landing
            this.addScreenShake();

            // Screen flash
            this.addScreenFlash();

            // Haptic feedback
            this.triggerHapticFeedback(100);
          }

          // Particle explosion on landing (final spin only)
          if (this.isFinalSpin) {
            this.createParticleExplosion(column.parentElement);

            // Winner effects
            const winner = column.querySelector(".slot-cell.winner");
            if (winner) {
              winner.closest(".slot-item").classList.add("winner-pulsate");
            }
          }

          resolve();
        }
      };

      requestAnimationFrame(animate);
    });
  }

  // Animate individual column with Vegas-style physics
  animateColumn(column, index) {
    return new Promise((resolve) => {
      // Check for near-miss potential
      const nearMissData = this.detectNearMiss(column, index);

      // Different timing for final vs non-final spins
      let duration, staggerDelay;

      if (this.isFinalSpin) {
        // Final spin: Extended duration with dramatic stagger
        duration = 3000 + index * 700; // 3s base + 0.7s stagger
        staggerDelay = index * 250; // Start delay for each column

        // Extra time for near-miss on final column
        if (index === this.columns.length - 1 && nearMissData.isNearMiss) {
          duration += 2000; // Add 2 seconds for maximum tension
        }
      } else {
        // Non-final spins: Variable speed for excitement
        const speedVariation = Math.random() * 0.3; // 0-30% variation
        duration = 1200 + 300 * speedVariation + index * 100; // 1.2-1.5s with slight stagger
        staggerDelay = index * 50; // Subtle stagger for cascade effect
      }

      // Store near-miss data for animation
      column.nearMissData = nearMissData;

      // Add start delay
      setTimeout(() => {
        this.startColumnAnimation(column, index, duration, resolve);
      }, staggerDelay);
    });
  }

  // Start the actual column animation
  startColumnAnimation(column, index, duration, resolve) {
    const startTime = Date.now();
    const cellHeight = 120;
    const nearMissData = column.nearMissData || {};

    // Failsafe timeout
    const timeoutId = setTimeout(() => {
      console.log(`Column ${index}: Animation timeout - forcing completion`);
      resolve();
    }, duration + 2000);

    // Apply initial effects with speed lines
    column.parentElement.classList.add("high-speed-blur");
    if (this.isFinalSpin || Math.random() > 0.7) {
      column.parentElement.classList.add("extreme-blur");
      column.parentElement.classList.add("speed-lines");
    }

    // Add acceleration sound effect
    if (index === 0) {
      this.playAccelerationSound();
    }

    // Starting position with more content for longer spin - account for centered positioning
    const startPosition = this.isFinalSpin
      ? -1200 - cellHeight / 2
      : -900 - cellHeight / 2;
    const finalPosition = -(cellHeight / 2); // -50% of cell height for centering
    const overshootAmount = this.isFinalSpin ? 80 : 30;

    // Debug log
    console.log(
      `Column ${index}: Starting animation from ${startPosition} to ${finalPosition}`
    );

    // Track velocity and acceleration for realistic physics
    let lastPosition = startPosition;
    let velocity = 0;
    let lastVelocity = 0;
    let acceleration = 0;

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const rawProgress = Math.min(elapsed / duration, 1);

      let currentPosition;

      if (this.isFinalSpin && index === this.columns.length - 1) {
        // Special easing for final column with near-miss awareness
        currentPosition = this.animateFinalColumnWithNearMiss(
          rawProgress,
          startPosition,
          finalPosition,
          overshootAmount,
          nearMissData
        );
      } else if (nearMissData.isNearMiss && rawProgress > 0.7) {
        // Near-miss slowdown for non-final columns
        currentPosition = this.animateNearMissColumn(
          rawProgress,
          startPosition,
          finalPosition,
          overshootAmount,
          index
        );
      } else {
        // Enhanced Vegas-style easing with variable acceleration
        currentPosition = this.animateVegasStyle(
          rawProgress,
          startPosition,
          finalPosition,
          overshootAmount,
          index
        );
      }

      // Calculate velocity and acceleration for realistic physics
      velocity = Math.abs(currentPosition - lastPosition);
      acceleration = velocity - lastVelocity;
      lastVelocity = velocity;
      lastPosition = currentPosition;

      // Update blur and effects based on velocity and acceleration
      this.updateBlurEffect(column, velocity, rawProgress);
      this.updateAccelerationEffects(
        column,
        acceleration,
        velocity,
        rawProgress
      );

      // Add subtle vibration on near-miss moments
      if (nearMissData.isNearMiss && rawProgress > 0.7 && rawProgress < 0.9) {
        const vibration = Math.sin(rawProgress * Math.PI * 50) * 0.5;
        column.style.transform = `translateY(${currentPosition + vibration}px)`;
      } else {
        column.style.transform = `translateY(${currentPosition}px)`;
      }

      if (rawProgress < 1) {
        requestAnimationFrame(animate);
      } else {
        // Animation complete
        this.completeColumnAnimation(
          column,
          index,
          finalPosition,
          timeoutId,
          resolve
        );
      }
    };

    requestAnimationFrame(animate);
  }

  // Enhanced Vegas-style animation with variable acceleration
  animateVegasStyle(progress, start, end, overshoot, columnIndex) {
    // Multi-phase animation with varying speeds
    if (progress < 0.15) {
      // Acceleration phase - start slow, build up speed
      const accelProgress = progress / 0.15;
      const easing = Math.pow(accelProgress, 2); // Quadratic acceleration
      return start + (end - start) * 0.1 * easing;
    } else if (progress < 0.4) {
      // Peak velocity phase - maximum speed
      const peakProgress = (progress - 0.15) / 0.25;
      const startPos = start + (end - start) * 0.1;
      const targetPos = start + (end - start) * 0.6;
      return startPos + (targetPos - startPos) * peakProgress;
    } else if (progress < 0.75) {
      // Deceleration phase with momentum
      const decelProgress = (progress - 0.4) / 0.35;
      const easing = this.easeOutQuart(decelProgress);
      const startPos = start + (end - start) * 0.6;
      const targetPos = end - overshoot * 1.5;
      return startPos + (targetPos - startPos) * easing;
    } else if (progress < 0.9) {
      // Approach phase - slow crawl
      const approachProgress = (progress - 0.75) / 0.15;
      const startPos = end - overshoot * 1.5;
      const targetPos = end - overshoot;
      // Add subtle oscillation
      const oscillation = Math.sin(approachProgress * Math.PI * 3) * 2;
      return (
        startPos +
        (targetPos - startPos) * this.easeOutQuad(approachProgress) +
        oscillation
      );
    } else {
      // Final bounce with elastic settling
      const bounceProgress = (progress - 0.9) / 0.1;
      return end - overshoot + overshoot * this.elasticOut(bounceProgress);
    }
  }

  // Animate near-miss column with tension building
  animateNearMissColumn(progress, start, end, overshoot, columnIndex) {
    if (progress < 0.7) {
      // Normal spin until near-miss point
      return this.animateVegasStyle(
        progress / 0.7,
        start,
        end,
        overshoot,
        columnIndex
      );
    } else {
      // Near-miss slowdown
      const nearMissProgress = (progress - 0.7) / 0.3;
      const startPos = this.animateVegasStyle(
        1,
        start,
        end,
        overshoot,
        columnIndex
      );

      // Dramatic slowdown with micro-movements
      if (nearMissProgress < 0.5) {
        // Crawling phase
        const crawlDistance = overshoot * 0.3;
        const crawlProgress = nearMissProgress / 0.5;
        // Add jitter for tension
        const jitter = Math.sin(crawlProgress * Math.PI * 10) * 1;
        return (
          startPos + crawlDistance * this.easeOutQuart(crawlProgress) + jitter
        );
      } else {
        // Final push past near-miss
        const pushProgress = (nearMissProgress - 0.5) / 0.5;
        const pushStart = startPos + overshoot * 0.3;
        return pushStart + overshoot * 0.7 * this.easeOutCubic(pushProgress);
      }
    }
  }

  // Special animation for final column with near-miss awareness
  animateFinalColumnWithNearMiss(
    progress,
    start,
    end,
    overshoot,
    nearMissData
  ) {
    const isNearMiss = nearMissData.isNearMiss;

    if (!isNearMiss) {
      // Regular final column animation
      return this.animateFinalColumn(progress, start, end, overshoot);
    }

    // Enhanced near-miss animation for maximum tension
    if (progress < 0.6) {
      // Initial spin with deceleration
      const easing = this.easeOutQuart(progress / 0.6);
      return start + (end - overshoot * 3 - start) * easing;
    } else if (progress < 0.75) {
      // First false stop at near-miss position
      const pauseProgress = (progress - 0.6) / 0.15;
      const nearMissPosition =
        end - overshoot * 3 + (nearMissData.offset || 60);

      if (pauseProgress < 0.4) {
        // Hold at near-miss
        return nearMissPosition;
      } else {
        // Micro bounce
        const bounceAmount = 5 * Math.sin((pauseProgress - 0.4) * Math.PI * 4);
        return nearMissPosition + bounceAmount;
      }
    } else if (progress < 0.88) {
      // Struggle phase - trying to reach winner
      const struggleProgress = (progress - 0.75) / 0.13;
      const startPos = end - overshoot * 3 + (nearMissData.offset || 60);
      const targetPos = end - overshoot;

      // Stuttery movement with resistance
      const stutter = Math.sin(struggleProgress * Math.PI * 12) * 3;
      const resistance = Math.sin(struggleProgress * Math.PI) * -5;
      return (
        startPos +
        (targetPos - startPos) * this.easeInOutQuad(struggleProgress) +
        stutter +
        resistance
      );
    } else if (progress < 0.95) {
      // Final push with momentum
      const pushProgress = (progress - 0.88) / 0.07;
      const pushStart = end - overshoot;
      return pushStart + overshoot * 0.8 * this.easeOutQuad(pushProgress);
    } else {
      // Victory bounce
      const victoryProgress = (progress - 0.95) / 0.05;
      return (
        end +
        overshoot *
          0.2 *
          Math.sin(victoryProgress * Math.PI) *
          (1 - victoryProgress)
      );
    }
  }

  // Original final column animation (fallback)
  animateFinalColumn(progress, start, end, overshoot) {
    if (progress < 0.7) {
      // Fast deceleration phase
      const easing = this.easeOutQuad(progress / 0.7);
      return start + (end - overshoot * 2 - start) * easing;
    } else if (progress < 0.85) {
      // First false stop - brief pause
      const pauseProgress = (progress - 0.7) / 0.15;
      const pausePosition = end - overshoot * 2;

      if (pauseProgress < 0.3) {
        // Hold position
        return pausePosition;
      } else {
        // Resume with burst
        const resumeEasing = this.easeInOutQuad((pauseProgress - 0.3) / 0.7);
        return pausePosition + overshoot * resumeEasing;
      }
    } else if (progress < 0.95) {
      // Vegas tease - stuttery movement
      const teaseProgress = (progress - 0.85) / 0.1;
      const teasePosition = end - overshoot;

      // Add micro-movements
      const stutter = Math.sin(teaseProgress * Math.PI * 8) * 2;
      return teasePosition + overshoot * teaseProgress + stutter;
    } else {
      // Final settle with micro-bounce
      const settleProgress = (progress - 0.95) / 0.05;
      const bounceAmount = overshoot * 0.1 * (1 - settleProgress);
      return end + Math.sin(settleProgress * Math.PI) * bounceAmount;
    }
  }

  // Complete column animation
  completeColumnAnimation(column, index, finalPosition, timeoutId, resolve) {
    // Ensure final position - account for centered positioning
    column.style.transform = `translateY(-50%)`;

    // Remove ALL animation classes
    const slotItem = column.parentElement;
    slotItem.classList.remove(
      "high-speed-blur",
      "extreme-blur",
      "landing-flash"
    );

    // Add landing effects
    if (this.isFinalSpin) {
      this.addLandingEffects(column, index);
    } else {
      slotItem.classList.add("landing-flash");
      this.playSound("tickSound");
      // Remove landing flash after animation completes
      setTimeout(() => {
        slotItem.classList.remove("landing-flash");
      }, 600);
    }

    // Clear timeout and resolve
    clearTimeout(timeoutId);
    resolve();
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

  // Apply dramatic winner effects for final spin
  async applyDramaticWinnerEffects() {
    // Play celebration sound right when animation starts
    // Commented out to avoid duplicate with app.js celebration sound
    // console.log('Playing celebration sound (pop-pour-perform)');
    // this.playSound("celebrationSound");

    // First apply basic effects
    this.applyWinnerEffects();

    // Add dopamine-triggering sequences
    await this.triggerDopamineRush();

    // Then add celebration wave
    await this.celebrationWave();
  }

  // Trigger dopamine rush with cascading effects
  async triggerDopamineRush() {
    // Flash all slots in sequence
    for (let i = 0; i < this.columns.length; i++) {
      const column = this.columns[i];
      const slotItem = column.closest(".slot-item");

      // Brightness pulse
      slotItem.animate(
        [
          { filter: "brightness(1)", transform: "scale(1)" },
          { filter: "brightness(2)", transform: "scale(1.1)" },
          { filter: "brightness(1.5)", transform: "scale(1.05)" },
          { filter: "brightness(1)", transform: "scale(1)" },
        ],
        {
          duration: 300,
          easing: "ease-out",
        }
      );

      // Coin sound effect
      this.playSound("tickSound");
      await this.delay(50);
    }

    // Big win flash
    const bigWinFlash = document.createElement("div");
    bigWinFlash.className = "big-win-flash";
    this.container.appendChild(bigWinFlash);

    bigWinFlash.animate(
      [
        { opacity: 0, transform: "scale(0.8)" },
        { opacity: 1, transform: "scale(1.2)" },
        { opacity: 0, transform: "scale(1.4)" },
      ],
      {
        duration: 800,
        easing: "ease-out",
      }
    );

    setTimeout(() => bigWinFlash.remove(), 800);
  }

  // Celebration wave animation
  async celebrationWave() {
    // Restore UI brightness
    document.querySelectorAll(".ui-element").forEach((el) => {
      el.style.opacity = "1";
      el.style.filter = "brightness(1)";
    });

    // Wave animation left to right
    for (let i = 0; i < this.columns.length; i++) {
      const column = this.columns[i];
      const slotItem = column.closest(".slot-item");

      // Pulse animation
      slotItem.animate(
        [
          { transform: "scale(1)", boxShadow: "0 0 20px rgba(255,215,0,0.4)" },
          { transform: "scale(1.2)", boxShadow: "0 0 60px rgba(255,215,0,1)" },
          { transform: "scale(1)", boxShadow: "0 0 30px rgba(255,215,0,0.6)" },
        ],
        {
          duration: 400,
          easing: "ease-out",
        }
      );

      // Haptic pulse if available
      if (navigator.vibrate) {
        navigator.vibrate(50);
      }

      // Stagger the wave
      await this.delay(100);
    }
  }

  // Sound management
  playSound(soundId) {
    const sound = document.getElementById(soundId);
    if (sound && window.state?.soundEnabled) {
      // Use safePlay if available, otherwise fall back to direct play
      if (window.safePlay) {
        window.safePlay(sound);
      } else {
        sound.currentTime = 0;
        sound.play().catch(() => {});
      }
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

  // Preload images to prevent blank spots
  preloadImages(column) {
    const images = column.querySelectorAll("img");
    const imagePromises = [];

    images.forEach((img) => {
      if (img.complete) return;

      // Create a promise for image loading
      const imagePromise = new Promise((resolve) => {
        img.onload = resolve;
        img.onerror = resolve; // Resolve even on error to prevent hanging

        // Fallback: resolve after 500ms regardless
        setTimeout(resolve, 500);
      });

      imagePromises.push(imagePromise);
    });

    // Return promise that resolves when all images are loaded
    return Promise.all(imagePromises);
  }

  // Reset slot machine
  reset() {
    this.columns = [];
    this.currentLoadout = null;
    this.isAnimating = false;
    this.isFinalSpin = false;
    if (this.itemsContainer) {
      this.itemsContainer.innerHTML = "";
    }
    if (this.statusBar) {
      this.statusBar.querySelector("#slot-status-text").textContent = "";
    }
  }

  // =====================================================
  // EASING FUNCTIONS
  // =====================================================

  easeOutCubic(t) {
    return 1 - Math.pow(1 - t, 3);
  }

  easeOutQuad(t) {
    return t * (2 - t);
  }

  easeOutQuart(t) {
    return 1 - Math.pow(1 - t, 4);
  }

  easeInOutQuad(t) {
    return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
  }

  elasticOut(t) {
    const p = 0.3;
    return (
      Math.pow(2, -10 * t) * Math.sin(((t - p / 4) * (2 * Math.PI)) / p) + 1
    );
  }

  // =====================================================
  // HELPER FUNCTIONS
  // =====================================================

  delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  // Detect near-miss situations for tension building
  detectNearMiss(column, columnIndex) {
    // Only check for near-miss on later columns and random chance
    if (columnIndex < 2 || Math.random() > 0.4) {
      return { isNearMiss: false };
    }

    // Check if previous columns have matching items (building a pattern)
    const previousWinners = [];
    for (let i = 0; i < columnIndex; i++) {
      const prevColumn = this.columns[i];
      const winner = prevColumn.querySelector(".winner");
      if (winner) {
        previousWinners.push(winner.querySelector("p").textContent);
      }
    }

    // Detect patterns or high-value combinations
    const hasPattern =
      previousWinners.length > 1 &&
      new Set(previousWinners).size < previousWinners.length; // Repeated items

    // Higher chance of near-miss on final column if pattern exists
    const nearMissChance = hasPattern ? 0.7 : 0.3;
    const isNearMiss = this.isFinalSpin && Math.random() < nearMissChance;

    return {
      isNearMiss,
      offset: isNearMiss ? 60 + Math.random() * 30 : 0, // How far off the near-miss is
      pattern: hasPattern,
    };
  }

  // Identify high-value/jackpot items for near-miss placement
  identifyJackpotItems(items) {
    // Define jackpot items based on game knowledge
    const jackpotKeywords = [
      "FCAR",
      "AKM",
      "FAMAS",
      "V9S",
      "Healing Beam",
      "Recon Senses",
      "Mesh Shield",
    ];
    return items.filter((item) =>
      jackpotKeywords.some((keyword) =>
        item.toUpperCase().includes(keyword.toUpperCase())
      )
    );
  }

  // Get item rarity for visual enhancement
  getItemRarity(item) {
    const itemUpper = item.toUpperCase();
    if (["FCAR", "AKM", "FAMAS", "V9S"].some((w) => itemUpper.includes(w)))
      return "legendary";
    if (["Healing Beam", "Recon Senses"].some((w) => itemUpper.includes(w)))
      return "epic";
    if (["Mesh Shield", "Dome Shield"].some((w) => itemUpper.includes(w)))
      return "rare";
    return null;
  }

  // =====================================================
  // VISUAL EFFECTS
  // =====================================================

  // Add screen shake effect
  addScreenShake() {
    document.body.classList.add("screen-shake");
    setTimeout(() => {
      document.body.classList.remove("screen-shake");
    }, SlotMachine.TIMING.EFFECTS.SCREEN_SHAKE);
  }

  // Add screen flash effect
  addScreenFlash() {
    const flash = document.createElement("div");
    flash.className = "screen-flash";
    document.body.appendChild(flash);

    setTimeout(() => {
      flash.remove();
    }, SlotMachine.TIMING.EFFECTS.SCREEN_FLASH);
  }

  // Trigger haptic feedback
  triggerHapticFeedback(duration = SlotMachine.TIMING.EFFECTS.HAPTIC_DURATION) {
    if ("vibrate" in navigator) {
      navigator.vibrate(duration);
    }
  }

  // Create particle explosion effect
  createParticleExplosion(element) {
    const rect = element.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    // Create multiple particles
    for (let i = 0; i < SlotMachine.VISUAL.PARTICLE_COUNT; i++) {
      const particle = document.createElement("div");
      particle.className = "slot-particle";

      // Random angle and distance
      const angle =
        (Math.PI * 2 * i) / SlotMachine.VISUAL.PARTICLE_COUNT +
        (Math.random() - 0.5) * 0.5;
      const distance =
        SlotMachine.VISUAL.PARTICLE_DISTANCE_MIN +
        Math.random() *
          (SlotMachine.VISUAL.PARTICLE_DISTANCE_MAX -
            SlotMachine.VISUAL.PARTICLE_DISTANCE_MIN);
      const duration =
        SlotMachine.TIMING.EFFECTS.PARTICLE_DURATION_MIN +
        Math.random() *
          (SlotMachine.TIMING.EFFECTS.PARTICLE_DURATION_MAX -
            SlotMachine.TIMING.EFFECTS.PARTICLE_DURATION_MIN);

      // Set custom properties for animation
      particle.style.setProperty("--tx", `${Math.cos(angle) * distance}px`);
      particle.style.setProperty("--ty", `${Math.sin(angle) * distance}px`);
      particle.style.setProperty("--duration", `${duration}ms`);
      particle.style.setProperty("--rotation", `${Math.random() * 720}deg`);

      // Position at center of element
      particle.style.left = `${centerX}px`;
      particle.style.top = `${centerY}px`;

      document.body.appendChild(particle);

      // Remove after animation
      setTimeout(() => particle.remove(), duration);
    }
  }

  // Add almost-won flash effect
  addAlmostWonFlash(column) {
    const flash = document.createElement("div");
    flash.className = "almost-won-flash";
    column.appendChild(flash);

    setTimeout(
      () => flash.remove(),
      SlotMachine.TIMING.EFFECTS.ALMOST_WON_FLASH
    );
  }

  // Enable/disable UI during spin
  setUIEnabled(enabled) {
    let overlay = document.querySelector(".ui-disabled-overlay");

    if (!enabled) {
      if (!overlay) {
        overlay = document.createElement("div");
        overlay.className = "ui-disabled-overlay";
        document.body.appendChild(overlay);
      }

      // Force reflow then add active class for transition
      overlay.offsetHeight;
      overlay.classList.add("active");

      // Disable all buttons except current action
      document.querySelectorAll("button:not(.spinning)").forEach((btn) => {
        btn.disabled = true;
        btn.style.opacity = "0.5";
      });
    } else {
      if (overlay) {
        overlay.classList.remove("active");
        setTimeout(() => overlay.remove(), 300);
      }

      // Re-enable buttons
      document.querySelectorAll("button").forEach((btn) => {
        btn.disabled = false;
        btn.style.opacity = "1";
      });
    }
  }

  // Add countdown badge to spin button
  updateSpinCountdown(count) {
    const spinButton = document.querySelector("#spinButton, .spin-button");
    if (!spinButton) return;

    let badge = spinButton.querySelector(".spin-countdown");

    if (count > 0) {
      if (!badge) {
        badge = document.createElement("div");
        badge.className = "spin-countdown";
        spinButton.style.position = "relative";
        spinButton.appendChild(badge);
      }
      badge.textContent = count;
      badge.style.animation = "none";
      badge.offsetHeight; // Force reflow
      badge.style.animation = "countdownPulse 0.6s ease-out";
    } else if (badge) {
      badge.remove();
    }
  }

  // =====================================================
  // SOUND & UTILITY METHODS
  // =====================================================

  // Play acceleration sound effect
  playAccelerationSound() {
    // Create dynamic acceleration sound using Web Audio API if available
    if (window.AudioContext && window.state?.soundEnabled) {
      try {
        const audioContext = new (window.AudioContext ||
          window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        // Rising pitch for acceleration
        oscillator.frequency.setValueAtTime(100, audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(
          800,
          audioContext.currentTime + 0.5
        );

        // Volume envelope
        gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(
          0.01,
          audioContext.currentTime + 0.5
        );

        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.5);
      } catch (e) {
        // Fallback to regular sound
        this.playSound("spinningSound");
      }
    }
  }

  // Update blur effect based on velocity
  updateBlurEffect(column, velocity, progress) {
    const slotItem = column.parentElement;
    const blurThreshold = this.isFinalSpin ? 5 : 10;

    if (velocity > blurThreshold && progress < 0.8) {
      slotItem.classList.add("extreme-blur");
      slotItem.classList.remove("high-speed-blur");
    } else if (velocity > blurThreshold / 2 && progress < 0.9) {
      slotItem.classList.remove("extreme-blur");
      slotItem.classList.add("high-speed-blur");
    } else {
      // Remove all blur as we approach the end
      slotItem.classList.remove(
        "high-speed-blur",
        "extreme-blur",
        "speed-lines"
      );
    }
  }

  // Update acceleration-based effects
  updateAccelerationEffects(column, acceleration, velocity, progress) {
    const slotItem = column.parentElement;

    // Add/remove speed lines based on acceleration
    if (acceleration > 2 && velocity > 10) {
      slotItem.classList.add("speed-lines");
    } else if (acceleration < -2 || velocity < 5) {
      slotItem.classList.remove("speed-lines");
    }

    // Dynamic blur intensity
    if (velocity > 0) {
      const blurAmount = Math.min(velocity * 0.3, 12);
      column.style.filter = `blur(${blurAmount}px)`;
    } else {
      column.style.filter = "";
    }
  }

  // Add landing effects for final spin
  addLandingEffects(column, index) {
    const slotItem = column.parentElement;
    const nearMissData = column.nearMissData || {};

    // Enhanced effects for near-miss situations
    if (nearMissData.isNearMiss && index === this.columns.length - 1) {
      this.addNearMissEffects(slotItem);
    }

    // Screen shake on final column
    if (index === this.columns.length - 1) {
      this.addScreenShake(nearMissData.isNearMiss ? "intense" : "normal");
    }

    // Flash effect with color variation
    slotItem.classList.add("landing-flash");
    if (nearMissData.isNearMiss) {
      slotItem.classList.add("near-miss-flash");
    }

    // Remove flash after animation
    setTimeout(() => {
      slotItem.classList.remove("landing-flash", "near-miss-flash");
    }, 600);

    // Particle explosion with more particles for dramatic moments
    this.createParticleExplosion(slotItem, nearMissData.isNearMiss ? 20 : 12);

    // Enhanced sound progression
    if (index < this.columns.length - 1) {
      // Regular columns with building intensity
      const intensity = Math.min(index + 1, 3);
      for (let i = 0; i < intensity; i++) {
        setTimeout(() => this.playSound("tickSound"), i * 80);
      }
      setTimeout(() => this.playSound("columnStop"), intensity * 80 + 100);
    } else {
      // Final column - maximum drama
      if (nearMissData.isNearMiss) {
        // Near-miss sound sequence
        setTimeout(() => {
          this.playSound("tickSound");
          if (navigator.vibrate) navigator.vibrate(50);
        }, 300);
        setTimeout(() => {
          this.playSound("tickSound");
          if (navigator.vibrate) navigator.vibrate([0, 50, 50, 50]);
        }, 600);
        setTimeout(() => {
          this.playSound("tickSound");
        }, 900);
        setTimeout(() => {
          this.playSound("finalLock");
          // Extended haptic pattern for near-miss resolution
          if (navigator.vibrate) {
            navigator.vibrate([0, 100, 50, 100, 50, 200, 100, 300]);
          }
        }, 1200);
      } else {
        // Regular final column sounds
        setTimeout(() => this.playSound("tickSound"), 500);
        setTimeout(() => this.playSound("tickSound"), 700);
        setTimeout(() => {
          this.playSound("finalLock");
          if (navigator.vibrate) {
            navigator.vibrate([0, 100, 50, 100, 50, 200]);
          }
        }, 1000);
      }
    }
  }

  // Add near-miss specific effects
  addNearMissEffects(slotItem) {
    // Create tension overlay
    const tensionOverlay = document.createElement("div");
    tensionOverlay.className = "near-miss-tension";
    slotItem.appendChild(tensionOverlay);

    // Pulse animation
    tensionOverlay.animate(
      [
        {
          opacity: 0,
          background:
            "radial-gradient(circle, rgba(255,0,0,0.3) 0%, transparent 70%)",
        },
        {
          opacity: 1,
          background:
            "radial-gradient(circle, rgba(255,0,0,0.5) 0%, transparent 60%)",
        },
        {
          opacity: 0,
          background:
            "radial-gradient(circle, rgba(255,215,0,0.3) 0%, transparent 70%)",
        },
      ],
      {
        duration: 1500,
        easing: "ease-out",
      }
    );

    setTimeout(() => tensionOverlay.remove(), 1500);
  }

  // Add screen shake effect with intensity levels
  addScreenShake(intensity = "normal") {
    const shakeFrames =
      intensity === "intense"
        ? [
            { transform: "translate(0, 0)" },
            { transform: "translate(-4px, 4px)" },
            { transform: "translate(4px, -4px)" },
            { transform: "translate(-3px, 3px)" },
            { transform: "translate(3px, -3px)" },
            { transform: "translate(-2px, 2px)" },
            { transform: "translate(2px, -2px)" },
            { transform: "translate(-1px, 1px)" },
            { transform: "translate(0, 0)" },
          ]
        : [
            { transform: "translate(0, 0)" },
            { transform: "translate(-2px, 2px)" },
            { transform: "translate(2px, -2px)" },
            { transform: "translate(-1px, 1px)" },
            { transform: "translate(1px, -1px)" },
            { transform: "translate(0, 0)" },
          ];

    document.body.animate(shakeFrames, {
      duration: intensity === "intense" ? 400 : 200,
      iterations: intensity === "intense" ? 2 : 1,
    });
  }

  // Create particle explosion effect
  createParticleExplosion(element, particleCount = 12) {
    const rect = element.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    for (let i = 0; i < particleCount; i++) {
      const particle = document.createElement("div");
      particle.className = "slot-particle";

      // Vary particle colors for more visual interest
      const colors = ["#FFD700", "#FFA500", "#FF6347", "#FFD700", "#FFFF00"];
      particle.style.backgroundColor = colors[i % colors.length];

      particle.style.left = centerX + "px";
      particle.style.top = centerY + "px";

      const angle = (i / particleCount) * Math.PI * 2;
      const distance = 50 + Math.random() * 70;
      const duration = 600 + Math.random() * 600;

      particle.style.setProperty("--tx", Math.cos(angle) * distance + "px");
      particle.style.setProperty("--ty", Math.sin(angle) * distance + "px");
      particle.style.setProperty("--duration", duration + "ms");

      // Add rotation for sparkle effect
      particle.style.setProperty("--rotation", Math.random() * 360 + "deg");

      document.body.appendChild(particle);

      // Remove particle after animation
      setTimeout(() => particle.remove(), duration);
    }
  }

  // Add pre-spin effects for final spin
  async addPreSpinEffects() {
    // Dim other UI elements
    document
      .querySelectorAll(".ui-element:not(.slot-machine-component)")
      .forEach((el) => {
        el.style.transition = "all 0.3s ease";
        el.style.opacity = "0.6";
        el.style.filter = "brightness(0.7)";
      });

    // Create spotlight overlay
    this.createSpotlightOverlay();

    // Short pause for anticipation
    await this.delay(200);
  }

  // Create spotlight overlay
  createSpotlightOverlay() {
    const overlay = document.createElement("div");
    overlay.className = "spotlight-overlay";
    overlay.id = "slotSpotlight";
    document.body.appendChild(overlay);

    // Move spotlight to slot machine
    const slotRect = this.container.getBoundingClientRect();
    const x = slotRect.left + slotRect.width / 2;
    const y = slotRect.top + slotRect.height / 2;

    overlay.style.setProperty("--spotlight-x", `${x}px`);
    overlay.style.setProperty("--spotlight-y", `${y}px`);
  }

  // Remove spotlight overlay
  removeSpotlightOverlay() {
    const overlay = document.getElementById("slotSpotlight");
    if (overlay) {
      overlay.style.opacity = "0";
      setTimeout(() => overlay.remove(), 300);
    }
  }

  // Cleanup animation classes from all slots
  cleanupAnimationClasses() {
    const slotItems = this.itemsContainer.querySelectorAll(".slot-item");
    slotItems.forEach((item) => {
      item.classList.remove(
        "landing-flash",
        "high-speed-blur",
        "extreme-blur",
        "winner-pulsate",
        "winner-dramatic"
      );
      // Remove any inline styles that might interfere
      const scrollContainer = item.querySelector(".slot-scroll");
      if (scrollContainer) {
        scrollContainer.style.filter = "";
      }
    });
  }
}

// Export for use
window.SlotMachine = SlotMachine;
