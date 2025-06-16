declare module 'use-sound' {
  // Basic Howler.js type
  interface Howl {
    play(): number;
    pause(id?: number): Howl;
    stop(id?: number): Howl;
    volume(volume?: number, id?: number): Howl | number;
    rate(rate?: number, id?: number): Howl | number;
    seek(seek?: number, id?: number): Howl | number;
    playing(id?: number): boolean;
    duration(id?: number): number;
    state(): 'unloaded' | 'loading' | 'loaded';
    unload(): void;
  }
  export interface HookOptions {
    volume?: number;
    playbackRate?: number;
    interrupt?: boolean;
    soundEnabled?: boolean;
    sprite?: { [key: string]: [number, number] };
    onend?: () => void;
  }

  export interface PlayFunction {
    (): void;
    stop?: () => void;
    pause?: () => void;
  }

  export type UseSoundReturn = [
    PlayFunction,
    {
      stop: () => void;
      pause: () => void;
      duration: number | null;
      sound: Howl | null;
    },
  ];

  export default function useSound(url: string, options?: HookOptions): UseSoundReturn;
}
