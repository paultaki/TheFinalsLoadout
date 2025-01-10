const loadouts = {
    Light: {
        weapons: ["93R", "Dagger", "L1H", "M11", "M26 Matter", "Recurve Bow", "SH900", "SR-84", "Sword", "V95", "XP-54", "Throwing Knives"],
        specializations: ["Cloaking Device", "Evasive Dash", "Grappling Hook"],
        gadgets: ["Breach Charge", "Flashbang", "Frag Grenade", "Gas Grenade", "Gateway", "Glitch Grenade", "Goo Grenade", "Gravity Vortex", "Pyro Grenade", "Smoke Grenade", "Sonar Grenade", "Stun Gun", "Thermal Bore", "Thermal Vision", "Tracking Dart", "Vanishing Bomb"]
    },
    Medium: {
        weapons: ["AKM", "Cerberus 12GA", "CL-40", "Dual Blades", "FAMAS", "FCLAR", "Model 1887", "Pike-556", "R-357", "Riot Shield"],
        specializations: ["Dematerializer", "Guardian Turret", "Healing Beam"],
        gadgets: ["APS Turret", "Data Reshaper", "Defibrillator", "Explosive Mine", "Flashbang", "Frag Grenade", "Gas Grenade", "Goo Grenade", "Jump Pad", "Motion Sensor", "Pyro Grenade", "Smoke Grenade", "Zipline"]
    },
    Heavy: {
        weapons: [".50 Akimbo", "Flamethrower", "IS-23", "Lewis Gun", "MG32K", "M69", "SA1216", "SHAK-50", "Sledgehammer", "Spear"],
        specializations: ["Charge 'n' Slam", "Goo Gun", "Mesh Shield", "Winch Claw"],
        gadgets: ["Anti-Gravity Cube", "Barricade", "C4", "Dome Shield", "Explosive Mine", "Flashbang", "Frag Grenade", "Gas Grenade", "Goo Grenade", "Motion Sensor", "Pyro Grenade", "Pyro Mine", "RPG-7", "Smoke Grenade", "Lockbolt Launcher"]
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

// Main loadout generator function
function generateLoadout(spins) {
    let finalLoadout;
    for (let i = 0; i < spins; i++) {
        const classType = randomItem(Object.keys(loadouts));
        const data = loadouts[classType];
        const selectedGadgets = getUniqueGadgets(data.gadgets, 3); // Ensure unique gadgets
        finalLoadout = {
            class: classType,
            weapon: randomItem(data.weapons),
            specialization: randomItem(data.specializations),
            gadgets: selectedGadgets
        };
    }
    displayLoadout(finalLoadout);
}

// Function for a funny/challenging loadout
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

// Function to display the generated loadout
function displayLoadout(loadout) {
    console.log("Final Loadout:");
    console.log(`- Class: ${loadout.class}`);
    console.log(`- Weapon: ${loadout.weapon}`);
    console.log(`- Specialization: ${loadout.specialization}`);
    console.log(`- Gadgets: ${loadout.gadgets.join(", ")}`);
}
