import type { SlotItem } from './types';

// Weapon pool
export const WEAPONS: SlotItem[] = [
  { name: 'FCAR', icon: 'images/weapons/fcar.png', type: 'weapon' },
  { name: 'AKM', icon: 'images/weapons/akm.png', type: 'weapon' },
  { name: 'M60', icon: 'images/weapons/m60.png', type: 'weapon' },
  { name: 'V9S', icon: 'images/weapons/v9s.png', type: 'weapon' },
  { name: 'XP-54', icon: 'images/weapons/xp54.png', type: 'weapon' },
];

// Specialization pool
export const SPECIALIZATIONS: SlotItem[] = [
  {
    name: 'Cloaking Device',
    icon: 'images/specializations/cloak.png',
    type: 'specialization',
  },
  { name: 'Goo Gun', icon: 'images/specializations/goo.png', type: 'specialization' },
  {
    name: 'Grappling Hook',
    icon: 'images/specializations/grapple.png',
    type: 'specialization',
  },
  {
    name: 'Guardian Turret',
    icon: 'images/specializations/turret.png',
    type: 'specialization',
  },
  {
    name: 'Mesh Shield',
    icon: 'images/specializations/shield.png',
    type: 'specialization',
  },
];

// Gadget pool
export const GADGETS: SlotItem[] = [
  { name: 'Frag Grenade', icon: 'images/gadgets/frag.png', type: 'gadget' },
  { name: 'Gas Grenade', icon: 'images/gadgets/gas.png', type: 'gadget' },
  { name: 'RPG-7', icon: 'images/gadgets/rpg.png', type: 'gadget' },
  { name: 'C4', icon: 'images/gadgets/c4.png', type: 'gadget' },
  { name: 'Jump Pad', icon: 'images/gadgets/jumppad.png', type: 'gadget' },
  { name: 'Stun Gun', icon: 'images/gadgets/stun.png', type: 'gadget' },
  { name: 'Pyro Grenade', icon: 'images/gadgets/pyro.png', type: 'gadget' },
  { name: 'Barricade', icon: 'images/gadgets/barricade.png', type: 'gadget' },
];

// Get pool for a specific column
export const getColumnPool = (columnIndex: number): SlotItem[] => {
  switch (columnIndex) {
    case 0:
      return WEAPONS;
    case 1:
      return SPECIALIZATIONS;
    default:
      return GADGETS;
  }
};

// Get random item from pool
export const getRandomItem = (pool: SlotItem[]): SlotItem => {
  return pool[Math.floor(Math.random() * pool.length)];
};