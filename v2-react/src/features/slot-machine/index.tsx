import React, { useRef, useEffect, useState } from 'react';
import { useGameState } from '../../hooks/useGameState';
import { useLoadoutHistory } from '../../context/LoadoutHistoryContext';
import { SOUNDS } from '../../constants/sounds';
import { UI_CONSTANTS } from '../../constants/ui';
import type { ClassType } from '../../types';
import { generateLoadout, GeneratedLoadout } from './loadout-generator';
import { loadSlotMachineScript, initializeSlotMachine } from './script-loader';
import './SlotMachine.css';

interface SlotMachineClass {
  init: () => void;
  animateSlots: (loadout: GeneratedLoadout, callback: () => void) => void;
}

interface SlotMachineProps {
  images?: string[];
  onResult: (loadout: GeneratedLoadout) => void;
  isFinalSpin: boolean;
}

const SlotMachine: React.FC<SlotMachineProps> = ({ onResult }) => {
  const state = useGameState();
  const { addLoadout } = useLoadoutHistory();
  const containerRef = useRef<HTMLDivElement>(null);
  const slotMachineRef = useRef<SlotMachineClass | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [isMachineInitialized, setIsMachineInitialized] = useState(false);

  // Load the slot machine script
  useEffect(() => {
    loadSlotMachineScript(() => setIsReady(true));
  }, []);

  // Initialize the slot machine once script is loaded
  useEffect(() => {
    if (!isReady || !containerRef.current || slotMachineRef.current) return;

    // Create unique ID for this instance
    const uniqueId = `slot-machine-${Date.now()}`;
    containerRef.current.id = uniqueId;

    // Initialize slot machine
    slotMachineRef.current = initializeSlotMachine(uniqueId);
    if (slotMachineRef.current) {
      setIsMachineInitialized(true);
    }
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


    // Small delay to ensure DOM is ready
    const startDelay = 100;
    const timer = setTimeout(() => {
      const loadout = generateLoadout(state.chosenClass as ClassType, state.spinsLeft);

      // Start animation
      slotMachineRef.current.animateSlots(loadout, () => {
        // Only add to history on the final spin
        if (state.spinsLeft === 1) {
          // Delay history update to ensure animation is fully complete
          const historyDelay = 2000;
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
          }, historyDelay);
        }

        onResult(loadout);
      });
    }, startDelay);

    return () => clearTimeout(timer);
  }, [isMachineInitialized, state.chosenClass, state.spinsLeft]); // Proper dependencies


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
