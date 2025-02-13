import React, { useState } from 'react';
import { SlotMachine } from './components/SlotMachine';

function App() {
  const [selectedClass, setSelectedClass] = useState(null);
  const [isSpinning, setIsSpinning] = useState(false);
  const [selectedLoadout, setSelectedLoadout] = useState(null);

  const handleClassSelect = (classType) => {
    setSelectedClass(classType);
    // Generate a sample loadout when class is selected
    setSelectedLoadout({
      class: classType,
      weapon: "Dagger",
      specialization: "Cloaking Device",
      gadgets: ["Breach Charge", "Gateway", "Glitch Grenade"]
    });
  };

  const handleSpin = () => {
    setIsSpinning(true);
    // Reset spinning after animation
    setTimeout(() => {
      setIsSpinning(false);
    }, 5000);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Test buttons */}
      <div className="p-4 space-y-4">
        <div className="space-x-4">
          <button 
            onClick={() => handleClassSelect('Light')}
            className="px-4 py-2 bg-blue-500 rounded"
          >
            Select Light Class
          </button>
          <button 
            onClick={handleSpin}
            className="px-4 py-2 bg-green-500 rounded"
            disabled={!selectedClass || isSpinning}
          >
            Spin
          </button>
        </div>
      </div>

      {/* Slot Machine */}
      <SlotMachine 
        selectedClass={selectedClass}
        isSpinning={isSpinning}
        selectedLoadout={selectedLoadout}
        onColumnStop={(columnIndex) => console.log(`Column ${columnIndex} stopped`)}
      />
    </div>
  );
}

export default App;