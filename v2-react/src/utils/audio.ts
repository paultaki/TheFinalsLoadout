import { useRef, useEffect } from 'react';

interface SoundOptions {
  volume?: number;
  loop?: boolean;
}

/**
 * Hook for playing overlapping sound instances with audio pooling
 */
export const useSound = (src: string, options: SoundOptions = {}) => {
  const audioPoolRef = useRef<HTMLAudioElement[]>([]);

  useEffect(() => {
    // Pre-create audio instances
    const pool: HTMLAudioElement[] = [];
    for (let i = 0; i < 10; i++) {
      const audio = new Audio(src);
      audio.volume = options.volume ?? 1;
      audio.loop = options.loop ?? false;
      pool.push(audio);
    }
    audioPoolRef.current = pool;

    return () => {
      // Cleanup
      pool.forEach((audio) => {
        audio.pause();
        audio.src = '';
      });
    };
  }, [src, options.volume, options.loop]);

  const play = (): void => {
    // Find an available audio instance
    const audio = audioPoolRef.current.find((a) => a.paused) || audioPoolRef.current[0];
    if (audio) {
      audio.currentTime = 0;
      audio.play().catch(() => {});
    }
  };

  return play;
};

/**
 * Plays a tick/click sound effect
 */
export const playTickSound = (): void => {
  const audio = new Audio('/sounds/click.mp3');
  audio.volume = 0.4;
  audio.play().catch(() => {});
};

/**
 * Plays a win sound effect
 */
export const playWinSound = (): void => {
  const audio = new Audio('/sounds/ding.mp3');
  audio.volume = 0.6;
  audio.play().catch(() => {});
};

/**
 * Plays a jackpot celebration sound effect
 */
export const playJackpotSound = (): void => {
  const audio = new Audio('/sounds/ding-ding.mp3');
  audio.volume = 0.8;
  audio.play().catch(() => {});
};

// Audio cache for general sound playback
const audioCache: Map<string, HTMLAudioElement> = new Map();

/**
 * Generic sound player with caching
 */
export const playSound = (soundName: string, volume: number = 0.5): void => {
  try {
    let audio = audioCache.get(soundName);
    
    if (!audio) {
      audio = new Audio(`/sounds/${soundName}.mp3`);
      audioCache.set(soundName, audio);
    }

    // Clone the audio to allow overlapping sounds
    const audioClone = audio.cloneNode() as HTMLAudioElement;
    audioClone.volume = volume;
    
    audioClone.play().catch(error => {
      console.warn(`Failed to play sound: ${soundName}`, error);
    });
  } catch (error) {
    console.error(`Error playing sound: ${soundName}`, error);
  }
};
