import { useState, useRef, useCallback } from 'react';
import { playSound } from '../../utils/sound';
import { ANIMATION_CONSTANTS } from '../../constants/animation';
import { SLICE_DEG, POINTER_OFFSET, WHEEL_PATTERN } from '../../constants/roulette';
import { PHYSICS, TIMING, THRESHOLDS, NUMBERS } from '../../constants/physics';
import { getClassAtRotation } from './utils';
import type { ClassType } from '../../types';

interface RouletteState {
  isSpinning: boolean;
  rotation: number;
  currentClass: ClassType | null;
}

const { classRoulette } = ANIMATION_CONSTANTS;

/**
 * Hook for managing roulette wheel state and spin animations
 */
export const useRoulette = () => {
  const [state, setState] = useState<RouletteState>({
    isSpinning: false,
    rotation: 0,
    currentClass: null,
  });

  const animationRef = useRef<{ rotation: number } | null>(null);
  const gsapTimelineRef = useRef<gsap.core.Tween | null>(null);

  const spin = useCallback(
    (forcedResult?: ClassType): Promise<ClassType> => {
      return new Promise((resolve) => {
        if (state.isSpinning) return;

        setState((prev) => ({ ...prev, isSpinning: true }));

        // Calculate target
        let targetIndex: number;
        if (forcedResult) {
          // Find the nearest segment of the forced class
          const possibleIndices = WHEEL_PATTERN.map((c, i) => (c === forcedResult ? i : -1)).filter(
            (i) => i !== -1
          );
          targetIndex = possibleIndices[Math.floor(Math.random() * possibleIndices.length)];
        } else {
          targetIndex = Math.floor(Math.random() * NUMBERS.segments);
        }

        const targetClass = WHEEL_PATTERN[targetIndex];

        // Calculate final rotation
        // We need to rotate so that when rotation is applied, the target segment aligns with the pointer
        // Since pointer is at +90°, we need: (rotation + 90) % 360 = targetIndex * 30
        // Therefore: rotation = (targetIndex * 30 - 90 + 360) % 360
        const targetRotation = (targetIndex * SLICE_DEG - POINTER_OFFSET + NUMBERS.fullCircle) % NUMBERS.fullCircle;

        // Add multiple full spins
        const spins = TIMING.wheel.spins.min + Math.random() * (TIMING.wheel.spins.max - TIMING.wheel.spins.min);
        const finalRotation = spins * NUMBERS.fullCircle + targetRotation;

        // Play whoosh sound
        playSound('spinning');

        // GSAP animation
        if (typeof window.gsap !== 'undefined') {
          const gsap = window.gsap;

          // Kill any existing timeline
          if (gsapTimelineRef.current) {
            gsapTimelineRef.current.kill();
          }

          // Create dummy object for GSAP to animate
          animationRef.current = { rotation: 0 };

          let lastTickIndex = -1;

          // Single smooth animation
          gsap.fromTo(
            animationRef.current,
            { rotation: 0 },
            {
              rotation: finalRotation,
              duration: TIMING.wheel.duration,
              ease: 'power4.out',
              onUpdate: () => {
                const currentRotation = animationRef.current.rotation;
                setState((prev) => ({ ...prev, rotation: currentRotation }));

                // Tick sounds
                const tickIndex = Math.floor(currentRotation / SLICE_DEG);
                if (tickIndex !== lastTickIndex) {
                  lastTickIndex = tickIndex;
                  const speed = gsap.getProperty(animationRef.current, 'rotation') / TIMING.wheel.duration; // rough speed
                  if (speed > THRESHOLDS.audio.volume.speedDivisor / 10) {
                    playSound('tick', {
                      volume: Math.min(THRESHOLDS.audio.volume.max, speed / THRESHOLDS.audio.volume.speedDivisor),
                      playbackRate: Math.min(THRESHOLDS.audio.playbackRate.max, speed / THRESHOLDS.audio.playbackRate.speedDivisor),
                    });
                  }
                }
              },
              onComplete: () => {
                // Verify the final class matches what we expected
                const actualClass = getClassAtRotation(finalRotation);

                setState((prev) => ({
                  ...prev,
                  isSpinning: false,
                  currentClass: actualClass,
                  rotation: finalRotation,
                }));

                // Play victory sound
                playSound('chang');

                // Delay to show result
                setTimeout(() => {
                  resolve(actualClass);
                }, TIMING.wheel.resultDelay);
              },
            }
          );
        } else {
          // Fallback without GSAP
          setTimeout(() => {
            setState((prev) => ({
              ...prev,
              isSpinning: false,
              rotation: finalRotation,
              currentClass: targetClass,
            }));
            resolve(targetClass);
          }, TIMING.wheel.fallbackDuration);
        }
      });
    },
    [state.isSpinning, state.rotation]
  );

  return {
    isSpinning: state.isSpinning,
    rotation: state.rotation,
    currentClass: state.currentClass,
    spin,
  };
};
