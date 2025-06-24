export interface ClassLoadout {
  weapons: string[];
  specializations: string[];
  gadgets: string[];
}

export interface LoadoutsData {
  Light: ClassLoadout;
  Medium: ClassLoadout;
  Heavy: ClassLoadout;
}

export const loadouts: LoadoutsData = {
  Light: {
    weapons: [
      '93R', 'Dagger', 'SR-84', 'SH1900', 'LH1', 'M26_Matter', 
      'Recurve_Bow', 'Sword', 'M11', 'ARN-220', 'V9S', 'XP-54', 
      'Throwing_Knives'
    ],
    specializations: [
      'Cloaking_Device', 'Evasive_Dash', 'Grappling_Hook'
    ],
    gadgets: [
      'Breach_Charge', 'Gateway', 'Glitch_Grenade', 'Gravity_Vortex', 
      'Nullifier', 'Sonar_Grenade', 'H+_Infuser', 'Thermal_Bore', 
      'Gas_Grenade', 'Thermal_Vision', 'Tracking_Dart', 'Vanishing_Bomb', 
      'Goo_Grenade', 'Pyro_Grenade', 'Smoke_Grenade', 'Frag_Grenade', 
      'Flashbang'
    ]
  },
  Medium: {
    weapons: [
      'AKM', 'Cerberus_12GA', 'Dual_Blades', 'FAMAS', 'CL-40', 
      'CB-01_Repeater', 'FCAR', 'Model_1887', 'Pike-556', 'R.357', 
      'Riot_Shield'
    ],
    specializations: [
      'Dematerializer', 'Guardian_Turret', 'Healing_Beam'
    ],
    gadgets: [
      'APS_Turret', 'Data_Reshaper', 'Defibrillator', 'Explosive_Mine', 
      'Gas_Mine', 'Glitch_Trap', 'Jump_Pad', 'Zipline', 'Gas_Grenade', 
      'Goo_Grenade', 'Breach_Drill', 'Pyro_Grenade', 'Smoke_Grenade', 
      'Frag_Grenade', 'Flashbang', 'Proximity_Sensor', 'Health_Canister'
    ]
  },
  Heavy: {
    weapons: [
      '50_Akimbo', 'Flamethrower', 'KS-23', 'Lewis_Gun', 'M60', 
      'M134_Minigun', 'M32GL', 'SA_1216', 'Sledgehammer', 'SHAK-50', 
      'Spear'
    ],
    specializations: [
      'Charge_N_Slam', 'Goo_Gun', 'Mesh_Shield', 'Winch_Claw'
    ],
    gadgets: [
      'Anti-Gravity_Cube', 'Barricade', 'C4', 'Dome_Shield', 
      'Lockbolt_Launcher', 'Pyro_Mine', 'Proximity_Sensor', 'RPG-7', 
      'Goo_Grenade', 'Healing_Emitter', 'Pyro_Grenade', 'Smoke_Grenade', 
      'Frag_Grenade', 'Flashbang', 'Explosive_Mine', 'Gas_Grenade'
    ]
  }
};