import React, { useState, useReducer, useEffect, useCallback, useRef } from 'react';
import { AlertDialog, AlertDialogAction } from '@/components/ui/alert';

// Game data
const LOADOUTS = {
  Light: {
    weapons: ["93R", "Dagger", "LH1", "M26 Matter", "Recurve Bow", "Sword", "V9S", "XP-54", "Throwing Knives"],
    specializations: ["Cloaking Device", "Evasive Dash", "Grappling Hook"],
    gadgets: ["Breach Charge", "Gateway", "Glitch Grenade", "Gravity Vortex", "Sonar Grenade", "Stun Gun", 
              "Thermal Bore", "Thermal Vision", "Tracking Dart", "Vanishing Bomb", "Goo Grenade", "Pyro Grenade", 
              "Smoke Grenade", "Frag Grenade", "Flashbang"]
  },
  Medium: {
    weapons: ["AKM", "Cerberus 12GA", "Dual Blades", "FAMAS", "FCAR", "Model 1887", "Pike-556", "R.357", "Riot Shield"],
    specializations: ["Dematerializer", "Guardian Turret", "Healing Beam"],
    gadgets: ["APS Turret", "Data Reshaper", "Defibrillator", "Explosive Mine", "Gas Mine", "Glitch Trap", 
              "Jump Pad", "Zipline", "Gas Grenade", "Goo Grenade", "Pyro Grenade", "Smoke Grenade", 
              "Frag Grenade", "Flashbang", "Proximity Sensor"]
  },
  Heavy: {
    weapons: ["50 Akimbo", "Flamethrower", "KS-23", "Lewis Gun", "M60", "M32GL", "Sledgehammer", "SHAK-50", "Spear"],
    specializations: ["Charge N Slam", "Goo Gun", "Mesh Shield", "Winch Claw"],
    gadgets: ["Anti-Gravity Cube", "Barricade", "Dome Shield", "Lockbolt Launcher", "Pyro Mine", "Proximity Sensor", 
              "RPG-7", "Goo Grenade", "Pyro Grenade", "Smoke Grenade", "Frag Grenade", "Flashbang", 
              "Explosive Mine", "Gas Grenade"]
  }
};

// Initial state
const initialState = {
  selectedClass: null,
  isSpinning: false,
  currentSpin: 1,
  totalSpins: 0,
  selectedLoadout: null,
  stoppedColumns: new Set(),
};

// Reducer for game state
function gameReducer(state, action) {
  switch (action.type) {
    case 'SELECT_CLASS':
      return {
        ...state,
        selectedClass: action.payload,
        selectedLoadout: null
      };
    case 'START_SPIN':
      return {
        ...state,
        isSpinning: true,
        stoppedColumns: new Set(),
        totalSpins: action.payload,
        currentSpin: action.payload
      };
    case 'STOP_COLUMN':
      const newStoppedColumns = new Set(state.stoppedColumns);
      newStoppedColumns.add(action.payload);
      return {
        ...state,
        stoppedColumns: newStoppedColumns
      };
    case 'END_SPIN':
      return {
        ...state,
        isSpinning: false,
        currentSpin: Math.max(0, state.currentSpin - 1),
        selectedLoadout: action.payload
      };
    case 'RESET':
      return initialState;
    default:
      return state;
  }
}

// Slot column component
const SlotColumn = React.memo(({ items, delay, isSpinning, onStop, columnIndex }) => {
  const columnRef = useRef(null);
  const [offset, setOffset] = useState(0);
  const [isStopped, setIsStopped] = useState(false);
  const animationRef = useRef(null);

  const animate = useCallback(() => {
    if (!columnRef.current) return;
    
    setOffset(prev => {
      const newOffset = (prev + 20) % (188 * 8);
      columnRef.current.style.transform = `translate3d(0,${newOffset}px,0)`;
      return newOffset;
    });
    
    animationRef.current = requestAnimationFrame(animate);
  }, []);

  useEffect(() => {
    if (isSpinning && !isStopped) {
      animationRef.current = requestAnimationFrame(animate);
      
      // Staggered stop
      const stopTime = 500 + delay;
      const timer = setTimeout(() => {
        cancelAnimationFrame(animationRef.current);
        setIsStopped(true);
        onStop(columnIndex);
        
        // Snap to final position
        if (columnRef.current) {
          columnRef.current.style.transform = `translate3d(0,${188}px,0)`;
        }
      }, stopTime);

      return () => {
        clearTimeout(timer);
        if (animationRef.current) {
          cancelAnimationFrame(animationRef.current);
        }
      };
    }
  }, [isSpinning, delay, animate, onStop, columnIndex, isStopped]);

  return (
    <div 
      ref={columnRef}
      className={`w-36 h-48 overflow-hidden ${isStopped ? 'final-glow' : ''}`}
      style={{
        willChange: 'transform',
        backfaceVisibility: 'hidden',
        perspective: '1000px',
      }}
    >
      <div className="flex flex-col">
        {items.map((item, idx) => (
          <div 
            key={idx}
            className={`h-48 w-36 flex flex-col items-center justify-center bg-gradient-to-b from-gray-800 to-gray-900 
                       rounded-lg border-2 border-yellow-500/20 ${idx === 4 ? 'winner' : ''}`}
          >
            <img 
              src={`/api/placeholder/144/144`}
              alt={item}
              className="w-32 h-32 object-cover rounded"
            />
            <p className="text-white mt-2 text-sm font-medium">{item}</p>
          </div>
        ))}
      </div>
    </div>
  );
});

// Main component
export default function LoadoutGenerator() {
  const [state, dispatch] = useReducer(gameReducer, initialState);
  const [showCopyDialog, setShowCopyDialog] = useState(false);

  const handleClassSelect = (classType) => {
    if (state.isSpinning) return;
    dispatch({ type: 'SELECT_CLASS', payload: classType });
  };

  const handleSpin = (spins) => {
    if (state.isSpinning) return;
    dispatch({ type: 'START_SPIN', payload: spins });
  };

  const handleColumnStop = (columnIndex) => {
    dispatch({ type: 'STOP_COLUMN', payload: columnIndex });
    
    // Check if all columns stopped
    if (state.stoppedColumns.size === 5) {
      const newLoadout = generateLoadout(state.selectedClass);
      dispatch({ type: 'END_SPIN', payload: newLoadout });
      
      // Start next spin if needed
      if (state.currentSpin > 1) {
        setTimeout(() => handleSpin(state.currentSpin), 1000);
      }
    }
  };

  const generateLoadout = (classType) => {
    if (!classType) return null;
    const loadout = LOADOUTS[classType];
    
    return {
      class: classType,
      weapon: loadout.weapons[Math.floor(Math.random() * loadout.weapons.length)],
      specialization: loadout.specializations[Math.floor(Math.random() * loadout.specializations.length)],
      gadgets: getUniqueItems(loadout.gadgets, 3)
    };
  };

  const getUniqueItems = (array, count) => {
    const shuffled = [...array].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, count);
  };

  const copyLoadout = () => {
    if (!state.selectedLoadout) return;
    
    const text = `Class: ${state.selectedLoadout.class}
Weapon: ${state.selectedLoadout.weapon}
Specialization: ${state.selectedLoadout.specialization}
Gadget 1: ${state.selectedLoadout.gadgets[0]}
Gadget 2: ${state.selectedLoadout.gadgets[1]}
Gadget 3: ${state.selectedLoadout.gadgets[2]}`;

    navigator.clipboard.writeText(text);
    setShowCopyDialog(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-purple-900 py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-4xl font-bold text-yellow-500 mb-8 text-center">
          The Finals Loadout Generator
        </h1>

        {/* Class Selection */}
        <div className="flex justify-center gap-4 mb-8">
          {['Light', 'Medium', 'Heavy', 'Random'].map((classType) => (
            <button
              key={classType}
              onClick={() => handleClassSelect(classType)}
              disabled={state.isSpinning}
              className={`w-20 h-20 rounded-full flex items-center justify-center text-sm font-bold
                         transition-all duration-300 ${
                state.selectedClass === classType
                  ? 'bg-yellow-500 text-black'
                  : 'border-2 border-yellow-500 text-white hover:bg-yellow-500 hover:text-black'
              }`}
            >
              {classType}
            </button>
          ))}
        </div>

        {/* Spin Selection */}
        {state.selectedClass && !state.isSpinning && (
          <div className="flex justify-center gap-4 mb-8">
            {[1, 2, 3, 4, 5].map((spins) => (
              <button
                key={spins}
                onClick={() => handleSpin(spins)}
                className="w-16 h-16 rounded-full border-2 border-blue-500 text-white
                         hover:bg-blue-500 transition-all duration-300"
              >
                {spins}
              </button>
            ))}
          </div>
        )}

        {/* Slot Machine */}
        <div className="flex justify-center items-start gap-4 mb-8 overflow-x-auto p-4">
          {state.selectedLoadout && (
            <>
              <SlotColumn
                items={Array(8).fill(state.selectedLoadout.class)}
                delay={0}
                isSpinning={state.isSpinning}
                onStop={handleColumnStop}
                columnIndex={0}
              />
              <SlotColumn
                items={getUniqueItems(LOADOUTS[state.selectedClass]?.weapons || [], 8)}
                delay={700}
                isSpinning={state.isSpinning}
                onStop={handleColumnStop}
                columnIndex={1}
              />
              <SlotColumn
                items={getUniqueItems(LOADOUTS[state.selectedClass]?.specializations || [], 8)}
                delay={1400}
                isSpinning={state.isSpinning}
                onStop={handleColumnStop}
                columnIndex={2}
              />
              {state.selectedLoadout.gadgets.map((gadget, index) => (
                <SlotColumn
                  key={index}
                  items={getUniqueItems(LOADOUTS[state.selectedClass]?.gadgets || [], 8)}
                  delay={2100 + (index * 700)}
                  isSpinning={state.isSpinning}
                  onStop={handleColumnStop}
                  columnIndex={3 + index}
                />
              ))}
            </>
          )}
        </div>

        {/* Copy Button */}
        {state.selectedLoadout && !state.isSpinning && (
          <div className="flex justify-center">
            <button
              onClick={copyLoadout}
              className="px-6 py-3 bg-gray-700 text-white rounded-lg hover:bg-gray-600
                       transition-all duration-300 uppercase tracking-wide"
            >
              Copy Loadout
            </button>
          </div>
        )}

        {/* Copy Dialog */}
        {showCopyDialog && (
          <AlertDialog open={showCopyDialog} onOpenChange={setShowCopyDialog}>
            <div className="bg-gray-800 text-white p-4 rounded-lg">
              <h2 className="text-lg font-bold mb-2">Success!</h2>
              <p>Loadout copied to clipboard!</p>
              <AlertDialogAction
                className="mt-4 px-4 py-2 bg-yellow-500 text-black rounded hover:bg-yellow-400"
                onClick={() => setShowCopyDialog(false)}
              >
                OK
              </AlertDialogAction>
            </div>
          </AlertDialog>
        )}
      </div>
    </div>
  );
}