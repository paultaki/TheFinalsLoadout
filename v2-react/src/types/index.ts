export type ClassType = 'Light' | 'Medium' | 'Heavy';
export type GameStage = 'SPIN' | 'ROULETTE' | 'SLOTS';

export interface SpinResult {
  value: string;
  spins: number;
  isJackpot: boolean;
}

export interface LoadoutItem {
  name: string;
  category: 'weapon' | 'specialization' | 'gadget';
}

export interface Loadout {
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

export interface GameState {
  spinsLeft: number;
  chosenClass: ClassType | null;
  stage: GameStage;
  history: Loadout[];
}

export interface WheelSegment {
  label: string;
  value: string;
  color: {
    base: string;
    dark: string;
    light: string;
  };
}
