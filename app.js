const loadouts = {
  Light: {
    weapons: [
      "93R", "Dagger", "LH1", "M26 Matter", "Recurve Bow", "SH1900", "SR-84", "Sword", 
      "V95", "XP-54", "Throwing Knives"
    ],
    specializations: ["Cloaking Device", "Evasive Dash", "Grappling Hook"],
    gadgets: [
      "Breach Charge", "Gateway", "Glitch Grenade", "Gravity Vortex", "Sonar Grenade",
      "Stun Gun", "Thermal Bore", "Thermal Vision", "Tracking Dart", "Vanishing Bomb"
    ]
  },
  Medium: {
    weapons: [
      "AKM", "Cerberus 12GA", "CL-40", "Dual Blades", "FAMAS", "FCAR", "Model 1887",
      "Pike-556", "R-357", "Riot Shield"
    ],
    specializations: ["Dematerializer", "Guardian Turret", "Healing Beam"],
    gadgets: [
      "APS Turret", "Data Reshaper", "Defibrillator", "Explosive Mine", "Gas Mine",
      "Glitch Trap", "Jump Pad", "Zipline", "Proximity Sensor"
    ]
  },
  Heavy: {
    weapons: [
      ".50 Akimbo", "Flamethrower", "KS-23", "Lewis Gun", "M60", "MG132", "SA1216",
      "Shak-50", "Sledgehammer", "Spear"
    ],
    specializations: ["Charge 'n Slam", "Mesh Shield", "Winch Claw"],
    gadgets: [
      "Anti-Gravity Cube", "Barricade", "C4", "Dome Shield", "Explosive Mine", 
      "Lockbolt Launcher", "Pyro Mine", "Proximity Sensor", "RPG-7"
    ]
  },
  All: ["Flashbang", "Frag Grenade", "Gas Grenade", "Goo Grenade", "Pyro Grenade", "Smoke Grenade"]
};

// Random item function
function randomItem(array) {
  return array[Math.floor(Math.random() * array.length)];
}

// Generate a loadout
function generateLoadout(classType = null) {
  const outputDiv = document.getElementById("output");
  outputDiv.innerHTML = ""; // Clear previous loadout

  // Determine class
  const selectedClass = classType || randomItem(Object.keys(loadouts));
  const data = loadouts[selectedClass];

  const finalLoadout = {
    class: selectedClass,
    weapon: randomItem(data.weapons),
    specialization: randomItem(data.specializations),
    gadgets: getUniqueGadgets([...data.gadgets, ...loadouts.All], 3)
  };

  // Display the loadout
  outputDiv.innerHTML = `
    <h3>Class:</h3>
    <img src="images/${finalLoadout.class.replace(/\s+/g, '_')}_Rank_1.png" alt="${finalLoadout.class}">
    <p>${finalLoadout.class}</p>
    <h3>Weapon:</h3>
    <img src="images/${finalLoadout.weapon.replace(/\s+/g, '_')}_Rank_1.png" alt="${finalLoadout.weapon}">
    <p>${finalLoadout.weapon}</p>
    <h3>Specialization:</h3>
    <img src="images/${finalLoadout.specialization.replace(/\s+/g, '_')}_Rank_1.png" alt="${finalLoadout.specialization}">
    <p>${finalLoadout.specialization}</p>
    <h3>Gadgets:</h3>
    <div class="gadgets-container">
      ${finalLoadout.gadgets.map(gadget => `
        <div class="gadget">
          <img src="images/${gadget.replace(/\s+/g, '_')}_Rank_1.png" alt="${gadget}">
          <p>${gadget}</p>
        </div>
      `).join('')}
    </div>
  `;
}

// Get unique gadgets
function getUniqueGadgets(gadgetPool, count) {
  const uniqueGadgets = [];
  while (uniqueGadgets.length < count) {
    const gadget = randomItem(gadgetPool);
    if (!uniqueGadgets.includes(gadget)) uniqueGadgets.push(gadget);
  }
  return uniqueGadgets;
}

// Button event listeners
document.getElementById("randomLoadout").onclick = () => generateLoadout();
document.getElementById("lightLoadout").onclick = () => generateLoadout("Light");
document.getElementById("mediumLoadout").onclick = () => generateLoadout("Medium");
document.getElementById("heavyLoadout").onclick = () => generateLoadout("Heavy");
