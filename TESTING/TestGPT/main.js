document.addEventListener("DOMContentLoaded", () => {
    // State management
    const state = {
        selectedClass: null,
        isSpinning: false,
        currentSpin: 1,
        totalSpins: 0,
        selectedItems: new Set()
    };

    // Loadouts configuration
    const loadouts = {
        Light: {
            weapons: [
                "93R", "Dagger", "LH1", "M26_Matter", "Recurve_Bow", "Sword", 
                "V9S", "XP-54", "Throwing_Knives", "M11", "SH1900", "SR-84"
            ],
            specializations: [
                "Cloaking_Device", "Evasive_Dash", "Grappling_Hook"
            ],
            gadgets: [
                "Breach_Charge", "Flashbang", "Frag_Grenade", "Gas_Grenade", 
                "Gateway", "Glitch_Grenade", "Goo_Grenade", "Gravity_Vortex", 
                "Pyro_Grenade", "Smoke_Grenade", "Sonar_Grenade", "Stun_Gun", 
                "Thermal_Bore", "Thermal_Vision", "Tracking_Dart", "Vanishing_Bomb"
            ]
        },
        Medium: {
            weapons: [
                "AKM", "Cerberus_12GA", "CL_40", "Dual_Blades", "FAMAS", "FCAR", 
                "Model_1887", "Pike_556", "R_357", "Riot_Shield"
            ],
            specializations: [
                "Dematerializer", "Guardian_Turret", "Healing_Beam"
            ],
            gadgets: [
                "APS_Turret", "Data_Reshaper", "Defibrillator", "Explosive_Mine", 
                "Flashbang", "Frag_Grenade", "Gas_Grenade", "Gas_Mine", 
                "Glitch_Trap", "Goo_Grenade", "Jump_Pad", "Motion_Sensor", 
                "Pyro_Grenade", "Smoke_Grenade", "Zipline"
            ]
        },
        Heavy: {
            weapons: [
                "50_Akimbo", "Flamethrower", "KS_23", "Lewis_Gun", "M60", 
                "M32GL", "Sledgehammer", "SHAK_50", "Spear", "RPG-7", "SA1216", 
                "SH1900", "SR-84", "M32GL"
            ],
            specializations: [
                "Charge_N_Slam", "Goo_Gun", "Mesh_Shield", "Winch_Claw"
            ],
            gadgets: [
                "Anti_Gravity_Cube", "Barricade", "Dome_Shield", "Lockbolt_Launcher", 
                "Pyro_Mine", "Pyro_Grenade", "Smoke_Grenade", "Tracking_Dart", 
                "Thermal_Vision", "C4", "Frag_Grenade", "Gas_Grenade", "Goo_Grenade",
                "Motion_Sensor"
            ]
        }
    };
    

    // Get DOM elements
    const elements = {
        classButtons: document.querySelectorAll('.class-button'),
        spinButtons: document.querySelectorAll('.spin-button'),
        spinSelection: document.getElementById('spinSelection'),
        outputDiv: document.getElementById("output"),
        copyButton: document.getElementById("copyLoadoutButton")
    };

    // Helper function to normalize item names
    const normalizeItemName = (item) => item.replace(/ /g, "_");

    // Helper function to get random unique items
    const getRandomUniqueItems = (array, n) => {
        if (n > array.length) {
            console.error("Not enough unique items to select from!");
            return [...array]; // Return full array if not enough unique options
        }
        const selected = new Set();
        while (selected.size < n) {
            const randomIndex = Math.floor(Math.random() * array.length);
            selected.add(array[randomIndex]);
        }
        return [...selected];
    };
    

    // Helper function to preload images
    const preloadImages = async (items) => {
        const uniqueItems = [...new Set(items)]; // Remove duplicates
        const loadPromises = uniqueItems.map(item => {
            return new Promise((resolve) => {
                const img = new Image();
                img.src = `images/${normalizeItemName(item)}.webp`;
                img.onload = () => resolve();
                img.onerror = () => {
                    console.error(`Failed to load image: ${item}`);
                    resolve();
                };
            });
        });
        return Promise.all(loadPromises);
    };
    

    // Helper function to create scrolling items
    const createScrollContainer = (items) => {
        let sequence = [];
        const repetitions = 12;
    
        for (let i = 0; i < repetitions; i++) {
            let availableItems = items.filter(item => !sequence.includes(item)); // Ensure variety
            if (availableItems.length === 0) availableItems = [...items]; // Reset if out of unique items
            const randomIndex = Math.floor(Math.random() * availableItems.length);
            sequence.push(availableItems[randomIndex]);
        }
    
        // Add final selection multiple times so it stops in the middle
        const finalItem = items[Math.floor(Math.random() * items.length)];
        sequence.push(finalItem, finalItem, finalItem); // ✅ This is correct, no need for another declaration.
    
        return `
            <div class="viewport">
                <div class="scroll-items">
                    ${sequence.map(item => `
                        <div class="scroll-item">
                            <img src="images/${normalizeItemName(item)}.webp" alt="${item}" loading="lazy">
                            <p>${item.replace(/_/g, " ")}</p>
                        </div>
                    `).join("")}
                </div>
            </div>
        `;
    };
    


// Ensure the final selection is added multiple times to force it to stop in the middle
const finalItem = items[0]; 
sequence.push(finalItem, finalItem, finalItem);

    
        return `
    <div class="viewport">
        <div class="scroll-items">
            ${sequence.map(item => {
                return `
                <div class="scroll-item">
                    <img src="images/${normalizeItemName(item)}.webp" alt="${item}" loading="lazy">
                    <p>${item.replace(/_/g, " ")}</p>
                </div>
                `;
            }).join("")}
        </div>
    </div>
`;

    
    

    // Animation function
    const startSpinAnimation = (containers) => {
        const isFinalSpin = state.currentSpin === state.totalSpins;
        const baseDelay = isFinalSpin ? 500 : 200;
        const baseDuration = isFinalSpin ? 2000 : 1000;
        
        containers.forEach((container, index) => {
            // Reset container position
            container.style.transform = 'translateY(0px)';
            
            const items = Array.from(container.children);
            const itemHeight = items[0].offsetHeight;
            const totalHeight = itemHeight * items.length;
            
            // Select random stopping point
            const selectedIndex = Math.floor(items.length / 2); // Forces final selection to land in the middle row

            const finalOffset = -(totalHeight - (selectedIndex * itemHeight));











            // Create animation
            const startTime = Date.now() + (index * baseDelay);
            const animate = () => {
                const now = Date.now();
                const elapsed = now - startTime;
                
                if (elapsed < 0) {
                    requestAnimationFrame(animate);
                    return;
                }
                
                if (elapsed >= baseDuration) {
                    container.style.transition = "transform 1.5s ease-out";


                    container.style.transform = `translateY(${finalOffset}px)`;
                
                    setTimeout(() => {
                        requestAnimationFrame(() => {
                            items.forEach(item => item.classList.remove('selected'));
                            const selectedItem = items[selectedIndex];
                    
                            if (selectedItem) {
                                selectedItem.classList.add('selected');
                                selectedItem.style.border = "3px solid yellow";
                                selectedItem.style.boxShadow = "0 0 10px yellow";
                                state.selectedItems.add(selectedItem.querySelector('p')?.textContent);
                            }
                        });
                    }, baseDuration + 500); // Ensure highlight only happens after animation is finished
                    
                    
                    
                    
                    
                    
                
                    if (index === containers.length - 1) {
                        if (!isFinalSpin) {
                            setTimeout(() => {
                                state.currentSpin++;
                                if (state.selectedClass === 'random') {
                                    displayRandomLoadout();
                                } else {
                                    displayManualLoadout(state.selectedClass);
                                }
                            }, 300);
                        } else {
                            handleSpinComplete();
                        }
                    }
                    return; // Ensure the function stops here
                }
                
                
                const progress = elapsed / baseDuration;
                const easeProgress = 1 - Math.pow(1 - progress, 3); // Cubic ease-out
                const currentOffset = -(totalHeight * easeProgress);

                container.style.transform = `translateY(${currentOffset}px)`;
                requestAnimationFrame(animate);
            };
            
            requestAnimationFrame(animate);
        });
    };
    // Display functions for loadouts
    const displayRandomLoadout = async () => {
        const classes = ["Light", "Medium", "Heavy"];
        const randomClass = classes[Math.floor(Math.random() * classes.length)];
        await displayLoadout(randomClass, loadouts[randomClass]);
    };

    const displayManualLoadout = async (classType) => {
        await displayLoadout(classType, loadouts[classType]);
    };

    const displayLoadout = async (classType) => {
        const loadout = loadouts[classType];
    
        // Ensure gadgets are unique
        let gadgetPool = [...loadout.gadgets]; // Copy the gadgets list
        const finalUniqueGadgets = [];
        
        for (let i = 0; i < 3; i++) {
            const randomIndex = Math.floor(Math.random() * gadgetPool.length);
            finalUniqueGadgets.push(gadgetPool[randomIndex]);
            gadgetPool.splice(randomIndex, 1); // Remove the selected gadget to prevent duplicates
        }
        
    
        try {
            await preloadImages([classType, ...loadout.weapons, ...loadout.specializations, ...finalUniqueGadgets]);
    
            elements.outputDiv.innerHTML = `
                <div class="scroll-container">
                    <div class="scroll-column">
                        ${createScrollContainer([classType])}
                    </div>
                    <div class="scroll-column">
                        ${createScrollContainer(loadout.weapons)}
                    </div>
                    <div class="scroll-column">
                        ${createScrollContainer(loadout.specializations)}
                    </div>
                    ${finalUniqueGadgets.map(gadget => `
                        <div class="scroll-column">
                            ${createScrollContainer([gadget])}
                        </div>
                    `).join("")}
                </div>
            `;
    
        } catch (error) {
            console.error('Error in displayLoadout:', error);
            handleSpinComplete();
        }
    
        const scrollContainers = Array.from(elements.outputDiv.querySelectorAll('.viewport > .scroll-items'));
        startSpinAnimation(scrollContainers);
    };
    

    // Main spin function
    const spinLoadout = async (spins) => {
        if (state.isSpinning) return;
        
        state.isSpinning = true;
        state.currentSpin = 1;
        state.totalSpins = spins;
        state.selectedItems.clear();

        elements.classButtons.forEach(btn => btn.disabled = true);
        elements.spinButtons.forEach(btn => btn.disabled = true);

        try {
            if (state.selectedClass === 'random') {
                await displayRandomLoadout();
            } else {
                await displayManualLoadout(state.selectedClass);
            }
        } catch (error) {
            console.error('Spin error:', error);
            handleSpinComplete();
        }
    };

    // Handle spin completion
    const handleSpinComplete = () => {
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
            state.isSpinning = false;
            state.currentSpin = 1;
            state.totalSpins = 0;

            elements.classButtons.forEach(btn => {
                btn.classList.remove('selected');
                btn.disabled = false;
            });
            elements.spinButtons.forEach(btn => {
                btn.classList.remove('selected');
                btn.disabled = false;
            });
            elements.spinSelection.classList.add('disabled');
        }
    };

    // Event handlers
    elements.classButtons.forEach(button => {
        button.addEventListener('click', () => {
            if (state.isSpinning) return;
            
            elements.classButtons.forEach(b => b.classList.remove('selected'));
            button.classList.add('selected');
            state.selectedClass = button.dataset.class;
            
            if (state.selectedClass === 'random') {
                spinLoadout(1);
            } else {
                elements.spinSelection.classList.remove('disabled');
            }
        });
    });

    elements.spinButtons.forEach(button => {
        button.addEventListener('click', () => {
            if (state.isSpinning) return;
            
            elements.spinButtons.forEach(b => b.classList.remove('selected'));
            button.classList.add('selected');
            spinLoadout(parseInt(button.dataset.spins));
        });
    });

    // Copy functionality
    elements.copyButton?.addEventListener("click", () => {
        const selectedItems = Array.from(elements.outputDiv.querySelectorAll(".selected"))
            .map(item => item.querySelector("p")?.textContent.trim())
            .filter(Boolean);
            
        if (selectedItems.length !== 6) {
            alert("Error: Not all items were selected. Please try spinning again.");
            return;
        }
    
        const copyText = [
            `Class: ${selectedItems[0]}`,
            `Weapon: ${selectedItems[1]}`,
            `Specialization: ${selectedItems[2]}`,
            `Gadget 1: ${selectedItems[3]}`,
            `Gadget 2: ${selectedItems[4]}`,
            `Gadget 3: ${selectedItems[5]}`
        ].join("\n");
    
        navigator.clipboard.writeText(copyText)
            .then(() => alert("Loadout copied to clipboard!"))
            .catch(err => {
                console.error("Copy error:", err);
                alert("Could not copy loadout. Please try again.");
            });
    });
});