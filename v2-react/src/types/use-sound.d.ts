declare module 'use-sound' {
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
      sound: any;
    },
  ];

  export default function useSound(url: string, options?: HookOptions): UseSoundReturn;
}
