import React, { useEffect } from 'react';
import type { ClassType } from '../../../types';

interface ResultModalProps {
  variant: 'number' | 'jackpot';
  value: string;
  spins: number;
  onSelectClass?: (cls: ClassType) => void;
  onClose?: () => void;
}

/**
 * Modal component for displaying spin results
 * Shows either spin count or jackpot class selection
 */
const ResultModal: React.FC<ResultModalProps> = ({
  variant,
  value,
  spins,
  onSelectClass,
  onClose,
}) => {
  // Auto-dismiss for number results
  useEffect(() => {
    if (variant === 'number' && onClose) {
      const timer = setTimeout(onClose, 1000);
      return () => clearTimeout(timer);
    }
  }, [variant, onClose]);

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-gradient-to-b from-gray-900 to-black rounded-3xl p-8 max-w-md w-full animate-bounceIn">
        {variant === 'jackpot' ? (
          <>
            <h1 className="text-6xl font-['Impact'] font-bold text-center mb-2 text-yellow-400">
              JACKPOT
            </h1>
            <p
              className="text-2xl text-center mb-2 text-white uppercase tracking-wider"
              style={{ fontSize: '1.125rem', letterSpacing: '0.1em' }}
            >
              Choose Your Class
            </p>
            <p className="text-3xl text-center mb-6 text-yellow-400 font-bold">{spins} Spins</p>

            <div className="flex gap-6 justify-center">
              <button
                onClick={() => {
                  onSelectClass?.('Light');
                  onClose?.();
                }}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-blue-400 to-blue-600 hover:from-blue-500 hover:to-blue-700 transform hover:scale-105 transition-all font-bold text-lg"
              >
                Light
              </button>
              <button
                onClick={() => {
                  onSelectClass?.('Medium');
                  onClose?.();
                }}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-green-400 to-green-600 hover:from-green-500 hover:to-green-700 transform hover:scale-105 transition-all font-bold text-lg"
              >
                Medium
              </button>
              <button
                onClick={() => {
                  onSelectClass?.('Heavy');
                  onClose?.();
                }}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-red-400 to-red-600 hover:from-red-500 hover:to-red-700 transform hover:scale-105 transition-all font-bold text-lg"
              >
                Heavy
              </button>
            </div>
          </>
        ) : (
          <>
            <h2 className="text-7xl font-['Impact'] font-bold text-center mb-4 text-yellow-400">
              {value}
            </h2>
            <p className="text-2xl text-center text-white">{spins === 1 ? 'SPIN' : 'SPINS'}!</p>
          </>
        )}
      </div>
    </div>
  );
};

export default ResultModal;
