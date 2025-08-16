#!/usr/bin/env node

/**
 * Asset Verification Script
 * Validates that all items in loadouts.json have corresponding image files
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  gray: '\x1b[90m'
};

// Load the name-to-asset resolver logic (duplicated here for standalone operation)
const ALIASES = {
  "stun gun": "Nullifier",
  "the stun gun": "Nullifier",
  "recon senses": null,
  "motion sensor": "Proximity Sensor",
  ".50 akimbo": null
};

const DEPRECATED = new Set([
  "recon senses",
  "stun gun",
  "motion sensor",
  ".50 akimbo"
]);

const FILENAME_MAP = {
  "93R": "93R",
  "M26 Matter": "M26_Matter",
  "CB-01 Repeater": "CB-01_Repeater",
  "R.357": "R.357",
  "Pike-556": "Pike-556",
  "SHAK-50": "SHAK-50",
  "M134 Minigun": "M134_Minigun",
  "KS-23": "KS-23",
  "SA1216": "SA1216",
  "Charge N Slam": "Charge_N_Slam",
  "H+ Infuser": "H+_Infuser",
  "Anti-Gravity Cube": "Anti-Gravity_Cube",
  "APS Turret": "APS_Turret",
  "RPG-7": "RPG-7",
  "Nullifier": "Nullifier",
  "The Nullifier": "Nullifier",
  "MGL32": "MGL32"
};

function normalizeName(name) {
  if (!name) return '';
  return name
    .trim()
    .toLowerCase()
    .replace(/['']/g, '')
    .replace(/\s+/g, ' ')
    .replace(/[^\w\s\-+.]/g, '');
}

function nameToFilename(name) {
  if (FILENAME_MAP[name]) {
    return FILENAME_MAP[name];
  }
  
  return name
    .replace(/\s+/g, '_')
    .replace(/'/g, '')
    .replace(/\+/g, '+');
}

function resolveItemImage(name) {
  const normalizedName = normalizeName(name);
  
  if (DEPRECATED.has(normalizedName)) {
    return { type: 'deprecated', filename: null };
  }
  
  let resolvedName = name;
  if (ALIASES[normalizedName]) {
    resolvedName = ALIASES[normalizedName];
  } else if (ALIASES[normalizedName] === null) {
    return { type: 'removed', filename: null };
  }
  
  const filename = nameToFilename(resolvedName);
  return { type: 'normal', filename: `${filename}.webp` };
}

// Main verification function
async function verifyAssets() {
  console.log(`${colors.cyan}═══════════════════════════════════════════════════════${colors.reset}`);
  console.log(`${colors.cyan}     The Finals Loadout Asset Verification${colors.reset}`);
  console.log(`${colors.cyan}═══════════════════════════════════════════════════════${colors.reset}\n`);

  // Load loadouts.json
  const loadoutsPath = path.join(__dirname, '..', 'loadouts.json');
  if (!fs.existsSync(loadoutsPath)) {
    console.error(`${colors.red}✗ loadouts.json not found at ${loadoutsPath}${colors.reset}`);
    process.exit(1);
  }

  const loadoutsData = JSON.parse(fs.readFileSync(loadoutsPath, 'utf8'));
  
  // Image directories to check
  const imageDirs = [
    path.join(__dirname, '..', 'images'),
    path.join(__dirname, '..', 'v3', 'images')
  ];

  const results = {
    passed: [],
    failed: [],
    deprecated: [],
    warnings: []
  };

  // Process each class
  for (const [className, classData] of Object.entries(loadoutsData)) {
    console.log(`${colors.blue}Checking ${className} class...${colors.reset}`);

    // Check weapons
    if (classData.weapons) {
      for (const weapon of classData.weapons) {
        checkItem(weapon, 'weapon', imageDirs, results);
      }
    }

    // Check specializations
    if (classData.specializations) {
      for (const spec of classData.specializations) {
        checkItem(spec, 'specialization', imageDirs, results);
      }
    }

    // Check gadgets
    if (classData.gadgets) {
      for (const gadget of classData.gadgets) {
        checkItem(gadget, 'gadget', imageDirs, results);
      }
    }
  }

  // Print results
  console.log(`\n${colors.cyan}═══════════════════════════════════════════════════════${colors.reset}`);
  console.log(`${colors.cyan}                    RESULTS${colors.reset}`);
  console.log(`${colors.cyan}═══════════════════════════════════════════════════════${colors.reset}\n`);

  // Summary
  const total = results.passed.length + results.failed.length;
  const passRate = total > 0 ? ((results.passed.length / total) * 100).toFixed(1) : 0;

  console.log(`Total Items: ${total}`);
  console.log(`${colors.green}✓ Passed: ${results.passed.length}${colors.reset}`);
  console.log(`${colors.red}✗ Failed: ${results.failed.length}${colors.reset}`);
  console.log(`${colors.yellow}⚠ Deprecated: ${results.deprecated.length}${colors.reset}`);
  console.log(`Pass Rate: ${passRate}%\n`);

  // Show failures
  if (results.failed.length > 0) {
    console.log(`${colors.red}Failed Items:${colors.reset}`);
    for (const item of results.failed) {
      console.log(`  ${colors.red}✗${colors.reset} ${item.name} → ${item.filename || 'NO_MAPPING'}`);
    }
    console.log();
  }

  // Show deprecated items
  if (results.deprecated.length > 0) {
    console.log(`${colors.yellow}Deprecated Items (using placeholder):${colors.reset}`);
    for (const item of results.deprecated) {
      console.log(`  ${colors.yellow}⚠${colors.reset} ${item.name} → placeholder.webp`);
    }
    console.log();
  }

  // Show passed items (compact)
  if (results.passed.length > 0) {
    console.log(`${colors.green}Passed Items: ${results.passed.length} items resolved correctly${colors.reset}`);
    if (process.argv.includes('--verbose')) {
      for (const item of results.passed) {
        console.log(`  ${colors.green}✓${colors.reset} ${item.name} → ${item.filename}`);
      }
    }
  }

  // Exit code
  process.exit(results.failed.length > 0 ? 1 : 0);
}

function checkItem(name, category, imageDirs, results) {
  const resolved = resolveItemImage(name);
  
  if (resolved.type === 'deprecated') {
    results.deprecated.push({
      name,
      category,
      reason: 'deprecated'
    });
    return;
  }
  
  if (resolved.type === 'removed') {
    results.deprecated.push({
      name,
      category,
      reason: 'removed from game'
    });
    return;
  }
  
  // Check if file exists
  let found = false;
  let foundPath = null;
  
  for (const dir of imageDirs) {
    const fullPath = path.join(dir, resolved.filename);
    if (fs.existsSync(fullPath)) {
      found = true;
      foundPath = fullPath;
      break;
    }
  }
  
  if (found) {
    results.passed.push({
      name,
      category,
      filename: resolved.filename,
      path: foundPath
    });
  } else {
    results.failed.push({
      name,
      category,
      filename: resolved.filename,
      searchedDirs: imageDirs
    });
  }
}

// Run the verification
verifyAssets().catch(console.error);