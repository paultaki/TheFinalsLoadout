const loadouts = {
  Light: {
      weapons: ["93R", "Dagger", "LH1", "M11", "M26 Matter", "Recurve Bow", "SH1900", "SR-84", "Sword", "Throwing Knives", "V9S", "XP-54"],
      specializations: ["Cloaking Device", "Evasive Dash", "Grappling Hook"],
      gadgets: ["Smoke Grenade", "Sonar Grenade", "Gateway", "Gravity Vortex", "Tracking Dart", "Vanishing Bomb", "Thermal Bore"]
  },
  Medium: {
      weapons: ["AKM", "Cerberus 12GA", "CL-40", "Dual Blades", "FAMAS", "FCAR", "Model 1887", "Pike-556", "R357"],
      specializations: ["Dematerializer", "Guardian Turret", "Healing Beam"],
      gadgets: ["Gas Mine", "APS Turret", "Data Reshaper", "Explosive Mine", "Defibrillator", "Zipline", "Jump Pad"]
  },
  Heavy: {
      weapons: ["Sledgehammer", "Flamethrower", "SA1216", ".50 Akimbo", "KS-23", "M60", "MGL32", "MG32", "ShAK-50", "Spear", "RPG-7", "Pyro Mine"],
      specializations: ["Mesh Shield", "Charge 'N Slam", "Goo Gun"],
      gadgets: ["Lockbolt Launcher", "Dome Shield", "Proximity Sensor", "C4", "Barricade", "Explosive Mine", "Anti-Gravity Cube"]
  }
};

function randomItem(array) {
  return array[Math.floor(Math.random() * array.length)];
}

function generateLoadout(classType) {
  const data = loadouts[classType];
  const loadout = {
      weapon: randomItem(data.weapons),
      specialization: randomItem(data.specializations),
      gadgets: getUniqueGadgets(data.gadgets, 3)
  };
  displayLoadout(classType, loadout);
}

function generateRandomLoadout() {
  const classes = Object.keys(loadouts);
  const randomClass = randomItem(classes);
  generateLoadout(randomClass);
}

function generateLightLoadout() {
  generateLoadout("Light");
}

function generateMediumLoadout() {
  generateLoadout("Medium");
}

function generateHeavyLoadout() {
  generateLoadout("Heavy");
}

function getUniqueGadgets(array, count) {
  const shuffled = array.sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

function displayLoadout(classType, loadout) {
  const outputDiv = document.getElementById("output");
  outputDiv.innerHTML = `
      <h2>${classType} Loadout</h2>
      <p><strong>Weapon:</strong> ${loadout.weapon}</p>
      <p><strong>Specialization:</strong> ${loadout.specialization}</p>
      <div class="gadget-list">
          ${loadout.gadgets
              .map(
                  gadget => `
                  <div class="gadget-item">
                      <img src="images/${gadget.replaceAll(" ", "_")}_Rank_1.png" alt="${gadget}">
                      <p>${gadget}</p>
                  </div>
              `
              )
              .join("")}
      </div>
  `;
}
