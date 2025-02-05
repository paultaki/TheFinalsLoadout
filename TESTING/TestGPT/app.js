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
            weapons: ["50 Akimbo", "Flamethrower", "KS-23", "Lewis Gun", "M60", "MGL32", "Sledgehammer", "SHAK-50", "Spear"],
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
            
            // Remove selected class from all buttons
            classButtons.forEach(b => b.classList.remove('selected'));
            
            // Add selected class to clicked button
            button.classList.add('selected');
            
            // Update state
            state.selectedClass = button.dataset.class;
            
            // If random class selected, auto-spin once
            if (state.selectedClass === 'random') {
                spinLoadout(1);
            } else {
                // Enable spin selection for non-random class
                spinSelection.classList.remove('disabled');
            }
        });
    });

    // Add click handlers for spin buttons
    spinButtons.forEach(button => {
        button.addEventListener('click', () => {
            if (state.isSpinning) return;
            
            // Remove selected class from all buttons
            spinButtons.forEach(b => b.classList.remove('selected'));
            
            // Add selected class to clicked button
            button.classList.add('selected');
            
            // Start spinning
            spinLoadout(parseInt(button.dataset.spins));
        });
    });

    // Helper function to get random unique items
    const getRandomUniqueItems = (array, n) => {
        const shuffled = [...array].sort(() => Math.random() - 0.5);
        return shuffled.slice(0, n);
    };

    // Helper function to preload images
    const preloadImages = (items) => {
        const images = items.map(item => {
            const img = new Image();
            img.src = `images/${item.replace(/ /g, "_")}.webp`;
            return img;
        });
        return Promise.all(images.map(img => {
            return new Promise((resolve) => {
                if (img.complete) {
                    resolve();
                } else {
                    img.onload = resolve;
                }
            });
        }));
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
        state.currentSpin = 1;
        state.totalSpins = spins;

        if (state.selectedClass === 'random') {
            displayRandomLoadout();
        } else {
            displayManualLoadout(state.selectedClass);
        }
    };

    // Animation function with slot machine effect
    const startSpinAnimation = (columns) => {
        const itemHeight = 188; // Height of each item
        const spinDuration = 2000; // Base duration for spin
        const minSpins = 2; // Minimum number of full rotations
        
        // Prepare the columns for spinning
        columns.forEach((column, columnIndex) => {
            // Create a pool of items for smooth spinning
            const items = column.children;
            const itemCount = items.length;
            
            // Clone items to create a smooth loop
            for (let i = 0; i < 3; i++) {
                for (let j = 0; j < itemCount; j++) {
                    const clone = items[j].cloneNode(true);
                    column.appendChild(clone);
                }
            }
    
            // Position for instant spin start
            column.style.transform = 'translateY(0)';
            
            // Calculate unique timing for each column
            const delay = columnIndex * 220; // Stagger column start times
            const extraSpins = Math.random() * 2; // Random additional spins
            const totalSpins = minSpins + extraSpins;
            const finalPosition = itemHeight; // Final stopping position
            
            // Create keyframes for smooth acceleration and deceleration
            const keyframes = [
                { transform: 'translateY(0)', offset: 0 },
                { transform: `translateY(-${itemHeight * itemCount * totalSpins}px)`, offset: 0.7 },
                { transform: `translateY(-${itemHeight * itemCount * totalSpins + finalPosition}px)`, offset: 1 }
            ];
    
            const timing = {
                duration: spinDuration + delay,
                easing: 'cubic-bezier(0.4, 0.0, 0.2, 1)',
                iterations: 1,
                delay: delay,
                fill: 'forwards'
            };
    
            // Start the animation
            const animation = column.animate(keyframes, timing);
    
            // Handle animation completion
            animation.onfinish = () => {
                // Clean up cloned elements after animation
                while (column.children.length > itemCount) {
                    column.removeChild(column.lastChild);
                }
                
                // Set final position
                column.style.transform = `translateY(${finalPosition}px)`;
                
                // Add selected class to the chosen item
                const selectedItem = column.children[0];
                if (selectedItem) {
                    selectedItem.classList.add("selected");
                }
    
                // Check if all columns are done
                if (columnIndex === columns.length - 1) {
                    // Small delay before callback to ensure smooth finish
                    setTimeout(() => {
                        handleSpinComplete(columns);
                    }, 200);
                }
            };
        });
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

    const displayLoadout = async (classType, loadout) => {
        const selectedGadgets = getRandomUniqueItems(loadout.gadgets, 3);
        
        // Preload all images that will be used in the spin
        await Promise.all([
            preloadImages([classType]),
            preloadImages(loadout.weapons),
            preloadImages(loadout.specializations),
            preloadImages(selectedGadgets)
        ]);
        
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
    const handleSpinComplete = (columns) => {
        if (state.currentSpin < state.totalSpins) {
            setTimeout(() => {
                state.currentSpin++;
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
                btn.classList.remove('selected');
                btn.removeAttribute('disabled');
            });
            spinButtons.forEach(btn => {
                btn.classList.remove('selected');
                btn.removeAttribute('disabled');
            });
            spinSelection.classList.add('disabled');
        }
    };

    // Copy loadout functionality
    document.getElementById("copyLoadoutButton")?.addEventListener("click", () => {
        const columns = Array.from(outputDiv.querySelectorAll(".scroll-container"));
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