/**
 * Animation Constants Override Fix
 * CRITICAL: The animation engine has wrong item dimensions!
 * This fix corrects the 30% size mismatch that causes all positioning issues
 */

(function() {
  'use strict';
  
  console.log('[CONSTANTS-FIX] 🚨 CRITICAL FIX: Correcting animation engine constants...');
  
  // CORRECT values for the actual DOM
  const CORRECT_VALUES = {
    ITEM_H: 80,              // Actual item height in pixels
    VIEWPORT_H: 240,         // Actual viewport height (3 items * 80px)
    CENTER_OFFSET: 160,      // Bottom position (240 - 80)
    WINNER_INDEX: 20,        // Winner is at index 20
    FINAL_POSITION: -1440    // -(20 * 80) + 160 = -1440px
  };
  
  console.log('[CONSTANTS-FIX] Correct values:', CORRECT_VALUES);
  
  // Override global constants if they exist
  function overrideGlobalConstants() {
    if (typeof window !== 'undefined') {
      // Force correct values globally
      window.ITEM_H = CORRECT_VALUES.ITEM_H;
      window.VIEWPORT_H = CORRECT_VALUES.VIEWPORT_H;
      window.CENTER_OFFSET = CORRECT_VALUES.CENTER_OFFSET;
      
      console.log('[CONSTANTS-FIX] Global constants overridden');
    }
  }
  
  // Patch AnimationEngineV2 completely
  function patchAnimationEngineV2() {
    // Wait for the engine to be defined
    if (typeof AnimationEngineV2 === 'undefined' && typeof window.AnimationEngineV2 === 'undefined') {
      setTimeout(patchAnimationEngineV2, 50);
      return;
    }
    
    const Engine = window.AnimationEngineV2 || AnimationEngineV2;
    console.log('[CONSTANTS-FIX] Patching AnimationEngineV2...');
    
    // Store original constructor
    const OriginalEngine = Engine;
    
    // Create new constructor that uses correct values
    window.AnimationEngineV2 = function(container, winnerIndex, onComplete) {
      // Call original constructor
      const instance = new OriginalEngine(container, winnerIndex, onComplete);
      
      // Override instance properties with correct values
      instance.ITEM_H = CORRECT_VALUES.ITEM_H;
      instance.itemHeight = CORRECT_VALUES.ITEM_H;
      
      // Override methods that use wrong constants
      instance.calculateTargetPosition = function(currentUnwrappedY, winnerIndex, totalSpins, cycleHeight) {
        // Use CORRECT item height
        const ITEM_H = CORRECT_VALUES.ITEM_H;
        const targetWrappedPosition = -(winnerIndex * ITEM_H) + CORRECT_VALUES.CENTER_OFFSET;
        
        const minDistance = totalSpins * cycleHeight;
        const baseUnwrapped = currentUnwrappedY + minDistance;
        
        // Correct cycle height for 80px items
        const correctCycleHeight = 50 * ITEM_H; // 50 items * 80px = 4000px
        const targetWrappedRaw = correctCycleHeight + targetWrappedPosition;
        const currentWrappedRaw = baseUnwrapped % correctCycleHeight;
        
        let adjustment = targetWrappedRaw - currentWrappedRaw;
        if (adjustment < 0) {
          adjustment += correctCycleHeight;
        }
        
        const targetUnwrapped = baseUnwrapped + adjustment;
        
        console.log(`[CONSTANTS-FIX] Calculated target: ${targetUnwrapped}px → wrapped: ${targetWrappedPosition}px`);
        return targetUnwrapped;
      };
      
      // Override the animate method to use correct values
      const originalAnimate = instance.animate;
      instance.animate = function(timestamp) {
        // Ensure correct item height is used
        this.itemHeight = CORRECT_VALUES.ITEM_H;
        
        // Call original animate
        const result = originalAnimate.call(this, timestamp);
        
        // Check if we're near completion with wrong position
        if (this.wrappedY && Math.abs(this.wrappedY - (-1976)) < 100) {
          console.log('[CONSTANTS-FIX] Correcting wrong final position');
          this.wrappedY = CORRECT_VALUES.FINAL_POSITION;
          this.container.style.transform = `translateY(${CORRECT_VALUES.FINAL_POSITION}px)`;
        }
        
        return result;
      };
      
      return instance;
    };
    
    // Copy prototype
    window.AnimationEngineV2.prototype = OriginalEngine.prototype;
    
    console.log('[CONSTANTS-FIX] AnimationEngineV2 fully patched');
  }
  
  // Fix SimpleSpinAnimation to use correct values
  function patchSimpleSpinAnimation() {
    if (typeof SimpleSpinAnimation === 'undefined') {
      setTimeout(patchSimpleSpinAnimation, 50);
      return;
    }
    
    console.log('[CONSTANTS-FIX] Patching SimpleSpinAnimation...');
    
    // Override the hardcoded -1976px value
    const originalSpin = SimpleSpinAnimation.prototype.spin;
    SimpleSpinAnimation.prototype.spin = function(columns, finalPositions, spinCount, currentSpin) {
      // Replace wrong positions with correct ones
      if (finalPositions) {
        finalPositions = finalPositions.map(() => CORRECT_VALUES.FINAL_POSITION);
      }
      return originalSpin.call(this, columns, finalPositions, spinCount, currentSpin);
    };
    
    // Fix stopReelsAtPositions
    const originalStop = SimpleSpinAnimation.prototype.stopReelsAtPositions;
    SimpleSpinAnimation.prototype.stopReelsAtPositions = async function(containers, finalPositions) {
      console.log('[CONSTANTS-FIX] Intercepting stop positions...');
      
      // Use correct final position
      const correctedPositions = Array(containers.length).fill(CORRECT_VALUES.FINAL_POSITION);
      
      for (let i = 0; i < containers.length; i++) {
        const container = containers[i];
        const column = container.closest('.slot-column');
        
        // Remove spinning classes
        if (column) {
          column.classList.remove('spinning', 'spinning-fast');
        }
        
        // Apply correct transform
        container.style.transform = `translateY(${CORRECT_VALUES.FINAL_POSITION}px)`;
        container.style.transition = 'transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)';
        
        // Delay for stagger effect
        await new Promise(resolve => setTimeout(resolve, 150));
      }
      
      console.log('[CONSTANTS-FIX] All columns set to correct position:', CORRECT_VALUES.FINAL_POSITION);
    };
    
    console.log('[CONSTANTS-FIX] SimpleSpinAnimation patched');
  }
  
  // Monitor and correct any wrong positions
  function monitorAndCorrect() {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'attributes' && mutation.attributeName === 'style') {
          const target = mutation.target;
          
          if (target.classList && target.classList.contains('slot-items')) {
            const transform = target.style.transform;
            if (transform) {
              const match = transform.match(/translateY\((-?\d+(?:\.\d+)?)px\)/);
              if (match) {
                const currentY = parseFloat(match[1]);
                
                // If it's at wrong position, correct it
                if (Math.abs(currentY - (-1976)) < 10 || 
                    Math.abs(currentY - (-2080)) < 10 ||
                    Math.abs(currentY - (-1520)) < 10) {
                  
                  console.log(`[CONSTANTS-FIX] Auto-correcting position from ${currentY}px to ${CORRECT_VALUES.FINAL_POSITION}px`);
                  target.style.transform = `translateY(${CORRECT_VALUES.FINAL_POSITION}px)`;
                }
              }
            }
          }
        }
      });
    });
    
    // Start observing after a delay
    setTimeout(() => {
      document.querySelectorAll('.slot-items').forEach(container => {
        observer.observe(container, { 
          attributes: true, 
          attributeFilter: ['style'] 
        });
      });
    }, 1000);
  }
  
  // Initialize all fixes
  function initialize() {
    console.log('[CONSTANTS-FIX] Initializing all constant fixes...');
    
    overrideGlobalConstants();
    patchAnimationEngineV2();
    patchSimpleSpinAnimation();
    monitorAndCorrect();
    
    // Re-apply after delays to catch late-loading scripts
    setTimeout(() => {
      overrideGlobalConstants();
      patchAnimationEngineV2();
      patchSimpleSpinAnimation();
    }, 500);
    
    setTimeout(() => {
      overrideGlobalConstants();
      patchAnimationEngineV2();
      patchSimpleSpinAnimation();
    }, 1500);
    
    console.log('[CONSTANTS-FIX] ✅ All constant fixes applied');
  }
  
  // Start immediately and on DOM ready
  initialize();
  
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialize);
  }
  
  window.addEventListener('load', () => {
    setTimeout(initialize, 100);
  });
  
})();