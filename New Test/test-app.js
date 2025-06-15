// =====================================================
// SLOT MACHINE TEST APPLICATION
// =====================================================

// Test app state
let testState = {
    selectedClass: null,
    selectedSpins: null,
    soundEnabled: true,
    slotMachine: null
};

// Mock loadout data
const mockLoadouts = {
    Light: {
        weapons: ["XP-54", "M11", "SH1900", "SR-84", "V9S"],
        specializations: ["Cloaking Device", "Evasive Dash", "Grappling Hook"],
        gadgets: ["Flashbang", "Smoke Grenade", "Breach Charge", "Thermal Bore", "Glitch Grenade", "Vanishing Bomb"]
    },
    Medium: {
        weapons: ["AKM", "R.357", "Model 1887", "FCAR", "CL-40"],
        specializations: ["Guardian Turret", "Healing Beam", "APS Turret"],
        gadgets: ["Gas Mine", "Defibrillator", "Jump Pad", "Zipline", "Glitch Trap", "Data Reshaper"]
    },
    Heavy: {
        weapons: ["Lewis Gun", "M60", "SA 1216", "Flamethrower", "KS-23"],
        specializations: ["Goo Gun", "Mesh Shield", "Charge N Slam"],
        gadgets: ["RPG-7", "C4", "Dome Shield", "Barricade", "Pyro Mine", "Anti-Gravity Cube", "Goo Grenade"]
    }
};

// Initialize the test app
document.addEventListener('DOMContentLoaded', function() {
    console.log('🎰 Slot Machine Test App Starting...');
    
    // Initialize global state for sound management
    window.state = { soundEnabled: testState.soundEnabled };
    
    // Add proper class to output container
    const outputContainer = document.getElementById('output');
    if (outputContainer) {
        outputContainer.classList.add('slot-machine-component');
        debugLog('Added slot-machine-component class to output container');
    }
    
    // Initialize slot machine
    testState.slotMachine = new SlotMachine('output');
    testState.slotMachine.init();
    
    // Don't display anything initially - show empty placeholders
    debugLog('Slot machine initialized with empty placeholders');
    
    // Set up event listeners
    initializeEventListeners();
    
    // Update info display
    updateTestInfo();
    
    // Log initialization
    debugLog('Test app initialized successfully');
    debugLog(`Slot machine created with container: output`);
});

// Initialize all event listeners
function initializeEventListeners() {
    // Main spin button
    const mainSpinBtn = document.getElementById('main-spin-btn');
    mainSpinBtn.addEventListener('click', (e) => {
        const button = e.currentTarget;
        const buttonText = button.querySelector('span')?.textContent || button.textContent;
        debugLog(`SPIN button clicked! Button disabled: ${button.disabled}, Text: "${buttonText.trim()}"`);
        
        if (button.disabled) {
            debugLog('Button is disabled, ignoring click');
            return;
        }
        
        handleMainSpin();
    });
    
    // Debug buttons
    document.getElementById('debug-sound').addEventListener('click', testSound);
    document.getElementById('debug-reset').addEventListener('click', resetTestState);
    document.getElementById('debug-animate').addEventListener('click', testAnimation);
    
    // Window resize for responsive info
    window.addEventListener('resize', updateTestInfo);
    
    debugLog('Event listeners initialized');
}

// Get random class for testing
function getRandomClass() {
    const classes = ['Light', 'Medium', 'Heavy'];
    return classes[Math.floor(Math.random() * classes.length)];
}

// Get random spin count for testing
function getRandomSpins() {
    return Math.floor(Math.random() * 3) + 1; // 1-3 spins
}

// Handle main spin button
async function handleMainSpin() {
    // Check if slot machine is already animating
    if (testState.slotMachine && testState.slotMachine.isAnimating) {
        debugLog('Animation already in progress, ignoring click');
        return;
    }
    
    // Only select new class and spins if starting fresh
    if (!testState.selectedSpins || testState.selectedSpins === 0) {
        testState.selectedClass = getRandomClass();
        testState.selectedSpins = getRandomSpins();
        debugLog(`New session: ${testState.selectedClass} class, ${testState.selectedSpins} spins`);
    }
    
    debugLog(`Spinning: ${testState.selectedClass} class, ${testState.selectedSpins} spins remaining`);
    
    // Disable button during animation
    const spinBtn = document.getElementById('main-spin-btn');
    if (!spinBtn) {
        debugLog('ERROR: Spin button not found!');
        return;
    }
    spinBtn.disabled = true;
    const spinBtnText = spinBtn.querySelector('span') || spinBtn;
    spinBtnText.textContent = 'SPINNING...';
    
    // Play start sound
    playTestSound('spinStart');
    
    try {
        // Generate loadout
        const loadout = generateLoadout();
        debugLog('Generated loadout:', loadout);
        
        // Check if slot machine exists
        if (!testState.slotMachine) {
            debugLog('ERROR: Slot machine not initialized');
            return;
        }
        
        // Check if container exists
        const container = document.getElementById('output');
        if (!container) {
            debugLog('ERROR: Output container not found');
            return;
        }
        
        debugLog('Container found, starting animation...');
        
        // Start animation directly - it will handle everything
        await animateSlotMachine(loadout);
        
        debugLog('Animation promise resolved, updating game state');
        
        // Update spins remaining AFTER animation completes
        testState.selectedSpins--;
        updateStatus();
        updateTestInfo();
        
        // Check if more spins remain
        if (testState.selectedSpins > 0) {
            debugLog(`${testState.selectedSpins} spins remaining - automatically continuing...`);
            
            // Keep button disabled during multi-spin
            const spinBtnText = spinBtn.querySelector('span') || spinBtn;
            spinBtnText.textContent = `${testState.selectedSpins} MORE...`;
            
            // Automatically trigger next spin after a short delay
            setTimeout(() => {
                debugLog('Auto-triggering next spin');
                handleMainSpin();
            }, 1500); // 1.5 second delay between spins
        } else {
            debugLog('No more spins remaining');
            // Final spin complete - reset after longer delay
            setTimeout(() => {
                spinBtn.disabled = false;
                const spinBtnText = spinBtn.querySelector('span') || spinBtn;
                spinBtnText.textContent = 'SPIN';
                testState.selectedSpins = 0;
                updateMainButton();
            }, 3000);
        }
        
    } catch (error) {
        debugLog('ERROR during spin:', error);
        console.error('Spin error:', error);
        // Re-enable button on error
        setTimeout(() => {
            spinBtn.disabled = false;
            const spinBtnText = spinBtn.querySelector('span') || spinBtn;
            spinBtnText.textContent = 'SPIN';
            updateMainButton();
        }, 1000);
    }
}

// Generate a random loadout
function generateLoadout() {
    const classData = mockLoadouts[testState.selectedClass];
    
    // Pick random items
    const weapon = classData.weapons[Math.floor(Math.random() * classData.weapons.length)];
    const spec = classData.specializations[Math.floor(Math.random() * classData.specializations.length)];
    const gadgets = [];
    
    // Pick 3 unique random gadgets for 5-slot machine
    while (gadgets.length < 3) {
        const gadget = classData.gadgets[Math.floor(Math.random() * classData.gadgets.length)];
        if (!gadgets.includes(gadget)) {
            gadgets.push(gadget);
        }
    }
    
    // Create loadout object for slot machine
    return {
        classType: testState.selectedClass,
        weapons: weapon,
        specializations: spec,
        gadgets: gadgets,
        spinsRemaining: Math.max(0, testState.selectedSpins - 1),
        allItems: {
            weapons: classData.weapons,
            specializations: classData.specializations,
            gadgets: classData.gadgets
        }
    };
}

// Animate the slot machine
async function animateSlotMachine(loadout) {
    debugLog('Starting slot machine animation');
    
    // animateSlots is already async, just await it directly
    await testState.slotMachine.animateSlots(loadout, () => {
        debugLog('Animation callback triggered');
    });
    
    debugLog('Slot machine animation complete');
    
    // Sound is already handled inside slot-machine.js based on spinsRemaining
    // No need to play sound here
}

// Update status display
function updateStatus() {
    const statusText = document.getElementById('status-text');
    if (testState.selectedSpins > 0) {
        statusText.textContent = `${testState.selectedSpins} spins remaining! Next spin starting automatically...`;
    } else {
        statusText.textContent = 'Click SPIN to start the chaos!';
    }
}

// Update main button state
function updateMainButton() {
    const spinBtn = document.getElementById('main-spin-btn');
    const spinBtnText = spinBtn.querySelector('span') || spinBtn;
    if (testState.selectedSpins > 0) {
        spinBtnText.textContent = 'SPIN AGAIN';
    } else {
        spinBtnText.textContent = 'SPIN';
    }
}

// Update test information display
function updateTestInfo() {
    document.getElementById('info-class').textContent = testState.selectedClass || 'Random';
    document.getElementById('info-spins').textContent = testState.selectedSpins || '0';
    document.getElementById('info-sound').textContent = testState.soundEnabled ? 'Yes' : 'No';
    document.getElementById('info-width').textContent = `${window.innerWidth}px`;
}

// Play test sound
function playTestSound(soundId) {
    if (!testState.soundEnabled) return;
    
    const sound = document.getElementById(soundId);
    if (sound) {
        sound.currentTime = 0;
        sound.play().catch(error => {
            debugLog(`Sound play failed: ${soundId}`, error);
        });
    }
}

// Test sound function
function testSound() {
    playTestSound('clickSound');
    debugLog('Test sound played: clickSound');
}

// Reset test state
function resetTestState() {
    testState.selectedClass = null;
    testState.selectedSpins = null;
    
    // Reset slot machine
    testState.slotMachine.reset();
    
    // Update displays
    updateStatus();
    updateTestInfo();
    updateMainButton();
    
    debugLog('Test state reset');
}

// Test animation without full spin
function testAnimation() {
    // Auto-select random class for testing
    testState.selectedClass = getRandomClass();
    testState.selectedSpins = getRandomSpins();
    
    const loadout = generateLoadout();
    debugLog('Testing static display with loadout:', loadout);
    
    // Check container
    const container = document.getElementById('output');
    debugLog('Container innerHTML before:', container.innerHTML);
    
    testState.slotMachine.displayLoadout(loadout);
    
    debugLog('Container innerHTML after:', container.innerHTML);
    debugLog('Test animation: loadout displayed without animation');
}

// Debug logging
function debugLog(message, data = null) {
    const timestamp = new Date().toLocaleTimeString();
    const logElement = document.getElementById('debug-log');
    
    const logEntry = document.createElement('div');
    logEntry.className = 'debug-entry';
    logEntry.innerHTML = `
        <span class="debug-time">${timestamp}</span>
        <span class="debug-message">${message}</span>
        ${data ? `<pre class="debug-data">${JSON.stringify(data, null, 2)}</pre>` : ''}
    `;
    
    logElement.appendChild(logEntry);
    logElement.scrollTop = logElement.scrollHeight;
    
    console.log(`[Test App] ${message}`, data);
}

// Window resize handler for responsive testing
window.addEventListener('resize', () => {
    updateTestInfo();
    debugLog(`Window resized: ${window.innerWidth}x${window.innerHeight}`);
});

// Export for global access
window.testApp = {
    state: testState,
    resetState: resetTestState,
    generateLoadout: generateLoadout,
    debugLog: debugLog
};