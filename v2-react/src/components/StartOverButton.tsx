import React from 'react';
import './StartOverButton.css';

/**
 * Button component that reloads the page to start a new game session
 */
const StartOverButton: React.FC = () => {
  const handleStartOver = () => {
    window.location.reload();
  };

  return (
    <div className="flex justify-center py-12">
      <div className="relative group start-over-container">
        {/* Particle background */}
        <div className="particle-bg" />
        
        {/* Animated background glow */}
        <div className="absolute -inset-3 bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 rounded-2xl blur-xl start-over-glow" />
        
        {/* Rotating gradient border */}
        <div 
          className="absolute -inset-1 bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 rounded-2xl opacity-80 group-hover:opacity-100"
          style={{
            background: 'conic-gradient(from 0deg, #FFD700, #FF8C00, #FF4500, #FFD700)',
            animation: 'spin 8s linear infinite'
          }}
        />
        
        {/* Main button */}
        <button
          onClick={handleStartOver}
          className="relative px-16 py-8 bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-black font-black text-3xl rounded-2xl transform hover:scale-110 transition-all duration-300 shadow-2xl hover:shadow-yellow-500/50 uppercase tracking-wider overflow-hidden"
          style={{
            boxShadow: '0 10px 40px rgba(255, 215, 0, 0.6), inset 0 2px 4px rgba(255, 255, 255, 0.5), 0 0 80px rgba(255, 140, 0, 0.3)',
            textShadow: '0 2px 4px rgba(0, 0, 0, 0.3), 0 0 20px rgba(255, 255, 255, 0.5)'
          }}
        >
          {/* Shimmer overlay */}
          <div className="absolute inset-0 start-over-shimmer" />
          
          <span className="relative flex items-center gap-4 justify-center">
            <svg className="w-8 h-8 animate-spin" style={{ animationDuration: '3s' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span className="neon-text-gold">Start Over</span>
          </span>
        </button>
      </div>
    </div>
  );
};

export default StartOverButton;