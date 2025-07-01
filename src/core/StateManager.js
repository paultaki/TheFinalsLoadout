/**
 * Central State Management with pub-sub pattern
 * Replaces global window.state
 */

export class StateManager {
  constructor() {
    // Initial state definition
    this.state = {
      selectedClass: null, // Deprecated - class selection removed
      isSpinning: false,
      currentSpin: 1,
      totalSpins: 0,
      selectedGadgets: new Set(),
      currentGadgetPool: new Set(),
      soundEnabled: this.loadSoundPreference(),
      isMobile: this.detectMobile(),
      sidebarOpen: false,
      // Animation states
      isRouletteAnimating: false,
      isPriceWheelAnimating: false,
      activeOverlay: null
    };
    
    // Subscribers for state changes
    this.subscribers = new Map();
    
    // State change history for debugging
    this.stateHistory = [];
    this.maxHistoryLength = 50;
    
    // Bind methods
    this.get = this.get.bind(this);
    this.set = this.set.bind(this);
    this.subscribe = this.subscribe.bind(this);
  }
  
  /**
   * Get current state value
   * @param {string} key - Optional key for specific value
   * @returns {*} State value or entire state
   */
  get(key) {
    if (key) {
      // Handle nested keys like "timing.spin"
      const keys = key.split('.');
      let value = this.state;
      
      for (const k of keys) {
        if (value && typeof value === 'object' && k in value) {
          value = value[k];
        } else {
          return undefined;
        }
      }
      
      return value;
    }
    
    // Return a shallow copy to prevent direct mutations
    return { ...this.state };
  }
  
  /**
   * Set state value and notify subscribers
   * @param {string|object} keyOrObject - Key or object to merge
   * @param {*} value - Value if key provided
   */
  set(keyOrObject, value) {
    const oldState = { ...this.state };
    let changes = {};
    
    if (typeof keyOrObject === 'object') {
      // Merge object
      changes = keyOrObject;
      this.state = { ...this.state, ...keyOrObject };
    } else {
      // Set single value
      changes = { [keyOrObject]: value };
      this.state = { ...this.state, [keyOrObject]: value };
    }
    
    // Record in history
    this.recordHistory(oldState, changes);
    
    // Notify subscribers
    this.notifySubscribers(changes, oldState);
  }
  
  /**
   * Subscribe to state changes
   * @param {string|Array|Function} keyOrKeys - Key(s) to watch or callback for all changes
   * @param {Function} callback - Callback function
   * @returns {Function} Unsubscribe function
   */
  subscribe(keyOrKeys, callback) {
    let keys;
    let cb;
    
    if (typeof keyOrKeys === 'function') {
      // Subscribe to all changes
      keys = ['*'];
      cb = keyOrKeys;
    } else {
      keys = Array.isArray(keyOrKeys) ? keyOrKeys : [keyOrKeys];
      cb = callback;
    }
    
    // Generate unique ID for this subscription
    const id = Symbol('subscription');
    
    keys.forEach(key => {
      if (!this.subscribers.has(key)) {
        this.subscribers.set(key, new Map());
      }
      this.subscribers.get(key).set(id, cb);
    });
    
    // Return unsubscribe function
    return () => {
      keys.forEach(key => {
        const subs = this.subscribers.get(key);
        if (subs) {
          subs.delete(id);
          if (subs.size === 0) {
            this.subscribers.delete(key);
          }
        }
      });
    };
  }
  
  /**
   * Notify subscribers of state changes
   * @private
   */
  notifySubscribers(changes, oldState) {
    const notified = new Set();
    
    // Notify specific key subscribers
    Object.keys(changes).forEach(key => {
      const subs = this.subscribers.get(key);
      if (subs) {
        subs.forEach((callback, id) => {
          if (!notified.has(id)) {
            notified.add(id);
            callback(changes[key], oldState[key], key);
          }
        });
      }
    });
    
    // Notify wildcard subscribers
    const wildcardSubs = this.subscribers.get('*');
    if (wildcardSubs) {
      wildcardSubs.forEach((callback, id) => {
        if (!notified.has(id)) {
          callback(this.state, oldState, Object.keys(changes));
        }
      });
    }
  }
  
  /**
   * Record state change in history
   * @private
   */
  recordHistory(oldState, changes) {
    this.stateHistory.push({
      timestamp: Date.now(),
      changes,
      oldState,
      newState: { ...this.state }
    });
    
    // Trim history if too long
    if (this.stateHistory.length > this.maxHistoryLength) {
      this.stateHistory.shift();
    }
  }
  
  /**
   * Get state change history
   * @returns {Array} State history
   */
  getHistory() {
    return [...this.stateHistory];
  }
  
  /**
   * Clear state history
   */
  clearHistory() {
    this.stateHistory = [];
  }
  
  /**
   * Reset state to initial values
   */
  reset() {
    const initialState = {
      selectedClass: null,
      isSpinning: false,
      currentSpin: 1,
      totalSpins: 0,
      selectedGadgets: new Set(),
      currentGadgetPool: new Set(),
      soundEnabled: this.loadSoundPreference(),
      isMobile: this.detectMobile(),
      sidebarOpen: false,
      isRouletteAnimating: false,
      isPriceWheelAnimating: false,
      activeOverlay: null
    };
    
    this.set(initialState);
  }
  
  /**
   * Load sound preference from localStorage
   * @private
   */
  loadSoundPreference() {
    const stored = localStorage.getItem("soundEnabled");
    return stored === null ? true : stored !== "false";
  }
  
  /**
   * Detect mobile device
   * @private
   */
  detectMobile() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    ) || window.innerWidth <= 768;
  }
  
  /**
   * Persist state to localStorage
   */
  persist() {
    const persistableState = {
      soundEnabled: this.state.soundEnabled,
      totalSpins: this.state.totalSpins
    };
    
    localStorage.setItem('loadoutState', JSON.stringify(persistableState));
  }
  
  /**
   * Load state from localStorage
   */
  loadPersistedState() {
    try {
      const saved = localStorage.getItem('loadoutState');
      if (saved) {
        const parsed = JSON.parse(saved);
        this.set(parsed);
      }
    } catch (e) {
      console.warn('Failed to load persisted state:', e);
    }
  }
}

// Actions for common state updates
export class StateActions {
  constructor(stateManager) {
    this.state = stateManager;
  }
  
  startSpin() {
    this.state.set({
      isSpinning: true,
      currentSpin: this.state.get('currentSpin') + 1
    });
  }
  
  stopSpin() {
    this.state.set({
      isSpinning: false,
      totalSpins: this.state.get('totalSpins') + 1
    });
  }
  
  toggleSound() {
    const newValue = !this.state.get('soundEnabled');
    this.state.set('soundEnabled', newValue);
    localStorage.setItem('soundEnabled', String(newValue));
  }
  
  toggleSidebar() {
    this.state.set('sidebarOpen', !this.state.get('sidebarOpen'));
  }
  
  selectGadgets(gadgets) {
    this.state.set('selectedGadgets', new Set(gadgets));
  }
  
  setActiveOverlay(overlayType) {
    this.state.set('activeOverlay', overlayType);
  }
  
  clearActiveOverlay() {
    this.state.set('activeOverlay', null);
  }
}

// Create singleton instances
export const stateManager = new StateManager();
export const stateActions = new StateActions(stateManager);

// Legacy support - create window.state proxy that warns on usage
if (typeof window !== 'undefined') {
  window.state = new Proxy(stateManager.get(), {
    get(target, prop) {
      console.warn(`Deprecated: Accessing window.state.${prop}. Use stateManager.get('${prop}') instead.`);
      return stateManager.get(prop);
    },
    set(target, prop, value) {
      console.warn(`Deprecated: Setting window.state.${prop}. Use stateManager.set('${prop}', value) instead.`);
      stateManager.set(prop, value);
      return true;
    }
  });
}