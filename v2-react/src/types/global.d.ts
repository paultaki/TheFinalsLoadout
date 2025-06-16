interface Window {
  state?: {
    soundEnabled: boolean;
  };
  SlotMachine?: new (uniqueId: string) => {
    init: () => void;
    animateSlots: (loadout: any, callback: () => void) => void;
  };
}
