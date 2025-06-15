import React, { useEffect, useRef, useState } from 'react';
import WheelCanvas from './WheelCanvas';
import { useRoulette } from './useRoulette';
import { SOUNDS } from '../../constants/sounds';
import ResultBanner from './ResultBanner';
import clsx from 'clsx';
import { DIMENSIONS, THRESHOLDS, TIMING } from '../../constants/physics';
import { COLORS_EXTENDED, SHADOWS, GRADIENTS, FILTERS, OPACITY } from '../../constants/styles';
import { useWheelSize } from './responsive-utils';
import { createTouchHandlers } from './touch-handlers';
import {
  getHexagonalGridStyles,
  getScanlinesStyles,
  getWheelShadowStyles,
  getHubShadowStyles,
  getNeonGlowStyles,
} from './background-styles';
import './roulette-theme.css';

import type { ClassType } from '../../types';

interface ClassRouletteProps {
  onComplete: (selectedClass: ClassType) => void;
}

const ClassRoulette: React.FC<ClassRouletteProps> = ({ onComplete }) => {
  const { isSpinning, rotation, spin, currentClass } = useRoulette();
  const wheelSize = useWheelSize();
  const containerRef = useRef<HTMLDivElement>(null);
  const [showResult, setShowResult] = useState(false);
  const touchStartY = useRef(0);
  const lastTouchTime = useRef(0);

  // Auto-spin after 1 second
  useEffect(() => {
    const autoSpinDelay = 1000;
    const timer = setTimeout(() => {
      handleSpin();
    }, autoSpinDelay);

    return () => clearTimeout(timer);
  }, []);

  // Touch handlers for mobile swipe
  const touchHandlers = createTouchHandlers(touchStartY, lastTouchTime, isSpinning, handleSpin);

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
      <div className="absolute inset-0" style={getHexagonalGridStyles()} />

      {/* Scanlines Overlay */}
      <div className="absolute inset-0 pointer-events-none" style={getScanlinesStyles()} />

      <div className="relative" style={{ width: wheelSize, height: wheelSize }}>
        {/* Purple Neon Glow */}
        <div className="absolute inset-0 rounded-full" style={getNeonGlowStyles()} />

        {/* Wheel Container */}
        <div
          ref={containerRef}
          className="relative"
          style={{
            width: wheelSize,
            height: wheelSize,
            filter: isSpinning && rotation > THRESHOLDS.blur.rotationThreshold ? FILTERS.blur.spinning : 'none',
            transition: `filter ${FILTERS.transition.filter}`,
          }}
          onTouchStart={touchHandlers.onTouchStart}
          onTouchEnd={touchHandlers.onTouchEnd}
        >
          {/* Multiple shadows for depth */}
          <div className="absolute inset-0 rounded-full" style={getWheelShadowStyles()} />

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
              width: wheelSize * DIMENSIONS.wheel.hubSizeRatio,
              height: wheelSize * DIMENSIONS.wheel.hubSizeRatio,
              ...getHubShadowStyles(),
            }}
          >
            <img
              src="/images/finals-logo.webp"
              alt="The Finals"
              style={{
                width: `${DIMENSIONS.wheel.logoSizeRatio * 100}%`,
                height: `${DIMENSIONS.wheel.logoSizeRatio * 100}%`,
                objectFit: 'contain',
                filter: SHADOWS.wheel.logo,
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
                className="absolute top-0 left-1/2 -translate-x-1/2 w-2 h-8"
                style={{
                  opacity: OPACITY.background.dataStream,
                  background: `linear-gradient(to bottom, transparent, ${COLORS_EXTENDED.ui.dataStreamRed})`,
                  animation: 'dataStream 0.5s linear infinite',
                }}
              />
              <div
                className="absolute top-0 left-1/2 -translate-x-1/2 w-2 h-8"
                style={{
                  opacity: OPACITY.background.dataStream,
                  background: `linear-gradient(to bottom, transparent, ${COLORS_EXTENDED.ui.dataStreamPurple})`,
                  animation: 'dataStream 0.5s linear infinite 0.2s',
                }}
              />
            </>
          )}

          <svg
            className="pointer"
            viewBox="0 0 40 40"
            style={{
              width: wheelSize * DIMENSIONS.wheel.pointerSizeRatio,
              height: wheelSize * DIMENSIONS.wheel.pointerSizeRatio,
              transform: 'rotate(180deg)',
              filter: SHADOWS.wheel.pointer,
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
