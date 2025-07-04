/**
 * Tests for AnimationEngine to ensure animation parity
 */

import { describe, test, expect, jest, beforeEach, afterEach } from '@jest/globals';
import { AnimationEngine, SlotColumn } from '../../src/animation/AnimationEngine.js';
import { SLOT_PHYSICS, SLOT_TIMING } from '../../src/core/Constants.js';

// Mock DOM elements
const createMockElement = () => ({
  style: {
    transform: '',
    filter: ''
  },
  closest: jest.fn(() => ({
    classList: {
      add: jest.fn(),
      remove: jest.fn()
    },
    style: {
      boxShadow: ''
    }
  }))
});

describe('AnimationEngine', () => {
  let engine;
  let rafSpy;
  let mockTime = 0;
  
  beforeEach(() => {
    engine = new AnimationEngine();
    mockTime = 0;
    
    // Mock performance.now
    jest.spyOn(performance, 'now').mockImplementation(() => mockTime);
    
    // Mock requestAnimationFrame
    let rafId = 0;
    rafSpy = jest.spyOn(window, 'requestAnimationFrame').mockImplementation((callback) => {
      // Don't execute immediately to avoid infinite loop
      return ++rafId;
    });
    jest.spyOn(window, 'cancelAnimationFrame').mockImplementation(() => {});
  });
  
  afterEach(() => {
    engine.stop();
    jest.restoreAllMocks();
  });
  
  test('initializes with correct default state', () => {
    expect(engine.columns).toEqual([]);
    expect(engine.isRunning).toBe(false);
    expect(engine.animationId).toBeNull();
  });
  
  test('spin() creates SlotColumn instances', () => {
    const mockElements = [
      createMockElement(),
      createMockElement(),
      createMockElement()
    ];
    
    engine.spin(mockElements, false);
    
    expect(engine.columns).toHaveLength(3);
    expect(engine.columns[0]).toBeInstanceOf(SlotColumn);
    expect(engine.isRunning).toBe(true);
    
    // Force stop to complete test
    engine.stop();
  });
  
  test('stop() halts all column animations', () => {
    const mockElements = [createMockElement()];
    engine.spin(mockElements);
    
    expect(engine.isRunning).toBe(true);
    
    engine.stop();
    
    expect(engine.isRunning).toBe(false);
    expect(engine.columns[0].state).toBe('stopped');
  });
});

describe('SlotColumn', () => {
  let mockElement;
  let column;
  
  beforeEach(() => {
    mockElement = createMockElement();
  });
  
  test('initializes with correct physics values', () => {
    column = new SlotColumn(mockElement, 0, false);
    
    expect(column.velocity).toBe(0);
    expect(column.position).toBe(0);
    expect(column.state).toBe('waiting');
    expect(column.maxAnimationDuration).toBe(SLOT_TIMING.ANIMATION_SAFETY_TIMEOUT);
  });
  
  test('regular spin uses correct timing', () => {
    column = new SlotColumn(mockElement, 1, false);
    const timing = SLOT_PHYSICS.TIMING.REGULAR_SPIN;
    
    expect(column.stopDelay).toBe(timing.COLUMN_DELAY * 1);
    expect(column.totalDuration).toBe(timing.BASE_DURATION + column.stopDelay);
    expect(column.decelerationTime).toBe(timing.DECELERATION_TIME);
  });
  
  test('final spin uses explicit stop times', () => {
    column = new SlotColumn(mockElement, 2, true);
    const timing = SLOT_PHYSICS.TIMING.FINAL_SPIN;
    
    expect(column.totalDuration).toBe(timing.COLUMN_STOPS[2]);
  });
  
  test('update() transitions through states correctly', () => {
    column = new SlotColumn(mockElement, 0, false);
    column.state = 'accelerating';
    
    // Test acceleration phase
    column.update(100, 16.67);
    expect(column.velocity).toBeGreaterThan(0);
    expect(column.velocity).toBeLessThanOrEqual(SLOT_PHYSICS.MAX_VELOCITY);
    
    // Test transition to spinning
    column.update(600, 16.67);
    expect(column.state).toBe('spinning');
  });
  
  test('normalizePosition wraps correctly', () => {
    column = new SlotColumn(mockElement, 0, false);
    
    expect(column.normalizePosition(100)).toBe(100);
    expect(column.normalizePosition(SLOT_PHYSICS.ITEM_HEIGHT + 50)).toBe(50);
    expect(column.normalizePosition(-50)).toBe(SLOT_PHYSICS.ITEM_HEIGHT - 50);
  });
  
  test('forceStop() resets column state', () => {
    column = new SlotColumn(mockElement, 0, false);
    column.velocity = 1000;
    column.state = 'spinning';
    
    column.forceStop();
    
    expect(column.velocity).toBe(0);
    expect(column.state).toBe('stopped');
    expect(column.position).toBe(column.targetPosition);
  });
  
  test('updateVisuals applies correct blur levels', () => {
    column = new SlotColumn(mockElement, 0, false);
    
    // Test extreme blur
    column.velocity = 4000;
    column.updateVisuals();
    expect(mockElement.style.filter).toContain('blur(8px)');
    
    // Test high speed blur
    column.velocity = 2500;
    column.updateVisuals();
    expect(mockElement.style.filter).toContain('blur(3px)');
    
    // Test no blur
    column.velocity = 500;
    column.updateVisuals();
    expect(mockElement.style.filter).toBe('none');
  });
  
  test('handles invalid values gracefully', () => {
    column = new SlotColumn(mockElement, 0, false);
    
    // Test with NaN values
    column.velocity = NaN;
    column.position = NaN;
    
    expect(() => column.update(1000, 16.67)).not.toThrow();
    expect(column.velocity).toBe(0);
    expect(column.position).toBe(0);
  });
});