/**
 * Debug script to diagnose app initialization issues
 */

(function() {
  console.log('=== DEBUG: App Diagnostic Starting ===');
  
  // Check for app existence
  setTimeout(() => {
    console.log('1. Checking for app objects...');
    console.log('   window.app:', typeof window.app !== 'undefined' ? '✅ Found' : '❌ Not found');
    console.log('   window.FinalsLoadoutApp:', typeof window.FinalsLoadoutApp !== 'undefined' ? '✅ Found' : '❌ Not found');
    
    const app = window.app || window.FinalsLoadoutApp;
    
    if (app) {
      console.log('2. Checking app components...');
      console.log('   app.stateManager:', app.stateManager ? '✅ Found' : '❌ Not found');
      console.log('   app.slotMachine:', app.slotMachine ? '✅ Found' : '❌ Not found');
      console.log('   app.uiController:', app.uiController ? '✅ Found' : '❌ Not found');
      
      if (app.uiController) {
        console.log('3. Checking UI Controller methods...');
        console.log('   createRandomLoadout:', app.uiController.createRandomLoadout ? '✅ Found' : '❌ Not found');
        console.log('   generateLoadout:', app.uiController.generateLoadout ? '✅ Found' : '❌ Not found');
        console.log('   historyManager:', app.uiController.historyManager ? '✅ Found' : '❌ Not found');
      }
      
      if (app.slotMachine) {
        console.log('4. Checking Slot Machine methods...');
        console.log('   spin:', app.slotMachine.spin ? '✅ Found' : '❌ Not found');
        console.log('   columns:', app.slotMachine.columns ? `✅ Found (${app.slotMachine.columns.length} columns)` : '❌ Not found');
      }
      
      if (app.stateManager) {
        console.log('5. Current state:');
        console.log('   selectedClass:', app.stateManager.state.selectedClass || 'None');
        console.log('   isGenerating:', app.stateManager.state.isGenerating || false);
      }
    } else {
      console.log('❌ App not initialized yet!');
    }
    
    console.log('=== DEBUG: Diagnostic Complete ===');
  }, 2000); // Wait 2 seconds for app to initialize
  
  // Add button to manually trigger slot machine
  setTimeout(() => {
    const debugBtn = document.createElement('button');
    debugBtn.textContent = 'DEBUG: Force Start Slot';
    debugBtn.style.cssText = 'position:fixed;bottom:10px;right:10px;z-index:9999;padding:10px;background:#ff0;color:#000;';
    debugBtn.onclick = () => {
      const app = window.app || window.FinalsLoadoutApp;
      if (app && app.uiController) {
        console.log('Forcing slot machine start...');
        app.uiController.generateLoadout();
      } else {
        console.error('App not available!');
      }
    };
    document.body.appendChild(debugBtn);
  }, 3000);
})();