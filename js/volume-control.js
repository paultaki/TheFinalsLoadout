/**
 * Volume Control Utility
 * Ensures all sounds stay within ultra-quiet range (max 8% volume)
 */

// Maximum volume cap for all sounds (8% of original)
const MAX_VOLUME_CAP = 0.08;

/**
 * Apply volume cap to any audio element or volume value
 * @param {number} volume - The intended volume (0-1)
 * @returns {number} - The capped volume (max 0.08)
 */
function applyVolumeCap(volume) {
  return Math.min(volume, MAX_VOLUME_CAP);
}

/**
 * Set volume on an audio element with automatic capping
 * @param {HTMLAudioElement} audioElement - The audio element
 * @param {number} volume - The intended volume (0-1)
 */
function setAudioVolume(audioElement, volume) {
  if (audioElement) {
    audioElement.volume = applyVolumeCap(volume);
  }
}

/**
 * Play audio with volume control
 * @param {HTMLAudioElement} audioElement - The audio element
 * @param {number} volume - The intended volume (0-1)
 */
function playAudioWithVolume(audioElement, volume) {
  if (audioElement) {
    audioElement.volume = applyVolumeCap(volume);
    audioElement.currentTime = 0;
    audioElement.play().catch(() => {
      // Silently fail if audio not available
    });
  }
}

/**
 * Ultra-quiet volume presets
 */
const ULTRA_QUIET_VOLUMES = {
  CLICK: 0.02,
  BEEP: 0.03,
  SPIN: 0.04,
  CELEBRATION: 0.05,
  BACKGROUND: 0.01,
  NOTIFICATION: 0.03,
  TICK: 0.02,
  BOUNCE: 0.03,
  TRANSITION: 0.04,
  WHOOSH: 0.02,
  STATIC: 0.01,
};

// Apply cap to all presets
Object.keys(ULTRA_QUIET_VOLUMES).forEach((key) => {
  ULTRA_QUIET_VOLUMES[key] = applyVolumeCap(ULTRA_QUIET_VOLUMES[key]);
});

/**
 * Global volume control for window object
 */
if (typeof window !== "undefined") {
  window.VolumeControl = {
    applyVolumeCap,
    setAudioVolume,
    playAudioWithVolume,
    ULTRA_QUIET_VOLUMES,
    MAX_VOLUME_CAP,
  };
}
