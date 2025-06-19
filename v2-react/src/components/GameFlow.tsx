import React, { useState, useEffect } from 'react';
import { useGameState, useGameDispatch } from '../hooks/useGameState';
import SpinCountWheel from '../features/spin-selector';
import SlotMachineLayout from './SlotMachineLayout';
import MobileLoader from './MobileLoader';
import GameMarquee from './GameMarquee';
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
  const { finishSpin, finishRoulette, runSlot, addToHistory, setSpins, showAnalysis, setLatestLoadout } = useGameDispatch();
  const { isMobile } = useMobileDetect();
  const [autoSpinRoulette, setAutoSpinRoulette] = useState(false);
  
  if (process.env.NODE_ENV === 'development') {
    console.log('🎮 GameFlow state:', state);
  }

  const handleSpinComplete = (result: { value: string; spins: number; isJackpot: boolean }) => {
    if (result.isJackpot) {
      // Jackpot result - set spins but DON'T change stage yet
      // The modal will handle class selection and then transition
      setSpins(result.spins);
      // Don't call finishSpin here - let the modal handle it
    } else {
      // Normal spin - set spins and auto-spin roulette
      setSpins(result.spins);
      setAutoSpinRoulette(true);
      // Update stage
      finishSpin(result.spins);
    }
  };

  const handleRouletteComplete = (clazz: ClassType) => {
    setAutoSpinRoulette(false);
    finishRoulette(clazz);
  };

  const handleSlotResult = (loadout: Loadout) => {
    addToHistory(loadout);
    runSlot();
    // Only trigger AI analysis on the final spin
    if (state.spinsLeft === 1) {
      showAnalysis(loadout);
      setLatestLoadout(loadout);
    }
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

  // Get info text for GameMarquee
  const getMarqueeInfo = () => {
    switch (state.stage) {
      case 'SPIN':
        // After spin complete, show spins available
        if (state.spinsLeft > 0) {
          return `${state.spinsLeft} Spins Available`;
        }
        // Initial state - pull the lever
        return 'Pull the Lever';
      case 'ROULETTE':
        // Show spinning or result
        return state.chosenClass ? `You Rolled ${state.chosenClass}` : 'Spinning…';
      case 'SLOTS':
        // Show class and spins remaining
        return `Class: ${state.chosenClass || 'Unknown'}   Spins Remaining: ${state.spinsLeft}`;
      default:
        return '';
    }
  };

  // Jackpot shortcut - skip roulette if we have both class and spins
  if (state.spinsLeft > 0 && state.chosenClass && state.stage === 'SLOTS') {
    return (
      <div className="w-full">
        <GameMarquee 
          title="Loadout Locked-In" 
          info={getMarqueeInfo()} 
        />
        <div className="flex justify-center pt-6">
          <SlotMachineLayout
            spinsLeft={state.spinsLeft}
            isFinalSpin={state.spinsLeft === 1}
            onResult={handleSlotResult}
          />
        </div>
      </div>
    );
  }

  // Render based on game stage
  switch (state.stage) {
    case 'SPIN':
      return (
        <div className="w-full">
          <GameMarquee title="Spin Selector" info={getMarqueeInfo()} />
          <div className="flex justify-center pt-6">
            <SpinCountWheel onSpinComplete={handleSpinComplete} />
          </div>
        </div>
      );

    case 'ROULETTE':
      return (
        <div className="w-full">
          <GameMarquee title="Class Call" info={getMarqueeInfo()} />
          <div className="flex justify-center pt-16">
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
          </div>
        </div>
      );

    case 'SLOTS':
      if (!state.chosenClass) {
        // Waiting for jackpot class selection - show spin selector with modal
        return (
          <div className="w-full">
            <GameMarquee title="Spin Selector" info="Choose Your Class" />
            <div className="flex items-center justify-center w-full mt-6">
              <SpinCountWheel onSpinComplete={handleSpinComplete} />
            </div>
          </div>
        );
      }

      return (
        <div className="w-full">
          <GameMarquee title="Loadout Locked-In" info={getMarqueeInfo()} />
          <div className="flex justify-center pt-6">
            <SlotMachineLayout
              spinsLeft={state.spinsLeft}
              isFinalSpin={state.spinsLeft === 1}
              onResult={handleSlotResult}
            />
          </div>
        </div>
      );

    default:
      return null;
  }
};

export default GameFlow;