import React, { useEffect } from 'react';
import ReactDOM from 'react-dom';
import './ResultModal.module.css';

interface ResultModalProps {
  variant: 'number' | 'jackpot';
  value: string;
  spins: number;
  onSelectClass?: (cls: 'Light' | 'Medium' | 'Heavy') => void;
  onClose?: () => void;
}

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
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 9999,
      }}
    >
      {/* Modal backdrop */}
      <div
        className="absolute inset-0 bg-black/85 backdrop-blur-sm"
        style={{
          pointerEvents: 'none',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
        }}
      />

      <div
        className="relative w-full animate-fadeInScale"
        style={{
          maxWidth: 'min(420px, 90vw)',
          background: 'radial-gradient(circle at center, #222 0%, #151515 100%)',
          borderRadius: '24px',
          border: '3px solid #FFD52D',
          padding: '32px',
          animation: 'fadeInScale 250ms ease-out',
          position: 'relative',
          zIndex: 10,
        }}
      >
        {variant === 'jackpot' ? (
          <div className="flex flex-col items-center">
            {/* JACKPOT text with neon glow */}
            <h1
              className="font-['Impact'] font-bold text-center mb-3"
              style={{
                fontSize: 'clamp(60px, 18vw, 80px)',
                background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 50%, #FFD700 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                textShadow: '0 0 40px rgba(255, 215, 0, 0.8), 0 0 80px rgba(255, 165, 0, 0.6)',
                letterSpacing: '3px',
                animation: 'pulseGlow 2s ease-in-out infinite',
              }}
            >
              JACKPOT
            </h1>

            {/* Spin count with purple accent */}
            <p
              className="text-3xl font-bold text-center mb-4"
              style={{
                color: '#AB47BC',
                textShadow: '0 0 20px rgba(171, 71, 188, 0.8), 0 0 40px rgba(171, 71, 188, 0.4)',
                letterSpacing: '1px',
              }}
            >
              {spins} SPINS
            </p>

            {/* Choose your class with cyberpunk styling */}
            <h2
              className="text-xl uppercase tracking-wider text-center mb-6"
              style={{
                color: '#4FC3F7',
                textShadow: '0 0 15px rgba(79, 195, 247, 0.8)',
                fontWeight: 600,
                letterSpacing: '2px',
              }}
            >
              Choose Your Class
            </h2>

            {/* Class buttons with cyberpunk neon style */}
            <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
              <button
                onClick={() => onSelectClass?.('Light')}
                className="relative py-4 px-10 font-bold text-lg uppercase tracking-wider overflow-hidden group"
                style={{
                  background:
                    'linear-gradient(135deg, rgba(79, 195, 247, 0.1) 0%, rgba(79, 195, 247, 0.2) 100%)',
                  border: '2px solid #4FC3F7',
                  borderRadius: '8px',
                  color: '#4FC3F7',
                  boxShadow:
                    '0 0 20px rgba(79, 195, 247, 0.5), inset 0 0 20px rgba(79, 195, 247, 0.1)',
                  transition: 'all 0.3s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px) scale(1.05)';
                  e.currentTarget.style.boxShadow =
                    '0 0 30px rgba(79, 195, 247, 0.8), inset 0 0 30px rgba(79, 195, 247, 0.2)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0) scale(1)';
                  e.currentTarget.style.boxShadow =
                    '0 0 20px rgba(79, 195, 247, 0.5), inset 0 0 20px rgba(79, 195, 247, 0.1)';
                }}
              >
                LIGHT
              </button>

              <button
                onClick={() => onSelectClass?.('Medium')}
                className="relative py-4 px-10 font-bold text-lg uppercase tracking-wider overflow-hidden group"
                style={{
                  background:
                    'linear-gradient(135deg, rgba(76, 175, 80, 0.1) 0%, rgba(76, 175, 80, 0.2) 100%)',
                  border: '2px solid #4CAF50',
                  borderRadius: '8px',
                  color: '#4CAF50',
                  boxShadow:
                    '0 0 20px rgba(76, 175, 80, 0.5), inset 0 0 20px rgba(76, 175, 80, 0.1)',
                  transition: 'all 0.3s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px) scale(1.05)';
                  e.currentTarget.style.boxShadow =
                    '0 0 30px rgba(76, 175, 80, 0.8), inset 0 0 30px rgba(76, 175, 80, 0.2)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0) scale(1)';
                  e.currentTarget.style.boxShadow =
                    '0 0 20px rgba(76, 175, 80, 0.5), inset 0 0 20px rgba(76, 175, 80, 0.1)';
                }}
              >
                MEDIUM
              </button>

              <button
                onClick={() => onSelectClass?.('Heavy')}
                className="relative py-4 px-10 font-bold text-lg uppercase tracking-wider overflow-hidden group"
                style={{
                  background:
                    'linear-gradient(135deg, rgba(255, 23, 68, 0.1) 0%, rgba(255, 23, 68, 0.2) 100%)',
                  border: '2px solid #FF1744',
                  borderRadius: '8px',
                  color: '#FF1744',
                  boxShadow:
                    '0 0 20px rgba(255, 23, 68, 0.5), inset 0 0 20px rgba(255, 23, 68, 0.1)',
                  transition: 'all 0.3s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px) scale(1.05)';
                  e.currentTarget.style.boxShadow =
                    '0 0 30px rgba(255, 23, 68, 0.8), inset 0 0 30px rgba(255, 23, 68, 0.2)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0) scale(1)';
                  e.currentTarget.style.boxShadow =
                    '0 0 20px rgba(255, 23, 68, 0.5), inset 0 0 20px rgba(255, 23, 68, 0.1)';
                }}
              >
                HEAVY
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <h1
              className="font-['Impact'] font-bold text-center"
              style={{
                fontSize: 'clamp(60px, 20vw, 100px)',
                color: '#FFD700',
                textShadow: '0 0 30px rgba(255, 215, 0, 0.8), 0 0 60px rgba(255, 215, 0, 0.4)',
                letterSpacing: '2px',
              }}
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
