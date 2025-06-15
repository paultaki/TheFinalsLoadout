import { SLICE_DEG, POINTER_OFFSET, WHEEL_PATTERN } from '../../constants/roulette';
import type { RouletteClass } from '../../constants/roulette';

export function getClassAtRotation(rotation: number): RouletteClass {
  // Normalize rotation to 0-360 range
  const normalizedRotation = ((rotation % 360) + 360) % 360;

  // Calculate which slice is visible at the pointer
  const visibleAngle = (normalizedRotation + POINTER_OFFSET) % 360;
  const sliceIdx = Math.floor(visibleAngle / SLICE_DEG) % 12;

  return WHEEL_PATTERN[sliceIdx];
}
