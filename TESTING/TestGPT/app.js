let state = {
    selectedClass: null,
    isSpinning: false,
    currentSpin: 1,
    totalSpins: 0
};

document.addEventListener("DOMContentLoaded", () => {
    function adjustSlotMachineSize() {
        const container = document.querySelector(".items-container");
        if (!container) return; // Exit if not found

        const screenWidth = window.innerWidth;

        if (screenWidth < 480) {
            container.style.transform = "scale(0.7)";
        } else if (screenWidth < 768) {
            container.style.transform = "scale(0.8)";
        } else if (screenWidth < 991) {
            container.style.transform = "scale(0.9)";
        } else {
            container.style.transform = "scale(1)";
        }
    }

    // Ensure it runs on window resize
    window.addEventListener("resize", adjustSlotMachineSize);

    // ✅ Include `loadouts` inside `DOMContentLoaded`
    const loadouts = {
        Light: {
            weapons: ["93R", "Dagger", "LH1", "M26 Matter", "Recurve Bow", "Sword", "V9S", "XP-54", "Throwing Knives"],
            specializations: ["Cloaking Device", "Evasive Dash", "Grappling Hook"],
            gadgets: ["Breach Charge", "Gateway", "Glitch Grenade", "Gravity Vortex", "Sonar Grenade", "Stun Gun", "Thermal Bore", "Thermal Vision", "Tracking Dart", "Vanishing Bomb", "Goo Grenade", "Pyro Grenade", "Smoke Grenade", "Frag Grenade", "Flashbang"]
        },
        Medium: {
            weapons: ["AKM", "Cerberus 12GA", "Dual Blades", "FAMAS", "FCAR", "Model 1887", "Pike-556", "R.357", "Riot Shield"],
            specializations: ["Dematerializer", "Guardian Turret", "Healing Beam"],
            gadgets: ["APS Turret", "Data Reshaper", "Defibrillator", "Explosive Mine", "Gas Mine", "Glitch Trap", "Jump Pad", "Zipline", "Gas Grenade", "Goo Grenade", "Pyro Grenade", "Smoke Grenade", "Frag Grenade", "Flashbang", "Proximity Sensor"]
        },
        Heavy: {
            weapons: ["50 Akimbo", "Flamethrower", "KS-23", "Lewis Gun", "M60", "M32GL", "Sledgehammer", "SHAK-50", "Spear"],
            specializations: ["Charge N Slam", "Goo Gun", "Mesh Shield", "Winch Claw"],
            gadgets: ["Anti-Gravity Cube", "Barricade", "Dome Shield", "Lockbolt Launcher", "Pyro Mine", "Proximity Sensor", "RPG-7", "Goo Grenade", "Pyro Grenade", "Smoke Grenade", "Frag Grenade", "Flashbang", "Explosive Mine", "Gas Grenade"]
        }
    };

    // Get DOM elements
    const classButtons = document.querySelectorAll('.class-button');
    const spinButtons = document.querySelectorAll('.spin-button');
    const spinSelection = document.getElementById('spinSelection');
    const outputDiv = document.getElementById("output");

    // Add click handlers for class buttons
    classButtons.forEach(button => {
        button.addEventListener('click', () => {
            if (state.isSpinning) return;

            classButtons.forEach(b => b.classList.remove('selected', 'active')); 
            button.classList.add('selected', 'active');

            state.selectedClass = button.dataset.class;
            if (state.selectedClass === 'random') {
                spinLoadout(1);
            } else {
                spinSelection.classList.remove('disabled');
            }
        });
    });

    // Add click handlers for spin buttons
    spinButtons.forEach(button => {
        button.addEventListener('click', () => {
            if (state.isSpinning) return;

            spinButtons.forEach(b => b.classList.remove('selected', 'active'));
            button.classList.add('selected', 'active');
            state.totalSpins = parseInt(button.dataset.spins);
            state.currentSpin = state.totalSpins;

            spinLoadout();
        });
    });

    function spinLoadout(spins) {
        if (state.isSpinning) return;

        document.querySelectorAll(".class-button, .spin-button").forEach(btn => {
            btn.removeAttribute('disabled');
});

spinButtons.forEach(btn => {
    btn.classList.remove('selected', 'active');
    btn.removeAttribute('disabled');
});

spinSelection.classList.add('disabled');

        state.isSpinning = true;
        state.currentSpin = spins || state.currentSpin;
        state.totalSpins = spins || state.totalSpins;

        updateSpinCountdown();

        if (state.selectedClass === 'random') {
            displayRandomLoadout();
        } else {
            displayManualLoadout(state.selectedClass);
        }
    }
    function displayManualLoadout(classType) {
        const loadout = loadouts[classType];
        displayLoadout(classType, loadout);
    }
    function getRandomUniqueItems(array, n) {
        const shuffled = [...array].sort(() => Math.random() - 0.5);
        return shuffled.slice(0, n);
    }
    function createItemContainer(items, winningItem = null) {
        if (!items || items.length === 0) {
            console.error("createItemContainer received an empty items array");
            return `<div class="itemCol winner"><p>ERROR</p></div>`;
        }
    
        // Ensure a valid winner exists
        if (!winningItem || !items.includes(winningItem)) {
            winningItem = items[Math.floor(Math.random() * items.length)];
        }
    
        let spinningItems = [...items];
    
        if (items.length === 1) {
            spinningItems = [...loadouts[state.selectedClass]?.gadgets || []];
        }
    
        // Always ensure 8 items exist for animation
        while (spinningItems.length < 8) {
            spinningItems.push(spinningItems[Math.floor(Math.random() * spinningItems.length)]);
        }
    
        // Ensure the winning item is placed at position 4
        spinningItems = spinningItems.sort(() => Math.random() - 0.5);
        spinningItems[4] = winningItem;
    
        return spinningItems.map((item, index) => `
            <div class="itemCol ${index === 4 ? 'winner' : ''}">
                <img src="images/${item.replace(/ /g, "_")}.webp" alt="${item}" onerror="this.src='images/placeholder.webp'">
                <p>${item}</p>
            </div>
        `).join("");
    }
    function createItemContainer(items, winningItem = null) {
        // Function code here...
    }
    function startSpinAnimation(columns) {
        const itemHeight = 188;
        const baseSpeed = 12;
    
        // Configure stop times based on whether it's the final spin
        const isFinalSpin = state.currentSpin === 1;
    
        const stopTimes = columns.map((_, index) => {
            if (!isFinalSpin) {
                return 700 + (index * 110);
            }
            switch (index) {
                case 0: return 700;
                case 1: return 1200;
                case 2: return 1700;
                case 3: return 2200;
                case 4: return 2900;
                case 5: return 3900;
            }
        });
    
        let allStopped = new Array(columns.length).fill(false);
        const startTime = Date.now();
    
        const animate = () => {
            const currentTime = Date.now();
            let animationRunning = false;
    
            columns.forEach((column, index) => {
                if (!allStopped[index]) {
                    animationRunning = true;
    
                    const timeElapsed = currentTime - startTime;
                    const shouldStop = timeElapsed >= stopTimes[index];
                    const currentOffset = parseFloat(column.style.transform?.replace("translateY(", "").replace("px)", "")) || 0;
    
                    let speed = baseSpeed;
                    if (isFinalSpin) {
                        if (index === columns.length - 2 && timeElapsed > stopTimes[index] - 500) {
                            speed = baseSpeed * Math.max(0.3, (stopTimes[index] - timeElapsed) / 500);
                        } else if (index === columns.length - 1 && timeElapsed > stopTimes[index] - 800) {
                            speed = baseSpeed * Math.max(0.2, (stopTimes[index] - timeElapsed) / 800);
                        }
                    }
    
                    let newOffset = currentOffset + speed;
                    if (newOffset >= itemHeight * 8) newOffset = 0;
    
                    if (shouldStop) {
                        allStopped[index] = true;
                        newOffset = itemHeight;
                        const selectedItem = column.children[0];
                        if (selectedItem) {
                            selectedItem.classList.add("selected");
                            if (isFinalSpin) {
                                column.closest('.item-container').classList.add('final-glow');
                            }
                        }
                    }
    
                    column.style.transform = `translateY(${newOffset}px)`;
                }
            });
    
            if (animationRunning) {
                requestAnimationFrame(animate);
            } else {
                handleSpinComplete(columns);
            }
        };
    
        animate();
    }
    function startSpinAnimation(columns) {
        // Function code here...
    }
    
    function displayLoadout(classType, loadout) {
        const selectedWeapon = getRandomUniqueItems(loadout.weapons, 1)[0];
        const selectedSpec = getRandomUniqueItems(loadout.specializations, 1)[0];

        let remainingGadgets = [...loadout.gadgets];
        const selectedGadgets = [];
        for (let i = 0; i < 3; i++) {
            const randomIndex = Math.floor(Math.random() * remainingGadgets.length);
            selectedGadgets.push(remainingGadgets[randomIndex]);
            remainingGadgets.splice(randomIndex, 1);
        }

        const loadoutHTML = `
            <div class="items-container">
                <div class="item-container">
                    <div class="scroll-container">
                        ${createItemContainer([classType], classType)}
                    </div>
                </div>
                <div class="item-container">
                    <div class="scroll-container">
                        ${createItemContainer(loadout.weapons, selectedWeapon)}
                    </div>
                </div>
                <div class="item-container">
                    <div class="scroll-container">
                        ${createItemContainer(loadout.specializations, selectedSpec)}
                    </div>
                </div>
                ${selectedGadgets.map((gadget) => `
                    <div class="item-container">
                        <div class="scroll-container">
                            ${createItemContainer(loadout.gadgets, gadget)}
                        </div>
                    </div>
                `).join("")}
            </div>
        `;

        outputDiv.innerHTML = loadoutHTML;
        adjustSlotMachineSize();

        const scrollContainers = Array.from(outputDiv.querySelectorAll(".scroll-container"));
        if (scrollContainers.length > 0) {
            startSpinAnimation(scrollContainers);
        } else {
            console.error("Error: No scroll containers found");
        }
    }

    function updateSpinCountdown() {
        spinButtons.forEach(button => {
            if (parseInt(button.dataset.spins) === state.currentSpin) {
                button.classList.add('active');
            } else {
                button.classList.remove('active');
            }
        });
    }

    function handleSpinComplete(columns) {
        if (state.currentSpin > 1) {
            setTimeout(() => {
                state.currentSpin--;
                updateSpinCountdown();

                if (state.selectedClass === 'random') {
                    displayRandomLoadout();
                } else {
                    displayManualLoadout(state.selectedClass);
                }
            }, 500);
        } else {
            state.isSpinning = false;
            state.currentSpin = 1;
            state.totalSpins = 0;
            state.selectedClass = null;

            classButtons.forEach(btn => {
                btn.classList.remove('selected', 'active');
                btn.removeAttribute('disabled');
            });

            spinButtons.forEach(btn => {
                btn.classList.remove('selected', 'active');
                btn.removeAttribute('disabled');
            });

            spinSelection.classList.add('disabled');
        }
    }
       
document.getElementById("copyLoadoutButton")?.addEventListener("click", () => {
    const columns = Array.from(document.querySelectorAll(".scroll-container"));
    const selectedItems = columns.map(col => {
        const selectedItem = col.querySelector(".winner.selected");
        return selectedItem ? selectedItem.querySelector("p").innerText.trim() : "Unknown";
    });

    if (selectedItems.includes("Unknown")) {
        alert("Error: Not all items were selected. Try spinning again.");
        return;
    }

    const copyText = 
        "Class: " + selectedItems[0] + "\n" +
        "Weapon: " + selectedItems[1] + "\n" +
        "Specialization: " + selectedItems[2] + "\n" +
        "Gadget 1: " + selectedItems[3] + "\n" +
        "Gadget 2: " + selectedItems[4] + "\n" +
        "Gadget 3: " + selectedItems[5];

    navigator.clipboard.writeText(copyText)
        .then(() => alert("Loadout copied to clipboard!"))
        .catch(err => console.error("Could not copy text: ", err));
});  

});  // ✅ This now properly closes `DOMContentLoaded`
