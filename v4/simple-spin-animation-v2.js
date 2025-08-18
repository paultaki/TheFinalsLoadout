/**
 * SIMPLE WORKING SLOT MACHINE ANIMATION - V2
 * Enhanced with downward spin and 360px viewport
 * Items now spin DOWN like real slot machines
 */

class SimpleSpinAnimation {
  constructor() {
    this.isSpinning = false;
    this.spinSpeed = 50; // ms between position updates
    this.spinDuration = 1500; // ms minimum spin time
    this.reelStopDelay = 300; // ms between each reel stopping
    this.itemHeight = 80; // Height of each item
    this.viewportHeight = 360; // New expanded viewport (4.5 items visible)
  }

  /**
   * Main entry point for multi-spin sequences
   */
  async startMultiSpin(columns, sequence, isLastSpin, finalItems) {
    console.log(`🎰 Starting spin sequence ${sequence.current}/${sequence.total}`);
    
    // Get all containers
    const containers = columns.map(col => col.querySelector('.slot-items'));
    
    if (isLastSpin && finalItems) {
      // Final spin - calculate landing positions
      const finalPositions = this.calculateFinalPositions(finalItems);
      await this.spin(containers, finalPositions);
    } else {
      // Intermediate spin
      await this.spin(containers, null);
    }
  }

  /**
   * Calculate final positions for winning items
   * With 360px viewport and downward spin, winner should be at bottom
   */
  calculateFinalPositions(winnerIndexes) {
    // With downward spin and 360px viewport:
    // - Viewport shows 4.5 items (360px / 80px)
    // - Winner should appear at bottom (position 4)
    // - We need to position the strip so winner is at bottom
    
    const positions = [];
    
    for (let i = 0; i < winnerIndexes.length; i++) {
      const winnerIndex = winnerIndexes[i];
      // For downward spin with positive positions
      // Winner at bottom means we show items 0-3 above it
      // So we position at -(winnerIndex - 3) * 80
      const targetPos = (winnerIndex - 3) * this.itemHeight;
      positions.push(targetPos);
      console.log(`Column ${i}: Winner at index ${winnerIndex}, position: ${targetPos}px`);
    }
    
    return positions;
  }

  /**
   * Main spin animation
   */
  async spin(containers, finalPositions = null) {
    this.isSpinning = true;
    
    // Start all reels spinning
    containers.forEach((container, index) => {
      container.classList.add('spinning');
      this.cycleReel(container, index);
    });
    
    // Let them spin for a bit
    await this.delay(this.spinDuration);
    
    if (finalPositions) {
      // Final spin - stop at specific positions
      console.log('🎯 Final spin - stopping at winner positions');
      await this.stopReelsAtPositions(containers, finalPositions);
    } else {
      // Intermediate spin - stop at random positions
      console.log('🔄 Intermediate spin - stopping at random positions');
      await this.stopReelsRandomly(containers);
    }
    
    this.isSpinning = false;
  }

  /**
   * Quick spin for testing
   */
  async quickSpin(containers) {
    console.log('⚡ Quick spin initiated');
    this.isSpinning = true;
    
    containers.forEach(container => {
      container.classList.add('spinning');
      // Simple downward animation
      let pos = 0;
      const quickInterval = setInterval(() => {
        pos += 40; // Move DOWN (positive)
        container.style.transform = `translateY(${pos}px)`;
        if (pos > 800) {
          clearInterval(quickInterval);
        }
      }, 50);
      container.quickInterval = quickInterval;
    });
    
    await this.delay(1000);
    
    containers.forEach(container => {
      if (container.quickInterval) {
        clearInterval(container.quickInterval);
      }
      container.classList.remove('spinning');
    });
    
    this.isSpinning = false;
  }

  /**
   * Cycle reel animation - NOW SPINS DOWNWARD
   */
  cycleReel(container, reelIndex) {
    let position = parseFloat(container.style.transform.replace(/[^\d.-]/g, '')) || 0;
    
    // Ensure we have items to spin
    if (container.children.length === 0) {
      console.error('No items in container!');
      return;
    }
    
    const totalItems = container.children.length;
    const cycleHeight = totalItems * this.itemHeight;
    
    console.log(`🎰 Starting downward spin: position=${position}, totalItems=${totalItems}, cycleHeight=${cycleHeight}`);
    
    let iterationCount = 0;
    
    // Store interval ID on container so we can stop it later
    container.spinInterval = setInterval(() => {
      iterationCount++;
      
      // DOWNWARD SPIN: Move container DOWN (positive Y)
      position += this.itemHeight * 2; // Positive moves container down
      
      // Wrap around when we've scrolled past all items
      if (position >= cycleHeight) {
        position = position - cycleHeight; // Reset for seamless scroll
      }
      
      // Apply transform with GPU acceleration
      container.style.transform = `translate3d(0, ${position}px, 0)`;
      container.style.transition = 'none'; // No transition during spin
      
      // Debug first few iterations
      if (iterationCount <= 3) {
        console.log(`🔄 Iteration ${iterationCount}: position=${position}px (DOWNWARD)`);
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
      
      // Stop the spinning
      if (container.spinInterval) {
        clearInterval(container.spinInterval);
        delete container.spinInterval;
      }
      container.classList.remove('spinning');
      
      // Apply smooth transition for final landing
      container.style.transition = 'transform 0.3s ease-out';
      
      // Set final position for downward spin
      const finalPos = finalPositions ? finalPositions[i] : 240; // Default to showing bottom items
      
      // Clear any existing transform first
      container.style.transform = '';
      container.offsetHeight; // Force reflow
      
      // Now apply the final position
      container.style.transform = `translate3d(0, ${finalPos}px, 0)`;
      
      console.log(`🎯 Reel ${i} landing at: ${finalPos}px (DOWNWARD)`);
      
      // Verify the transform was applied
      setTimeout(() => {
        const verifyTransform = container.style.transform;
        console.log(`✅ Reel ${i} verified at: ${verifyTransform}`);
      }, 350);
      
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
    console.log('🎲 Stopping reels at random positions');
    
    for (let i = 0; i < containers.length; i++) {
      const container = containers[i];
      
      // Stop spinning
      if (container.spinInterval) {
        clearInterval(container.spinInterval);
        delete container.spinInterval;
      }
      container.classList.remove('spinning');
      
      // Random position for downward spin
      const randomIndex = Math.floor(Math.random() * 20);
      const randomPos = randomIndex * this.itemHeight;
      
      container.style.transition = 'transform 0.3s ease-out';
      container.style.transform = `translate3d(0, ${randomPos}px, 0)`;
      
      console.log(`Reel ${i} stopped at random position: ${randomPos}px`);
      
      // Stagger the stops
      if (i < containers.length - 1) {
        await this.delay(200);
      }
    }
  }

  /**
   * Helper delay function
   */
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Start spinning all columns
   */
  startSpinning(columns) {
    console.log('🎰 Starting all reels spinning');
    this.isSpinning = true;
    
    columns.forEach((column, index) => {
      const container = column.querySelector('.slot-items');
      if (container) {
        container.classList.add('spinning');
        this.cycleReel(container, index);
      }
    });
  }

  /**
   * Stop spinning with specific winner indexes
   */
  async stopSpinning(columns, winnerIndexes) {
    console.log('🛑 Stopping with winners:', winnerIndexes);
    
    const containers = columns.map(col => col.querySelector('.slot-items'));
    const finalPositions = this.calculateFinalPositions(winnerIndexes);
    
    await this.stopReelsAtPositions(containers, finalPositions);
    this.isSpinning = false;
  }

  /**
   * Emergency stop
   */
  forceStopAnimation() {
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
   */
  resetAnimation() {
    console.log('🔄 Resetting SimpleSpinAnimation');
    this.forceStopAnimation();
    this.isSpinning = false;
    
    // Reset all transforms to 0
    const containers = document.querySelectorAll('.slot-items');
    containers.forEach(container => {
      container.style.transform = 'translateY(0)';
    });
  }

  /**
   * Compatibility method for animation engine interface
   */
  async animateColumns(columns, scrollContents, winnerIndexes, isLastSpin, preservePosition) {
    if (isLastSpin) {
      await this.startMultiSpin(columns, {current: 1, total: 1}, true, winnerIndexes);
    } else {
      await this.startMultiSpin(columns, {current: 1, total: 1}, false, null);
    }
  }

  /**
   * Compatibility method
   */
  async animateQuickSpin(columns, scrollContents, preservePosition) {
    await this.quickSpin(columns);
  }
}

// Export for use
window.SimpleSpinAnimation = SimpleSpinAnimation;