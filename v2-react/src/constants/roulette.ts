export const SLICE_DEG = 360 / 12; // 30 degrees per slice
export const POINTER_OFFSET = 90; // pointer tip angle in canvas coordinates
export const CLASSES = ['Light', 'Medium', 'Heavy'] as const;
export type RouletteClass = (typeof CLASSES)[number];

// Build full wheel pattern (12 segments)
export const WHEEL_PATTERN: RouletteClass[] = [];
for (let i = 0; i < 4; i++) {
  WHEEL_PATTERN.push(...CLASSES);
}
