export interface SlotItem {
  name: string;
  image: string;
}

export interface SlotColumn {
  items: SlotItem[];
  currentIndex: number;
  isSpinning: boolean;
  spinDuration: number;
}

export interface SlotMachineProps {
  className: 'Light' | 'Medium' | 'Heavy';
  spinCount: number;
  onComplete: (result: SlotResult) => void;
  autoSpin?: boolean;
}

export interface SlotResult {
  weapon: string;
  specialization: string;
  gadget1: string;
  gadget2: string;
  gadget3: string;
}

export interface SlotMachineState {
  columns: SlotColumn[];
  isSpinning: boolean;
  currentSpin: number;
  result: SlotResult | null;
}