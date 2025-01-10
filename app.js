const loadouts = {
    Light: {
      weapons: ["G3R", "Dagger", "LIH", "M11", "M26 Matter"],
      specializations: ["Cloaking Device", "Evasive Dash", "Grappling Hook"],
      gadgets: ["Breach Charge", "Flashbang", "Gas Grenade"]
    },
    Medium: {
      weapons: ["AKM", "Cerberus 12GA", "Dual Blades", "FAMAS"],
      specializations: ["Dematerializer", "Guardian Turret", "Healing Beam"],
      gadgets: ["APS Turret", "Defibrillator", "Flashbang"]
    },
    Heavy: {
      weapons: ["IS-23", "MG32X", "Sledgehammer"],
      specializations: ["Charge 'n Slam", "Goo Gun", "Mesh Shield"],
      gadgets: ["Anti-Gravity Cube", "C4", "Explosive Mine"]
    }
  };
  
  function randomItem(array) {
    return array[Math.floor(Math.random() * array.length)];
  }
  
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
  
  function generateLoadout(spins) {
    for (let i = 0; i < spins; i++) {
      const classType = randomItem(Object.keys(loadouts));
      const data = loadouts[classType];
      const loadout = {
        class: classType,
        weapon: randomItem(data.weapons),
        specialization: randomItem(data.specializations),
        gadgets: getUniqueGadgets(data.gadgets, 3)
      };
      displayLoadout(loadout);
    }
  }
  
  function generateFunnyLoadout() {
    const classType = randomItem(Object.keys(loadouts));
    const data = loadouts[classType];
    const funnyLoadout = {
      class: classType,
      weapon: randomItem(data.weapons),
      specialization: randomItem(data.specializations),
      gadgets: [
        randomItem(data.gadgets),
        randomItem(data.gadgets),
        randomItem(data.gadgets)
      ]
    };
    displayLoadout(funnyLoadout);
  }
  
  function displayLoadout(loadout) {
    const outputDiv = document.getElementById("output");
    const loadoutHTML = `
      <div>
        <h3>Final Loadout:</h3>
        <p>Class: ${loadout.class}</p>
        <p>Weapon: ${loadout.weapon}</p>
        <p>Specialization: ${loadout.specialization}</p>
        <p>Gadgets: ${loadout.gadgets.join(", ")}</p>
      </div>
    `;
    outputDiv.innerHTML += loadoutHTML;
  }
  