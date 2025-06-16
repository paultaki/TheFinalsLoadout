import React from 'react';
import SlotMachine from '../features/slot-machine';
import StartOverButton from './StartOverButton';
import type { Loadout } from '../types';

interface SlotMachineLayoutProps {
  spinsLeft: number;
  isFinalSpin: boolean;
  onResult: (loadout: Loadout) => void;
}

/**
 * Layout wrapper for slot machine that includes start over button
 */
const SlotMachineLayout: React.FC<SlotMachineLayoutProps> = ({ spinsLeft, isFinalSpin, onResult }) => {
  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col items-center justify-center">
      {/* Slot Machine */}
      <div className="w-full">
        <SlotMachine images={[]} onResult={onResult} isFinalSpin={isFinalSpin} />
      </div>

      {/* Start Over button when all spins are done */}
      {spinsLeft === 0 && <StartOverButton />}
    </div>
  );
};

export default SlotMachineLayout;