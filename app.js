const loadouts = {
    Light: {
        weapons: ["G3R", "Dagger", "LIH", "M11", "M26 Matter", "Recurve Bow", "SH900", "SR-84", "Sword", "V95", "XP-54", "Throwing Knives"],
        specializations: ["Cloaking Device", "Evasive Dash", "Grappling Hook"],
        gadgets: ["Breach Charge", "Flashbang", "Frag Grenade", "Gas Grenade", "Gateway", "Glitch Grenade", "Goo Grenade", "Gravity Vortex", "Jump Pad", "Motion Sensor", "Pyro Grenade", "Smoke Grenade"]
    },
    Medium: {
        weapons: ["AXM", "Cerberus 12GA", "CL-40", "Dual Blades", "FAMAS", "FCLAR", "Model 1887", "Pike-556", "R-357", "Riot Shield"],
        specializations: ["Dematerializer", "Guardian Turret", "Healing Beam"],
        gadgets: ["APS Turret", "Data Reshaper", "Defibrillator", "Explosive Mine", "Flashbang", "Frag Grenade", "Gas Grenade", "Goo Grenade", "Jump Pad", "Motion Sensor", "Pyro Grenade", "Smoke Grenade"]
    },
    Heavy: {
        weapons: ["ES-06 Akimbo", "Flamethrower", "IS-23", "Lewis Gun", "MG32K", "M69", "SA1216", "SHAK-50", "Sledgehammer", "Spear"],
        specializations: ["Charge 'n Slam", "Goo Gun", "Mesh Shield", "Winch Claw"],
        gadgets: ["Anti-Gravity Cube", "Barricade", "C4", "Dome Shield", "Explosive Mine", "Flashbang", "Frag Grenade", "Gas Grenade", "Goo Grenade", "Jump Pad", "Motion Sensor", "Pyro Grenade", "Smoke Grenade"]
    }
};

// Function to randomly select an item from an array
function randomItem(array) {
    return array[Math.floor(Math.random() * array.length)];
}

// Function to generate unique gadgets
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

// Function to generate loadouts with animation
function generateLoadout(spins) {
    const outputDiv = document.getElementById("output");
    outputDiv.innerHTML = ""; // Clear previous loadout

    let animationInterval = setInterval(() => {
        const classType = randomItem(Object.keys(loadouts));
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

        // Generate the final loadout
        const classType = randomItem(Object.keys(loadouts));
        const data = loadouts[classType];
        const finalLoadout = {
            class: classType,
            weapon: randomItem(data.weapons),
            specialization: randomItem(data.specializations),
            gadgets: getUniqueGadgets(data.gadgets, 3),
        };

        // Display the final loadout
        outputDiv.innerHTML = `
            <h3>Final Loadout:</h3>
            <p>Class: ${finalLoadout.class}</p>
            <p>Weapon: ${finalLoadout.weapon}</p>
            <p>Specialization: ${finalLoadout.specialization}</p>
            <p>Gadgets: ${finalLoadout.gadgets.join(", ")}</p>
        `;
    }, spins * 1000); // Cycle for the duration (e.g., 4 spins = 4 seconds)
}
