import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom';
import type { ResultModalProps } from './types';
import { modalStyles, textStyles, classButtonConfigs } from './styles';
import ClassButton from './ClassButton';
import styles from './ResultModal.module.css';

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
  const [isReady, setIsReady] = useState(false);

  // Ensure DOM is ready before rendering
  useEffect(() => {
    const timer = setTimeout(() => setIsReady(true), 10);
    return () => clearTimeout(timer);
  }, []);

  // Auto-dismiss for number and class results
  useEffect(() => {
    if ((variant === 'number' || variant === 'class') && onClose) {
      const timer = setTimeout(onClose, 2500); // Increased from 1200ms to 2500ms
      return () => clearTimeout(timer);
    }
  }, [variant, onClose]);

  // Handle ESC key for jackpot modal
  useEffect(() => {
    if (variant === 'jackpot') {
      const handleEsc = (e: KeyboardEvent) => {
        if (e.key === 'Escape' && onClose) {
          onClose();
        }
      };
      document.addEventListener('keydown', handleEsc);
      return () => document.removeEventListener('keydown', handleEsc);
    }
  }, [variant, onClose]);

  // Ensure we have a valid portal target and DOM is ready
  if (typeof document === 'undefined' || !document.body || !isReady) {
    return null;
  }

  return ReactDOM.createPortal(
    <div 
      className="fixed inset-0 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby={variant === 'jackpot' ? 'jackpot-title' : 'result-title'}
      style={{ 
        pointerEvents: 'auto',
        zIndex: 999999
      }}
    >
      {/* Modal backdrop */}
      <div
        className="absolute inset-0"
        style={{ 
          backgroundColor: 'rgba(0, 0, 0, 0.7)', 
          backdropFilter: 'blur(4px)',
          pointerEvents: 'auto'
        }}
        onClick={variant === 'jackpot' ? undefined : onClose}
        aria-hidden="true"
      />

      <div
        className={`relative w-full ${styles['animate-fadeInScale']}`}
        style={{
          maxWidth: 'min(360px, 85vw)',
          background: 'radial-gradient(circle at center, #222 0%, #151515 100%)',
          borderRadius: '20px',
          border: '3px solid #FFD52D',
          padding: '24px',
          position: 'relative',
          zIndex: 10,
          boxShadow: '0 0 50px rgba(255, 215, 0, 0.3), 0 10px 40px rgba(0, 0, 0, 0.8)'
        }}
      >
        {variant === 'jackpot' ? (
          <div className="flex flex-col items-center">
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-2 right-2 w-8 h-8 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-colors"
              aria-label="Close modal"
            >
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            {/* JACKPOT text with neon glow */}
            <h1
              id="jackpot-title"
              className="font-['Impact'] font-bold text-center mb-2"
              style={textStyles.jackpotTitle}
            >
              JACKPOT
            </h1>

            {/* Spin count with purple accent */}
            <p
              className="font-bold text-center mb-3"
              style={textStyles.spinCount}
            >
              {spins} SPINS
            </p>

            {/* Choose your class with cyberpunk styling */}
            <h2
              className="text-lg uppercase tracking-wider text-center mb-4"
              style={textStyles.classChoiceHeader}
            >
              Choose Your Class
            </h2>

            {/* Class buttons with cyberpunk neon style */}
            <div className="flex flex-col sm:flex-row gap-4 sm:gap-8 w-full sm:w-auto">
              {classButtonConfigs.map((config) => (
                <ClassButton
                  key={config.class}
                  config={config}
                  onClick={() => onSelectClass?.(config.class)}
                />
              ))}
            </div>
          </div>
        ) : variant === 'class' ? (
          <div className="flex flex-col items-center">
            <h1
              className="font-['Impact'] font-bold text-center"
              style={textStyles.numberTitle}
            >
              {value.toUpperCase()}
            </h1>
            <p className="text-2xl text-center mt-2" style={{ color: '#FFD700' }}>
              CLASS SELECTED!
            </p>
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
    document.getElementById('portal-root') || document.body
  );
};

export default ResultModal;
