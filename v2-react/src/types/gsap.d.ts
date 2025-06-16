declare global {
  interface Window {
    gsap: {
      timeline: (options?: gsap.TimelineVars) => gsap.core.Timeline;
      to: (target: any, vars: gsap.TweenVars) => gsap.core.Tween;
      fromTo: (target: any, fromVars: gsap.TweenVars, toVars: gsap.TweenVars) => gsap.core.Tween;
      getProperty: (target: any, property: string) => any;
      set: (target: any, vars: gsap.TweenVars) => gsap.core.Tween;
    };
    confetti: (options?: {
      particleCount?: number;
      spread?: number;
      origin?: { x?: number; y?: number };
      colors?: string[];
      startVelocity?: number;
      gravity?: number;
    }) => void;
  }
}

// Minimal GSAP type declarations
declare namespace gsap {
  interface TweenVars {
    [key: string]: any;
    duration?: number;
    ease?: string | Function;
    onComplete?: Function;
    onUpdate?: Function;
    onStart?: Function;
  }

  interface TimelineVars extends TweenVars {
    paused?: boolean;
    repeat?: number;
    repeatDelay?: number;
  }

  namespace core {
    interface Tween {
      kill(): void;
      pause(): Tween;
      play(): Tween;
      progress(value?: number): number | Tween;
    }

    interface Timeline extends Tween {
      add(child: Tween | Timeline, position?: string | number): Timeline;
      to(target: any, vars: TweenVars, position?: string | number): Timeline;
      fromTo(target: any, fromVars: TweenVars, toVars: TweenVars, position?: string | number): Timeline;
    }
  }
}

export {};
