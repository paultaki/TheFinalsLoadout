/**
 * Real Slot Machine Animation
 * Mimics authentic slot machine behavior with continuous downward scrolling
 */

class RealSlotMachineAnimation {
  constructor() {
    this.isSpinning = false;
    this.ITEM_HEIGHT = 80;
    this.SPIN_SPEED = 2000; // pixels per second
    this.animations = new Map();
    this.spinSound = null;
    this.initSound();
  }
  
  initSound() {
    // Try to get the sound manager if it exists
    if (typeof window.soundManager !== 'undefined') {
      this.soundManager = window.soundManager;
    }
  }
  
  playSpinSound() {
    // Play the spinning sound
    if (this.soundManager && this.soundManager.play) {
      this.soundManager.play('spinning');
      this.spinSound = 'spinning';
    }
  }
  
  stopSpinSound() {
    // Stop the spinning sound
    if (this.soundManager && this.soundManager.stop) {
      this.soundManager.stop('spinning');
      this.spinSound = null;
    }
  }
  
  playSlowingSound() {
    // Play a slowing down sound effect if available
    if (this.soundManager && this.soundManager.play) {
      // Try to play a deceleration sound if it exists
      this.soundManager.play('wheel-beep9');
    }
  }

  async spin(columns, finalPositions, spinCount = 1, currentSpin = 1) {
    if (this.isSpinning) return;
    
    this.isSpinning = true;
    const isFinalSpin = currentSpin >= spinCount;
    
    console.log(`[REAL-SLOT] Spin ${currentSpin}/${spinCount} - ${isFinalSpin ? 'FINAL' : 'INTERMEDIATE'}`);
    
    // Handle missing finalPositions
    if (!finalPositions) {
      finalPositions = Array(columns.length).fill(null);
    }
    
    // Get all reel containers
    const reels = [];
    columns.forEach((col, index) => {
      // col might be the element itself or an object with element property
      const colElement = col.element || col;
      const container = colElement.querySelector('.slot-items');
      
      if (container) {
        console.log(`[REAL-SLOT] Found container for column ${index}`);
        reels.push({ 
          element: container, 
          columnIndex: index,
          targetPosition: finalPositions ? finalPositions[index] : null
        });
      } else {
        console.error(`[REAL-SLOT] No .slot-items found in column ${index}`, colElement);
      }
    });

    // Check if we have reels to spin
    if (reels.length === 0) {
      console.error('[REAL-SLOT] No reels found to spin!');
      this.isSpinning = false;
      return;
    }
    
    // Start all reels spinning simultaneously
    reels.forEach(reel => this.startSpinning(reel.element));
    
    // Start spin sound for this cycle
    this.playSpinSound();
    
    // Determine spin duration
    const spinDuration = isFinalSpin ? 2000 : 600; // Quick intermediate, longer final
    
    // Stop sound before reels start stopping
    setTimeout(() => {
      this.stopSpinSound();
      if (isFinalSpin) {
        this.playSlowingSound(); // Play deceleration sound for final spin
      }
    }, spinDuration - 200);
    
    // Stop reels one by one with stagger
    for (let i = 0; i < reels.length; i++) {
      const stopDelay = spinDuration + (i * 200); // 200ms stagger between reels
      setTimeout(() => {
        this.stopReel(reels[i], isFinalSpin);
      }, stopDelay);
    }
    
    // Wait for all reels to stop
    const totalDuration = spinDuration + (reels.length * 200) + 500;
    await this.wait(totalDuration);
    
    // Highlight winners only on final spin
    if (isFinalSpin) {
      this.highlightWinners(columns);
    }
    
    this.isSpinning = false;
  }

  startSpinning(reelElement) {
    // Remove any existing animation
    this.stopSpinning(reelElement);
    
    // Add continuous spinning class
    reelElement.classList.add('slot-spinning');
    
    // Create continuous downward animation
    let position = 0;
    const animate = () => {
      position -= this.SPIN_SPEED / 60; // 60fps
      
      // Wrap around when reaching bottom
      const totalHeight = this.ITEM_HEIGHT * 50; // 50 items
      if (Math.abs(position) >= totalHeight) {
        position = position % totalHeight;
      }
      
      reelElement.style.transform = `translateY(${position}px)`;
      
      const animId = requestAnimationFrame(animate);
      this.animations.set(reelElement, animId);
    };
    
    animate();
  }

  stopSpinning(reelElement) {
    // Cancel animation frame
    if (this.animations.has(reelElement)) {
      cancelAnimationFrame(this.animations.get(reelElement));
      this.animations.delete(reelElement);
    }
    
    // Remove spinning class
    reelElement.classList.remove('slot-spinning');
  }

  stopReel(reel, isFinalSpin) {
    const { element, targetPosition, columnIndex } = reel;
    
    // Stop the continuous animation
    this.stopSpinning(element);
    
    if (isFinalSpin) {
      // CRITICAL FIX: All columns must stop at EXACTLY the same position
      // Winner is at index 20, viewport shows 4 items (320px height)
      // To show winner in 2nd position: show items [19, 20(winner), 21, 22]
      // This means translateY must be exactly -(19 * 80) = -1520px for ALL columns
      const WINNER_INDEX = 20;
      const ITEMS_BEFORE_WINNER = 19; // Show item 19 at top of viewport
      const exactFinalY = -(ITEMS_BEFORE_WINNER * this.ITEM_HEIGHT); // -1520px for ALL columns
      
      console.log(`[REAL-SLOT] Column ${columnIndex} stopping at exactly ${exactFinalY}px`);
      
      // Get current position to calculate smooth deceleration
      const currentTransform = element.style.transform;
      const currentY = currentTransform ? parseFloat(currentTransform.match(/translateY\(([-\d.]+)px\)/)?.[1] || 0) : 0;
      
      // Calculate distance and duration for natural deceleration
      const distance = Math.abs(exactFinalY - currentY);
      const duration = Math.min(Math.max(distance / 2000, 0.5), 1.2); // 0.5s to 1.2s based on distance
      
      // Apply EXACT positioning with smooth natural deceleration - SAME FOR ALL COLUMNS
      element.style.transition = `transform ${duration}s cubic-bezier(0.3, 0, 0.2, 1)`;
      element.style.transform = `translateY(${exactFinalY}px)`;
      
      // Lock position after landing to prevent any drift
      setTimeout(() => {
        element.classList.add('slot-landed');
        // Double-check final position
        element.style.transform = `translateY(${exactFinalY}px)`;
        element.style.transition = 'none';
        console.log(`[REAL-SLOT] Column ${columnIndex} locked at ${exactFinalY}px`);
      }, duration * 1000);
    } else {
      // Quick stop for intermediate spins
      const quickStopY = -(Math.random() * 30 + 10) * this.ITEM_HEIGHT;
      element.style.transition = 'transform 0.2s ease-out';
      element.style.transform = `translateY(${quickStopY}px)`;
    }
  }

  highlightWinners(columns) {
    columns.forEach(col => {
      // col might be the element itself or an object with element property
      const colElement = col.element || col;
      const container = colElement.querySelector('.slot-items');
      
      if (container) {
        const items = container.querySelectorAll('.slot-item');
        // With viewport showing 4 items starting at position -1520px (19 * 80)
        // The winner is at index 20 (second visible item)
        // But we need to ensure we're highlighting what's VISIBLE
        // Items 19, 20, 21, 22 are visible
        if (items[20]) {
          items[20].classList.add('winner');
          console.log('[REAL-SLOT] Highlighted winner at index 20:', items[20].textContent);
        }
      }
    });
  }

  wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  reset() {
    // Stop all animations
    this.animations.forEach((animId, element) => {
      cancelAnimationFrame(animId);
      element.classList.remove('slot-spinning', 'slot-landed');
      element.style.transform = 'translateY(0)';
      element.style.transition = '';
    });
    this.animations.clear();
    
    // Remove winner highlights
    document.querySelectorAll('.slot-item.winner').forEach(item => {
      item.classList.remove('winner');
    });
    
    this.isSpinning = false;
  }

  // Alias for compatibility with existing code
  resetAnimation() {
    console.log('[REAL-SLOT] resetAnimation called - resetting slot machine');
    this.reset();
  }
}

// Replace the existing animation with this real slot machine animation
window.SlotMachineAnimation = RealSlotMachineAnimation;

console.log('[REAL-SLOT] Real slot machine animation loaded');