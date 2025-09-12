#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Load the loadouts.json file
const loadoutsPath = path.join(__dirname, '..', 'loadouts.json');
const loadouts = JSON.parse(fs.readFileSync(loadoutsPath, 'utf8'));

// Count weapons per class
const lightCount = loadouts.Light.weapons.length;
const mediumCount = loadouts.Medium.weapons.length;
const heavyCount = loadouts.Heavy.weapons.length;
const totalCount = lightCount + mediumCount + heavyCount;

// Check for duplicates
function checkDuplicates(arr, className) {
    const seen = new Set();
    const duplicates = [];
    arr.forEach(item => {
        if (seen.has(item)) {
            duplicates.push(item);
        }
        seen.add(item);
    });
    if (duplicates.length > 0) {
        console.error(`❌ Duplicates found in ${className}: ${duplicates.join(', ')}`);
        return false;
    }
    return true;
}

// Verify no duplicates
let valid = true;
valid = checkDuplicates(loadouts.Light.weapons, 'Light') && valid;
valid = checkDuplicates(loadouts.Medium.weapons, 'Medium') && valid;
valid = checkDuplicates(loadouts.Heavy.weapons, 'Heavy') && valid;

// Check specific weapons exist
const requiredWeapons = {
    Medium: ['P90', 'FCAR', 'FAMAS', 'Pike-556', 'CB-01 Repeater'],
    Heavy: ['BFR Titan', '.50 Akimbo', 'KS-23', 'M60'],
    Light: ['LH1', 'V9S', 'XP-54', 'SR-84']
};

Object.entries(requiredWeapons).forEach(([className, weapons]) => {
    weapons.forEach(weapon => {
        if (!loadouts[className].weapons.includes(weapon)) {
            console.error(`❌ Missing ${weapon} in ${className} class`);
            valid = false;
        }
    });
});

// Print results
console.log('\n📊 Weapon Counts:');
console.log(`   Light:  ${lightCount} weapons`);
console.log(`   Medium: ${mediumCount} weapons`);
console.log(`   Heavy:  ${heavyCount} weapons`);
console.log(`   Total:  ${totalCount} weapons`);

// Expected counts for S8
const expected = {
    light: 13,
    medium: 12,
    heavy: 12,
    total: 37
};

console.log('\n✅ Verification:');
if (lightCount === expected.light) {
    console.log(`   Light: ✓ (${lightCount} = ${expected.light})`);
} else {
    console.error(`   Light: ✗ (${lightCount} ≠ ${expected.light})`);
    valid = false;
}

if (mediumCount === expected.medium) {
    console.log(`   Medium: ✓ (${mediumCount} = ${expected.medium})`);
} else {
    console.error(`   Medium: ✗ (${mediumCount} ≠ ${expected.medium})`);
    valid = false;
}

if (heavyCount === expected.heavy) {
    console.log(`   Heavy: ✓ (${heavyCount} = ${expected.heavy})`);
} else {
    console.error(`   Heavy: ✗ (${heavyCount} ≠ ${expected.heavy})`);
    valid = false;
}

if (totalCount === expected.total) {
    console.log(`   Total: ✓ (${totalCount} = ${expected.total})`);
} else {
    console.error(`   Total: ✗ (${totalCount} ≠ ${expected.total})`);
    valid = false;
}

// Check new S8 weapons
console.log('\n🆕 Season 8 Weapons:');
if (loadouts.Medium.weapons.includes('P90')) {
    console.log('   P90 (Medium): ✓');
} else {
    console.error('   P90 (Medium): ✗ Missing!');
    valid = false;
}

if (loadouts.Heavy.weapons.includes('BFR Titan')) {
    console.log('   BFR Titan (Heavy): ✓');
} else {
    console.error('   BFR Titan (Heavy): ✗ Missing!');
    valid = false;
}

// Final result
console.log('\n' + '='.repeat(40));
if (valid) {
    console.log('🎉 All checks passed! Ready for Season 8.');
    process.exit(0);
} else {
    console.error('❌ Some checks failed. Please review.');
    process.exit(1);
}