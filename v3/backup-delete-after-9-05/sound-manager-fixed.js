/**
 * Sound Manager for The Finals Slot Machine - FIXED VERSION
 * Handles all audio playback with precise timing
 * FIXES: Stops/starts spinning sound between each spin cycle
 */
class SoundManager {
  constructor() {
    this.sounds = {};
    this.enabled = true;
    this.spinCount = 0;
    this.currentSpinCount = 0;
    this.landedColumns = new Set();
    this.isSpinning = false;
    
    // Load all sounds
    this.loadSounds();
    
    // Check localStorage for sound preference
    const savedPreference = localStorage.getItem('soundEnabled');
    if (savedPreference !== null) {
      this.enabled = savedPreference === 'true';
    }
  }
  
  loadSounds() {
    const soundFiles = {
      startSpin: '/sounds/start-spin.mp3',
      spinning: '/sounds/spinning.mp3',
      click: '/sounds/click.mp3',
      finalSound: '/sounds/final-sound.mp3'
    };
    
    // Preload all sounds
    Object.entries(soundFiles).forEach(([key, path]) => {
      const audio = new Audio(path);
      audio.preload = 'auto';
      
      // Set looping for spinning sound
      if (key === 'spinning') {
        audio.loop = true;
      }
      
      this.sounds[key] = audio;
    });
  }
  
  // Called when a new spin sequence starts
  onSpinStart(isFirstSpin = false, spinNumber = 1) {
    if (!this.enabled) return;
    
    console.log(`[SoundManager] Spin started - First: ${isFirstSpin}, Number: ${spinNumber}`);
    
    // ALWAYS stop any existing spinning sound first
    this.stopSound('spinning');
    
    // Play start-spin.mp3 only on the very first spin
    if (isFirstSpin) {
      this.playSound('startSpin');
      this.spinCount = 0;
      this.landedColumns.clear();
    }
    
    // Small delay to ensure clean restart of spinning sound
    setTimeout(() => {
      // Start fresh spinning loop sound for THIS spin
      this.playSound('spinning');
      this.isSpinning = true;
    }, 50);
    
    this.spinCount++;
    this.currentSpinCount = spinNumber;
  }
  
  // Called when a spin cycle ends (before next spin starts)
  onSpinCycleEnd() {
    if (!this.enabled) return;
    
    console.log(`[SoundManager] Spin cycle ${this.currentSpinCount} ended`);
    
    // IMPORTANT: Stop spinning sound at end of each cycle
    this.stopSound('spinning');
    this.isSpinning = false;
  }
  
  // Called when an individual column lands
  onColumnLand(columnIndex) {
    if (!this.enabled) return;
    
    // Prevent duplicate sounds for same column
    const columnKey = `${this.spinCount}-${columnIndex}`;
    if (this.landedColumns.has(columnKey)) return;
    
    this.landedColumns.add(columnKey);
    
    // Play click sound for this column landing
    this.playSound('click');
    
    // Check if all 5 columns have landed for this spin
    const landedThisSpin = Array.from(this.landedColumns)
      .filter(key => key.startsWith(`${this.spinCount}-`)).length;
    
    if (landedThisSpin === 5) {
      // All columns landed, stop spinning sound
      console.log(`[SoundManager] All columns landed for spin ${this.spinCount}`);
      this.stopSound('spinning');
      this.isSpinning = false;
    }
  }
  
  // Called when the final celebration animation starts
  onCelebration() {
    if (!this.enabled) return;
    
    console.log(`[SoundManager] Celebration started`);
    
    // Make sure spinning sound is stopped
    this.stopSound('spinning');
    this.isSpinning = false;
    
    // Play final celebration sound
    this.playSound('finalSound');
  }
  
  // Play a specific sound
  playSound(soundKey) {
    if (!this.enabled || !this.sounds[soundKey]) return;
    
    const audio = this.sounds[soundKey];
    
    // Always reset to beginning for clean playback
    audio.currentTime = 0;
    
    // Play with error handling
    audio.play().catch(err => {
      console.warn(`Failed to play ${soundKey}:`, err);
    });
  }
  
  // Stop a specific sound
  stopSound(soundKey) {
    if (!this.sounds[soundKey]) return;
    
    const audio = this.sounds[soundKey];
    audio.pause();
    audio.currentTime = 0;
  }
  
  // Stop all sounds
  stopAll() {
    Object.values(this.sounds).forEach(audio => {
      audio.pause();
      audio.currentTime = 0;
    });
    this.isSpinning = false;
  }
  
  // Toggle sound on/off
  toggleSound() {
    this.enabled = !this.enabled;
    localStorage.setItem('soundEnabled', this.enabled);
    
    if (!this.enabled) {
      this.stopAll();
    }
    
    return this.enabled;
  }
  
  // Reset for new spin sequence
  reset() {
    this.stopAll();
    this.spinCount = 0;
    this.currentSpinCount = 0;
    this.landedColumns.clear();
    this.isSpinning = false;
  }
}

// Create singleton instance
const soundManager = new SoundManager();

// Export for use in other modules
window.SoundManager = soundManager;