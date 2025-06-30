// =====================================================
// SLOT MACHINE INTEGRATION - From test-page implementation
// =====================================================

// Initialize slot machine
window.slotMachineInstance = null;

document.addEventListener('DOMContentLoaded', function() {
  // Initialize slot machine
  window.slotMachineInstance = new SlotMachine('output');
  window.slotMachineInstance.init();
  console.log('✅ Slot machine initialized with clean test-page styling');
});

// Start slot machine with loadout data - handles multiple spins
window.startSlotMachine = async function(classType, spinCount) {
  console.log('🎰 Starting slot machine sequence:', classType, 'with', spinCount, 'spins');
  
  // Add class to body to hide duplicate text on desktop
  document.body.classList.add('slot-machine-active');
  
  // Update state
  if (!window.state) window.state = {};
  window.state.selectedClass = classType;
  window.state.totalSpins = spinCount;
  window.state.currentSpin = spinCount;
  window.state.spinsLeft = spinCount;
  
  // Update initial status display
  if (window.slotMachineInstance && window.slotMachineInstance.statusBar) {
    const statusText = window.slotMachineInstance.statusBar.querySelector("#slot-status-text");
    if (statusText) {
      statusText.textContent = `${classType} Class - ${spinCount} spins remaining`;
    }
  }
  
  // Execute all spins
  await executeSpinSequence(classType, spinCount);
};

// Execute the full spin sequence
async function executeSpinSequence(classType, totalSpins) {
  for (let spinNum = 1; spinNum <= totalSpins; spinNum++) {
    console.log(`🎰 Executing spin ${spinNum} of ${totalSpins}`);
    
    // Check if slot machine is already animating (safety check)
    if (window.slotMachineInstance && window.slotMachineInstance.isAnimating) {
      console.log('Animation already in progress, waiting...');
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    // Calculate remaining spins for this iteration
    const spinsRemaining = totalSpins - spinNum;
    const isLastSpin = spinNum === totalSpins;
    
    // Update the status bar to show remaining spins
    if (window.slotMachineInstance && window.slotMachineInstance.statusBar) {
      const statusText = window.slotMachineInstance.statusBar.querySelector("#slot-status-text");
      if (statusText) {
        statusText.textContent = `${classType} Class - ${spinsRemaining} spins remaining`;
      }
    }
    
    // Generate new loadout for each spin
    const loadoutData = generateLoadoutForSpin(classType, spinsRemaining);
    
    if (!loadoutData) {
      console.error('Failed to generate loadout');
      return;
    }
    
    // Display the loadout
    window.slotMachineInstance.displayLoadout(loadoutData);
    
    // Short pause before animation
    await new Promise(resolve => setTimeout(resolve, 300));
    
    try {
      // Animate with callback
      await new Promise((resolve) => {
        window.slotMachineInstance.animateSlots(loadoutData, () => {
          console.log(`Spin ${spinNum} animation complete`);
          
          // Update state
          window.state.currentSpin--;
          window.state.spinsLeft--;
          
          // On final spin, handle completion
          if (isLastSpin && typeof window.finalizeSpin === 'function') {
            const items = [
              loadoutData.weaponObject,
              loadoutData.specObject,
              ...loadoutData.gadgetObjects
            ];
            window.finalizeSpin(items);
          }
          
          resolve();
        });
      });
      
      // Pause between spins (except after last spin)
      if (!isLastSpin) {
        console.log(`Waiting before next spin...`);
        await new Promise(resolve => setTimeout(resolve, 1500));
      }
      
    } catch (error) {
      console.error(`Slot machine animation error on spin ${spinNum}:`, error);
      break;
    }
  }
  
  console.log('🎰 Spin sequence complete!');
}

// Generate loadout data for a specific spin
function generateLoadoutForSpin(classType, spinsRemaining) {
  // Get the filtered loadouts
  const filteredLoadouts = window.getFilteredLoadouts();
  const loadout = filteredLoadouts[classType];
  
  if (!loadout) {
    console.error('No loadout data for class:', classType);
    return null;
  }
  
  // Select random items with error checking
  let selectedWeapon, selectedSpec;
  
  if (loadout.weapons && loadout.weapons.length > 0) {
    selectedWeapon = window.getRandomUniqueItems(loadout.weapons, 1)[0];
  } else {
    console.error('No weapons available for', classType);
    selectedWeapon = { name: 'Default Weapon' };
  }
  
  if (loadout.specializations && loadout.specializations.length > 0) {
    selectedSpec = window.getRandomUniqueItems(loadout.specializations, 1)[0];
  } else {
    console.error('No specializations available for', classType);
    selectedSpec = { name: 'Default Spec' };
  }
  
  const selectedGadgets = window.getUniqueGadgets(classType, loadout);
  
  // Create loadout object
  const loadoutData = {
    classType: classType,
    weapons: selectedWeapon.name || selectedWeapon,
    specializations: selectedSpec.name || selectedSpec,
    gadgets: selectedGadgets.map(g => typeof g === 'string' ? g : g.name || g),
    spinsRemaining: spinsRemaining,
    allItems: {
      weapons: loadout.weapons ? loadout.weapons.map(w => typeof w === 'string' ? w : w.name || w) : [],
      specializations: loadout.specializations ? loadout.specializations.map(s => typeof s === 'string' ? s : s.name || s) : [],
      gadgets: loadout.gadgets ? loadout.gadgets.map(g => typeof g === 'string' ? g : g.name || g) : []
    },
    // Store original objects for finalizeSpin
    weaponObject: selectedWeapon,
    specObject: selectedSpec,
    gadgetObjects: selectedGadgets
  };
  
  console.log(`Generated loadout for spin (${spinsRemaining} remaining):`, loadoutData);
  return loadoutData;
}

// Direct trigger for overlay manager
window.triggerSlotMachine = function(classType, spins) {
  console.log('🎰 Triggering slot machine from overlay');
  window.startSlotMachine(classType, spins);
};