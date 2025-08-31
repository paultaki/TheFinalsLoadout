/**
 * Complete Solution for The Finals Loadout Generator v3
 * Handles spin selection, class selection, and random generation
 */

(function() {
  'use strict';
  
  // Wait for DOM ready
  function ready(fn) {
    if (document.readyState !== 'loading') {
      fn();
    } else {
      document.addEventListener('DOMContentLoaded', fn);
    }
  }
  
  ready(function() {
    console.log('🎮 Initializing complete solution...');
    
    // State management
    let selectedSpins = null;
    let selectedClass = null;
    let isAnimating = false;
    
    // Setup random all button
    const randomAllBtn = document.getElementById('random-all-btn');
    if (randomAllBtn) {
      randomAllBtn.addEventListener('click', async function(e) {
        e.preventDefault();
        if (isAnimating) return;
        isAnimating = true;
        
        console.log('🎲 Random everything triggered!');
        
        // Animate spin selection
        const spinButtons = document.querySelectorAll('.spin-btn');
        let cycles = 15;
        let delay = 50;
        
        for (let i = 0; i < cycles; i++) {
          spinButtons.forEach(b => b.classList.remove('active'));
          const index = i % spinButtons.length;
          spinButtons[index].classList.add('active');
          
          if (i > cycles - 5) delay += 50;
          await sleep(delay);
        }
        
        // Final spin selection
        selectedSpins = Math.floor(Math.random() * 4) + 2; // 2-5 spins
        spinButtons.forEach(b => b.classList.remove('active'));
        const finalSpinBtn = document.querySelector(`.spin-btn[data-spins="${selectedSpins}"]`);
        if (finalSpinBtn) finalSpinBtn.classList.add('active');
        
        // Short pause
        await sleep(300);
        
        // Animate class selection
        const classButtons = document.querySelectorAll('.class-btn');
        cycles = 12;
        delay = 60;
        
        for (let i = 0; i < cycles; i++) {
          classButtons.forEach(b => b.classList.remove('active'));
          const index = i % classButtons.length;
          classButtons[index].classList.add('active');
          
          if (i > cycles - 4) delay += 60;
          await sleep(delay);
        }
        
        // Final class selection
        const classes = ['light', 'medium', 'heavy'];
        selectedClass = classes[Math.floor(Math.random() * classes.length)];
        classButtons.forEach(b => b.classList.remove('active'));
        const finalClassBtn = document.querySelector(`.class-btn[data-class="${selectedClass}"]`);
        if (finalClassBtn) finalClassBtn.classList.add('active');
        
        console.log(`📊 Random selection: ${selectedSpins} spins, ${selectedClass} class`);
        
        isAnimating = false;
        updateAppState();
        checkAutoStart();
      });
    }
    
    // Setup spin selection
    const spinButtons = document.querySelectorAll('.spin-btn');
    spinButtons.forEach(btn => {
      btn.addEventListener('click', function(e) {
        e.preventDefault();
        
        // Direct selection
        spinButtons.forEach(b => b.classList.remove('active'));
        this.classList.add('active');
        selectedSpins = parseInt(this.dataset.spins);
        
        console.log(`📊 Spins selected: ${selectedSpins}`);
        checkAutoStart();
      });
    });
    
    // Setup class selection
    const classButtons = document.querySelectorAll('.class-btn');
    classButtons.forEach(btn => {
      btn.addEventListener('click', function(e) {
        e.preventDefault();
        
        // Direct selection only (no random button on individual classes)
        classButtons.forEach(b => b.classList.remove('active'));
        this.classList.add('active');
        selectedClass = this.dataset.class;
        
        console.log(`🎯 Class selected: ${selectedClass}`);
        
        // Update app state
        updateAppState();
        checkAutoStart();
      });
    });
    
    // Update generate button text
    function updateGenerateButton() {
      const generateBtn = document.getElementById('generate-btn');
      if (!generateBtn) return;
      
      if (selectedSpins && selectedClass) {
        generateBtn.disabled = false;
        generateBtn.textContent = `GENERATE ${selectedSpins} SPIN${selectedSpins > 1 ? 'S' : ''} - ${selectedClass.toUpperCase()}`;
      } else if (!selectedSpins && !selectedClass) {
        generateBtn.disabled = true;
        generateBtn.textContent = 'SELECT OPTIONS ABOVE';
      } else if (!selectedSpins) {
        generateBtn.disabled = true;
        generateBtn.textContent = 'SELECT NUMBER OF SPINS';
      } else {
        generateBtn.disabled = true;
        generateBtn.textContent = 'SELECT YOUR CLASS';
      }
    }
    
    // Monitor button state
    setInterval(updateGenerateButton, 100);
    
    // Get app reference
    function getApp() {
      return window.FinalsLoadoutApp || window.app;
    }
    
    // Update app state
    function updateAppState() {
      const app = getApp();
      if (app && app.stateManager && selectedClass) {
        // Capitalize first letter for state (Light, Medium, Heavy)
        const className = selectedClass.charAt(0).toUpperCase() + selectedClass.slice(1);
        app.stateManager.state.selectedClass = className;
        console.log(`✅ App state updated: ${className}`);
      }
    }
    
    // Check for auto-start
    function checkAutoStart() {
      if (selectedSpins && selectedClass && !isAnimating) {
        console.log('🚀 Auto-starting slot machine...');
        setTimeout(startSlotMachine, 500);
      }
    }
    
    // Start slot machine
    async function startSlotMachine() {
      const generateBtn = document.getElementById('generate-btn');
      const app = getApp();
      
      // Check if app is ready - wait if not
      if (!app || !app.uiController || !app.slotMachine) {
        console.log('App not ready, waiting...');
        setTimeout(() => startSlotMachine(), 500);
        return;
      }
      
      if (generateBtn) {
        generateBtn.disabled = true;
        generateBtn.textContent = 'GENERATING...';
      }
      
      try {
        // Ensure class is set in app state
        updateAppState();
        
        // Use proper capitalized class name for GameData
        const className = selectedClass.charAt(0).toUpperCase() + selectedClass.slice(1);
        
        console.log(`Starting slot machine: ${selectedSpins} spins, ${className} class`);
        
        // Check if createRandomLoadout exists
        if (!app.uiController.createRandomLoadout) {
          console.error('createRandomLoadout method not found');
          // Try direct generation as fallback
          await app.uiController.generateLoadout();
          return;
        }
        
        // Generate loadout
        const loadout = app.uiController.createRandomLoadout(className);
        
        // Show slot machine
        const slotContainer = document.getElementById('slot-machine-container');
        if (slotContainer) {
          slotContainer.style.display = 'block';
          slotContainer.scrollIntoView({ behavior: 'smooth' });
        }
        
        // Check if spin method exists
        if (!app.slotMachine || !app.slotMachine.spin) {
          console.error('Slot machine spin method not found');
          // Try triggering generate button directly
          await app.uiController.generateLoadout();
          return;
        }
        
        // Run spins
        for (let i = 1; i <= selectedSpins; i++) {
          await app.slotMachine.spin(loadout, i, selectedSpins);
          if (i < selectedSpins) {
            await sleep(200);
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
        console.error('Failed to generate loadout:', error);
      } finally {
        if (generateBtn) {
          generateBtn.disabled = false;
          updateGenerateButton();
        }
      }
    }
    
    // Handle generate button click
    const generateBtn = document.getElementById('generate-btn');
    if (generateBtn) {
      generateBtn.addEventListener('click', function(e) {
        e.preventDefault();
        if (selectedSpins && selectedClass) {
          startSlotMachine();
        }
      });
    }
    
    // Sleep helper
    function sleep(ms) {
      return new Promise(resolve => setTimeout(resolve, ms));
    }
    
    console.log('✅ Complete solution ready!');
  });
})();