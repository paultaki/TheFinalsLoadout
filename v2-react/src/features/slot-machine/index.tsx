import React, { useRef, useEffect, useState } from 'react';
import { useGameState } from '../../hooks/useGameState';
import { useLoadoutHistory } from '../../context/LoadoutHistoryContext';
import { SOUNDS } from '../../constants/sounds';
import type { ClassType } from '../../types';
import './SlotMachine.css';

interface Loadout {
  weapon: { name: string; category: 'weapon' };
  specialization: { name: string; category: 'specialization' };
  gadget1: { name: string; category: 'gadget' };
  gadget2: { name: string; category: 'gadget' };
  gadget3: { name: string; category: 'gadget' };
  classType: ClassType;
  weapons: string;
  specializations: string;
  gadgets: string[];
  spinsRemaining: number;
  allItems: {
    weapons: string[];
    specializations: string[];
    gadgets: string[];
  };
}

interface SlotMachineProps {
  images?: string[];
  onResult: (loadout: Loadout) => void;
  isFinalSpin: boolean;
}

const SlotMachine: React.FC<SlotMachineProps> = ({ onResult }) => {
  const state = useGameState();
  const { addLoadout } = useLoadoutHistory();
  const containerRef = useRef<HTMLDivElement>(null);
  const slotMachineRef = useRef<any>(null);
  const [isReady, setIsReady] = useState(false);
  const [isMachineInitialized, setIsMachineInitialized] = useState(false);

  // Load the slot machine script
  useEffect(() => {
    // Check if SlotMachine class already exists
    if ((window as any).SlotMachine) {
      setIsReady(true);
      return;
    }

    // Check if script is already loading/loaded
    const existingScript = document.querySelector('script[src="/slot-machine.js"]');
    if (existingScript) {
      // Wait for existing script to load
      const checkLoaded = () => {
        if ((window as any).SlotMachine) {
          setIsReady(true);
        } else {
          setTimeout(checkLoaded, 100);
        }
      };
      checkLoaded();
      return;
    }

    // Load the slot machine script
    const script = document.createElement('script');
    script.src = '/slot-machine.js';
    script.async = true;
    script.onload = () => {
      setIsReady(true);
    };
    document.body.appendChild(script);
  }, []);

  // Initialize the slot machine once script is loaded
  useEffect(() => {
    if (!isReady || !containerRef.current || slotMachineRef.current) return;

    const SlotMachineClass = (window as any).SlotMachine;
    if (!SlotMachineClass) return;

    // Create unique ID for this instance
    const uniqueId = `slot-machine-${Date.now()}`;
    containerRef.current.id = uniqueId;

    // Initialize slot machine
    slotMachineRef.current = new SlotMachineClass(uniqueId);
    slotMachineRef.current.init();

    // Set global state for sound
    (window as any).state = { soundEnabled: true };

    // Mark as initialized
    setIsMachineInitialized(true);
  }, [isReady]);

  // Auto-start animation when ready
  useEffect(() => {
    if (
      !isMachineInitialized ||
      !slotMachineRef.current ||
      !state.chosenClass ||
      state.spinsLeft === undefined ||
      state.spinsLeft <= 0
    )
      return;

    console.log('Starting slot machine animation', {
      initialized: isMachineInitialized,
      class: state.chosenClass,
      spins: state.spinsLeft,
    });

    // Small delay to ensure DOM is ready
    const timer = setTimeout(() => {
      const loadout = generateLoadout();

      // Start animation
      slotMachineRef.current.animateSlots(loadout, () => {
        console.log('Slot animation complete');

        // Only add to history on the final spin
        if (state.spinsLeft === 1) {
          // Delay history update to ensure animation is fully complete
          setTimeout(() => {
            // Add to loadout history
            addLoadout({
              timestamp: Date.now(),
              class: state.chosenClass as ClassType,
              weapon: loadout.weapon.name,
              gadget1: loadout.gadget1.name,
              gadget2: loadout.gadget2.name,
              gadget3: loadout.gadget3.name,
              specialization: loadout.specialization.name,
            });
          }, 2000); // Delay for final spin effects
        }

        onResult(loadout);
      });
    }, 100);

    return () => clearTimeout(timer);
  }, [isMachineInitialized, state.chosenClass, state.spinsLeft]); // Proper dependencies

  const generateLoadout = (): Loadout => {
    const classType = state.chosenClass as ClassType;
    const spinsRemaining = Math.max(0, state.spinsLeft - 1);

    // Mock data - replace with actual game data
    const classData = {
      Light: {
        weapons: ['XP-54', 'M11', 'SH1900', 'SR-84', 'V9S'],
        specializations: ['Cloaking_Device', 'Evasive_Dash', 'Grappling_Hook'],
        gadgets: [
          'Flashbang',
          'Smoke_Grenade',
          'Breach_Charge',
          'Thermal_Bore',
          'Glitch_Grenade',
          'Vanishing_Bomb',
        ],
      },
      Medium: {
        weapons: ['AKM', 'R.357', 'Model_1887', 'FCAR', 'CL-40'],
        specializations: ['Guardian_Turret', 'Healing_Beam', 'APS_Turret'],
        gadgets: [
          'Gas_Mine',
          'Defibrillator',
          'Jump_Pad',
          'Zipline',
          'Glitch_Trap',
          'Data_Reshaper',
        ],
      },
      Heavy: {
        weapons: ['Lewis_Gun', 'M60', 'SA_1216', 'Flamethrower', 'KS-23'],
        specializations: ['Goo_Gun', 'Mesh_Shield', 'Charge_N_Slam'],
        gadgets: [
          'RPG-7',
          'C4',
          'Dome_Shield',
          'Barricade',
          'Pyro_Mine',
          'Anti-Gravity_Cube',
          'Goo_Grenade',
        ],
      },
    };

    const data = classData[classType];

    // Pick random items
    const weapon = data.weapons[Math.floor(Math.random() * data.weapons.length)];
    const spec = data.specializations[Math.floor(Math.random() * data.specializations.length)];
    const gadgets: string[] = [];

    // Pick 3 unique gadgets
    while (gadgets.length < 3) {
      const gadget = data.gadgets[Math.floor(Math.random() * data.gadgets.length)];
      if (!gadgets.includes(gadget)) {
        gadgets.push(gadget);
      }
    }

    // Create loadout object
    return {
      weapon: { name: weapon, category: 'weapon' as const },
      specialization: { name: spec, category: 'specialization' as const },
      gadget1: { name: gadgets[0], category: 'gadget' as const },
      gadget2: { name: gadgets[1], category: 'gadget' as const },
      gadget3: { name: gadgets[2], category: 'gadget' as const },
      classType,
      weapons: weapon,
      specializations: spec,
      gadgets,
      spinsRemaining,
      allItems: {
        weapons: data.weapons,
        specializations: data.specializations,
        gadgets: data.gadgets,
      },
    };
  };

  return (
    <>
      {/* Audio Elements */}
      <audio id="clickSound" src={SOUNDS.click} preload="auto" />
      <audio id="tickSound" src={SOUNDS.click} preload="auto" />
      <audio id="classWinSound" src={SOUNDS.chang} preload="auto" />
      <audio id="spinWinSound" src={SOUNDS.tabbyTune} preload="auto" />
      <audio id="spinningSound" src={SOUNDS.spinning} preload="auto" />
      <audio id="transitionSound" src={SOUNDS.transition} preload="auto" />
      <audio id="finalSound" src="/sounds/pop-pour-perform.mp3" preload="auto" />
      <audio id="spinStart" src={SOUNDS.spinStart} preload="auto" />
      <audio id="columnStop" src={SOUNDS.click} preload="auto" />
      <audio id="finalLock" src="/sounds/pop-pour-perform.mp3" preload="auto" />

      {/* Slot Machine Container */}
      <div className="slot-machine-component" ref={containerRef}>
        {/* Slot machine will be rendered here by the JS */}
      </div>
    </>
  );
};

export default SlotMachine;
