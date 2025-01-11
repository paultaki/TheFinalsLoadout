const loadouts = {
  Light: {
    weapons: [
      "93R", "Dagger", "LH1", "M11", "M26 Matter", "Recurve Bow", "SH1900",
      "SR-84", "Sword", "V9S", "XP-54", "Throwing Knives"
    ],
    specializations: ["Cloaking Device", "Evasive Dash", "Grappling Hook"],
    gadgets: [
      "Breach Charge", "Gateway", "Glitch Grenade", "Gravity Vortex", "Sonar Grenade",
      "Stun Gun", "Thermal Bore", "Thermal Vision", "Tracking Dart", "Vanishing Bomb"
    ]
  },
  Medium: {
    weapons: [
      "AKM", "Cerberus 12GA", "CL-40", "Dual Blades", "FAMAS", "FCAR", 
      "Model 1887", "Pike-556", "R.357", "Riot Shield"
    ],
    specializations: ["Dematerializer", "Guardian Turret", "Healing Beam"],
    gadgets: [
      "APS Turret", "Data Reshaper", "Defibrillator", "Explosive Mine", "Gas Mine",
      "Glitch Trap", "Jump Pad", "Zipline", "Proximity Sensor"
    ]
  },
  Heavy: {
    weapons: [
      ".50 Akimbo", "Flamethrower", "KS-23", "Lewis Gun", "M60", "MGL32", 
      "SA1216", "SHAK-50", "Sledgehammer", "Spear"
    ],
    specializations: ["Charge 'N Slam", "Goo Gun", "Mesh Shield", "Winch Claw"],
    gadgets: [
      "Anti-Gravity Cube", "Barricade", "C4", "Dome Shield", "Lockbolt Launcher", 
      "Pyro Mine", "Proximity Sensor", "RPG-7"
    ]
  },
  All: [
    "Flashbang", "Frag Grenade", "Gas Grenade", "Goo Grenade", "Pyro Grenade", 
    "Smoke Grenade"
  ]
};

// Function to get a random item from an array
function randomItem(array) {
  return array[Math.floor(Math.random() * array.length)];
}

// Function to get the image path for an item
function getImagePath(itemName) {
  // Replace spaces with underscores for filenames
  const formattedName = itemName.replace(/ /g, "_"); 
  return `images/${formattedName}_Rank_1.png`;
}

// Function to generate a loadout
function generateLoadout(classType) {
  const outputDiv = document.getElementById("output");
  outputDiv.innerHTML = ""; // Clear previous loadout

  const data = loadouts[classType];
  const finalLoadout = {
    class: classType,
    weapon: randomItem(data.weapons),
    specialization: randomItem(data.specializations),
    gadgets: [
      randomItem([...data.gadgets, ...loadouts.All]),
      randomItem([...data.gadgets, ...loadouts.All]),
      randomItem([...data.gadgets, ...loadouts.All])
    ]
  };

  // Display the loadout
  outputDiv.innerHTML = `
    <h3>Class:</h3>
    <img src="${getImagePath(finalLoadout.class)}" alt="${finalLoadout.class}" />
    <p>${finalLoadout.class}</p>
    <h3>Weapon:</h3>
    <img src="${getImagePath(finalLoadout.weapon)}" alt="${finalLoadout.weapon}" />
    <p>${finalLoadout.weapon}</p>
    <h3>Specialization:</h3>
    <img src="${getImagePath(finalLoadout.specialization)}" alt="${finalLoadout.specialization}" />
    <p>${finalLoadout.specialization}</p>
    <h3>Gadgets:</h3>
    <div>
      ${finalLoadout.gadgets
        .map(
          (gadget) =>
            `<div>
              <img src="${getImagePath(gadget)}" alt="${gadget}" />
              <p>${gadget}</p>
            </div>`
        )
        .join("")}
    </div>
  `;
}

// Function for generating a random class and loadout
function generateRandomLoadout() {
  const classType = randomItem(Object.keys(loadouts).filter((key) => key !== "All"));
  generateLoadout(classType);
}

// Add event listeners for buttons
document.getElementById("randomButton").onclick = generateRandomLoadout;
document.getElementById("lightButton").onclick = () => generateLoadout("Light");
document.getElementById("mediumButton").onclick = () => generateLoadout("Medium");
document.getElementById("heavyButton").onclick = () => generateLoadout("Heavy");
