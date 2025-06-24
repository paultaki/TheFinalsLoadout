/**
 * Tests for StateManager
 */

import { StateManager, StateActions } from '../../src/core/StateManager.js';

describe('StateManager', () => {
  let stateManager;
  
  beforeEach(() => {
    stateManager = new StateManager();
    // Clear localStorage
    localStorage.clear();
  });
  
  test('initializes with correct default state', () => {
    const state = stateManager.get();
    
    expect(state.isSpinning).toBe(false);
    expect(state.currentSpin).toBe(1);
    expect(state.totalSpins).toBe(0);
    expect(state.selectedGadgets).toEqual(new Set());
    expect(state.soundEnabled).toBe(true);
    expect(state.sidebarOpen).toBe(false);
  });
  
  test('get() returns specific values', () => {
    expect(stateManager.get('isSpinning')).toBe(false);
    expect(stateManager.get('currentSpin')).toBe(1);
    expect(stateManager.get('nonexistent')).toBeUndefined();
  });
  
  test('set() updates single value', () => {
    stateManager.set('isSpinning', true);
    expect(stateManager.get('isSpinning')).toBe(true);
  });
  
  test('set() merges object', () => {
    stateManager.set({
      isSpinning: true,
      currentSpin: 5
    });
    
    expect(stateManager.get('isSpinning')).toBe(true);
    expect(stateManager.get('currentSpin')).toBe(5);
  });
  
  test('subscribe() notifies on changes', () => {
    const callback = jest.fn();
    
    stateManager.subscribe('isSpinning', callback);
    stateManager.set('isSpinning', true);
    
    expect(callback).toHaveBeenCalledWith(true, false, 'isSpinning');
  });
  
  test('subscribe() with multiple keys', () => {
    const callback = jest.fn();
    
    stateManager.subscribe(['isSpinning', 'currentSpin'], callback);
    
    stateManager.set('isSpinning', true);
    expect(callback).toHaveBeenCalledTimes(1);
    
    stateManager.set('currentSpin', 2);
    expect(callback).toHaveBeenCalledTimes(2);
  });
  
  test('subscribe() wildcard gets all changes', () => {
    const callback = jest.fn();
    
    stateManager.subscribe(callback);
    
    stateManager.set({
      isSpinning: true,
      currentSpin: 3
    });
    
    expect(callback).toHaveBeenCalledTimes(1);
    expect(callback).toHaveBeenCalledWith(
      expect.objectContaining({ isSpinning: true, currentSpin: 3 }),
      expect.any(Object),
      ['isSpinning', 'currentSpin']
    );
  });
  
  test('unsubscribe works correctly', () => {
    const callback = jest.fn();
    
    const unsubscribe = stateManager.subscribe('isSpinning', callback);
    stateManager.set('isSpinning', true);
    expect(callback).toHaveBeenCalledTimes(1);
    
    unsubscribe();
    stateManager.set('isSpinning', false);
    expect(callback).toHaveBeenCalledTimes(1); // Not called again
  });
  
  test('history tracking works', () => {
    stateManager.set('isSpinning', true);
    stateManager.set('currentSpin', 2);
    
    const history = stateManager.getHistory();
    expect(history).toHaveLength(2);
    expect(history[0].changes).toEqual({ isSpinning: true });
    expect(history[1].changes).toEqual({ currentSpin: 2 });
  });
  
  test('reset() restores initial state', () => {
    stateManager.set({
      isSpinning: true,
      currentSpin: 5,
      totalSpins: 10
    });
    
    stateManager.reset();
    
    const state = stateManager.get();
    expect(state.isSpinning).toBe(false);
    expect(state.currentSpin).toBe(1);
    expect(state.totalSpins).toBe(0);
  });
  
  test('sound preference persistence', () => {
    localStorage.setItem('soundEnabled', 'false');
    
    const newManager = new StateManager();
    expect(newManager.get('soundEnabled')).toBe(false);
  });
});

describe('StateActions', () => {
  let stateManager;
  let actions;
  
  beforeEach(() => {
    stateManager = new StateManager();
    actions = new StateActions(stateManager);
  });
  
  test('startSpin updates state correctly', () => {
    actions.startSpin();
    
    expect(stateManager.get('isSpinning')).toBe(true);
    expect(stateManager.get('currentSpin')).toBe(2);
  });
  
  test('stopSpin updates state correctly', () => {
    stateManager.set({ isSpinning: true, totalSpins: 5 });
    
    actions.stopSpin();
    
    expect(stateManager.get('isSpinning')).toBe(false);
    expect(stateManager.get('totalSpins')).toBe(6);
  });
  
  test('toggleSound persists to localStorage', () => {
    actions.toggleSound();
    
    expect(stateManager.get('soundEnabled')).toBe(false);
    expect(localStorage.getItem('soundEnabled')).toBe('false');
    
    actions.toggleSound();
    
    expect(stateManager.get('soundEnabled')).toBe(true);
    expect(localStorage.getItem('soundEnabled')).toBe('true');
  });
  
  test('selectGadgets updates Set correctly', () => {
    const gadgets = ['gadget1', 'gadget2', 'gadget3'];
    actions.selectGadgets(gadgets);
    
    const selected = stateManager.get('selectedGadgets');
    expect(selected).toEqual(new Set(gadgets));
  });
});