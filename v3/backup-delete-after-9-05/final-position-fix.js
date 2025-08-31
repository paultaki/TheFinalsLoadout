/**
 * Final Position Fix
 * Ensures winners land in the correct position regardless of DOM updates
 */

class FinalPositionFixer {
  constructor() {
    this.ITEM_HEIGHT = 80;
    this.WINNER_INDEX = 20;
    this.VIEWPORT_HEIGHT = 320;
    this.TARGET_POSITION_IN_VIEWPORT = 1; // 2nd position (0-indexed)
  }

  /**
   * Calculate the exact translateY needed for each column
   * based on where the winner ACTUALLY is in the DOM
   */
  calculateExactPosition(container, winnerText) {
    const items = container.querySelectorAll('.slot-item');
    let winnerIndex = -1;
    
    // Find the actual index of the winner
    for (let i = 0; i < items.length; i++) {
      const itemText = items[i].textContent.trim();
      if (itemText === winnerText) {
        winnerIndex = i;
        console.log(`[POSITION-FIX] Found "${winnerText}" at index ${i}`);
        break;
      }
    }
    
    if (winnerIndex === -1) {
      console.error(`[POSITION-FIX] Winner "${winnerText}" not found!`);
      return -1520; // Fallback
    }
    
    // Calculate translateY to put this item in 2nd position
    // We want the winner at 80px from viewport top
    // So we need to translate by -(winnerIndex - 1) * 80
    const translateY = -((winnerIndex - 1) * this.ITEM_HEIGHT);
    
    console.log(`[POSITION-FIX] Winner at index ${winnerIndex}, translateY: ${translateY}px`);
    return translateY;
  }

  /**
   * Fix all columns to show winners in correct position
   */
  fixAllColumns(loadout) {
    const columnMapping = {
      'weapon': loadout.weapon,
      'specialization': loadout.specialization,
      'gadget-1': loadout.gadgets[0],
      'gadget-2': loadout.gadgets[1],
      'gadget-3': loadout.gadgets[2]
    };
    
    Object.entries(columnMapping).forEach(([columnType, winnerText]) => {
      const column = document.querySelector(`.slot-column[data-type="${columnType}"]`);
      if (!column) {
        console.error(`[POSITION-FIX] Column ${columnType} not found`);
        return;
      }
      
      const container = column.querySelector('.slot-items');
      if (!container) {
        console.error(`[POSITION-FIX] Container for ${columnType} not found`);
        return;
      }
      
      // Calculate exact position for this column's winner
      const exactY = this.calculateExactPosition(container, winnerText);
      
      // Apply the exact position
      container.style.transition = 'none';
      container.style.transform = `translateY(${exactY}px)`;
      
      console.log(`[POSITION-FIX] ${columnType} fixed to ${exactY}px for winner "${winnerText}"`);
    });
  }
  
  /**
   * Lock the DOM to prevent updates during animation
   */
  lockDOM(columns) {
    columns.forEach(col => {
      const container = col.querySelector('.slot-items');
      if (container) {
        // Store current HTML to prevent changes
        container.dataset.locked = 'true';
        container.dataset.lockedHtml = container.innerHTML;
        console.log('[POSITION-FIX] DOM locked for animation');
      }
    });
  }
  
  /**
   * Unlock the DOM after animation
   */
  unlockDOM(columns) {
    columns.forEach(col => {
      const container = col.querySelector('.slot-items');
      if (container) {
        delete container.dataset.locked;
        delete container.dataset.lockedHtml;
        console.log('[POSITION-FIX] DOM unlocked');
      }
    });
  }
}

// Create global instance
window.FinalPositionFixer = new FinalPositionFixer();

// Intercept the RealSlotMachineAnimation to add position fixing
if (typeof RealSlotMachineAnimation !== 'undefined') {
  const originalSpin = RealSlotMachineAnimation.prototype.spin;
  
  RealSlotMachineAnimation.prototype.spin = async function(columns, finalPositions, spinCount = 1, currentSpin = 1) {
    const isFinalSpin = currentSpin >= spinCount;
    
    if (isFinalSpin) {
      // Lock DOM before final spin
      window.FinalPositionFixer.lockDOM(columns);
    }
    
    // Call original spin
    const result = await originalSpin.call(this, columns, finalPositions, spinCount, currentSpin);
    
    if (isFinalSpin) {
      // After animation completes, fix positions if needed
      setTimeout(() => {
        // Get the loadout from the slot machine
        if (window.slotMachine && window.slotMachine.currentLoadout) {
          console.log('[POSITION-FIX] Applying final position corrections...');
          window.FinalPositionFixer.fixAllColumns(window.slotMachine.currentLoadout);
        }
        
        // Unlock DOM
        window.FinalPositionFixer.unlockDOM(columns);
      }, 100);
    }
    
    return result;
  };
  
  console.log('[POSITION-FIX] Position fixer installed');
}