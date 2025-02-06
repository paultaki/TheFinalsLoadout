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
            weapons: ["50 Akimbo", "Flamethrower", "KS_23", "Lewis Gun", "M60", "MGL32", "Sledgehammer", "SHAK-50", "Spear"],
            specializations: ["Charge_N_Slam", "Goo Gun", "Mesh Shield", "Winch Claw"],
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
            
            classButtons.forEach(b => b.classList.remove('selected', 'active')); // Remove all highlights
            button.classList.add('selected', 'active'); // Keep selected class button highlighted
    
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
            button.classList.add('selected', 'active'); // Keep spin button highlighted
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

    // Helper function to create item container HTML
    const createItemContainer = (items) => {
        let repeatedItems = [...items];
        while (repeatedItems.length < 8) {
            repeatedItems = [...repeatedItems, ...items];
        }
        repeatedItems = repeatedItems.sort(() => Math.random() - 0.5).slice(0, 8);
    
        return repeatedItems
            .map((item) => `
                <div class="itemCol">
                    <img src="images/${item.replace(/ /g, "_")}.webp" alt="${item}">
                    <p>${item}</p>
                </div>
            `)
            .join("");
    };

    // Main spin function
    const spinLoadout = (spins) => {
        if (state.isSpinning) return;
        state.isSpinning = true;
        state.currentSpin = spins;
        state.totalSpins = spins;
    
        updateSpinCountdown(); // New function to highlight the correct spin
    
        if (state.selectedClass === 'random') {
            displayRandomLoadout();
        } else {
            displayManualLoadout(state.selectedClass);
        }
    };
    

    // Animation function
    const startSpinAnimation = (columns) => {
        const itemHeight = 188;
        const baseSpeed = 12;
        
        const stopTimes = columns.map((_, index) => {
            if (index === 0) return 700;
            return 700 + (index * (state.currentSpin === state.totalSpins ? 500 : 110));
        });
        
        let allStopped = new Array(columns.length).fill(false);
        const startTime = Date.now();
    
        // Disable buttons during spin
        document.querySelectorAll(".class-button, .spin-button").forEach(btn => 
            btn.setAttribute("disabled", "true")
        );
    
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
        const selectedGadgets = getRandomUniqueItems(loadout.gadgets, 3);
        
        const loadoutHTML = `
            <div class="items-container">
                <div class="item-container">
                    <div class="scroll-container">
                        ${createItemContainer([classType])}
                    </div>
                </div>
                <div class="item-container">
                    <div class="scroll-container">
                        ${createItemContainer(loadout.weapons)}
                    </div>
                </div>
                <div class="item-container">
                    <div class="scroll-container">
                        ${createItemContainer(loadout.specializations)}
                    </div>
                </div>
                ${selectedGadgets.map(gadget => `
                    <div class="item-container">
                        <div class="scroll-container">
                            ${createItemContainer([gadget])}
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
                button.classList.add('active'); // Highlight current spin count
            } else {
                button.classList.remove('active'); // Remove highlight from previous spins
            }
        });
    }
    
    const handleSpinComplete = (columns) => {
        if (state.currentSpin > 1) { // Decrease the spin count instead of increasing it
            setTimeout(() => {
                state.currentSpin--; // Count down instead of up
                updateSpinCountdown(); // Update the UI to highlight the correct spin remaining
    
                if (state.selectedClass === 'random') {
                    displayRandomLoadout();
                } else {
                    displayManualLoadout(state.selectedClass);
                }
            }, 500);
        } else {
            // Reset state
            state.isSpinning = false;
            state.currentSpin = 1;
            state.totalSpins = 0;
            state.selectedClass = null;
    
            // Reset UI
            classButtons.forEach(btn => {
                btn.classList.remove('selected', 'active'); // Remove active highlight
                btn.removeAttribute('disabled');
            });
    
            spinButtons.forEach(btn => {
                btn.classList.remove('selected', 'active'); // Remove active highlight
                btn.removeAttribute('disabled');
            });
    
            spinSelection.classList.add('disabled');
        }
    };
    

    // Copy loadout functionality
    document.getElementById("copyLoadoutButton")?.addEventListener("click", () => {
        const columns = Array.from(document.querySelectorAll(".scroll-container"));
        const selectedItems = columns.map(col => {
            const selectedItem = col.querySelector(".selected");
            return selectedItem ? selectedItem.innerText.trim() : "Unknown";
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