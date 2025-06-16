import { NUMBERS } from './physics';

export const SLICE_DEG = NUMBERS.fullCircle / NUMBERS.segments; // 30 degrees per slice
export const POINTER_OFFSET = NUMBERS.rightAngle; // pointer tip angle in canvas coordinates
export const CLASSES = ['Light', 'Medium', 'Heavy'] as const;
export type RouletteClass = (typeof CLASSES)[number];

import { ITERATIONS } from './ui';

// Build full wheel pattern (12 segments)
export const WHEEL_PATTERN: RouletteClass[] = [];
for (let i = 0; i < ITERATIONS.wheel.classPattern; i++) {
  WHEEL_PATTERN.push(...CLASSES);
}
