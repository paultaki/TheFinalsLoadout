import React, { useEffect, useRef, useState } from 'react';
import WheelCanvas from './WheelCanvas';
import { useRoulette } from './useRoulette';
import { SOUNDS } from '../../constants/sounds';
import ResultBanner from './ResultBanner';
import clsx from 'clsx';
import { DIMENSIONS, THRESHOLDS, TIMING } from '../../constants/physics';
import { COLORS_EXTENDED, SHADOWS, GRADIENTS, FILTERS, OPACITY } from '../../constants/styles';
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
      const size = Math.max(DIMENSIONS.responsive.minWheelSize, Math.min(vw * DIMENSIONS.responsive.maxWheelSizeRatio, DIMENSIONS.responsive.maxWheelSize));
      setWheelSize(size);
    };

    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  // Auto-spin after 1 second
  useEffect(() => {
    const autoSpinDelay = 1000;
    const timer = setTimeout(() => {
      handleSpin();
    }, autoSpinDelay);

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
    if (Math.abs(deltaY) > THRESHOLDS.swipe.minDistance && velocity > THRESHOLDS.swipe.minVelocity && !isSpinning) {
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
        className="absolute inset-0"
        style={{
          opacity: OPACITY.background.hexGrid,
          backgroundImage: GRADIENTS.hexagonalGrid.angles.map((angle, i) => {
            const color = i < 4 ? COLORS_EXTENDED.metallic.rim.outer : 'rgba(171, 71, 188, 0.1)';
            const percent = GRADIENTS.hexagonalGrid.percentages;
            if (i < 4) {
              return `linear-gradient(${angle}deg, ${color} ${percent.start}%, transparent ${percent.start + percent.gap}%, transparent ${percent.end}%, ${color} ${percent.end + percent.gap}%, ${color})`;
            } else {
              return `linear-gradient(${angle}deg, ${color} ${percent.accent}%, transparent ${percent.accent + percent.accentGap}%, transparent ${percent.accentEnd}%, ${color} ${percent.accentEnd}%, ${color})`;
            }
          }).join(', '),
          backgroundSize: GRADIENTS.hexagonalGrid.size,
          backgroundPosition: GRADIENTS.hexagonalGrid.positions,
        }}
      />

      {/* Scanlines Overlay */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `repeating-linear-gradient(
          to bottom,
          transparent 0,
          transparent ${GRADIENTS.scanlines.size},
          ${COLORS_EXTENDED.ui.scanlines} ${GRADIENTS.scanlines.size},
          ${COLORS_EXTENDED.ui.scanlines} ${parseInt(GRADIENTS.scanlines.size) * 2}px
        )`,
          animation: `scanlines ${GRADIENTS.scanlines.duration} linear infinite`,
        }}
      />

      <div className="relative" style={{ width: wheelSize, height: wheelSize }}>
        {/* Purple Neon Glow */}
        <div
          className="absolute inset-0 rounded-full"
          style={{
            boxShadow: `${SHADOWS.wheel.neonGlow.small}, ${SHADOWS.wheel.neonGlow.large}`,
            filter: FILTERS.blur.glow,
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
            filter: isSpinning && rotation > THRESHOLDS.blur.rotationThreshold ? FILTERS.blur.spinning : 'none',
            transition: `filter ${FILTERS.transition.filter}`,
          }}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          {/* Multiple shadows for depth */}
          <div
            className="absolute inset-0 rounded-full"
            style={{
              boxShadow: `
                ${SHADOWS.wheel.depth.outer},
                ${SHADOWS.wheel.depth.inset},
                ${SHADOWS.wheel.depth.drop}
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
              width: wheelSize * DIMENSIONS.wheel.hubSizeRatio,
              height: wheelSize * DIMENSIONS.wheel.hubSizeRatio,
              boxShadow: `
                ${SHADOWS.wheel.hub.primary},
                ${SHADOWS.wheel.hub.secondary},
                ${SHADOWS.wheel.hub.inset}
              `,
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
