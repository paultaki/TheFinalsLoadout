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
      this.loadoutData = null;
      this.filterState = this.loadFilterState();
      this.sounds = {};
      this.soundEnabled = true;
      this.columnsWithSoundPlayed = new Set(); // Track which columns have played sound
      this.lastStopSoundTime = 0; // Track when we last played a stop sound
      this.currentSpinId = 0; // Track spin ID to prevent overlapping callbacks
      this.activeTimeouts = []; // Track active timeouts
      this.firedTimeouts = new Set(); // Track which timeouts have fired to prevent duplicates
      this.isSpinning = false; // Prevent multiple simultaneous spins
      this.initSounds();
      this.init();
    }
    
    initSounds() {
      // Initialize all sound effects
      const soundFiles = {
        click: '/sounds/click.mp3',
        spinStart: '/sounds/start-spin.mp3',
        spinning: '/sounds/spinning.mp3',
        roulette: '/sounds/roulette.mp3',  // Use smooth roulette sound instead of ticking
        stop: '/sounds/ding.mp3',
        win: '/sounds/ding-ding.mp3',
        finalWin: '/sounds/pop-pour-perform.mp3'
      };
      
      // Preload all sounds
      Object.entries(soundFiles).forEach(([key, path]) => {
        const audio = new Audio(path);
        audio.preload = 'auto';
        // Set different volumes for different sounds
        if (key === 'roulette') {
          audio.volume = 0.1; // Very quiet spinning sound (10%)
          audio.loop = true;
        } else if (key === 'finalWin') {
          audio.volume = 0.5; // Louder final celebration sound (50%)
        } else {
          audio.volume = 0.3; // Default volume for other sounds (30%)
        }
        this.sounds[key] = audio;
      });
      
      this.currentRouletteSound = null; // Track the current spinning sound
    }
    
    playSound(soundName) {
      if (!this.soundEnabled || !this.sounds[soundName]) return;

      try {
        // Special handling for roulette sound (looping)
        if (soundName === 'roulette') {
          // Stop any existing roulette sound
          this.stopRouletteSound();
          // Start new roulette sound
          this.currentRouletteSound = this.sounds.roulette;
          this.currentRouletteSound.currentTime = 0;
          this.currentRouletteSound.play().catch(e => console.log('Roulette sound failed:', e));
        } else if (soundName === 'stop') {
          // For stop sound, completely prevent overlapping
          const audio = this.sounds[soundName];

          // Check if sound is already playing
          if (!audio.paused && audio.currentTime > 0 && audio.currentTime < audio.duration) {
            console.log(`⏭️ Stop sound already playing, skipping`);
            return;
          }

          // Also check minimum time between sounds
          const now = Date.now();
          const timeSinceLastStop = now - this.lastStopSoundTime;

          if (timeSinceLastStop > 200) { // Increased to 200ms minimum between stop sounds
            this.lastStopSoundTime = now;
            audio.currentTime = 0; // Reset to start
            audio.play().catch(e => console.log('Stop sound failed:', e));
          } else {
            console.log(`⏭️ Skipping stop sound, too soon (${timeSinceLastStop}ms since last)`);
          }
        } else if (soundName === 'finalWin') {
          // For finalWin sound, prevent duplicates
          const audio = this.sounds[soundName];
          if (!audio.paused && audio.currentTime > 0 && audio.currentTime < audio.duration) {
            console.log(`⏭️ FinalWin sound already playing, skipping duplicate`);
            return;
          }
          audio.currentTime = 0;
          audio.play().catch(e => console.log('FinalWin sound failed:', e));
        } else {
          // For other sounds, clone to allow overlapping
          const audio = this.sounds[soundName].cloneNode();
          audio.volume = this.sounds[soundName].volume;
          audio.play().catch(e => console.log('Sound play failed:', e));
        }
      } catch (e) {
        console.log('Sound error:', e);
      }
    }
    
    stopRouletteSound() {
      if (this.currentRouletteSound) {
        this.currentRouletteSound.pause();
        this.currentRouletteSound.currentTime = 0;
      }
    }
    
    init() {
      // Load data first
      this.loadGameData();
      // Wait for app to be ready
      this.waitForApp();
    }
    
    async loadGameData() {
      try {
        // Try to load from the main data/loadouts-simple.json (same as production)
        const response = await fetch('/data/loadouts-simple.json');
        if (response.ok) {
          this.loadoutData = await response.json();
          console.log('✅ Loaded loadout data from /data/loadouts-simple.json');
        } else {
          throw new Error('Failed to load loadouts-simple.json');
        }
      } catch (error) {
        console.warn('⚠️ Using fallback loadout data:', error);
        // Use fallback data if JSON fails
        this.loadoutData = this.getFallbackData();
      }
    }
    
    loadFilterState() {
      // Load saved filter state from localStorage
      const saved = localStorage.getItem('premiumFilterState');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {
          console.error('Failed to parse filter state:', e);
        }
      }
      // Default state - everything enabled
      return {
        Light: {
          weapons: [],
          specializations: [],
          gadgets: []
        },
        Medium: {
          weapons: [],
          specializations: [],
          gadgets: []
        },
        Heavy: {
          weapons: [],
          specializations: [],
          gadgets: []
        }
      };
    }
    
    saveFilterState() {
      localStorage.setItem('premiumFilterState', JSON.stringify(this.filterState));
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
          this.playSound('click');
          this.selectSpins(parseInt(btn.dataset.spins));
          this.checkAutoStart();
        });
      });
      
      // Class Buttons
      document.querySelectorAll('.class-btn-premium').forEach(btn => {
        btn.addEventListener('click', () => {
          this.playSound('click');
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
        this.playSound('click'); // Add clicking sound for spin animation
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
        this.playSound('click'); // Add clicking sound for class animation
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

      // Prevent multiple simultaneous runs
      if (this.isSpinning) {
        console.log('⚠️ Slot machine already spinning, ignoring duplicate start request');
        return;
      }
      this.isSpinning = true;

      console.log(`🎰 Starting slot machine at ${Date.now()} with ${this.selectedSpins} spins`);

      // Clear any pending timeouts from previous spins
      console.log(`🧹 Clearing ${this.activeTimeouts.length} active timeouts from previous spins`);

      // Clear all timeouts and verify they're cleared
      while (this.activeTimeouts.length > 0) {
        const timeout = this.activeTimeouts.pop();
        clearTimeout(timeout);
        console.log(`  - Cleared timeout: ${timeout}`);
      }

      // Double-check the array is empty
      this.activeTimeouts = [];
      console.log(`✅ All timeouts cleared, array length: ${this.activeTimeouts.length}`);

      // Stop any existing roulette sound before starting new spin
      this.stopRouletteSound();

      // Also stop any other playing sounds
      Object.values(this.sounds).forEach(audio => {
        if (audio && !audio.paused) {
          audio.pause();
          audio.currentTime = 0;
        }
      });

      // Reset sound tracking at the start of a new sequence
      this.columnsWithSoundPlayed.clear();
      this.firedTimeouts.clear();
      this.lastStopSoundTime = 0;
      this.currentSpinId = Date.now(); // Unique ID for this spin sequence

      // Play start sound
      this.playSound('spinStart');

      // Clear previous winners, glow effects, and sparks
      document.querySelectorAll('.winner').forEach(item => {
        item.classList.remove('winner');
      });
      document.querySelectorAll('.winner-glow').forEach(item => {
        item.classList.remove('winner-glow');
      });
      const sparksContainer = document.getElementById('victorySparks');
      if (sparksContainer) {
        sparksContainer.innerHTML = '';
      }
      
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
        
        // Run the spin sequence
        for (let i = 1; i <= this.selectedSpins; i++) {
          console.log(`🎰 Starting spin ${i} of ${this.selectedSpins}`);
          if (counter) {
            document.getElementById('currentSpin').textContent = i;
          }

          // Populate columns for this spin
          // For intermediate spins, use random items
          // For final spin, use the actual loadout
          if (i === this.selectedSpins) {
            console.log('🎯 Final spin - using actual loadout');
            // Final spin - use the actual loadout
            this.populatePremiumColumns(this.currentLoadout);
          } else {
            console.log('🔄 Intermediate spin - using random items');
            // Intermediate spin - use random items
            this.populatePremiumColumnsRandom();
          }

          // Animate the premium columns
          const isFinalSpin = i === this.selectedSpins;

          if (isFinalSpin) {
            // For final spin, start celebration immediately after sound stops (not after full animation)
            // Sound is started inside this function with deceleration
            await this.animatePremiumSpinWithCelebration();
          } else {
            // Normal animation for intermediate spins
            this.playSound('roulette'); // Regular speed for intermediate spins
            await this.animatePremiumSpin(false);
          }
          
          if (i < this.selectedSpins) {
            await this.sleep(500);
          }
        }
        
        // Track the spin completion in Supabase
        if (window.StatsTracker) {
          window.StatsTracker.track('loadout');
        }

        // Add to history
        if (window.loadoutHistory) {
          const loadout = {
            ...this.currentLoadout,
            class: this.selectedClass ? this.selectedClass.charAt(0).toUpperCase() + this.selectedClass.slice(1) : 'Unknown'
          };
          window.loadoutHistory.addLoadout(loadout);
        } else if (this.app.uiController.historyManager) {
          this.app.uiController.historyManager.addEntry(this.currentLoadout);
        }
        
      } catch (error) {
        console.error('Failed to run slot machine:', error);
      } finally {
        this.isSpinning = false;
        console.log(`🎰 Slot machine finished at ${Date.now()}`);
        if (counter) {
          counter.style.display = 'none';
        }
        if (btn) {
          btn.disabled = false;
          this.updateGenerateButton();
        }
      }
    }
    
    populatePremiumColumnsRandom() {
      // Generate completely random items for intermediate spins
      const className = this.selectedClass.charAt(0).toUpperCase() + this.selectedClass.slice(1);
      const data = this.getFilteredData(className);
      
      if (!data) return;
      
      // Get item pools for each column type
      const columnPools = [
        data.weapons || [],           // Column 0: Weapons
        data.specializations || [],   // Column 1: Specializations
        data.gadgets || [],           // Column 2: Gadget 1
        data.gadgets || [],           // Column 3: Gadget 2
        data.gadgets || [],           // Column 4: Gadget 3
      ];
      
      // Populate each column with random items
      columnPools.forEach((pool, index) => {
        const itemsContainer = document.getElementById(`premium-items-${index}`);
        if (!itemsContainer || pool.length === 0) return;
        
        itemsContainer.innerHTML = '';
        
        // Generate enough items to fill viewport
        const isMobile = window.innerWidth <= 768;
        const totalItems = isMobile ? 150 : 80;
        
        // Create a shuffled array of items for true randomness
        const shuffledItems = [];
        for (let i = 0; i < totalItems; i++) {
          // Pick a random item from the pool for each position
          shuffledItems.push(pool[Math.floor(Math.random() * pool.length)]);
        }
        
        // Pick multiple random "winner" positions for variety
        const winnerPositions = new Set();
        for (let j = 0; j < 5; j++) {
          winnerPositions.add(Math.floor(Math.random() * totalItems));
        }
        
        // Generate the column with shuffled items
        shuffledItems.forEach((item, i) => {
          const itemDiv = document.createElement('div');
          itemDiv.className = 'slot-item';
          // Mark random positions as "winner" for visual variety
          if (winnerPositions.has(i)) itemDiv.dataset.winner = 'true';
          
          const imagePath = this.getImagePath(item);
          itemDiv.innerHTML = `
            <img src="${imagePath}" alt="${item}" onerror="this.src='/images/placeholder.webp'">
            <div class="slot-item-name">${item}</div>
          `;
          itemsContainer.appendChild(itemDiv);
        });
        
        // Reset position
        itemsContainer.style.transform = 'translateY(0)';
      });
      
      console.log('Populated columns with random items for intermediate spin');
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
      const data = this.getFilteredData(className);
      
      if (!data) return [winner];
      
      let pool = [];
      if (type === 'weapon') {
        pool = data.weapons || [];
      } else if (type === 'specialization') {
        pool = data.specializations || [];
      } else if (type === 'gadget') {
        pool = data.gadgets || [];
      }
      
      // Make sure winner is in the pool
      if (!pool.includes(winner)) {
        pool.push(winner);
      }
      
      return pool.length > 0 ? pool : [winner];
    }
    
    getGameData() {
      // Use loaded JSON data if available
      if (this.loadoutData) {
        return this.loadoutData;
      }
      
      // Use the game data from the app if available
      if (window.GameData) return window.GameData.loadouts;
      
      // Fallback data
      return this.getFallbackData();
    }
    
    getFallbackData() {
      return {
        Light: {
          weapons: ['93R', 'AKM-220', 'Dagger', 'LH1', 'M11', 'M26 Matter', 'Recurve Bow', 
                   'SH1900', 'SR-84', 'Sword', 'Throwing Knives', 'V9S', 'XP-54'],
          specializations: ['Cloaking Device', 'Evasive Dash', 'Grappling Hook'],
          gadgets: ['Breach Charge', 'Flashbang', 'Frag Grenade', 'Gas Grenade',
                   'Gateway', 'Glitch Grenade', 'Goo Grenade', 'Gravity Vortex',
                   'H+ Diffuser', 'Nullifier', 'Proximity Sensor', 'Pyro Grenade', 
                   'Smoke Grenade', 'Sonar Grenade', 'Thermal Bore', 'Thermal Vision',
                   'Tracking Dart', 'Vanishing Bomb']
        },
        Medium: {
          weapons: ['AKM', 'CK-01 Repeater', 'Cerberus 52GA', 'CL-40', 'Dual Blades', 'FAMAS',
                   'FCAR', 'Model 1887', 'PIKE-556', 'R.357', 'Riot Shield'],
          specializations: ['Dematerializer', 'Guardian Turret', 'Healing Beam'],
          gadgets: ['APS Turret', 'Breach Drill', 'Data Reshaper', 'Defibrillator',
                   'Explosive Mine', 'Flashbang', 'Frag Grenade', 'Gas Grenade',
                   'Gas Mine', 'Glitch Trap', 'Goo Grenade', 'Jump Pad',
                   'Proximity Sensor', 'Pyro Grenade', 'Zipline', 'Smoke Grenade']
        },
        Heavy: {
          weapons: ['SH1 Akimbo', 'Flamethrower', 'KS-23', 'Lewis Gun', 'M134 Minigun',
                   'M60', 'MGL32', 'SA1216', 'SHAK-50', 'Sledgehammer', 'Spear'],
          specializations: ['Charge \'N\' Slam', 'Goo Gun', 'Mesh Shield', 'Winch Claw'],
          gadgets: ['Anti-Gravity Cube', 'Barricade', 'C4', 'Dome Shield',
                   'Explosive Mine', 'Flashbang', 'Frag Grenade', 'Gas Grenade',
                   'Goo Grenade', 'Healing Emitter', 'Lockbolt', 'Proximity Sensor',
                   'Pyro Grenade', 'Pyro Mine', 'RPG-7', 'Smoke Grenade']
        }
      };
    }
    
    getFilteredData(className) {
      const data = this.getGameData();
      const classData = data[className];
      const filters = this.filterState[className];
      
      if (!classData || !filters) return classData;
      
      // Apply filters - if filter array is empty, include all items
      const filtered = {
        weapons: filters.weapons.length > 0 
          ? classData.weapons.filter(w => !filters.weapons.includes(w))
          : classData.weapons,
        specializations: filters.specializations.length > 0
          ? classData.specializations.filter(s => !filters.specializations.includes(s))
          : classData.specializations,
        gadgets: filters.gadgets.length > 0
          ? classData.gadgets.filter(g => !filters.gadgets.includes(g))
          : classData.gadgets
      };
      
      // Ensure we have at least one of each type
      if (filtered.weapons.length === 0) filtered.weapons = classData.weapons;
      if (filtered.specializations.length === 0) filtered.specializations = classData.specializations;
      if (filtered.gadgets.length < 3) filtered.gadgets = classData.gadgets;
      
      return filtered;
    }
    
    getImagePath(itemName) {
      if (!itemName) return '/images/placeholder.webp';
      
      // Don't use app's image function - it has lowercase issues
      // if (this.app && this.app.slotMachine && this.app.slotMachine.getItemImage) {
      //   return this.app.slotMachine.getItemImage(itemName);
      // }
      
      // Special cases for image names that don't match the item names exactly
      const specialCases = {
        'Nullifier': 'Nullifier',
        'Stun Gun': 'Nullifier',
        'Motion Sensor': 'Motion_Sensor',
        'Anti-Gravity Cube': 'Anti-Gravity_Cube',
        'Lockbolt': 'Lockbolt_Launcher',
        'Charge \'N\' Slam': 'Charge_N_Slam',
        'Charge N Slam': 'Charge_N_Slam',
        'H+ Infuser': 'H+_Infuser',
        'CK-01 Repeater': 'CB-01_Repeater',
        'CB-01 Repeater': 'CB-01_Repeater',
        'Cerberus 52GA': 'Cerberus_12GA',
        'Cerberus 12GA': 'Cerberus_12GA',
        'FAMAS': 'FAMAS',
        'CL-40': 'CL-40',
        'CL40': 'CL-40',
        'PIKE-556': 'Pike-556',
        'H+ Diffuser': 'H+_Infuser',
        'SH1 Akimbo': '.50_Akimbo',
        'AKM-220': 'ARN-220',
        'SR-84': 'SR-84',
        'XP-54': 'XP-54',
        'XP54': 'XP-54',
        'SR84': 'SR-84',
        'ARN220': 'ARN-220',
        'M134 Minigun': 'M134_Minigun',
        'ShAK-50': 'SHAK-50',
        'MGL32': 'MGL32',
        'Sledgehammer': 'Sledgehammer',
        'Spear': 'Spear',
        'H29 Sidearm': 'H29_Sidearm',
        'XCES Mortar': 'XCES_Mortar',
        'OPSK 9MM': 'OPSK_9MM',
        'KS23': 'KS-23',
        'KS-23': 'KS-23',
        'SA1216': 'SA1216',
        'RPG': 'RPG-7',
        'RPG-7': 'RPG-7',
        'APS Turret': 'APS_Turret',
        'Code Breaker': 'Code_Breaker',
        'Thermal Vision': 'Thermal_Vision',
        'Gravity Vortex': 'Gravity_Vortex',
        'Data Reshaper': 'Data_Reshaper',
        'Glitch Trap': 'Glitch_Trap',
        'Tracking Dart': 'Tracking_Dart',
        'Jump Pad': 'Jump_Pad',
        'Dome Shield': 'Dome_Shield',
        'Pyro Mine': 'Pyro_Mine',
        'Gas Mine': 'Gas_Mine',
        'Explosive Mine': 'Explosive_Mine',
        'Goo Grenade': 'Goo_Grenade',
        'Gas Grenade': 'Gas_Grenade',
        'Smoke Grenade': 'Smoke_Grenade',
        'Frag Grenade': 'Frag_Grenade',
        'Glitch Grenade': 'Glitch_Grenade',
        'Sonar Grenade': 'Sonar_Grenade',
        'Thermal Bore': 'Thermal_Bore',
        'Breach Charge': 'Breach_Charge',
        'Vanishing Bomb': 'Vanishing_Bomb',
        'Winch Claw': 'Winch_Claw',
        'Mesh Shield': 'Mesh_Shield',
        'Goo Gun': 'Goo_Gun',
        'Healing Beam': 'Healing_Beam',
        'Cloaking Device': 'Cloaking_Device',
        'Evasive Dash': 'Evasive_Dash',
        'Grappling Hook': 'Grappling_Hook',
        'Riot Shield': 'Riot_Shield',
        'Throwing Knives': 'Throwing_Knives',
        'Dual Blades': 'Dual_Blades',
        'Recurve Bow': 'Recurve_Bow',
        'Grenade Launcher': 'MGL32',
        'Scorch Blaster': 'Flamethrower',
        'M26 Matter': 'M26_Matter',
        'Giga Barrel': 'M60',
        'Model 1887': 'Model_1887',
        'Lewis Gun': 'Lewis_Gun',
        'Pike-556': 'Pike-556',
        'PIKE556': 'Pike-556',
        '.50 Akimbo': '.50_Akimbo',
        '50 Akimbo': '.50_Akimbo'
      };
      
      // Check special cases first
      if (specialCases[itemName]) {
        return `/images/${specialCases[itemName]}.webp`;
      }
      
      // Default conversion - replace spaces with underscores, keep original case
      const normalized = itemName.replace(/\s+/g, '_');
      
      return `/images/${normalized}.webp`;
    }
    
    async animatePremiumSpin(isFinalSpin) {
      const spinId = this.currentSpinId; // Capture current spin ID
      const callTime = Date.now();
      console.log(`🎵 animatePremiumSpin called at ${callTime} with isFinalSpin=${isFinalSpin}, spinId=${spinId}`);
      console.log(`📊 Current state: activeTimeouts=${this.activeTimeouts.length}, columnsWithSoundPlayed=${this.columnsWithSoundPlayed.size}`);

      const baseDuration = isFinalSpin ? 2000 : 1000;  // Base duration for first column
      const staggerDelay = isFinalSpin ? 500 : 100;    // Much longer delay for final spin
      
      // Get item dimensions
      const isMobile = window.innerWidth <= 768;
      const testItem = document.querySelector('.slot-item');
      const itemHeight = testItem ? testItem.offsetHeight : (isMobile ? 60 : 80);
      
      // Get actual viewport height
      const slotWindow = document.querySelector('.slot-window');
      const viewportHeight = slotWindow ? slotWindow.offsetHeight : 240;
      
      // Calculate how many items are visible
      const visibleItems = Math.ceil(viewportHeight / itemHeight);
      const centerItemIndex = Math.floor(visibleItems / 2);
      
      // For intermediate spins, generate random landing positions
      // For final spin, use the actual winner positions
      let targetPositions = [];
      const columns = document.querySelectorAll('.slot-items');
      const totalItems = isMobile ? 150 : 80;
      
      if (isFinalSpin) {
        // Use actual winner position for final spin
        const winnerPosition = Math.floor(totalItems / 2);
        const targetPosition = -(winnerPosition - centerItemIndex) * itemHeight;
        // All columns use same target for simplicity, but could vary
        targetPositions = Array(columns.length).fill(targetPosition);
      } else {
        // Generate random positions for each column on intermediate spins
        // Make sure they land on different items to create variety
        for (let i = 0; i < columns.length; i++) {
          // Random position between 20% and 80% of the total items
          const minPos = Math.floor(totalItems * 0.2);
          const maxPos = Math.floor(totalItems * 0.8);
          const randomPos = Math.floor(Math.random() * (maxPos - minPos)) + minPos;
          const targetPosition = -(randomPos - centerItemIndex) * itemHeight;
          targetPositions.push(targetPosition);
        }
      }
      
      console.log(`🎯 Animation targeting: Final ${isFinalSpin}, Item ${itemHeight}px, Viewport ${viewportHeight}px, Targets:`, targetPositions);
      
      // Animate all columns
      
      if (columns.length === 0) {
        console.error('No slot columns found to animate!');
        return;
      }
      
      console.log(`🎰 Animating ${columns.length} columns - Final: ${isFinalSpin}`, targetPositions);
      console.log(`🎲 Column durations will be:`, columns.length > 0 ? Array.from({length: columns.length}, (_, i) => `Column ${i+1}: ${baseDuration + (i * staggerDelay)}ms`) : 'No columns');

      // Track if we're in the forEach loop
      let forEachStartTime = Date.now();
      console.log(`🔄 Starting forEach loop at ${forEachStartTime}`);

      // First, start ALL columns spinning at the same time
      columns.forEach((col, index) => {
        console.log(`  📍 Processing column ${index + 1} of ${columns.length}`);
        // Reset first
        col.style.transition = 'none';
        col.style.transform = 'translateY(0)';
        
        // Force reflow
        void col.offsetHeight;
        
        // Calculate individual duration for each column
        // First column gets base duration, each subsequent column gets progressively longer
        const columnDuration = baseDuration + (index * staggerDelay);
        
        // Use different easing curves for each column on final spin
        let easing;
        if (isFinalSpin) {
          // More aggressive deceleration for earlier columns, maintain speed longer for later ones
          if (index === 0) {
            easing = 'cubic-bezier(0.23, 1, 0.32, 1)';      // Sharp deceleration for first column
          } else if (index === 1) {
            easing = 'cubic-bezier(0.22, 1, 0.36, 1)';      // Slightly less sharp
          } else if (index === 2) {
            easing = 'cubic-bezier(0.215, 0.61, 0.355, 1)'; // Medium deceleration  
          } else if (index === 3) {
            easing = 'cubic-bezier(0.19, 0.5, 0.32, 1)';    // Maintains speed longer then sharp stop
          } else {
            easing = 'cubic-bezier(0.17, 0.4, 0.3, 1)';     // Stays fast longest, hard stop at end
          }
        } else {
          // Quick stop for intermediate spins
          easing = 'cubic-bezier(0.25, 0.46, 0.45, 0.94)';
        }
        
        // Start ALL columns spinning immediately with their calculated durations
        // Use individual target position for this column
        col.style.transition = `transform ${columnDuration}ms ${easing}`;
        col.style.transform = `translateY(${targetPositions[index]}px)`;
        
        // Schedule stop sounds for each column on final spin only
        if (isFinalSpin && index < 5) { // Only schedule for first 5 columns max
          console.log(`📅 Scheduling DING ${index + 1} at ${columnDuration}ms`);

          const timeoutId = setTimeout(() => {
            // Only play if this is still the active spin
            if (spinId !== this.currentSpinId) {
              console.log(`⏭️ Old spin ${spinId} != current ${this.currentSpinId}, skipping`);
              return;
            }

            console.log(`🔔 Playing DING ${index + 1} of 5`);

            // Create a new audio element for this ding
            const audio = new Audio('/sounds/ding.mp3');
            audio.volume = 0.4;
            audio.play().catch(e => console.log(`Failed to play ding ${index + 1}:`, e));

            // Visual pulse
            col.style.filter = 'brightness(1.2)';
            setTimeout(() => {
              col.style.filter = 'brightness(1)';
            }, 200);

          }, columnDuration);

          this.activeTimeouts.push(timeoutId);
        }
      });

      console.log(`🔄 Finished forEach loop, scheduled ${this.activeTimeouts.length} timeouts`);

      // Wait for all columns to finish (last column takes the longest)
      const totalDuration = baseDuration + (columns.length - 1) * staggerDelay;

      // Stop roulette sound EARLIER - 1 second earlier for intermediate, 3 seconds earlier for final
      const soundStopOffset = isFinalSpin ? 3000 : 1000;  // Stop sound earlier
      const soundStopDuration = Math.max(100, totalDuration - soundStopOffset);  // Ensure it's at least 100ms

      const stopTimeoutId = setTimeout(() => {
        console.log(`🛑 Stopping roulette sound early (${isFinalSpin ? 'final' : 'intermediate'} spin) - ${soundStopOffset}ms before animation end`);
        this.stopRouletteSound();
        // Double-check it's stopped
        if (this.currentRouletteSound && !this.currentRouletteSound.paused) {
          console.log('⚠️ Force stopping roulette sound');
          this.currentRouletteSound.pause();
          this.currentRouletteSound.currentTime = 0;
        }
      }, soundStopDuration);
      this.activeTimeouts.push(stopTimeoutId);

      await this.sleep(totalDuration);

      // Extra safety: ensure roulette is stopped after every spin
      this.stopRouletteSound();
    }
    
    async animatePremiumSpinWithCelebration() {
      // We need to handle the final spin differently - start animation but don't wait for it
      const spinId = this.currentSpinId;
      const baseDuration = 2000;  // Final spin base duration
      const staggerDelay = 500;   // Final spin stagger

      // Get item dimensions
      const isMobile = window.innerWidth <= 768;
      const testItem = document.querySelector('.slot-item');
      const itemHeight = testItem ? testItem.offsetHeight : (isMobile ? 60 : 80);

      // Get actual viewport height
      const slotWindow = document.querySelector('.slot-window');
      const viewportHeight = slotWindow ? slotWindow.offsetHeight : 240;

      // Calculate how many items are visible
      const visibleItems = Math.ceil(viewportHeight / itemHeight);
      const centerItemIndex = Math.floor(visibleItems / 2);

      // Get columns
      const columns = document.querySelectorAll('.slot-items');
      const totalItems = isMobile ? 150 : 80;

      // Use actual winner position for final spin
      const winnerPosition = Math.floor(totalItems / 2);
      const targetPosition = -(winnerPosition - centerItemIndex) * itemHeight;
      const targetPositions = Array(columns.length).fill(targetPosition);

      // Start the roulette sound with deceleration effect
      this.playSound('roulette');
      const rouletteSound = this.currentRouletteSound;

      // Gradually decrease playback rate to simulate deceleration
      if (rouletteSound) {
        rouletteSound.playbackRate = 1.0; // Start at normal speed

        // Create deceleration intervals
        let currentRate = 1.0;
        const decelerationSteps = 20; // Number of steps to decelerate
        const decelerationDuration = baseDuration + 250; // Match when we stop the sound
        const stepDuration = decelerationDuration / decelerationSteps;

        // Gradually slow down the sound
        let stepCount = 0;
        const decelerationInterval = setInterval(() => {
          stepCount++;
          // Use exponential decay for more natural deceleration
          currentRate = 1.0 * Math.pow(0.5, stepCount / decelerationSteps); // Slows to 50% speed

          if (rouletteSound && !rouletteSound.paused) {
            rouletteSound.playbackRate = Math.max(0.5, currentRate); // Don't go below 50% speed
          }

          if (stepCount >= decelerationSteps) {
            clearInterval(decelerationInterval);
          }
        }, stepDuration);

        // Store interval ID for cleanup
        this.activeTimeouts.push(decelerationInterval);
      }

      // Start ALL columns spinning at the same time
      columns.forEach((col, index) => {
        // Reset first
        col.style.transition = 'none';
        col.style.transform = 'translateY(0)';

        // Force reflow
        void col.offsetHeight;

        // Calculate individual duration for each column
        const columnDuration = baseDuration + (index * staggerDelay);

        // Use aggressive deceleration for final spin
        let easing;
        if (index === 0) {
          easing = 'cubic-bezier(0.23, 1, 0.32, 1)';
        } else if (index === 1) {
          easing = 'cubic-bezier(0.22, 1, 0.36, 1)';
        } else if (index === 2) {
          easing = 'cubic-bezier(0.215, 0.61, 0.355, 1)';
        } else if (index === 3) {
          easing = 'cubic-bezier(0.19, 0.5, 0.32, 1)';
        } else {
          easing = 'cubic-bezier(0.17, 0.4, 0.3, 1)';
        }

        // Start spinning
        col.style.transition = `transform ${columnDuration}ms ${easing}`;
        col.style.transform = `translateY(${targetPositions[index]}px)`;

        // Schedule stop sounds for each column
        if (index < 5) {
          const timeoutId = setTimeout(() => {
            if (spinId !== this.currentSpinId) return;

            const audio = new Audio('/sounds/ding.mp3');
            audio.volume = 0.4;
            audio.play().catch(e => console.log(`Failed to play ding ${index + 1}:`, e));

            col.style.filter = 'brightness(1.2)';
            setTimeout(() => {
              col.style.filter = 'brightness(1)';
            }, 200);
          }, columnDuration);

          this.activeTimeouts.push(timeoutId);
        }
      });

      // Calculate when the last column will finish
      const lastColumnDuration = baseDuration + (columns.length - 1) * staggerDelay;

      // Stop roulette sound when spinning is visibly slowing - between first and second column
      // This gives a natural feel - not too early, not too late
      const soundStopTime = baseDuration + 250; // Stop shortly after first column (2250ms)
      setTimeout(() => {
        console.log('🔇 Stopping roulette sound on final spin at optimal time');
        this.stopRouletteSound();
      }, soundStopTime);

      // The aggressive easing makes columns visually stop MUCH earlier than the animation duration
      // With cubic-bezier easing, the visual motion is mostly complete at about 60% of the duration
      // So for a 4000ms total duration, visual stop happens around 2400ms
      const visualStopTime = baseDuration + (staggerDelay * 2); // Around when 3rd column stops (3000ms)
      const celebrationStartTime = visualStopTime - 500; // Start celebration at 2500ms

      console.log(`🎉 Celebration will start at ${celebrationStartTime}ms (visual stop appears around ${visualStopTime}ms)`);

      setTimeout(() => {
        this.playSound('finalWin');
        this.showWinnersSequentially(); // Don't await - let it run async
      }, celebrationStartTime);

      // Wait for everything to complete
      await this.sleep(lastColumnDuration + 1000); // Add a small buffer for celebration to start
    }

    async showWinnersSequentially() {
      const columns = document.querySelectorAll('.slot-column');
      const sparksContainer = document.getElementById('victorySparks');
      
      for (let i = 0; i < columns.length; i++) {
        const column = columns[i];
        const winner = column.querySelector('[data-winner="true"]');
        
        if (winner) {
          // Create pulse ripple effect first (no sound here - already played finalWin)
          this.createPulseRipple(winner);
          
          // Small delay for ripple to start
          await this.sleep(50);
          
          // Highlight the winner with initial flash
          winner.classList.add('winner');
          
          // After flash animation completes, add persistent glow
          setTimeout(() => {
            winner.classList.add('winner-glow');
          }, 700); // 700ms matches the winnerFlash animation duration
          
          // Create sparks for this column
          if (sparksContainer) {
            this.createColumnSparks(column, sparksContainer);
          }
          
          // Wait before highlighting next column
          await this.sleep(150);
        }
      }
    }
    
    createPulseRipple(winner) {
      const rect = winner.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      
      // Create ripple element
      const ripple = document.createElement('div');
      ripple.style.position = 'fixed';
      ripple.style.left = `${centerX}px`;
      ripple.style.top = `${centerY}px`;
      ripple.style.width = '80px';
      ripple.style.height = '80px';
      ripple.style.marginLeft = '-40px';
      ripple.style.marginTop = '-40px';
      ripple.style.borderRadius = '50%';
      ripple.style.border = '2px solid rgba(255, 102, 170, 0.8)';
      ripple.style.background = 'radial-gradient(circle, rgba(255, 102, 170, 0.2) 0%, transparent 70%)';
      ripple.style.pointerEvents = 'none';
      ripple.style.zIndex = '99998';
      
      // Animate the ripple
      ripple.style.animation = 'pulseRipple 0.6s ease-out forwards';
      
      // Add keyframe animation if not already added
      if (!document.getElementById('rippleStyle')) {
        const style = document.createElement('style');
        style.id = 'rippleStyle';
        style.textContent = `
          @keyframes pulseRipple {
            0% {
              transform: scale(0);
              opacity: 1;
            }
            100% {
              transform: scale(2);
              opacity: 0;
            }
          }
        `;
        document.head.appendChild(style);
      }
      
      document.body.appendChild(ripple);
      
      // Clean up
      setTimeout(() => ripple.remove(), 600);
    }
    
    createColumnSparks(column, container) {
      // Get the winner element position within the column
      const winner = column.querySelector('[data-winner="true"]');
      if (!winner) return;
      
      const rect = winner.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      
      console.log(`🎆 Creating ${15} sparks at position: ${centerX}, ${centerY}`);
      
      // Create sparks directly in the container
      const sparkCount = 15;
      
      for (let i = 0; i < sparkCount; i++) {
        const spark = document.createElement('div');
        spark.className = 'spark';
        
        // Position spark directly at winner center
        spark.style.position = 'fixed';
        spark.style.left = `${centerX}px`;
        spark.style.top = `${centerY}px`;
        spark.style.width = '8px';
        spark.style.height = '8px';
        spark.style.background = `radial-gradient(circle, #fff 0%, #ff66aa 30%, #ff3366 60%, transparent 100%)`;
        spark.style.borderRadius = '50%';
        spark.style.boxShadow = '0 0 10px #ff66aa, 0 0 20px rgba(255, 102, 170, 0.6)';
        spark.style.zIndex = '999999';
        spark.style.pointerEvents = 'none';
        
        // Random burst direction
        const angle = (Math.PI * 2 * i) / sparkCount + (Math.random() - 0.5) * 0.3;
        const distance = 100 + Math.random() * 100;
        const x = Math.cos(angle) * distance;
        const y = Math.sin(angle) * distance;
        
        // Apply animation directly
        spark.style.animation = `sparkMove_${i} 0.8s ease-out forwards`;
        
        // Create unique keyframe for this spark
        const style = document.createElement('style');
        style.textContent = `
          @keyframes sparkMove_${i} {
            0% {
              transform: translate(-5px, -5px) scale(1);
              opacity: 1;
            }
            100% {
              transform: translate(${x - 5}px, ${y - 5}px) scale(0.2);
              opacity: 0;
            }
          }
        `;
        document.head.appendChild(style);
        
        document.body.appendChild(spark);
        
        // Clean up this spark after animation
        setTimeout(() => {
          spark.remove();
          style.remove();
        }, 850);
      }
      
      console.log(`✅ Sparks created and added to document.body`);
    }
    
    sleep(ms) {
      return new Promise(resolve => setTimeout(resolve, ms));
    }
  }
  
  // Initialize when DOM is ready (prevent multiple instances)
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      if (!window.premiumIntegrated) {
        console.log('Creating PremiumIntegratedSlotMachine instance');
        window.premiumIntegrated = new PremiumIntegratedSlotMachine();
      } else {
        console.log('PremiumIntegratedSlotMachine already exists, skipping creation');
      }
    });
  } else {
    if (!window.premiumIntegrated) {
      console.log('Creating PremiumIntegratedSlotMachine instance');
      window.premiumIntegrated = new PremiumIntegratedSlotMachine();
    } else {
      console.log('PremiumIntegratedSlotMachine already exists, skipping creation');
    }
  }
})();