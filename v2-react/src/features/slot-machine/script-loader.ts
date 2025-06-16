// Constants for script loading
const SCRIPT_SRC = '/slot-machine.js';
const CHECK_INTERVAL = 100;

// Check if SlotMachine class is available on window
export const isSlotMachineAvailable = (): boolean => {
  return typeof window !== 'undefined' && 'SlotMachine' in window;
};

// Load the slot machine script
export const loadSlotMachineScript = (onLoad: () => void): void => {
  // Check if SlotMachine class already exists
  if (isSlotMachineAvailable()) {
    onLoad();
    return;
  }

  // Check if script is already loading/loaded
  const existingScript = document.querySelector(`script[src="${SCRIPT_SRC}"]`);
  if (existingScript) {
    // Wait for existing script to load
    const checkLoaded = () => {
      if (isSlotMachineAvailable()) {
        onLoad();
      } else {
        setTimeout(checkLoaded, CHECK_INTERVAL);
      }
    };
    checkLoaded();
    return;
  }

  // Load the slot machine script
  const script = document.createElement('script');
  script.src = SCRIPT_SRC;
  script.async = true;
  script.onload = () => {
    onLoad();
  };
  document.body.appendChild(script);
};

// Initialize slot machine instance
export const initializeSlotMachine = (containerId: string): any => {
  if (!isSlotMachineAvailable()) return null;

  const SlotMachineClass = window.SlotMachine;
  if (!SlotMachineClass) return null;
  const slotMachine = new SlotMachineClass(containerId);
  slotMachine.init();

  // Set global state for sound
  window.state = { soundEnabled: true };

  return slotMachine;
};