import React, { useEffect } from 'react';
import ReactDOM from 'react-dom';
import { ResultModalProps } from './types';
import { modalStyles, textStyles, classButtonConfigs } from './styles';
import ClassButton from './ClassButton';
import './ResultModal.module.css';

/**
 * Modal component that displays spin results or jackpot class selection
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
      const timer = setTimeout(onClose, 1200);
      return () => clearTimeout(timer);
    }
  }, [variant, onClose]);

  return ReactDOM.createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={modalStyles.backdrop}
    >
      {/* Modal backdrop */}
      <div
        className="absolute inset-0 bg-black/85 backdrop-blur-sm"
        style={modalStyles.backdropOverlay}
      />

      <div
        className="relative w-full animate-fadeInScale"
        style={modalStyles.modalContainer}
      >
        {variant === 'jackpot' ? (
          <div className="flex flex-col items-center">
            {/* JACKPOT text with neon glow */}
            <h1
              className="font-['Impact'] font-bold text-center mb-3"
              style={textStyles.jackpotTitle}
            >
              JACKPOT
            </h1>

            {/* Spin count with purple accent */}
            <p
              className="text-3xl font-bold text-center mb-4"
              style={textStyles.spinCount}
            >
              {spins} SPINS
            </p>

            {/* Choose your class with cyberpunk styling */}
            <h2
              className="text-xl uppercase tracking-wider text-center mb-6"
              style={textStyles.classChoiceHeader}
            >
              Choose Your Class
            </h2>

            {/* Class buttons with cyberpunk neon style */}
            <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
              {classButtonConfigs.map((config) => (
                <ClassButton
                  key={config.class}
                  config={config}
                  onClick={() => onSelectClass?.(config.class)}
                />
              ))}
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <h1
              className="font-['Impact'] font-bold text-center"
              style={textStyles.numberTitle}
            >
              {value}
            </h1>
            <p className="text-2xl text-center mt-2" style={{ color: '#FFD700' }}>
              {spins} {spins === 1 ? 'SPIN' : 'SPINS'}!
            </p>
          </div>
        )}
      </div>
    </div>,
    document.body
  );
};

export default ResultModal;
