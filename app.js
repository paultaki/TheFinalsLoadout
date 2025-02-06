document.addEventListener("DOMContentLoaded", () => {
    // State management
    let state = {
        selectedClass: null,
        isSpinning: false,
        currentSpin: 1,
        totalSpins: 0
    };

    // Your existing loadouts object
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

    // Helper function to get random unique items
    const getRandomUniqueItems = (array, n) => {
        const shuffled = [...array].sort(() => Math.random() - 0.5);
        return shuffled.slice(0, n);
    };
    const createItemContainer = (items, winningItem = null) => {
        // Special handling for class selection
        if (items.length === 1 && (items[0] === "Light" || items[0] === "Medium" || items[0] === "Heavy")) {
            // Create array of 8 identical class items for consistent animation
            let repeatedItems = new Array(8).fill(items[0]);
            
            return repeatedItems
                .map((item, index) => `
                    <div class="itemCol ${index === 4 ? 'winner' : ''}">
                        <img src="images/${item.replace(/ /g, "_")}.webp" alt="${item}">
                        <p>${item}</p>
                    </div>
                `)
                .join("");
        }
    
        // Rest of the function remains the same
        winningItem = winningItem || items[Math.floor(Math.random() * items.length)];
        
        let spinningItems = items;
        if (items.length === 1) {
            spinningItems = loadouts[state.selectedClass].gadgets;
        }
        
        let repeatedItems = spinningItems
            .filter(item => item !== winningItem)
            .sort(() => Math.random() - 0.5)
            .slice(0, 7);
            
        repeatedItems = [
            ...repeatedItems.slice(0, 4),
            winningItem,
            ...repeatedItems.slice(4)
        ];
    
        while (repeatedItems.length < 8) {
            repeatedItems.push(repeatedItems[Math.floor(Math.random() * repeatedItems.length)]);
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

// Update the spin function
const spinLoadout = (spins) => {
    if (state.isSpinning) return;
    
    // Enable all buttons first
    document.querySelectorAll(".class-button, .spin-button").forEach(btn => {
        btn.removeAttribute('disabled');
    });
    
    state.isSpinning = true;
    state.currentSpin = spins || state.currentSpin;
    state.totalSpins = spins || state.totalSpins;
    
    updateSpinCountdown();

    if (state.selectedClass === 'random') {
        displayRandomLoadout();
    } else {
        displayManualLoadout(state.selectedClass);
    }
};



// Update startSpinAnimation to properly handle button states
const startSpinAnimation = (columns) => {
    const itemHeight = 188;
    const baseSpeed = 12;
    
    const stopTimes = columns.map((_, index) => {
        if (index === 0) return 700;
        // Use slower timing (500ms) only when it's the last spin (currentSpin === 1)
        return 700 + (index * (state.currentSpin === 1 ? 500 : 110));
    });
    
    let allStopped = new Array(columns.length).fill(false);
    const startTime = Date.now();

    const animate = () => {
        const currentTime = Date.now();
        let animationRunning = false;

        columns.forEach((column, index) => {
            if (!allStopped[index]) {
                animationRunning = true;
                
                const shouldStop = currentTime - startTime >= stopTimes[index];
                const currentOffset = parseFloat(column.style.transform?.replace("translateY(", "").replace("px)", "")) || 0;
                
                let newOffset = currentOffset + baseSpeed;
                if (newOffset >= itemHeight * 8) newOffset = 0;
                
                if (shouldStop) {
                    allStopped[index] = true;
                    newOffset = itemHeight;
                    const selectedItem = column.children[0];
                    if (selectedItem) selectedItem.classList.add("selected");
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
};

    // Display functions for loadouts
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

    const displayLoadout = (classType, loadout) => {
        const selectedWeapon = getRandomUniqueItems(loadout.weapons, 1)[0];
        const selectedSpec = getRandomUniqueItems(loadout.specializations, 1)[0];
        
        // Keep track of which gadgets have been used
        let remainingGadgets = [...loadout.gadgets];
        const selectedGadgets = [];
        
        // Select three gadgets, removing each one from the pool after selection
        for (let i = 0; i < 3; i++) {
            const randomIndex = Math.floor(Math.random() * remainingGadgets.length);
            selectedGadgets.push(remainingGadgets[randomIndex]);
            // Remove the selected gadget from the remaining pool
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
                ${selectedGadgets.map((gadget, index) => `
                    <div class="item-container">
                        <div class="scroll-container">
                            ${createItemContainer(loadout.gadgets, gadget)}
                        </div>
                    </div>
                `).join("")}
            </div>
        `;
        
        outputDiv.innerHTML = loadoutHTML;
        
        const scrollContainers = Array.from(outputDiv.querySelectorAll(".scroll-container"));
        startSpinAnimation(scrollContainers);
    };

    // Handle spin completion
    function updateSpinCountdown() {
        spinButtons.forEach(button => {
            if (parseInt(button.dataset.spins) === state.currentSpin) {
                button.classList.add('active');
            } else {
                button.classList.remove('active');
            }
        });
    }
    
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

    // Copy loadout functionality
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
});