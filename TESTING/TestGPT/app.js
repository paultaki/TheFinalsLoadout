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
        if (items.length === 1 && (items[0] === "Light" || items[0] === "Medium" || items[0] === "Heavy")) {
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
    
    
    
// ✅ Define updateSpinCountdown BEFORE spinLoadout uses it
const updateSpinCountdown = () => {
    console.log("Updating spin countdown..."); // Debugging log
    document.querySelectorAll(".spin-button").forEach(button => {
        if (parseInt(button.dataset.spins) === state.currentSpin) {
            button.classList.add('active');
        } else {
            button.classList.remove('active');
        }
    });
};



// Define spinLoadout before it's used
const spinLoadout = (spins) => {
    if (state.isSpinning) return;

    // Enable all buttons first
    document.querySelectorAll(".class-button, .spin-button").forEach(btn => {
        btn.removeAttribute('disabled');
    });

    state.isSpinning = true;
    state.currentSpin = spins || state.currentSpin;
    state.totalSpins = spins || state.totalSpins;

    console.log("Spin initiated with", state.totalSpins, "spins."); // Debug log

    updateSpinCountdown();

    if (state.selectedClass === 'random') {
        displayRandomLoadout();
    } else {
        displayManualLoadout(state.selectedClass);
    }
};


// Now attach event listeners
document.querySelectorAll(".spin-button").forEach(button => {
    button.addEventListener("click", (event) => {
        if (state.isSpinning) return;
        
        document.querySelectorAll(".spin-button").forEach(b => b.classList.remove('selected', 'active'));
        event.currentTarget.classList.add('selected', 'active');

        state.totalSpins = parseInt(event.currentTarget.dataset.spins);
        state.currentSpin = state.totalSpins;

        console.log("Spin button clicked, starting spin..."); // Debugging log

        spinLoadout(state.totalSpins); // Call spinLoadout function
    });
});




// Update startSpinAnimation to properly handle button states
const startSpinAnimation = (columns) => {
    const itemHeight = 188;
    const baseSpeed = 12;
    
    // Configure stop times based on whether it's the final spin
    const isFinalSpin = state.currentSpin === 1;
    
    const stopTimes = columns.map((_, index) => {
        if (!isFinalSpin) {
            // Regular timing for non-final spins
            return 700 + (index * 110);
        }
        
        // Special timing for final spin
        switch(index) {
            case 0: return 700;  // First box
            case 1: return 1200; // +0.5s
            case 2: return 1700; // +0.5s
            case 3: return 2200; // +0.5s
            case 4: return 2900; // +0.7s
            case 5: return 3900; // +1.0s
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
                
                // Calculate speed reduction for final spin only
                let speed = baseSpeed;
                if (isFinalSpin) {
                    if (index === columns.length - 2 && timeElapsed > stopTimes[index] - 500) {
                        // Gradually slow down second to last column
                        speed = baseSpeed * Math.max(0.3, (stopTimes[index] - timeElapsed) / 500);
                    } else if (index === columns.length - 1 && timeElapsed > stopTimes[index] - 800) {
                        // Gradually slow down last column even more
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
                        // Only add glow effect on final spin
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
        if (!loadout) {
            console.error("Error: Loadout is undefined. Check class selection.");
            return;
        }
    
        const selectedWeapon = getRandomUniqueItems(loadout.weapons, 1)[0];
        const selectedSpec = getRandomUniqueItems(loadout.specializations, 1)[0];
        let selectedGadgets = getRandomUniqueItems(loadout.gadgets, 3);
    
        const loadoutHTML = `
            <div class="items-container">
                <div class="item-container">${createItemContainer([classType], classType)}</div>
                <div class="item-container">${createItemContainer(loadout.weapons, selectedWeapon)}</div>
                <div class="item-container">${createItemContainer(loadout.specializations, selectedSpec)}</div>
                ${selectedGadgets.map(gadget => `
                    <div class="item-container">${createItemContainer(loadout.gadgets, gadget)}</div>
                `).join("")}
            </div>
        `;
    
        outputDiv.innerHTML = loadoutHTML;
    
        const itemsContainer = document.querySelector(".items-container");
        if (itemsContainer) {
            itemsContainer.style.width = "100%"; // Prevents layout shift
            itemsContainer.style.overflowX = "auto"; // Allows scrolling when needed
            itemsContainer.scrollLeft = 0; // Resets scroll position
        }
    
        const scrollContainers = Array.from(outputDiv.querySelectorAll(".scroll-container"));
        startSpinAnimation(scrollContainers);
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
    
            classButtons.forEach(btn => {
                btn.classList.remove('selected', 'active');
                btn.removeAttribute('disabled');
            });
    
            spinButtons.forEach(btn => {
                btn.classList.remove('selected', 'active');
                btn.removeAttribute('disabled');
            });
    
            spinSelection.classList.add('disabled');
    
            // 🔥 Ensure proper width and reset scroll
            const itemsContainer = document.querySelector(".items-container");
            if (itemsContainer) {
                itemsContainer.style.width = "100%"; // Prevent layout shift
                itemsContainer.style.overflowX = "auto"; // Allow scrolling if necessary
                itemsContainer.scrollLeft = 0; // 👈 Reset scroll position after spin
            }
        }
    };
    
    
            
    
 
    // Copy loadout functionality
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


}); // 👈 Correctly closes `DOMContentLoaded`
