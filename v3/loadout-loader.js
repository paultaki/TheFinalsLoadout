/**
 * Loadout Data Loader
 * Fetches weapon/gadget data from loadouts.json and provides image path mapping
 */

// Comprehensive image name mapping
// Maps display names to actual image filenames
const IMAGE_NAME_MAP = {
  // Weapons - Light
  "93R": "93R",
  "Dagger": "Dagger",
  "SR-84": "SR-84",
  "SH1900": "SH1900",
  "LH1": "LH1",
  "M26 Matter": "M26_Matter",
  "Recurve Bow": "Recurve_Bow",
  "Sword": "Sword",
  "M11": "M11",
  "ARN-220": "ARN-220",
  "V9S": "V9S",
  "XP-54": "XP-54",
  "Throwing Knives": "Throwing_Knives",
  
  // Weapons - Medium
  "AKM": "AKM",
  "Cerberus 12GA": "Cerberus_12GA",
  "Dual Blades": "Dual_Blades",
  "FAMAS": "FAMAS",
  "CL-40": "CL-40",
  "CB-01 Repeater": "CB-01_Repeater",
  "FCAR": "FCAR",
  "Model 1887": "Model_1887",
  "Pike-556": "Pike-556",
  "R.357": "R.357",
  "Riot Shield": "Riot_Shield",
  
  // Weapons - Heavy
  "M134 Minigun": "M134_Minigun",
  "M60": "M60",
  "Sledgehammer": "Sledgehammer",
  "Lewis Gun": "Lewis_Gun",
  "MGL32": "MGL32",
  "RPG-7": "RPG-7",
  "Lockbolt Launcher": "Lockbolt_Launcher",
  "Spear": "Spear",
  "Cerberus 12GA": "Cerberus_12GA",
  "KS-23": "KS-23",
  "ShAK-50": "SHAK-50",
  "Flamethrower": "Flamethrower",
  "Charge N' Slam": "Charge_N_Slam",
  "SA1216": "SA1216",
  
  // Specializations
  "Cloaking Device": "Cloaking_Device",
  "Evasive Dash": "Evasive_Dash",
  "Grappling Hook": "Grappling_Hook",
  "Dematerializer": "Dematerializer",
  "Guardian Turret": "Guardian_Turret",
  "Healing Beam": "Healing_Beam",
  "Recon Senses": "placeholder", // No image available
  "Mesh Shield": "Mesh_Shield",
  "Winch Claw": "Winch_Claw",
  
  // Gadgets
  "Breach Charge": "Breach_Charge",
  "Gateway": "Gateway",
  "Glitch Grenade": "Glitch_Grenade",
  "Gravity Vortex": "Gravity_Vortex",
  "Nullifier": "Nullifier",
  "Sonar Grenade": "Sonar_Grenade",
  "H+ Infuser": "H+_Infuser",
  "Thermal Bore": "Thermal_Bore",
  "Gas Grenade": "Gas_Grenade",
  "Thermal Vision": "Thermal_Vision",
  "Tracking Dart": "Tracking_Dart",
  "Vanishing Bomb": "Vanishing_Bomb",
  "Goo Grenade": "Goo_Grenade",
  "Pyro Grenade": "Pyro_Grenade",
  "Smoke Grenade": "Smoke_Grenade",
  "Frag Grenade": "Frag_Grenade",
  "Flashbang": "Flashbang",
  "APS Turret": "APS_Turret",
  "Data Reshaper": "Data_Reshaper",
  "Defibrillator": "Defibrillator",
  "Explosive Mine": "Explosive_Mine",
  "Gas Mine": "Gas_Mine",
  "Glitch Trap": "Glitch_Trap",
  "Jump Pad": "Jump_Pad",
  "Zipline": "Zipline",
  "Motion Sensor": "placeholder", // No image available
  "Stun Gun": "placeholder", // No image available
  "Anti-Gravity Cube": "Anti-Gravity_Cube",
  "Barricade": "Barricade",
  "C4": "C4",
  "Dome Shield": "Dome_Shield",
  "Pyro Mine": "Pyro_Mine",
  "Riot Shield": "Riot_Shield",
  "RPG-7": "RPG-7",
  "Healing Emitter": "Healing_Emitter",
  "Health Canister": "Health_Canister",
  "Breach Drill": "Breach_Drill",
  ".50 Akimbo": "placeholder" // No image available
};

/**
 * Get the correct image path for an item
 * @param {string} itemName - The display name of the item
 * @returns {string} The correct image path
 */
function getImagePath(itemName) {
  // Check if we have a specific mapping
  const mappedName = IMAGE_NAME_MAP[itemName];
  
  if (mappedName && mappedName !== "placeholder") {
    return `images/${mappedName}.webp`;
  } else if (mappedName === "placeholder") {
    // Return a placeholder image path
    return `images/placeholder.webp`;
  } else {
    // Fallback: convert spaces to underscores
    const fallbackName = itemName.replace(/\s+/g, "_").replace(/'/g, "");
    console.warn(`No image mapping for "${itemName}", trying: ${fallbackName}.webp`);
    return `images/${fallbackName}.webp`;
  }
}

/**
 * Load loadouts data from JSON file
 * @returns {Promise<Object>} The loadouts data
 */
async function loadLoadoutsData() {
  try {
    const response = await fetch('../loadouts.json');
    if (!response.ok) {
      throw new Error(`Failed to load loadouts.json: ${response.status}`);
    }
    const data = await response.json();
    
    // Transform the data to match the expected format
    return {
      Light: {
        weapons: data.Light.weapons,
        specializations: data.Light.specializations,
        gadgets: data.Light.gadgets
      },
      Medium: {
        weapons: data.Medium.weapons,
        specializations: data.Medium.specializations,
        gadgets: data.Medium.gadgets
      },
      Heavy: {
        weapons: data.Heavy.weapons,
        specializations: data.Heavy.specializations,
        gadgets: data.Heavy.gadgets
      }
    };
  } catch (error) {
    console.error('Failed to load loadouts data:', error);
    // Return fallback data structure
    return null;
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { getImagePath, loadLoadoutsData, IMAGE_NAME_MAP };
}