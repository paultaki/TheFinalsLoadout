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

    // Add GPU hints to columns on load for better performance
    const addGPUHints = () => {
        const columns = document.querySelectorAll('.scroll-container');
        columns.forEach(column => {
            column.style.willChange = 'transform';
            column.style.backfaceVisibility = 'hidden';
            column.style.perspective = '1000px';
            column.style.transform = 'translate3d(0,0,0)';
        });
    };
    
    // Call it once on load
    addGPUHints();

    // Helper functions
    const getRandomUniqueItems = (array, n) => {
        const shuffled = [...array].sort(() => Math.random() - 0.5);
        return shuffled.slice(0, n);
    };

    const getUniqueGadgets = (classType, loadout) => {
        if (state.gadgetQueue[classType].length < 3) {
            state.gadgetQueue[classType] = [...loadout.gadgets]
                .sort(() => Math.random() - 0.5);
        }
        const selectedGadgets = state.gadgetQueue[classType].splice(0, 3);
        state.currentGadgetPool = new Set(selectedGadgets);
        return selectedGadgets;
    };

    const displayLoadout = (classType, loadout) => {
        const selectedWeapon = getRandomUniqueItems(loadout.weapons, 1)[0];
        const selectedSpec = getRandomUniqueItems(loadout.specializations, 1)[0];
        
        const allGadgets = [...loadout.gadgets];
        const gadgetChunks = [[], [], []];
        const selectedGadgets = [];
        
        for (let i = 0; i < 3; i++) {
            const index = Math.floor(Math.random() * allGadgets.length);
            selectedGadgets.push(allGadgets[index]);
            allGadgets.splice(index, 1);
        }
        
        while (allGadgets.length > 0) {
            for (let i = 0; i < 3 && allGadgets.length > 0; i++) {
                const index = Math.floor(Math.random() * allGadgets.length);
                gadgetChunks[i].push(allGadgets[index]);
                allGadgets.splice(index, 1);
            }
        }
        
        const createGadgetSpinSequence = (winningGadget, chunkIndex) => {
            const sequence = new Array(8);
            sequence[4] = winningGadget;
            
            const chunk = gadgetChunks[chunkIndex];
            for (let i = 0; i < 8; i++) {
                if (i !== 4) {
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

    const spinLoadout = (spins) => {
        if (state.isSpinning) return;
        
        document.querySelectorAll(".class-button, .spin-button").forEach(btn => {
            btn.removeAttribute('disabled');
        });
        
        state.isSpinning = true;
        state.currentSpin = spins || state.currentSpin;
        state.totalSpins = spins || state.totalSpins;
        
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
        const baseSpeed = 20;
        const isFinalSpin = state.currentSpin === 1;
    
        columns.forEach(column => {
            column.style.willChange = 'transform';
            column.style.backfaceVisibility = 'hidden';
            column.style.perspective = '1000px';
            column.style.transform = 'translate3d(0,0,0)';
        });
    
        columns.forEach(column => {
            column.style.transform = 'translate3d(0,0,0)';
        });
    
        const stopTimes = columns.map((_, index) => {
            return isFinalSpin ? (500 + index * 700) : (700 + index * 110);
        });
    
        let allStopped = new Array(columns.length).fill(false);
        const startTime = performance.now();
        const totalDuration = Math.max(...stopTimes) + 500; 
    
        const animate = (currentTime) => {
            const timeElapsed = currentTime - startTime;
            if (timeElapsed >= totalDuration) {
                columns.forEach((column, index) => {
                    if (!allStopped[index]) {
                        allStopped[index] = true;
                        column.style.transform = `translate3d(0,${itemHeight}px,0)`;
                        const selectedItem = column.querySelector('.winner');
                        if (selectedItem) {
                            selectedItem.classList.add('selected');
                            if (isFinalSpin) {
                                const container = column.closest('.item-container');
                                container.classList.add('final-glow');
                                container.style.willChange = 'box-shadow';
                            }
                        }
                    }
                });
                handleSpinComplete(columns);
                return;
            }
    
            let animationRunning = false;
            columns.forEach((column, index) => {
                if (!allStopped[index]) {
                    animationRunning = true;
                    const shouldStop = timeElapsed >= stopTimes[index];
                    const transform = new DOMMatrix(window.getComputedStyle(column).transform);
                    const currentOffset = transform.m42;
                    
                    if (shouldStop) {
                        allStopped[index] = true;
                        column.style.transform = `translate3d(0,${itemHeight}px,0)`;
                        const selectedItem = column.querySelector('.winner');
                        if (selectedItem) {
                            selectedItem.classList.add('selected');
                            if (isFinalSpin) {
                                const container = column.closest('.item-container');
                                container.classList.add('final-glow');
                                container.style.willChange = 'box-shadow';
                            }
                        }
                    } else {
                        let newOffset = currentOffset + baseSpeed;
                        if (newOffset >= itemHeight * 8) {
                            newOffset = 0;
                        }
                        column.style.transform = `translate3d(0,${newOffset}px,0)`;
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
        columns.forEach(column => {
            column.style.willChange = 'auto';
        });
    
        if (state.currentSpin > 1) {
            state.currentSpin--;
            updateSpinCountdown();
    
            setTimeout(() => {
                if (state.selectedClass === 'random') {
                    displayRandomLoadout();
                } else {
                    displayManualLoadout(state.selectedClass);
                }
            }, 1000);
        } else {
            state.isSpinning = false;
            state.currentSpin = 1;
            state.totalSpins = 0;
            
            // Don't reset selectedClass anymore
            state.selectedGadgets.clear();
    
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

    const createItemContainer = (items, winningItem = null, isGadget = false) => {
        if (isGadget) {
            return items
                .map((item, index) => `
                    <div class="itemCol ${index === 4 ? 'winner' : ''}">
                        <img src="images/${item.replace(/ /g, "_")}.webp" alt="${item}">
                        <p>${item}</p>
                    </div>
                `)
                .join("");
        }
    
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
    // Add click handlers
    // Add click handlers
    classButtons.forEach(button => {
        button.addEventListener('click', () => {
            if (state.isSpinning) return;
            
            classButtons.forEach(b => b.classList.remove('selected', 'active')); 
            button.classList.add('selected', 'active');

            if (button.dataset.class === 'random') {
                // Choose random class
                const classes = ["Light", "Medium", "Heavy"];
                // Using a more explicit randomization
                const randomIndex = Math.floor(Math.random() * 3);  // 0, 1, or 2
                const randomClass = classes[randomIndex];
                state.selectedClass = randomClass;
                console.log('Random class selected:', randomClass); // Debug log
                
                // Illuminate the randomly selected class button
                classButtons.forEach(b => {
                    if (b.dataset.class === randomClass) {
                        b.classList.add('selected', 'active');
                    }
                });

                // Choose random number of spins (1-5)
                const randomSpins = Math.floor(Math.random() * 5) + 1;
                state.totalSpins = randomSpins;
                state.currentSpin = randomSpins;

                // Illuminate the randomly selected spin button
                spinButtons.forEach(b => {
                    if (parseInt(b.dataset.spins) === randomSpins) {
                        b.classList.add('selected', 'active');
                    } else {
                        b.classList.remove('selected', 'active');
                    }
                });

                // Start spinning immediately
                spinLoadout();
            } else {
                state.selectedClass = button.dataset.class;
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
            
            // Only spin if a class is selected
            if (state.selectedClass) {
                spinLoadout();
            }
        });
    });

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
            "Class: " + state.selectedClass + "\n" +
            "Weapon: " + selectedItems[0] + "\n" +
            "Specialization: " + selectedItems[1] + "\n" +
            "Gadget 1: " + selectedItems[2] + "\n" +
            "Gadget 2: " + selectedItems[3] + "\n" +
            "Gadget 3: " + selectedItems[4];
    
        navigator.clipboard.writeText(copyText)
            .then(() => alert("Loadout copied to clipboard!"))
            .catch(err => console.error("Could not copy text: ", err));
    });
});