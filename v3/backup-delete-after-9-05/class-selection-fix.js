// Class Selection Fix - Ensures class buttons work properly
(function() {
  'use strict';
  
  // Wait for DOM and app to be ready
  function initClassSelection() {
    console.log('Initializing class selection fix...');
    
    const classButtons = document.querySelectorAll('.class-btn');
    const generateBtn = document.getElementById('generate-btn');
    
    if (!classButtons.length || !generateBtn) {
      console.error('Required elements not found');
      return;
    }
    
    console.log(`Found ${classButtons.length} class buttons`);
    
    // Store selected class
    let selectedClass = null;
    
    // Add click handlers to class buttons
    classButtons.forEach(btn => {
      btn.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        
        const thisClass = this.dataset.class;
        console.log(`Class button clicked: ${thisClass}`);
        
        // Remove active from all buttons
        classButtons.forEach(b => b.classList.remove('active'));
        
        // Add active to clicked button
        this.classList.add('active');
        
        // Update selected class
        selectedClass = thisClass;
        
        // Enable generate button
        generateBtn.disabled = false;
        generateBtn.classList.remove('disabled');
        console.log(`Generate button enabled for class: ${selectedClass}`);
        
        // Also update the app state if it exists
        if (typeof app !== 'undefined' && app && app.stateManager) {
          const className = selectedClass.charAt(0).toUpperCase() + selectedClass.slice(1);
          app.stateManager.state.selectedClass = className;
          console.log(`App state updated: ${className}`);
        }
      });
    });
    
    // Add click handler to generate button
    generateBtn.addEventListener('click', function(e) {
      if (!selectedClass) {
        e.preventDefault();
        alert('Please select a class first!');
        return;
      }
      
      console.log(`Generate button clicked with class: ${selectedClass}`);
      
      // Trigger the app's generate function if available
      if (typeof app !== 'undefined' && app && app.uiController) {
        const className = selectedClass.charAt(0).toUpperCase() + selectedClass.slice(1);
        app.stateManager.state.selectedClass = className;
        app.uiController.generateLoadout();
      }
    });
    
    // Check if class is already selected (from previous session)
    const activeBtn = document.querySelector('.class-btn.active');
    if (activeBtn) {
      selectedClass = activeBtn.dataset.class;
      generateBtn.disabled = false;
      console.log(`Class already selected: ${selectedClass}`);
    }
    
    console.log('Class selection fix initialized successfully');
  }
  
  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initClassSelection);
  } else {
    // DOM already loaded
    setTimeout(initClassSelection, 100); // Small delay to ensure app is initialized
  }
  
  // Also try after window load as backup
  window.addEventListener('load', () => {
    setTimeout(initClassSelection, 500);
  });
})();