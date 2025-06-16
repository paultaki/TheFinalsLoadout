import { SLICE_DEG, WHEEL_PATTERN } from '../../constants/roulette';
import type { RouletteClass } from '../../constants/roulette';
import { NUMBERS } from '../../constants/physics';

export function getClassAtRotation(rotation: number): RouletteClass {
  // Normalize rotation to 0-360 range
  const normalizedRotation = ((rotation % NUMBERS.fullCircle) + NUMBERS.fullCircle) % NUMBERS.fullCircle;

  // The canvas draws segments starting at -90° (top), but our pointer is at +90° (right after rotation)
  // We need to account for this offset
  const canvasOffset = -NUMBERS.rightAngle; // Canvas starts at -90°, we need to adjust
  const adjustedRotation = (normalizedRotation + canvasOffset + NUMBERS.fullCircle) % NUMBERS.fullCircle;
  
  // Calculate which slice is under the pointer (which is at top due to 180° rotation)
  const sliceIdx = Math.floor(adjustedRotation / SLICE_DEG) % NUMBERS.segments;

  return WHEEL_PATTERN[sliceIdx];
}
