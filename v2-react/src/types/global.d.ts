interface Window {
  gsap: {
    timeline: (options?: any) => any;
    to: (target: any, vars: any) => any;
    fromTo: (target: any, fromVars: any, toVars: any) => any;
    getProperty: (target: any, property: string) => any;
  };
  confetti: (options?: {
    particleCount?: number;
    spread?: number;
    origin?: { x?: number; y?: number };
  }) => void;
  state?: {
    soundEnabled: boolean;
  };
  SlotMachine?: any;
}
