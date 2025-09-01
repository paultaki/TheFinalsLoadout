/**
 * Premium Integrated Slot Machine
 * Connects the premium UI with the actual slot machine functionality
 */

(function() {
  'use strict';
  
  class PremiumIntegratedSlotMachine {
    constructor() {
      this.selectedSpins = null;
      this.selectedClass = null;
      this.isAnimating = false;
      this.currentLoadout = null;
      this.init();
    }
    
    init() {
      // Wait for app to be ready
      this.waitForApp();
    }
    
    waitForApp() {
      const checkApp = () => {
        const app = window.app || window.FinalsLoadoutApp;
        if (app && app.slotMachine) {
          console.log('✅ Premium integration ready!');
          this.app = app;
          this.setupEventListeners();
          this.setupSlotMachine();
        } else {
          console.log('Waiting for app...');
          setTimeout(checkApp, 500);
        }
      };
      checkApp();
    }
    
    setupSlotMachine() {
      // Make sure slot machine container exists
      if (!document.getElementById('slot-machine-container')) {
        // Create the actual slot machine container for the app to use
        const container = document.createElement('div');
        container.id = 'slot-machine-container';
        container.style.display = 'none';
        document.body.appendChild(container);
      }
      
      // Initialize slot columns in premium display
      this.setupPremiumColumns();
    }
    
    setupPremiumColumns() {
      const container = document.getElementById('premiumSlotColumns');
      if (!container) {
        console.error('Premium slot columns container not found!');
        return;
      }
      
      console.log('Setting up premium columns...');
      container.innerHTML = '';
      const columns = ['WEAPON', 'SPECIALIZATION', 'GADGET 1', 'GADGET 2', 'GADGET 3'];
      
      columns.forEach((col, index) => {
        const column = document.createElement('div');
        column.className = 'slot-column';
        column.dataset.type = col.toLowerCase().replace(/\s+/g, '');
        column.innerHTML = `
          <div class="column-header">${col}</div>
          <div class="slot-window" data-column="${index}">
            <div class="slot-items" id="premium-items-${index}"></div>
          </div>
        `;
        container.appendChild(column);
      });
      
      console.log(`Created ${columns.length} slot columns`);
    }
    
    setupEventListeners() {
      // Random All Button
      const randomBtn = document.getElementById('randomAllBtn');
      if (randomBtn) {
        randomBtn.addEventListener('click', () => this.randomizeEverything());
      }
      
      // Spin Buttons
      document.querySelectorAll('.spin-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          this.selectSpins(parseInt(btn.dataset.spins));
          this.checkAutoStart();
        });
      });
      
      // Class Buttons
      document.querySelectorAll('.class-btn-premium').forEach(btn => {
        btn.addEventListener('click', () => {
          this.selectClass(btn.dataset.class);
          this.checkAutoStart();
        });
      });
      
      // Generate Button
      const generateBtn = document.getElementById('generateBtn');
      if (generateBtn) {
        generateBtn.addEventListener('click', () => this.startSlotMachine());
      }
    }
    
    selectSpins(count) {
      document.querySelectorAll('.spin-btn').forEach(b => b.classList.remove('active'));
      const btn = document.querySelector(`.spin-btn[data-spins="${count}"]`);
      if (btn) {
        btn.classList.add('active');
        this.selectedSpins = count;
        this.updateGenerateButton();
        console.log(`Spins selected: ${count}`);
      }
    }
    
    selectClass(classType) {
      document.querySelectorAll('.class-btn-premium').forEach(b => b.classList.remove('active'));
      const btn = document.querySelector(`.class-btn-premium[data-class="${classType}"]`);
      if (btn) {
        btn.classList.add('active');
        this.selectedClass = classType;
        this.updateAppState();
        this.updateGenerateButton();
        console.log(`Class selected: ${classType}`);
      }
    }
    
    updateAppState() {
      if (this.app && this.app.stateManager && this.selectedClass) {
        const className = this.selectedClass.charAt(0).toUpperCase() + this.selectedClass.slice(1);
        this.app.stateManager.state.selectedClass = className;
      }
    }
    
    async randomizeEverything() {
      if (this.isAnimating) return;
      this.isAnimating = true;
      
      // Animate spin selection
      const spinBtns = document.querySelectorAll('.spin-btn');
      for (let i = 0; i < 15; i++) {
        spinBtns.forEach(b => b.classList.remove('active'));
        spinBtns[i % spinBtns.length].classList.add('active');
        await this.sleep(50 + (i > 10 ? i * 10 : 0));
      }
      const finalSpin = Math.floor(Math.random() * 4) + 2; // 2-5
      this.selectSpins(finalSpin);
      
      await this.sleep(300);
      
      // Animate class selection
      const classBtns = document.querySelectorAll('.class-btn-premium');
      for (let i = 0; i < 12; i++) {
        classBtns.forEach(b => b.classList.remove('active'));
        classBtns[i % classBtns.length].classList.add('active');
        await this.sleep(60 + (i > 8 ? i * 15 : 0));
      }
      const classes = ['light', 'medium', 'heavy'];
      const finalClass = classes[Math.floor(Math.random() * 3)];
      this.selectClass(finalClass);
      
      this.isAnimating = false;
      
      // Auto-start
      setTimeout(() => this.startSlotMachine(), 500);
    }
    
    updateGenerateButton() {
      const btn = document.getElementById('generateBtn');
      if (!btn) return;
      
      if (this.selectedSpins && this.selectedClass) {
        btn.disabled = false;
        btn.textContent = `GENERATE ${this.selectedSpins} SPIN${this.selectedSpins > 1 ? 'S' : ''} - ${this.selectedClass.toUpperCase()}`;
      } else {
        btn.disabled = true;
        btn.textContent = 'SELECT OPTIONS ABOVE';
      }
    }
    
    checkAutoStart() {
      if (this.selectedSpins && this.selectedClass && !this.isAnimating) {
        setTimeout(() => this.startSlotMachine(), 500);
      }
    }
    
    async startSlotMachine() {
      if (!this.selectedSpins || !this.selectedClass || !this.app) return;
      
      const btn = document.getElementById('generateBtn');
      if (btn) {
        btn.disabled = true;
        btn.textContent = 'SPINNING...';
      }
      
      // Show spin counter
      const counter = document.getElementById('spinCounter');
      if (counter) {
        counter.style.display = 'block';
        document.getElementById('totalSpins').textContent = this.selectedSpins;
      }
      
      try {
        // Generate loadout
        const className = this.selectedClass.charAt(0).toUpperCase() + this.selectedClass.slice(1);
        this.currentLoadout = this.app.uiController.createRandomLoadout(className);
        console.log('Generated loadout:', this.currentLoadout);
        
        // Populate the premium columns with items
        this.populatePremiumColumns(this.currentLoadout);
        
        // Run the spin sequence
        for (let i = 1; i <= this.selectedSpins; i++) {
          if (counter) {
            document.getElementById('currentSpin').textContent = i;
          }
          
          // Animate the premium columns
          await this.animatePremiumSpin(i === this.selectedSpins);
          
          if (i === this.selectedSpins) {
            this.showWinners();
            this.createSparks();
          }
          
          if (i < this.selectedSpins) {
            await this.sleep(500);
          }
        }
        
        // Add to history
        if (this.app.uiController.historyManager) {
          this.app.uiController.historyManager.addEntry(this.currentLoadout);
        }
        
      } catch (error) {
        console.error('Failed to run slot machine:', error);
      } finally {
        if (counter) {
          counter.style.display = 'none';
        }
        if (btn) {
          btn.disabled = false;
          this.updateGenerateButton();
        }
      }
    }
    
    populatePremiumColumns(loadout) {
      // Map loadout to columns
      const columnData = [
        { items: this.generateItemList(loadout.weapon, 'weapon'), winner: loadout.weapon },
        { items: this.generateItemList(loadout.specialization, 'specialization'), winner: loadout.specialization },
        { items: this.generateItemList(loadout.gadget1, 'gadget'), winner: loadout.gadget1 },
        { items: this.generateItemList(loadout.gadget2, 'gadget'), winner: loadout.gadget2 },
        { items: this.generateItemList(loadout.gadget3, 'gadget'), winner: loadout.gadget3 }
      ];
      
      // Populate each column
      columnData.forEach((data, index) => {
        const itemsContainer = document.getElementById(`premium-items-${index}`);
        if (!itemsContainer) return;
        
        itemsContainer.innerHTML = '';
        
        // Generate enough items to fill viewport
        const isMobile = window.innerWidth <= 768;
        const totalItems = isMobile ? 150 : 80;
        const winnerPosition = Math.floor(totalItems / 2); // Center position (75 on mobile, 40 on desktop)
        
        // Generate items for smooth spinning with no gaps on mobile
        for (let i = 0; i < totalItems; i++) {
          const item = i === winnerPosition ? data.winner : data.items[Math.floor(Math.random() * data.items.length)];
          const itemDiv = document.createElement('div');
          itemDiv.className = 'slot-item';
          if (i === winnerPosition) itemDiv.dataset.winner = 'true';
          
          const imagePath = this.getImagePath(item);
          itemDiv.innerHTML = `
            <img src="${imagePath}" alt="${item}" onerror="this.src='/images/placeholder.webp'">
            <div class="slot-item-name">${item}</div>
          `;
          itemsContainer.appendChild(itemDiv);
        }
        
        // Reset position
        itemsContainer.style.transform = 'translateY(0)';
      });
    }
    
    generateItemList(winner, type) {
      const className = this.selectedClass.charAt(0).toUpperCase() + this.selectedClass.slice(1);
      const data = this.getGameData();
      
      if (!data || !data[className]) return [winner];
      
      let pool = [];
      if (type === 'weapon') {
        pool = data[className].weapons || [];
      } else if (type === 'specialization') {
        pool = data[className].specializations || [];
      } else if (type === 'gadget') {
        pool = data[className].gadgets || [];
      }
      
      // Make sure winner is in the pool
      if (!pool.includes(winner)) {
        pool.push(winner);
      }
      
      return pool.length > 0 ? pool : [winner];
    }
    
    getGameData() {
      // Use the game data from the app if available
      if (window.GameData) return window.GameData.loadouts;
      
      // Fallback data
      return {
        Light: {
          weapons: ['M11', 'XP-54', 'V9S', 'Dagger', 'Sword', 'Throwing Knives'],
          specializations: ['Cloaking Device', 'Evasive Dash', 'Grappling Hook'],
          gadgets: ['Breach Charge', 'Flashbang', 'Smoke Grenade', 'Stun Gun', 'Glitch Grenade']
        },
        Medium: {
          weapons: ['AKM', 'R.357', 'FCAR', 'Model 1887', 'Riot Shield'],
          specializations: ['Healing Beam', 'Defibrillator', 'Recon Senses'],
          gadgets: ['Gas Mine', 'Explosive Mine', 'Zipline', 'Jump Pad', 'APS Turret']
        },
        Heavy: {
          weapons: ['M60', 'Flamethrower', 'Sledgehammer', 'SA1216', 'Lewis Gun'],
          specializations: ['Mesh Shield', 'Charge N Slam', 'Goo Gun'],
          gadgets: ['Barricade', 'C4', 'RPG-7', 'Dome Shield', 'Pyro Mine']
        }
      };
    }
    
    getImagePath(itemName) {
      if (!itemName) return '/images/placeholder.webp';
      
      // Use the app's image path function if available
      if (this.app && this.app.slotMachine && this.app.slotMachine.getItemImage) {
        return this.app.slotMachine.getItemImage(itemName);
      }
      
      // Fallback to simple conversion
      const normalized = itemName
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join('_');
      
      return `/images/${normalized}.webp`;
    }
    
    async animatePremiumSpin(isFinalSpin) {
      const duration = isFinalSpin ? 3000 : 1000;
      
      // Calculate target position based on winner position and item height
      const isMobile = window.innerWidth <= 768;
      const winnerPosition = Math.floor((isMobile ? 150 : 80) / 2);
      
      // Get actual item height based on viewport
      const testItem = document.querySelector('.slot-item');
      const itemHeight = testItem ? testItem.offsetHeight : (isMobile ? 60 : 80);
      
      // Get actual viewport height
      const slotWindow = document.querySelector('.slot-window');
      const viewportHeight = slotWindow ? slotWindow.offsetHeight : 240;
      
      // Calculate how many items are visible
      const visibleItems = Math.ceil(viewportHeight / itemHeight);
      const centerItemIndex = Math.floor(visibleItems / 2);
      
      // Position winner in center of viewport
      // We want winner (at index 75) to be in the middle of the visible area
      const targetPosition = -(winnerPosition - centerItemIndex) * itemHeight;
      
      console.log(`🎯 Animation targeting: Winner ${winnerPosition}, Item ${itemHeight}px, Viewport ${viewportHeight}px, Target ${targetPosition}px`);
      
      // Animate all columns
      const columns = document.querySelectorAll('.slot-items');
      
      if (columns.length === 0) {
        console.error('No slot columns found to animate!');
        return;
      }
      
      console.log(`Animating ${columns.length} columns to ${targetPosition}px over ${duration}ms`);
      
      columns.forEach((col, index) => {
        // Reset first
        col.style.transition = 'none';
        col.style.transform = 'translateY(0)';
        
        // Force reflow
        void col.offsetHeight;
        
        // Now animate
        col.style.transition = `transform ${duration}ms cubic-bezier(0.17, 0.67, 0.16, 0.99)`;
        col.style.transform = `translateY(${targetPosition}px)`;
      });
      
      await this.sleep(duration);
    }
    
    showWinners() {
      document.querySelectorAll('[data-winner="true"]').forEach(item => {
        item.classList.add('winner');
      });
    }
    
    createSparks() {
      const container = document.getElementById('victorySparks');
      if (!container) return;
      
      container.innerHTML = '';
      for (let i = 0; i < 20; i++) {
        const spark = document.createElement('div');
        spark.className = 'spark';
        spark.style.setProperty('--x', `${(Math.random() - 0.5) * 300}px`);
        spark.style.setProperty('--y', `${(Math.random() - 0.5) * 300}px`);
        spark.style.animationDelay = `${Math.random() * 0.5}s`;
        container.appendChild(spark);
      }
      
      setTimeout(() => container.innerHTML = '', 1500);
    }
    
    sleep(ms) {
      return new Promise(resolve => setTimeout(resolve, ms));
    }
  }
  
  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      window.premiumIntegrated = new PremiumIntegratedSlotMachine();
    });
  } else {
    window.premiumIntegrated = new PremiumIntegratedSlotMachine();
  }
})();