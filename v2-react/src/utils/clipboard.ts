import type { Loadout } from '../types';

export const copyLoadoutToClipboard = async (loadout: Loadout): Promise<boolean> => {
  const text = `Class: ${loadout.class}
Weapon: ${loadout.weapon.replace(/_/g, ' ')}
Specialization: ${loadout.specialization.replace(/_/g, ' ')}
Gadgets: ${loadout.gadget1.replace(/_/g, ' ')}, ${loadout.gadget2.replace(/_/g, ' ')}, ${loadout.gadget3.replace(/_/g, ' ')}`;

  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (error) {
    console.error('Failed to copy to clipboard:', error);
    return false;
  }
};