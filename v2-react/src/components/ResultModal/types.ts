export interface ResultModalProps {
  variant: 'number' | 'jackpot';
  value: string;
  spins: number;
  onSelectClass?: (cls: 'Light' | 'Medium' | 'Heavy') => void;
  onClose?: () => void;
}

export type ClassType = 'Light' | 'Medium' | 'Heavy';

export interface ClassButtonConfig {
  class: ClassType;
  label: string;
  color: string;
  gradient: string;
  shadow: {
    default: string;
    hover: string;
  };
}