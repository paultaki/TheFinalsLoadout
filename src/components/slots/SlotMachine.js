/**
 * SlotMachine.js - Main slot machine component
 * 
 * Manages the overall slot machine setup, initialization, and coordination
 * between slot columns. Handles spinning animation and completion callbacks.
 */

import { SlotColumn } from './SlotColumn.js';
import { startSlotAnimation } from '../../animation/AnimationEngine.js';
import { SLOT_TIMING } from '../../core/Constants.js';

export class SlotMachine {
  constructor(options = {}) {
    this.containerId = options.containerId || 'output';
    this.onComplete = options.onComplete || (() => {});
    this.onSpinStart = options.onSpinStart || (() => {});
    this.columns = [];
    this.container = null;
    this.isSpinning = false;
  }

  /**
   * Initialize the slot machine with loadout data
   * @param {Object} config - Configuration object
   * @param {string} config.classType - The class type (Light, Medium, Heavy)
   * @param {Object} config.loadout - The loadout data
   * @param {string} config.selectedWeapon - Selected weapon
   * @param {string} config.selectedSpec - Selected specialization
   * @param {Array} config.selectedGadgets - Selected gadgets array
   * @param {Array} config.gadgetSequences - Pre-generated gadget sequences
   * @param {number} config.currentSpin - Current spin number
   * @param {boolean} config.isFinalSpin - Whether this is the final spin
   */
  initialize(config) {
    this.classType = config.classType;
    this.loadout = config.loadout;
    this.selectedWeapon = config.selectedWeapon;
    this.selectedSpec = config.selectedSpec;
    this.selectedGadgets = config.selectedGadgets;
    this.gadgetSequences = config.gadgetSequences;
    this.currentSpin = config.currentSpin;
    this.isFinalSpin = config.isFinalSpin;
    
    // Create slot columns
    this.createColumns();
  }

  /**
   * Create slot column instances
   */
  createColumns() {
    this.columns = [];
    
    // Weapon column (index 0)
    this.columns.push(new SlotColumn({
      index: 0,
      items: this.loadout.weapons,
      winningItem: this.selectedWeapon,
      isGadget: false
    }));
    
    // Specialization column (index 1)
    this.columns.push(new SlotColumn({
      index: 1,
      items: this.loadout.specializations,
      winningItem: this.selectedSpec,
      isGadget: false
    }));
    
    // Gadget columns (index 2, 3, 4)
    this.selectedGadgets.forEach((gadget, index) => {
      this.columns.push(new SlotColumn({
        index: index + 2,
        items: this.gadgetSequences[index],
        winningItem: gadget,
        isGadget: true
      }));
    });
  }

  /**
   * Render the slot machine to the DOM
   * @returns {HTMLElement} The container element
   */
  render() {
    const container = document.getElementById(this.containerId);
    if (!container) {
      console.error(`Container #${this.containerId} not found`);
      return null;
    }
    
    this.container = container;
    
    // Build the slot machine HTML
    const html = this.buildHTML();
    
    // Insert into DOM
    container.innerHTML = html;
    container.style.opacity = '1';
    container.style.display = 'block';
    
    // Initialize columns with their DOM elements
    this.initializeColumns();
    
    return container;
  }

  /**
   * Build the complete slot machine HTML
   * @returns {string} HTML string
   */
  buildHTML() {
    const spinInfo = this.currentSpin > 1 ? ` - ${this.currentSpin} spins remaining` : '';
    
    const columnsHTML = this.columns.map(column => column.render()).join('');
    
    // Check if we're in overlay mode by looking for the overlay container
    const isInOverlay = this.container && this.container.closest('.slot-machine-overlay');
    
    // Only show class info if NOT in overlay (overlay has its own header)
    const classInfoHTML = !isInOverlay ? `
      <div class="class-info-display" style="text-align: center; margin-bottom: 20px; font-size: 24px; font-weight: bold; color: #fff;">
        ${this.classType} Class${spinInfo}
      </div>
    ` : '';
    
    return `
      ${classInfoHTML}
      <div class="slot-machine-wrapper">
        <div class="items-container">
          ${columnsHTML}
        </div>
      </div>
    `;
  }

  /**
   * Initialize column instances with their DOM elements
   */
  initializeColumns() {
    const itemContainers = this.container.querySelectorAll('.item-container');
    
    itemContainers.forEach((container, index) => {
      if (this.columns[index]) {
        this.columns[index].initialize(container);
      }
    });
  }

  /**
   * Start the spin animation
   * @param {Object} options - Animation options
   * @returns {Promise} Resolves when animation completes
   */
  async spin(options = {}) {
    if (this.isSpinning) {
      console.warn('Slot machine is already spinning');
      return;
    }
    
    this.isSpinning = true;
    this.onSpinStart();
    
    // Get animation elements from columns
    const animationElements = this.columns
      .map(column => column.getAnimationElement())
      .filter(element => element !== null);
    
    if (animationElements.length === 0) {
      console.error('No animation elements found');
      this.isSpinning = false;
      return;
    }
    
    try {
      // Start the animation
      await startSlotAnimation(animationElements, {
        isFinalSpin: this.isFinalSpin,
        soundEnabled: options.soundEnabled !== false,
        onComplete: () => {
          this.isSpinning = false;
          this.onAnimationComplete();
        }
      });
    } catch (error) {
      console.error('Animation error:', error);
      this.isSpinning = false;
      this.onComplete(error);
    }
  }

  /**
   * Start spinning after a delay
   * @param {number} delay - Delay in milliseconds
   * @param {Object} options - Animation options
   */
  startSpinWithDelay(delay = SLOT_TIMING.ANIMATION_START_DELAY, options = {}) {
    setTimeout(() => {
      this.spin(options);
    }, delay);
  }

  /**
   * Handle animation completion
   */
  onAnimationComplete() {
    // Add winner effects if final spin
    if (this.isFinalSpin) {
      this.columns.forEach((column, index) => {
        setTimeout(() => {
          column.addWinnerEffects();
        }, index * SLOT_TIMING.COLUMN_STOP_DELAY);
      });
    }
    
    // Get final results
    const results = this.getResults();
    
    // Call completion callback
    this.onComplete(null, results);
  }

  /**
   * Get the results from all columns
   * @returns {Object} Results object
   */
  getResults() {
    const [weaponColumn, specColumn, ...gadgetColumns] = this.columns;
    
    return {
      classType: this.classType,
      weapon: weaponColumn.getWinningItem(),
      specialization: specColumn.getWinningItem(),
      gadgets: gadgetColumns.map(column => column.getWinningItem()),
      columns: this.columns.map(column => column.getAnimationElement())
    };
  }

  /**
   * Reset all columns to initial state
   */
  reset() {
    this.columns.forEach(column => column.reset());
    this.isSpinning = false;
  }

  /**
   * Update the slot machine with new data
   * @param {Object} config - New configuration
   */
  update(config) {
    this.reset();
    this.initialize(config);
    this.render();
  }

  /**
   * Get specific column by index
   * @param {number} index - Column index
   * @returns {SlotColumn|null} The column instance
   */
  getColumn(index) {
    return this.columns[index] || null;
  }

  /**
   * Check if currently spinning
   * @returns {boolean} Spinning state
   */
  getIsSpinning() {
    return this.isSpinning;
  }

  /**
   * Clean up the slot machine
   */
  destroy() {
    this.reset();
    this.columns.forEach(column => column.destroy());
    this.columns = [];
    
    if (this.container) {
      this.container.innerHTML = '';
      this.container.style.opacity = '0';
      this.container.style.display = 'none';
    }
    
    this.container = null;
  }
}