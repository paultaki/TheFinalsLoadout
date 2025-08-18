/**
 * SIMPLE WORKING SLOT MACHINE ANIMATION
 * This replaces the overcomplicated animation-engine-v2.js
 */

class SimpleSpinAnimation {
  constructor() {
    this.isSpinning = false;
    this.spinSpeed = 50; // ms between position updates
    this.spinDuration = 1500; // ms minimum spin time
    this.reelStopDelay = 300; // ms between each reel stopping
  }

  /**
   * Main spin function - handles full animation sequence
   */
  async spin(columns, finalPositions, spinCount = 1, currentSpin = 1) {
    console.log('🎮 SimpleSpinAnimation.spin called with:', {
      columnsLength: columns?.length,
      finalPositions,
      spinCount,
      currentSpin
    });
    
    if (this.isSpinning) {
      console.warn('Already spinning!');
      return;
    }

    this.isSpinning = true;
    console.log(`🎰 Starting spin ${currentSpin} of ${spinCount}`);

    try {
      // Get all item containers
      const containers = this.getContainers(columns);
      console.log(`📦 Found ${containers.length} containers`);
      if (!containers.length) {
        console.error('No containers found!');
        return;
      }

      // PHASE 1: Start spinning animation (rapid cycling)
      console.log('1. Starting spin animation');
      await this.startSpinning(containers);

      // PHASE 2: Let them spin for minimum duration (build suspense)
      console.log('2. Reels spinning for suspense...');
      await this.delay(this.spinDuration);

      // PHASE 3: Stop each reel sequentially
      if (currentSpin === spinCount) {
        // Final spin - stop at specific positions
        console.log('3. Stopping reels at final positions...');
        await this.stopReelsAtPositions(containers, finalPositions);
      } else {
        // Intermediate spin - stop at random positions
        console.log('3. Stopping reels at random positions...');
        await this.stopReelsRandomly(containers);
      }

      console.log('✅ Spin complete!');
    } finally {
      this.isSpinning = false;
    }
  }

  /**
   * Get item containers from columns
   */
  getContainers(columns) {
    const containers = [];
    columns.forEach(col => {
      const itemsContainer = col.querySelector('.slot-items');
      if (itemsContainer) {
        containers.push(itemsContainer);
      }
    });
    return containers;
  }

  /**
   * Start all reels spinning with rapid position changes
   */
  async startSpinning(containers) {
    containers.forEach((container, index) => {
      // Debug: Log initial state
      const currentTransform = container.style.transform;
      console.log(`🔍 Container ${index} initial transform: ${currentTransform || 'none'}`);
      console.log(`🔍 Container ${index} has ${container.children.length} children`);
      
      // Add spinning class for CSS animation if desired
      container.classList.add('spinning');
      
      // Start rapid position cycling
      this.cycleReel(container);
    });
  }

  /**
   * Rapidly cycle through positions to create spin effect
   */
  cycleReel(container) {
    // Start from current position or a safe starting point
    const currentTransform = container.style.transform;
    let position = 0;
    if (currentTransform) {
      const match = currentTransform.match(/translate3d\([^,]+,\s*(-?\d+(?:\.\d+)?)px/);
      if (match) {
        position = parseFloat(match[1]);
      }
    }
    const itemHeight = 80;
    const totalItems = container.children.length;
    const cycleHeight = totalItems * itemHeight;
    
    console.log(`🎰 Starting cycleReel: position=${position}, totalItems=${totalItems}, cycleHeight=${cycleHeight}`);
    
    // CRITICAL: If position is stuck at 0, force it to start spinning
    if (position === 0 && totalItems > 0) {
      position = -itemHeight; // Start with a small negative to trigger movement
      console.log(`⚠️ Position was 0, forcing to ${position} to start spin`);
    }

    let iterationCount = 0;
    // Store interval ID on container so we can stop it later
    container.spinInterval = setInterval(() => {
      iterationCount++;
      // Move container UP (negative Y) to show items below (creates downward scroll effect)
      position -= itemHeight * 2; // Negative moves container up, showing lower items
      
      // Wrap around when we've scrolled past all items
      if (position <= -cycleHeight) {
        position = position + cycleHeight; // Reset to continue seamless scroll
      }

      // Apply transform with GPU acceleration
      container.style.transform = `translate3d(0, ${position}px, 0)`;
      container.style.transition = 'none'; // No transition during spin
      
      // Debug first few iterations
      if (iterationCount <= 3) {
        console.log(`🔄 Iteration ${iterationCount}: position=${position}px, transform=${container.style.transform}`);
      }
      
      // Force browser to render
      container.offsetHeight;
    }, this.spinSpeed);
  }

  /**
   * Stop reels at specific final positions
   */
  async stopReelsAtPositions(containers, finalPositions) {
    console.log(`🛑 Stopping reels at positions:`, finalPositions);
    
    for (let i = 0; i < containers.length; i++) {
      const container = containers[i];
      
      // Get current position before stopping
      const currentTransform = container.style.transform;
      console.log(`📍 Reel ${i} current transform before stop: ${currentTransform}`);
      
      // Stop the spinning interval
      if (container.spinInterval) {
        clearInterval(container.spinInterval);
        delete container.spinInterval;
      }
      container.classList.remove('spinning');
      
      // Apply smooth transition for final landing
      container.style.transition = 'transform 0.3s ease-out';
      
      // Set final position (should be -1976px for center alignment)
      const finalPos = finalPositions ? finalPositions[i] : -1976;
      
      // CRITICAL FIX: Ensure the transform is applied correctly
      // Clear any existing transform first
      container.style.transform = '';
      container.offsetHeight; // Force reflow
      
      // Now apply the final position
      container.style.transform = `translate3d(0, ${finalPos}px, 0)`;
      
      console.log(`🎯 Reel ${i} target position: ${finalPos}px`);
      
      // VERIFY the transform was actually set
      setTimeout(() => {
        const verifyTransform = container.style.transform;
        const computedStyle = window.getComputedStyle(container);
        const computedTransform = computedStyle.transform;
        console.log(`✅ Reel ${i} final verification:`);
        console.log(`   - style.transform: ${verifyTransform}`);
        console.log(`   - computed transform: ${computedTransform}`);
        
        // Check if position is correct
        if (verifyTransform.includes(`${finalPos}px`)) {
          console.log(`   ✅ Position correctly set to ${finalPos}px`);
        } else {
          console.error(`   ❌ Position NOT at ${finalPos}px! Current: ${verifyTransform}`);
        }
      }, 350); // Check after transition completes
      
      // Force browser render
      container.offsetHeight;
      
      // Wait before stopping next reel for staggered effect
      if (i < containers.length - 1) {
        await this.delay(this.reelStopDelay);
      }
    }
  }

  /**
   * Stop reels at random positions (for intermediate spins)
   */
  async stopReelsRandomly(containers) {
    for (let i = 0; i < containers.length; i++) {
      const container = containers[i];
      
      // Stop the spinning interval
      clearInterval(container.spinInterval);
      container.classList.remove('spinning');
      
      // Apply smooth transition
      container.style.transition = 'transform 0.3s ease-out';
      
      // Random position that looks good
      const randomPos = -Math.floor(Math.random() * 10 + 10) * 80;
      container.style.transform = `translate3d(0, ${randomPos}px, 0)`;
      
      console.log(`Reel ${i} stopped at random position: ${randomPos}px`);
      
      // Force browser render
      container.offsetHeight;
      
      // Stagger the stops
      if (i < containers.length - 1) {
        await this.delay(this.reelStopDelay);
      }
    }
  }

  /**
   * Utility delay function
   */
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Quick spin for intermediate spins
   */
  async quickSpin(columns) {
    // Just do a shorter spin
    const oldDuration = this.spinDuration;
    this.spinDuration = 800; // Shorter for quick spins
    
    await this.spin(columns, null, 1, 1);
    
    this.spinDuration = oldDuration;
  }
  
  /**
   * Compatibility methods for old animation engine interface
   */
  async animateSlotMachine(columns, scrollContents, predeterminedResults, preservePosition) {
    // Map to simple spin with final positions
    const finalPositions = predeterminedResults ? [-1976, -1976, -1976, -1976, -1976] : null;
    await this.spin(columns, finalPositions, 1, 1);
  }
  
  async animateQuickSpin(columns, scrollContents, preservePosition) {
    await this.quickSpin(columns);
  }
  
  forceStopAnimation() {
    // Stop all spinning
    const containers = document.querySelectorAll('.slot-items');
    containers.forEach(container => {
      if (container.spinInterval) {
        clearInterval(container.spinInterval);
        container.classList.remove('spinning');
      }
    });
    this.isSpinning = false;
  }

  /**
   * Reset animation state for new spin
   * Added to match AnimationEngineV2 interface
   */
  resetAnimation() {
    console.log('🔄 Resetting SimpleSpinAnimation');
    this.forceStopAnimation();
    // Reset any stored state
    this.isSpinning = false;
    // Clear any transforms on slot containers
    const containers = document.querySelectorAll('.slot-items');
    containers.forEach(container => {
      container.style.transform = 'translateY(0)';
    });
  }
}

// Export for use
window.SimpleSpinAnimation = SimpleSpinAnimation;