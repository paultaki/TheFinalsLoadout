/**
 * Sound configuration and paths
 * All audio assets are loaded from the sounds directory
 */

export const SOUND_PATHS = {
  // Overlay sounds
  beep: 'sounds/beep.mp3',
  ding: 'sounds/ding.mp3',
  dingDing: 'sounds/ding-ding.mp3',
  spinning: 'sounds/spinning.mp3',
  transition: 'sounds/transition.mp3',
  roulette: 'sounds/roulette.mp3',
  finalSound: 'sounds/pop-pour-perform.mp3',
  
  // Slot machine sounds (if any are added)
  slotSpin: 'sounds/slot-spin.mp3',
  slotStop: 'sounds/slot-stop.mp3'
};

// Sound settings
export const SOUND_CONFIG = {
  defaultVolume: 0.5,
  beepVolume: 0.3,
  preloadAll: true,
  
  // Dynamic volume calculations
  ballSpeedVolumeBase: 0.2,
  ballSpeedVolumeRange: 0.3,
  
  // Playback rates
  beepPlaybackRateBase: 0.8,
  beepPlaybackRateRange: 0.4
};

// Initialize audio objects
export function initializeSounds() {
  const sounds = {};
  
  for (const [key, path] of Object.entries(SOUND_PATHS)) {
    try {
      const audio = new Audio(path);
      audio.preload = SOUND_CONFIG.preloadAll ? 'auto' : 'none';
      audio.volume = SOUND_CONFIG.defaultVolume;
      sounds[key] = audio;
    } catch (e) {
      console.warn(`Failed to load sound: ${key} from ${path}`, e);
      sounds[key] = null;
    }
  }
  
  return sounds;
}

// Sound utility functions
export const SoundUtils = {
  play(audio, options = {}) {
    if (!audio) return Promise.resolve();
    
    try {
      audio.currentTime = 0;
      if (options.volume !== undefined) audio.volume = options.volume;
      if (options.playbackRate !== undefined) audio.playbackRate = options.playbackRate;
      
      return audio.play().catch(err => {
        console.warn('Audio playback failed:', err);
      });
    } catch (e) {
      console.warn('Sound play error:', e);
      return Promise.resolve();
    }
  },
  
  stop(audio) {
    if (!audio) return;
    
    try {
      audio.pause();
      audio.currentTime = 0;
    } catch (e) {
      console.warn('Sound stop error:', e);
    }
  },
  
  fadeOut(audio, duration = 1000) {
    if (!audio) return Promise.resolve();
    
    const startVolume = audio.volume;
    const startTime = Date.now();
    
    return new Promise(resolve => {
      const fade = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        audio.volume = startVolume * (1 - progress);
        
        if (progress < 1) {
          requestAnimationFrame(fade);
        } else {
          audio.pause();
          audio.volume = startVolume;
          resolve();
        }
      };
      
      fade();
    });
  }
};