import type { SoundType } from '../constants/sounds';
import { SOUND_PATHS } from '../constants/sounds';

/**
 * Play a sound effect if sound is enabled
 * @param soundType - The type of sound to play
 * @param options - Optional playback options
 */
export const playSound = (
  soundType: SoundType,
  options?: {
    volume?: number;
    playbackRate?: number;
  }
): void => {
  if (!window.state?.soundEnabled) return;

  const soundPath = SOUND_PATHS[soundType];
  const audio = new Audio(soundPath);

  if (options?.volume !== undefined) {
    audio.volume = options.volume;
  }

  if (options?.playbackRate !== undefined) {
    audio.playbackRate = options.playbackRate;
  }

  audio.play().catch(() => {
    // Ignore errors (e.g., autoplay restrictions)
  });
};

/**
 * Create and cache an audio element for repeated use
 * @param soundType - The type of sound to create
 * @returns HTMLAudioElement
 */
export const createAudioElement = (soundType: SoundType): HTMLAudioElement => {
  const audio = document.createElement('audio');
  audio.src = SOUND_PATHS[soundType];
  audio.preload = 'auto';
  return audio;
};

// Legacy functions for backward compatibility
export const playTickSound = () => playSound('tick');
export const playWinSound = () => playSound('win');
export const playJackpotSound = () => playSound('jackpot');
