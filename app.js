const loadouts = {
    Light: {
        weapons: ["93R", "Dagger", "LH1", "M11", "M26 Matter", "Recurve Bow", "SH900", "SR-84", "Sword", "V95", "XP-54", "Throwing Knives"],
        specializations: ["Cloaking Device", "Evasive Dash", "Grappling Hook"],
        gadgets: ["Breach Charge", "Flashbang", "Frag Grenade", "Gas Grenade", "Gateway", "Glitch Grenade", "Goo Grenade", "Gravity Vortex", "Pyro Grenade", "Smoke Grenade", "Sonar Grenade", "Stun Gun", "Thermal Bore", "Thermal Vision", "Tracking Dart", "Vanishing Bomb"]
    },
    Medium: {
        weapons: ["AKM", "Cerberus 12GA", "CL-40", "Dual Blades", "FAMAS", "FCLAR", "Model 1887", "Pike-556", "R-357", "Riot Shield"],
        specializations: ["Dematerializer", "Guardian Turret", "Healing Beam"],
        gadgets: ["APS Turret", "Data Reshaper", "Defibrillator", "Explosive Mine", "Flashbang", "Frag Grenade", "Gas Grenade", "Glitch Trap", "Goo Grenade", "Jump Pad", "Motion Sensor", "Pyro Grenade", "Smoke Grenade", "Zipline"]
    },
    Heavy: {
        weapons: [".50 Akimbo", "Flamethrower", "IS-23", "Lewis Gun", "MG32K", "MG9", "SA1216", "SHAK-50", "Sledgehammer", "Spear"],
        specializations: ["Charge 'n' Slam", "Goo Gun", "Mesh Shield", "Winch Claw"],
        gadgets: ["Anti-Gravity Cube", "Barricade", "C4", "Dome Shield", "Explosive Mine", "Flashbang", "Frag Grenade", "Gas Grenade", "Goo Grenade", "Motion Sensor", "Pyro Grenade", "Pyro Mine", "RPG-7", "Smoke Grenade", "Lockbolt Launcher"]
    }
};

function randomItem(array) {
    return array[Math.floor(Math.random() * array.length)];
}

function generateLoadout(spins) {
    let finalLoadout;
    for (let i = 0; i < spins; i++) {
        const classType = randomItem(Object.keys(loadouts));
        const data = loadouts[classType];
        finalLoadout = {
            class: classType,
            weapon: randomItem(data.weapons),
            specialization: randomItem(data.specializations),
            gadgets: [randomItem(data.gadgets), randomItem(data.gadgets), randomItem(data.gadgets)]
        };
    }
    displayLoadout(finalLoadout);
}

function generateFunnyLoadout() {
    const classType = randomItem(Object.keys(loadouts));
    const data = loadouts[classType];
    const funnyLoadout = {
        class: classType,
        weapon: randomItem(data.weapons),
        specialization: randomItem(data.specializations),
        gadgets: [randomItem(data.gadgets), randomItem(data.gadgets), randomItem(data.gadgets)]
    };
    displayLoadout(funnyLoadout, true);
}

function displayLoadout(loadout, isFunny = false) {
    const output = document.getElementById("output");
    const type = isFunny ? "Funny Loadout" : "Final Loadout";
    output.textContent = `${type}:
- Class: ${loadout.class}
- Weapon: ${loadout.weapon}
- Specialization: ${loadout.specialization}
- Gadgets: ${loadout.gadgets.join(", ")}`;
}
