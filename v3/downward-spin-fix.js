/**
 * Downward Spin Fix - Forces all reels to spin downward correctly
 * The key insight: positive movement = content moves down (items scroll up past viewport)
 */

(function() {
  'use strict';
  
  console.log('[DOWNWARD-SPIN] Initializing correct downward spin...');
  
  // Constants
  const ITEM_HEIGHT = 80;
  const VIEWPORT_HEIGHT = 240;
  const ITEMS_PER_COLUMN = 50;
  const TOTAL_HEIGHT = ITEM_HEIGHT * ITEMS_PER_COLUMN; // 4000px
  const WINNER_INDEX = 20;
  const FINAL_POSITION = -(WINNER_INDEX * ITEM_HEIGHT) + (VIEWPORT_HEIGHT - ITEM_HEIGHT); // -1440px
  
  // Animation settings
  const SPIN_SPEED = 35; // pixels per frame
  const SPIN_DURATION = 3000; // ms
  const DECEL_DURATION = 800; // ms
  const REEL_DELAY = 150; // ms between reels
  
  class DownwardSpinAnimation {
    constructor() {
      this.isAnimating = false;
      this.reels = [];
    }
    
    async animateSlotMachine(columns, winners) {
      if (this.isAnimating) return;
      
      this.isAnimating = true;
      console.log('[DOWNWARD-SPIN] Starting animation...');
      
      try {
        // Setup reels
        this.reels = [];
        columns.forEach((column, index) => {
          const itemsEl = column.querySelector('.slot-items');
          if (itemsEl) {
            // Reset to starting position
            itemsEl.style.transform = 'translateY(0)';
            
            this.reels.push({
              element: itemsEl,
              column: column,
              position: 0,
              spinning: true,
              index: index
            });
          }
        });
        
        if (this.reels.length === 0) {
          console.error('[DOWNWARD-SPIN] No reels found');
          return;
        }
        
        // Start spinning all reels
        this.startSpinning();
        
        // Spin for duration
        await this.delay(SPIN_DURATION);
        
        // Stop reels sequentially
        await this.stopReels();
        
        // Highlight winners
        await this.delay(100);
        this.highlightWinners();
        
      } finally {
        this.isAnimating = false;
      }
    }
    
    startSpinning() {
      console.log('[DOWNWARD-SPIN] Starting spin animation...');
      
      const animate = () => {
        let anySpinning = false;
        
        this.reels.forEach(reel => {
          if (!reel.spinning) return;
          
          anySpinning = true;
          reel.column.classList.add('spinning');
          
          // IMPORTANT: Negative translateY = content moves UP = appears to spin DOWN
          // We want items to scroll upward past the viewport (spinning downward)
          reel.position -= SPIN_SPEED;
          
          // Wrap around when we've scrolled a full cycle
          if (reel.position <= -TOTAL_HEIGHT) {
            reel.position += TOTAL_HEIGHT;
          }
          
          // Apply transform
          reel.element.style.transform = `translateY(${reel.position}px)`;
        });
        
        if (anySpinning) {
          requestAnimationFrame(animate);
        }
      };
      
      requestAnimationFrame(animate);
    }
    
    async stopReels() {
      console.log('[DOWNWARD-SPIN] Stopping reels...');
      
      for (let i = 0; i < this.reels.length; i++) {
        await this.stopReel(this.reels[i]);
        if (i < this.reels.length - 1) {
          await this.delay(REEL_DELAY);
        }
      }
    }
    
    stopReel(reel) {
      return new Promise(resolve => {
        reel.spinning = false;
        reel.column.classList.remove('spinning');
        reel.column.classList.add('decelerating');
        
        const startPos = reel.position;
        const targetPos = FINAL_POSITION; // -1440px
        
        // Calculate shortest path to target
        let distance = targetPos - startPos;
        
        // Ensure we spin at least one more cycle
        while (distance > -TOTAL_HEIGHT) {
          distance -= TOTAL_HEIGHT;
        }
        
        const startTime = performance.now();
        
        const decelerate = (currentTime) => {
          const elapsed = currentTime - startTime;
          const progress = Math.min(elapsed / DECEL_DURATION, 1);
          
          // Ease out cubic
          const eased = 1 - Math.pow(1 - progress, 3);
          
          const currentPos = startPos + (distance * eased);
          reel.element.style.transform = `translateY(${currentPos}px)`;
          
          if (progress < 1) {
            requestAnimationFrame(decelerate);
          } else {
            // Snap to exact position
            reel.element.style.transform = `translateY(${targetPos}px)`;
            reel.column.classList.remove('decelerating');
            reel.column.classList.add('complete');
            reel.position = targetPos;
            resolve();
          }
        };
        
        requestAnimationFrame(decelerate);
      });
    }
    
    highlightWinners() {
      console.log('[DOWNWARD-SPIN] Highlighting winners...');
      
      this.reels.forEach(reel => {
        // Clear existing winners
        reel.column.querySelectorAll('.slot-item.winner').forEach(item => {
          item.classList.remove('winner');
        });
        
        // Winner is at index 20
        const items = reel.column.querySelectorAll('.slot-item');
        if (items[WINNER_INDEX]) {
          items[WINNER_INDEX].classList.add('winner');
        }
      });
    }
    
    delay(ms) {
      return new Promise(resolve => setTimeout(resolve, ms));
    }
  }
  
  // Create global instance
  window.DownwardSpinAnimation = DownwardSpinAnimation;
  window.downwardSpin = new DownwardSpinAnimation();
  
  // Override all existing animations
  function overrideAll() {
    console.log('[DOWNWARD-SPIN] Overriding all animation systems...');
    
    // Override SimpleSpinAnimation
    if (typeof SimpleSpinAnimation !== 'undefined') {
      SimpleSpinAnimation.prototype.spin = async function(columns) {
        return window.downwardSpin.animateSlotMachine(columns);
      };
      SimpleSpinAnimation.prototype.animateSlotMachine = async function(columns) {
        return window.downwardSpin.animateSlotMachine(columns);
      };
    }
    
    // Override AnimationEngineV2
    if (typeof AnimationEngineV2 !== 'undefined') {
      const Original = AnimationEngineV2;
      window.AnimationEngineV2 = function(container, winnerIndex, onComplete) {
        return {
          animate: function() {
            const columns = document.querySelectorAll('.slot-column');
            window.downwardSpin.animateSlotMachine(columns);
            if (onComplete) setTimeout(onComplete, 4500);
          },
          cleanup: function() {}
        };
      };
    }
    
    // Override any other animation systems
    if (window.smoothAnimation) {
      window.smoothAnimation.animateSlotMachine = async function(columns) {
        return window.downwardSpin.animateSlotMachine(columns);
      };
    }
    
    if (window.consistentSpinAnimation) {
      window.consistentSpinAnimation.animateSlotMachine = async function(columns) {
        return window.downwardSpin.animateSlotMachine(columns);
      };
    }
  }
  
  // Apply overrides multiple times to catch everything
  overrideAll();
  setTimeout(overrideAll, 100);
  setTimeout(overrideAll, 500);
  setTimeout(overrideAll, 1000);
  setTimeout(overrideAll, 2000);
  
  // Also override on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', overrideAll);
  }
  
  console.log('[DOWNWARD-SPIN] ✅ Downward spin fix ready!');
})();