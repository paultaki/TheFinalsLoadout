/**
 * Validation tests to ensure extracted constants match original values
 */

import { describe, test, expect } from '@jest/globals';
import { SLOT_PHYSICS, SPIN_PHYSICS, ROULETTE_CONFIG } from '../../src/core/Constants.js';

describe('Constants Validation', () => {
  test('Slot Physics values match original', () => {
    // Original values from app.js
    const originalPhysics = {
      ACCELERATION: 8000,
      MAX_VELOCITY: 5000,
      DECELERATION: -3500,
      BOUNCE_DAMPENING: 0.4,
      ITEM_HEIGHT: 188
    };
    
    expect(SLOT_PHYSICS.ACCELERATION).toBe(originalPhysics.ACCELERATION);
    expect(SLOT_PHYSICS.MAX_VELOCITY).toBe(originalPhysics.MAX_VELOCITY);
    expect(SLOT_PHYSICS.DECELERATION).toBe(originalPhysics.DECELERATION);
    expect(SLOT_PHYSICS.BOUNCE_DAMPENING).toBe(originalPhysics.BOUNCE_DAMPENING);
    expect(SLOT_PHYSICS.ITEM_HEIGHT).toBe(originalPhysics.ITEM_HEIGHT);
  });
  
  test('Spin Wheel Physics match original', () => {
    expect(SPIN_PHYSICS.initialVelocity.min).toBe(4800);
    expect(SPIN_PHYSICS.initialVelocity.max).toBe(5600);
    expect(SPIN_PHYSICS.friction).toBe(0.985);
    expect(SPIN_PHYSICS.decelerationThreshold).toBe(600);
    expect(SPIN_PHYSICS.decelerationDuration).toBe(600);
    expect(SPIN_PHYSICS.idleSpeed).toBe(0.3);
    expect(SPIN_PHYSICS.minTickVelocity).toBe(50);
  });
  
  test('Roulette Config matches original', () => {
    expect(ROULETTE_CONFIG.spinDuration).toBe(8000);
    expect(ROULETTE_CONFIG.minRotations).toBe(8);
    expect(ROULETTE_CONFIG.maxRotations).toBe(12);
    expect(ROULETTE_CONFIG.ballDuration).toBe(7500);
    expect(ROULETTE_CONFIG.ballRadius).toBe(140);
    expect(ROULETTE_CONFIG.finalRadius).toBe(100);
    expect(ROULETTE_CONFIG.wheelRadius).toBe(160);
    expect(ROULETTE_CONFIG.outerRadius).toBe(185);
  });
  
  test('Timing values match original', () => {
    expect(SLOT_PHYSICS.TIMING.REGULAR_SPIN.COLUMN_DELAY).toBe(250);
    expect(SLOT_PHYSICS.TIMING.REGULAR_SPIN.BASE_DURATION).toBe(800);
    expect(SLOT_PHYSICS.TIMING.REGULAR_SPIN.DECELERATION_TIME).toBe(400);
    
    expect(SLOT_PHYSICS.TIMING.FINAL_SPIN.COLUMN_DELAY).toBe(200);
    expect(SLOT_PHYSICS.TIMING.FINAL_SPIN.BASE_DURATION).toBe(2500);
    expect(SLOT_PHYSICS.TIMING.FINAL_SPIN.DECELERATION_TIME).toBe(800);
    
    const expectedStops = [3000, 4000, 5200, 6000, 7000];
    expect(SLOT_PHYSICS.TIMING.FINAL_SPIN.COLUMN_STOPS).toEqual(expectedStops);
  });
  
  test('Roulette phases sum to 1.0', () => {
    const phases = ROULETTE_CONFIG.phases;
    const sum = phases.launch + phases.coast + phases.decelerate + 
                phases.spiral + phases.bounce + phases.settle;
    expect(sum).toBeCloseTo(1.0, 5);
  });
});