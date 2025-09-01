/**
 * The Finals Loadout Generator v3 - Optimized
 * Consolidated and refactored with improved architecture
 */

(function() {
  'use strict';

  // ========================================
  // Configuration & Constants
  // ========================================
  const CONFIG = {
    ANIMATION: {
      SPIN_DURATION: 3000,
      ITEM_HEIGHT: 80,
      VIEWPORT_HEIGHT: 240,
      CENTER_POSITION: -1520,
      MIN_VELOCITY: 12,
      MIN_DISTANCE: 0.5
    },
    STORAGE: {
      HISTORY_KEY: 'loadout_history',
      SETTINGS_KEY: 'user_settings',
      MAX_HISTORY: 50
    },
    UI: {
      DEBOUNCE_DELAY: 300,
      TRANSITION_DURATION: 250
    }
  };

  // ========================================
  // Game Data
  // ========================================
  const GameData = {
    classes: ['Light', 'Medium', 'Heavy'],
    
    loadouts: {
      Light: {
        weapons: [
          '93R', 'AKM-220', 'Dagger', 'LH1', 'M11', 'M26 Matter',
          'Recurve Bow', 'SH1900', 'SR-84', 'Sword', 'Throwing Knives',
          'V9S', 'XP-54'
        ],
        specializations: ['Cloaking Device', 'Evasive Dash', 'Grappling Hook'],
        gadgets: [
          'Breach Charge', 'Flashbang', 'Frag Grenade', 'Gas Grenade',
          'Gateway', 'Glitch Grenade', 'Goo Grenade', 'Gravity Vortex',
          'H+ Diffuser', 'Nullifier', 'Pyro Grenade', 'Smoke Grenade',
          'Sonar Grenade', 'Thermal Bore', 'Thermal Vision',
          'Tracking Dart', 'Vanishing Bomb'
        ]
      },
      Medium: {
        weapons: [
          'AKM', 'CK-01 Repeater', 'Cerberus 52GA', 'CL-40', 'Dual Blades',
          'FAMAS', 'FCAR', 'Model 1887', 'PIKE-556', 'R.357', 'Riot Shield'
        ],
        specializations: ['Dematerializer', 'Guardian Turret', 'Healing Beam', 'Recon Senses'],
        gadgets: [
          'APS Turret', 'Breach Drill', 'Data Reshaper', 'Defibrillator',
          'Explosive Mine', 'Flashbang', 'Frag Grenade', 'Gas Grenade',
          'Gas Mine', 'Glitch Trap', 'Goo Grenade', 'Jump Pad',
          'Proximity Sensor', 'Pyro Grenade', 'Zipline', 'Smoke Grenade',
          'Night Vision'
        ]
      },
      Heavy: {
        weapons: [
          'SH1 Akimbo', 'Flamethrower', 'KS-23', 'Lewis Gun', 'M134 Minigun',
          'M60', 'MGL32', 'SA1216', 'SHAK-50', 'Sledgehammer', 'Spear'
        ],
        specializations: ['Charge \'N\' Slam', 'Goo Gun', 'Mesh Shield', 'Winch Claw'],
        gadgets: [
          'Anti-Gravity Cube', 'Barricade', 'C4', 'Dome Shield',
          'Explosive Mine', 'Flashbang', 'Frag Grenade', 'Gas Grenade',
          'Goo Grenade', 'Healing Emitter', 'Lockbolt', 'Night Vision',
          'Proximity Sensor', 'Pyro Grenade', 'Pyro Mine', 'RPG-7',
          'Smoke Grenade'
        ]
      }
    }
  };

  // ========================================
  // State Management
  // ========================================
  class StateManager {
    constructor() {
      this.state = {
        selectedClass: null,
        isGenerating: false,
        soundEnabled: this.loadSetting('soundEnabled', true),
        currentLoadout: null,
        history: this.loadHistory()
      };
      
      this.listeners = new Map();
    }

    get(key) {
      return this.state[key];
    }

    set(key, value) {
      const oldValue = this.state[key];
      this.state[key] = value;
      this.notify(key, value, oldValue);
    }

    subscribe(key, callback) {
      if (!this.listeners.has(key)) {
        this.listeners.set(key, new Set());
      }
      this.listeners.get(key).add(callback);
      
      return () => {
        const callbacks = this.listeners.get(key);
        if (callbacks) {
          callbacks.delete(callback);
        }
      };
    }

    notify(key, newValue, oldValue) {
      const callbacks = this.listeners.get(key);
      if (callbacks) {
        callbacks.forEach(callback => callback(newValue, oldValue));
      }
    }

    loadHistory() {
      try {
        const stored = localStorage.getItem(CONFIG.STORAGE.HISTORY_KEY);
        return stored ? JSON.parse(stored) : [];
      } catch (e) {
        console.error('Failed to load history:', e);
        return [];
      }
    }

    saveHistory(history) {
      try {
        const limited = history.slice(0, CONFIG.STORAGE.MAX_HISTORY);
        localStorage.setItem(CONFIG.STORAGE.HISTORY_KEY, JSON.stringify(limited));
      } catch (e) {
        console.error('Failed to save history:', e);
      }
    }

    loadSetting(key, defaultValue) {
      try {
        const settings = JSON.parse(localStorage.getItem(CONFIG.STORAGE.SETTINGS_KEY) || '{}');
        return settings[key] !== undefined ? settings[key] : defaultValue;
      } catch (e) {
        return defaultValue;
      }
    }

    saveSetting(key, value) {
      try {
        const settings = JSON.parse(localStorage.getItem(CONFIG.STORAGE.SETTINGS_KEY) || '{}');
        settings[key] = value;
        localStorage.setItem(CONFIG.STORAGE.SETTINGS_KEY, JSON.stringify(settings));
      } catch (e) {
        console.error('Failed to save setting:', e);
      }
    }
  }

  // ========================================
  // Animation Engine
  // ========================================
  class AnimationEngine {
    constructor() {
      this.animations = new Map();
      this.rafId = null;
    }

    spin(element, duration, targetPosition) {
      return new Promise((resolve) => {
        const startTime = performance.now();
        const startPosition = this.getTransformY(element);
        const distance = targetPosition - startPosition;

        const animate = (currentTime) => {
          const elapsed = currentTime - startTime;
          const progress = Math.min(elapsed / duration, 1);
          
          // Easing function for smooth deceleration
          const eased = this.easeOutCubic(progress);
          const currentPosition = startPosition + (distance * eased);
          
          element.style.transform = `translateY(${currentPosition}px)`;
          
          if (progress < 1) {
            this.rafId = requestAnimationFrame(animate);
          } else {
            resolve();
          }
        };

        this.rafId = requestAnimationFrame(animate);
      });
    }

    getTransformY(element) {
      const transform = window.getComputedStyle(element).transform;
      if (transform === 'none') return 0;
      
      const matrix = transform.match(/matrix.*\((.+)\)/);
      if (matrix) {
        const values = matrix[1].split(', ');
        return parseFloat(values[5] || 0);
      }
      return 0;
    }

    easeOutCubic(t) {
      return 1 - Math.pow(1 - t, 3);
    }

    stop() {
      if (this.rafId) {
        cancelAnimationFrame(this.rafId);
        this.rafId = null;
      }
    }
  }

  // ========================================
  // Slot Machine Controller
  // ========================================
  class SlotMachine {
    constructor(container, animationEngine) {
      this.container = container;
      this.animationEngine = animationEngine;
      this.columns = [];
      this.isSpinning = false;
    }

    init() {
      // Check if we're using premium columns (dynamically generated)
      const premiumColumns = this.container.querySelectorAll('.slot-column');
      
      if (premiumColumns.length > 0) {
        // Premium version - use whatever columns exist
        this.columns = Array.from(premiumColumns).map((column, index) => {
          const itemsContainer = column.querySelector('.slot-items');
          const type = column.dataset.type || `column${index}`;
          return {
            type,
            element: column,
            itemsContainer,
            items: []
          };
        });
        console.log(`Initialized ${this.columns.length} premium columns`);
      } else {
        // Original version - look for specific data-type attributes
        const columnTypes = ['weapon', 'specialization', 'gadget1', 'gadget2', 'gadget3'];
        this.columns = columnTypes.map(type => {
          const column = this.container.querySelector(`[data-type="${type}"]`);
          if (!column) {
            console.warn(`Column not found for type: ${type}`);
            return null;
          }
          
          const itemsContainer = column.querySelector('.slot-items');
          return {
            type,
            element: column,
            itemsContainer,
            items: []
          };
        }).filter(Boolean);
      }
      
      // Populate slots with initial placeholder items to fill viewport
      if (this.columns.length > 0) {
        this.populateInitialItems();
      }
    }
    
    populateInitialItems() {
      console.log('🎰 Populating initial slot items...');
      
      this.columns.forEach(column => {
        const { itemsContainer, element } = column;
        
        // Clear any existing items
        itemsContainer.innerHTML = '';
        
        // Generate enough items to fill viewport
        const isMobile = window.innerWidth <= 768;
        const totalItems = isMobile ? 150 : 50; // 150 items on mobile, 50 on desktop
        
        console.log(`📱 Initial population - Generating ${totalItems} placeholder items (${isMobile ? 'Mobile' : 'Desktop'})`);
        
        // Generate placeholder items
        const items = [];
        for (let i = 0; i < totalItems; i++) {
          const div = document.createElement('div');
          div.className = 'slot-item';
          div.innerHTML = `
            <div class="slot-item-icon" style="background: linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%); width: 48px; height: 48px; border-radius: 8px;"></div>
            <div class="slot-item-name" style="color: rgba(255,255,255,0.3); font-size: 0.75rem;">-</div>
          `;
          items.push(div);
          itemsContainer.appendChild(div);
        }
        
        column.items = items;
        column.initialItemCount = totalItems;
      });
    }

    async spin(loadout, spinCount = 1, totalSpins = 1) {
      // Allow multiple spins in sequence
      this.updateSpinCounter(spinCount, totalSpins);
      
      // Generate items for each column only on first spin
      if (spinCount === 1) {
        this.columns.forEach(column => {
          this.populateColumn(column, loadout);
        });
      }

      // Animate all columns simultaneously
      const animations = this.columns.map(column => 
        this.animateColumn(column, spinCount === totalSpins)
      );

      await Promise.all(animations);
      
      if (spinCount === totalSpins) {
        this.highlightWinners();
      }
    }

    populateColumn(column, loadout) {
      const { itemsContainer, type } = column;
      
      // Clear existing items
      itemsContainer.innerHTML = '';
      
      // Generate enough items to fill viewport
      const isMobile = window.innerWidth <= 768;
      const totalItems = isMobile ? 150 : 50; // 150 items on mobile, 50 on desktop
      const winnerIndex = Math.floor(totalItems / 2); // Winner in the middle (75 on mobile, 25 on desktop)
      
      console.log(`🎰 Populating ${type} - ${totalItems} items (${isMobile ? 'Mobile' : 'Desktop'}), winner at ${winnerIndex}`);
      
      // Generate items with responsive count
      const items = [];
      for (let i = 0; i < totalItems; i++) {
        const item = this.createItem(type, loadout, i === winnerIndex);
        items.push(item);
        itemsContainer.appendChild(item);
      }
      
      column.items = items;
      column.winnerIndex = winnerIndex; // Store for animation reference
      
      // Get actual item height for animation calculations
      if (items.length > 0) {
        column.itemHeight = items[0].offsetHeight || 80;
      } else {
        column.itemHeight = 80;
      }
      
      // Log winner item for debugging
      const winnerItem = items[winnerIndex];
      if (winnerItem && winnerItem.dataset.winner === 'true') {
        console.log(`✅ Winner item confirmed at index ${winnerIndex} for ${type}`);
      }
    }

    createItem(type, loadout, isWinner = false) {
      const div = document.createElement('div');
      div.className = 'slot-item';
      if (isWinner) div.dataset.winner = 'true';
      
      let content = '';
      let imgSrc = '';
      
      if (type === 'weapon') {
        content = isWinner ? loadout.weapon : this.getRandomItem('weapon', loadout.class);
      } else if (type === 'specialization') {
        content = isWinner ? loadout.specialization : this.getRandomItem('specialization', loadout.class);
      } else if (type.startsWith('gadget')) {
        const gadgetIndex = parseInt(type.slice(-1)) - 1;
        content = isWinner ? loadout.gadgets[gadgetIndex] : this.getRandomItem('gadget', loadout.class);
      }
      
      imgSrc = this.getItemImage(content);
      
      div.innerHTML = `
        <img src="${imgSrc}" alt="${content}" loading="lazy">
        <div class="slot-item-text">${content}</div>
      `;
      
      return div;
    }

    getRandomItem(type, className) {
      const data = GameData.loadouts[className];
      let pool = [];
      
      if (type === 'weapon') {
        pool = data.weapons;
      } else if (type === 'specialization') {
        pool = data.specializations;
      } else if (type === 'gadget') {
        pool = data.gadgets;
      }
      
      return pool[Math.floor(Math.random() * pool.length)];
    }

    getItemImage(itemName) {
      if (!itemName) return '';
      
      // Convert to match actual file naming convention:
      // "Charge N Slam" -> "Charge_N_Slam.webp"
      // "M60" -> "M60.webp"
      // "RPG-7" -> "RPG-7.webp"
      
      // First, handle special cases
      const specialCases = {
        // Light weapons
        '93R': '93R',
        'AKM-220': 'ARN-220',
        'Dagger': 'Dagger',
        'LH1': 'LH1',
        'M11': 'M11',
        'M26 Matter': 'M26_Mattock',
        'Recurve Bow': 'Recurve_Bow',
        'SH1900': 'SH1900',
        'SR-84': 'SR-84',
        'Sword': 'Sword',
        'V9S': 'V9S',
        'XP-54': 'XP-54',
        'Throwing Knives': 'Throwing_Knives',
        // Medium weapons
        'AKM': 'AKM',
        'CK-01 Repeater': 'CB-01_Repeater',
        'Cerberus 52GA': 'Cerberus_12GA',
        'CL-40': 'CL-40',
        'Dual Blades': 'Dual_Blades',
        'FAMAS': 'FAMAS',
        'FCAR': 'FCAR',
        'Model 1887': 'Model_1887',
        'PIKE-556': 'PIKE-556',
        'R.357': 'R.357',
        'Riot Shield': 'Riot_Shield',
        // Heavy weapons
        'SH1 Akimbo': '50_Akimbo',
        'Flamethrower': 'Flamethrower',
        'KS-23': 'KS-23',
        'Lewis Gun': 'Lewis_Gun',
        'M134 Minigun': 'M134_Minigun',
        'M60': 'M60',
        'MGL32': 'MGL32',
        'SA1216': 'SA1216',
        'SHAK-50': 'SHAK-50',
        'Sledgehammer': 'Sledgehammer',
        'Spear': 'Spear',
        // Gadgets
        'H+ Diffuser': 'H+_Infuser',
        'Anti-Gravity Cube': 'Anti-Gravity_Cube',
        'APS Turret': 'APS_Turret',
        'C4': 'C4',
        'RPG-7': 'RPG-7',
        // Additional mappings for special formatting
        'Nullifier': 'Stun_Gun',
        'Lockbolt': 'Lockbolt_Launcher',
        'Night Vision': 'Night_Vision_Goggles'
      };
      
      // Add missing items to special cases
      const additionalCases = {
        'Stun Gun': 'Stun_Gun',
        'Motion Sensor': 'Motion_Sensor'
      };
      
      // Check if it's a special case
      if (specialCases[itemName]) {
        return `/images/${specialCases[itemName]}.webp`;
      }
      if (additionalCases[itemName]) {
        return `/images/${additionalCases[itemName]}.webp`;
      }
      
      // For regular items, convert spaces to underscores and capitalize each word
      const normalized = itemName
        .split(' ')
        .map(word => {
          // Handle words like "N" in "Charge N Slam"
          if (word.length === 1) return word.toUpperCase();
          // Capitalize first letter, rest lowercase
          return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
        })
        .join('_');
      
      return `/images/${normalized}.webp`;
    }

    async animateColumn(column, isFinalSpin) {
      const { itemsContainer } = column;
      const duration = isFinalSpin ? CONFIG.ANIMATION.SPIN_DURATION : CONFIG.ANIMATION.SPIN_DURATION * 0.3;
      
      // Reset position to top
      itemsContainer.style.transform = 'translateY(0)';
      
      // Use stored values from populateColumn for accuracy
      const winnerIndex = column.winnerIndex || 20;
      const itemHeight = column.itemHeight || 80;
      
      // Get the actual viewport height
      const slotWindow = column.element.querySelector('.slot-window');
      const viewportHeight = slotWindow ? slotWindow.offsetHeight : 240;
      
      // Mobile needs different calculation due to different viewport
      const isMobile = window.innerWidth <= 768;
      
      // Calculate where to position the winner
      // We want the winner item to be in the center of the viewport
      let targetPosition;
      if (isMobile) {
        // On mobile, account for larger viewport and more items
        // Winner is at index 125 out of 250 items
        const itemsAboveViewport = winnerIndex - Math.floor(viewportHeight / itemHeight / 2);
        targetPosition = -(itemsAboveViewport * itemHeight);
      } else {
        // Desktop calculation (unchanged)
        const centerOffset = (viewportHeight - itemHeight) / 2;
        targetPosition = -(winnerIndex * itemHeight - centerOffset);
      }
      
      console.log(`🎯 Animation: Winner ${winnerIndex}, Item Height: ${itemHeight}px, Viewport: ${viewportHeight}px, Target: ${targetPosition}px, Mobile: ${isMobile}`);
      
      await this.animationEngine.spin(itemsContainer, duration, targetPosition);
      
      // Extra log to confirm final position
      if (isFinalSpin) {
        setTimeout(() => {
          const winners = column.element.querySelectorAll('[data-winner="true"]');
          console.log(`🏆 Final check - Found ${winners.length} winner in ${column.type}`);
        }, duration + 100);
      }
    }

    highlightWinners() {
      // Add winner class to winning items
      this.container.querySelectorAll('[data-winner="true"]').forEach(item => {
        item.classList.add('winner');
      });
      
      // Announce to screen readers
      this.announceWinners();
    }

    announceWinners() {
      const announcement = document.getElementById('announcements');
      if (announcement) {
        const winners = Array.from(this.container.querySelectorAll('[data-winner="true"] .slot-item-text'))
          .map(el => el.textContent)
          .join(', ');
        
        announcement.textContent = `Loadout generated: ${winners}`;
      }
    }

    updateSpinCounter(current, total) {
      const counter = document.getElementById('spin-counter');
      if (counter) {
        counter.querySelector('.current').textContent = current;
        counter.querySelector('.total').textContent = total;
        counter.classList.add('visible');
      }
    }

    reset() {
      this.columns.forEach(column => {
        if (column.itemsContainer) {
          column.itemsContainer.style.transform = 'translateY(0)';
          column.itemsContainer.innerHTML = '';
        }
      });
      
      const counter = document.getElementById('spin-counter');
      if (counter) {
        counter.classList.remove('visible');
      }
    }
  }

  // ========================================
  // UI Controller
  // ========================================
  class UIController {
    constructor(stateManager, slotMachine) {
      this.state = stateManager;
      this.slotMachine = slotMachine;
      this.init();
    }

    init() {
      this.bindClassSelection();
      this.bindGenerateButton();
      this.bindSoundToggle();
      this.bindHistoryPanel();
      this.bindKeyboardShortcuts();
      this.updateUI();
    }

    bindClassSelection() {
      document.querySelectorAll('.class-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          const selectedClass = btn.dataset.class;
          
          // Update active state
          document.querySelectorAll('.class-btn').forEach(b => {
            b.classList.remove('active');
            b.setAttribute('aria-pressed', 'false');
          });
          
          btn.classList.add('active');
          btn.setAttribute('aria-pressed', 'true');
          
          // Capitalize first letter for state
          const className = selectedClass.charAt(0).toUpperCase() + selectedClass.slice(1);
          this.state.set('selectedClass', className);
          
          // Enable generate button
          const generateBtn = document.getElementById('generate-btn');
          if (generateBtn) {
            generateBtn.disabled = false;
          }
        });
      });
    }

    bindGenerateButton() {
      const generateBtn = document.getElementById('generate-btn');
      const spinAgainBtn = document.getElementById('spin-again-btn');
      
      if (generateBtn) {
        generateBtn.addEventListener('click', this.debounce(() => {
          this.generateLoadout();
        }, CONFIG.UI.DEBOUNCE_DELAY));
      }
      
      if (spinAgainBtn) {
        spinAgainBtn.addEventListener('click', this.debounce(() => {
          this.generateLoadout();
        }, CONFIG.UI.DEBOUNCE_DELAY));
      }
    }

    async generateLoadout() {
      const selectedClass = this.state.get('selectedClass');
      if (!selectedClass || this.state.get('isGenerating')) return;
      
      this.state.set('isGenerating', true);
      this.updateGenerateButton(true);
      
      try {
        // Generate random loadout
        const loadout = this.createRandomLoadout(selectedClass);
        
        // Determine number of spins (2-5)
        const totalSpins = Math.floor(Math.random() * 4) + 2;
        
        // Run spin sequence
        for (let i = 1; i <= totalSpins; i++) {
          await this.slotMachine.spin(loadout, i, totalSpins);
          
          if (i < totalSpins) {
            await this.delay(100); // Small delay between spins
          }
        }
        
        // Save to history
        this.addToHistory(loadout);
        
        // Show spin again button
        this.showSpinAgain();
        
      } catch (error) {
        console.error('Failed to generate loadout:', error);
        this.showError('Failed to generate loadout. Please try again.');
      } finally {
        this.state.set('isGenerating', false);
        this.updateGenerateButton(false);
      }
    }

    createRandomLoadout(className) {
      const data = GameData.loadouts[className];
      
      // Select random items
      const weapon = data.weapons[Math.floor(Math.random() * data.weapons.length)];
      const specialization = data.specializations[Math.floor(Math.random() * data.specializations.length)];
      
      // Select 3 unique gadgets
      const gadgets = [];
      const availableGadgets = [...data.gadgets];
      
      for (let i = 0; i < 3; i++) {
        const index = Math.floor(Math.random() * availableGadgets.length);
        gadgets.push(availableGadgets[index]);
        availableGadgets.splice(index, 1);
      }
      
      return {
        class: className,
        weapon,
        specialization,
        gadget1: gadgets[0],
        gadget2: gadgets[1],
        gadget3: gadgets[2],
        gadgets,
        timestamp: Date.now()
      };
    }

    addToHistory(loadout) {
      const history = this.state.get('history');
      history.unshift(loadout);
      
      // Limit history size
      if (history.length > CONFIG.STORAGE.MAX_HISTORY) {
        history.pop();
      }
      
      this.state.set('history', history);
      this.state.saveHistory(history);
      this.updateHistoryPanel();
    }

    updateHistoryPanel() {
      const historyContent = document.getElementById('history-content');
      if (!historyContent) return;
      
      const history = this.state.get('history');
      
      if (history.length === 0) {
        historyContent.innerHTML = '<p class="history-empty">No loadouts generated yet</p>';
        return;
      }
      
      historyContent.innerHTML = history.map((item, index) => `
        <div class="history-item" data-index="${index}">
          <div class="history-class">${item.class}</div>
          <div class="history-details">
            <div class="history-weapon">⚔️ ${item.weapon}</div>
            <div class="history-spec">⭐ ${item.specialization}</div>
            <div class="history-gadgets">
              🎯 ${item.gadgets.join(', ')}
            </div>
          </div>
          <div class="history-time">${this.formatTime(item.timestamp)}</div>
        </div>
      `).join('');
    }

    formatTime(timestamp) {
      const now = Date.now();
      const diff = now - timestamp;
      
      if (diff < 60000) return 'Just now';
      if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
      if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
      return `${Math.floor(diff / 86400000)}d ago`;
    }

    bindSoundToggle() {
      const soundToggle = document.getElementById('sound-toggle');
      if (soundToggle) {
        soundToggle.addEventListener('click', () => {
          const enabled = !this.state.get('soundEnabled');
          this.state.set('soundEnabled', enabled);
          this.state.saveSetting('soundEnabled', enabled);
          
          soundToggle.classList.toggle('muted', !enabled);
          soundToggle.setAttribute('aria-pressed', enabled.toString());
        });
      }
    }

    bindHistoryPanel() {
      const historyToggle = document.getElementById('history-toggle');
      const historyPanel = document.getElementById('history-panel');
      const closeHistory = document.getElementById('close-history');
      const clearHistory = document.getElementById('clear-history');
      
      if (historyToggle && historyPanel) {
        historyToggle.addEventListener('click', () => {
          const isOpen = historyPanel.classList.contains('open');
          historyPanel.classList.toggle('open');
          historyToggle.setAttribute('aria-expanded', (!isOpen).toString());
        });
      }
      
      if (closeHistory && historyPanel) {
        closeHistory.addEventListener('click', () => {
          historyPanel.classList.remove('open');
          historyToggle?.setAttribute('aria-expanded', 'false');
        });
      }
      
      if (clearHistory) {
        clearHistory.addEventListener('click', () => {
          if (confirm('Clear all loadout history?')) {
            this.state.set('history', []);
            this.state.saveHistory([]);
            this.updateHistoryPanel();
          }
        });
      }
    }

    bindKeyboardShortcuts() {
      document.addEventListener('keydown', (e) => {
        // Space or Enter to generate when button focused
        if ((e.key === ' ' || e.key === 'Enter') && document.activeElement.id === 'generate-btn') {
          e.preventDefault();
          this.generateLoadout();
        }
        
        // Escape to close history panel
        if (e.key === 'Escape') {
          const historyPanel = document.getElementById('history-panel');
          if (historyPanel?.classList.contains('open')) {
            historyPanel.classList.remove('open');
          }
        }
        
        // Number keys for class selection
        if (e.key >= '1' && e.key <= '3' && !e.ctrlKey && !e.metaKey) {
          const classes = ['light', 'medium', 'heavy'];
          const classBtn = document.querySelector(`[data-class="${classes[parseInt(e.key) - 1]}"]`);
          if (classBtn) {
            classBtn.click();
          }
        }
      });
    }

    updateGenerateButton(isGenerating) {
      const generateBtn = document.getElementById('generate-btn');
      if (generateBtn) {
        generateBtn.disabled = isGenerating || !this.state.get('selectedClass');
        generateBtn.textContent = isGenerating ? 'GENERATING...' : 'GENERATE LOADOUT';
      }
    }

    showSpinAgain() {
      const generateBtn = document.getElementById('generate-btn');
      const spinAgainBtn = document.getElementById('spin-again-btn');
      
      if (generateBtn && spinAgainBtn) {
        generateBtn.style.display = 'none';
        spinAgainBtn.style.display = 'block';
      }
    }

    updateUI() {
      // Set initial sound toggle state
      const soundToggle = document.getElementById('sound-toggle');
      if (soundToggle) {
        const enabled = this.state.get('soundEnabled');
        soundToggle.classList.toggle('muted', !enabled);
        soundToggle.setAttribute('aria-pressed', enabled.toString());
      }
      
      // Update history panel
      this.updateHistoryPanel();
      
      // Disable generate button initially
      const generateBtn = document.getElementById('generate-btn');
      if (generateBtn) {
        generateBtn.disabled = true;
      }
    }

    showError(message) {
      const announcement = document.getElementById('announcements');
      if (announcement) {
        announcement.textContent = `Error: ${message}`;
      }
      
      // Could also show a visual error toast here
      console.error(message);
    }

    debounce(func, wait) {
      let timeout;
      return function executedFunction(...args) {
        const later = () => {
          clearTimeout(timeout);
          func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
      };
    }

    delay(ms) {
      return new Promise(resolve => setTimeout(resolve, ms));
    }
  }

  // ========================================
  // Application Initialization
  // ========================================
  class Application {
    constructor() {
      this.stateManager = new StateManager();
      this.animationEngine = new AnimationEngine();
      this.slotMachine = null;
      this.uiController = null;
    }

    init() {
      // Wait for DOM to be ready
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => this.setup());
      } else {
        this.setup();
      }
    }

    setup() {
      try {
        // Initialize slot machine
        const slotContainer = document.getElementById('slot-machine-container') || 
                            document.querySelector('.slot-machine');
        if (!slotContainer) {
          throw new Error('Slot machine container not found');
        }
        
        // Expose to window early so premium-integrated can access it
        window.FinalsLoadoutApp = this;
        window.app = this;
        
        // Wait a bit for premium columns to be created if they exist
        setTimeout(() => {
          this.slotMachine = new SlotMachine(slotContainer, this.animationEngine);
          this.slotMachine.init();
          
          // Initialize UI controller after slot machine is ready
          this.uiController = new UIController(this.stateManager, this.slotMachine);
          
          // Log successful initialization
          console.log('The Finals Loadout Generator v3 initialized successfully with initial items');
        }, 150); // Increased delay to ensure premium columns are ready
        
        // Announce to screen readers
        const announcement = document.getElementById('announcements');
        if (announcement) {
          announcement.textContent = 'Loadout generator ready. Select a class to begin.';
        }
        
      } catch (error) {
        console.error('Failed to initialize application:', error);
        this.handleInitError(error);
      }
    }

    handleInitError(error) {
      const container = document.querySelector('.main-content');
      if (container) {
        container.innerHTML = `
          <div class="error-container">
            <h2>Initialization Error</h2>
            <p>Failed to initialize the loadout generator.</p>
            <p>Please refresh the page and try again.</p>
            <details>
              <summary>Error Details</summary>
              <pre>${error.message}</pre>
            </details>
          </div>
        `;
      }
    }
  }

  // Start the application
  const app = new Application();
  app.init();

  // Export for debugging and compatibility
  window.FinalsLoadoutApp = app;
  window.app = app; // Also expose as 'app' for easier access

})();