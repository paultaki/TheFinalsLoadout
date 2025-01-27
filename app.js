document.addEventListener("DOMContentLoaded", () => {
    const randomLoadoutButton = document.getElementById("randomLoadoutButton");
    const lightLoadoutButton = document.getElementById("lightLoadoutButton");
    const mediumLoadoutButton = document.getElementById("mediumLoadoutButton");
    const heavyLoadoutButton = document.getElementById("heavyLoadoutButton");
    const outputDiv = document.getElementById("output");

    const loadouts = {
        Light: {
            weapons: ["93R", "Dagger", "LH1", "M26 Matter", "Recurve Bow", "Sword", "V9S", "XP-54", "Throwing Knives"],
            specializations: ["Cloaking Device", "Evasive Dash", "Grappling Hook"],
            gadgets: ["Breach Charge", "Gateway", "Glitch Grenade", "Gravity Vortex", "Sonar Grenade", "Stun Gun", "Thermal Bore", "Thermal Vision", "Tracking Dart", "Vanishing Bomb", "Goo Grenade", "Pyro Grenade", "Smoke Grenade", "Frag Grenade", "Flashbang"]
        },
        Medium: {
            weapons: ["AKM", "Cerberus 12GA", "Dual Blades", "FAMAS", "FCAR", "Model 1887", "Pike-556", "R.357", "Riot Shield"],
            specializations: ["Dematerializer", "Guardian Turret", "Healing Beam"],
            gadgets: ["APS Turret", "Data Reshaper", "Defibrillator", "Explosive Mine", "Gas Mine", "Glitch Trap", "Jump Pad", "Zipline", "Gas Grenade", "Goo Grenade", "Pyro Grenade", "Smoke Grenade", "Frag Grenade","Flashbang", "Proximity Sensor"]
        },
        Heavy: {
            weapons: ["50 Akimbo", "Flamethrower", "KS-23", "Lewis Gun", "M60", "MGL32", "Sledgehammer", "SHAK-50", "Spear"],
            specializations: ["Charge_N_Slam", "Goo Gun", "Mesh Shield", "Winch Claw"],
            gadgets: ["Anti-Gravity Cube", "Barricade", "Dome Shield", "Lockbolt Launcher", "Pyro Mine", "Proximity Sensor", "RPG-7", "Goo Grenade", "Pyro Grenade", "Smoke Grenade", "Grenade", "Flashbang", "Explosive Mine", "Frag Grenade", "Gas Grenade"]
        }
    };

    const shuffleArray = (array) => {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    };

    const getRandomUniqueItems = (array, n) => {
        const shuffled = shuffleArray(array);
        return shuffled.slice(0, n);
    };

    const createItemContainer = (items) => {
        let repeatedItems = [...items];
        while (repeatedItems.length < 8) {
            repeatedItems.push(...items);
        }
        repeatedItems = shuffleArray(repeatedItems);
        repeatedItems.length = 8;

        return repeatedItems
            .map(
                (item) => `
                    <div class="itemCol">
                        <img src="images/${item.replaceAll(" ", "_")}_Rank_1.png" alt="${item}">
                        <p>${item}</p>
                    </div>
                `
            )
            .join("");
    };

    const startSpinAnimation = (columns, callback) => {
        const itemHeight = 188;
        const stopOffsets = columns.map((_, index) => itemHeight * (1 + index));

        let allStopped = new Array(columns.length).fill(false);

        document.querySelectorAll(".outlineCircleBtn, .random").forEach((btn) => btn.setAttribute("disabled", "true"));

        const animate = () => {
            let animationRunning = false;

            columns.forEach((column, index) => {
                if (!allStopped[index]) {
                    animationRunning = true;

                    const currentOffset = parseFloat(column.style.transform.replace("translateY(", "").replace("px)", "")) || 0;
                    const newOffset = currentOffset + 7;
                    column.style.transform = `translateY(${newOffset}px)`;

                    if (newOffset >= stopOffsets[index]) {
                        allStopped[index] = true;
                        column.style.transform = `translateY(${stopOffsets[index]}px)`;
                        const selectedIndex = (7 - ((stopOffsets[index] / itemHeight) % 8)) % 8;
                        const selectedItem = column.children[selectedIndex];
                        selectedItem.classList.add("selected");
                    }
                }
            });

            if (animationRunning) {
                requestAnimationFrame(animate);
            } else {
                document.querySelectorAll(".outlineCircleBtn, .random").forEach((btn) => btn.removeAttribute("disabled"));
                callback(columns.map((col) => col.querySelector(".selected").innerText.trim()));
            }
        };

        animate();
    };

    const displayLoadout = ({ weapons, specializations, gadgets }, classType) => {
        const selectedGadgets = getRandomUniqueItems(gadgets, 3);

        const loadoutHTML = `
            <div class="items-container">
                <div class="item-container">
                    <div class="scroll-container">${createItemContainer([classType])}</div>
                </div>
                <div class="item-container">
                    <div class="scroll-container">${createItemContainer(weapons)}</div>
                </div>
                <div class="item-container">
                    <div class="scroll-container">${createItemContainer(specializations)}</div>
                </div>
                ${shuffleArray(selectedGadgets)
                    .map(
                        (gadget) => `
                        <div class="item-container">
                            <div class="scroll-container">
                                ${createItemContainer([gadget])}
                            </div>
                        </div>`
                    )
                    .join("")}
            </div>
            <button class="copy-button" onclick="copyLoadout()">Copy Loadout</button>
            <a href="./punishment-loadout/" id="punishmentLoadoutButton" class="outlineBtnStyle">
                <img src="images/punishment.png" class="skull-icon" alt="skull">
                The Punishment Loadout
                <img src="images/punishment.png" class="skull-icon" alt="skull">
            </a>
        `;

        outputDiv.innerHTML = loadoutHTML;

        const scrollContainers = Array.from(outputDiv.querySelectorAll(".scroll-container"));
        startSpinAnimation(scrollContainers, (selectedItems) => {
            console.log("Selected Items:", selectedItems);
        });
    };

    const setActiveButton = (button) => {
        [lightLoadoutButton, mediumLoadoutButton, heavyLoadoutButton].forEach((btn) =>
            btn.classList.remove("active")
        );
        button.classList.add("active");
    };

    const generateLoadout = (classType, button) => {
        setActiveButton(button);
        const loadout = loadouts[classType];
        displayLoadout(loadout, classType);
    };

    lightLoadoutButton.onclick = () => {
        generateLoadout("Light", lightLoadoutButton);
    };

    mediumLoadoutButton.onclick = () => {
        generateLoadout("Medium", mediumLoadoutButton);
    };

    heavyLoadoutButton.onclick = () => {
        generateLoadout("Heavy", heavyLoadoutButton);
    };

    randomLoadoutButton.onclick = () => {
        const classes = ["Light", "Medium", "Heavy"];
        const randomClass = classes[Math.floor(Math.random() * classes.length)];
        const buttonMap = {
            Light: lightLoadoutButton,
            Medium: mediumLoadoutButton,
            Heavy: heavyLoadoutButton
        };
        generateLoadout(randomClass, buttonMap[randomClass]);
    };

    lightLoadoutButton.onclick();
});

window.copyLoadout = () => {
    const columns = Array.from(document.querySelectorAll(".scroll-container"));
    const selectedItems = columns.map(
        (col) => col.querySelector(".selected").innerText.trim()
    );

    const copyText = `Class: ${selectedItems[0]}, Weapon: ${selectedItems[1]}, Specialization: ${selectedItems[2]}, Gadgets: ${selectedItems[3]}, ${selectedItems[4]}, ${selectedItems[5]}`.trim();

    navigator.clipboard
        .writeText(copyText)
        .then(() => alert("Loadout copied to clipboard!"))
        .catch((err) => console.error("Could not copy text: ", err));
};

document.addEventListener("DOMContentLoaded", () => {
    const recentBuffsSection = document.querySelector(".recentBuffsSection .buffs-container");

    // Latest patch notes: Weapon-Only Changes
    const latestPatch = {
        date: "January 22, 2025",
        changes: {
            buffs: [
                { weapon: "Lewis and M60", description: "Reduced visual recoil on Red Dot sights to align with other weapons." }
            ],
            nerfs: [], // Empty nerfs array for N/A
            fixes: [
                { weapon: "Spear", description: "Fixed an issue allowing sliding while performing the secondary spin attack." },
                { weapon: "Sword", description: "Jump Pad secondary attack now launches players the intended (longer) distance." },
                { weapon: "Dual Blades", description: "Resolved bug causing Dual Blades to get stuck swinging only once after swapping from a deployable." },
                { weapon: "Dagger", description: "Fixed backstab charge-up not re-triggering after a vault if input was held." }
            ]
        }
    };

    if (recentBuffsSection) {
        recentBuffsSection.innerHTML = `
            <div class="buff-item">
                <p class="patch-date">Patch Date: ${latestPatch.date}</p>
                <div class="changes-category">
                    <h3>Buffs</h3>
                    <ul>
                        ${latestPatch.changes.buffs.map(buff => `<li><strong>${buff.weapon}:</strong> ${buff.description}</li>`).join("")}
                    </ul>
                </div>
                <div class="changes-category">
                    <h3>Nerfs</h3>
                    <ul>
                        ${
                            latestPatch.changes.nerfs.length
                                ? latestPatch.changes.nerfs.map(nerf => `<li><strong>${nerf.mode}:</strong> ${nerf.description}</li>`).join("")
                                : "<li>N/A</li>"
                        }
                    </ul>
                </div>
                <div class="changes-category">
                    <h3>Fixes</h3>
                    <ul>
                        ${latestPatch.changes.fixes.map(fix => `<li><strong>${fix.weapon}:</strong> ${fix.description}</li>`).join("")}
                    </ul>
                </div>
            </div>
        `;
    }
});