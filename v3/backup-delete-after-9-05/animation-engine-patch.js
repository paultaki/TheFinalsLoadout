/**
 * Animation Engine Landing Position Patch
 * Fixes the landing calculations for 240px viewport with 80px items
 * 
 * This patch overrides the animation engine's constants to ensure
 * items land correctly at the bottom of the viewport
 */

(function() {
  'use strict';
  
  console.log('[PATCH] Applying animation engine viewport fix...');
  
  // Wait for animation engine to load
  function patchAnimationEngine() {
    // Check if AnimationEngineV2 exists
    if (typeof AnimationEngineV2 === 'undefined' && typeof window.AnimationEngineV2 === 'undefined') {
      // Try again in 100ms
      setTimeout(patchAnimationEngine, 100);
      return;
    }
    
    console.log('[PATCH] Animation engine found, applying fixes...');
    
    // Override constants for 240px viewport with 80px items
    const CORRECT_ITEM_HEIGHT = 80;
    const CORRECT_VIEWPORT_HEIGHT = 240;
    const CORRECT_CENTER_OFFSET = 160; // Winner at bottom of 240px viewport
    const CORRECT_TARGET_POSITION = -1440; // -(20 * 80) + 160
    
    // Patch the calculateTargetPosition method if it exists
    if (window.AnimationEngineV2 && window.AnimationEngineV2.prototype) {
      const originalCalculate = window.AnimationEngineV2.prototype.calculateTargetPosition;
      
      window.AnimationEngineV2.prototype.calculateTargetPosition = function(currentUnwrappedY, winnerIndex, totalSpins, cycleHeight) {
        console.log('[PATCH] Overriding target position calculation...');
        
        // Use corrected values
        const ITEM_H = CORRECT_ITEM_HEIGHT;
        const targetWrappedPosition = -(winnerIndex * ITEM_H) + CORRECT_CENTER_OFFSET; // -1440px for bottom position
        
        const minDistance = totalSpins * cycleHeight;
        const baseUnwrapped = currentUnwrappedY + minDistance;
        
        // We want final wrapped position to be -1440px
        const targetWrappedRaw = cycleHeight + targetWrappedPosition;
        
        // Find adjustment needed
        const currentWrappedRaw = baseUnwrapped % cycleHeight;
        let adjustment = targetWrappedRaw - currentWrappedRaw;
        
        if (adjustment < 0) {
          adjustment += cycleHeight;
        }
        
        const targetUnwrapped = baseUnwrapped + adjustment;
        
        console.log(`[PATCH] Target: ${targetUnwrapped.toFixed(0)}px will wrap to ${targetWrappedPosition}px`);
        
        return targetUnwrapped;
      };
    }
    
    // Also patch any global references to the old values
    if (window.CENTER_OFFSET !== undefined) {
      window.CENTER_OFFSET = CORRECT_CENTER_OFFSET;
    }
    
    // Patch the final snap position
    const originalAnimate = window.AnimationEngineV2?.prototype?.animateFinalSpin;
    if (originalAnimate) {
      window.AnimationEngineV2.prototype.animateFinalSpin = function(...args) {
        const result = originalAnimate.call(this, ...args);
        
        // After animation, force correct position
        setTimeout(() => {
          const columns = document.querySelectorAll('.slot-column');
          columns.forEach(column => {
            const itemsContainer = column.querySelector('.slot-items');
            if (itemsContainer) {
              const currentTransform = itemsContainer.style.transform;
              const match = currentTransform?.match(/translateY\((-?\d+(?:\.\d+)?)px\)/);
              if (match) {
                const currentY = parseFloat(match[1]);
                // If close to old target, snap to new target
                if (Math.abs(currentY - (-1976)) < 100) {
                  console.log('[PATCH] Correcting final position from', currentY, 'to', CORRECT_TARGET_POSITION);
                  itemsContainer.style.transform = `translateY(${CORRECT_TARGET_POSITION}px)`;
                }
              }
            }
          });
        }, 100);
        
        return result;
      };
    }
    
    console.log('[PATCH] Animation engine patch applied successfully!');
  }
  
  // Start patching process
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', patchAnimationEngine);
  } else {
    patchAnimationEngine();
  }
  
  // Also patch after window load to be sure
  window.addEventListener('load', function() {
    setTimeout(patchAnimationEngine, 500);
  });
})();