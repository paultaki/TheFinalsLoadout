// SpinSelector.js
import React, { useState } from 'react';

const SpinSelector = () => {
  const [selectedSpins, setSelectedSpins] = useState(1);
  const [currentStep, setCurrentStep] = useState(1);

  return (
    <div className="flex flex-col items-center w-full max-w-2xl mx-auto space-y-6 p-4">
      {/* Step 1 */}
      <div className={`w-full p-4 rounded-lg text-center text-lg font-medium transition-all duration-300 
        ${currentStep === 1 ? 'bg-yellow-500 text-black' : 'bg-gray-800 text-gray-400'}`}>
        Step 1️⃣: Choose number of spins
      </div>

      {/* Spin Count Selector */}
      <div className="flex justify-center gap-4 w-full mb-4">
        {[1, 2, 3, 4, 5].map((count) => (
          <button
            key={count}
            onClick={() => {
              setSelectedSpins(count);
              setCurrentStep(2);
            }}
            className={`
              w-16 h-16 
              text-2xl font-bold 
              rounded-full 
              transition-all 
              duration-300 
              transform hover:scale-110 
              ${selectedSpins === count 
                ? 'bg-yellow-500 text-black shadow-lg scale-110' 
                : 'bg-gray-800 text-white hover:bg-gray-700'
              }
              border-2
              ${selectedSpins === count 
                ? 'border-yellow-300' 
                : 'border-gray-600'
              }
              shadow hover:shadow-xl
            `}
          >
            {count}
          </button>
        ))}
      </div>

      {/* Step 2 */}
      <div className={`w-full p-4 rounded-lg text-center text-lg font-medium transition-all duration-300 
        ${currentStep === 2 ? 'bg-yellow-500 text-black' : 'bg-gray-800 text-gray-400'}`}>
        Step 2️⃣: Pick your contestant
      </div>
    </div>
  );
};

export default SpinSelector;