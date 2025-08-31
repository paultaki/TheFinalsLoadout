/**
 * Slot Machine Mobile Fix
 * Dynamically adjusts item count to fill mobile viewport
 */

(function() {
  'use strict';
  
  console.log('🔧 Applying slot machine mobile fix...');
  
  // Wait for app to be ready
  function waitForApp(callback) {
    const checkApp = setInterval(() => {
      const app = window.FinalsLoadoutApp || window.app;
      if (app && app.slotMachine) {
        clearInterval(checkApp);
        callback(app);
      }
    }, 100);
  }
  
  waitForApp(function(app) {
    // Override the populateColumn method
    const originalPopulateColumn = app.slotMachine.populateColumn;
    
    app.slotMachine.populateColumn = function(column, loadout) {
      const { itemsContainer, type } = column;
      
      // Clear existing items
      itemsContainer.innerHTML = '';
      
      // Get actual rendered dimensions
      const slotWindow = column.element.querySelector('.slot-window');
      if (!slotWindow) {
        console.warn('Slot window not found, using original method');
        return originalPopulateColumn.call(this, column, loadout);
      }
      
      // Get computed styles
      const windowHeight = slotWindow.offsetHeight;
      const computedStyle = window.getComputedStyle(document.documentElement);
      const itemHeight = parseInt(computedStyle.getPropertyValue('--slot-item-height')) || 80;
      
      // Calculate items needed
      const visibleItems = Math.ceil(windowHeight / itemHeight);
      const bufferItems = 20; // Extra items for smooth scrolling
      const totalItems = Math.max(50, visibleItems + (bufferItems * 2)); // At least 50, or enough to fill + buffer
      
      // Calculate winner position
      // We want winner roughly in the middle of the generated items
      const winnerIndex = Math.floor(totalItems / 2);
      
      console.log(`📱 Mobile fix: Window height: ${windowHeight}px, Item height: ${itemHeight}px`);
      console.log(`📱 Generating ${totalItems} items (visible: ${visibleItems}, winner at: ${winnerIndex})`);
      
      // Generate items
      const items = [];
      for (let i = 0; i < totalItems; i++) {
        const item = this.createItem(type, loadout, i === winnerIndex);
        items.push(item);
        itemsContainer.appendChild(item);
      }
      
      column.items = items;
      column.winnerIndex = winnerIndex; // Store for animation reference
    };
    
    // Also need to update the animation to use the dynamic winner position
    const originalAnimateColumn = app.slotMachine.animateColumn;
    if (originalAnimateColumn) {
      app.slotMachine.animateColumn = function(column, isFinalSpin) {
        // Use the stored winner index if available
        const winnerIndex = column.winnerIndex || 20;
        const itemHeight = parseInt(window.getComputedStyle(document.documentElement).getPropertyValue('--slot-item-height')) || 80;
        const centerOffset = 80; // Offset to center the item in viewport
        const targetPosition = -(winnerIndex * itemHeight - centerOffset);
        
        // Store the target position for the animation
        column.targetPosition = targetPosition;
        
        // Call original with our calculated position
        return originalAnimateColumn.call(this, column, isFinalSpin);
      };
    }
    
    console.log('✅ Slot machine mobile fix applied successfully');
  });
  
})();