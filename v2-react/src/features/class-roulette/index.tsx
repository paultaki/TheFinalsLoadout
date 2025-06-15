import React, { useEffect, useRef, useState } from 'react';
import WheelCanvas from './WheelCanvas';
import { useRoulette } from './useRoulette';
import { SOUNDS } from '../../constants/sounds';
import ResultBanner from './ResultBanner';
import clsx from 'clsx';
import './roulette-theme.css';

import type { ClassType } from '../../types';

interface ClassRouletteProps {
  onComplete: (selectedClass: ClassType) => void;
}

const ClassRoulette: React.FC<ClassRouletteProps> = ({ onComplete }) => {
  const { isSpinning, rotation, spin, currentClass } = useRoulette();
  const [wheelSize, setWheelSize] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const [showResult, setShowResult] = useState(false);
  const touchStartY = useRef(0);
  const lastTouchTime = useRef(0);

  // Calculate responsive wheel size
  useEffect(() => {
    const updateSize = () => {
      const vw = window.innerWidth;
      const size = Math.max(300, Math.min(vw * 0.6, 500));
      setWheelSize(size);
    };

    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  // Auto-spin after 1 second
  useEffect(() => {
    const timer = setTimeout(() => {
      handleSpin();
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  // Touch handlers for mobile swipe
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY;
    lastTouchTime.current = Date.now();
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const touchEndY = e.changedTouches[0].clientY;
    const deltaY = touchStartY.current - touchEndY;
    const deltaTime = Date.now() - lastTouchTime.current;
    const velocity = Math.abs(deltaY) / deltaTime;

    // Swipe up/down with sufficient velocity triggers spin
    if (Math.abs(deltaY) > 50 && velocity > 0.5 && !isSpinning) {
      handleSpin();
    }
  };

  const handleSpin = async () => {
    if (isSpinning) return;

    setShowResult(false);
    const result = await spin();

    // onComplete is called after delay in useRoulette
    onComplete(result);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-gray-900 to-black p-4 relative overflow-hidden">
      {/* Hexagonal Grid Background */}
      <div
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: `
          linear-gradient(30deg, #1a1a1a 12%, transparent 12.5%, transparent 87%, #1a1a1a 87.5%, #1a1a1a),
          linear-gradient(150deg, #1a1a1a 12%, transparent 12.5%, transparent 87%, #1a1a1a 87.5%, #1a1a1a),
          linear-gradient(30deg, #1a1a1a 12%, transparent 12.5%, transparent 87%, #1a1a1a 87.5%, #1a1a1a),
          linear-gradient(150deg, #1a1a1a 12%, transparent 12.5%, transparent 87%, #1a1a1a 87.5%, #1a1a1a),
          linear-gradient(60deg, rgba(171, 71, 188, 0.1) 25%, transparent 25.5%, transparent 75%, rgba(171, 71, 188, 0.1) 75%, rgba(171, 71, 188, 0.1)),
          linear-gradient(60deg, rgba(171, 71, 188, 0.1) 25%, transparent 25.5%, transparent 75%, rgba(171, 71, 188, 0.1) 75%, rgba(171, 71, 188, 0.1))
        `,
          backgroundSize: '80px 140px',
          backgroundPosition: '0 0, 0 0, 40px 70px, 40px 70px, 0 0, 40px 70px',
        }}
      />

      {/* Scanlines Overlay */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `repeating-linear-gradient(
          to bottom,
          transparent 0,
          transparent 2px,
          rgba(255, 255, 255, 0.03) 2px,
          rgba(255, 255, 255, 0.03) 4px
        )`,
          animation: 'scanlines 8s linear infinite',
        }}
      />

      <div className="relative" style={{ width: wheelSize, height: wheelSize }}>
        {/* Purple Neon Glow */}
        <div
          className="absolute inset-0 rounded-full"
          style={{
            boxShadow: '0 0 60px rgba(171, 71, 188, 0.6), 0 0 120px rgba(171, 71, 188, 0.4)',
            filter: 'blur(20px)',
            transform: 'scale(1.1)',
          }}
        />

        {/* Wheel Container */}
        <div
          ref={containerRef}
          className="relative"
          style={{
            width: wheelSize,
            height: wheelSize,
            filter: isSpinning && rotation > 720 ? 'blur(2px)' : 'none',
            transition: 'filter 0.3s',
          }}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          {/* Multiple shadows for depth */}
          <div
            className="absolute inset-0 rounded-full"
            style={{
              boxShadow: `
                0 0 50px rgba(0, 0, 0, 0.8),
                inset 0 0 30px rgba(0, 0, 0, 0.5),
                0 10px 40px rgba(0, 0, 0, 0.6)
              `,
            }}
          />

          {/* Canvas Wheel */}
          <WheelCanvas size={wheelSize} rotation={rotation} />

          {/* Hub with THE FINALS logo */}
          <div
            className={clsx(
              'absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2',
              'rounded-full flex items-center justify-center',
              'bg-gradient-to-br from-gray-900 to-black',
              'shadow-lg overflow-hidden',
              !isSpinning && 'animate-pulse'
            )}
            style={{
              width: wheelSize * 0.25,
              height: wheelSize * 0.25,
              boxShadow: `
                0 0 40px rgba(171, 71, 188, 0.8),
                0 0 80px rgba(171, 71, 188, 0.4),
                inset 0 0 20px rgba(171, 71, 188, 0.3)
              `,
            }}
          >
            <img
              src="/images/finals-logo.webp"
              alt="The Finals"
              style={{
                width: '70%',
                height: '70%',
                objectFit: 'contain',
                filter: 'drop-shadow(0 0 10px rgba(171, 71, 188, 0.8))',
              }}
            />
          </div>
        </div>

        {/* Pointer with data stream */}
        <div
          className="pointer-wrapper absolute top-0 left-1/2 -translate-x-1/2 z-20"
          style={{ pointerEvents: 'none' }}
        >
          {/* Data Stream Particles */}
          {isSpinning && (
            <>
              <div
                className="absolute top-0 left-1/2 -translate-x-1/2 w-2 h-8 opacity-60"
                style={{
                  background: 'linear-gradient(to bottom, transparent, #FF1744)',
                  animation: 'dataStream 0.5s linear infinite',
                }}
              />
              <div
                className="absolute top-0 left-1/2 -translate-x-1/2 w-2 h-8 opacity-60"
                style={{
                  background: 'linear-gradient(to bottom, transparent, #AB47BC)',
                  animation: 'dataStream 0.5s linear infinite 0.2s',
                }}
              />
            </>
          )}

          <svg
            className="pointer"
            viewBox="0 0 40 40"
            style={{
              width: wheelSize * 0.15,
              height: wheelSize * 0.15,
              transform: 'rotate(180deg)',
              filter: 'drop-shadow(0 0 20px rgba(255, 23, 68, 0.8))',
            }}
          >
            <defs>
              <linearGradient id="pointerGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" style={{ stopColor: '#FF1744', stopOpacity: 1 }} />
                <stop offset="100%" style={{ stopColor: '#D50000', stopOpacity: 1 }} />
              </linearGradient>
            </defs>
            <polygon
              points="20,35 0,0 40,0"
              fill="url(#pointerGradient)"
              stroke="#FF1744"
              strokeWidth="2"
            />
          </svg>
          {currentClass && <ResultBanner classType={currentClass} />}
        </div>

        {/* Result overlay */}
        {showResult && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="bg-black/80 rounded-2xl px-8 py-4 animate-bounceIn">
              <p className="text-3xl font-bold text-yellow-400">GET READY!</p>
            </div>
          </div>
        )}
      </div>

      {/* Audio elements */}
      <audio id="whooshSound" src={SOUNDS.spinning} preload="auto" />
      <audio id="tickSound" src={SOUNDS.click} preload="auto" />
      <audio id="victorySound" src={SOUNDS.chang} preload="auto" />
    </div>
  );
};

export default ClassRoulette;
