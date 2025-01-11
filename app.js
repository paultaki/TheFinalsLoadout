// Loadouts data
const loadouts = {
  Light: {
    weapons: ["93R", "Dagger", "LH1", "M26 Matter", "Recurve Bow", "Throwing Knives"],
    specializations: ["Cloaking Device", "Evasive Dash", "Grappling Hook"],
    gadgets: ["Breach Charge", "Gateway", "Glitch Grenade", "Gravity Vortex", "Sonar Grenade", "Stun Gun", "Thermal Bore", "Thermal Vision", "Tracking Dart", "Vanishing Bomb"],
  },
  Medium: {
    weapons: ["AKM", "Cerberus 12GA", "CL-40", "Dual Blades", "FAMAS", "FCAR", "Model 1887", "Pike-556", "R.357"],
    specializations: ["Dematerializer", "Guardian Turret", "Healing Beam"],
    gadgets: ["APS Turret", "Data Reshaper", "Defibrillator", "Explosive Mine", "Gas Mine", "Glitch Trap", "Jump Pad", "Proximity Sensor", "Zipline"],
  },
  Heavy: {
    weapons: [".50 Akimbo", "Flamethrower", "KS-23", "Lewis Gun", "M60", "MGL32", "SA1216", "SHAK-50", "Sledgehammer", "Spear"],
    specializations: ["Charge 'N' Slam", "Goo Gun", "Mesh Shield", "Winch Claw"],
    gadgets: ["Anti-Gravity Cube", "Barricade", "C4", "Dome Shield", "Explosive Mine", "Lockbolt Launcher", "Motion Sensor", "Pyro Mine", "RPG-7"],
  },
  AllGadgets: ["Flashbang", "Frag Grenade", "Gas Grenade", "Goo Grenade", "Pyro Grenade", "Smoke Grenade"],
};

// Helper function to get a random item from an array
function randomItem(array) {
  return array[Math.floor(Math.random() * array.length)];
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
      randomItem(data.gadgets),
      randomItem(data.gadgets),
      randomItem(loadouts.AllGadgets),
    ],
  };

  // Display the final loadout
  outputDiv.innerHTML = `
    <h2>Class:</h2>
    <img src="./images/${finalLoadout.class}_Rank_1.png" alt="${finalLoadout.class}" style="height: 100px;">
    <p>${finalLoadout.class}</p>

    <h2>Weapon:</h2>
    <img src="./images/${finalLoadout.weapon}_Rank_1.png" alt="${finalLoadout.weapon}" style="height: 100px;">
    <p>${finalLoadout.weapon}</p>

    <h2>Specialization:</h2>
    <img src="./images/${finalLoadout.specialization}_Rank_1.png" alt="${finalLoadout.specialization}" style="height: 100px;">
    <p>${finalLoadout.specialization}</p>

    <h2>Gadgets:</h2>
    ${finalLoadout.gadgets.map((gadget) => `
      <div style="display: inline-block; margin: 10px; text-align: center;">
        <img src="./images/${gadget}_Rank_1.png" alt="${gadget}" style="height: 100px;">
        <p>${gadget}</p>
      </div>
    `).join("")}
  `;
}

// Event listeners for buttons
document.getElementById("randomLoadoutBtn").onclick = () => generateLoadout(randomItem(Object.keys(loadouts)));
document.getElementById("lightLoadoutBtn").onclick = () => generateLoadout("Light");
document.getElementById("mediumLoadoutBtn").onclick = () => generateLoadout("Medium");
document.getElementById("heavyLoadoutBtn").onclick = () => generateLoadout("Heavy");
