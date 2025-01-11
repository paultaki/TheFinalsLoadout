// Define loadouts for each class
const loadouts = {
    Light: {
      weapons: ["SR-84", "Recurve Bow", "Throwing Knives", "XP-54"],
      specializations: ["Cloaking Device", "Evasive Dash", "Grappling Hook"],
      gadgets: ["Flashbang", "Gravity Vortex", "Smoke Grenade", "Goo Grenade"],
    },
    Medium: {
      weapons: ["AKM", "FAMAS", "Riot Shield", "Healing Beam"],
      specializations: ["Guardian Turret", "Healing Beam", "Dematerializer"],
      gadgets: ["Frag Grenade", "Motion Sensor", "Gas Grenade"],
    },
    Heavy: {
      weapons: ["MG36", "Sledgehammer", "SA1216", "SHAK-50"],
      specializations: ["Shield", "Explosive Armor", "Deployable Cover"],
      gadgets: ["Anti-Gravity Cube", "Barricade", "Goo Grenade"],
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
  