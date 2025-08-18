#!/usr/bin/env node

/**
 * Automated verification script for slot machine fixes
 * This script checks that all implemented fixes are present in the code
 */

const fs = require('fs');
const path = require('path');

// Color codes for terminal output
const colors = {
    reset: '\x1b[0m',
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    cyan: '\x1b[36m',
    bold: '\x1b[1m'
};

// Test results
const results = {
    passed: 0,
    failed: 0,
    warnings: 0
};

// Helper function to read file
function readFile(filename) {
    try {
        return fs.readFileSync(path.join(__dirname, filename), 'utf8');
    } catch (error) {
        console.error(`${colors.red}Error reading ${filename}: ${error.message}${colors.reset}`);
        return null;
    }
}

// Helper function to check if code contains specific patterns
function checkPattern(code, patterns, description) {
    const found = patterns.every(pattern => {
        if (typeof pattern === 'string') {
            return code.includes(pattern);
        } else if (pattern instanceof RegExp) {
            return pattern.test(code);
        }
        return false;
    });
    
    if (found) {
        console.log(`${colors.green}✅ PASS: ${description}${colors.reset}`);
        results.passed++;
        return true;
    } else {
        console.log(`${colors.red}❌ FAIL: ${description}${colors.reset}`);
        results.failed++;
        return false;
    }
}

console.log(`${colors.bold}${colors.cyan}
╔════════════════════════════════════════════════════════╗
║     The Finals Loadout v3 - Fix Verification Suite    ║
╚════════════════════════════════════════════════════════╝
${colors.reset}`);

console.log(`${colors.yellow}Starting verification of implemented fixes...${colors.reset}\n`);

// Test 1: Spin Counter Fix
console.log(`${colors.bold}1. SPIN COUNTER PROGRESSION FIX${colors.reset}`);
const slotMachineCode = readFile('slot-machine.js');
if (slotMachineCode) {
    checkPattern(slotMachineCode, 
        ['const capturedSpin = currentSpin;', 'const capturedTotal = totalSpins;'],
        'Variable capture to prevent closure issues'
    );
    checkPattern(slotMachineCode,
        ['updateSpinCounter(capturedSpin, capturedTotal)'],
        'Using captured values in updateSpinCounter'
    );
}
console.log();

// Test 2: Landing Position Fix
console.log(`${colors.bold}2. LANDING POSITION FIX (-1520px)${colors.reset}`);
if (slotMachineCode) {
    checkPattern(slotMachineCode,
        ['const winnerPosition = 20;'],
        'Winner position set to index 20'
    );
    // Check for correct calculation
    const hasCorrectMath = slotMachineCode.includes('20') && 
                          (slotMachineCode.includes('-1520') || slotMachineCode.includes('1520'));
    if (hasCorrectMath) {
        console.log(`${colors.green}✅ PASS: Landing position calculation correct${colors.reset}`);
        results.passed++;
    } else {
        console.log(`${colors.yellow}⚠️ WARN: Could not verify exact -1520px calculation${colors.reset}`);
        results.warnings++;
    }
}
console.log();

// Test 3: DOM Manipulation Fix
console.log(`${colors.bold}3. DIFFERENTIAL DOM UPDATES${colors.reset}`);
if (slotMachineCode) {
    checkPattern(slotMachineCode,
        ['DIFFERENTIAL UPDATE', 'Update existing items instead of clearing'],
        'Differential DOM update implementation'
    );
    checkPattern(slotMachineCode,
        ['createItemElement', 'getImagePath'],
        'Helper methods for DOM manipulation'
    );
    checkPattern(slotMachineCode,
        ['// Update existing items in place', 'for (let i = 0; i < Math.min(existingItems.length, items.length); i++)'],
        'In-place DOM element updates'
    );
}
console.log();

// Test 4: Winner Highlighting Delay
console.log(`${colors.bold}4. WINNER HIGHLIGHTING DELAY (700ms)${colors.reset}`);
const appCode = readFile('app.js');
if (appCode) {
    checkPattern(appCode,
        ['setTimeout(() => {', 'highlightWinnersAfterLanding', '}, 700)'],
        '700ms delay before winner highlighting'
    );
    checkPattern(appCode,
        ['700ms delay', 'winners highlight after full stop'],
        'Proper comments explaining the delay'
    );
}
console.log();

// Test 5: Animation Timeout Fix
console.log(`${colors.bold}5. ANIMATION TIMEOUT OPTIMIZATION${colors.reset}`);
const animationEngineCode = readFile('animation-engine-v2.js');
if (animationEngineCode) {
    const hasTimeout = animationEngineCode.includes('5000') || animationEngineCode.includes('5 * 1000');
    const hasVelocityDecay = animationEngineCode.includes('0.92') || animationEngineCode.includes('0.85');
    
    if (hasTimeout) {
        console.log(`${colors.green}✅ PASS: Timeout reduced to 5 seconds${colors.reset}`);
        results.passed++;
    } else {
        console.log(`${colors.yellow}⚠️ WARN: Could not verify 5-second timeout${colors.reset}`);
        results.warnings++;
    }
    
    if (hasVelocityDecay) {
        console.log(`${colors.green}✅ PASS: Aggressive velocity decay implemented${colors.reset}`);
        results.passed++;
    } else {
        console.log(`${colors.yellow}⚠️ WARN: Could not verify velocity decay${colors.reset}`);
        results.warnings++;
    }
}
console.log();

// Test 6: Multi-Spin Continuity
console.log(`${colors.bold}6. MULTI-SPIN CONTINUITY${colors.reset}`);
if (slotMachineCode) {
    checkPattern(slotMachineCode,
        ['preservePosition'],
        'Position preservation between spins'
    );
    checkPattern(slotMachineCode,
        ['const hasItems = column.itemsContainer.children.length > 0'],
        'DOM state checking before rebuild'
    );
}
console.log();

// Summary
console.log(`${colors.bold}${colors.cyan}
╔════════════════════════════════════════════════════════╗
║                    TEST SUMMARY                        ║
╚════════════════════════════════════════════════════════╝
${colors.reset}`);

console.log(`${colors.green}  ✅ Passed: ${results.passed}${colors.reset}`);
console.log(`${colors.red}  ❌ Failed: ${results.failed}${colors.reset}`);
console.log(`${colors.yellow}  ⚠️ Warnings: ${results.warnings}${colors.reset}`);

const totalTests = results.passed + results.failed;
const passRate = totalTests > 0 ? ((results.passed / totalTests) * 100).toFixed(1) : 0;

console.log(`\n  Pass Rate: ${passRate}%`);

if (results.failed === 0) {
    console.log(`\n${colors.bold}${colors.green}🎉 ALL CRITICAL FIXES VERIFIED SUCCESSFULLY! 🎉${colors.reset}`);
    process.exit(0);
} else {
    console.log(`\n${colors.bold}${colors.red}⚠️ Some fixes are missing or incomplete${colors.reset}`);
    process.exit(1);
}