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
        const itemHeight = 188; // Height of each item
        const totalSpinTime = 2000; // Total time all columns spin together
        const stopDelay = 500; // Delay between each column stopping
    
        // Disable buttons during animation
        document.querySelectorAll(".outlineCircleBtn, .random").forEach((btn) => btn.setAttribute("disabled", "true"));
    
        // Function to animate each column
        const animateColumn = (column, index) => {
            let startTime = null;
    
            const spin = (timestamp) => {
                if (!startTime) startTime = timestamp;
                const elapsed = timestamp - startTime;
    
                // Calculate the current offset
                const currentOffset = (elapsed * 0.5) % (itemHeight * 8); // Adjust speed as needed
                column.style.transform = `translateY(-${currentOffset}px)`;
    
                if (elapsed < totalSpinTime + index * stopDelay) {
                    requestAnimationFrame(spin);
                } else {
                    // Snap to the nearest item
                    const finalOffset = Math.round(currentOffset / itemHeight) * itemHeight;
                    column.style.transform = `translateY(-${finalOffset}px)`;
    
                    // Highlight the selected item
                    const selectedIndex = Math.floor(finalOffset / itemHeight) % 8;
                    const selectedItem = column.children[selectedIndex];
                    selectedItem.classList.add("selected");
    
                    // Check if all columns have stopped
                    if (index === columns.length - 1) {
                        // Re-enable buttons after all animations are complete
                        document.querySelectorAll(".outlineCircleBtn, .random").forEach((btn) => btn.removeAttribute("disabled"));
                        // Execute callback with selected items
                        callback(columns.map((col) => col.querySelector(".selected").innerText.trim()));
                    }
                }
            };
    
            // Start the animation
            requestAnimationFrame(spin);
        };
    
        // Start all columns spinning simultaneously
        columns.forEach((column, index) => {
            animateColumn(column, index);
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
