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
            weapons: ["93R", "Dagger", "LH1", "M26_Matter", "Recurve_Bow", "Sword", "V9S", "XP-54", "Throwing_Knives"],
            specializations: ["Cloaking_Device", "Evasive_Dash", "Grappling_Hook"],
            gadgets: ["Breach_Charge", "Gateway", "Glitch_Grenade", "Gravity_Vortex", "Sonar_Grenade", 
                     "Stun_Gun", "Thermal_Bore", "Thermal_Vision", "Tracking_Dart", "Vanishing_Bomb"]
        },
        Medium: {
            weapons: ["AKM", "Cerberus_12GA", "Dual_Blades", "FAMAS", "FCAR", "Model_1887", "Pike_556", "R_357", "Riot_Shield"],
            specializations: ["Dematerializer", "Guardian_Turret", "Healing_Beam"],
            gadgets: ["APS_Turret", "Data_Reshaper", "Defibrillator", "Explosive_Mine", "Gas_Mine", "Glitch_Trap"]
        },
        Heavy: {
            weapons: ["50_Akimbo", "Flamethrower", "KS_23", "Lewis_Gun", "M60", "MGL32", "Sledgehammer", "SHAK_50", "Spear"],
            specializations: ["Charge_N_Slam", "Goo_Gun", "Mesh_Shield", "Winch_Claw"],
            gadgets: ["Anti_Gravity_Cube", "Barricade", "Dome_Shield", "Lockbolt_Launcher", "Pyro_Mine"]
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
        const shuffled = [...array].sort(() => Math.random() - 0.5);
        return shuffled.slice(0, n);
    };

    // Helper function to preload images
    const preloadImages = async (items) => {
        const loadPromises = items.map(item => {
            return new Promise((resolve) => {
                const img = new Image();
                img.src = `images/${normalizeItemName(item)}.webp`;
                img.onload = () => resolve();
                img.onerror = () => {
                    console.error(`Failed to load image: ${item}`);
                    resolve(); // Don't break the chain on error
                };
            });
        });
        
        return Promise.all(loadPromises);
    };

    // Helper function to create scrolling items
    const createScrollContainer = (items) => {
        const repeatedItems = [];
        while (repeatedItems.length < 20) {
            repeatedItems.push(...items);
        }
        
        return repeatedItems
            .sort(() => Math.random() - 0.5)
            .slice(0, 20)
            .map(item => `
                <div class="scroll-item">
                    <img src="images/${normalizeItemName(item)}.webp" alt="${item}" loading="lazy">
                    <p>${item.replace(/_/g, " ")}</p>
                </div>
            `)
            .join("");
    };

    // Animation function
    const startSpinAnimation = (containers) => {
        const baseDelay = 300;
        const baseDuration = 3000;
        
        containers.forEach((container, index) => {
            const delay = index * baseDelay;
            const items = container.children;
            const totalHeight = Array.from(items).reduce((acc, item) => acc + item.offsetHeight, 0);
            
            container.style.transform = 'translateY(0)';
            
            const animation = container.animate([
                { transform: 'translateY(0)' },
                { transform: `translateY(-${totalHeight * 0.8}px)` }
            ], {
                duration: baseDuration + delay,
                easing: 'cubic-bezier(0.25, 0.1, 0.25, 1.0)',
                fill: 'forwards'
            });
            
            animation.onfinish = () => {
                container.style.transform = 'translateY(0)';
                const selectedIndex = Math.floor(Math.random() * (items.length / 3));
                
                Array.from(items).forEach(item => item.classList.remove('selected'));
                if (items[selectedIndex]) {
                    items[selectedIndex].classList.add('selected');
                    state.selectedItems.add(items[selectedIndex].querySelector('p').textContent);
                }
                
                if (index === containers.length - 1) {
                    handleSpinComplete();
                }
            };
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

    const displayLoadout = async (classType, loadout) => {
        const selectedGadgets = getRandomUniqueItems(loadout.gadgets, 3);
        
        try {
            await preloadImages([classType, ...loadout.weapons, ...loadout.specializations, ...selectedGadgets]);

            elements.outputDiv.innerHTML = `
                <div class="scroll-container">
                    <div class="scroll-column">
                        <div class="scroll-items">${createScrollContainer([classType])}</div>
                    </div>
                    <div class="scroll-column">
                        <div class="scroll-items">${createScrollContainer(loadout.weapons)}</div>
                    </div>
                    <div class="scroll-column">
                        <div class="scroll-items">${createScrollContainer(loadout.specializations)}</div>
                    </div>
                    ${selectedGadgets.map(gadget => `
                        <div class="scroll-column">
                            <div class="scroll-items">${createScrollContainer([gadget])}</div>
                        </div>
                    `).join("")}
                </div>
            `;

            const scrollContainers = Array.from(elements.outputDiv.querySelectorAll('.scroll-items'));
            startSpinAnimation(scrollContainers);

        } catch (error) {
            console.error('Error in displayLoadout:', error);
            handleSpinComplete();
        }
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