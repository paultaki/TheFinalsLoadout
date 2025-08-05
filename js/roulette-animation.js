// roulette-animations.js - Fallback stub for spin animation system
// TODO: swap stub for real runSpinSelector once animations are ported

window.RouletteAnimationSystem = class {
  async startFullSequence() {
    console.log('💡 Stub: skipping wheels – using defaults');
    // Return proper case for class name (app.js expects 'Light' not 'LIGHT')
    return { spinCount: 3, isJackpot: false, chosenClass: 'Light' };
  }
};