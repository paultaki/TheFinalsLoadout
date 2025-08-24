/**
 * Smooth Animation Engine - Simple and Working
 * This replaces all the complex, conflicting animation systems
 */

(function() {
  'use strict';
  
  console.log('[SMOOTH-ANIMATION] Initializing smooth animation engine...');
  
  // Constants - matching actual DOM
  const ITEM_HEIGHT = 80;
  const VIEWPORT_HEIGHT = 240;
  const ITEMS_PER_COLUMN = 50;
  const TOTAL_HEIGHT = ITEM_HEIGHT * ITEMS_PER_COLUMN;
  const WINNER_INDEX = 20;
  const FINAL_POSITION = -(WINNER_INDEX * ITEM_HEIGHT) + (VIEWPORT_HEIGHT - ITEM_HEIGHT); // -1440px
  
  // Animation settings
  const SPIN_DURATION = 3000; // 3 seconds of spinning
  const REEL_DELAY = 200; // Delay between each reel stopping
  const SPIN_SPEED = 20; // Pixels per frame during spin
  
  class SmoothSpinAnimation {
    constructor() {
      this.isAnimating = false;
      this.animationFrames = [];
    }
    
    /**
     * Main animation function - actually spins the reels smoothly
     */
    async animateSlotMachine(columns, winners) {
      if (this.isAnimating) {
        console.log('[SMOOTH-ANIMATION] Already animating, skipping...');
        return;
      }
      
      this.isAnimating = true;
      console.log('[SMOOTH-ANIMATION] Starting smooth animation with winners:', winners);
      
      try {
        // Get all slot item containers
        const containers = [];
        columns.forEach(column => {
          const container = column.querySelector('.slot-items');
          if (container) {
            containers.push({
              element: container,
              column: column,
              position: 0,
              targetPosition: FINAL_POSITION,
              isSpinning: true,
              velocity: 0
            });
          }
        });
        
        if (containers.length === 0) {
          console.error('[SMOOTH-ANIMATION] No containers found!');
          this.isAnimating = false;
          return;
        }
        
        // Phase 1: Start all reels spinning
        console.log('[SMOOTH-ANIMATION] Phase 1: Starting spin...');
        this.startSpinning(containers);
        
        // Phase 2: Let them spin for the duration
        await this.delay(SPIN_DURATION);
        
        // Phase 3: Stop each reel sequentially
        console.log('[SMOOTH-ANIMATION] Phase 3: Stopping reels...');
        await this.stopReelsSequentially(containers);
        
        // Phase 4: Highlight winners
        console.log('[SMOOTH-ANIMATION] Phase 4: Highlighting winners...');
        this.highlightWinners(columns);
        
      } catch (error) {
        console.error('[SMOOTH-ANIMATION] Animation error:', error);
      } finally {
        this.isAnimating = false;
      }
    }
    
    /**
     * Start spinning animation for all reels
     */
    startSpinning(containers) {
      containers.forEach((container, index) => {
        // Add spinning class for visual effects
        container.column.classList.add('spinning');
        
        // Start animation loop for this container
        const animate = () => {
          if (!container.isSpinning) return;
          
          // Move the reel down continuously
          container.position += SPIN_SPEED;
          
          // Wrap around when we reach the end
          if (container.position > 0) {
            container.position -= TOTAL_HEIGHT;
          }
          
          // Apply transform
          container.element.style.transform = `translateY(${container.position}px)`;
          
          // Continue animation
          container.frameId = requestAnimationFrame(animate);
        };
        
        // Start the animation
        container.frameId = requestAnimationFrame(animate);
        this.animationFrames.push(container.frameId);
      });
    }
    
    /**
     * Stop reels one by one with stagger
     */
    async stopReelsSequentially(containers) {
      for (let i = 0; i < containers.length; i++) {
        await this.stopReel(containers[i]);
        if (i < containers.length - 1) {
          await this.delay(REEL_DELAY);
        }
      }
    }
    
    /**
     * Stop a single reel with deceleration
     */
    async stopReel(container) {
      return new Promise(resolve => {
        container.isSpinning = false;
        container.column.classList.remove('spinning');
        container.column.classList.add('decelerating');
        
        // Cancel the spinning animation
        if (container.frameId) {
          cancelAnimationFrame(container.frameId);
        }
        
        // Animate to final position with easing
        const startPosition = container.position;
        const targetPosition = container.targetPosition;
        const distance = targetPosition - startPosition;
        const duration = 800; // ms for deceleration
        const startTime = performance.now();
        
        const animateToFinal = (currentTime) => {
          const elapsed = currentTime - startTime;
          const progress = Math.min(elapsed / duration, 1);
          
          // Easing function (ease-out-cubic)
          const eased = 1 - Math.pow(1 - progress, 3);
          
          // Calculate current position
          const currentPosition = startPosition + (distance * eased);
          container.element.style.transform = `translateY(${currentPosition}px)`;
          
          if (progress < 1) {
            requestAnimationFrame(animateToFinal);
          } else {
            // Ensure exact final position
            container.element.style.transform = `translateY(${targetPosition}px)`;
            container.column.classList.remove('decelerating');
            container.column.classList.add('complete');
            resolve();
          }
        };
        
        requestAnimationFrame(animateToFinal);
      });
    }
    
    /**
     * Highlight the winning items
     */
    highlightWinners(columns) {
      columns.forEach(column => {
        const items = column.querySelectorAll('.slot-item');
        // Winner is at index 20 (21st item)
        if (items[WINNER_INDEX]) {
          items[WINNER_INDEX].classList.add('winner');
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
     * Clean up any running animations
     */
    cleanup() {
      this.animationFrames.forEach(frameId => {
        cancelAnimationFrame(frameId);
      });
      this.animationFrames = [];
      this.isAnimating = false;
    }
  }
  
  // Create global instance
  window.SmoothSpinAnimation = SmoothSpinAnimation;
  window.smoothAnimation = new SmoothSpinAnimation();
  
  // Override the existing animation calls
  function overrideAnimations() {
    // Override SimpleSpinAnimation if it exists
    if (typeof SimpleSpinAnimation !== 'undefined') {
      console.log('[SMOOTH-ANIMATION] Overriding SimpleSpinAnimation...');
      
      const originalProto = SimpleSpinAnimation.prototype;
      originalProto.spin = async function(columns, finalPositions, spinCount, currentSpin) {
        console.log('[SMOOTH-ANIMATION] Intercepted spin call, using smooth animation');
        return window.smoothAnimation.animateSlotMachine(columns, finalPositions);
      };
      
      originalProto.animateSlotMachine = async function(columns, scrollContents, predeterminedResults) {
        console.log('[SMOOTH-ANIMATION] Intercepted animateSlotMachine call');
        return window.smoothAnimation.animateSlotMachine(columns, predeterminedResults);
      };
    }
    
    // Override AnimationEngineV2 if it exists
    if (typeof AnimationEngineV2 !== 'undefined') {
      console.log('[SMOOTH-ANIMATION] Overriding AnimationEngineV2...');
      
      const OriginalEngine = AnimationEngineV2;
      window.AnimationEngineV2 = function(container, winnerIndex, onComplete) {
        console.log('[SMOOTH-ANIMATION] AnimationEngineV2 intercepted, using smooth animation');
        
        // Return a mock object that uses our smooth animation
        return {
          animate: function() {
            const column = container.closest('.slot-column');
            if (column) {
              const columns = [column];
              window.smoothAnimation.animateSlotMachine(columns, [winnerIndex]);
            }
            if (onComplete) {
              setTimeout(onComplete, 4000);
            }
          },
          cleanup: function() {
            window.smoothAnimation.cleanup();
          }
        };
      };
    }
  }
  
  // Apply overrides immediately and after DOM ready
  overrideAnimations();
  
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', overrideAnimations);
  }
  
  // Also override after a delay to catch late-loading scripts
  setTimeout(overrideAnimations, 1000);
  setTimeout(overrideAnimations, 2000);
  
  console.log('[SMOOTH-ANIMATION] ✅ Smooth animation engine ready!');
  
  // Add cleanup on page unload
  window.addEventListener('beforeunload', () => {
    if (window.smoothAnimation) {
      window.smoothAnimation.cleanup();
    }
  });
  
})();