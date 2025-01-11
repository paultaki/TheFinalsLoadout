document.addEventListener("DOMContentLoaded", () => {
    const randomLoadoutButton = document.getElementById("randomLoadoutButton");
    const lightLoadoutButton = document.getElementById("lightLoadoutButton");
    const mediumLoadoutButton = document.getElementById("mediumLoadoutButton");
    const heavyLoadoutButton = document.getElementById("heavyLoadoutButton");
    const outputContainer = document.getElementById("output");

    if (!randomLoadoutButton || !lightLoadoutButton || !mediumLoadoutButton || !heavyLoadoutButton) {
        console.error("One or more buttons not found!");
        return;
    }

    const loadouts = {
        Light: {
            weapons: ["93R", "Dagger", "LH1", "M26 Matter", "Recurve Bow", "Sword", "V9S", "XP-54"],
            specializations: ["Cloaking Device", "Evasive Dash", "Grappling Hook"],
            gadgets: ["Breach Charge", "Gateway", "Glitch Grenade", "Gravity Vortex", "Sonar Grenade", "Stun Gun", "Thermal Bore", "Thermal Vision", "Tracking Dart", "Vanishing Bomb"]
        },
        Medium: {
            weapons: ["AKM", "Cerberus 12GA", "Dual Blades", "FAMAS", "FCAR", "Model 1887", "Pike-556", "R.357"],
            specializations: ["Dematerializer", "Guardian Turret", "Healing Beam"],
            gadgets: ["APS Turret", "Data Reshaper", "Defibrillator", "Explosive Mine", "Gas Mine", "Glitch Trap", "Jump Pad", "Zipline"]
        },
        Heavy: {
            weapons: ["50 Akimbo", "Flamethrower", "KS-23", "Lewis Gun", "M60", "MGL32", "RPG-7", "Sledgehammer", "SHAK-50", "Spear"],
            specializations: ["Charge 'N' Slam", "Goo Gun", "Mesh Shield", "Winch Claw"],
            gadgets: ["Anti-Gravity Cube", "Barricade", "Dome Shield", "Lockbolt Launcher", "Pyro Mine", "Motion Sensor"]
        },
        Common: ["Flashbang", "Frag Grenade", "Gas Grenade", "Goo Grenade", "Pyro Grenade", "Smoke Grenade"]
    };

    const randomItem = (array) => array[Math.floor(Math.random() * array.length)];

    const displayLoadout = (classType, loadout) => {
        outputContainer.innerHTML = `
            <div class="class-name">${classType}</div>
            <div class="output-container">
                <div>
                    <img src="images/${loadout.specialization.replaceAll(" ", "_")}_Rank_1.png" alt="${loadout.specialization}" />
                    <p>${loadout.specialization}</p>
                </div>
                <div>
                    <img src="images/${loadout.weapon.replaceAll(" ", "_")}_Rank_1.png" alt="${loadout.weapon}" />
                    <p>${loadout.weapon}</p>
                </div>
                <div class="gadgets-container">
                    ${loadout.gadgets.map(gadget => `<img src="images/${gadget.replaceAll(" ", "_")}_Rank_1.png" alt="${gadget}" />`).join("")}
                </div>
            </div>
        `;
    };

    const generateLoadout = (classType) => {
        const classLoadouts = loadouts[classType];
        const loadout = {
            weapon: randomItem(classLoadouts.weapons),
            specialization: randomItem(classLoadouts.specializations),
            gadgets: [
                randomItem(classLoadouts.gadgets),
                randomItem(loadouts.Common),
                randomItem(loadouts.Common)
            ]
        };
        displayLoadout(classType, loadout);
    };

    randomLoadoutButton.onclick = () => {
        const classes = Object.keys(loadouts).filter((key) => key !== "Common");
        const randomClass = randomItem(classes);
        generateLoadout(randomClass);
    };

    lightLoadoutButton.onclick = () => generateLoadout("Light");
    mediumLoadoutButton.onclick = () => generateLoadout("Medium");
    heavyLoadoutButton.onclick = () => generateLoadout("Heavy");
});
