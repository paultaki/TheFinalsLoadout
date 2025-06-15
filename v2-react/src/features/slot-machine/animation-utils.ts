import { SLOT_PHYSICS, NUMBERS } from '../../constants/physics';
import type { SlotItem, ColumnState } from './types';
import { playTickSound, playWinSound, playJackpotSound } from '../../utils/audio';
import { getColumnPool, getRandomItem } from './slot-data';

// Constants
export const SLOT_HEIGHT = SLOT_PHYSICS.height;
export const TOTAL_SLOTS = SLOT_PHYSICS.totalSlots;
export const STAGGER_DELAY = SLOT_PHYSICS.staggerDelay;
export const SPIN_DURATION_NORMAL = SLOT_PHYSICS.duration.normal;
export const SPIN_DURATION_FINAL = SLOT_PHYSICS.duration.final;

// Easing function
export const easeOutCubic = (t: number): number => {
  return 1 - Math.pow(1 - t, NUMBERS.animation.cubicExponent);
};

// Generate items for a column
export const generateColumnItems = (columnIndex: number): SlotItem[] => {
  const items: SlotItem[] = [];
  const pool = getColumnPool(columnIndex);

  // Generate items to fill the column
  for (let i = 0; i < TOTAL_SLOTS; i++) {
    items.push(getRandomItem(pool));
  }

  return items;
};

// Calculate position with easing
export const calculateEasedPosition = (
  progress: number,
  targetIndex: number
): { position: number; velocity: number; currentIndex: number } => {
  const easedProgress =
    progress < SLOT_PHYSICS.easing.progressThreshold
      ? easeOutCubic(progress / SLOT_PHYSICS.easing.progressThreshold)
      : 1;
  const totalDistance = (targetIndex + TOTAL_SLOTS * 3) * SLOT_HEIGHT;
  const currentPosition = easedProgress * totalDistance;

  return {
    position: currentPosition % (TOTAL_SLOTS * SLOT_HEIGHT),
    velocity: currentPosition * 60, // Approximate velocity
    currentIndex: Math.floor(currentPosition / SLOT_HEIGHT) % TOTAL_SLOTS,
  };
};

// Check if tick sound should play
export const checkTickSound = (
  currentPosition: number,
  columnIndex: number,
  lastTickRef: React.MutableRefObject<number[]>
): void => {
  const currentSlot = Math.floor(currentPosition / SLOT_HEIGHT);
  if (currentSlot !== lastTickRef.current[columnIndex]) {
    lastTickRef.current[columnIndex] = currentSlot;
    playTickSound();
  }
};

// Play appropriate win sound
export const playSpinCompleteSound = (isFinalSpin: boolean): void => {
  if (isFinalSpin) {
    playJackpotSound();
  } else {
    playWinSound();
  }
};