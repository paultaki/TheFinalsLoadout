/**
 * SlotColumn.js - Individual slot column component
 * 
 * Represents a single column in the slot machine with its own DOM structure
 * and item management. Delegates animation physics to AnimationEngine.
 */

export class SlotColumn {
  constructor(options = {}) {
    this.index = options.index || 0;
    this.items = options.items || [];
    this.winningItem = options.winningItem || null;
    this.isGadget = options.isGadget || false;
    this.element = null;
    this.scrollContainer = null;
    this.containerElement = null;
  }

  /**
   * Render the slot column DOM structure
   * @returns {string} HTML string for the column
   */
  render() {
    const itemsHTML = this.createItemsHTML();
    const dataAttributes = this.getDataAttributes();
    
    return `
      <div class="item-container" ${dataAttributes}>
        <div class="scroll-container" ${this.getScrollContainerAttributes()}>
          ${itemsHTML}
        </div>
      </div>
    `;
  }

  /**
   * Create HTML for all items in the column
   * @returns {string} HTML string for items
   */
  createItemsHTML() {
    if (this.isGadget) {
      // For gadgets, first item is the winner
      return this.items.map((item, index) => `
        <div class="itemCol ${index === 0 ? "winner" : ""}" data-item-name="${item}">
          <img src="images/${item.replace(/ /g, "_")}.webp" alt="${item}" loading="lazy">
          <p>${item}</p>
        </div>
      `).join("");
    }
    
    // For weapons/specializations, winner is at index 4
    // Create repeated pattern for smooth scrolling
    const itemCount = this.items.length;
    const repeatedItems = [];
    
    // Ensure winner is at position 4
    if (this.winningItem) {
      // Create pattern: shuffle, shuffle, shuffle, shuffle, WINNER, shuffle, shuffle, shuffle
      const shuffled = [...this.items].sort(() => Math.random() - 0.5);
      
      for (let i = 0; i < 8; i++) {
        if (i === 4) {
          repeatedItems.push(this.winningItem);
        } else {
          repeatedItems.push(shuffled[i % shuffled.length]);
        }
      }
    } else {
      // No specific winner - just repeat items
      for (let i = 0; i < 8; i++) {
        repeatedItems.push(this.items[i % itemCount]);
      }
    }
    
    return repeatedItems.map((item, index) => `
      <div class="itemCol ${index === 4 ? "winner" : ""}">
        <img src="images/${item.replace(/ /g, "_")}.webp" alt="${item}" loading="lazy">
        <p>${item}</p>
      </div>
    `).join("");
  }

  /**
   * Get data attributes for gadget columns
   * @returns {string} Data attribute string
   */
  getDataAttributes() {
    if (!this.isGadget || !this.winningItem) return '';
    
    const escapedGadget = this.winningItem
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
    
    return `data-winning-gadget="${escapedGadget}" data-original-gadget="${this.winningItem}" data-gadget-position="${this.index - 2}"`;
  }

  /**
   * Get scroll container attributes
   * @returns {string} Attribute string
   */
  getScrollContainerAttributes() {
    if (!this.isGadget || !this.winningItem) return '';
    
    const escapedGadget = this.winningItem
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
    
    return `data-gadget-index="${this.index - 2}" data-winning-gadget="${escapedGadget}"`;
  }

  /**
   * Initialize the column after DOM insertion
   * @param {HTMLElement} containerElement - The item-container element
   */
  initialize(containerElement) {
    this.containerElement = containerElement;
    this.scrollContainer = containerElement.querySelector('.scroll-container');
    
    if (!this.scrollContainer) {
      console.error(`SlotColumn ${this.index}: No scroll container found`);
      return;
    }
    
    // Store reference for animation
    this.element = this.scrollContainer;
  }

  /**
   * Get the scroll container element for animation
   * @returns {HTMLElement|null} The scroll container element
   */
  getAnimationElement() {
    return this.scrollContainer;
  }

  /**
   * Reset the column to initial state
   */
  reset() {
    if (!this.containerElement) return;
    
    // Remove animation classes
    this.containerElement.classList.remove('landing-flash', 'winner-pulsate', 'locked', 'locking');
    
    // Remove any locked tags
    const lockedTag = this.containerElement.querySelector('.locked-tag');
    if (lockedTag) {
      lockedTag.remove();
    }
    
    // Reset scroll position
    if (this.scrollContainer) {
      this.scrollContainer.style.transform = 'translateY(0)';
      this.scrollContainer.style.transition = 'none';
    }
  }

  /**
   * Update items and re-render
   * @param {Array} items - New items array
   * @param {string} winningItem - New winning item
   */
  updateItems(items, winningItem) {
    this.items = items;
    this.winningItem = winningItem;
    
    if (this.scrollContainer) {
      this.scrollContainer.innerHTML = this.createItemsHTML();
    }
  }

  /**
   * Lock in the column with visual effects
   */
  lockIn() {
    if (!this.containerElement) return;
    
    this.containerElement.classList.add('locked', 'locking');
    
    // Remove locking class after animation
    setTimeout(() => {
      this.containerElement.classList.remove('locking');
    }, 300);
  }

  /**
   * Add winner effects
   */
  addWinnerEffects() {
    if (!this.containerElement) return;
    
    this.containerElement.classList.add('landing-flash');
    
    setTimeout(() => {
      this.containerElement.classList.add('winner-pulsate');
    }, 300);
  }

  /**
   * Get the winning item for this column
   * @returns {string|null} The winning item name
   */
  getWinningItem() {
    if (this.isGadget) {
      // For gadgets, check data attributes first
      return this.containerElement?.dataset.winningGadget || 
             this.scrollContainer?.dataset.winningGadget || 
             this.winningItem;
    }
    
    // For weapons/specs, find the item at index 4 or marked as winner
    const winnerElement = this.scrollContainer?.querySelector('.itemCol.winner p');
    return winnerElement?.textContent || this.winningItem;
  }

  /**
   * Clean up the column
   */
  destroy() {
    this.reset();
    this.element = null;
    this.scrollContainer = null;
    this.containerElement = null;
  }
}