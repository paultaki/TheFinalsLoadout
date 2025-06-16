import { useState, useRef, useCallback, useEffect } from 'react';
import type { SlotItem, Loadout, ColumnState } from './types';
import { NUMBERS } from '../../constants/physics';
import {
  SLOT_HEIGHT,
  TOTAL_SLOTS,
  STAGGER_DELAY,
  SPIN_DURATION_NORMAL,
  SPIN_DURATION_FINAL,
  generateColumnItems,
  calculateEasedPosition,
  checkTickSound,
  playSpinCompleteSound,
} from './animation-utils';

/**
 * Hook for managing slot machine animation state and spin logic
 */
export const useSlotMachine = (onResult: (result: Loadout) => void, isFinalSpin = false) => {
  const [isAnimating, setIsAnimating] = useState(false);
  const [columns, setColumns] = useState<ColumnState[]>(
    Array(NUMBERS.columns).fill(null).map(() => ({ 
      position: 0, 
      velocity: 0, 
      isAnimating: false, 
      finalIndex: 0, 
      currentIndex: 0 
    }))
  );

  const animationFrameRef = useRef<number | undefined>(undefined);
  const lastTickRef = useRef<number[]>([0, 0, 0, 0, 0]);
  const columnsRef = useRef<HTMLDivElement[]>([]);

  const [columnItems] = useState<SlotItem[][]>(() => {
    return Array(NUMBERS.columns)
      .fill(null)
      .map((_, index) => generateColumnItems(index));
  });


  // Animate a single column
  const animateColumn = useCallback(
    (columnIndex: number, startTime: number, duration: number, targetIndex: number) => {
      const animate = (currentTime: number) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);

        if (progress < 1) {
          // Calculate position with easing
          const { position, velocity, currentIndex } = calculateEasedPosition(progress, targetIndex);
          const totalDistance = (targetIndex + TOTAL_SLOTS * 3) * SLOT_HEIGHT;
          const currentPosition = progress * totalDistance;

          // Update column state
          setColumns((prev) => {
            const newColumns = [...prev];
            newColumns[columnIndex] = {
              ...newColumns[columnIndex],
              position,
              velocity,
              currentIndex,
            };
            return newColumns;
          });

          // Check for tick sound
          checkTickSound(currentPosition, columnIndex, lastTickRef);

          requestAnimationFrame(animate);
        } else {
          // Animation complete - snap to final position
          setColumns((prev) => {
            const newColumns = [...prev];
            newColumns[columnIndex] = {
              ...newColumns[columnIndex],
              position: (targetIndex * SLOT_HEIGHT) % (TOTAL_SLOTS * SLOT_HEIGHT),
              velocity: 0,
              isAnimating: false,
              finalIndex: targetIndex,
              currentIndex: targetIndex,
            };
            return newColumns;
          });

          // Check if all columns are done
          setColumns((prev) => {
            const allDone = prev.every((col) => !col.isAnimating);
            if (allDone) {
              handleSpinComplete();
            }
            return prev;
          });
        }
      };

      requestAnimationFrame(animate);
    },
    []
  );

  // Handle spin completion
  const handleSpinComplete = useCallback(() => {
    setIsAnimating(false);

    // Get final items
    const finalLoadout: Loadout = {
      weapon: columnItems[0][columns[0].finalIndex],
      specialization: columnItems[1][columns[1].finalIndex],
      gadget1: columnItems[2][columns[2].finalIndex],
      gadget2: columnItems[3][columns[3].finalIndex],
      gadget3: columnItems[4][columns[4].finalIndex],
    };

    // Play win sound
    playSpinCompleteSound(isFinalSpin);

    // Trigger callback
    onResult(finalLoadout);
  }, [columns, columnItems, isFinalSpin, onResult]);

  // Start spin animation
  const spin = useCallback(() => {
    if (isAnimating) return;

    setIsAnimating(true);
    const duration = isFinalSpin ? SPIN_DURATION_FINAL : SPIN_DURATION_NORMAL;

    // Set all columns to animating
    setColumns((prev) => prev.map((col) => ({ ...col, isAnimating: true })));

    // Start each column with stagger
    columns.forEach((_, index) => {
      const targetIndex = Math.floor(Math.random() * TOTAL_SLOTS);
      const startDelay = index * STAGGER_DELAY;

      setTimeout(() => {
        animateColumn(index, performance.now(), duration, targetIndex);
      }, startDelay);
    });
  }, [isAnimating, isFinalSpin, columns, animateColumn]);

  // Set column refs
  const setColumnRef = useCallback(
    (index: number) => (el: HTMLDivElement | null) => {
      if (el) columnsRef.current[index] = el;
    },
    []
  );

  // Cleanup
  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  return {
    isAnimating,
    columns,
    columnItems,
    spin,
    setColumnRef,
  };
};
