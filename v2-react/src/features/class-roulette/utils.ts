import { SLICE_DEG, POINTER_OFFSET, WHEEL_PATTERN } from '../../constants/roulette';
import type { RouletteClass } from '../../constants/roulette';
import { NUMBERS } from '../../constants/physics';

export function getClassAtRotation(rotation: number): RouletteClass {
  // Normalize rotation to 0-360 range
  const normalizedRotation = ((rotation % NUMBERS.fullCircle) + NUMBERS.fullCircle) % NUMBERS.fullCircle;

  // Calculate which slice is visible at the pointer
  const visibleAngle = (normalizedRotation + POINTER_OFFSET) % NUMBERS.fullCircle;
  const sliceIdx = Math.floor(visibleAngle / SLICE_DEG) % NUMBERS.segments;

  return WHEEL_PATTERN[sliceIdx];
}
