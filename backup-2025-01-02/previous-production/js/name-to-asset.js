/**
 * Name-to-Asset Resolver for The Finals Loadout Generator
 * 
 * This module provides a centralized, robust system for resolving item names to asset paths.
 * It handles normalization, aliasing, deprecated items, and fallbacks to ensure no blank images.
 * 
 * Normalization Rules:
 * 1. Trim whitespace
 * 2. Convert to lowercase for comparison
 * 3. Replace spaces with underscores for filenames
 * 4. Handle special characters (apostrophes, periods, plus signs)
 * 5. Apply known aliases for renamed/removed items
 * 
 * Usage:
 *   const imagePath = resolveItemImage("The Nullifier", "gadget");
 *   // Returns: "/images/Nullifier.webp"
 */

// Known aliases for items that have been renamed or have multiple names
const ALIASES = {
  // Deprecated items -> Current replacements
  "stun gun": "Nullifier",
  "the stun gun": "Nullifier",
  "recon senses": null, // Removed from game, will use placeholder
  
  // Common shorthand and variations
  "cb-01": "CB-01 Repeater",
  "cb01": "CB-01 Repeater",
  "cb 01": "CB-01 Repeater",
  "shak50": "SHAK-50",
  "shak 50": "SHAK-50",
  "m26": "M26 Matter",
  "r357": "R.357",
  "sr84": "SR-84",
  "xp54": "XP-54",
  "93r": "93R",
  "m11": "M11",
  "v9s": "V9S",
  "arn220": "ARN-220",
  "arn 220": "ARN-220",
  "sh1900": "SH1900",
  "lh1": "LH1",
  "akm": "AKM",
  "fcar": "FCAR",
  "famas": "FAMAS",
  "cl40": "CL-40",
  "cl 40": "CL-40",
  "pike556": "Pike-556",
  "pike 556": "Pike-556",
  "m60": "M60",
  "m134": "M134 Minigun",
  "ks23": "KS-23",
  "ks 23": "KS-23",
  "sa1216": "SA1216",
  "sa 1216": "SA1216",
  "mgl32": "MGL32",
  "mgl 32": "MGL32",
  "rpg7": "RPG-7",
  "rpg 7": "RPG-7",
  "c4": "C4",
  
  // Specialization variations
  "charge n slam": "Charge N Slam",
  "charge and slam": "Charge N Slam",
  "charge & slam": "Charge N Slam",
  "winch": "Winch Claw",
  
  // Gadget variations
  "aps": "APS Turret",
  "h+ infuser": "H+ Infuser",
  "h plus infuser": "H+ Infuser",
  "anti gravity cube": "Anti-Gravity Cube",
  "antigravity cube": "Anti-Gravity Cube",
  "motion sensor": "Proximity Sensor",
  "prox sensor": "Proximity Sensor",
  
  // The Nullifier specific (new gadget)
  "nullifier": "Nullifier",
  "the nullifier": "Nullifier"
};

// Set of deprecated items that should never be used
const DEPRECATED = new Set([
  "recon senses",
  "stun gun",
  "motion sensor", // replaced by proximity sensor
  ".50 akimbo" // not in current game
]);

// Exact filename mappings for items with special characters
const FILENAME_MAP = {
  // Weapons
  "93R": "93R",
  "M26 Matter": "M26_Matter",
  "CB-01 Repeater": "CB-01_Repeater",
  "R.357": "R.357",
  "Pike-556": "Pike-556",
  "SHAK-50": "SHAK-50",
  "M134 Minigun": "M134_Minigun",
  "KS-23": "KS-23",
  
  // Specializations
  "Charge N Slam": "Charge_N_Slam",
  
  // Gadgets
  "H+ Infuser": "H+_Infuser",
  "Anti-Gravity Cube": "Anti-Gravity_Cube",
  "APS Turret": "APS_Turret",
  "RPG-7": "RPG-7",
  
  // Special cases
  "Nullifier": "Nullifier",
  "The Nullifier": "Nullifier"
};

/**
 * Normalize an item name for comparison and lookup
 * @param {string} name - The item name to normalize
 * @returns {string} - Normalized name
 */
function normalizeName(name) {
  if (!name || typeof name !== 'string') {
    return '';
  }
  
  return name
    .trim()
    .toLowerCase()
    .replace(/['']/g, '') // Remove apostrophes
    .replace(/\s+/g, ' ') // Collapse multiple spaces
    .replace(/[^\w\s\-+.]/g, ''); // Remove special chars except word chars, spaces, hyphens, plus, period
}

/**
 * Convert a display name to a filename
 * @param {string} name - The display name
 * @returns {string} - The filename (without extension)
 */
function nameToFilename(name) {
  // Check exact mappings first
  if (FILENAME_MAP[name]) {
    return FILENAME_MAP[name];
  }
  
  // Default transformation: replace spaces with underscores
  return name
    .replace(/\s+/g, '_')
    .replace(/'/g, '')
    .replace(/\+/g, '+'); // Preserve plus sign for H+ Infuser
}

/**
 * Resolve an item name to its asset path
 * @param {string} name - The item name (display name)
 * @param {string} category - The category ("weapon", "specialization", or "gadget")
 * @returns {string} - The resolved asset path
 */
function resolveItemImage(name, category = '') {
  if (!name) {
    console.warn('resolveItemImage: No name provided, using placeholder');
    return '/images/placeholder.webp';
  }
  
  const normalizedName = normalizeName(name);
  
  // Check if deprecated
  if (DEPRECATED.has(normalizedName)) {
    console.warn(`DEPRECATED ITEM: "${name}" referenced. Using placeholder.`);
    return '/images/placeholder.webp';
  }
  
  // Check aliases
  let resolvedName = name;
  const aliasKey = normalizedName;
  if (ALIASES[aliasKey]) {
    resolvedName = ALIASES[aliasKey];
    console.log(`Alias resolved: "${name}" -> "${resolvedName}"`);
  } else if (ALIASES[aliasKey] === null) {
    // Explicitly removed item
    console.warn(`REMOVED ITEM: "${name}" no longer in game. Using placeholder.`);
    return '/images/placeholder.webp';
  }
  
  // Convert to filename
  const filename = nameToFilename(resolvedName);
  
  // Determine path based on environment
  const basePath = window.location.protocol === 'file:' 
    ? '../images' 
    : '/images';
  
  // For v3 directory, use relative path
  if (window.location.pathname.includes('/v3/')) {
    return `images/${filename}.webp`;
  }
  
  return `${basePath}/${filename}.webp`;
}

/**
 * Check if an item is deprecated
 * @param {string} name - The item name
 * @returns {boolean} - True if deprecated
 */
function isDeprecated(name) {
  const normalized = normalizeName(name);
  return DEPRECATED.has(normalized);
}

/**
 * Get the current replacement for a deprecated item
 * @param {string} name - The deprecated item name
 * @returns {string|null} - The replacement name or null if removed
 */
function getReplacementFor(name) {
  const normalized = normalizeName(name);
  return ALIASES[normalized] || null;
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    resolveItemImage,
    normalizeName,
    nameToFilename,
    isDeprecated,
    getReplacementFor,
    ALIASES,
    DEPRECATED
  };
}

// Make available globally for browser use
if (typeof window !== 'undefined') {
  window.NameToAsset = {
    resolveItemImage,
    normalizeName,
    nameToFilename,
    isDeprecated,
    getReplacementFor,
    ALIASES,
    DEPRECATED
  };
}