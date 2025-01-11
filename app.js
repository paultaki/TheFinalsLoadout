const loadouts = {
  Light: {
    weapons: [
      "93R", "Dagger", "LHI", "M26 Matter", "Recurve Bow", "SM900", "SR-84", 
      "Sword", "V95", "XP-54", "Throwing Knives"
    ],
    specializations: ["Cloaking Device", "Evasive Dash", "Grappling Hook"],
    gadgets: [
      "Breach Charge", "Gateway", "Glitch Grenade", "Gravity Vortex", "Sonar Grenade",
      "Stun Gun", "Thermal Bore", "Thermal Vision", "Tracking Dart", "Vanishing Bomb"
    ],
  },
  Medium: {
    weapons: [
      "AKM", "Cerberus 126A", "CL-40", "Dual Blades", "FAMAS", "FCAR", 
      "Model 1887", "Pike-556", "R357", "Riot Shield"
    ],
    specializations: ["Dematerializer", "Guardian Turret", "Healing Beam"],
    gadgets: [
      "APS Turret", "Data Reshaper", "Defibrillator", "Explosive Mine", "Gas Mine",
      "Glitch Trap", "Jump Pad", "Proximity Sensor", "Zipline"
    ],
  },
  Heavy: {
    weapons: [
      ".50 Akimbo", "Flamethrower", "KS-23", "Lewis Gun", "M60", "MG42", 
      "SA1216", "SHAK-50", "Sledgehammer", "Spear"
    ],
    specializations: ["Charge 'n' Slam", "Goo Gun", "Mesh Shield", "Winch Claw"],
    gadgets: [
      "Anti-Gravity Cube", "Barricade", "C4", "Dome Shield", "Explosive Mine",
      "Lockbolt Launcher", "Proximity Sensor", "Pyro Mine", "RPG-7"
    ],
  },
  All: {
    gadgets: [
      "Flashbang", "Frag Grenade", "Gas Grenade", "Goo Grenade", "Pyro Grenade", "Smoke Grenade"
    ],
  },
};

// Utility function to select a random item from an array
function randomItem(array) {
  return array[Math.floor(Math.random() * array.length)];
}

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

// Function to generate a loadout based on the class type
function generateLoadout(classType) {
  if (classType === "Random") {
    classType = randomItem(["Light", "Medium", "Heavy"]);
  }

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
  }, 75); // Faster spinning (75ms)

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
  }, 1500); // Spin duration reduced to 1.5 seconds
}

// Functions for specific class loadouts
function generateLightLoadout() {
  generateLoadout("Light");
}

function generateMediumLoadout() {
  generateLoadout("Medium");
}

function generateHeavyLoadout() {
  generateLoadout("Heavy");
}
