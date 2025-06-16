export interface SpinResult {
  value: string;
  spins: number;
  isJackpot: boolean;
}

export interface SpinCountWheelProps {
  onSpinComplete: (result: SpinResult) => void;
}

export interface CardData {
  value: string;
  spins: number;
  label: string;
  className: string;
  isJackpot?: boolean;
}

export interface ModalResult {
  variant: 'number' | 'jackpot';
  value: string;
  spins: number;
}