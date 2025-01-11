// Define loadouts for each class
const loadouts = {
    Light: {
      weapons: [
        "93R", "Dagger", "LHI", "M26 Matter", "Recurve Bow", "SH9000", "SR-84", "Sword",
        "Throwing Knives", "V95", "XP-54"
      ],
      specializations: ["Cloaking Device", "Evasive Dash", "Grappling Hook"],
      gadgets: [
        "Breach Charge", "Gateway", "Glitch Grenade", "Gravity Vortex", "Sonar Grenade",
        "Stun Gun", "Thermal Bore", "Thermal Vision", "Tracking Dart", "Vanishing Bomb",
        "Flashbang", "Frag Grenade", "Gas Grenade", "Goo Grenade", "Pyro Grenade", "Smoke Grenade"
      ],
    },
    Medium: {
      weapons: [
        "AKM", "Cerberus 126A", "CL-40", "Dual Blades", "FAMAS", "FCAR", "Model 1887",
        "Pike-556", "R357", "Riot Shield"
      ],
      specializations: ["Dematerializer", "Guardian Turret", "Healing Beam"],
      gadgets: [
        "APS Turret", "Data Reshaper", "Defibrillator", "Explosive Mine", "Gas Mine",
        "Glitch Trap", "Jump Pad", "Zipline", "Proximity Sensor",
        "Flashbang", "Frag Grenade", "Gas Grenade", "Goo Grenade", "Pyro Grenade", "Smoke Grenade"
      ],
    },
    Heavy: {
      weapons: [
        ".50 Akimbo", "Flamethrower", "KS-23", "Lewis Gun", "M60", "MG32",
        "SA1216", "SHAK-50", "Sledgehammer", "Spear"
      ],
      specializations: ["Charge 'n' Slam", "Goo Gun", "Mesh Shield", "Winch Claw"],
      gadgets: [
        "Anti-Gravity Cube", "Barricade", "C4", "Dome Shield", "Explosive Mine",
        "Proximity Sensor", "Lockbolt Launcher", "Pyro Mine", "RPG-7",
        "Flashbang", "Frag Grenade", "Gas Grenade", "Goo Grenade", "Pyro Grenade", "Smoke Grenade"
      ],
    },
  };
  
  
  // Utility function to get unique gadgets
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
  
  // Generate a general random loadout
  function generateLoadout() {
    generateClassLoadout(randomItem(Object.keys(loadouts)));
  }
  
  // Generate a Light loadout
  function generateLightLoadout() {
    generateClassLoadout("Light");
  }
  
  // Generate a Medium loadout
  function generateMediumLoadout() {
    generateClassLoadout("Medium");
  }
  
  // Generate a Heavy loadout
  function generateHeavyLoadout() {
    generateClassLoadout("Heavy");
  }
  
  // Shared function for generating a specific class loadout
  function generateClassLoadout(classType) {
    const outputDiv = document.getElementById("output");
    outputDiv.innerHTML = ""; // Clear previous loadout
  
    let animationInterval = setInterval(() => {
      const data = loadouts[classType];
      const tempLoadout = {
        class: classType,
        weapon: randomItem(data.weapons),
        specialization: randomItem(data.specializations),
        gadgets: getUniqueGadgets(data.gadgets, 3),
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
  
      const data = loadouts[classType];
      const finalLoadout = {
        class: classType,
        weapon: randomItem(data.weapons),
        specialization: randomItem(data.specializations),
        gadgets: getUniqueGadgets(data.gadgets, 3),
      };
  
      outputDiv.innerHTML = `
        <h3>Final Loadout:</h3>
        <p>Class: ${finalLoadout.class}</p>
        <p>Weapon: ${finalLoadout.weapon}</p>
        <p>Specialization: ${finalLoadout.specialization}</p>
        <p>Gadgets: ${finalLoadout.gadgets.join(", ")}</p>
      `;
    }, 4000); // Cycle for 4 seconds
  }
  