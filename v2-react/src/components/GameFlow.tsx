import React, { useState, useEffect } from 'react';
import { useGameState, useGameDispatch } from '../hooks/useGameState';
import SpinCountWheel from '../features/spin-selector';
import SlotMachineLayout from './SlotMachineLayout';
import MobileLoader from './MobileLoader';
import { useMobileDetect } from '../hooks/useMobileDetect';
import { FEATURE_FLAGS } from '../constants/features';
import type { ClassType, Loadout } from '../types';

// Import components based on feature flag
import RouletteWheel from './RouletteWheel';
const ClassRouletteOLD = React.lazy(() => import('../features/class-roulette/ClassRoulette_OLD'));

/**
 * Main game flow component that manages transitions between spin wheel, class roulette, and slot machine
 */
const GameFlow: React.FC = () => {
  const state = useGameState();
  const { finishSpin, finishRoulette, runSlot, addToHistory, setSpins } = useGameDispatch();
  const { isMobile } = useMobileDetect();
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
      // For new roulette, it auto-spins on mount, so no need to trigger manually
      if (!FEATURE_FLAGS.USE_NEW_ROULETTE) {
        // Legacy roulette - trigger auto-spin
        const timer = setTimeout(() => {
          const spinBtn = document.querySelector('.class-roulette button') as HTMLButtonElement;
          if (spinBtn) {
            spinBtn.click();
          }
        }, 500);
        return () => clearTimeout(timer);
      }
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
      </>
    );
  }

  // Render based on game stage
  switch (state.stage) {
    case 'SPIN':
      return (
        <>
          <SpinCountWheel onSpinComplete={handleSpinComplete} />
        </>
      );

    case 'ROULETTE':
      return (
        <>
          {FEATURE_FLAGS.USE_NEW_ROULETTE ? (
            <RouletteWheel onClassSelected={handleRouletteComplete} />
          ) : (
            <React.Suspense fallback={
              isMobile ? (
                <MobileLoader text="Loading class selector..." />
              ) : (
                <div className="min-h-screen bg-gray-950 flex items-center justify-center text-white">Loading...</div>
              )
            }>
              <div className="class-roulette">
                <ClassRouletteOLD onComplete={handleRouletteComplete} />
              </div>
            </React.Suspense>
          )}
        </>
      );

    case 'SLOTS':
      if (!state.chosenClass) {
        // Waiting for jackpot class selection - show spin selector with modal
        return (
          <>
            <SpinCountWheel onSpinComplete={handleSpinComplete} />
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
        </>
      );

    default:
      return null;
  }
};

export default GameFlow;