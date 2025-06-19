import React from 'react';
import SlotMachine from '../features/slot-machine';
import StartOverButton from './StartOverButton';
import AIAnalysisBox from './AIAnalysisBox';
import { useGameState, useGameDispatch } from '../hooks/useGameState';
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
  const state = useGameState();
  const { hideAnalysis } = useGameDispatch();
  
  
  return (
    <div className="w-full flex flex-col items-center">
      {/* Slot Machine */}
      <div className="w-full">
        <SlotMachine images={[]} onResult={onResult} onSpinEnd={onResult} isFinalSpin={isFinalSpin} />
      </div>

      {/* AI Analysis Box */}
      {state.analysisVisible && state.latestLoadout && (
        <AIAnalysisBox loadout={state.latestLoadout} onClose={hideAnalysis} />
      )}

      {/* Start Over button when all spins are done */}
      {spinsLeft === 0 && <StartOverButton />}
    </div>
  );
};

export default SlotMachineLayout;