const loadouts = {
    Light: {
      weapons: ["93R", "Dagger", "LH1", "M26 Matter", "Recurve Bow", "Throwing Knives", "V95", "XP-54", "SR-84", "Sword", "SH900"],
      specializations: ["Cloaking Device", "Evasive Dash", "Grappling Hook"],
      gadgets: ["Breach Charge", "Gateway", "Glitch Grenade", "Gravity Vortex", "Sonar Grenade", "Stun Gun", "Thermal Bore", "Thermal Vision", "Tracking Dart", "Vanishing Bomb"]
    },
    Medium: {
      weapons: ["AKM", "Cerberus 126A", "CL-40", "Dual Blades", "FAMAS", "FCAR", "Model 1887", "Pike-556", "R357", "Riot Shield"],
      specializations: ["Dematerializer", "Guardian Turret"],
      gadgets: ["APS Turret", "Data Reshaper", "Defibrillator", "Explosive Mine", "Gas Mine", "Glitch Trap", "Jump Pad", "Zipline", "Proximity Sensor"]
    },
    Heavy: {
      weapons: [".50 Akimbo", "Flamethrower", "KS-23", "Lewis Gun", "M60", "MG32", "SA1216", "SHAK-50", "Sledgehammer", "Spear"],
      specializations: ["Charge 'n' Slam", "God Gun", "Mesh Shield"],
      gadgets: ["Anti-Gravity Cube", "Barricade", "C4", "Dome Shield", "Explosive Mine", "Lockbolt Launcher", "Pyro Mine", "Proximity Sensor", "RPG-7"]
    },
    All: {
      gadgets: ["Flashbang", "Frag Grenade", "Gas Grenade", "Goo Grenade", "Pyro Grenade", "Smoke Grenade"]
    }
  };
  
  // Function to get a random item from an array
  function randomItem(array) {
    return array[Math.floor(Math.random() * array.length)];
  }
  
  // Function to generate unique gadgets
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
  
  // Main loadout generation function
  function generateLoadout(classType) {
    const outputDiv = document.getElementById("output");
    outputDiv.innerHTML = ""; // Clear previous loadout
  
    const data = loadouts[classType];
    const animationInterval = setInterval(() => {
      const tempLoadout = {
        class: classType,
        weapon: randomItem(data.weapons),
        specialization: randomItem(data.specializations),
        gadgets: getUniqueGadgets([...data.gadgets, ...loadouts.All.gadgets], 3),
      };
      outputDiv.innerHTML = `
        <p>Class: ${tempLoadout.class}</p>
        <p>Weapon: ${tempLoadout.weapon}</p>
        <p>Specialization: ${tempLoadout.specialization}</p>
        <p>Gadgets: ${tempLoadout.gadgets.join(", ")}</p>
      `;
    }, 100); // Change every 100ms for quick cycling
  
    setTimeout(() => {
      clearInterval(animationInterval);
      const finalLoadout = {
        class: classType,
        weapon: randomItem(data.weapons),
        specialization: randomItem(data.specializations),
        gadgets: getUniqueGadgets([...data.gadgets, ...loadouts.All.gadgets], 3),
      };
  
      // Display the final loadout
      outputDiv.innerHTML = `
        <h3>Final Loadout:</h3>
        <p>Class: ${finalLoadout.class}</p>
        <p>Weapon: ${finalLoadout.weapon}</p>
        <p>Specialization: ${finalLoadout.specialization}</p>
        <p>Gadgets: ${finalLoadout.gadgets.join(", ")}</p>
      `;
    }, 1500); // 1.5 seconds for the spin duration
  }
  
  // Specific class functions
  function generateLightLoadout() {
    generateLoadout("Light");
  }
  
  function generateMediumLoadout() {
    generateLoadout("Medium");
  }
  
  function generateHeavyLoadout() {
    generateLoadout("Heavy");
  }
  