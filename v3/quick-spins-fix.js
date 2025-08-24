/**
 * Quick Spins Fix - Makes intermediate spins 30% duration
 * Only the final spin takes full time for suspense
 */

(function() {
  'use strict';
  
  console.log('[QUICK-SPINS] Installing quick spins fix...');
  
  // Constants
  const ITEM_HEIGHT = 80;
  const VIEWPORT_HEIGHT = 240;
  const ITEMS_PER_COLUMN = 50;
  const TOTAL_HEIGHT = ITEM_HEIGHT * ITEMS_PER_COLUMN;
  const WINNER_INDEX = 20;
  const TARGET_POSITION = -(WINNER_INDEX * ITEM_HEIGHT) + ITEM_HEIGHT; // -1440px
  
  // Timing - INTERMEDIATE SPINS ARE QUICK
  const QUICK_SPIN_DURATION = 600;    // Very quick for intermediate
  const QUICK_DECEL_DURATION = 200;   // Fast stop
  const FINAL_SPIN_DURATION = 3000;   // Full duration for drama
  const FINAL_DECEL_DURATION = 800;   // Smooth deceleration
  
  class QuickSpinsAnimation {
    constructor() {
      this.isSpinning = false;
      this.animationFrames = [];
    }
    
    async spin(columns, finalPositions, spinCount = 1, currentSpin = 1) {
      if (this.isSpinning) {
        console.warn('[QUICK-SPINS] Already spinning');
        return;
      }
      
      // CRITICAL: Check if this is the final spin
      const isFinalSpin = (currentSpin >= spinCount);
      
      console.log(`[QUICK-SPINS] Spin ${currentSpin}/${spinCount} - ${isFinalSpin ? 'FINAL SPIN (full duration)' : 'QUICK SPIN (30% duration)'}`);
      
      const spinDuration = isFinalSpin ? FINAL_SPIN_DURATION : QUICK_SPIN_DURATION;
      const decelDuration = isFinalSpin ? FINAL_DECEL_DURATION : QUICK_DECEL_DURATION;
      const totalTime = spinDuration + decelDuration;
      
      console.log(`[QUICK-SPINS] Duration: ${totalTime}ms (spin: ${spinDuration}ms, decel: ${decelDuration}ms)`);
      
      this.isSpinning = true;
      
      // Get containers
      const containers = [];
      columns.forEach(col => {
        const container = col.querySelector('.slot-items');
        if (container) {
          containers.push(container);
        }
      });
      
      if (containers.length === 0) {
        console.error('[QUICK-SPINS] No containers found');
        this.isSpinning = false;
        return;
      }
      
      // Animate all reels with appropriate timing
      const promises = containers.map((container, index) => {
        return this.animateReel(container, index, spinDuration, decelDuration, isFinalSpin);
      });
      
      await Promise.all(promises);
      
      // Only highlight on final spin
      if (isFinalSpin) {
        setTimeout(() => {
          this.highlightWinners(columns);
        }, 100);
      }
      
      this.isSpinning = false;
    }
    
    animateReel(container, index, spinDuration, decelDuration, isFinalSpin) {
      return new Promise(resolve => {
        const startTime = performance.now();
        const staggerDelay = isFinalSpin ? (index * 150) : (index * 30); // Less stagger for quick
        const totalSpinTime = spinDuration + staggerDelay;
        
        // Different speeds for quick vs final
        const baseVelocity = isFinalSpin ? 45 : 70; // Much faster for quick spins
        
        // Get current position
        const currentTransform = container.style.transform;
        const match = currentTransform ? currentTransform.match(/translateY\((-?\d+(?:\.\d+)?)px\)/) : null;
        let position = match ? parseFloat(match[1]) : 0;
        
        let lastTime = startTime;
        
        const animate = (currentTime) => {
          const elapsed = currentTime - startTime;
          const deltaTime = currentTime - lastTime;
          lastTime = currentTime;
          
          // Frame rate normalization
          const frameMultiplier = deltaTime / 16.67;
          
          if (elapsed < totalSpinTime) {
            // SPINNING PHASE - constant velocity
            const velocity = baseVelocity * frameMultiplier;
            position -= velocity;
            
            // Wrap around
            if (position <= -TOTAL_HEIGHT) {
              position += TOTAL_HEIGHT;
            }
            
            container.style.transform = `translateY(${Math.round(position)}px)`;
            requestAnimationFrame(animate);
            
          } else if (elapsed < totalSpinTime + decelDuration) {
            // DECELERATION PHASE
            const decelProgress = (elapsed - totalSpinTime) / decelDuration;
            const eased = 1 - Math.pow(1 - decelProgress, 3);
            
            if (isFinalSpin) {
              // Final spin - land exactly at target
              let distanceToTarget = TARGET_POSITION - position;
              while (distanceToTarget > 0) {
                distanceToTarget -= TOTAL_HEIGHT;
              }
              
              const currentPos = position + (distanceToTarget * eased);
              container.style.transform = `translateY(${Math.round(currentPos)}px)`;
            } else {
              // Quick spin - just slow down naturally
              const remainingVelocity = baseVelocity * (1 - eased);
              position -= remainingVelocity * frameMultiplier;
              
              if (position <= -TOTAL_HEIGHT) {
                position += TOTAL_HEIGHT;
              }
              
              container.style.transform = `translateY(${Math.round(position)}px)`;
            }
            
            requestAnimationFrame(animate);
            
          } else {
            // STOP
            if (isFinalSpin) {
              // Final position exactly at target
              container.style.transform = `translateY(${TARGET_POSITION}px)`;
              console.log(`[QUICK-SPINS] Reel ${index} final stop at ${TARGET_POSITION}px`);
            } else {
              // Quick spin stops wherever
              console.log(`[QUICK-SPINS] Reel ${index} quick stop at ${Math.round(position)}px`);
            }
            resolve();
          }
        };
        
        requestAnimationFrame(animate);
      });
    }
    
    highlightWinners(columns) {
      console.log('[QUICK-SPINS] Highlighting winners');
      
      columns.forEach(col => {
        // Clear old winners
        col.querySelectorAll('.slot-item.winner').forEach(item => {
          item.classList.remove('winner');
        });
        
        // Add winner at index 20
        const items = col.querySelectorAll('.slot-item');
        if (items[WINNER_INDEX]) {
          items[WINNER_INDEX].classList.add('winner');
        }
      });
    }
    
    resetAnimation() {
      this.isSpinning = false;
      this.animationFrames.forEach(frame => {
        if (frame) cancelAnimationFrame(frame);
      });
      this.animationFrames = [];
    }
  }
  
  // Override SimpleSpinAnimation
  window.SimpleSpinAnimation = QuickSpinsAnimation;
  
  // Also override any existing instances
  function overrideExisting() {
    // Find and replace any existing animation engines
    if (window.slotMachine && window.slotMachine.animationEngine) {
      console.log('[QUICK-SPINS] Replacing existing animation engine');
      window.slotMachine.animationEngine = new QuickSpinsAnimation();
    }
    
    // Override AnimationEngineV2 as well
    window.AnimationEngineV2 = function(container, winnerIndex, onComplete) {
      const animation = new QuickSpinsAnimation();
      return {
        animate: function() {
          const columns = document.querySelectorAll('.slot-column');
          animation.spin(columns, null, 1, 1).then(() => {
            if (onComplete) setTimeout(onComplete, 100);
          });
        },
        cleanup: function() {
          animation.resetAnimation();
        }
      };
    };
  }
  
  // Apply overrides multiple times
  overrideExisting();
  setTimeout(overrideExisting, 100);
  setTimeout(overrideExisting, 500);
  setTimeout(overrideExisting, 1000);
  
  console.log('[QUICK-SPINS] ✅ Quick spins fix installed!');
  console.log('[QUICK-SPINS] Intermediate spins: 800ms total');
  console.log('[QUICK-SPINS] Final spin: 3800ms total');
})();