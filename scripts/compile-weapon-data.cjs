#!/usr/bin/env node

/**
 * Weapon Data Compilation Script
 * Consolidates weapon data from multiple sources into unified JSON files
 * Run with: npm run build:data
 */

const fs = require('fs');
const path = require('path');
const csv = require('csv-parse/sync');

// File paths
const AI_WEAPONS_PATH = path.join(__dirname, '../data/AI_weapons_s7.json');
const CSV_PATH = path.join(__dirname, '../meta-weapons/Test/Updated_Weapon_Data__Latest_Patch_.csv');
const OUTPUT_COMPILED = path.join(__dirname, '../data/compiled-weapons.json');
const OUTPUT_SIMPLE = path.join(__dirname, '../data/loadouts-simple.json');

// Name normalization mapping
const NAME_NORMALIZATION = {
  '.50 Akimbo': '.50 Akimbo',
  '50 Akimbo': '.50 Akimbo',
  'SA 1216': 'SA1216',
  'SA-1216': 'SA1216',
  'M32GL': 'MGL32',
  'M32-GL': 'MGL32',
  'V-9S': 'V9S',
  'V9-S': 'V9S',
  '93-R': '93R',
  'LH-1': 'LH1',
  'R-357': 'R357',
  'CL-40': 'CL40',
  'M-60': 'M60',
  'XP-54': 'XP54',
  'SH-1900': 'SH1900',
  'SR-84': 'SR84',
  'KS-23': 'KS23',
  'ARN-220': 'ARN220'
};

/**
 * Normalize weapon names for consistency
 */
function normalizeWeaponName(name) {
  if (!name) return '';
  const trimmed = name.trim();
  return NAME_NORMALIZATION[trimmed] || trimmed;
}

/**
 * Parse CSV file and convert to JSON format
 */
function parseCSV(csvPath) {
  try {
    if (!fs.existsSync(csvPath)) {
      console.warn(`CSV file not found at ${csvPath}, skipping CSV overrides`);
      return new Map();
    }

    const csvContent = fs.readFileSync(csvPath, 'utf-8');
    const records = csv.parse(csvContent, {
      columns: true,
      skip_empty_lines: true,
      trim: true
    });

    const csvMap = new Map();
    
    records.forEach(record => {
      const normalizedName = normalizeWeaponName(record['Weapon'] || record['weapon'] || record['Name']);
      if (normalizedName) {
        // Parse numeric values
        const parsed = {
          name: normalizedName,
          bodyDmg: parseFloat(record['Body Damage'] || record['bodyDmg']) || null,
          headDmg: parseFloat(record['Head Damage'] || record['headDmg']) || null,
          magazine: parseInt(record['Magazine'] || record['magazine']) || null,
          fireRate: parseFloat(record['Fire Rate'] || record['fireRate']) || null,
          ttkVsLight: parseFloat(record['TTK vs Light'] || record['ttkVsLight']) || null,
          ttkVsMedium: parseFloat(record['TTK vs Medium'] || record['ttkVsMedium']) || null,
          ttkVsHeavy: parseFloat(record['TTK vs Heavy'] || record['ttkVsHeavy']) || null,
          tier: record['Tier'] || record['tier'] || null,
          s7Status: record['S7 Status'] || record['s7Status'] || null
        };
        
        // Remove null values
        Object.keys(parsed).forEach(key => {
          if (parsed[key] === null) delete parsed[key];
        });
        
        if (Object.keys(parsed).length > 1) {
          csvMap.set(normalizedName, parsed);
        }
      }
    });

    console.log(`Parsed ${csvMap.size} weapon overrides from CSV`);
    return csvMap;
  } catch (error) {
    console.error(`Error parsing CSV: ${error.message}`);
    return new Map();
  }
}

/**
 * Load and process base weapon data
 */
function loadBaseData() {
  try {
    const jsonContent = fs.readFileSync(AI_WEAPONS_PATH, 'utf-8');
    const weapons = JSON.parse(jsonContent);
    
    // Normalize names in base data
    return weapons.map(weapon => ({
      ...weapon,
      name: normalizeWeaponName(weapon.name)
    }));
  } catch (error) {
    console.error(`Error loading base data: ${error.message}`);
    throw error;
  }
}

/**
 * Merge CSV overrides with base data
 */
function mergeData(baseData, csvOverrides) {
  const weaponMap = new Map();
  
  // First pass: add all base weapons
  baseData.forEach(weapon => {
    const normalizedName = normalizeWeaponName(weapon.name);
    
    // Skip duplicate SA1216 entries
    if (weaponMap.has(normalizedName)) {
      console.log(`Skipping duplicate weapon: ${normalizedName}`);
      return;
    }
    
    weaponMap.set(normalizedName, { ...weapon });
  });
  
  // Second pass: apply CSV overrides
  csvOverrides.forEach((overrides, weaponName) => {
    if (weaponMap.has(weaponName)) {
      const existing = weaponMap.get(weaponName);
      weaponMap.set(weaponName, {
        ...existing,
        ...overrides,
        name: weaponName // Ensure normalized name is used
      });
      console.log(`Applied overrides for ${weaponName}`);
    } else {
      console.warn(`CSV contains unknown weapon: ${weaponName}`);
    }
  });
  
  return Array.from(weaponMap.values());
}

/**
 * Validate weapon data integrity
 */
function validateData(weapons) {
  const requiredFields = ['name', 'class'];
  const errors = [];
  
  weapons.forEach((weapon, index) => {
    requiredFields.forEach(field => {
      if (!weapon[field]) {
        errors.push(`Weapon at index ${index} missing required field: ${field}`);
      }
    });
    
    // Validate class values
    if (weapon.class && !['Light', 'Medium', 'Heavy'].includes(weapon.class)) {
      errors.push(`Weapon ${weapon.name} has invalid class: ${weapon.class}`);
    }
    
    // Validate tier values if present
    if (weapon.tier && !['S', 'A', 'B', 'C', 'D'].includes(weapon.tier)) {
      errors.push(`Weapon ${weapon.name} has invalid tier: ${weapon.tier}`);
    }
    
    // Validate s7Status values if present
    if (weapon.s7Status && !['Buffed', 'Nerfed', 'Unchanged', 'New'].includes(weapon.s7Status)) {
      errors.push(`Weapon ${weapon.name} has invalid s7Status: ${weapon.s7Status}`);
    }
  });
  
  if (errors.length > 0) {
    console.error('Validation errors found:');
    errors.forEach(error => console.error(`  - ${error}`));
    throw new Error('Data validation failed');
  }
  
  console.log(`✓ Validated ${weapons.length} weapons successfully`);
}

/**
 * Generate simple loadouts structure
 */
function generateSimpleLoadouts(weapons) {
  const loadouts = {
    Light: { weapons: [], specializations: [], gadgets: [] },
    Medium: { weapons: [], specializations: [], gadgets: [] },
    Heavy: { weapons: [], specializations: [], gadgets: [] }
  };
  
  // Group weapons by class
  weapons.forEach(weapon => {
    if (loadouts[weapon.class]) {
      loadouts[weapon.class].weapons.push(weapon.name);
    }
  });
  
  // Sort weapon names alphabetically within each class
  Object.keys(loadouts).forEach(className => {
    loadouts[className].weapons.sort();
  });
  
  // Add specializations and gadgets from original loadouts.json
  try {
    const originalLoadouts = JSON.parse(fs.readFileSync(path.join(__dirname, '../loadouts.json'), 'utf-8'));
    
    Object.keys(loadouts).forEach(className => {
      if (originalLoadouts[className]) {
        loadouts[className].specializations = originalLoadouts[className].specializations || [];
        loadouts[className].gadgets = originalLoadouts[className].gadgets || [];
      }
    });
  } catch (error) {
    console.warn('Could not load original loadouts.json for specializations and gadgets');
  }
  
  return loadouts;
}

/**
 * Main compilation process
 */
async function compileWeaponData() {
  console.log('Starting weapon data compilation...\n');
  
  try {
    // Step 1: Load base data
    console.log('1. Loading base weapon data...');
    const baseData = loadBaseData();
    console.log(`   Loaded ${baseData.length} weapons from AI_weapons_s7.json`);
    
    // Step 2: Parse CSV overrides
    console.log('\n2. Parsing CSV overrides...');
    const csvOverrides = parseCSV(CSV_PATH);
    
    // Step 3: Merge data
    console.log('\n3. Merging data sources...');
    const mergedData = mergeData(baseData, csvOverrides);
    console.log(`   Merged data contains ${mergedData.length} weapons`);
    
    // Step 4: Validate
    console.log('\n4. Validating data integrity...');
    validateData(mergedData);
    
    // Step 5: Generate outputs
    console.log('\n5. Generating output files...');
    
    // Ensure data directory exists
    const dataDir = path.dirname(OUTPUT_COMPILED);
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    
    // Write compiled weapons file
    fs.writeFileSync(OUTPUT_COMPILED, JSON.stringify(mergedData, null, 2));
    console.log(`   ✓ Created ${OUTPUT_COMPILED}`);
    
    // Generate and write simple loadouts file
    const simpleLoadouts = generateSimpleLoadouts(mergedData);
    fs.writeFileSync(OUTPUT_SIMPLE, JSON.stringify(simpleLoadouts, null, 2));
    console.log(`   ✓ Created ${OUTPUT_SIMPLE}`);
    
    // Summary
    console.log('\n' + '='.repeat(50));
    console.log('Compilation completed successfully!');
    console.log('='.repeat(50));
    console.log(`Total weapons processed: ${mergedData.length}`);
    console.log(`Light weapons: ${simpleLoadouts.Light.weapons.length}`);
    console.log(`Medium weapons: ${simpleLoadouts.Medium.weapons.length}`);
    console.log(`Heavy weapons: ${simpleLoadouts.Heavy.weapons.length}`);
    
  } catch (error) {
    console.error('\n❌ Compilation failed:', error.message);
    process.exit(1);
  }
}

// Run if executed directly
if (require.main === module) {
  compileWeaponData();
}

module.exports = { compileWeaponData, normalizeWeaponName };