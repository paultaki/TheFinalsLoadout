/**
 * Common animation math utilities
 * Note: DO NOT modify any easing curves or timing constants
 * These are extracted for reusability only
 */

/**
 * Exponential easing function for smooth deceleration
 * Used by SpinSelector
 */
export const easeOutExpo = (t: number): number => {
  return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
};

/**
 * Quadratic easing in/out function
 * Used by SlotMachine
 */
export const easeInOutQuad = (t: number): number => {
  return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
};

/**
 * Elastic easing out function for bounce effects
 * Used by SlotMachine
 */
export const elasticOut = (t: number): number => {
  const p = 0.3;
  return Math.pow(2, -10 * t) * Math.sin((t - p / 4) * (2 * Math.PI) / p) + 1;
};

/**
 * Linear interpolation between two values
 */
export const lerp = (start: number, end: number, t: number): number => {
  return start + (end - start) * t;
};

/**
 * Clamp a value between min and max
 */
export const clamp = (value: number, min: number, max: number): number => {
  return Math.max(min, Math.min(max, value));
};

/**
 * Calculate velocity from distance over time
 */
export const calculateVelocity = (distance: number, time: number): number => {
  return time > 0 ? distance / time : 0;
};

/**
 * Random number between min and max (inclusive)
 */
export const randomBetween = (min: number, max: number): number => {
  return Math.random() * (max - min) + min;
};