import React from 'react';
import { useGameDispatch } from '../hooks/useGameState';
// import './StartOverButton.css'; // Commented out to avoid conflicts

/**
 * Button component that reloads the page to start a new game session
 */
const StartOverButton: React.FC = () => {
  const { hideAnalysis } = useGameDispatch();
  
  const handleStartOver = () => {
    hideAnalysis();
    window.location.reload();
  };

  // Uncomment ONE of these three options:

  // OPTION 1: Subtle Enhancement - Dark with gradient border
  /* return (
    <div className="flex justify-center py-6">
      <button
        onClick={handleStartOver}
        className="relative px-6 py-3 font-bold text-white uppercase tracking-wider
                   bg-gray-800/90 backdrop-blur-sm rounded-lg
                   hover:bg-gray-700/90 hover:scale-105
                   transition-all duration-300
                   ring-2 ring-purple-500/50 hover:ring-purple-400
                   shadow-lg shadow-purple-500/20 hover:shadow-purple-500/40"
        aria-label="Reset and begin a new roll"
      >
        Start Over
      </button>
    </div>
  ); */

  // OPTION 2: Bold Redesign - Vibrant gradient with animations
  return (
    <>
      <style>{`
        @keyframes startOverPulse {
          0%, 100% {
            opacity: 1;
            transform: scale(1);
          }
          50% {
            opacity: 0.9;
            transform: scale(1.05);
          }
        }
      `}</style>
      <div className="flex justify-center py-6">
        <button
        onClick={handleStartOver}
        className="relative overflow-hidden rounded-xl transition-all duration-500 hover:scale-110 font-black uppercase tracking-widest"
        style={{
          padding: '16px 32px',
          fontSize: '18px',
          background: 'linear-gradient(to right, #9333ea, #ec4899, #9333ea)',
          backgroundSize: '200% 100%',
          backgroundPosition: '0% 50%',
          color: 'white',
          border: '2px solid rgba(236, 72, 153, 0.5)',
          boxShadow: '0 10px 25px rgba(236, 72, 153, 0.5)',
          textShadow: '0 0 20px rgba(255,255,255,0.5), 0 0 40px rgba(255,20,147,0.8)',
          animation: 'startOverPulse 2s ease-in-out infinite',
          cursor: 'pointer'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundPosition = '100% 50%';
          e.currentTarget.style.boxShadow = '0 20px 40px rgba(236, 72, 153, 0.8)';
          e.currentTarget.style.borderColor = 'rgba(236, 72, 153, 1)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundPosition = '0% 50%';
          e.currentTarget.style.boxShadow = '0 10px 25px rgba(236, 72, 153, 0.5)';
          e.currentTarget.style.borderColor = 'rgba(236, 72, 153, 0.5)';
        }}
        aria-label="Reset and begin a new roll"
      >
        Start Over
      </button>
    </div>
    </>
  );

  // OPTION 3: Middle Ground - Teal/purple gradient
  /* return (
    <div className="flex justify-center py-6">
      <button
        onClick={handleStartOver}
        className="relative px-6 py-3 font-bold text-white uppercase tracking-wide
                   bg-gradient-to-br from-teal-500 to-purple-600 rounded-lg
                   transition-all duration-300 transform
                   hover:scale-105 hover:shadow-xl hover:from-teal-400 hover:to-purple-500
                   shadow-md shadow-teal-500/30
                   ring-2 ring-teal-400/50 hover:ring-teal-400"
        aria-label="Reset and begin a new roll"
      >
        Start Over
      </button>
    </div>
  ); */
};

export default StartOverButton;