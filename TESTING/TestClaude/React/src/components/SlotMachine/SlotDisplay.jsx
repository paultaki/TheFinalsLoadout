import React, { useRef, useEffect, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Constants for loadout data
const LOADOUTS = {
  Light: {
    weapons: ["93R", "Dagger", "LH1", "M26 Matter", "Recurve Bow", "Sword", "V9S", "XP-54", "Throwing Knives"],
    specializations: ["Cloaking Device", "Evasive Dash", "Grappling Hook"],
    gadgets: ["Breach Charge", "Gateway", "Glitch Grenade", "Gravity Vortex", "Sonar Grenade", "Stun Gun", 
              "Thermal Bore", "Thermal Vision", "Tracking Dart", "Vanishing Bomb", "Goo Grenade", "Pyro Grenade", 
              "Smoke Grenade", "Frag Grenade", "Flashbang"]
  },
  Medium: {
    weapons: ["AKM", "Cerberus 12GA", "Dual Blades", "FAMAS", "FCAR", "Model 1887", "Pike-556", "R.357", "Riot Shield"],
    specializations: ["Dematerializer", "Guardian Turret", "Healing Beam"],
    gadgets: ["APS Turret", "Data Reshaper", "Defibrillator", "Explosive Mine", "Gas Mine", "Glitch Trap", 
              "Jump Pad", "Zipline", "Gas Grenade", "Goo Grenade", "Pyro Grenade", "Smoke Grenade", 
              "Frag Grenade", "Flashbang", "Proximity Sensor"]
  },
  Heavy: {
    weapons: ["50 Akimbo", "Flamethrower", "KS-23", "Lewis Gun", "M60", "M32GL", "Sledgehammer", "SHAK-50", "Spear"],
    specializations: ["Charge N Slam", "Goo Gun", "Mesh Shield", "Winch Claw"],
    gadgets: ["Anti-Gravity Cube", "Barricade", "Dome Shield", "Lockbolt Launcher", "Pyro Mine", "Proximity Sensor", 
              "RPG-7", "Goo Grenade", "Pyro Grenade", "Smoke Grenade", "Frag Grenade", "Flashbang", 
              "Explosive Mine", "Gas Grenade"]
  }
};

const SlotColumn = React.memo(({ items, delay, isSpinning, onStop, columnIndex }) => {
  const columnRef = useRef(null);
  const animationRef = useRef(null);
  const [isStopped, setIsStopped] = React.useState(false);

  useEffect(() => {
    if (!isSpinning || !columnRef.current) return;

    let speed = 20;
    let startTime = performance.now();
    let currentOffset = 0;

    const animate = (currentTime) => {
      const elapsed = currentTime - startTime;
      
      // Gradually slow down near the end
      if (elapsed > delay - 500) {
        speed = Math.max(2, speed * 0.95);
      }

      currentOffset = (currentOffset + speed) % (188 * 8);
      columnRef.current.style.transform = `translate3d(0,${currentOffset}px,0)`;
      
      if (elapsed < delay) {
        animationRef.current = requestAnimationFrame(animate);
      } else {
        // Snap to final position with a bounce effect
        columnRef.current.style.transition = 'transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)';
        columnRef.current.style.transform = 'translate3d(0,188px,0)';
        setIsStopped(true);
        onStop(columnIndex);
      }
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isSpinning, delay, onStop, columnIndex]);

  return (
    <motion.div
      ref={columnRef}
      className={`relative w-36 h-48 overflow-hidden rounded-lg
                  ${isStopped ? 'shadow-2xl' : ''}`}
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: columnIndex * 0.1 }}
      style={{
        willChange: 'transform',
        backfaceVisibility: 'hidden',
        perspective: '1000px',
      }}
    >
      <div className="flex flex-col">
        {items.map((item, idx) => (
          <div
            key={idx}
            className={`h-48 w-36 flex flex-col items-center justify-center
                       bg-gradient-to-b from-gray-800 to-gray-900
                       ${idx === 4 ? 'winner' : ''}
                       ${isStopped && idx === 4 ? 'ring-2 ring-yellow-500 shadow-lg' : ''}
                       rounded-lg border border-yellow-500/20`}
          >
            <img
              src={`/images/${item.replace(/ /g, "_")}.webp`}
              alt={item}
              className="w-32 h-32 object-cover rounded"
              loading="lazy"
            />
            <p className="text-white mt-2 text-sm font-medium">{item}</p>
          </div>
        ))}
      </div>
    </motion.div>
  );
});

export const SlotDisplay = ({ selectedClass, selectedLoadout, isSpinning, onColumnStop }) => {
  if (!selectedLoadout) return null;

  const generateColumnItems = (type, winningItem) => {
    const pool = type === 'class' 
      ? [selectedLoadout.class]
      : LOADOUTS[selectedClass]?.[type] || [];
    
    return Array(8).fill(winningItem);
  };

  return (
    <AnimatePresence mode="wait">
      <div className="flex flex-wrap justify-center gap-4 p-4 overflow-x-auto">
        <SlotColumn
          items={generateColumnItems('class', selectedLoadout.class)}
          delay={500}
          isSpinning={isSpinning}
          onStop={onColumnStop}
          columnIndex={0}
        />
        <SlotColumn
          items={generateColumnItems('weapons', selectedLoadout.weapon)}
          delay={1200}
          isSpinning={isSpinning}
          onStop={onColumnStop}
          columnIndex={1}
        />
        <SlotColumn
          items={generateColumnItems('specializations', selectedLoadout.specialization)}
          delay={1900}
          isSpinning={isSpinning}
          onStop={onColumnStop}
          columnIndex={2}
        />
        {selectedLoadout.gadgets.map((gadget, index) => (
          <SlotColumn
            key={index}
            items={generateColumnItems('gadgets', gadget)}
            delay={2600 + (index * 700)}
            isSpinning={isSpinning}
            onStop={onColumnStop}
            columnIndex={3 + index}
          />
        ))}
      </div>
    </AnimatePresence>
  );
};
