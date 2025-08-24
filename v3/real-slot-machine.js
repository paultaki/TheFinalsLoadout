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
  }

  async spin(columns, finalPositions, spinCount = 1, currentSpin = 1) {
    if (this.isSpinning) return;
    
    this.isSpinning = true;
    const isFinalSpin = currentSpin >= spinCount;
    
    console.log(`[REAL-SLOT] Spin ${currentSpin}/${spinCount} - ${isFinalSpin ? 'FINAL' : 'INTERMEDIATE'}`);
    
    // Get all reel containers
    const reels = [];
    columns.forEach((col, index) => {
      const container = col.querySelector('.slot-items');
      if (container) {
        reels.push({ 
          element: container, 
          columnIndex: index,
          targetPosition: finalPositions[index]
        });
      }
    });

    // Start all reels spinning simultaneously
    reels.forEach(reel => this.startSpinning(reel.element));
    
    // Determine spin duration
    const spinDuration = isFinalSpin ? 2000 : 600; // Quick intermediate, longer final
    
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
    const { element, targetPosition } = reel;
    
    // Stop the continuous animation
    this.stopSpinning(element);
    
    if (isFinalSpin) {
      // Calculate final position for winner to be centered
      // Winner at index 20, viewport shows 4 items (320px)
      // Winner should be in position 2 (second item from top)
      // So we need to show items 19, 20(winner), 21, 22
      const finalY = -(19 * this.ITEM_HEIGHT); // -1520px
      
      // Smooth deceleration to final position
      element.style.transition = 'transform 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
      element.style.transform = `translateY(${finalY}px)`;
      
      // Add landing effect
      setTimeout(() => {
        element.classList.add('slot-landed');
      }, 400);
    } else {
      // Quick stop for intermediate spins
      const quickStopY = -(Math.random() * 30 + 10) * this.ITEM_HEIGHT;
      element.style.transition = 'transform 0.2s ease-out';
      element.style.transform = `translateY(${quickStopY}px)`;
    }
  }

  highlightWinners(columns) {
    columns.forEach(col => {
      const items = col.querySelectorAll('.slot-item');
      // Index 20 is the winner (middle of viewport)
      if (items[20]) {
        items[20].classList.add('winner');
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
}

// Replace the existing animation with this real slot machine animation
window.SlotMachineAnimation = RealSlotMachineAnimation;

console.log('[REAL-SLOT] Real slot machine animation loaded');