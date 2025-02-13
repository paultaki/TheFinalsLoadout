import { create } from 'zustand';
import { persist } from 'zustand/middleware';

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

export const useLoadoutStore = create(
  persist(
    (set, get) => ({
      theme: 'dark',
      selectedClass: null,
      isSpinning: false,
      currentSpin: 1,
      totalSpins: 0,
      selectedLoadout: null,
      stoppedColumns: new Set(),
      gadgetQueue: {
        Light: [],
        Medium: [],
        Heavy: []
      },
      currentGadgetPool: new Set(),
      
      // Actions
      setTheme: (theme) => set({ theme }),
      
      selectClass: (classType) => {
        if (get().isSpinning) return;
        set({ 
          selectedClass: classType,
          selectedLoadout: null
        });
      },
      
      startSpin: (spins) => {
        if (get().isSpinning) return;
        set({
          isSpinning: true,
          stoppedColumns: new Set(),
          totalSpins: spins,
          currentSpin: spins
        });
      },
      
      stopColumn: (columnIndex) => {
        const state = get();
        const newStoppedColumns = new Set(state.stoppedColumns);
        newStoppedColumns.add(columnIndex);
        
        set({ stoppedColumns: newStoppedColumns });
        
        // Check if all columns are stopped
        if (newStoppedColumns.size === 5) {
          const newLoadout = generateLoadout(state.selectedClass);
          set({
            isSpinning: false,
            currentSpin: Math.max(0, state.currentSpin - 1),
            selectedLoadout: newLoadout
          });
        }
      },
      
      reset: () => set({
        selectedClass: null,
        isSpinning: false,
        currentSpin: 1,
        totalSpins: 0,
        selectedLoadout: null,
        stoppedColumns: new Set()
      }),
      
      // Helper functions available to components
      getLoadoutData: () => LOADOUTS,
      
      generateNewLoadout: () => {
        const state = get();
        if (!state.selectedClass) return null;
        return generateLoadout(state.selectedClass);
      }
    }),
    {
      name: 'loadout-storage',
      partialize: (state) => ({ theme: state.theme })
    }
  )
);

// Helper function to generate a loadout
function generateLoadout(classType) {
  if (!classType || !LOADOUTS[classType]) return null;
  
  const loadout = LOADOUTS[classType];
  return {
    class: classType,
    weapon: getRandomItem(loadout.weapons),
    specialization: getRandomItem(loadout.specializations),
    gadgets: getUniqueItems(loadout.gadgets, 3)
  };
}

function getRandomItem(array) {
  return array[Math.floor(Math.random() * array.length)];
}

function getUniqueItems(array, count) {
  const shuffled = [...array].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}