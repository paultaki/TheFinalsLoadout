document.addEventListener("DOMContentLoaded", () => {
    const randomLoadoutButton = document.getElementById("randomLoadoutButton");
    const lightLoadoutButton = document.getElementById("lightLoadoutButton");
    const mediumLoadoutButton = document.getElementById("mediumLoadoutButton");
    const heavyLoadoutButton = document.getElementById("heavyLoadoutButton");
    const outputDiv = document.getElementById("output");
    const recentBuffsSection = document.querySelector(".recentBuffsSection .buffs-container");

    // New variables for spin functionality
    let selectedSpinCount = 1;
    let isSpinning = false;
    let currentSpin = 1;

    const loadouts = {
        Light: {
            weapons: ["93R", "Dagger", "LH1", "M26 Matter", "Recurve Bow", "Sword", "V9S", "XP-54", "Throwing Knives"],
            specializations: ["Cloaking Device", "Evasive Dash", "Grappling Hook"],
            gadgets: ["Breach Charge", "Gateway", "Glitch Grenade", "Gravity Vortex", "Sonar Grenade", "Stun Gun", "Thermal Bore", "Thermal Vision", "Tracking Dart", "Vanishing Bomb", "Goo Grenade", "Pyro Grenade", "Smoke Grenade", "Frag Grenade", "Flashbang"]
        },
        Medium: {
            weapons: ["AKM", "Cerberus 12GA", "Dual Blades", "FAMAS", "FCAR", "Model 1887", "Pike-556", "R.357", "Riot Shield"],
            specializations: ["Dematerializer", "Guardian Turret", "Healing Beam"],
            gadgets: ["APS Turret", "Data Reshaper", "Defibrillator", "Explosive Mine", "Gas Mine", "Glitch Trap", "Jump Pad", "Zipline", "Gas Grenade", "Goo Grenade", "Pyro Grenade", "Smoke Grenade", "Frag Grenade","Flashbang", "Proximity Sensor"]
        },
        Heavy: {
            weapons: ["50 Akimbo", "Flamethrower", "KS-23", "Lewis Gun", "M60", "MGL32", "Sledgehammer", "SHAK-50", "Spear"],
            specializations: ["Charge_N_Slam", "Goo Gun", "Mesh Shield", "Winch Claw"],
            gadgets: ["Anti-Gravity Cube", "Barricade", "Dome Shield", "Lockbolt Launcher", "Pyro Mine", "Proximity Sensor", "RPG-7", "Goo Grenade", "Pyro Grenade", "Smoke Grenade", "Frag Grenade", "Flashbang", "Explosive Mine", "Gas Grenade"]
        }
    };

    // Initialize spin selector
    const initSpinSelector = () => {
        const spinSelector = document.createElement('div');
        spinSelector.className = 'spin-selector';
    
        // Create step indicators (Updated Order)
        const step1 = document.createElement('div');
        step1.className = 'step active';
        step1.innerHTML = "Step 1️⃣: Choose number of spins";
    
        const step2 = document.createElement('div');
        step2.className = 'step';
        step2.innerHTML = "Step 2️⃣: Pick your contestant";
    
        // Create spin buttons (1-5)
        const buttonContainer = document.createElement('div');
        buttonContainer.className = 'spin-button-container';
    
        for (let i = 1; i <= 5; i++) {
            const btn = document.createElement('button');
            btn.className = 'spin-count-btn';  // No active class at start
            btn.textContent = i;
            btn.onclick = () => {
                if (isSpinning) return;
                document.querySelectorAll('.spin-count-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                selectedSpinCount = i;
            };
            buttonContainer.appendChild(btn);
        }
    
        
        // Insert elements in the correct order
        const buttonsContainer = document.querySelector('.buttons');
        if (buttonsContainer && buttonsContainer.parentNode) {
            buttonsContainer.parentNode.insertBefore(step1, buttonsContainer);
            buttonsContainer.parentNode.insertBefore(buttonContainer, buttonsContainer);
            buttonsContainer.parentNode.insertBefore(step2, buttonsContainer);
        } else {
            console.error("Error: .buttons container not found in the DOM.");
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

    const getRandomUniqueItems = (array, n) => {
        const shuffled = shuffleArray(array);
        return shuffled.slice(0, n);
    };

    const createItemContainer = (items) => {
        let repeatedItems = [...items];
        while (repeatedItems.length < 8) {
            repeatedItems = [...repeatedItems, ...items];
        }
        repeatedItems = shuffleArray(repeatedItems);
        repeatedItems = repeatedItems.slice(0, 8);
    
        return repeatedItems
            .map((item) => `
                <div class="itemCol">
                    <img src="images/${item.replace(/ /g, "_")}.webp" alt="${item}">
                    <p>${item}</p>
                </div>
            `)
            .join("");
    };

    const startSpinAnimation = (columns, callback) => {
        const itemHeight = 188;
        const baseSpeed = 12;
        
        const stopTimes = columns.map((_, index) => {
            if (index === 0) {
                return 700;
            } else if (currentSpin === selectedSpinCount) {
                return 700 + (index * 500);
            } else {
                return 700 + (index * 130);
            }
        });
        
        let allStopped = new Array(columns.length).fill(false);
        const startTime = Date.now();
    
        document.querySelectorAll(".outlineCircleBtn, .random, .spin-count-btn").forEach((btn) => 
            btn.setAttribute("disabled", "true")
        );
    
        columns.forEach(column => {
            let tempImages = [];
            for (let i = 0; i < 10; i++) {
                const randomItem = column.children[Math.floor(Math.random() * column.children.length)];
                tempImages.push(`<div class="itemCol">${randomItem.innerHTML}</div>`);
            }
            column.innerHTML = tempImages.join("");
        });
        
        const animate = () => {
            const currentTime = Date.now();
            let animationRunning = false;
    
            columns.forEach((column, index) => {
                if (!allStopped[index]) {
                    animationRunning = true;
                    
                    const shouldStop = currentTime - startTime >= stopTimes[index];
                    const currentOffset = parseFloat(column.style.transform?.replace("translateY(", "").replace("px)", "")) || 0;
                    
                    let newOffset = currentOffset + baseSpeed;
    
                    if (newOffset >= itemHeight * 8) {
                        newOffset = 0;
                    }
                    
                    if (shouldStop) {
                        allStopped[index] = true;
                        newOffset = itemHeight;
                    }
                    
                    column.style.transform = `translateY(${newOffset}px)`;
                    
                    if (shouldStop) {
                        const selectedItem = column.children[0];
                        if (selectedItem) {
                            selectedItem.classList.add("selected");
                        }
                    }
                }
            });
    
            if (animationRunning) {
                requestAnimationFrame(animate);
            } else {
                document.querySelectorAll(".outlineCircleBtn, .random").forEach((btn) => 
                    btn.removeAttribute("disabled")
                );
                callback(columns.map((col) => {
                    const selectedItem = col.querySelector(".selected");
                    return selectedItem ? selectedItem.innerText.trim() : "Unknown";
                }));
            }
            
        };
    
        animate();
    };

    const setActiveButton = (button) => {
        [lightLoadoutButton, mediumLoadoutButton, heavyLoadoutButton, randomLoadoutButton].forEach(btn => {
            if (btn) btn.classList.remove("active");
        });
   
        button.classList.add("active");
    };

// Separate logic for random and manual spins
const generateLoadout = (classType, button) => {
    if (isSpinning) return;
    isSpinning = true;
    currentSpin = 1;
    setActiveButton(button);
    
    if (classType === "Random") {
        displayRandomLoadout();
    } else {
        displayManualLoadout(classType);
    }
};

// Handle fully random loadouts (new class each spin)
const displayRandomLoadout = () => {
    const isFinalSpin = currentSpin === selectedSpinCount;
    
    // Add spin progress indicator
    const progressDiv = document.createElement('div');
    progressDiv.className = `spin-progress ${isFinalSpin ? 'final-spin' : ''}`;
    progressDiv.textContent = isFinalSpin ? 'Final Spin!' : `Spin ${currentSpin} of ${selectedSpinCount}`;
    outputDiv.insertBefore(progressDiv, outputDiv.firstChild);

    // Select a random class for this specific spin
    const classes = ["Light", "Medium", "Heavy"];
    const randomClass = classes[Math.floor(Math.random() * classes.length)];
    const loadout = loadouts[randomClass];
    
    const selectedGadgets = getRandomUniqueItems(loadout.gadgets, 3);
    
    const loadoutHTML = `
        <div class="items-container">
            <div class="item-container">
                <div class="scroll-container">
                    ${createItemContainer([randomClass])}
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
    startSpinAnimation(scrollContainers, (selectedItems) => {
        handleSpinComplete(progressDiv, true);
    });
};

// Handle manual class selection loadouts (fixed class)
const displayManualLoadout = (classType) => {
    const isFinalSpin = currentSpin === selectedSpinCount;
    
    const progressDiv = document.createElement('div');
    progressDiv.className = `spin-progress ${isFinalSpin ? 'final-spin' : ''}`;
    progressDiv.textContent = isFinalSpin ? 'Final Spin!' : `Spin ${currentSpin} of ${selectedSpinCount}`;
    outputDiv.insertBefore(progressDiv, outputDiv.firstChild);

    const loadout = loadouts[classType];
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
    startSpinAnimation(scrollContainers, (selectedItems) => {
        handleSpinComplete(progressDiv, false);
    });
};

// Unified spin completion handler
const handleSpinComplete = (progressDiv, isRandom) => {
    if (currentSpin < selectedSpinCount) {
        setTimeout(() => {
            currentSpin++;
            // Update spin count buttons
            document.querySelectorAll('.spin-count-btn').forEach(btn => {
                btn.classList.remove('active');
            });
            const remainingSpins = selectedSpinCount - currentSpin + 1;
            const nextButton = document.querySelector(`.spin-count-btn:nth-child(${remainingSpins})`);
            if (nextButton) {
                nextButton.classList.add('active');
            }
            
            // For random selection, generate new random loadout
            // For manual selection, keep the same class
            if (isRandom) {
                displayRandomLoadout();
            } else {
                const activeButton = document.querySelector('.outlineCircleBtn.active');
                const classType = activeButton.textContent;
                displayManualLoadout(classType);
            }
        }, 500);
    } else {
        progressDiv.textContent = '🎉 Final Loadout Locked In! 🎉';
        isSpinning = false;
        currentSpin = 1;
        
        // Reset UI state
        document.querySelectorAll(".spin-count-btn").forEach(btn => {
            btn.classList.remove("active");
            btn.removeAttribute("disabled");
        });
        
        // Only reset active state if it was a random selection
        if (isRandom) {
            [lightLoadoutButton, mediumLoadoutButton, heavyLoadoutButton, randomLoadoutButton].forEach(btn => {
                btn.classList.remove("active");
                btn.disabled = false;
            });
        }
        
        selectedSpinCount = 1;
    }
    
    // Ensure copy button functionality
    const copyButton = document.getElementById("copyLoadoutButton");
    if (copyButton) {
        copyButton.addEventListener("click", copyLoadout);
    }
};
    // Button click handlers
    lightLoadoutButton.onclick = () => generateLoadout("Light", lightLoadoutButton);
    mediumLoadoutButton.onclick = () => generateLoadout("Medium", mediumLoadoutButton);
    heavyLoadoutButton.onclick = () => generateLoadout("Heavy", heavyLoadoutButton);
    randomLoadoutButton.onclick = () => generateLoadout("Random", randomLoadoutButton);

    // Copy loadout function
    window.copyLoadout = () => {
        const columns = Array.from(document.querySelectorAll(".scroll-container"));
        const selectedItems = columns.map(col => {
            const selectedItem = col.querySelector(".selected");
            return selectedItem ? selectedItem.innerText.trim() : "Unknown";
        });
            
        if (selectedItems.includes("Unknown")) {
            alert("Error: Not all items were selected. Try spinning again.");
            return;
        }
    
        // Create the formatted text with NO indentation issues
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
    };
    

    // Set up recent buffs section
    if (recentBuffsSection) {
        const latestPatch = {
            date: "January 22, 2025",
            changes: {
                buffs: [
                    { weapon: "Lewis and M60", description: "Reduced visual recoil on Red Dot sights to align with other weapons." }
                ],
                nerfs: [],
                fixes: [
                    { weapon: "Spear", description: "Fixed an issue allowing sliding while performing the secondary spin attack." },
                    { weapon: "Sword", description: "Jump Pad secondary attack now launches players the intended (longer) distance." },
                    { weapon: "Dual Blades", description: "Resolved bug causing Dual Blades to get stuck swinging only once after swapping from a deployable." },
                    { weapon: "Dagger", description: "Fixed backstab charge-up not re-triggering after a vault if input was held." }
                ]
            }
        };

        recentBuffsSection.innerHTML = `
            <div class="buff-item">
                <p class="patch-date">Patch Date: ${latestPatch.date}</p>
                <div class="changes-category">
                    <h3>Buffs</h3>
                    <ul>
                        ${latestPatch.changes.buffs.map(buff => `<li><strong>${buff.weapon}:</strong> ${buff.description}</li>`).join("")}
                    </ul>
                </div>
                <div class="changes-category">
                    <h3>Nerfs</h3>
                    <ul>
                        ${latestPatch.changes.nerfs.length ? latestPatch.changes.nerfs.map(nerf => `<li><strong>${nerf.mode}:</strong> ${nerf.description}</li>`).join("") : "<li>N/A</li>"}
                    </ul>
                </div>
                <div class="changes-category">
                    <h3>Fixes</h3>
                    <ul>
                        ${latestPatch.changes.fixes.map(fix => `<li><strong>${fix.weapon}:</strong> ${fix.description}</li>`).join("")}
                    </ul>
                </div>
            </div>
        `;
    }

    // Initialize spin selector
    initSpinSelector();
});