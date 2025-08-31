/**
 * Consistent Spin Animation - All reels spin downward
 * Fixes direction inconsistency and ensures smooth animation
 */

(function() {
  'use strict';
  
  console.log('[CONSISTENT-SPIN] Initializing consistent spin animation...');
  
  // Constants matching actual DOM
  const ITEM_HEIGHT = 80;
  const VIEWPORT_HEIGHT = 240;
  const ITEMS_PER_COLUMN = 50;
  const CYCLE_HEIGHT = ITEM_HEIGHT * ITEMS_PER_COLUMN; // 4000px
  const WINNER_INDEX = 20;
  const FINAL_POSITION = -(WINNER_INDEX * ITEM_HEIGHT) + (VIEWPORT_HEIGHT - ITEM_HEIGHT); // -1440px
  
  // Animation settings
  const SPIN_DURATION = 3000; // 3 seconds
  const SPIN_SPEED = 30; // pixels per frame (positive = downward)
  const DECEL_DURATION = 800; // deceleration time
  const REEL_DELAY = 150; // delay between reels stopping
  
  class ConsistentSpinAnimation {
    constructor() {
      this.isAnimating = false;
      this.animationFrames = new Map();
    }
    
    /**
     * Main animation entry point
     */
    async animateSlotMachine(columns, winners) {
      if (this.isAnimating) {
        console.log('[CONSISTENT-SPIN] Already animating');
        return;
      }
      
      this.isAnimating = true;
      console.log('[CONSISTENT-SPIN] Starting animation for', columns.length, 'columns');
      
      try {
        // Setup containers for each column
        const containers = this.setupContainers(columns);
        
        if (containers.length === 0) {
          console.error('[CONSISTENT-SPIN] No containers found');
          return;
        }
        
        // Start all reels spinning downward
        this.startAllReels(containers);
        
        // Let them spin
        await this.delay(SPIN_DURATION);
        
        // Stop each reel sequentially
        await this.stopAllReels(containers);
        
        // Highlight winners
        this.highlightWinners(columns);
        
      } catch (error) {
        console.error('[CONSISTENT-SPIN] Error:', error);
      } finally {
        this.isAnimating = false;
        this.cleanup();
      }
    }
    
    /**
     * Setup container data for each column
     */
    setupContainers(columns) {
      const containers = [];
      
      columns.forEach((column, index) => {
        const itemsContainer = column.querySelector('.slot-items');
        if (itemsContainer) {
          // Ensure we start from a known position
          const currentTransform = itemsContainer.style.transform;
          let startPos = 0;
          
          if (currentTransform) {
            const match = currentTransform.match(/translateY\((-?\d+(?:\.\d+)?)px\)/);
            if (match) {
              startPos = parseFloat(match[1]);
            }
          }
          
          containers.push({
            element: itemsContainer,
            column: column,
            position: startPos,
            velocity: 0,
            isSpinning: false,
            targetPosition: FINAL_POSITION,
            index: index
          });
        }
      });
      
      return containers;
    }
    
    /**
     * Start all reels spinning in the same direction (downward)
     */
    startAllReels(containers) {
      console.log('[CONSISTENT-SPIN] Starting all reels...');
      
      containers.forEach(container => {
        container.isSpinning = true;
        container.column.classList.add('spinning');
        container.column.classList.remove('complete', 'decelerating');
        
        // Animation loop for this container
        const animate = (timestamp) => {
          if (!container.isSpinning) return;
          
          // Move downward (negative translateY = upward movement of content = downward scroll)
          container.position -= SPIN_SPEED;
          
          // Wrap around when we go too far
          if (container.position < -CYCLE_HEIGHT) {
            container.position += CYCLE_HEIGHT;
          }
          
          // Apply transform
          container.element.style.transform = `translateY(${container.position}px)`;
          
          // Continue animation
          const frameId = requestAnimationFrame(animate);
          this.animationFrames.set(container.index, frameId);
        };
        
        // Start animation for this reel
        const frameId = requestAnimationFrame(animate);
        this.animationFrames.set(container.index, frameId);
      });
    }
    
    /**
     * Stop all reels with sequential timing
     */
    async stopAllReels(containers) {
      console.log('[CONSISTENT-SPIN] Stopping reels sequentially...');
      
      for (let i = 0; i < containers.length; i++) {
        await this.stopSingleReel(containers[i]);
        
        // Delay before stopping next reel (except last one)
        if (i < containers.length - 1) {
          await this.delay(REEL_DELAY);
        }
      }
    }
    
    /**
     * Stop a single reel with smooth deceleration
     */
    stopSingleReel(container) {
      return new Promise(resolve => {
        // Stop the spinning loop
        container.isSpinning = false;
        const frameId = this.animationFrames.get(container.index);
        if (frameId) {
          cancelAnimationFrame(frameId);
          this.animationFrames.delete(container.index);
        }
        
        // Update classes
        container.column.classList.remove('spinning');
        container.column.classList.add('decelerating');
        
        // Calculate distance to target
        const startPos = container.position;
        const targetPos = container.targetPosition;
        
        // Ensure we're moving to the nearest target position
        // by calculating how many full cycles to add
        let distance = targetPos - startPos;
        
        // Always move at least one full cycle for effect
        while (distance > -CYCLE_HEIGHT) {
          distance -= CYCLE_HEIGHT;
        }
        
        // Animate to final position
        const startTime = performance.now();
        
        const decelerate = (currentTime) => {
          const elapsed = currentTime - startTime;
          const progress = Math.min(elapsed / DECEL_DURATION, 1);
          
          // Ease-out cubic for smooth deceleration
          const eased = 1 - Math.pow(1 - progress, 3);
          
          // Calculate current position
          const currentPos = startPos + (distance * eased);
          container.element.style.transform = `translateY(${currentPos}px)`;
          
          if (progress < 1) {
            requestAnimationFrame(decelerate);
          } else {
            // Snap to exact final position
            container.element.style.transform = `translateY(${targetPos}px)`;
            container.column.classList.remove('decelerating');
            container.column.classList.add('complete');
            container.position = targetPos;
            resolve();
          }
        };
        
        requestAnimationFrame(decelerate);
      });
    }
    
    /**
     * Highlight winning items
     */
    highlightWinners(columns) {
      console.log('[CONSISTENT-SPIN] Highlighting winners...');
      
      columns.forEach(column => {
        // Remove any existing winner classes
        column.querySelectorAll('.slot-item.winner').forEach(item => {
          item.classList.remove('winner');
        });
        
        // Add winner class to item at index 20
        const items = column.querySelectorAll('.slot-item');
        if (items[WINNER_INDEX]) {
          setTimeout(() => {
            items[WINNER_INDEX].classList.add('winner');
          }, 100);
        }
      });
    }
    
    /**
     * Utility delay function
     */
    delay(ms) {
      return new Promise(resolve => setTimeout(resolve, ms));
    }
    
    /**
     * Cleanup any running animations
     */
    cleanup() {
      this.animationFrames.forEach(frameId => {
        cancelAnimationFrame(frameId);
      });
      this.animationFrames.clear();
    }
  }
  
  // Create and expose global instance
  window.ConsistentSpinAnimation = ConsistentSpinAnimation;
  window.consistentSpinAnimation = new ConsistentSpinAnimation();
  
  // Override existing animation systems
  function overrideAnimations() {
    console.log('[CONSISTENT-SPIN] Overriding existing animations...');
    
    // Override SimpleSpinAnimation
    if (typeof SimpleSpinAnimation !== 'undefined') {
      const proto = SimpleSpinAnimation.prototype;
      const originalSpin = proto.spin;
      
      proto.spin = async function(columns, finalPositions, spinCount, currentSpin) {
        console.log('[CONSISTENT-SPIN] Intercepted SimpleSpinAnimation.spin');
        return window.consistentSpinAnimation.animateSlotMachine(columns, finalPositions);
      };
      
      proto.animateSlotMachine = async function(columns, scrollContents, predeterminedResults) {
        console.log('[CONSISTENT-SPIN] Intercepted SimpleSpinAnimation.animateSlotMachine');
        return window.consistentSpinAnimation.animateSlotMachine(columns, predeterminedResults);
      };
    }
    
    // Override AnimationEngineV2
    if (typeof AnimationEngineV2 !== 'undefined') {
      const OriginalEngine = AnimationEngineV2;
      
      window.AnimationEngineV2 = function(container, winnerIndex, onComplete) {
        console.log('[CONSISTENT-SPIN] Intercepted AnimationEngineV2');
        
        return {
          animate: function() {
            const column = container.closest('.slot-column');
            if (column) {
              // Find all columns to animate them together
              const allColumns = document.querySelectorAll('.slot-column');
              window.consistentSpinAnimation.animateSlotMachine(allColumns, [winnerIndex]);
            }
            if (onComplete) {
              setTimeout(onComplete, SPIN_DURATION + DECEL_DURATION + 500);
            }
          },
          cleanup: function() {
            window.consistentSpinAnimation.cleanup();
          }
        };
      };
      
      // Copy prototype if needed
      window.AnimationEngineV2.prototype = OriginalEngine.prototype;
    }
    
    // Override SmoothSpinAnimation if it exists
    if (window.smoothAnimation) {
      window.smoothAnimation.animateSlotMachine = async function(columns, winners) {
        console.log('[CONSISTENT-SPIN] Intercepted smoothAnimation');
        return window.consistentSpinAnimation.animateSlotMachine(columns, winners);
      };
    }
  }
  
  // Apply overrides
  overrideAnimations();
  
  // Reapply after DOM ready and delays
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', overrideAnimations);
  }
  
  setTimeout(overrideAnimations, 1000);
  setTimeout(overrideAnimations, 2000);
  
  console.log('[CONSISTENT-SPIN] ✅ Consistent spin animation ready!');
  
  // Cleanup on page unload
  window.addEventListener('beforeunload', () => {
    if (window.consistentSpinAnimation) {
      window.consistentSpinAnimation.cleanup();
    }
  });
  
})();