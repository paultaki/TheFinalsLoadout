import React, { useEffect } from 'react';
import { SlotMachineProps } from './types';
import { useSlotMachine } from './useSlotMachine';
import './SlotMachine.css';

const SlotMachine: React.FC<SlotMachineProps> = ({ 
  className, 
  spinCount, 
  onComplete,
  autoSpin = true 
}) => {
  const { columns, isSpinning, currentSpin, startSpin, setColumnRef, isFinalSpin } = useSlotMachine(
    className,
    spinCount,
    onComplete
  );

  useEffect(() => {
    if (autoSpin && columns.length > 0) {
      // Start spinning after a short delay
      const timer = setTimeout(() => {
        startSpin();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [autoSpin, columns.length, startSpin]);

  // For loading state - show placeholder slots
  const renderPlaceholderSlot = (type: string, label: string) => (
    <div className="relative">
      <div className="text-xs text-center text-gray-400 mb-1 md:mb-2 uppercase tracking-wider truncate">
        {label}
      </div>
      {/* Fixed height container with overflow-hidden to prevent scrollbars */}
      <div className="relative h-32 overflow-hidden rounded-lg bg-black/50 border border-purple-500/30">
        <div className="slot-cell placeholder h-full flex items-center justify-center">
          <div className="text-center">
            <span className="text-2xl md:text-4xl text-gray-600">?</span>
            <p className="text-xs md:text-sm text-gray-500 mt-2">{label.toUpperCase()}</p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="slot-machine-component relative w-full max-w-4xl mx-auto overflow-hidden">
      {/* Neon glow background - positioned absolute to not affect layout */}
      <div className="absolute inset-0 bg-gradient-to-b from-purple-900/20 to-blue-900/20 blur-xl pointer-events-none" />
      
      {/* Main container - removed padding that might cause overflow */}
      <div className="relative bg-gray-900/90 backdrop-blur-sm rounded-xl p-4 md:p-6 border border-purple-500/30 overflow-hidden">

        {/* Slot columns - reduced gap on mobile to prevent horizontal overflow */}
        <div className="slot-machine-items grid grid-cols-5 gap-1 sm:gap-2 md:gap-4 overflow-hidden" style={{ display: 'grid' }}>
          {columns.length === 0 ? (
            // Show placeholders while loading
            <>
              {renderPlaceholderSlot('weapon', 'Weapon')}
              {renderPlaceholderSlot('spec', 'Specialization')}
              {renderPlaceholderSlot('gadget-1', 'Gadget 1')}
              {renderPlaceholderSlot('gadget-2', 'Gadget 2')}
              {renderPlaceholderSlot('gadget-3', 'Gadget 3')}
            </>
          ) : (
            // Render actual slots
            ['Weapon', 'Spec', 'Gadget 1', 'Gadget 2', 'Gadget 3'].map((label, colIndex) => (
              <div key={colIndex} className="relative overflow-hidden" data-slot-type={colIndex === 0 ? 'weapon' : colIndex === 1 ? 'spec' : `gadget-${colIndex - 1}`}>
                {/* Column label - reduced margin on mobile */}
                <div className="text-xs text-center text-gray-400 mb-1 md:mb-2 uppercase tracking-wider truncate">
                  {label}
                </div>

                {/* Slot window - the slot-item class is applied here for proper styling */}
                <div className="slot-item relative h-32 overflow-hidden rounded-lg bg-black/50 border border-purple-500/30">
                  {/* Slot scroll container - no changes needed here */}
                  <div 
                    ref={setColumnRef(colIndex)}
                    className="slot-scroll absolute w-full"
                    style={{ transform: 'translateY(-50%)' }}
                  >
                    {/* Content will be dynamically inserted by the animation system */}
                    <div className="slot-cell placeholder h-32 flex items-center justify-center">
                      <div className="text-center">
                        <span className="text-2xl md:text-4xl text-gray-600">?</span>
                        <p className="text-xs md:text-sm text-gray-500 mt-2">{label.toUpperCase()}</p>
                      </div>
                    </div>
                  </div>

                  {/* Center highlight */}
                  <div className="absolute inset-x-0 top-1/2 h-px bg-gradient-to-r from-transparent via-cyan-500 to-transparent transform -translate-y-1/2 pointer-events-none" />
                </div>
              </div>
            ))
          )}
        </div>

        {/* Control buttons */}
        {!autoSpin && !isSpinning && currentSpin === 0 && (
          <div className="mt-4 md:mt-6 text-center">
            <button
              onClick={startSpin}
              className="px-6 md:px-8 py-2 md:py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-lg 
                         hover:from-purple-700 hover:to-pink-700 transform hover:scale-105 transition-all
                         shadow-lg shadow-purple-500/50 text-sm md:text-base"
            >
              SPIN THE SLOTS
            </button>
          </div>
        )}

        {/* Final spin indicator */}
        {isFinalSpin && !isSpinning && currentSpin === spinCount - 1 && (
          <div className="absolute -top-2 -right-2 bg-gradient-to-r from-yellow-500 to-orange-500 text-black font-bold px-3 py-1 rounded-full text-xs animate-pulse">
            FINAL SPIN!
          </div>
        )}
      </div>
    </div>
  );
};

export default SlotMachine;