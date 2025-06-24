import React, { useState, useRef, useEffect } from 'react';
import { playSound } from '../../utils/audio';

interface ClassRouletteProps {
  onComplete: (selectedClass: 'Light' | 'Medium' | 'Heavy') => void;
  spinCount: number;
  autoSpin?: boolean;
}

const CLASSES = [
  { name: 'Light', color: 'from-cyan-400 to-blue-500', icon: '⚡' },
  { name: 'Medium', color: 'from-green-400 to-emerald-500', icon: '🛡️' },
  { name: 'Heavy', color: 'from-orange-400 to-red-500', icon: '💪' }
] as const;

const ClassRoulette: React.FC<ClassRouletteProps> = ({ onComplete, spinCount, autoSpin = true }) => {
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const animationRef = useRef<number>();

  const spin = () => {
    if (isSpinning) return;

    setIsSpinning(true);
    setSelectedIndex(null);
    playSound('tick');

    // Random result
    const resultIndex = Math.floor(Math.random() * CLASSES.length);
    const baseRotations = spinCount * 2; // More rotations based on spin count
    const additionalRotations = 2 + Math.random() * 2; // 2-4 extra rotations
    const totalRotations = baseRotations + additionalRotations;
    
    // Calculate final rotation to land on the selected class
    const segmentAngle = 360 / CLASSES.length;
    const targetRotation = totalRotations * 360 + (resultIndex * segmentAngle);
    
    const duration = 2000 + (spinCount * 500); // Longer spin for higher spin counts
    const startTime = performance.now();
    const startRotation = rotation;

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Ease out quart for smooth deceleration
      const easeOutQuart = (t: number) => 1 - Math.pow(1 - t, 4);
      const easedProgress = easeOutQuart(progress);

      const newRotation = startRotation + (targetRotation * easedProgress);
      setRotation(newRotation);

      // Play tick sounds based on rotation speed
      const rotationSpeed = (targetRotation * (1 - progress * 0.9)) / duration;
      if (Math.floor(newRotation / 30) !== Math.floor(rotation / 30) && rotationSpeed > 0.5) {
        playSound('tick');
      }

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      } else {
        setIsSpinning(false);
        setSelectedIndex(resultIndex);
        playSound('ding');
        
        setTimeout(() => {
          onComplete(CLASSES[resultIndex].name as 'Light' | 'Medium' | 'Heavy');
        }, 1000);
      }
    };

    animationRef.current = requestAnimationFrame(animate);
  };

  useEffect(() => {
    if (autoSpin) {
      const timer = setTimeout(() => {
        spin();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [autoSpin]);

  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  return (
    <div className="class-roulette-component max-w-md mx-auto">
      <div className="bg-gray-900/90 backdrop-blur-sm rounded-xl p-6 border border-purple-500/30">
        <h2 className="text-2xl font-bold text-center mb-6 text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-cyan-500">
          CLASS SELECTION
        </h2>

        {/* Roulette wheel */}
        <div className="relative w-64 h-64 mx-auto mb-6">
          {/* Outer ring */}
          <div className="absolute inset-0 rounded-full border-4 border-purple-500/30 bg-black/50" />
          
          {/* Spinning wheel */}
          <div 
            className="absolute inset-2 rounded-full overflow-hidden"
            style={{
              transform: `rotate(${rotation}deg)`,
              transition: isSpinning ? 'none' : 'transform 0.5s ease-out'
            }}
          >
            {CLASSES.map((cls, index) => {
              const angle = (360 / CLASSES.length) * index;
              return (
                <div
                  key={cls.name}
                  className={`absolute inset-0 bg-gradient-to-br ${cls.color} ${
                    selectedIndex === index ? 'animate-pulse' : ''
                  }`}
                  style={{
                    clipPath: `polygon(50% 50%, ${
                      50 + 50 * Math.cos((angle - 60) * Math.PI / 180)
                    }% ${
                      50 + 50 * Math.sin((angle - 60) * Math.PI / 180)
                    }%, ${
                      50 + 50 * Math.cos((angle + 60) * Math.PI / 180)
                    }% ${
                      50 + 50 * Math.sin((angle + 60) * Math.PI / 180)
                    }%)`,
                    transform: `rotate(${angle}deg)`
                  }}
                >
                  <div 
                    className="absolute top-8 left-1/2 transform -translate-x-1/2 text-white"
                    style={{ transform: `translateX(-50%) rotate(${-angle - rotation}deg)` }}
                  >
                    <div className="text-3xl mb-1">{cls.icon}</div>
                    <div className="text-sm font-bold">{cls.name}</div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Center button */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-12 h-12 rounded-full bg-gray-800 border-2 border-purple-500 shadow-lg shadow-purple-500/50" />
          </div>

          {/* Pointer */}
          <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-2">
            <div className="w-0 h-0 border-l-[15px] border-l-transparent border-r-[15px] border-r-transparent border-b-[30px] border-b-cyan-500 drop-shadow-lg" />
          </div>
        </div>

        {/* Result display */}
        {selectedIndex !== null && (
          <div className={`text-center p-4 rounded-lg bg-gradient-to-r ${CLASSES[selectedIndex].color} text-white font-bold text-xl animate-pulse`}>
            {CLASSES[selectedIndex].icon} {CLASSES[selectedIndex].name.toUpperCase()} CLASS SELECTED!
          </div>
        )}

        {/* Manual spin button (if not auto-spinning) */}
        {!autoSpin && !isSpinning && selectedIndex === null && (
          <button
            onClick={spin}
            className="w-full py-4 font-bold text-lg rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 
                     text-white hover:from-purple-700 hover:to-pink-700 transform hover:scale-105 
                     transition-all shadow-lg shadow-purple-500/50"
          >
            SPIN FOR CLASS
          </button>
        )}

        {/* Spin counter */}
        <p className="text-center text-sm text-gray-400 mt-4">
          {spinCount > 1 ? `${spinCount} spins earned!` : `${spinCount} spin earned!`}
        </p>
      </div>
    </div>
  );
};

export default ClassRoulette;