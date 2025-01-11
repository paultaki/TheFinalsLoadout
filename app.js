document.addEventListener("DOMContentLoaded", () => {
  // Function to randomly select an item from an array
  function randomItem(array) {
      return array[Math.floor(Math.random() * array.length)];
  }

  // Loadout data
  const loadouts = {
      Light: {
          weapons: ["93R", "Dagger", "LH1", "M26 Matter", "Recurve Bow", "SR-84", "Sword", "V95", "XP-54", "Throwing Knives"],
          specializations: ["Cloaking Device", "Evasive Dash", "Grappling Hook"],
          gadgets: ["Breach Charge", "Gateway", "Glitch Grenade", "Gravity Vortex", "Sonar Grenade", "Stun Gun", "Thermal Bore", "Thermal Vision", "Tracking Dart", "Vanishing Bomb"]
      },
      Medium: {
          weapons: ["AKM", "Cerberus 12GA", "CL-40", "Dual Blades", "FAMAS", "FCAR", "Model 1887", "Pike-556", "R.357", "Riot Shield"],
          specializations: ["Dematerializer", "Guardian Turret", "Healing Beam"],
          gadgets: ["APS Turret", "Data Reshaper", "Defibrillator", "Explosive Mine", "Gas Mine", "Glitch Trap", "Jump Pad", "Zipline", "Proximity Sensor"]
      },
      Heavy: {
          weapons: [".50 Akimbo", "Flamethrower", "KS-23", "Lewis Gun", "M60", "MGL32", "SA1216", "SHAK-50", "Sledgehammer", "Spear"],
          specializations: ["Charge 'N Slam", "Goo Gun", "Mesh Shield", "Winch Claw"],
          gadgets: ["Anti-Gravity Cube", "Barricade", "C4", "Dome Shield", "Explosive Mine", "Lockbolt Launcher", "Proximity Sensor", "Pyro Mine", "RPG-7"]
      },
      All: {
          gadgets: ["Flashbang", "Frag Grenade", "Gas Grenade", "Goo Grenade", "Pyro Grenade", "Smoke Grenade"]
      }
  };

  // Function to generate a random loadout
  function generateRandomLoadout() {
      const outputDiv = document.getElementById("output");
      outputDiv.innerHTML = ""; // Clear previous loadout

      const classType = randomItem(Object.keys(loadouts));
      const data = loadouts[classType];
      const loadout = {
          class: classType,
          weapon: randomItem(data.weapons),
          specialization: randomItem(data.specializations),
          gadgets: getUniqueGadgets([...data.gadgets, ...loadouts.All.gadgets], 3)
      };

      displayLoadout(loadout);
  }

  // Function to generate loadout for a specific class
  function generateClassLoadout(classType) {
      const outputDiv = document.getElementById("output");
      outputDiv.innerHTML = ""; // Clear previous loadout

      const data = loadouts[classType];
      const loadout = {
          class: classType,
          weapon: randomItem(data.weapons),
          specialization: randomItem(data.specializations),
          gadgets: getUniqueGadgets([...data.gadgets, ...loadouts.All.gadgets], 3)
      };

      displayLoadout(loadout);
  }

  // Helper function to get unique gadgets
  function getUniqueGadgets(gadgetPool, count) {
      const uniqueGadgets = [];
      while (uniqueGadgets.length < count) {
          const gadget = randomItem(gadgetPool);
          if (!uniqueGadgets.includes(gadget)) {
              uniqueGadgets.push(gadget);
          }
      }
      return uniqueGadgets;
  }

  // Function to display the generated loadout
  function displayLoadout(loadout) {
      const outputDiv = document.getElementById("output");
      outputDiv.innerHTML = `
          <h3>Class:</h3>
          <img src="images/${loadout.class}_Rank_1.png" alt="${loadout.class}">
          <p>${loadout.class}</p>
          <h3>Weapon:</h3>
          <img src="images/${loadout.weapon.replace(/\s/g, "_")}_Rank_1.png" alt="${loadout.weapon}">
          <p>${loadout.weapon}</p>
          <h3>Specialization:</h3>
          <img src="images/${loadout.specialization.replace(/\s/g, "_")}_Rank_1.png" alt="${loadout.specialization}">
          <p>${loadout.specialization}</p>
          <h3>Gadgets:</h3>
          <div class="gadgets">
              ${loadout.gadgets.map(gadget => `
                  <div class="gadget">
                      <img src="images/${gadget.replace(/\s/g, "_")}_Rank_1.png" alt="${gadget}">
                      <p>${gadget}</p>
                  </div>
              `).join("")}
          </div>
      `;
  }

  // Button event listeners
  document.getElementById("randomLoadoutButton").onclick = generateRandomLoadout;
  document.getElementById("lightLoadoutButton").onclick = () => generateClassLoadout("Light");
  document.getElementById("mediumLoadoutButton").onclick = () => generateClassLoadout("Medium");
  document.getElementById("heavyLoadoutButton").onclick = () => generateClassLoadout("Heavy");
});
