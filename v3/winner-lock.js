/**
 * Winner Position Lock System
 * Ensures winners are ALWAYS at index 20 and stay there
 */

class WinnerLockSystem {
  constructor() {
    this.ITEM_HEIGHT = 80;
    this.WINNER_INDEX = 20; // Winners must be at index 20
    this.VIEWPORT_HEIGHT = 320;
    this.TARGET_TRANSLATE = -1520; // -(20 - 1) * 80 = -1520px
  }

  /**
   * Force winner to be at index 20 in the DOM
   * This runs BEFORE animation starts
   */
  forceWinnerPosition(container, winnerText) {
    const items = Array.from(container.querySelectorAll('.slot-item'));
    let currentWinnerIndex = -1;
    
    // Find current position of winner
    for (let i = 0; i < items.length; i++) {
      if (items[i].textContent.trim() === winnerText) {
        currentWinnerIndex = i;
        break;
      }
    }
    
    if (currentWinnerIndex === -1) {
      console.error(`[WINNER-LOCK] Winner "${winnerText}" not found!`);
      return false;
    }
    
    if (currentWinnerIndex === this.WINNER_INDEX) {
      console.log(`[WINNER-LOCK] Winner "${winnerText}" already at index ${this.WINNER_INDEX}`);
      return true;
    }
    
    // Move winner to index 20
    const winnerElement = items[currentWinnerIndex];
    const parent = container;
    
    // Remove winner from current position
    winnerElement.remove();
    
    // Insert at index 20
    if (items.length > this.WINNER_INDEX) {
      // Insert before the item currently at index 20
      const targetItem = items[this.WINNER_INDEX];
      if (targetItem && targetItem !== winnerElement) {
        parent.insertBefore(winnerElement, targetItem);
      } else {
        // Fallback: count positions and insert
        const allItems = parent.querySelectorAll('.slot-item');
        if (allItems[this.WINNER_INDEX]) {
          parent.insertBefore(winnerElement, allItems[this.WINNER_INDEX]);
        } else {
          parent.appendChild(winnerElement);
        }
      }
    } else {
      // Not enough items, add to end
      parent.appendChild(winnerElement);
    }
    
    console.log(`[WINNER-LOCK] Moved "${winnerText}" from index ${currentWinnerIndex} to ${this.WINNER_INDEX}`);
    return true;
  }

  /**
   * Lock all winners in place before animation
   */
  lockAllWinners(loadout) {
    console.log('[WINNER-LOCK] Locking all winners at index 20...');
    
    const columnMapping = {
      'weapon': loadout.weapon,
      'specialization': loadout.specialization,
      'gadget-1': loadout.gadgets[0],
      'gadget-2': loadout.gadgets[1],
      'gadget-3': loadout.gadgets[2]
    };
    
    let success = true;
    
    Object.entries(columnMapping).forEach(([columnType, winnerText]) => {
      const column = document.querySelector(`.slot-column[data-type="${columnType}"]`);
      if (!column) {
        console.error(`[WINNER-LOCK] Column ${columnType} not found`);
        success = false;
        return;
      }
      
      const container = column.querySelector('.slot-items');
      if (!container) {
        console.error(`[WINNER-LOCK] Container for ${columnType} not found`);
        success = false;
        return;
      }
      
      // Force winner to index 20
      if (!this.forceWinnerPosition(container, winnerText)) {
        success = false;
      }
      
      // Reset transform to 0 for animation start
      container.style.transition = 'none';
      container.style.transform = 'translateY(0px)';
      
      // Mark as locked to prevent DOM updates
      container.dataset.winnerLocked = 'true';
      container.dataset.lockedTransform = this.TARGET_TRANSLATE;
      container.dataset.winnerText = winnerText;
      
      // Prevent ANY modifications to this container
      const observer = new MutationObserver((mutations) => {
        console.warn(`[WINNER-LOCK] Blocked DOM mutation on locked ${columnType}`);
        mutations.forEach(mutation => {
          mutation.preventDefault?.();
        });
      });
      
      observer.observe(container, {
        childList: true,
        subtree: true,
        attributes: true
      });
      
      container.dataset.observer = 'active';
      container._lockObserver = observer;
    });
    
    console.log(`[WINNER-LOCK] Lock complete. Success: ${success}`);
    return success;
  }

  /**
   * Verify winners are still at correct position after animation
   */
  verifyAndFix(loadout) {
    console.log('[WINNER-LOCK] Verifying winner positions...');
    
    const columnMapping = {
      'weapon': loadout.weapon,
      'specialization': loadout.specialization,
      'gadget-1': loadout.gadgets[0],
      'gadget-2': loadout.gadgets[1],
      'gadget-3': loadout.gadgets[2]
    };
    
    Object.entries(columnMapping).forEach(([columnType, winnerText]) => {
      const column = document.querySelector(`.slot-column[data-type="${columnType}"]`);
      if (!column) return;
      
      const container = column.querySelector('.slot-items');
      if (!container) return;
      
      // Check if transform is correct
      const currentTransform = container.style.transform;
      const expectedTransform = `translateY(${this.TARGET_TRANSLATE}px)`;
      
      if (currentTransform !== expectedTransform) {
        console.warn(`[WINNER-LOCK] ${columnType} has wrong transform: ${currentTransform}, fixing...`);
        container.style.transition = 'none';
        container.style.transform = expectedTransform;
      }
      
      // Verify winner is visible in viewport
      const items = container.querySelectorAll('.slot-item');
      if (items[this.WINNER_INDEX]) {
        const winnerInPosition = items[this.WINNER_INDEX].textContent.trim();
        if (winnerInPosition !== winnerText) {
          console.error(`[WINNER-LOCK] ${columnType} has wrong item at index 20: "${winnerInPosition}" instead of "${winnerText}"`);
          // Force fix
          this.forceWinnerPosition(container, winnerText);
          container.style.transform = expectedTransform;
        }
      }
    });
    
    console.log('[WINNER-LOCK] Verification complete');
  }

  /**
   * Unlock columns after everything is settled
   */
  unlockAll() {
    document.querySelectorAll('.slot-items[data-winner-locked]').forEach(container => {
      // Disconnect mutation observer
      if (container._lockObserver) {
        container._lockObserver.disconnect();
        delete container._lockObserver;
      }
      
      delete container.dataset.winnerLocked;
      delete container.dataset.lockedTransform;
      delete container.dataset.winnerText;
      delete container.dataset.observer;
    });
    console.log('[WINNER-LOCK] All columns unlocked');
  }
}

// Create global instance
window.WinnerLockSystem = new WinnerLockSystem();

// Override the slot machine's finalizeDOM to use our lock system
if (typeof SlotMachine !== 'undefined') {
  const originalFinalizeDOM = SlotMachine.prototype.finalizeDOM;
  
  SlotMachine.prototype.finalizeDOM = function(loadout) {
    // Lock winners BEFORE finalizing DOM
    window.WinnerLockSystem.lockAllWinners(loadout);
    
    // Call original if it exists
    if (originalFinalizeDOM) {
      originalFinalizeDOM.call(this, loadout);
    }
    
    // Verify positions are still correct
    setTimeout(() => {
      window.WinnerLockSystem.verifyAndFix(loadout);
    }, 50);
  };
}

// Also hook into the animation completion
if (typeof RealSlotMachineAnimation !== 'undefined') {
  const originalStop = RealSlotMachineAnimation.prototype.stopReel;
  
  RealSlotMachineAnimation.prototype.stopReel = async function(column, finalPosition, delay = 0) {
    const result = await originalStop.call(this, column, finalPosition, delay);
    
    // After reel stops, verify position
    const container = column.querySelector('.slot-items');
    if (container && container.dataset.winnerLocked) {
      const lockedTransform = parseInt(container.dataset.lockedTransform);
      if (!isNaN(lockedTransform)) {
        container.style.transform = `translateY(${lockedTransform}px)`;
      }
    }
    
    return result;
  };
}

console.log('[WINNER-LOCK] Winner lock system initialized');