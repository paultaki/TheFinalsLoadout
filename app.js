// Loadout data
const loadouts = {
    Light: {
      weapons: [
        "93R", "Dagger", "L1H", "M26 Matter", "Recurve Bow", "SH900", "SR-84",
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
        "Model 1887", "Pike-556", "R-357", "Riot Shield"
      ],
      specializations: ["Dematerializer", "Guardian Turret", "Healing Beam"],
      gadgets: [
        "APS Turret", "Data Reshaper", "Defibrillator", "Explosive Mine", "Gas Mine",
        "Glitch Trap", "Jump Pad", "Zipline", "Proximity Sensor"
      ],
    },
    Heavy: {
      weapons: [
        "50 Akimbo", "Flamethrower", "KS-23", "Lewis Gun", "M60", "MG32",
        "SA1216", "Shak-50", "Sledgehammer", "Spear"
      ],
      specializations: ["Charge 'N' Slam", "Goo Gun", "Mesh Shield"],
      gadgets: [
        "Anti-Gravity Cube", "Barricade", "C4", "Dome Shield", "Explosive Mine",
        "Lockbolt Launcher", "Proximity Sensor", "Pyro Mine", "RPG-7"
      ],
    },
  };
  
  // Gadgets available to all builds
  const allBuildGadgets = [
    "Flashbang", "Frag Grenade", "Gas Grenade", "Goo Grenade", "Pyro Grenade", "Smoke Grenade"
  ];
  
  // Utility function to randomly select an item from an array
  function randomItem(array) {
    return array[Math.floor(Math.random() * array.length)];
  }
  
  // Function to generate unique gadgets
  function getUniqueGadgets(gadgetPool, count) {
    const uniqueGadgets = [];
    while (uniqueGadgets.length < count) {
      const gadget = randomItem([...gadgetPool, ...allBuildGadgets]);
      if (!uniqueGadgets.includes(gadget)) {
        uniqueGadgets.push(gadget);
      }
    }
    return uniqueGadgets;
  }
  
  // Function to generate loadout
  function generateLoadout(classType = null) {
    const outputDiv = document.getElementById("output");
    outputDiv.innerHTML = ""; // Clear previous loadout
  
    let animationInterval = setInterval(() => {
      const tempClass = classType || randomItem(Object.keys(loadouts));
      const tempData = loadouts[tempClass];
      const tempLoadout = {
        class: tempClass,
        weapon: randomItem(tempData.weapons),
        specialization: randomItem(tempData.specializations),
        gadgets: getUniqueGadgets(tempData.gadgets, 3),
      };
  
      // Display temporary loadout during animation
      outputDiv.innerHTML = `
        <p>Class: ${tempLoadout.class}</p>
        <p>Weapon: ${tempLoadout.weapon}</p>
        <p>Specialization: ${tempLoadout.specialization}</p>
        <p>Gadgets: ${tempLoadout.gadgets.join(", ")}</p>
      `;
    }, 150); // Change every 150ms for quick cycling
  
    setTimeout(() => {
      clearInterval(animationInterval);
  
      // Generate the final loadout
      const finalClass = classType || randomItem(Object.keys(loadouts));
      const finalData = loadouts[finalClass];
      const finalLoadout = {
        class: finalClass,
        weapon: randomItem(finalData.weapons),
        specialization: randomItem(finalData.specializations),
        gadgets: getUniqueGadgets(finalData.gadgets, 3),
      };
  
      // Display the final loadout
      outputDiv.innerHTML = `
        <h3>Final Loadout:</h3>
        <p>Class: ${finalLoadout.class}</p>
        <p>Weapon: ${finalLoadout.weapon}</p>
        <p>Specialization: ${finalLoadout.specialization}</p>
        <p>Gadgets: ${finalLoadout.gadgets.join(", ")}</p>
      `;
    }, 1500); // Total spin duration is 1.5 seconds
  }
  