const loadouts = {
  Light: {
      weapons: ["93R", "Dagger", "LH1", "Recurve Bow", "Sword", "XP-54"],
      specializations: ["Cloaking Device", "Evasive Dash", "Grappling Hook"],
      gadgets: ["Breach Charge", "Gateway", "Glitch Grenade", "Gravity Vortex", "Smoke Grenade", "Sonar Grenade", "Vanishing Bomb"]
  },
  Medium: {
      weapons: ["AKM", "Cerberus 12GA", "FAMAS", "Model 1887", "R357"],
      specializations: ["Dematerializer", "Guardian Turret", "Healing Beam"],
      gadgets: ["APS Turret", "Data Reshaper", "Defibrillator", "Explosive Mine", "Gas Mine", "Zipline"]
  },
  Heavy: {
      weapons: ["M60", "RPG-7", "Sledgehammer", "Spears"],
      specializations: ["Charge 'n' Slam", "Mesh Shield", "Pyro Grenade"],
      gadgets: ["Anti-Gravity Cube", "Barricade", "Dome Shield", "Pyro Mine", "Proximity Sensor"]
  }
};

function randomItem(array) {
  return array[Math.floor(Math.random() * array.length)];
}

function generateLoadout(classType) {
  const outputDiv = document.getElementById("output");
  const data = loadouts[classType];
  const weapon = randomItem(data.weapons);
  const specialization = randomItem(data.specializations);
  const gadgets = [randomItem(data.gadgets), randomItem(data.gadgets), randomItem(data.gadgets)];

  outputDiv.innerHTML = `
      <h2>${classType} Loadout</h2>
      <p><strong>Weapon:</strong> ${weapon}</p>
      <p><strong>Specialization:</strong> ${specialization}</p>
      <div class="gadgets-container">
          ${gadgets
              .map(
                  (gadget) => `
              <div class="gadget-item">
                  <img src="images/${gadget.replace(/ /g, "_")}_Rank_1.png" alt="${gadget}">
                  <p>${gadget}</p>
              </div>
          `
              )
              .join("")}
      </div>
  `;
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
