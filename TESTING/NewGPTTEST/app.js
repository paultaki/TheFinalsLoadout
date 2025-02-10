document.addEventListener("DOMContentLoaded", () => {
    // State management
    let state = {
        selectedClass: null,
        isSpinning: false,
        currentSpin: 1,
        totalSpins: 0,
        selectedGadgets: new Set(),
        gadgetQueue: {
            Light: [],
            Medium: [],
            Heavy: []
        },
        currentGadgetPool: new Set()
    };

    // Loadouts object
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

    // Helper functions
    const getRandomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

    const getRandomUniqueItems = (array, n) => {
        const shuffled = [...array].sort(() => 0.5 - Math.random());
        return shuffled.slice(0, n);
    };

    // iPhone performance fixes
    document.querySelectorAll(".scroll-container")
        .forEach(container => {
            container.style.willChange = "transform";
            container.style.transform = "translate3d(0, 0, 0)";
            container.style.backfaceVisibility = "hidden";
        });

    // Speed up animations on iPhone
    const baseSpeed = 24; // Faster spin speed for smoother animation

    spinButtons.forEach(button => {
        button.addEventListener("click", () => {
            if (state.isSpinning) return;
            button.classList.add("active");
            state.totalSpins = parseInt(button.dataset.spins);
            state.currentSpin = state.totalSpins;
        });
    });

    document.getElementById("copyLoadoutButton")
        ?.addEventListener("click", () => {
            const columns = Array.from(document.querySelectorAll(".scroll-container"));
            const selectedItems = columns.map(col => {
                const selectedItem = col.querySelector(".winner.selected");
                return selectedItem ? selectedItem.querySelector("p")
                    .innerText.trim() : "Unknown";
            });

            if (selectedItems.includes("Unknown")) {
                alert("Error: Not all items were selected. Try spinning again.");
                return;
            }

            const copyText = `Class: ${selectedItems[0]}\nWeapon: ${selectedItems[1]}\nSpecialization: ${selectedItems[2]}\nGadget 1: ${selectedItems[3]}\nGadget 2: ${selectedItems[4]}\nGadget 3: ${selectedItems[5]}`;

            navigator.clipboard.writeText(copyText)
                .then(() => alert("Loadout copied to clipboard!"))
                .catch(err => console.error("Could not copy text: ", err));
        });

    console.log("Script loaded successfully.");
});


// Replace your displayLoadout function with this one
const displayLoadout = (classType, loadout) => {
    const selectedWeapon = getRandomUniqueItems(loadout.weapons, 1)[0];
    const selectedSpec = getRandomUniqueItems(loadout.specializations, 1)[0];

    // Create 3 completely separate pools of gadgets for each slot
    const allGadgets = [...loadout.gadgets];
    const gadgetChunks = [
        [],
        [],
        []
    ];
    const selectedGadgets = [];

    // First, select our three winning gadgets
    for (let i = 0; i < 3; i++) {
        const index = Math.floor(Math.random() * allGadgets.length);
        selectedGadgets.push(allGadgets[index]);
        allGadgets.splice(index, 1); // Remove selected gadget from pool
    }

    // Now divide remaining gadgets into three pools for animations
    while (allGadgets.length > 0) {
        for (let i = 0; i < 3 && allGadgets.length > 0; i++) {
            const index = Math.floor(Math.random() * allGadgets.length);
            gadgetChunks[i].push(allGadgets[index]);
            allGadgets.splice(index, 1);
        }
    }

    // Create spinning sequences with guaranteed unique items
    const createGadgetSpinSequence = (winningGadget, chunkIndex) => {
        const sequence = new Array(8);
        sequence[4] = winningGadget; // Winner in the middle

        // Fill other positions with items from this slot's chunk
        const chunk = gadgetChunks[chunkIndex];
        for (let i = 0; i < 8; i++) {
            if (i !== 4) { // Skip winner position
                const randomIndex = Math.floor(Math.random() * chunk.length);
                sequence[i] = chunk[randomIndex];
            }
        }
        return sequence;
    };

    const loadoutHTML = `
        <div class="slot-machine-wrapper">
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
                ${selectedGadgets.map((gadget, index) => `
                    <div class="item-container">
                        <div class="scroll-container" data-gadget-index="${index}">
                            ${createItemContainer(createGadgetSpinSequence(gadget, index), gadget, true)}
                        </div>
                    </div>
                `).join("")}
            </div>
        </div>
    `;

    outputDiv.innerHTML = loadoutHTML;

    setTimeout(() => {
        const scrollContainers = Array.from(document.querySelectorAll(".scroll-container"));
        startSpinAnimation(scrollContainers);
    }, 50);
};

const displayRandomLoadout = () => {
    const classes = ["Light", "Medium", "Heavy"];
    const randomClass = classes[Math.floor(Math.random() * classes.length)];
    const loadout = loadouts[randomClass];
    displayLoadout(randomClass, loadout);
};

const displayManualLoadout = (classType) => {
    const loadout = loadouts[classType];
    displayLoadout(classType, loadout);
};

// Update spinLoadout to reset gadget pool when changing classes
const spinLoadout = (spins) => {
    if (state.isSpinning) return;

    document.querySelectorAll(".class-button, .spin-button")
        .forEach(btn => {
            btn.removeAttribute('disabled');
        });

    state.isSpinning = true;
    state.currentSpin = spins || state.currentSpin;
    state.totalSpins = spins || state.totalSpins;

    // Clear current gadget pool when starting new spins
    state.currentGadgetPool.clear();

    updateSpinCountdown();

    if (!state.selectedClass && state.selectedClass !== 'random') {
        return;
    }

    if (state.selectedClass === 'random') {
        displayRandomLoadout();
    } else {
        displayManualLoadout(state.selectedClass);
    }
};

const startSpinAnimation = (columns) => {
    const itemHeight = 188;
    const baseSpeed = 12;

    const isFinalSpin = state.currentSpin === 1;

    columns.forEach(column => {
        column.style.transform = 'translateY(0px)';
    });

    const stopTimes = columns.map((_, index) => {
        if (!isFinalSpin) {
            return 700 + (index * 110);
        }
        return (index + 1) * 500;
    });

    let allStopped = new Array(columns.length)
        .fill(false);
    const startTime = Date.now();

    const animate = () => {
        const currentTime = Date.now();
        let animationRunning = false;

        columns.forEach((column, index) => {
            if (!allStopped[index]) {
                animationRunning = true;

                const timeElapsed = currentTime - startTime;
                const shouldStop = timeElapsed >= stopTimes[index];
                const currentOffset = parseFloat(column.style.transform.replace("translateY(", "")
                    .replace("px)", "")) || 0;

                if (shouldStop) {
                    allStopped[index] = true;
                    column.style.transform = `translateY(${itemHeight}px)`;
                    const selectedItem = column.querySelector('.winner');
                    if (selectedItem) {
                        selectedItem.classList.add('selected');
                        if (isFinalSpin) {
                            column.closest('.item-container')
                                .classList.add('final-glow');
                        }
                    }
                } else {
                    let newOffset = currentOffset + baseSpeed;
                    if (newOffset >= itemHeight * 8) {
                        newOffset = 0;
                    }
                    column.style.transform = `translateY(${newOffset}px)`;
                }
            }
        });

        if (animationRunning) {
            requestAnimationFrame(animate);
        } else {
            handleSpinComplete(columns);
        }
    };

    requestAnimationFrame(animate);
};

const handleSpinComplete = (columns) => {
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
        state.selectedGadgets.clear();

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
};

const updateSpinCountdown = () => {
    spinButtons.forEach(button => {
        if (parseInt(button.dataset.spins) === state.currentSpin) {
            button.classList.add('active');
        } else {
            button.classList.remove('active');
        }
    });
};



// Update createItemContainer for gadget spinning
const createItemContainer = (items, winningItem = null, isGadget = false) => {
    // Special handling for class selection
    if (items.length === 1 && (items[0] === "Light" || items[0] === "Medium" || items[0] === "Heavy")) {
        let repeatedItems = new Array(8)
            .fill(items[0]);
        return repeatedItems
            .map((item, index) => `
                    <div class="itemCol ${index === 4 ? 'winner' : ''}">
                        <img src="images/${item.replace(/ /g, "_")}.webp" alt="${item}">
                        <p>${item}</p>
                    </div>
                `)
            .join("");
    }

    if (isGadget) {
        // For gadgets, use the exact sequence provided
        return items
            .map((item, index) => `
                    <div class="itemCol ${index === 4 ? 'winner' : ''}">
                        <img src="images/${item.replace(/ /g, "_")}.webp" alt="${item}">
                        <p>${item}</p>
                    </div>
                `)
            .join("");
    }

    // For non-gadget items, use original logic
    winningItem = winningItem || items[Math.floor(Math.random() * items.length)];
    let repeatedItems = items
        .filter(item => item !== winningItem)
        .sort(() => Math.random() - 0.5)
        .slice(0, 7);

    repeatedItems = [
        ...repeatedItems.slice(0, 4),
        winningItem,
        ...repeatedItems.slice(4)
    ];

    while (repeatedItems.length < 8) {
        const randomItem = items[Math.floor(Math.random() * items.length)];
        repeatedItems.push(randomItem);
    }

    return repeatedItems
        .map((item, index) => `
                <div class="itemCol ${index === 4 ? 'winner' : ''}">
                    <img src="images/${item.replace(/ /g, "_")}.webp" alt="${item}">
                    <p>${item}</p>
                </div>
            `)
        .join("");
};


// Add click handlers
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

// Copy loadout functionality
document.getElementById("copyLoadoutButton")
    ?.addEventListener("click", () => {
        const columns = Array.from(document.querySelectorAll(".scroll-container"));
        const selectedItems = columns.map(col => {
            const selectedItem = col.querySelector(".winner.selected");
            return selectedItem ? selectedItem.querySelector("p")
                .innerText.trim() : "Unknown";
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
});