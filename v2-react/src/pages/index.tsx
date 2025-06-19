import React, { useState, useEffect } from 'react';
import { GameProvider } from '../context/GameProvider';
import SpinWheel from '../components/SpinWheel';
import ClassRoulette from '../components/ClassRoulette';
import SlotMachine from '../components/SlotMachine';
import HistoryCard from '../components/HistoryCard';
import { playSound } from '../utils/audio';

type GameStage = 'spin-wheel' | 'class-select' | 'slot-machine' | 'complete';

interface LoadoutResult {
  class: 'Light' | 'Medium' | 'Heavy';
  weapon: string;
  specialization: string;
  gadget1: string;
  gadget2: string;
  gadget3: string;
  timestamp: number;
  analysis?: string;
}

const MainPage: React.FC = () => {
  const [stage, setStage] = useState<GameStage>('spin-wheel');
  const [spinCount, setSpinCount] = useState(0);
  const [isJackpot, setIsJackpot] = useState(false);
  const [selectedClass, setSelectedClass] = useState<'Light' | 'Medium' | 'Heavy' | null>(null);
  const [history, setHistory] = useState<LoadoutResult[]>([]);
  const [latestResult, setLatestResult] = useState<LoadoutResult | null>(null);

  // Load history from localStorage on mount
  useEffect(() => {
    const savedHistory = localStorage.getItem('loadoutHistory');
    if (savedHistory) {
      setHistory(JSON.parse(savedHistory));
    }
  }, []);

  // Save history to localStorage whenever it changes
  useEffect(() => {
    if (history.length > 0) {
      localStorage.setItem('loadoutHistory', JSON.stringify(history));
    }
  }, [history]);

  const handleSpinComplete = (result: { value: string; spins: number; isJackpot: boolean }) => {
    setIsJackpot(result.isJackpot);
    setSpinCount(result.spins);
    
    if (result.isJackpot) {
      // Show manual class selection
      setStage('complete'); // Will show class selection buttons
    } else {
      // Auto-spin roulette
      setStage('class-select');
    }
  };

  const handleClassSelect = (clazz: 'Light' | 'Medium' | 'Heavy') => {
    setSelectedClass(clazz);
    setStage('slot-machine');
  };

  const handleSlotComplete = async (result: any) => {
    const newLoadout: LoadoutResult = {
      class: selectedClass!,
      weapon: result.weapon,
      specialization: result.specialization,
      gadget1: result.gadget1,
      gadget2: result.gadget2,
      gadget3: result.gadget3,
      timestamp: Date.now()
    };

    // Try to get analysis from backend
    try {
      const response = await fetch('http://localhost:4000/api/analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          class: newLoadout.class,
          weapon: newLoadout.weapon,
          specialization: newLoadout.specialization,
          gadgets: [newLoadout.gadget1, newLoadout.gadget2, newLoadout.gadget3]
        })
      });

      if (response.ok) {
        const data = await response.json();
        newLoadout.analysis = data.roast;
      }
    } catch (error) {
      console.error('Failed to get analysis:', error);
    }

    // Add to history (max 5)
    setHistory(prev => [newLoadout, ...prev].slice(0, 5));
    setLatestResult(newLoadout);
    setStage('complete');
  };

  const resetGame = () => {
    setStage('spin-wheel');
    setSpinCount(0);
    setIsJackpot(false);
    setSelectedClass(null);
    setLatestResult(null);
  };

  return (
    <GameProvider>
      <div className="min-h-screen bg-gray-900 text-white">
        {/* Neon background effects */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-600 rounded-full blur-3xl opacity-20" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-pink-600 rounded-full blur-3xl opacity-20" />
        </div>

        {/* Main content */}
        <div className="relative z-10 container mx-auto px-4 py-8">
          {/* Header */}
          <header className="text-center mb-8">
            <h1 className="text-4xl md:text-6xl font-bold mb-2">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
                THE FINALS
              </span>
            </h1>
            <p className="text-xl text-gray-400">Random Loadout Generator</p>
          </header>

          {/* Game Stage */}
          <div className="mb-12">
            {stage === 'spin-wheel' && (
              <SpinWheel onComplete={handleSpinComplete} />
            )}

            {stage === 'class-select' && selectedClass === null && (
              <ClassRoulette 
                onComplete={handleClassSelect} 
                spinCount={spinCount}
                autoSpin={!isJackpot}
              />
            )}

            {stage === 'slot-machine' && selectedClass && (
              <SlotMachine
                className={selectedClass}
                spinCount={spinCount}
                onComplete={handleSlotComplete}
              />
            )}

            {stage === 'complete' && (
              <div className="max-w-2xl mx-auto text-center">
                {isJackpot && !selectedClass && (
                  <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-8 border border-yellow-500/50">
                    <h2 className="text-3xl font-bold mb-6 text-yellow-400">
                      🎰 JACKPOT! Choose Your Class! 🎰
                    </h2>
                    <div className="grid grid-cols-3 gap-4">
                      <button
                        onClick={() => handleClassSelect('Light')}
                        className="p-6 bg-gradient-to-br from-cyan-600 to-blue-700 rounded-lg hover:scale-105 transition-transform"
                      >
                        <div className="text-4xl mb-2">⚡</div>
                        <div className="font-bold">LIGHT</div>
                      </button>
                      <button
                        onClick={() => handleClassSelect('Medium')}
                        className="p-6 bg-gradient-to-br from-green-600 to-emerald-700 rounded-lg hover:scale-105 transition-transform"
                      >
                        <div className="text-4xl mb-2">🛡️</div>
                        <div className="font-bold">MEDIUM</div>
                      </button>
                      <button
                        onClick={() => handleClassSelect('Heavy')}
                        className="p-6 bg-gradient-to-br from-orange-600 to-red-700 rounded-lg hover:scale-105 transition-transform"
                      >
                        <div className="text-4xl mb-2">💪</div>
                        <div className="font-bold">HEAVY</div>
                      </button>
                    </div>
                  </div>
                )}

                {latestResult && (
                  <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-8 mb-6">
                    <h2 className="text-2xl font-bold mb-4 text-green-400">Loadout Complete!</h2>
                    <HistoryCard loadout={latestResult} index={0} />
                    <button
                      onClick={resetGame}
                      className="mt-6 px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 
                               font-bold rounded-lg hover:scale-105 transition-transform"
                    >
                      SPIN AGAIN
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* History Section */}
          {history.length > 0 && (
            <div className="max-w-4xl mx-auto">
              <h2 className="text-2xl font-bold mb-4 text-center">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
                  Recent Loadouts
                </span>
              </h2>
              <div className="grid gap-4">
                {history.map((loadout, index) => (
                  <HistoryCard key={`${loadout.timestamp}-${index}`} loadout={loadout} index={index} />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </GameProvider>
  );
};

export default MainPage;