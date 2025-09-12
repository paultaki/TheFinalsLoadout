/**
 * Debug script to check winner highlighting
 */

(function() {
  'use strict';
  
  console.log('🔍 Winner Debug Script Loaded');
  
  // Check for winners every 2 seconds
  setInterval(() => {
    const winners = document.querySelectorAll('[data-winner="true"]');
    const highlighted = document.querySelectorAll('.winner');
    const isMobile = window.innerWidth <= 768;
    
    console.log(`📱 View: ${isMobile ? 'Mobile' : 'Desktop'}`);
    console.log(`🎯 Winners found: ${winners.length}`);
    console.log(`✨ Highlighted: ${highlighted.length}`);
    
    if (winners.length > 0) {
      winners.forEach((winner, i) => {
        const rect = winner.getBoundingClientRect();
        const parent = winner.closest('.slot-window');
        const parentRect = parent ? parent.getBoundingClientRect() : null;
        
        if (parentRect) {
          const relativeTop = rect.top - parentRect.top;
          const isVisible = relativeTop >= 0 && relativeTop <= parentRect.height;
          
          console.log(`  Winner ${i}: ${winner.querySelector('.slot-item-name')?.textContent || 'unknown'}`);
          console.log(`    Position: ${relativeTop}px from top`);
          console.log(`    Visible: ${isVisible ? '✅' : '❌'}`);
          console.log(`    Has .winner class: ${winner.classList.contains('winner') ? '✅' : '❌'}`);
        }
      });
    }
  }, 2000);
  
  // Add manual highlight function
  window.forceHighlight = function() {
    console.log('🎨 Forcing winner highlight...');
    document.querySelectorAll('[data-winner="true"]').forEach(item => {
      item.classList.add('winner');
      item.style.background = 'rgba(255, 51, 102, 0.3)';
      item.style.border = '2px solid #ff3366';
    });
  };
  
  // Add function to check animation positions
  window.checkPositions = function() {
    const columns = document.querySelectorAll('.slot-items');
    columns.forEach((col, i) => {
      const transform = col.style.transform;
      const match = transform.match(/translateY\(([-\d.]+)px\)/);
      const position = match ? parseFloat(match[1]) : 0;
      
      console.log(`Column ${i}: ${position}px`);
      
      // Find winner in this column
      const winner = col.querySelector('[data-winner="true"]');
      if (winner) {
        const index = Array.from(col.children).indexOf(winner);
        console.log(`  Winner at index: ${index}`);
      }
    });
  };
  
})();