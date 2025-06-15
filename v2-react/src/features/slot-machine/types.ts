export interface SlotItem {
  name: string;
  icon: string;
  type: 'weapon' | 'specialization' | 'gadget';
  rarity?: 'common' | 'rare' | 'epic' | 'legendary';
}

export interface Loadout {
  weapon: SlotItem;
  specialization: SlotItem;
  gadget1: SlotItem;
  gadget2: SlotItem;
  gadget3: SlotItem;
}

export interface SlotMachineProps {
  images: string[];
  onResult: (result: Loadout) => void;
  isFinalSpin?: boolean;
}

export interface ColumnState {
  position: number;
  velocity: number;
  isAnimating: boolean;
  finalIndex: number;
  currentIndex: number;
}
