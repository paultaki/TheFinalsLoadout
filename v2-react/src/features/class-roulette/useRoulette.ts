import { useState, useRef, useCallback } from 'react';
import { playSound } from '../../utils/sound';
import { ANIMATION_CONSTANTS } from '../../constants/animation';
import { SLICE_DEG, POINTER_OFFSET, WHEEL_PATTERN } from '../../constants/roulette';
import { getClassAtRotation } from './utils';
import type { ClassType } from '../../types';

interface RouletteState {
  isSpinning: boolean;
  rotation: number;
  currentClass: ClassType | null;
}

const { classRoulette } = ANIMATION_CONSTANTS;

export const useRoulette = () => {
  const [state, setState] = useState<RouletteState>({
    isSpinning: false,
    rotation: 0,
    currentClass: null,
  });

  const animationRef = useRef<any>(null);
  const gsapTimelineRef = useRef<any>(null);

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
          targetIndex = Math.floor(Math.random() * 12);
        }

        const targetClass = WHEEL_PATTERN[targetIndex];

        // Calculate final rotation
        // We need to rotate so that when rotation is applied, the target segment aligns with the pointer
        // Since pointer is at +90°, we need: (rotation + 90) % 360 = targetIndex * 30
        // Therefore: rotation = (targetIndex * 30 - 90 + 360) % 360
        const targetRotation = (targetIndex * SLICE_DEG - POINTER_OFFSET + 360) % 360;

        // Add multiple full spins
        const spins = 6 + Math.random() * 2; // 6-8 full rotations
        const finalRotation = spins * 360 + targetRotation;

        // Play whoosh sound
        playSound('spinning');

        // GSAP animation
        if (typeof (window as any).gsap !== 'undefined') {
          const gsap = (window as any).gsap;

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
              duration: 4,
              ease: 'power4.out',
              onUpdate: () => {
                const currentRotation = animationRef.current.rotation;
                setState((prev) => ({ ...prev, rotation: currentRotation }));

                // Tick sounds
                const tickIndex = Math.floor(currentRotation / SLICE_DEG);
                if (tickIndex !== lastTickIndex && tickIndex % 1 === 0) {
                  lastTickIndex = tickIndex;
                  const speed = gsap.getProperty(animationRef.current, 'rotation') / 4; // rough speed
                  if (speed > 50) {
                    playSound('tick', {
                      volume: Math.min(1, speed / 500),
                      playbackRate: Math.min(1.5, speed / 300),
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
                }, 2000);
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
          }, 5000);
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
