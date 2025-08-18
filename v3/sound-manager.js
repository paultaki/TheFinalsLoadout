/**
 * Sound Manager for The Finals Slot Machine
 * Handles all audio playback with precise timing
 */
class SoundManager {
  constructor() {
    this.sounds = {};
    this.enabled = true;
    this.spinCount = 0;
    this.landedColumns = new Set();
    
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
  onSpinStart(isFirstSpin = false) {
    if (!this.enabled) return;
    
    // Play start-spin.mp3 only on the very first spin
    if (isFirstSpin) {
      this.playSound('startSpin');
      this.spinCount = 0;
      this.landedColumns.clear();
    }
    
    // Start the spinning loop sound
    this.playSound('spinning');
    this.spinCount++;
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
      this.stopSound('spinning');
    }
  }
  
  // Called when the final celebration animation starts
  onCelebration() {
    if (!this.enabled) return;
    
    // Make sure spinning sound is stopped
    this.stopSound('spinning');
    
    // Play final celebration sound
    this.playSound('finalSound');
  }
  
  // Play a specific sound
  playSound(soundKey) {
    if (!this.enabled || !this.sounds[soundKey]) return;
    
    const audio = this.sounds[soundKey];
    
    // Reset to beginning for non-looping sounds
    if (!audio.loop) {
      audio.currentTime = 0;
    }
    
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
    this.landedColumns.clear();
  }
}

// Create singleton instance
const soundManager = new SoundManager();

// Export for use in other modules
window.SoundManager = soundManager;