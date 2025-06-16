import { describe, it, expect } from 'vitest';
import { getClassAtRotation } from '../features/class-roulette/utils';
import { WHEEL_PATTERN } from '../constants/roulette';

describe('Roulette Slice Calculation', () => {
  it('should map every 30° rotation to the correct class (exhaustive test)', () => {
    // Expected pattern based on pointer at 90° and wheel starting at -90°
    const expected = [
      'Heavy', // 0° rotation → slice at 90° → index 3 → Heavy
      'Light', // 30° rotation → slice at 120° → index 4 → Light
      'Medium', // 60° rotation → slice at 150° → index 5 → Medium
      'Heavy', // 90° rotation → slice at 180° → index 6 → Heavy
      'Light', // 120° rotation → slice at 210° → index 7 → Light
      'Medium', // 150° rotation → slice at 240° → index 8 → Medium
      'Heavy', // 180° rotation → slice at 270° → index 9 → Heavy
      'Light', // 210° rotation → slice at 300° → index 10 → Light
      'Medium', // 240° rotation → slice at 330° → index 11 → Medium
      'Heavy', // 270° rotation → slice at 0° → index 0 → Heavy
      'Light', // 300° rotation → slice at 30° → index 1 → Light
      'Medium', // 330° rotation → slice at 60° → index 2 → Medium
    ];

    // Test every 30° position
    for (let i = 0; i < 12; i++) {
      const rotation = i * 30;
      const actual = getClassAtRotation(rotation);
      expect(actual).toBe(expected[i]);
    }
  });

  it('should handle rotations beyond 360 degrees', () => {
    expect(getClassAtRotation(360)).toBe(getClassAtRotation(0));
    expect(getClassAtRotation(390)).toBe(getClassAtRotation(30));
    expect(getClassAtRotation(720)).toBe(getClassAtRotation(0));
    expect(getClassAtRotation(750)).toBe(getClassAtRotation(30));
  });

  it('should handle negative rotations', () => {
    expect(getClassAtRotation(-30)).toBe(getClassAtRotation(330));
    expect(getClassAtRotation(-60)).toBe(getClassAtRotation(300));
    expect(getClassAtRotation(-90)).toBe(getClassAtRotation(270));
  });

  it('should verify the wheel pattern is correct', () => {
    expect(WHEEL_PATTERN).toEqual([
      'Light',
      'Medium',
      'Heavy',
      'Light',
      'Medium',
      'Heavy',
      'Light',
      'Medium',
      'Heavy',
      'Light',
      'Medium',
      'Heavy',
    ]);
  });
});
