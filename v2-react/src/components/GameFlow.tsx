import React, { useState, useEffect } from 'react';
import { useGameState, useGameDispatch } from '../hooks/useGameState';
import SpinCountWheel from '../features/spin-selector';
import ClassRoulette from '../features/class-roulette';
import SlotMachineLayout from './SlotMachineLayout';
import History from './History';
import type { ClassType, Loadout } from '../types';

/**
 * Main game flow component that manages transitions between spin wheel, class roulette, and slot machine
 */
const GameFlow: React.FC = () => {
  const state = useGameState();
  const { finishSpin, finishRoulette, runSlot, addToHistory, setSpins } = useGameDispatch();
  const [autoSpinRoulette, setAutoSpinRoulette] = useState(false);

  const handleSpinComplete = (result: { value: string; spins: number; isJackpot: boolean }) => {
    if (result.isJackpot) {
      // Jackpot result is already handled by ResultModal in SpinCountWheel
      setSpins(result.spins);
    } else {
      // Normal spin - set spins and auto-spin roulette
      setSpins(result.spins);
      setAutoSpinRoulette(true);
    }

    // Update stage
    finishSpin(result.isJackpot ? 'JACKPOT' : result.spins);
  };

  const handleRouletteComplete = (clazz: ClassType) => {
    setAutoSpinRoulette(false);
    finishRoulette(clazz);
  };

  const handleSlotResult = (loadout: Loadout) => {
    addToHistory(loadout);
    runSlot();
  };

  // Auto-spin roulette when needed
  useEffect(() => {
    if (autoSpinRoulette && state.stage === 'ROULETTE') {
      // Trigger auto-spin after a short delay
      const timer = setTimeout(() => {
        const spinBtn = document.querySelector('.class-roulette button') as HTMLButtonElement;
        if (spinBtn) {
          spinBtn.click();
        }
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [autoSpinRoulette, state.stage]);

  // Auto-transition to slots when class is chosen
  useEffect(() => {
    if (state.stage === 'SLOTS' && state.chosenClass && state.spinsLeft > 0) {
      // SlotMachine will auto-start on mount
    }
  }, [state.stage, state.chosenClass, state.spinsLeft]);

  // Jackpot shortcut - skip roulette if we have both class and spins
  if (state.spinsLeft > 0 && state.chosenClass) {
    return (
      <>
        <SlotMachineLayout
          spinsLeft={state.spinsLeft}
          isFinalSpin={state.spinsLeft === 1}
          onResult={handleSlotResult}
        />
        <History loadouts={state.history} />
      </>
    );
  }

  // Render based on game stage
  switch (state.stage) {
    case 'SPIN':
      return (
        <>
          <SpinCountWheel onSpinComplete={handleSpinComplete} />
          <History loadouts={state.history} />
        </>
      );

    case 'ROULETTE':
      return (
        <>
          <div className="class-roulette">
            <ClassRoulette onComplete={handleRouletteComplete} />
          </div>
          <History loadouts={state.history} />
        </>
      );

    case 'SLOTS':
      if (!state.chosenClass) {
        // Waiting for jackpot class selection - show spin selector with modal
        return (
          <>
            <SpinCountWheel onSpinComplete={handleSpinComplete} />
            <History loadouts={state.history} />
          </>
        );
      }

      return (
        <>
          <SlotMachineLayout
            spinsLeft={state.spinsLeft}
            isFinalSpin={state.spinsLeft === 1}
            onResult={handleSlotResult}
          />
          <History loadouts={state.history} />
        </>
      );

    default:
      return null;
  }
};

export default GameFlow;