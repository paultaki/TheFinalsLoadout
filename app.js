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
            gadgets1: ["Breach Charge", "Gateway", "Glitch Grenade"],
            gadgets2: ["Gravity Vortex", "Sonar Grenade", "Stun Gun"],
            gadgets3: ["Thermal Bore", "Thermal Vision", "Tracking Dart", "Vanishing Bomb"]
        },
        Medium: {
            weapons: ["AKM", "Cerberus 12GA", "Dual Blades", "FAMAS", "FCAR", "Model 1887", "Pike-556", "R.357"],
            specializations: ["Dematerializer", "Guardian Turret", "Healing Beam"],
            gadgets1: ["APS Turret", "Data Reshaper"],
            gadgets2: ["Defibrillator", "Explosive Mine", "Gas Mine"],
            gadgets3: ["Glitch Trap", "Jump Pad", "Zipline"]
        },
        Heavy: {
            weapons: ["50 Akimbo", "Flamethrower", "KS-23", "Lewis Gun", "M60", "MGL32", "Sledgehammer", "SHAK-50", "Spear"],
            specializations: ["Charge_N_Slam", "Goo Gun", "Mesh Shield", "Winch Claw"],
            gadgets1: ["Anti-Gravity Cube", "Barricade"],
            gadgets2: ["Dome Shield", "Lockbolt Launcher"],
            gadgets3: ["Pyro Mine", "Motion Sensor", "RPG-7"]
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

    const createItemContainer = (items) => {
        let repeatedItems = [...items];
        while (repeatedItems.length < 20) { // Increase repetitions
            repeatedItems.push(...items);
        }
        repeatedItems = shuffleArray(repeatedItems); // Randomize order
        repeatedItems.length = 20; // Trim to exactly 20 items
    
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
        const itemHeight = 188; // Height of each item
        const totalSpinTime = 3000; // Total time all columns spin
        const stopDelay = 500; // Delay between stopping each column
    
        let allStopped = new Array(columns.length).fill(false);
    
        // Disable buttons during animation
        document.querySelectorAll(".outlineCircleBtn, .random").forEach((btn) => btn.setAttribute("disabled", "true"));
    
        const animateColumn = (column, index) => {
            const startTime = performance.now();
    
            const spin = () => {
                const elapsed = performance.now() - startTime;
                const offset = (elapsed * 2) % (itemHeight * 20); // Adjust for increased items
                column.style.transform = `translateY(-${offset}px)`;
    
                if (elapsed < totalSpinTime + index * stopDelay) {
                    requestAnimationFrame(spin);
                } else {
                    // Snap to the nearest item and stop
                    const finalOffset = Math.round(offset / itemHeight) * itemHeight;
                    column.style.transform = `translateY(-${finalOffset}px)`;
    
                    // Highlight the selected item
                    const selectedIndex = Math.floor(finalOffset / itemHeight) % 20;
                    const selectedItem = column.children[selectedIndex];
                    selectedItem.classList.add("selected");
    
                    allStopped[index] = true;
                    if (allStopped.every(Boolean)) {
                        // Re-enable buttons after all animations complete
                        document.querySelectorAll(".outlineCircleBtn, .random").forEach((btn) => btn.removeAttribute("disabled"));
                        callback(columns.map((col) => col.querySelector(".selected").innerText.trim()));
                    }
                }
            };
    
            spin();
        };
    
        // Start spinning all columns
        columns.forEach((column, index) => {
            setTimeout(() => animateColumn(column, index), index * stopDelay);
        });
    };
    

            spin();
        };

        // Start spinning all columns
        columns.forEach((column, index) => {
            setTimeout(() => animateColumn(column, index), index * stopDelay);
        });
    };

    const displayLoadout = ({ weapons, specializations, gadgets1, gadgets2, gadgets3 }) => {
        const loadoutHTML = `
            <div class="items-container">
                <div class="item-container">
                    <div class="scroll-container">${createItemContainer(weapons)}</div>
                </div>
                <div class="item-container">
                    <div class="scroll-container">${createItemContainer(specializations)}</div>
                </div>
                <div class="item-container">
                    <div class="scroll-container">${createItemContainer(gadgets1)}</div>
                </div>
                <div class="item-container">
                    <div class="scroll-container">${createItemContainer(gadgets2)}</div>
                </div>
                <div class="item-container">
                    <div class="scroll-container">${createItemContainer(gadgets3)}</div>
                </div>
            </div>
            <button class="copy-button" onclick="copyLoadout()">Copy Loadout</button>
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
        displayLoadout(loadout);
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

    const copyText = `
        Weapon: ${selectedItems[0]}, Specialization: ${selectedItems[1]}, Gadgets: ${selectedItems[2]}, ${selectedItems[3]}, ${selectedItems[4]}
    `.trim();

    navigator.clipboard
        .writeText(copyText)
        .then(() => alert("Loadout copied to clipboard!"))
        .catch((err) => console.error("Could not copy text: ", err));
};
