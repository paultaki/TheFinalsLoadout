document.addEventListener("DOMContentLoaded", () => {
    const randomLoadoutButton = document.getElementById("randomLoadoutButton");
    const lightLoadoutButton = document.getElementById("lightLoadoutButton");
    const mediumLoadoutButton = document.getElementById("mediumLoadoutButton");
    const heavyLoadoutButton = document.getElementById("heavyLoadoutButton");
    const outputDiv = document.getElementById("output");

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
        const gadgetImages = loadout.gadgets
            .map((gadget) => {
                const formattedGadget = gadget.replaceAll(" ", "_");
                const imageFile = `./images/${formattedGadget}_Rank_1.png`;
                return `
                    <div class="item-container">
                        <img src="${imageFile}" alt="${gadget}">
                        <p>${gadget}</p>
                    </div>
                `;
            })
            .join("");

        outputDiv.innerHTML = `
            <div class="class">${classType}</div>
            <div class="items-container">
                <div class="item-container">
                    <img src="./images/${loadout.weapon.replaceAll(" ", "_")}_Rank_1.png" alt="${loadout.weapon}">
                    <p>${loadout.weapon}</p>
                </div>
                <div class="item-container">
                    <img src="./images/${loadout.specialization.replaceAll(" ", "_")}_Rank_1.png" alt="${loadout.specialization}">
                    <p>${loadout.specialization}</p>
                </div>
                ${gadgetImages}
            </div>
        `;
    };

    const generateLoadout = (classType, loadouts) => {
        const availableGadgets = [...loadouts.gadgets];
        const loadout = {
            weapon: randomItem(loadouts.weapons),
            specialization: randomItem(loadouts.specializations),
            gadgets: [
                availableGadgets.splice(Math.floor(Math.random() * availableGadgets.length), 1)[0],
                availableGadgets.splice(Math.floor(Math.random() * availableGadgets.length), 1)[0],
                availableGadgets.splice(Math.floor(Math.random() * availableGadgets.length), 1)[0]
            ]
        };
        displayLoadout(classType, loadout);
    };

    randomLoadoutButton.onclick = () => {
        const classes = Object.keys(loadouts).filter((key) => key !== "Common");
        const randomClass = randomItem(classes);
        generateLoadout(randomClass, loadouts[randomClass]);
    };

    lightLoadoutButton.onclick = () => generateLoadout("Light", loadouts.Light);
    mediumLoadoutButton.onclick = () => generateLoadout("Medium", loadouts.Medium);
    heavyLoadoutButton.onclick = () => generateLoadout("Heavy", loadouts.Heavy);
});
