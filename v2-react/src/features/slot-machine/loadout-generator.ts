import type { ClassType } from '../../types';

export interface LoadoutItem {
  name: string;
  category: 'weapon' | 'specialization' | 'gadget';
}

export interface GeneratedLoadout {
  weapon: LoadoutItem;
  specialization: LoadoutItem;
  gadget1: LoadoutItem;
  gadget2: LoadoutItem;
  gadget3: LoadoutItem;
  classType: ClassType;
  weapons: string;
  specializations: string;
  gadgets: string[];
  spinsRemaining: number;
  allItems: {
    weapons: string[];
    specializations: string[];
    gadgets: string[];
  };
}

interface ClassData {
  weapons: string[];
  specializations: string[];
  gadgets: string[];
}

type ClassDataMap = Record<ClassType, ClassData>;

// Game data for each class
export const CLASS_DATA: ClassDataMap = {
  Light: {
    weapons: ['XP-54', 'M11', 'SH1900', 'SR-84', 'V9S'],
    specializations: ['Cloaking_Device', 'Evasive_Dash', 'Grappling_Hook'],
    gadgets: [
      'Flashbang',
      'Smoke_Grenade',
      'Breach_Charge',
      'Thermal_Bore',
      'Glitch_Grenade',
      'Vanishing_Bomb',
    ],
  },
  Medium: {
    weapons: ['AKM', 'R.357', 'Model_1887', 'FCAR', 'CL-40'],
    specializations: ['Guardian_Turret', 'Healing_Beam', 'APS_Turret'],
    gadgets: [
      'Gas_Mine',
      'Defibrillator',
      'Jump_Pad',
      'Zipline',
      'Glitch_Trap',
      'Data_Reshaper',
    ],
  },
  Heavy: {
    weapons: ['Lewis_Gun', 'M60', 'SA_1216', 'Flamethrower', 'KS-23'],
    specializations: ['Goo_Gun', 'Mesh_Shield', 'Charge_N_Slam'],
    gadgets: [
      'RPG-7',
      'C4',
      'Dome_Shield',
      'Barricade',
      'Pyro_Mine',
      'Anti-Gravity_Cube',
      'Goo_Grenade',
    ],
  },
};

// Generate a random loadout for the given class
export const generateLoadout = (classType: ClassType, spinsLeft: number): GeneratedLoadout => {
  const minSpins = 0;
  const spinsRemaining = Math.max(minSpins, spinsLeft - 1);
  const data = CLASS_DATA[classType];

  // Pick random items
  const weapon = data.weapons[Math.floor(Math.random() * data.weapons.length)];
  const spec = data.specializations[Math.floor(Math.random() * data.specializations.length)];
  const gadgets: string[] = [];

  // Pick 3 unique gadgets
  while (gadgets.length < 3) {
    const gadget = data.gadgets[Math.floor(Math.random() * data.gadgets.length)];
    if (!gadgets.includes(gadget)) {
      gadgets.push(gadget);
    }
  }

  // Create loadout object
  return {
    weapon: { name: weapon, category: 'weapon' as const },
    specialization: { name: spec, category: 'specialization' as const },
    gadget1: { name: gadgets[0], category: 'gadget' as const },
    gadget2: { name: gadgets[1], category: 'gadget' as const },
    gadget3: { name: gadgets[2], category: 'gadget' as const },
    classType,
    weapons: weapon,
    specializations: spec,
    gadgets,
    spinsRemaining,
    allItems: {
      weapons: data.weapons,
      specializations: data.specializations,
      gadgets: data.gadgets,
    },
  };
};