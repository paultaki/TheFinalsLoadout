/**
 * Enhanced App Controller for The Finals Loadout Generator v3
 * Integrates spin selection, class selection with random options, and auto-start
 */

(function() {
  'use strict';
  
  class EnhancedController {
    constructor() {
      this.selectedSpins = null;
      this.selectedClass = null;
      this.isAnimating = false;
      
      // Wait for app to be ready
      this.waitForApp();
    }
    
    waitForApp() {
      const checkApp = () => {
        if (typeof app !== 'undefined' && app && app.uiController) {
          console.log('✅ Enhanced controller initializing...');
          this.initialize();
        } else {
          setTimeout(checkApp, 100);
        }
      };
      checkApp();
    }
    
    initialize() {
      this.setupSpinSelection();
      this.setupClassSelection();
      this.updateGenerateButton();
      console.log('🎮 Enhanced controls ready!');
    }
    
    setupSpinSelection() {
      const spinButtons = document.querySelectorAll('.spin-btn');
      
      spinButtons.forEach(btn => {
        btn.addEventListener('click', async (e) => {
          e.preventDefault();
          
          const spins = btn.dataset.spins;
          
          if (spins === 'random') {
            // Animate random spin selection
            await this.animateRandomSpinSelection();
          } else {
            // Direct selection
            this.selectSpins(parseInt(spins));
          }
        });
      });
    }
    
    selectSpins(count) {
      // Remove active from all spin buttons
      document.querySelectorAll('.spin-btn').forEach(b => b.classList.remove('active'));
      
      // Add active to selected
      const btn = document.querySelector(`.spin-btn[data-spins="${count}"]`);
      if (btn) {
        btn.classList.add('active');
        this.selectedSpins = count;
        console.log(`📊 Spins selected: ${count}`);
        this.checkAutoStart();
      }
    }
    
    async animateRandomSpinSelection() {
      if (this.isAnimating) return;
      this.isAnimating = true;
      
      const spinButtons = document.querySelectorAll('.spin-btn:not(.random-spin)');
      const randomBtn = document.querySelector('.spin-btn.random-spin');
      randomBtn.classList.add('active');
      
      // Cycling animation
      let cycles = 15;
      let delay = 50;
      
      for (let i = 0; i < cycles; i++) {
        // Remove all active states
        spinButtons.forEach(b => b.classList.remove('active'));
        
        // Highlight current
        const index = i % spinButtons.length;
        spinButtons[index].classList.add('active');
        
        // Gradually slow down
        if (i > cycles - 5) {
          delay += 50;
        }
        
        await this.sleep(delay);
      }
      
      // Final selection
      const finalCount = Math.floor(Math.random() * 4) + 2; // 2-5 spins
      this.selectSpins(finalCount);
      
      // Remove active from random button after animation
      setTimeout(() => {
        randomBtn.classList.remove('active');
      }, 500);
      
      this.isAnimating = false;
    }
    
    setupClassSelection() {
      const classButtons = document.querySelectorAll('.class-btn');
      
      classButtons.forEach(btn => {
        btn.addEventListener('click', async (e) => {
          e.preventDefault();
          
          const classType = btn.dataset.class;
          
          if (classType === 'random') {
            // Animate random class selection
            await this.animateRandomClassSelection();
          } else {
            // Direct selection
            this.selectClass(classType);
          }
        });
      });
    }
    
    selectClass(classType) {
      // Remove active from all class buttons
      document.querySelectorAll('.class-btn').forEach(b => b.classList.remove('active'));
      
      // Add active to selected
      const btn = document.querySelector(`.class-btn[data-class="${classType}"]`);
      if (btn) {
        btn.classList.add('active');
        this.selectedClass = classType;
        
        // Update app state
        if (app && app.stateManager) {
          const className = classType.charAt(0).toUpperCase() + classType.slice(1);
          app.stateManager.state.selectedClass = className;
        }
        
        console.log(`🎯 Class selected: ${classType}`);
        this.checkAutoStart();
      }
    }
    
    async animateRandomClassSelection() {
      if (this.isAnimating) return;
      this.isAnimating = true;
      
      const classButtons = document.querySelectorAll('.class-btn:not(.random-class)');
      const randomBtn = document.querySelector('.class-btn.random-class');
      randomBtn.classList.add('active');
      
      // Cycling animation
      let cycles = 12;
      let delay = 60;
      
      for (let i = 0; i < cycles; i++) {
        // Remove all active states
        classButtons.forEach(b => b.classList.remove('active'));
        
        // Highlight current
        const index = i % classButtons.length;
        classButtons[index].classList.add('active');
        
        // Gradually slow down
        if (i > cycles - 4) {
          delay += 60;
        }
        
        await this.sleep(delay);
      }
      
      // Final selection
      const classes = ['light', 'medium', 'heavy'];
      const finalClass = classes[Math.floor(Math.random() * classes.length)];
      this.selectClass(finalClass);
      
      // Remove active from random button after animation
      setTimeout(() => {
        randomBtn.classList.remove('active');
      }, 500);
      
      this.isAnimating = false;
    }
    
    updateGenerateButton() {
      const generateBtn = document.getElementById('generate-btn');
      if (!generateBtn) return;
      
      // Update button state based on selections
      const updateBtn = () => {
        if (this.selectedSpins && this.selectedClass) {
          generateBtn.disabled = false;
          generateBtn.textContent = `GENERATE ${this.selectedSpins} SPIN${this.selectedSpins > 1 ? 'S' : ''} - ${this.selectedClass.toUpperCase()}`;
        } else if (!this.selectedSpins && !this.selectedClass) {
          generateBtn.disabled = true;
          generateBtn.textContent = 'SELECT OPTIONS ABOVE';
        } else if (!this.selectedSpins) {
          generateBtn.disabled = true;
          generateBtn.textContent = 'SELECT NUMBER OF SPINS';
        } else {
          generateBtn.disabled = true;
          generateBtn.textContent = 'SELECT YOUR CLASS';
        }
      };
      
      // Monitor for changes
      setInterval(updateBtn, 100);
      
      // Handle generate button click
      generateBtn.addEventListener('click', (e) => {
        if (this.selectedSpins && this.selectedClass) {
          this.startSlotMachine();
        }
      });
    }
    
    checkAutoStart() {
      // Auto-start if both selections are made
      if (this.selectedSpins && this.selectedClass && !this.isAnimating) {
        setTimeout(() => {
          if (this.selectedSpins && this.selectedClass) {
            console.log('🚀 Auto-starting slot machine...');
            this.startSlotMachine();
          }
        }, 500); // Small delay for user to see selections
      }
    }
    
    async startSlotMachine() {
      if (!app || !app.uiController) return;
      
      const generateBtn = document.getElementById('generate-btn');
      if (generateBtn) {
        generateBtn.disabled = true;
        generateBtn.textContent = 'GENERATING...';
      }
      
      try {
        // Set the selected class
        if (app.stateManager) {
          const className = this.selectedClass.charAt(0).toUpperCase() + this.selectedClass.slice(1);
          app.stateManager.state.selectedClass = className;
        }
        
        // Generate loadout
        const loadout = app.uiController.createRandomLoadout(
          this.selectedClass.charAt(0).toUpperCase() + this.selectedClass.slice(1)
        );
        
        // Show slot machine container
        const slotContainer = document.getElementById('slot-machine-container');
        if (slotContainer) {
          slotContainer.style.display = 'block';
          slotContainer.scrollIntoView({ behavior: 'smooth' });
        }
        
        // Run the spin sequence with selected number of spins
        for (let i = 1; i <= this.selectedSpins; i++) {
          await app.slotMachine.spin(loadout, i, this.selectedSpins);
          
          // Small delay between spins except for the last one
          if (i < this.selectedSpins) {
            await this.sleep(200);
          }
        }
        
        // Add to history
        if (app.uiController.historyManager) {
          app.uiController.historyManager.addEntry(loadout);
        }
        
        // Show spin again button
        const spinAgainBtn = document.getElementById('spin-again-btn');
        if (spinAgainBtn) {
          spinAgainBtn.style.display = 'inline-block';
        }
        
      } catch (error) {
        console.error('Failed to start slot machine:', error);
      } finally {
        // Reset button
        if (generateBtn) {
          generateBtn.disabled = false;
          generateBtn.textContent = `GENERATE ${this.selectedSpins} SPIN${this.selectedSpins > 1 ? 'S' : ''} - ${this.selectedClass.toUpperCase()}`;
        }
      }
    }
    
    sleep(ms) {
      return new Promise(resolve => setTimeout(resolve, ms));
    }
  }
  
  // Initialize enhanced controller when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      window.enhancedController = new EnhancedController();
    });
  } else {
    window.enhancedController = new EnhancedController();
  }
})();