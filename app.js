const loadouts = {
  light: {
      weapons: ["M11", "V9S", "Throwing Knives", "Recurve Bow", "LH1"],
      specializations: ["Cloak", "Evasive Dash", "Grappling Hook"],
      gadgets: ["Smoke Grenade", "Sonar Grenade", "Gateway", "Tracking Dart", "Breach Charge"]
  },
  medium: {
      weapons: ["AKM", "FAMAS", "Cerberus 12GA", "Dual Blades", "R357", "Model 1887"],
      specializations: ["Guardian Turret", "Healing Beam", "Dematerializer"],
      gadgets: ["Gas Mine", "Explosive Mine", "APS Turret", "Defibrillator", "Zipline"]
  },
  heavy: {
      weapons: ["SHAK-50", "MGL32", "Flamethrower", "Sledgehammer", "KS-23", "Spear"],
      specializations: ["Mesh Shield", "Charge 'N Slam", "Goo Gun"],
      gadgets: ["Motion Sensor", "Dome Shield", "C4", "Pyro Mine", "Lockbolt Launcher"]
  }
};

function randomItem(array) {
  return array[Math.floor(Math.random() * array.length)];
}

function displayLoadout(classType, weapon, specialization, gadgets) {
  const outputDiv = document.getElementById("output");
  outputDiv.innerHTML = `
      <h2>${classType} Loadout</h2>
      <p><strong>Weapon:</strong> ${weapon}</p>
      <p><strong>Specialization:</strong> ${specialization}</p>
      <div class="gadgets">
          <h3>Gadgets:</h3>
          ${gadgets.map(gadget => `<div>${gadget}</div>`).join("")}
      </div>
  `;
}

function generateRandomLoadout() {
  const classes = Object.keys(loadouts);
  const randomClass = randomItem(classes);
  generateLoadout(randomClass);
}

function generateLightLoadout() {
  generateLoadout("light");
}

function generateMediumLoadout() {
  generateLoadout("medium");
}

function generateHeavyLoadout() {
  generateLoadout("heavy");
}

function generateLoadout(classType) {
  const loadout = loadouts[classType];
  const weapon = randomItem(loadout.weapons);
  const specialization = randomItem(loadout.specializations);
  const gadgets = [];
  while (gadgets.length < 3) {
      const gadget = randomItem(loadout.gadgets);
      if (!gadgets.includes(gadget)) {
          gadgets.push(gadget);
      }
  }
  displayLoadout(classType, weapon, specialization, gadgets);
}
