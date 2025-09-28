let state = {
  isSpinning: false,
  selectedGadgets: new Set(),
  gadgetQueue: [],
  currentGadgetPool: new Set(),
  handicap: null, // Legacy - now using window.state.selectedHandicap from roulette
  selectedClass: null, // Add this property
  soundEnabled: true,
  isMobile: window.innerWidth <= 768,
  selectedHandicap: null,
  selectedHandicapDesc: null,
  totalSpins: null,
  handicapStack: [], // Array to store all active handicaps
  sufferingLevel: 0 // Counter for number of active handicaps
};

// Make state available globally for roulette system
window.state = state;
document.addEventListener("DOMContentLoaded", () => {
  console.log("✅ DOM fully loaded for Rage Quit Simulator");

  loadHistory(); // Load saved history when page loads
  addGPUHints(); // Add GPU performance hints

  // 🔥 Clear Loadout History
  document.getElementById("clear-history")?.addEventListener("click", () => {
    localStorage.removeItem("rageQuitHistory");
    document.getElementById("history-list").innerHTML = "";
    console.log("🗑️ Rage Quit history cleared.");
  });

  // 🔥 Dark Mode Toggle Logic
  const darkModeToggle = document.getElementById("darkModeToggle");
  if (darkModeToggle) {
    if (localStorage.getItem("darkMode") === "enabled") {
      document.body.classList.add("dark-mode");
    }

    darkModeToggle.addEventListener("click", () => {
      document.body.classList.toggle("dark-mode");

      if (document.body.classList.contains("dark-mode")) {
        localStorage.setItem("darkMode", "enabled");
      } else {
        localStorage.removeItem("darkMode");
      }
    });
  }

  // Initialize the rage roulette animation system
  let rageRouletteSystem = null;
  
  // Wait a bit for scripts to load if needed
  const initializeRouletteSystem = () => {
    try {
      if (window.RageRouletteAnimationSystem) {
        rageRouletteSystem = new window.RageRouletteAnimationSystem();
        window.rageRouletteSystem = rageRouletteSystem;
        console.log("✅ RageRouletteAnimationSystem initialized successfully");
        return true;
      } else {
        console.warn("⚠️ RageRouletteAnimationSystem not found yet");
        return false;
      }
    } catch (e) {
      console.error("❌ Failed to initialize RageRouletteAnimationSystem:", e);
      return false;
    }
  };
  
  // Function to wait for animation system with retries
  const waitForAnimationSystem = async () => {
    let attempts = 0;
    const maxAttempts = 10;
    
    while (attempts < maxAttempts) {
      if (initializeRouletteSystem()) {
        return true;
      }
      await new Promise(resolve => setTimeout(resolve, 100));
      attempts++;
    }
    
    console.error("❌ RageRouletteAnimationSystem could not be loaded after " + maxAttempts + " attempts");
    return false;
  };
  
  // Initialize with async wait
  waitForAnimationSystem();
  
  // Initialize sound toggle
  initializeRageSoundToggle();
  
  // Skip adding duplicate handler since loadout-app.js already handles the button
  // The loadout-app.js file has the primary handler with proper initialization

  // Just ensure animation system is available globally
  if (false) { // Disabled to prevent duplicate handlers
    // Original handler code kept for reference
    document
      .getElementById("rage-quit-btn")
      ?.addEventListener("click", async function () {
      if (state.isSpinning || (rageRouletteSystem && rageRouletteSystem.animating)) return;

      // Play click sound (if file is valid)
      const clickSound = document.getElementById("clickSound");
      if (clickSound && clickSound.readyState >= 2) {
        clickSound.currentTime = 0;
        clickSound
          .play()
          .catch((err) => console.warn("Error playing sound:", err));
      }

      // Add spinning animation to button
      this.classList.add('spinning');
      
      // Ensure animation system is ready
      if (!rageRouletteSystem || !window.rageRouletteSystem) {
        console.log("⏳ Waiting for animation system to initialize...");
        await waitForAnimationSystem();
      }
      
      // Start the full roulette sequence if available, otherwise use fallback
      if (rageRouletteSystem && window.RageRouletteAnimationSystem) {
        console.log("🎬 Starting rage roulette animation sequence");
        try {
          await rageRouletteSystem.startFullSequence();
          console.log("✅ Rage roulette animation sequence completed");
        } catch (error) {
          console.error("❌ Rage roulette animation error:", error);
          // Fallback to direct spin
          if (window.spinRageQuitLoadout) {
            console.log("Using fallback spinRageQuitLoadout after error");
            window.spinRageQuitLoadout();
          }
        }
      } else if (window.spinRageQuitLoadout) {
        console.log("⚠️ Animation system not available, using fallback spinRageQuitLoadout");
        window.spinRageQuitLoadout();
      } else {
        console.error("No spin function available!");
      }
      
      // Remove spinning animation when done
      this.classList.remove('spinning');
    });
  } // End of disabled handler

  // 🔥 Copy Loadout Button
  document
    .getElementById("copyLoadoutButton")
    ?.addEventListener("click", () => {
      try {
        const itemContainers = document.querySelectorAll(
          ".slot-machine-wrapper .items-container .item-container"
        );

        if (!itemContainers || itemContainers.length === 0) {
          alert("Error: No items found to copy");
          return;
        }

        const selectedItems = Array.from(itemContainers).map((container) => {
          const scrollContainer = container.querySelector(".scroll-container");
          if (!scrollContainer) return "Unknown";

          const allItems = scrollContainer.querySelectorAll(".itemCol");
          const visibleItem = Array.from(allItems).find((item) => {
            const rect = item.getBoundingClientRect();
            const containerRect = container.getBoundingClientRect();
            return (
              rect.top >= containerRect.top &&
              rect.bottom <= containerRect.bottom &&
              rect.height > 0 &&
              rect.width > 0
            );
          });

          if (!visibleItem) return "Unknown";
          return visibleItem.querySelector("p")?.innerText.trim() || "Unknown";
        });

        // Get handicaps from the stack or fallback to single handicap
        let handicapText = "None";
        if (state.handicapStack && state.handicapStack.length > 0) {
          handicapText = state.handicapStack.map(h => `${h.name} (${h.description})`).join(', ');
        } else {
          handicapText = window.state?.selectedHandicap || 
            (document.querySelector(".handicap-result")?.textContent) || "None";
        }

        if (selectedItems.includes("Unknown") || selectedItems.length < 5) {
          alert(
            "Error: Not all items were properly selected. Please try again after the spin completes."
          );
          return;
        }

        // Get the actual class that was selected (or use random if not available)
        const selectedClass =
          state.selectedClass ||
          ["Light", "Medium", "Heavy"][Math.floor(Math.random() * 3)];

        // Fixed template string - using backticks instead of regular quotes
        const sufferingLevel = state.sufferingLevel > 0 ? `\nSuffering Level: ${state.sufferingLevel}x` : "";
        const copyText = `🔥 RAGE QUIT LOADOUT ${sufferingLevel ? '- STACKED HANDICAPS' : ''} 🔥
Class: ${selectedClass}
Weapon: ${selectedItems[0]}
Specialization: ${selectedItems[1]}
Gadget 1: ${selectedItems[2]}
Gadget 2: ${selectedItems[3]}
Gadget 3: ${selectedItems[4]}
Active Handicaps: ${handicapText}${sufferingLevel}

Generated by thefinalsloadout.com/ragequit/`;

        navigator.clipboard
          .writeText(copyText)
          .then(() => alert("Rage Quit Loadout copied to clipboard!"))
          .catch((err) => {
            console.error("Could not copy text:", err);
            alert("Failed to copy loadout to clipboard");
          });
      } catch (error) {
        console.error("Error in copy loadout handler:", error);
        alert("An error occurred while copying the loadout");
      }
    });
});
// Add GPU hints to columns on load for better performance
const addGPUHints = () => {
  const columns = document.querySelectorAll(".scroll-container");
  columns.forEach((column) => {
    column.style.willChange = "transform";
    column.style.backfaceVisibility = "hidden";
    column.style.perspective = "1000px";
    column.style.transform = "translate3d(0,0,0)";
  });
};

// Loadouts object is already defined in loadout-app.js
// Commenting out to avoid duplicate declaration error
// const rageQuitLoadouts = {
//   weapons: [
//     "Throwing Knives", // Light - Low damage, difficult to aim
//     "V9S", // Light - Low damage pistol
//     "XP-54", // Light - Challenging to use effectively
//     "Model 1887", // Medium - Slow reload, limited use
//     "R.357", // Medium - Slow rate of fire, hard to use in close quarters
//     "Riot Shield", // Medium - Limits mobility and offensive capability
//     "KS-23", // Heavy - Very slow reload
//     "Spear", // Heavy - Limited range and difficult to master
//   ],
//   specializations: [
//     "Cloaking Device", // Limited duration, situational
//     "Guardian Turret", // Stationary, can be easily destroyed
//     "Mesh Shield", // Blocks your own line of sight
//     "Winch Claw", // Very situational
//   ],
// //   gadgets: [
//     "Breach Charge", // Situational, can self-damage
//     "Thermal Bore", // Limited utility
//     "Vanishing Bomb", // Confusing to use effectively
//     "Glitch Trap", // Situational
//     "Jump Pad", // Very situational
//     "Zipline", // Limited use cases
//     "Anti-Gravity Cube", // Difficult to use properly
//     "Dome Shield", // Can trap yourself
//     "Lockbolt Launcher", // Hard to use effectively
//     "Flashbang", // Can blind yourself
//     "Data Reshaper", // Limited functionality
//     "Proximity Sensor", // Often doesn't help in fast-paced combat
// //   ],
// // 
// //   // Replace the handicaps array in your rageQuitLoadouts object with this expanded list
// // 
// //   handicaps: [
//     // Movement Handicaps
//     {
//       name: "Sloth Mode",
//       description: "No Sprinting – Must walk everywhere",
//       icon: "🦥",
//       category: "Movement",
//     },
//     {
//       name: "Bunny Hop Ban",
//       description: "No Jumping – Stairs and ramps only",
//       icon: "🐰",
//       category: "Movement",
//     },
//     {
//       name: "Permanent Crouch",
//       description: "You must stay crouched the entire game",
//       icon: "🧎",
//       category: "Movement",
//     },
//     {
//       name: "Opposite Day",
//       description: "Swap forward/backward and left/right",
//       icon: "🔄",
//       category: "Movement",
//     },
//     {
//       name: "Moonwalk Mode",
//       description: "Walk backward only",
//       icon: "🕴️",
//       category: "Movement",
//     },
//     {
//       name: "Controller Drift",
//       description: "Cannot stop moving unless using an ability",
//       icon: "🎮",
//       category: "Movement",
//     },
//     {
//       name: "Strafe Master",
//       description: "Never move forward - only sideways",
//       icon: "↔️",
//       category: "Movement",
//     },
//     {
//       name: "Zig Zag Only",
//       description: "Must constantly alternate left and right while moving",
//       icon: "⚡",
//       category: "Movement",
//     },
//     {
//       name: "Jump Addict",
//       description: "Must jump constantly while moving",
//       icon: "🏃",
//       category: "Movement",
//     },
//     {
//       name: "Scenic Route",
//       description: "Never take the direct path to objectives",
//       icon: "🗺️",
//       category: "Movement",
//     },
// 
//     // Aiming Handicaps
//     {
//       name: "No Scope Challenge",
//       description: "Unmap the ADS button; hipfire only",
//       icon: "🎯",
//       category: "Aiming",
//     },
//     {
//       name: "Flip 'n' Rage",
//       description: "Swap up/down and left/right for aiming",
//       icon: "🔃",
//       category: "Aiming",
//     },
//     {
//       name: "Squirrel Mode",
//       description: "Max out your mouse DPI/sensitivity",
//       icon: "🐿️",
//       category: "Aiming",
//     },
//     {
//       name: "Snail Aim",
//       description: "Set mouse/controller sensitivity to the lowest value",
//       icon: "🐌",
//       category: "Aiming",
//     },
//     {
//       name: "Tunnel Vision",
//       description: "Use only 50% of your normal FOV",
//       icon: "👁️",
//       category: "Aiming",
//     },
//     {
//       name: "Acrobat",
//       description: "You can only shoot while jumping or crouched",
//       icon: "🤸",
//       category: "Aiming",
//     },
//     {
//       name: "Reload Addict",
//       description: "Must reload after every kill or every 3 shots",
//       icon: "🔄",
//       category: "Aiming",
//     },
//     {
//       name: "Quick Draw",
//       description: "No aiming down sights for more than 2 seconds",
//       icon: "⏱️",
//       category: "Aiming",
//     },
// 
//     // Audio Handicaps
//     {
//       name: "Mute All",
//       description: "Play with no game sounds",
//       icon: "🔇",
//       category: "Audio",
//     },
//     {
//       name: "Music Only",
//       description: "Turn off all sound effects, keep only music",
//       icon: "🎵",
//       category: "Audio",
//     },
//     {
//       name: "Static Earrape",
//       description: "Set voice chat volume to maximum",
//       icon: "📢",
//       category: "Audio",
//     },
// 
//     // Communication Handicaps
//     {
//       name: "Chat Roulette",
//       description: "Must type every action in team chat",
//       icon: "💬",
//       category: "Communication",
//     },
//     {
//       name: "Commentator",
//       description: "Must narrate everything you do on voice chat",
//       icon: "🎙️",
//       category: "Communication",
//     },
//     {
//       name: "Radio Silence",
//       description: "No communication with teammates",
//       icon: "🤐",
//       category: "Communication",
//     },
// 
//     {
//       name: "Sing It",
//       description: "Must sing your callouts instead of speaking them",
//       icon: "🎤",
//       category: "Communication",
//     },
// 
//     // Gameplay Handicaps
//     {
//       name: "Pacifist Run",
//       description: "Can only engage enemies after teammates do",
//       icon: "☮️",
//       category: "Gameplay",
//     },
//     {
//       name: "Kamikaze",
//       description: "You must rush and melee every enemy you see",
//       icon: "💥",
//       category: "Gameplay",
//     },
// 
//     {
//       name: "Collector",
//       description: "Must pick up every item you see",
//       icon: "🧲",
//       category: "Gameplay",
//     },
//     {
//       name: "No Healing",
//       description: "Cannot use healing items or abilities",
//       icon: "❤️‍🩹",
//       category: "Gameplay",
//     },
//     {
//       name: "Lone Wolf",
//       description: "Must stay at least 50m away from teammates",
//       icon: "🐺",
//       category: "Gameplay",
//     },
//     {
//       name: "Shadow",
//       description: "Must follow exactly 10m behind a teammate",
//       icon: "👥",
//       category: "Gameplay",
//     },
//     {
//       name: "Half Magazine",
//       description: "Can only use half of each magazine before reloading",
//       icon: "🔫",
//       category: "Gameplay",
//     },
//     {
//       name: "Countdown",
//       description: "Can only stay in one spot for 5 seconds max",
//       icon: "⏲️",
//       category: "Gameplay",
//     },
// 
//     // Visual Handicaps
//     {
//       name: "Low Resolution",
//       description: "Set your resolution to 800x600",
//       icon: "📉",
//       category: "Visual",
//     },
//     {
//       name: "Dark Mode Extreme",
//       description: "Turn brightness to minimum",
//       icon: "🌚",
//       category: "Visual",
//     },
//     {
//       name: "Colorblind Simulation",
//       description: "Enable colorblind mode even if you're not colorblind",
//       icon: "🌈",
//       category: "Visual",
//     },
//     {
//       name: "HUD Free",
//       description: "Disable all HUD elements",
//       icon: "🚫",
//       category: "Visual",
//     },
//     {
//       name: "Motion Blur",
//       description: "Max out motion blur settings",
//       icon: "💫",
//       category: "Visual",
//     },
// 
//     // Challenge Handicaps
//     {
//       name: "Melee Only",
//       description: "Can only use melee attacks",
//       icon: "🔪",
//       category: "Challenge",
//     },
//     {
//       name: "No Gadgets",
//       description: "Cannot use any gadgets or abilities",
//       icon: "🛠️",
//       category: "Challenge",
//     },
//     {
//       name: "Grenade Spam",
//       description: "Must throw all grenades immediately when available",
//       icon: "💣",
//       category: "Challenge",
//     },
// 
//     {
//       name: "Exposed",
//       description: "Never take cover during firefights",
//       icon: "🎯",
//       category: "Challenge",
//     },
//     {
//       name: "YOLO",
//       description: "If you die, you must quit the match",
//       icon: "💀",
//       category: "Challenge",
//     },
//     {
//       name: "Distracted Gamer",
//       description: "Must watch a video on your phone while playing",
//       icon: "📱",
//       category: "Challenge",
//     },
//     {
//       name: "Bravado",
//       description: "Must emote after every kill",
//       icon: "💃",
//       category: "Challenge",
//     },
//     {
//       name: "The Floor is Lava",
//       description: "Stay off the ground as much as possible",
//       icon: "🌋",
//       category: "Challenge",
//     },
// //   ],
// // };

// Helper functions
// getRandomUniqueItems is already defined in loadout-app.js
// const getRandomUniqueItems = (array, n) => {
//   const shuffled = [...array].sort(() => Math.random() - 0.5);
//   return shuffled.slice(0, n);
// };

// createItemContainer is already defined in loadout-app.js
// function createItemContainer(items, winningItem = null, isGadget = false) {
//   if (isGadget) {
//     return items
//       .map(
//         (item, index) => `
//         <div class="itemCol ${index === 4 ? "winner" : ""}">
//           <img src="../images/${item.replace(
//             / /g,
//             "_"
//           )}.webp" alt="${item}" onerror="this.src='../images/placeholder.webp'">
//           <p>${item}</p>
//         </div>
//       `
//       )
//       .join("");
//   }
// 
//   winningItem = winningItem || items[Math.floor(Math.random() * items.length)];
//   let repeatedItems = items
//     .filter((item) => item !== winningItem)
//     .sort(() => Math.random() - 0.5)
//     .slice(0, 7);
// 
//   repeatedItems = [
//     ...repeatedItems.slice(0, 4),
//     winningItem,
//     ...repeatedItems.slice(4),
//   ];
// 
//   while (repeatedItems.length < 8) {
//     const randomItem = items[Math.floor(Math.random() * items.length)];
//     repeatedItems.push(randomItem);
//   }
// 
//   return repeatedItems
//     .map(
//       (item, index) => `
//       <div class="itemCol ${index === 4 ? "winner" : ""}">
//         <img src="../images/${item.replace(
//           / /g,
//           "_"
//         )}.webp" alt="${item}" onerror="this.src='../images/placeholder.webp'">
//         <p>${item}</p>
//       </div>
//     `
//     )
//     .join("");
// }

// displayRageQuitLoadout is already defined in loadout-app.js
// // const displayRageQuitLoadout = () => {
//   const outputDiv = document.getElementById("output");
//   const classes = ["Light", "Medium", "Heavy"];
//   const selectedClass = classes[Math.floor(Math.random() * classes.length)];
// 
//   // ✅ Store the selected class in state for later use
//   state.selectedClass = selectedClass;
// 
//   // ✅ Update the selected class text in the UI
//   const selectedClassElement = document.getElementById("selected-class");
//   if (selectedClassElement) {
//     selectedClassElement.innerText = selectedClass;
//   } else {
//     console.warn("⚠️ Warning: #selected-class not found in the DOM!");
//   }
// 
//   // ✅ Ensure weapons, specializations, and gadgets match the selected class
//   const classSpecificLoadouts = {
//     Light: {
//       weapons: ["Throwing Knives", "Recurve Bow", "SR-84", "Dagger"],
//       specializations: ["Cloaking Device"],
//       gadgets: [
//         "Breach Charge",
//         "Glitch Grenade",
//         "Gravity Vortex",
//         "Tracking Dart",
//         "Flashbang",
//         "Thermal Bore",
//       ],
//     },
//     Medium: {
//       weapons: [
//         "Model 1887",
//         "R.357",
//         "Dual Blades",
//         "Pike-556",
//         "Riot Shield",
//       ],
//       specializations: ["Guardian Turret"],
//       gadgets: [
//         "APS Turret",
//         "Data Reshaper",
//         "Smoke Grenade",
//         "Flashbang",
//         "Gas Mine",
//         "Glitch Trap",
//       ],
//     },
//     Heavy: {
//       weapons: ["KS-23", "Spear", "M60", "M32GL"],
//       specializations: ["Mesh Shield", "Goo Gun"],
//       gadgets: [
//         "Anti-Gravity Cube",
//         "C4",
//         "Goo Grenade",
//         "Lockbolt Launcher",
//         "Pyro Mine",
//         "Gas Grenade",
//         "Proximity Sensor",
//       ],
//     },
//   };
// 
//   // ✅ Select the correct items based on the chosen class
//   const selectedWeapon = getRandomUniqueItems(
//     classSpecificLoadouts[selectedClass].weapons,
//     1
//   )[0];
//   const selectedSpec = getRandomUniqueItems(
//     classSpecificLoadouts[selectedClass].specializations,
//     1
//   )[0];
// 
//   // ✅ Pick 3 unique gadgets using the **working method**
//   const allGadgets = [...classSpecificLoadouts[selectedClass].gadgets];
//   const gadgetChunks = [[], [], []];
//   const selectedGadgets = [];
// 
//   // Pick 3 unique gadgets for the loadout
//   for (let i = 0; i < 3; i++) {
//     const index = Math.floor(Math.random() * allGadgets.length);
//     selectedGadgets.push(allGadgets[index]);
//     allGadgets.splice(index, 1);
//   }
// 
//   // Shuffle the remaining gadgets for visual spin randomness
//   while (allGadgets.length > 0) {
//     for (let i = 0; i < 3 && allGadgets.length > 0; i++) {
//       const index = Math.floor(Math.random() * allGadgets.length);
//       gadgetChunks[i].push(allGadgets[index]);
//       allGadgets.splice(index, 1);
//     }
//   }
// 
//   // ✅ Store the final loadout BEFORE the spin animation starts
//   state.finalLoadout = {
//     classType: selectedClass,
//     weapon: selectedWeapon,
//     specialization: selectedSpec,
//     gadgets: selectedGadgets,
//   };
// 
//   // Function to create a randomized spin sequence for gadgets
//   const createGadgetSpinSequence = (winningGadget, chunkIndex) => {
//     const sequence = new Array(8);
//     sequence[4] = winningGadget;
// 
//     const chunk = gadgetChunks[chunkIndex];
//     for (let i = 0; i < 8; i++) {
//       if (i !== 4) {
//         const randomIndex = Math.floor(Math.random() * chunk.length);
//         sequence[i] = chunk[randomIndex];
//       }
//     }
//     return sequence;
//   };
// 
//   // ✅ Build the UI correctly
//   const loadoutHTML = `
//     <div class="slot-machine-wrapper">
//       <div class="items-container">
//         <div class="item-container">
//           <div class="scroll-container">
//             ${createItemContainer(
//               classSpecificLoadouts[selectedClass].weapons,
//               selectedWeapon
//             )}
//           </div>
//         </div>
//         <div class="item-container">
//           <div class="scroll-container">
//             ${createItemContainer(
//               classSpecificLoadouts[selectedClass].specializations,
//               selectedSpec
//             )}
//           </div>
//         </div>
//         ${selectedGadgets
//           .map(
//             (gadget, index) => `
//             <div class="item-container">
//               <div class="scroll-container" data-gadget-index="${index}">
//                 ${createItemContainer(
//                   createGadgetSpinSequence(gadget, index),
//                   gadget,
//                   true
//                 )}
//               </div>
//             </div>
//           `
//           )
//           .join("")}
//       </div>
//     </div>
//   `;
// 
//   outputDiv.innerHTML = loadoutHTML;
// 
//   setTimeout(() => {
//     const scrollContainers = Array.from(
//       document.querySelectorAll(".scroll-container")
//     );
//     startSpinAnimation(scrollContainers);
//   }, 50);
// };

// spinRageQuitLoadout is already defined in loadout-app.js
// const spinRageQuitLoadout = () => {
//   if (state.isSpinning) return;
// 
//   // Disable button during spin
//   const spinButton = document.getElementById("rage-quit-btn");
//   if (spinButton) {
//     spinButton.setAttribute("disabled", "true");
//     spinButton.classList.add('disabled');
//   }
// 
//   state.isSpinning = true;
//   state.currentGadgetPool.clear();
//   
//   // Clear previous handicap stack for new game (unless Double or Nothing in progress)
//   if (!document.getElementById('double-or-nothing-container')?.style.display || 
//       document.getElementById('double-or-nothing-container')?.style.display === 'none') {
//     state.handicapStack = [];
//     state.sufferingLevel = 0;
//   }
// 
//   // Display loadout and start spinning
//   displayRageQuitLoadout();
// };

// Make spinRageQuitLoadout available globally for the roulette system
// window.spinRageQuitLoadout = spinRageQuitLoadout; // Already defined in loadout-app.js

// Slightly modified physics constants for the Rage Quit Simulator
// PHYSICS is already defined in loadout-app.js
// const PHYSICS = {
//   ACCELERATION: 3000, // Slower acceleration for gradual build-up
//   MAX_VELOCITY: 3000, // Lower velocity for a controlled spin
//   DECELERATION: -1500, // Gradual slow down for suspense
//   BOUNCE_DAMPENING: 0.2, // Less bouncing to keep the focus on suspense
//   ITEM_HEIGHT: 188,
//   TIMING: {
//     COLUMN_DELAY: 1000, // Increased delay between stops for drama
//     BASE_DURATION: 4000, // Longer spin duration for suspense
//     DECELERATION_TIME: 1800, // Extended deceleration phase
//   },
// };

function finalVictoryFlash(columns) {
  setTimeout(() => {
    const allContainers = columns.map((col) => col.closest(".item-container"));
    const itemsContainer = document.querySelector(".items-container");

    allContainers.forEach((container, index) => {
      setTimeout(() => {
        container.classList.remove("mega-flash");
        void container.offsetWidth; // Force reflow
        container.classList.add("mega-flash");

        if (index === allContainers.length - 1) {
          setTimeout(() => {
            if (itemsContainer) {
            }
          }, 100);
        }
      }, index * 150);
    });
  }, 800);
}

// SlotColumn class is already defined in loadout-app.js
// class SlotColumn {
//   constructor(element, index) {
//     this.element = element;
//     this.index = index;
//     this.velocity = 0;
//     this.position = 0;
//     this.state = "waiting";
//     this.lastTimestamp = null;
//     this.animationStartTime = null;
//     this.maxAnimationDuration = 10000; // 10 second safety timeout
//     this.onStop = null; // Add this callback property
// 
//     this.stopDelay = PHYSICS.TIMING.COLUMN_DELAY * index;
//     this.totalDuration = PHYSICS.TIMING.BASE_DURATION + this.stopDelay;
//     this.decelerationTime = PHYSICS.TIMING.DECELERATION_TIME;
// 
//     this.targetPosition = 0;
//     this.initialPosition = 0;
//   }
// 
//   update(elapsed, deltaTime) {
//     // Safety check for runaway animations
//     if (!this.animationStartTime) {
//       this.animationStartTime = performance.now();
//     } else if (
//       performance.now() - this.animationStartTime >
//       this.maxAnimationDuration
//     ) {
//       console.warn("Animation timeout - forcing stop");
//       this.forceStop();
//       return;
//     }
// 
//     if (this.state === "stopped") return;
// 
//     // Ensure deltaTime is reasonable
//     const dt = Math.min(deltaTime, 50) / 1000; // Cap at 50ms, convert to seconds
// 
//     switch (this.state) {
//       case "accelerating":
//         this.velocity += PHYSICS.ACCELERATION * dt;
//         if (this.velocity >= PHYSICS.MAX_VELOCITY) {
//           this.velocity = PHYSICS.MAX_VELOCITY;
//           this.state = "spinning";
//         }
//         break;
// 
//       case "spinning":
//         if (elapsed >= this.totalDuration - this.decelerationTime) {
//           this.state = "decelerating";
//           // Ensure target position is aligned with item height
//           this.targetPosition =
//             Math.ceil(this.position / PHYSICS.ITEM_HEIGHT) *
//             PHYSICS.ITEM_HEIGHT;
//         }
//         break;
// 
//       case "decelerating":
//         this.velocity += PHYSICS.DECELERATION * dt;
// 
//         // Added safety check for deceleration
//         if (
//           Math.abs(this.position - this.targetPosition) < 1 &&
//           Math.abs(this.velocity) < 50
//         ) {
//           this.forceStop();
//           return;
//         }
// 
//         if (this.velocity <= 0) {
//           if (Math.abs(this.velocity) < 100) {
//             this.forceStop();
//           } else {
//             this.velocity = -this.velocity * PHYSICS.BOUNCE_DAMPENING;
//             this.state = "bouncing";
//           }
//         }
//         break;
// 
//       case "bouncing":
//         this.velocity += PHYSICS.DECELERATION * 1.2 * dt;
// 
//         // Enhanced bounce completion check
//         if (
//           Math.abs(this.velocity) < 50 ||
//           Math.abs(this.position - this.targetPosition) < 5
//         ) {
//           this.forceStop();
//           return;
//         }
//         break;
//     }
// 
//     // Update position with boundary checking
//     this.position += this.velocity * dt;
//     this.position = this.normalizePosition(this.position);
//     this.updateVisuals();
//   }
// 
//   normalizePosition(pos) {
//     const wrappedPosition = pos % PHYSICS.ITEM_HEIGHT;
//     return wrappedPosition >= 0
//       ? wrappedPosition
//       : wrappedPosition + PHYSICS.ITEM_HEIGHT;
//   }
// 
//   forceStop() {
//     this.velocity = 0;
//     this.position = this.targetPosition;
//     this.state = "stopped";
//     this.updateVisuals();
// 
//     // Call the onStop callback if it exists
//     if (this.onStop && typeof this.onStop === "function") {
//       this.onStop(this.element);
//     }
//   }
// 
//   updateVisuals() {
//     let blur = 0;
//     if (Math.abs(this.velocity) > 3000) blur = 12;
//     else if (Math.abs(this.velocity) > 2000) blur = 8;
//     else if (Math.abs(this.velocity) > 1000) blur = 5;
// 
//     this.element.style.transform = `translateY(${this.position}px)`;
//     this.element.style.filter = blur > 0 ? `blur(${blur}px)` : "none";
//   }
// }
function saveHistory() {
  // Save the entire history section HTML
  const historyList = document.getElementById("history-list");
  if (historyList) {
    localStorage.setItem("rageQuitHistoryHTML", historyList.innerHTML);
  }
}

// startSpinAnimation is already defined in loadout-app.js
// function startSpinAnimation(columns) {
//   const startTime = performance.now();
// 
//   const slotColumns = columns.map((element, index) => {
//     const column = new SlotColumn(element, index);
// 
//     // Add the onStop callback for flash effects
//     column.onStop = (columnElement) => {
//       const container = columnElement.closest(".item-container");
//       if (container) {
//         // Apply initial flash effect
//         container.classList.remove("final-flash"); // Ensure restart
//         void container.offsetWidth; // Force reflow
//         container.classList.add("final-flash");
// 
//         // Add locked in tag with animation
//         if (!container.querySelector(".locked-tag")) {
//           const lockedTag = document.createElement("div");
//           lockedTag.className = "locked-tag";
//           lockedTag.textContent = "LOCKED IN!";
//           container.appendChild(lockedTag);
// 
//           // Small delay for tag animation
//           setTimeout(() => {
//             lockedTag.classList.add("show");
//           }, 150);
//         }
// 
//         // Transition from flash to pulse effect
//         setTimeout(() => {
//           container.classList.remove("final-flash");
//           container.classList.add("winner-pulsate");
//         }, 500);
//       }
//     };
// 
//     return column;
//   });
// 
//   // Reset columns - remove all animations
//   columns.forEach((column) => {
//     const container = column.closest(".item-container");
//     if (container) {
//       container.classList.remove(
//         "landing-flash",
//         "winner-pulsate",
//         "final-flash"
//       );
// 
//       // Remove existing locked tag
//       const existingTag = container.querySelector(".locked-tag");
//       if (existingTag) {
//         existingTag.remove();
//       }
//     }
//     column.style.transform = "translateY(0)";
//     column.style.transition = "none";
//   });
// 
//   slotColumns.forEach((column) => (column.state = "accelerating"));
// 
//   function animate(currentTime) {
//     const elapsed = currentTime - startTime;
//     let isAnimating = false;
// 
//     slotColumns.forEach((column) => {
//       if (column.state !== "stopped") {
//         isAnimating = true;
//         const deltaTime = column.lastTimestamp
//           ? currentTime - column.lastTimestamp
//           : 16.67;
//         column.update(elapsed, deltaTime);
//         column.lastTimestamp = currentTime;
//       }
//     });
// 
//     if (isAnimating) {
//       requestAnimationFrame(animate);
//     } else {
//       // When all columns are stopped, trigger the victory flash and finalize spin
//       finalVictoryFlash(columns);
//       setTimeout(() => {
//         // Skip spinHandicap since handicap is now selected during roulette phase
//         finalizeSpin();
//       }, 1000);
//     }
//   }
// 
//   requestAnimationFrame(animate);
// }

// Final victory flash with enhanced effects for Rage Quit
// Duplicate function - commenting out the second occurrence
// function finalVictoryFlash(columns) {
//   // Wait for the last column to finish its individual animation
//   setTimeout(() => {
//     const allContainers = columns.map((col) => col.closest(".item-container"));
//     const itemsContainer = document.querySelector(".items-container");
// 
//     // FIRST WAVE: Rapid mega flashes
//     allContainers.forEach((container, index) => {
//       setTimeout(() => {
//         // Remove any existing animation to reset
//         container.classList.remove("mega-flash", "ultra-flash");
//         void container.offsetWidth; // Force reflow
// 
//         // Add the mega flash
//         container.classList.add("mega-flash");
//         
//         // Add rapid pulsing effect
//         container.style.animation = "rapidPulse 0.1s ease-in-out 3";
//       }, index * 100); // Much faster - 100ms between each instead of 550ms
//     });
// 
//     // SECOND WAVE: Ultra flash after mega flash
//     setTimeout(() => {
//       allContainers.forEach((container, index) => {
//         setTimeout(() => {
//           container.classList.add("ultra-flash");
//           
//           // Create explosive particle effect
//           createExplosiveParticles(container);
//         }, index * 50); // Even faster for second wave
//       });
//     }, 500);
// 
//     // FINAL EXPLOSION: All containers flash together
//     setTimeout(() => {
//       // Screen flash effect
//       createScreenFlash();
//       
//       // All containers flash simultaneously
//       allContainers.forEach((container) => {
//         container.style.animation = "explosiveFlash 0.3s ease-out, superPulse 0.2s ease-in-out 5";
//         container.style.boxShadow = "0 0 100px rgba(255, 215, 0, 1), 0 0 200px rgba(255, 140, 0, 0.8)";
//       });
//       
//       // Screen shake effect
//       document.body.style.animation = "victoryShake 0.5s ease-in-out";
//       setTimeout(() => {
//         document.body.style.animation = "";
//       }, 500);
//       
//     }, 1000);
// 
//     // CLEANUP: Remove all effects
//     setTimeout(() => {
//       allContainers.forEach((container) => {
//         container.style.animation = "";
//         container.classList.remove("mega-flash", "ultra-flash");
//       });
//     }, 2000);
// 
//   }, 400); // Start sooner - 400ms instead of 800ms
// }

// Create explosive particle effect
function createExplosiveParticles(container) {
  const rect = container.getBoundingClientRect();
  const centerX = rect.left + rect.width / 2;
  const centerY = rect.top + rect.height / 2;

  // Create 12 particles for explosive effect
  for (let i = 0; i < 12; i++) {
    const particle = document.createElement("div");
    particle.style.cssText = `
      position: fixed;
      width: 8px;
      height: 8px;
      background: linear-gradient(45deg, #ffb700, #ff7b00);
      border-radius: 50%;
      pointer-events: none;
      z-index: 1000;
      left: ${centerX}px;
      top: ${centerY}px;
      box-shadow: 0 0 10px rgba(255, 183, 0, 0.8);
    `;

    // Random direction and distance
    const angle = (Math.PI * 2 * i) / 12;
    const distance = 150 + Math.random() * 100;
    const targetX = centerX + Math.cos(angle) * distance;
    const targetY = centerY + Math.sin(angle) * distance;

    document.body.appendChild(particle);

    // Animate the particle
    particle.animate([
      {
        transform: 'translate(0, 0) scale(1)',
        opacity: 1
      },
      {
        transform: `translate(${targetX - centerX}px, ${targetY - centerY}px) scale(0)`,
        opacity: 0
      }
    ], {
      duration: 800,
      easing: 'ease-out'
    });

    // Remove particle
    setTimeout(() => {
      if (particle.parentNode) {
        particle.parentNode.removeChild(particle);
      }
    }, 800);
  }
}

// Create screen flash effect
function createScreenFlash() {
  const flashOverlay = document.createElement("div");
  flashOverlay.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background: radial-gradient(circle, rgba(255, 215, 0, 0.8) 0%, rgba(255, 140, 0, 0.4) 50%, transparent 100%);
    pointer-events: none;
    z-index: 9999;
  `;

  document.body.appendChild(flashOverlay);

  // Animate the flash
  flashOverlay.animate([
    { opacity: 0 },
    { opacity: 1 },
    { opacity: 0 }
  ], {
    duration: 400,
    easing: 'ease-out'
  });

  // Remove the overlay
  setTimeout(() => {
    if (flashOverlay.parentNode) {
      flashOverlay.parentNode.removeChild(flashOverlay);
    }
  }, 400);
}

// COMMENTED OUT: Old spinHandicap function - now using roulette-selected handicap
// The handicap is now selected during the roulette animation phase and stored in:
// - window.state.selectedHandicap (handicap name)
// - window.state.selectedHandicapDesc (handicap description)

// function spinHandicap() {
//   // This function is no longer used as handicaps are selected during roulette phase
//   console.log("spinHandicap called but handicap already selected during roulette");
//   finalizeSpin();
// }

// Display the roulette-selected handicap in the UI
function displaySelectedHandicap() {
  const handicapContainer = document.getElementById("handicap-container");
  
  if (!handicapContainer) {
    console.error("Handicap container not found");
    return;
  }

  // Initialize handicap stack if first handicap
  // Check both local state and window.state for handicap
  const selectedHandicap = state.selectedHandicap || window.state?.selectedHandicap;
  const selectedHandicapDesc = state.selectedHandicapDesc || window.state?.selectedHandicapDesc;
  
  if (state.handicapStack.length === 0 && selectedHandicap) {
    state.handicapStack.push({
      name: selectedHandicap,
      description: selectedHandicapDesc || "No description",
      icon: "💀"
    });
    state.sufferingLevel = 1;
    
    // Sync with local state
    state.selectedHandicap = selectedHandicap;
    state.selectedHandicapDesc = selectedHandicapDesc;
  }
  
  // Create the handicap stack display UI
  displayHandicapStack();
  
  // Scroll to show the handicap
  setTimeout(() => {
    handicapContainer.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });
  }, 500);
}

// New function to display handicap stack
function displayHandicapStack() {
  const handicapContainer = document.getElementById("handicap-container");
  
  if (!handicapContainer || state.handicapStack.length === 0) {
    // Show placeholder if no handicaps
    handicapContainer.innerHTML = `
      <div class="placeholder-handicap">
        <p>Incoming Handicap... Prepare to cry.</p>
      </div>
    `;
    return;
  }

  // Create the handicap stack UI
  const stackHTML = `
    <div class="handicap-stack-container handicap-glow">
      <div class="handicap-stack-header">
        <div class="handicap-title">ACTIVE PUNISHMENTS</div>
        <div class="suffering-level">SUFFERING LEVEL: ${state.sufferingLevel}x</div>
      </div>
      <div class="handicap-stack">
        ${state.handicapStack.map((handicap, index) => `
          <div class="handicap-stack-item" data-index="${index}">
            <div class="handicap-item-icon">${handicap.icon}</div>
            <div class="handicap-item-content">
              <div class="handicap-item-name">${handicap.name}</div>
              <div class="handicap-item-desc">${handicap.description}</div>
            </div>
            <div class="handicap-item-number">#${index + 1}</div>
          </div>
        `).join('')}
      </div>
      <div class="suffering-indicator">
        <span class="suffering-emoji">🔥</span>
        <span class="suffering-text">Maximum Rage Achieved!</span>
        <span class="suffering-emoji">🔥</span>
      </div>
    </div>
  `;

  handicapContainer.innerHTML = stackHTML;
  
  // Add flash animation to the container
  handicapContainer.classList.add('handicap-update-flash');
  setTimeout(() => {
    handicapContainer.classList.remove('handicap-update-flash');
  }, 600);
}
function addToHistory(
  classType,
  weapon,
  specialization,
  gadgets,
  handicapName,
  handicapDesc
) {
  const historyList = document.getElementById("history-list");
  if (!historyList) return;

  const newEntry = document.createElement("div");
  newEntry.classList.add("rage-history-entry");
  
  // Generate rage-specific loadout name
  const loadoutName = generateRageLoadoutName(classType, weapon, specialization);
  
  // Generate punishment level based on gear and handicap
  const punishmentLevel = calculatePunishmentLevel(weapon, specialization, gadgets, handicapName);
  
  // Generate random rage roast that references the handicap
  const rageRoast = generateRageRoast(weapon, specialization, gadgets, handicapName);
  
  // Determine if this is a "spicy" (extra bad) loadout
  const isSpicyLoadout = checkSpicyRageLoadout(weapon, specialization, gadgets, handicapName);
  if (isSpicyLoadout) {
    newEntry.classList.add("spicy-rage-loadout");
  }

  // Create the card structure - redesigned with text-only rage theme
  newEntry.innerHTML = `
    <div class="rage-history-card">
      <div class="rage-card-header">
        <div class="rage-class-indicator ${classType.toLowerCase()}">
          <span class="class-letter">${classType.charAt(0)}</span>
        </div>
        <div class="rage-card-title">
          <h3>${loadoutName}</h3>
          <span class="rage-timestamp">Just now</span>
        </div>
        <div class="punishment-level">
          <span class="level-number">${punishmentLevel}</span>
          <span class="level-label">PAIN</span>
        </div>
      </div>
      
      <div class="rage-card-body">
        <div class="loadout-row">
          <span class="item-label">WEAPON:</span>
          <span class="item-value">${weapon}</span>
        </div>
        <div class="loadout-row">
          <span class="item-label">SPECIALIZATION:</span>
          <span class="item-value">${specialization}</span>
        </div>
        <div class="loadout-row gadgets">
          <span class="item-label">GADGETS:</span>
          <span class="item-value">${gadgets.join(' • ')}</span>
        </div>
        
        ${state.handicapStack && state.handicapStack.length > 0 ? `
          <div class="handicap-row stacked">
            <span class="item-label">HANDICAPS (${state.sufferingLevel}x):</span>
            <span class="item-value">${state.handicapStack.map(h => h.name).join(' + ')}</span>
            <div class="handicap-description" style="color: rgba(255, 255, 255, 0.7); font-size: 0.9rem; font-style: italic; margin-top: 0.5rem;">
              ${state.handicapStack.map(h => `<span>${h.name}: ${h.description}</span>`).join(' | ')}
            </div>
          </div>
        ` : `
          <div class="handicap-row">
            <span class="item-label">HANDICAP:</span>
            <span class="item-value">${handicapName || "None"}</span>
            ${handicapDesc && handicapDesc !== "No handicap selected" ? `
              <div class="handicap-description" style="color: rgba(255, 255, 255, 0.7); font-size: 0.9rem; font-style: italic; margin-top: 0.5rem;">
                ${handicapDesc}
              </div>
            ` : ''}
          </div>
        `}
      </div>
      
      <div class="rage-roast-box">
        <p>${rageRoast}</p>
      </div>
      
      <div class="rage-card-footer">
        <button class="rage-copy-btn" onclick="copyRageLoadoutText(this)">
          COPY BUILD
        </button>
      </div>
    </div>
  `;

  historyList.prepend(newEntry);
  
  // Animate entry
  setTimeout(() => newEntry.classList.add('visible'), 10);

  // ✅ Ensure history does not exceed 5 entries
  while (historyList.children.length > 5) {
    historyList.removeChild(historyList.lastChild);
  }

  // Update timestamps
  updateRageTimestamps();

  // ✅ Save updated history to localStorage
  if (typeof saveHistory === "function") {
    saveHistory();
  } else {
    console.error("⚠️ Warning: saveHistory function is missing.");
  }
}

function loadHistory() {
  const historyList = document.getElementById("history-list");
  const savedEntries =
    JSON.parse(localStorage.getItem("rageQuitHistory")) || [];
  historyList.innerHTML = "";

  savedEntries.forEach((html) => {
    const newEntry = document.createElement("div");
    newEntry.classList.add("history-entry");
    newEntry.innerHTML = html;
    historyList.appendChild(newEntry);
  });
}

// Replace the finalizeSpin function in ragequit-app.js with this version:
// finalizeSpin is already defined in loadout-app.js
// function finalizeSpin() {
//   // ✅ Capture the selected items directly from the UI
//   const itemContainers = document.querySelectorAll(
//     ".slot-machine-wrapper .items-container .item-container"
//   );
// 
//   if (itemContainers.length < 5) {
//     console.error("⚠️ ERROR: Not enough items in slot machine.");
//     return;
//   }
// 
//   try {
//     // ✅ Extract the visible items from the UI
//     const selectedItems = Array.from(itemContainers).map((container) => {
//       const scrollContainer = container.querySelector(".scroll-container");
//       if (!scrollContainer) return "Unknown";
// 
//       const allItems = scrollContainer.querySelectorAll(".itemCol");
//       const visibleItem = Array.from(allItems).find((item) => {
//         const rect = item.getBoundingClientRect();
//         const containerRect = container.getBoundingClientRect();
//         return (
//           rect.top >= containerRect.top &&
//           rect.bottom <= containerRect.bottom &&
//           rect.height > 0 &&
//           rect.width > 0
//         );
//       });
// 
//       return visibleItem
//         ? visibleItem.querySelector("p").textContent.trim()
//         : "Unknown";
//     });
// 
//     // ✅ Ensure all selections are valid
//     if (selectedItems.includes("Unknown") || selectedItems.length < 5) {
//       console.error("⚠️ ERROR: Some selected items are missing.");
//       return;
//     }
// 
//     // ✅ Get the class and handicap (now from roulette selection)
//     const selectedClass = state.selectedClass || "Unknown";
//     let handicapName, handicapDesc;
//     
//     if (state.handicapStack && state.handicapStack.length > 0) {
//       // Use stacked handicaps
//       handicapName = state.handicapStack.map(h => h.name).join(', ');
//       handicapDesc = state.handicapStack.map(h => `${h.name}: ${h.description}`).join(' | ');
//     } else {
//       // Fallback to single handicap
//       handicapName = state.selectedHandicap || "None";
//       handicapDesc = state.selectedHandicapDesc || "No handicap selected";
//     }
// 
//     // ✅ Format data correctly
//     const weapon = selectedItems[0];
//     const specialization = selectedItems[1];
//     const gadgets = selectedItems.slice(2); // Keep as array for addToHistory
// 
//     // ✅ Add to history
//     addToHistory(
//       selectedClass,
//       weapon,
//       specialization,
//       gadgets,
//       handicapName,
//       handicapDesc
//     );
// 
//     // ✅ Display the selected handicap and re-enable button
//     displaySelectedHandicap();
//     
//     // Record this spin in history
//     recordSpinInHistory();
//     
//     setTimeout(() => {
//       // Add celebration animation before reset
//       triggerCelebrationAnimation();
//       
//       // Reset state and re-enable button
//       resetSpinState();
//       
//       // Show Double or Nothing option
//       showDoubleOrNothingOption();
//     }, 1000);
//   } catch (error) {
//     console.error("⚠️ ERROR: Something went wrong finalizing spin:", error);
//   }
// }

function copyLoadoutText(button) {
  const entry = button.closest(".history-entry");

  if (!entry) {
    console.error("Error: No history entry found.");
    return;
  }

  const text = Array.from(entry.querySelectorAll("p"))
    .map((p) => p.textContent)
    .join("\n");

  navigator.clipboard
    .writeText(text)
    .then(() => {
      button.textContent = "Copied!";
      setTimeout(() => {
        button.textContent = "Copy";
      }, 2000);
    })
    .catch((err) => {
      console.error("Could not copy text: ", err);
      alert("Failed to copy loadout to clipboard");
    });
}

// ============================================
// RAGE HISTORY HELPER FUNCTIONS
// ============================================

function generateRageLoadoutName(classType, weapon, specialization) {
  const rageNames = [
    `${classType} Nightmare`,
    `${weapon} of Suffering`,
    `Pain Train`,
    `Torment Build`,
    `Misery Configuration`,
    `Doom Setup`,
    `Agony Assault`,
    `Punishment Package`,
    `Suffering Simulator`,
    `Rage Inducer`
  ];
  return rageNames[Math.floor(Math.random() * rageNames.length)];
}

function calculatePunishmentLevel(weapon, specialization, gadgets, handicapName) {
  let level = 1;
  
  // Base punishment from weapon quality
  const badWeapons = ["93R", "CB-01 Repeater", "Throwing Knives"];
  const okWeapons = ["V9S", "Recurve Bow", "Dagger"];
  
  if (badWeapons.some(w => weapon.includes(w))) level += 3;
  else if (okWeapons.some(w => weapon.includes(w))) level += 2;
  else level += 1;
  
  // Punishment from gadgets
  const badGadgets = ["Tracking Dart", "Data Reshaper", "Anti-Gravity Cube"];
  gadgets.forEach(gadget => {
    if (badGadgets.some(g => gadget.includes(g))) level += 2;
    else level += 1;
  });
  
  // Extra punishment for handicap
  if (handicapName && handicapName !== "None") level += 3;
  
  // Cap at level 10
  return Math.min(level, 10);
}

function generateRageRoast(weapon, specialization, gadgets, handicapName) {
  const roasts = [
    `This loadout + ${handicapName || "no handicap"} = instant uninstall. -15/10`,
    `Even masochists think this is too much. -20/10`,
    `${weapon} with ${handicapName || "this setup"}? Your controller will quit before you do. -12/10`,
    `This combo makes bronze rank look like pro play. -18/10`,
    `${specialization} + ${handicapName || "this disaster"} = tutorial difficulty feels impossible. -25/10`,
    `Your enemies will feel bad for killing you with this setup. -14/10`,
    `This loadout broke the rage meter. -∞/10`,
    `${weapon}? More like ${handicapName || "pain generator"}. Time to delete the game. -16/10`,
    `This setup makes watching paint dry seem exciting. -22/10`,
    `Your teammates will report you for griefing yourself. -19/10`
  ];
  
  return roasts[Math.floor(Math.random() * roasts.length)];
}

function checkSpicyRageLoadout(weapon, specialization, gadgets, handicapName) {
  const badWeapons = ["93R", "CB-01 Repeater", "Throwing Knives"];
  const badGadgets = ["Tracking Dart", "Data Reshaper", "Anti-Gravity Cube"];
  
  const hasBadWeapon = badWeapons.some(w => weapon.includes(w));
  const hasBadGadgets = gadgets.some(g => badGadgets.some(bg => g.includes(bg)));
  const hasHandicap = handicapName && handicapName !== "None";
  
  return hasBadWeapon && hasBadGadgets && hasHandicap;
}

function updateRageTimestamps() {
  const timestamps = document.querySelectorAll('.rage-timestamp');
  timestamps.forEach(timestamp => {
    const now = new Date();
    const elapsed = Math.floor((now - new Date(timestamp.dataset.created || now)) / 1000);
    
    if (elapsed < 60) {
      timestamp.textContent = 'Just now';
    } else if (elapsed < 3600) {
      timestamp.textContent = `${Math.floor(elapsed / 60)}m ago`;
    } else {
      timestamp.textContent = `${Math.floor(elapsed / 3600)}h ago`;
    }
  });
}

// Update timestamps every minute
setInterval(updateRageTimestamps, 60000);

// ============================================
// RAGE CARD ACTION FUNCTIONS
// ============================================

function copyRageLoadoutText(button) {
  const entry = button.closest(".rage-history-entry");
  if (!entry) {
    console.error("Error: No rage history entry found.");
    return;
  }

  const classType = entry.querySelector('.rage-class-badge').textContent;
  const weapon = entry.querySelector('.weapon-item .item-name').textContent;
  const specialization = entry.querySelector('.spec-item .item-name').textContent;
  const gadgets = Array.from(entry.querySelectorAll('.gadget-item .item-name')).map(el => el.textContent);
  const handicap = entry.querySelector('.handicap-name').textContent;
  const handicapDesc = entry.querySelector('.rage-handicap-desc').textContent;
  const punishmentLevel = entry.querySelector('.punishment-text').textContent;

  const text = `🔥 THE FINALS RAGE LOADOUT 🔥
Class: ${classType}
Weapon: ${weapon}
Specialization: ${specialization}
Gadgets: ${gadgets.join(', ')}
${punishmentLevel}
Handicap: ${handicap} - ${handicapDesc}

Generated by thefinalsloadout.com/ragequit/`;

  navigator.clipboard.writeText(text)
    .then(() => {
      button.innerHTML = '<span>✅</span> COPIED!';
      setTimeout(() => {
        button.innerHTML = '<span>📋</span> COPY PUNISHMENT';
      }, 2000);
    })
    .catch((err) => {
      console.error("Could not copy text: ", err);
      alert("Failed to copy rage loadout to clipboard");
    });
}

function exportRageMemeCard(button) {
  // TODO: Implement rage meme card export functionality
  alert("Rage meme card export coming soon!");
}

function markAsSurvived(button) {
  const entry = button.closest(".rage-history-entry");
  if (!entry) return;
  
  // Add survived badge
  if (!entry.querySelector('.survived-badge')) {
    const survivedBadge = document.createElement('div');
    survivedBadge.className = 'survived-badge';
    survivedBadge.innerHTML = '<span>🏆</span> SURVIVED';
    entry.querySelector('.rage-loadout-header').appendChild(survivedBadge);
    
    // Update button
    button.innerHTML = '<span>✅</span> SURVIVED';
    button.disabled = true;
    button.classList.add('survived');
    
    // Add special glow effect
    entry.classList.add('survived-entry');
  }
}

// ============================================
// SOUND TOGGLE FUNCTIONALITY
// ============================================

function initializeRageSoundToggle() {
  const soundToggle = document.getElementById('rage-sound-toggle');
  if (!soundToggle) return;

  // Load saved sound preference
  const soundEnabled = localStorage.getItem('rageSoundEnabled') !== 'false';
  if (!soundEnabled) {
    soundToggle.classList.add('muted');
    toggleSoundIcons(soundToggle, false);
  }

  soundToggle.addEventListener('click', () => {
    const isMuted = soundToggle.classList.contains('muted');
    
    if (isMuted) {
      soundToggle.classList.remove('muted');
      localStorage.setItem('rageSoundEnabled', 'true');
      toggleSoundIcons(soundToggle, true);
    } else {
      soundToggle.classList.add('muted');
      localStorage.setItem('rageSoundEnabled', 'false');
      toggleSoundIcons(soundToggle, false);
      // Stop any currently playing sounds
      stopAllRageSounds();
    }
  });
}

function toggleSoundIcons(button, soundOn) {
  const soundOnIcon = button.querySelector('.sound-on');
  const soundOffIcon = button.querySelector('.sound-off');
  
  if (soundOn) {
    soundOnIcon.style.display = 'block';
    soundOffIcon.style.display = 'none';
  } else {
    soundOnIcon.style.display = 'none';
    soundOffIcon.style.display = 'block';
  }
}

function stopAllRageSounds() {
  const sounds = ['rageAlarmSound', 'rageBuzzerSound', 'rageLaughSound', 'rageBackgroundMusic'];
  sounds.forEach(soundId => {
    const audio = document.getElementById(soundId);
    if (audio) {
      audio.pause();
      audio.currentTime = 0;
    }
  });
}

// ============================================
// DOUBLE OR NOTHING FUNCTIONALITY
// ============================================

function initializeDoubleOrNothing() {
  const doubleBtn = document.getElementById('double-or-nothing-btn');
  if (!doubleBtn) return;

  doubleBtn.addEventListener('click', () => {
    // Play Russian roulette sound effect
    playDoubleOrNothingSound();
    
    // Add loading state
    doubleBtn.disabled = true;
    doubleBtn.textContent = '💀 SPINNING THE WHEEL... 💀';
    
    // Generate additional handicap after delay
    setTimeout(() => {
      const additionalHandicaps = [
        { name: "Single Finger", description: "Can only use one finger to play", icon: "🖕" },
        { name: "Eyes Closed", description: "Must play with eyes closed for 30 seconds", icon: "🙈" },
        { name: "Wrong Hand", description: "Must use non-dominant hand", icon: "🤚" },
        { name: "Backwards", description: "Must face away from screen", icon: "🔄" },
        { name: "Standing Up", description: "Cannot sit while playing", icon: "🧑‍🎤" },
        { name: "No Sound", description: "Must play with all audio muted", icon: "🔇" },
        { name: "Upside Down", description: "Turn your screen upside down", icon: "🙃" },
        { name: "Mouse Only", description: "Cannot use keyboard at all", icon: "🖱️" },
        { name: "One Eye", description: "Must cover one eye while playing", icon: "👁️" },
        { name: "Narrate Everything", description: "Must speak every action out loud", icon: "🎤" }
      ];
      
      // Ensure we don't get duplicate handicaps
      const availableHandicaps = additionalHandicaps.filter(h => 
        !state.handicapStack.some(existing => existing.name === h.name)
      );
      
      if (availableHandicaps.length === 0) {
        // All handicaps already applied
        showMaxSufferingReached();
        doubleBtn.disabled = false;
        doubleBtn.textContent = '💀 Double or Nothing 💀';
        return;
      }
      
      const newHandicap = availableHandicaps[Math.floor(Math.random() * availableHandicaps.length)];
      
      // Add to handicap stack
      addHandicapToStack(newHandicap);
      
      // Show dramatic reveal
      showDoubleOrNothingResult(newHandicap);
      
      // Update rage meter
      updateRageMeterForDoubleOrNothing();
      
      // Update loadout history with new handicap
      updateLatestHistoryWithNewHandicap(newHandicap);
      
      // Keep button visible for more suffering
      setTimeout(() => {
        doubleBtn.disabled = false;
        doubleBtn.textContent = '💀 Double or Nothing 💀';
        
        // Update button text based on suffering level
        if (state.sufferingLevel >= 3) {
          doubleBtn.textContent = '💀 MAXIMUM SUFFERING 💀';
        }
      }, 3000);
    }, 2000);
  });
}

function playDoubleOrNothingSound() {
  const soundToggle = document.getElementById('rage-sound-toggle');
  if (soundToggle?.classList.contains('muted')) return;
  
  // Use the metal clank as Russian roulette sound
  const audio = document.getElementById('rageBuzzerSound');
  if (audio) {
    audio.volume = 0.8;
    audio.currentTime = 0;
    audio.play().catch(e => console.log("Could not play double or nothing sound"));
  }
}

function showDoubleOrNothingResult(handicap) {
  // Create dramatic popup
  const popup = document.createElement('div');
  popup.className = 'double-or-nothing-result';
  popup.innerHTML = `
    <div class="double-result-content">
      <h2>💀 ADDITIONAL HANDICAP! 💀</h2>
      <div class="new-handicap-icon">${handicap.icon}</div>
      <div class="new-handicap-name">${handicap.name}</div>
      <div class="new-handicap-desc">${handicap.description}</div>
      <div class="suffering-level-update">SUFFERING LEVEL: ${state.sufferingLevel}x</div>
      <button onclick="this.parentElement.parentElement.remove()">ACCEPT FATE</button>
    </div>
  `;
  
  document.body.appendChild(popup);
  
  // Add CSS for the popup
  const style = document.createElement('style');
  style.textContent = `
    .double-or-nothing-result {
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background: rgba(0, 0, 0, 0.9);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 2000;
      animation: doubleResultFadeIn 0.5s ease;
    }
    
    .double-result-content {
      background: linear-gradient(145deg, #8b0000, #660000);
      border: 3px solid #ff4444;
      border-radius: 20px;
      padding: 40px;
      text-align: center;
      max-width: 500px;
      animation: doubleResultShake 0.5s ease;
    }
    
    .double-result-content h2 {
      color: #ff4444;
      font-size: 2rem;
      margin-bottom: 20px;
      text-shadow: 0 0 15px rgba(255, 68, 68, 0.8);
    }
    
    .new-handicap-icon {
      font-size: 3rem;
      margin-bottom: 15px;
    }
    
    .new-handicap-name {
      font-size: 1.5rem;
      color: #ff6666;
      font-weight: bold;
      margin-bottom: 10px;
    }
    
    .new-handicap-desc {
      font-size: 1rem;
      color: #ff9999;
      margin-bottom: 15px;
      font-style: italic;
    }
    
    .suffering-level-update {
      font-size: 1.2rem;
      color: #ff4444;
      font-weight: bold;
      margin-bottom: 20px;
      text-shadow: 0 0 10px rgba(255, 68, 68, 0.6);
    }
    
    .double-result-content button {
      background: linear-gradient(145deg, #660000, #440000);
      border: 2px solid #ff4444;
      color: #fff;
      padding: 10px 20px;
      border-radius: 10px;
      cursor: pointer;
      font-size: 1rem;
      font-weight: bold;
    }
    
    @keyframes doubleResultFadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
    
    @keyframes doubleResultShake {
      0%, 100% { transform: scale(1); }
      50% { transform: scale(1.05); }
    }
  `;
  document.head.appendChild(style);
}

// Add handicap to the stack and update display
function addHandicapToStack(handicap) {
  // Add to stack
  state.handicapStack.push(handicap);
  state.sufferingLevel = state.handicapStack.length;
  
  // Update the display with flash animation
  displayHandicapStack();
  
  // Add shake animation to handicap container
  const handicapContainer = document.getElementById('handicap-container');
  if (handicapContainer) {
    handicapContainer.classList.add('handicap-stack-shake');
    setTimeout(() => {
      handicapContainer.classList.remove('handicap-stack-shake');
    }, 600);
  }
}

// Remove the most recent handicap (for potential "win" scenarios)
function removeLatestHandicap() {
  if (state.handicapStack.length > 1) {
    state.handicapStack.pop();
    state.sufferingLevel = state.handicapStack.length;
    displayHandicapStack();
    
    // Add green flash for removal
    const handicapContainer = document.getElementById('handicap-container');
    if (handicapContainer) {
      handicapContainer.classList.add('handicap-removal-flash');
      setTimeout(() => {
        handicapContainer.classList.remove('handicap-removal-flash');
      }, 600);
    }
  }
}

// Show maximum suffering reached message
function showMaxSufferingReached() {
  const popup = document.createElement('div');
  popup.className = 'double-or-nothing-result';
  popup.innerHTML = `
    <div class="double-result-content">
      <h2>🔥 MAXIMUM SUFFERING REACHED! 🔥</h2>
      <div class="new-handicap-icon">💀</div>
      <div class="new-handicap-name">All Handicaps Applied</div>
      <div class="new-handicap-desc">You have achieved the ultimate form of gaming torture</div>
      <div class="suffering-level-update">SUFFERING LEVEL: INFINITE</div>
      <button onclick="this.parentElement.parentElement.remove()">I'M ALREADY DEAD</button>
    </div>
  `;
  document.body.appendChild(popup);
}

// Update the latest history entry with new handicap
function updateLatestHistoryWithNewHandicap(newHandicap) {
  const historyList = document.getElementById('history-list');
  const latestEntry = historyList?.firstElementChild;
  
  if (latestEntry) {
    // Update the handicap section to show all active handicaps
    const handicapSection = latestEntry.querySelector('.rage-handicap-section');
    if (handicapSection) {
      const allHandicapsText = state.handicapStack.map(h => h.name).join(', ');
      const allHandicapsDesc = state.handicapStack.map(h => `${h.name}: ${h.description}`).join(' | ');
      
      handicapSection.innerHTML = `
        <div class="rage-handicap-badge">
          <span class="skull-icon">💀</span>
          <span class="handicap-name">${allHandicapsText}</span>
        </div>
        <div class="rage-handicap-desc">${allHandicapsDesc}</div>
        <div class="suffering-level-badge">SUFFERING LEVEL: ${state.sufferingLevel}x</div>
      `;
      
      // Add pulsing animation to show update
      handicapSection.classList.add('handicap-update-pulse');
      setTimeout(() => {
        handicapSection.classList.remove('handicap-update-pulse');
      }, 1000);
    }
  }
}

function updateRageMeterForDoubleOrNothing() {
  const rageFill = document.getElementById('rage-meter-fill');
  const rageText = document.getElementById('rage-meter-text');
  
  if (rageFill && rageText) {
    // Set to maximum rage
    rageFill.style.height = '100%';
    rageFill.classList.add('maximum');
    rageText.textContent = 'MAX';
    
    // Store maximum rage level
    window.state.rageLevel = 100;
  }
}

// Show Double or Nothing button after loadout generation
function showDoubleOrNothingOption() {
  const container = document.getElementById('double-or-nothing-container');
  if (container) {
    container.style.display = 'block';
    // Auto-hide after 30 seconds
    setTimeout(() => {
      container.style.display = 'none';
    }, 30000);
  }
}

// Initialize Double or Nothing when DOM loads
document.addEventListener('DOMContentLoaded', () => {
  setTimeout(initializeDoubleOrNothing, 100);
});

// Issue 5: Add Celebration Animation
function triggerCelebrationAnimation() {
  console.log("🎉 Triggering celebration animation");
  
  // Flash all item containers
  const itemContainers = document.querySelectorAll('.placeholder-container, .item-container');
  itemContainers.forEach((container, index) => {
    setTimeout(() => {
      container.style.animation = 'celebrationPulse 0.8s ease-in-out';
      container.style.boxShadow = '0 0 30px rgba(255, 68, 68, 0.8)';
    }, index * 100);
  });
  
  // Show success message overlay
  const overlay = document.createElement('div');
  overlay.innerHTML = `
    <div style="
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: rgba(0, 0, 0, 0.9);
      border: 3px solid #ff4444;
      border-radius: 15px;
      padding: 20px 40px;
      z-index: 10000;
      color: #ff6666;
      font-size: 24px;
      font-weight: bold;
      text-align: center;
      box-shadow: 0 0 50px rgba(255, 68, 68, 0.6);
      animation: celebrationBounce 1s ease-out;
    ">
      💀 RAGE LOADOUT COMPLETE! 💀<br>
      <span style="font-size: 16px; color: #ffaaaa;">Now go suffer!</span>
    </div>
  `;
  document.body.appendChild(overlay);
  
  // Remove overlay after 2 seconds
  setTimeout(() => {
    overlay.remove();
    // Reset item styles
    itemContainers.forEach(container => {
      container.style.animation = '';
      container.style.boxShadow = '';
    });
  }, 2000);
}

// Issue 6: Fix State Reset
function resetSpinState() {
  console.log("🔄 Resetting spin state");
  
  // Reset button state
  const spinButton = document.getElementById("rage-quit-btn");
  if (spinButton) {
    spinButton.removeAttribute("disabled");
    spinButton.classList.remove('spinning', 'disabled');
    spinButton.disabled = false; // Ensure button is truly enabled
    console.log("✅ Button re-enabled");
  }
  
  // Reset animation states
  state.isSpinning = false;
  if (window.rageRouletteSystem) {
    window.rageRouletteSystem.animating = false;
  }
  
  // Clear any ongoing animations
  document.querySelectorAll('.item-container').forEach(container => {
    container.classList.remove('mega-flash', 'spinning');
  });
  
  console.log("✅ State reset complete - ready for next spin");
}

// Issue 7: Implement History Recording
function recordSpinInHistory() {
  try {
    console.log('🎯 Recording spin in history...');

    // Get what's actually visually displayed (not the winner class, but what's in view)
    const outputDiv = document.getElementById('output');

    // For weapons and specs, we need to find what's actually visible in the viewport
    const weaponContainer = outputDiv?.querySelector('.item-container:nth-child(1)');
    const weaponItems = weaponContainer?.querySelectorAll('.itemCol');

    // Debug: Log all weapon items to see which one should be visible
    console.log('🔫 Weapon items in container:');
    weaponItems?.forEach((item, index) => {
      const name = item.dataset.itemName || item.querySelector('p')?.textContent?.trim();
      console.log(`  [${index}] ${name}`);
    });

    // The visible item is typically at index 3 (the 4th item, 0-based)
    // This is based on the slot machine stopping position
    const actualWeapon = weaponItems?.[3]?.dataset.itemName ||
                         weaponItems?.[3]?.querySelector('p')?.textContent?.trim();

    const specContainer = outputDiv?.querySelector('.item-container:nth-child(2)');
    const specItems = specContainer?.querySelectorAll('.itemCol');
    const actualSpec = specItems?.[3]?.dataset.itemName ||
                       specItems?.[3]?.querySelector('p')?.textContent?.trim() ||
                       specItems?.[4]?.dataset.itemName ||
                       specItems?.[4]?.querySelector('p')?.textContent?.trim();

    // For gadgets, they don't have the slot animation, so use the first item
    const gadget1 = outputDiv?.querySelector('.item-container:nth-child(3) .itemCol:first-child')?.dataset.itemName ||
                    outputDiv?.querySelector('.item-container:nth-child(3) .itemCol:first-child p')?.textContent?.trim();
    const gadget2 = outputDiv?.querySelector('.item-container:nth-child(4) .itemCol:first-child')?.dataset.itemName ||
                    outputDiv?.querySelector('.item-container:nth-child(4) .itemCol:first-child p')?.textContent?.trim();
    const gadget3 = outputDiv?.querySelector('.item-container:nth-child(5) .itemCol:first-child')?.dataset.itemName ||
                    outputDiv?.querySelector('.item-container:nth-child(5) .itemCol:first-child p')?.textContent?.trim();

    console.log('🔍 Actual displayed items:', {
      weapon: actualWeapon,
      spec: actualSpec,
      gadgets: [gadget1, gadget2, gadget3]
    });

    // Fallback to finalLoadout if we can't read from DOM
    const finalLoadout = window.rageState?.finalLoadout || {};

    const selectedItems = [
      { name: actualWeapon || finalLoadout.weapon || 'Unknown', type: 'Weapon' },
      { name: actualSpec || finalLoadout.specialization || 'Unknown', type: 'Specialization' },
      { name: gadget1 || finalLoadout.gadgets?.[0] || 'Unknown', type: 'Gadget 1' },
      { name: gadget2 || finalLoadout.gadgets?.[1] || 'Unknown', type: 'Gadget 2' },
      { name: gadget3 || finalLoadout.gadgets?.[2] || 'Unknown', type: 'Gadget 3' }
    ];

    console.log('✅ Final selected items:', selectedItems);
    
    // Create history entry
    const historyEntry = {
      id: Date.now(),
      timestamp: new Date().toLocaleString(),
      selectedClass: finalLoadout.classType || window.rageState?.selectedClass || 'Unknown',
      items: selectedItems,
      handicap: window.rageState?.selectedHandicap || window.state?.selectedHandicap || 'None',
      handicapDescription: window.rageState?.selectedHandicapDesc || window.state?.selectedHandicapDesc || '',
      sufferingLevel: window.rageState?.sufferingLevel || window.state?.sufferingLevel || 1
    };
    
    // Save to localStorage
    let history = JSON.parse(localStorage.getItem('rageQuitHistory') || '[]');
    history.unshift(historyEntry); // Add to beginning
    
    // Keep only last 10 entries
    if (history.length > 10) {
      history = history.slice(0, 10);
    }
    
    localStorage.setItem('rageQuitHistory', JSON.stringify(history));
    
    // Update display
    displayHistory();
    
    console.log("📝 Spin recorded in history:", historyEntry);
  } catch (error) {
    console.error("⚠️ Error recording history:", error);
  }
}

function displayHistory() {
  const historyList = document.getElementById('history-list');
  if (!historyList) return;
  
  // For now, just return since we're using a different history system
  // The history is managed by addToHistory function which adds entries directly to the DOM
  // This function is called on page load but history is already in the DOM from previous sessions
  return;
}

function loadHistory() {
  const historyList = document.getElementById("history-list");
  if (!historyList) return;
  
  // Load saved history HTML
  const savedHistory = localStorage.getItem("rageQuitHistoryHTML");
  if (savedHistory) {
    historyList.innerHTML = savedHistory;
    
    // Re-add visibility class to all entries
    const entries = historyList.querySelectorAll('.rage-history-entry');
    entries.forEach(entry => {
      entry.classList.add('visible');
    });
  }
}
