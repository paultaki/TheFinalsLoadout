import React from 'react';
import SlotMachine from '../features/slot-machine';
import LoadoutHistory from './LoadoutHistory';
import StartOverButton from './StartOverButton';
import type { Loadout } from '../types';

interface SlotMachineLayoutProps {
  spinsLeft: number;
  isFinalSpin: boolean;
  onResult: (loadout: Loadout) => void;
}

const SlotMachineLayout: React.FC<SlotMachineLayoutProps> = ({ spinsLeft, isFinalSpin, onResult }) => {
  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col">
      {/* Slot Machine */}
      <div className="flex-1">
        <SlotMachine images={[]} onResult={onResult} isFinalSpin={isFinalSpin} />
      </div>

      {/* Start Over button when all spins are done */}
      {spinsLeft === 0 && <StartOverButton />}

      {/* Loadout History */}
      <LoadoutHistory />
    </div>
  );
};

export default SlotMachineLayout;