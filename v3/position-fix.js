/**
 * Position Fix for Slot Machine Animation
 * Corrects the final positioning calculations to use proper 80px item height
 */

(function() {
  'use strict';
  
  console.log('[POSITION-FIX] Initializing slot machine position fixes...');
  
  // Correct constants for 80px items in 240px viewport
  const ITEM_HEIGHT = 80;
  const VIEWPORT_HEIGHT = 240;
  const WINNER_INDEX = 20;
  
  // Calculate correct final position
  // Winner at index 20 = 1600px from top
  // To show at bottom (row 3) of 240px viewport: -1600 + 160 = -1440px
  const CORRECT_FINAL_POSITION = -(WINNER_INDEX * ITEM_HEIGHT) + (VIEWPORT_HEIGHT - ITEM_HEIGHT);
  
  console.log(`[POSITION-FIX] Correct final position: ${CORRECT_FINAL_POSITION}px`);
  
  // Override SimpleSpinAnimation if it exists
  function patchSimpleSpinAnimation() {
    if (typeof SimpleSpinAnimation !== 'undefined') {
      console.log('[POSITION-FIX] Patching SimpleSpinAnimation...');
      
      // Store original method
      const originalStopReels = SimpleSpinAnimation.prototype.stopReelsAtPositions;
      
      // Override with corrected version
      SimpleSpinAnimation.prototype.stopReelsAtPositions = async function(containers, finalPositions) {
        console.log('[POSITION-FIX] Intercepting stopReelsAtPositions...');
        
        // Use corrected final position
        const correctedPositions = finalPositions ? 
          finalPositions.map(() => CORRECT_FINAL_POSITION) : 
          Array(containers.length).fill(CORRECT_FINAL_POSITION);
        
        console.log('[POSITION-FIX] Using corrected positions:', correctedPositions);
        
        // Call original with corrected positions
        if (originalStopReels) {
          return originalStopReels.call(this, containers, correctedPositions);
        } else {
          // Fallback implementation
          for (let i = 0; i < containers.length; i++) {
            const container = containers[i];
            const column = container.closest('.slot-column');
            
            // Stop spinning
            if (column) {
              column.classList.remove('spinning', 'spinning-fast');
            }
            
            // Set corrected final position
            container.style.transform = `translateY(${CORRECT_FINAL_POSITION}px)`;
            container.style.transition = 'transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)';
            
            console.log(`[POSITION-FIX] Set column ${i} to ${CORRECT_FINAL_POSITION}px`);
          }
        }
      };
      
      // Also patch the animateSlotMachine method
      const originalAnimate = SimpleSpinAnimation.prototype.animateSlotMachine;
      if (originalAnimate) {
        SimpleSpinAnimation.prototype.animateSlotMachine = async function(columns, scrollContents, predeterminedResults, preservePosition) {
          // Use corrected positions
          const correctedPositions = predeterminedResults ? 
            Array(5).fill(CORRECT_FINAL_POSITION) : null;
          
          // Call spin with corrected positions
          return this.spin(columns, correctedPositions, 1, 1);
        };
      }
      
      console.log('[POSITION-FIX] SimpleSpinAnimation patched successfully');
    }
  }
  
  // Override AnimationEngineV2 if it exists
  function patchAnimationEngine() {
    if (typeof AnimationEngineV2 !== 'undefined' || typeof window.AnimationEngineV2 !== 'undefined') {
      console.log('[POSITION-FIX] Patching AnimationEngineV2...');
      
      const Engine = window.AnimationEngineV2 || AnimationEngineV2;
      
      // Override the CENTER_OFFSET constant
      if (window.CENTER_OFFSET !== undefined) {
        window.CENTER_OFFSET = VIEWPORT_HEIGHT - ITEM_HEIGHT; // 160px
      }
      
      // Patch calculateTargetPosition
      if (Engine.prototype.calculateTargetPosition) {
        const originalCalc = Engine.prototype.calculateTargetPosition;
        
        Engine.prototype.calculateTargetPosition = function(currentUnwrappedY, winnerIndex, totalSpins, cycleHeight) {
          console.log('[POSITION-FIX] Overriding target calculation...');
          
          // Use correct calculation
          const targetWrappedPosition = CORRECT_FINAL_POSITION;
          const minDistance = totalSpins * cycleHeight;
          const baseUnwrapped = currentUnwrappedY + minDistance;
          
          // Calculate wrapped position
          const targetWrappedRaw = cycleHeight + targetWrappedPosition;
          const currentWrappedRaw = baseUnwrapped % cycleHeight;
          let adjustment = targetWrappedRaw - currentWrappedRaw;
          
          if (adjustment < 0) {
            adjustment += cycleHeight;
          }
          
          const targetUnwrapped = baseUnwrapped + adjustment;
          
          console.log(`[POSITION-FIX] Target: ${targetUnwrapped}px → ${targetWrappedPosition}px`);
          return targetUnwrapped;
        };
      }
      
      console.log('[POSITION-FIX] AnimationEngineV2 patched successfully');
    }
  }
  
  // Fix any existing misaligned items
  function fixExistingPositions() {
    const allItemContainers = document.querySelectorAll('.slot-items');
    
    allItemContainers.forEach((container, index) => {
      const transform = container.style.transform;
      if (transform) {
        const match = transform.match(/translateY\((-?\d+(?:\.\d+)?)px\)/);
        if (match) {
          const currentY = parseFloat(match[1]);
          
          // If it's at the wrong position (-1976px or -1520px), correct it
          if (Math.abs(currentY - (-1976)) < 10 || Math.abs(currentY - (-1520)) < 10) {
            console.log(`[POSITION-FIX] Correcting column ${index} from ${currentY}px to ${CORRECT_FINAL_POSITION}px`);
            container.style.transform = `translateY(${CORRECT_FINAL_POSITION}px)`;
          }
        }
      }
    });
  }
  
  // Monitor for animation completion and fix positions
  function monitorAnimations() {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'attributes' && 
            (mutation.attributeName === 'class' || mutation.attributeName === 'style')) {
          
          const target = mutation.target;
          
          // Check if animation just completed
          if (target.classList && target.classList.contains('slot-column')) {
            if (!target.classList.contains('spinning') && 
                !target.classList.contains('spinning-fast')) {
              
              // Animation stopped, fix position
              const itemsContainer = target.querySelector('.slot-items');
              if (itemsContainer) {
                const transform = itemsContainer.style.transform;
                if (transform && transform.includes('-1976')) {
                  console.log('[POSITION-FIX] Fixing completed animation position');
                  itemsContainer.style.transform = `translateY(${CORRECT_FINAL_POSITION}px)`;
                }
              }
            }
          }
        }
      });
    });
    
    // Observe all slot columns
    document.querySelectorAll('.slot-column').forEach(column => {
      observer.observe(column, { 
        attributes: true, 
        attributeFilter: ['class', 'style'],
        subtree: true 
      });
    });
  }
  
  // Initialize patches when DOM is ready
  function initialize() {
    console.log('[POSITION-FIX] Initializing all patches...');
    
    // Apply patches
    patchSimpleSpinAnimation();
    patchAnimationEngine();
    
    // Fix any existing positions
    fixExistingPositions();
    
    // Start monitoring
    monitorAnimations();
    
    // Re-apply patches after a delay (in case scripts load later)
    setTimeout(() => {
      patchSimpleSpinAnimation();
      patchAnimationEngine();
      fixExistingPositions();
    }, 1000);
    
    console.log('[POSITION-FIX] All patches applied');
  }
  
  // Start initialization
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialize);
  } else {
    initialize();
  }
  
  // Also initialize after window load
  window.addEventListener('load', () => {
    setTimeout(initialize, 100);
  });
  
})();