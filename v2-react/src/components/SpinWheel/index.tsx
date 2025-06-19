import React, { useState, useRef, useEffect } from 'react';
import { playSound } from '../../utils/audio';

interface SpinWheelProps {
  onComplete: (result: { value: string; spins: number; isJackpot: boolean }) => void;
}

const WHEEL_VALUES = ['1', '2', '3', '4', '5', 'JACKPOT'];
const WHEEL_HEIGHT = 80; // Height of each segment in pixels

const SpinWheel: React.FC<SpinWheelProps> = ({ onComplete }) => {
  const [isSpinning, setIsSpinning] = useState(false);
  const [currentPosition, setCurrentPosition] = useState(0);
  const wheelRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number>();

  const spin = () => {
    if (isSpinning) return;

    setIsSpinning(true);
    playSound('tick');

    // Random result
    const resultIndex = Math.floor(Math.random() * WHEEL_VALUES.length);
    const result = WHEEL_VALUES[resultIndex];
    const isJackpot = result === 'JACKPOT';
    const spins = isJackpot ? 0 : parseInt(result);

    // Animation parameters
    const totalRotations = 3 + Math.random() * 2; // 3-5 full rotations
    const totalDistance = (totalRotations * WHEEL_VALUES.length + resultIndex) * WHEEL_HEIGHT;
    const duration = 3000 + Math.random() * 1000; // 3-4 seconds
    const startTime = performance.now();
    const startPosition = currentPosition;

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Ease out cubic
      const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);
      const easedProgress = easeOutCubic(progress);

      const newPosition = startPosition + (totalDistance * easedProgress);
      setCurrentPosition(newPosition % (WHEEL_VALUES.length * WHEEL_HEIGHT));

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      } else {
        setIsSpinning(false);
        playSound(isJackpot ? 'ding-ding' : 'ding');
        
        setTimeout(() => {
          onComplete({ value: result, spins, isJackpot });
        }, 500);
      }
    };

    animationRef.current = requestAnimationFrame(animate);
  };

  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  return (
    <div className="spin-wheel-component max-w-md mx-auto">
      <div className="bg-gray-900/90 backdrop-blur-sm rounded-xl p-6 border border-purple-500/30">
        <h2 className="text-2xl font-bold text-center mb-6 text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-cyan-500">
          SPIN COUNT SELECTOR
        </h2>

        {/* Wheel container */}
        <div className="relative h-64 overflow-hidden rounded-lg bg-black/50 border-2 border-purple-500/50">
          {/* Wheel segments */}
          <div 
            ref={wheelRef}
            className="absolute inset-x-0 transition-transform"
            style={{
              transform: `translateY(-${currentPosition}px)`,
              transition: isSpinning ? 'none' : 'transform 0.3s ease-out'
            }}
          >
            {/* Duplicate wheel values for seamless scrolling */}
            {[...WHEEL_VALUES, ...WHEEL_VALUES, ...WHEEL_VALUES].map((value, index) => (
              <div
                key={index}
                className={`h-20 flex items-center justify-center text-2xl font-bold
                  ${value === 'JACKPOT' 
                    ? 'bg-gradient-to-r from-yellow-600 to-orange-600 text-white' 
                    : 'bg-gradient-to-r from-purple-800 to-purple-900 text-purple-200'
                  }
                  ${index % 2 === 0 ? 'opacity-90' : 'opacity-100'}
                `}
              >
                {value === 'JACKPOT' ? (
                  <span className="flex items-center gap-2">
                    <span className="text-3xl">🎰</span>
                    JACKPOT
                    <span className="text-3xl">🎰</span>
                  </span>
                ) : (
                  <span className="flex items-center gap-3">
                    <span className="text-4xl">{value}</span>
                    <span className="text-sm text-white/60">SPINS</span>
                  </span>
                )}
              </div>
            ))}
          </div>

          {/* Center indicator */}
          <div className="absolute inset-x-0 top-1/2 transform -translate-y-1/2 pointer-events-none">
            <div className="h-1 bg-gradient-to-r from-transparent via-cyan-500 to-transparent" />
            <div className="absolute inset-x-0 -inset-y-2 border-2 border-cyan-500/50 rounded-lg" />
          </div>

          {/* Side gradients */}
          <div className="absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-black/80 to-transparent pointer-events-none" />
          <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/80 to-transparent pointer-events-none" />
        </div>

        {/* Spin button */}
        <button
          onClick={spin}
          disabled={isSpinning}
          className={`mt-6 w-full py-4 font-bold text-lg rounded-lg transform transition-all
            ${isSpinning 
              ? 'bg-gray-700 text-gray-400 cursor-not-allowed scale-95' 
              : 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700 hover:scale-105 shadow-lg shadow-purple-500/50'
            }
          `}
        >
          {isSpinning ? 'SPINNING...' : 'SPIN THE WHEEL'}
        </button>

        {/* Instructions */}
        <p className="text-center text-sm text-gray-400 mt-4">
          Spin to determine how many times the slot machine will run!
        </p>
      </div>
    </div>
  );
};

export default SpinWheel;