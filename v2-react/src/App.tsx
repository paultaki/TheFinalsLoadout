import React, { useState } from 'react';
import { GameProvider } from './context/GameProvider';
import { LoadoutHistoryProvider } from './context/LoadoutHistoryContext';
import { useGameState, useGameDispatch } from './hooks/useGameState';
import SpinCountWheel from './features/spin-selector';
import ClassRoulette from './features/class-roulette';
import SlotMachine from './features/slot-machine';
import LoadoutHistory from './components/LoadoutHistory';
import type { ClassType, Loadout } from './types';

// History Component
interface HistoryProps {
  loadouts: Loadout[];
}

const History: React.FC<HistoryProps> = ({ loadouts }) => {
  if (loadouts.length === 0) return null;

  const recentLoadouts = loadouts.slice(-5).reverse();

  return (
    <div className="fixed bottom-4 left-4 bg-gray-900/90 rounded-lg p-4 max-w-sm">
      <h3 className="text-sm font-bold mb-2 text-gray-400">Recent Loadouts</h3>
      <div className="space-y-2 text-xs">
        {recentLoadouts.map((loadout, index) => (
          <div key={index} className="bg-gray-800 rounded p-2">
            <div className="text-yellow-400">{loadout.weapon.name}</div>
            <div className="text-blue-400">{loadout.specialization.name}</div>
            <div className="text-gray-300">
              {loadout.gadget1.name}, {loadout.gadget2.name}, {loadout.gadget3.name}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const GameFlow: React.FC = () => {
  const state = useGameState();
  const { finishSpin, finishRoulette, runSlot, addToHistory, setSpins } = useGameDispatch();
  const [autoSpinRoulette, setAutoSpinRoulette] = useState(false);

  const handleSpinComplete = (result: { value: string; spins: number; isJackpot: boolean }) => {
    console.log('Spin complete:', result);

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
    console.log('Loadout generated:', loadout);
  };

  // Auto-spin roulette when needed
  React.useEffect(() => {
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
  React.useEffect(() => {
    if (state.stage === 'SLOTS' && state.chosenClass && state.spinsLeft > 0) {
      // SlotMachine will auto-start on mount
    }
  }, [state.stage, state.chosenClass, state.spinsLeft]);

  // Jackpot shortcut - skip roulette if we have both class and spins
  if (state.spinsLeft > 0 && state.chosenClass) {
    return (
      <>
        <div className="min-h-screen bg-gray-950 text-white flex flex-col">
          {/* Slot Machine */}
          <div className="flex-1">
            <SlotMachine
              images={[]}
              onResult={handleSlotResult}
              isFinalSpin={state.spinsLeft === 1}
            />
          </div>

          {/* Start Over button when all spins are done */}
          {state.spinsLeft === 0 && (
            <div className="flex justify-center pb-8">
              <button
                onClick={() => window.location.reload()}
                className="px-8 py-4 bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-black font-bold text-xl rounded-xl transform hover:scale-105 transition-all"
              >
                Start Over
              </button>
            </div>
          )}

          {/* Loadout History */}
          <LoadoutHistory />
        </div>
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
          <div className="min-h-screen bg-gray-950 text-white flex flex-col">
            {/* Slot Machine */}
            <div className="flex-1">
              <SlotMachine
                images={[]}
                onResult={handleSlotResult}
                isFinalSpin={state.spinsLeft === 1}
              />
            </div>

            {/* Start Over button when all spins are done */}
            {state.spinsLeft === 0 && (
              <div className="flex justify-center pb-8">
                <button
                  onClick={() => window.location.reload()}
                  className="px-8 py-4 bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-black font-bold text-xl rounded-xl transform hover:scale-105 transition-all"
                >
                  Start Over
                </button>
              </div>
            )}

            {/* Loadout History */}
            <LoadoutHistory />
          </div>
          <History loadouts={state.history} />
        </>
      );

    default:
      return null;
  }
};

function App() {
  return (
    <LoadoutHistoryProvider>
      <GameProvider>
        <div className="min-h-screen bg-gray-950 text-white overflow-x-hidden">
          <div className="max-w-full px-2 sm:px-4 lg:px-8">
            <GameFlow />
          </div>
        </div>
      </GameProvider>
    </LoadoutHistoryProvider>
  );
}

export default App;
