
    document.addEventListener("DOMContentLoaded", () => {
        // Element References
        const classButtons = document.querySelectorAll('.class-button');
        const spinButtons = document.querySelectorAll('.spin-button');
        const outputDiv = document.getElementById("output");
        const recentBuffsSection = document.querySelector(".recentBuffsSection .buffs-container");
        const copyButton = document.getElementById("copyLoadoutButton");
    
        // State Management
        let selectedSpinCount = 0;
        let isSpinning = false;
        let currentSpin = 1;
        let selectedClass = null;

        classButtons.forEach(button => {
            button.addEventListener('click', () => {
                if (isSpinning) return;
                
                classButtons.forEach(b => b.classList.remove('active')); 
                button.classList.add('active');
        
                selectedClass = button.dataset.class;
                if (selectedClass === 'random') {
                    spinLoadout(1);
                } else {
                    document.getElementById('spinSelection').classList.remove('disabled');
                }
            });
        });
        spinButtons.forEach(button => {
            button.addEventListener('click', () => {
                if (isSpinning) return;
                
                spinButtons.forEach(b => b.classList.remove('active'));
                button.classList.add('active');
                selectedSpinCount = parseInt(button.dataset.spins);
                currentSpin = selectedSpinCount;
                
                spinLoadout();
            });
        });
    // Data Configuration
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

    // Utility Functions
    const shuffleArray = (array) => {
        const newArray = [...array];
        for (let i = newArray.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
        }
        return newArray;
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

    // Animation Functions
    const startSpinAnimation = (columns, callback) => {
        const itemHeight = 188;
        const baseSpeed = 12;
        
        const stopTimes = columns.map((_, index) => {
            if (index === 0) {
                return 700;
            } else if (currentSpin === selectedSpinCount) {
                return 700 + (index * 500);
            } else {
                return 700 + (index * 110);
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

    // Core Functions
    const setActiveButton = (button) => {
        if (isSpinning) return;
        
        [lightLoadoutButton, mediumLoadoutButton, heavyLoadoutButton, randomLoadoutButton].forEach(btn => {
            if (btn) btn.classList.remove("active");
        });
        
        button.classList.add("active");
        selectedClass = button.id.replace('LoadoutButton', '');
        
        if (selectedSpinCount > 0) {
            generateLoadout(selectedClass, button);
        }
    };

    const generateLoadout = (classType, button) => {
        if (isSpinning || selectedSpinCount === 0) return;
        
        isSpinning = true;
        currentSpin = 1;
        
        if (classType === "random") {
            displayRandomLoadout();
        } else {
            displayManualLoadout(classType);
        }
    };

    const displayManualLoadout = (classType) => {
        const isFinalSpin = currentSpin === selectedSpinCount;
        
        const progressDiv = document.createElement('div');
        progressDiv.className = `spin-progress ${isFinalSpin ? 'final-spin' : ''}`;
        progressDiv.textContent = isFinalSpin ? 'Final Spin!' : `Spin ${currentSpin} of ${selectedSpinCount}`;
        outputDiv.insertBefore(progressDiv, outputDiv.firstChild);

        const loadout = loadouts[classType];
        const selectedGadgets = getRandomUniqueItems(loadout.gadgets, 3);
        
        const loadoutHTML = `
    <div class="items-container" style="display: flex; flex-wrap: nowrap; overflow-x: auto;">

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

    const displayRandomLoadout = () => {
        const isFinalSpin = currentSpin === selectedSpinCount;
        
        const progressDiv = document.createElement('div');
        progressDiv.className = `spin-progress ${isFinalSpin ? 'final-spin' : ''}`;
        progressDiv.textContent = isFinalSpin ? 'Final Spin!' : `Spin ${currentSpin} of ${selectedSpinCount}`;
        outputDiv.insertBefore(progressDiv, outputDiv.firstChild);

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

    const handleSpinComplete = (progressDiv, isRandom) => {
        if (currentSpin < selectedSpinCount) {
            setTimeout(() => {
                currentSpin++;
                document.querySelectorAll('.spin-count-btn').forEach(btn => {
                    btn.classList.remove('active');
                });
                const remainingSpins = selectedSpinCount - currentSpin + 1;
                const nextButton = document.querySelector(`.spin-count-btn:nth-child(${remainingSpins})`);
                if (nextButton) {
                    nextButton.classList.add('active');
                }
                
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
            
            document.querySelectorAll(".spin-count-btn").forEach(btn => {
                btn.classList.remove("active");
                btn.removeAttribute("disabled");
            });
            
            [lightLoadoutButton, mediumLoadoutButton, heavyLoadoutButton, randomLoadoutButton].forEach(btn => {
                btn.classList.remove("active");
                btn.removeAttribute("disabled");
            });

            selectedClass = null;
            selectedSpinCount = 1;
            isSpinning = false;
            currentSpin = 1;
        }
    };

    // Initialize Spin Selector
    const initSpinSelector = () => {
        const spinSelector = document.createElement('div');
        spinSelector.className = 'spin-selector';
    
        const step1 = document.createElement('div');
        step1.className = 'step active';
        step1.innerHTML = "Step 1: Select your contestant class";
    
        const step2 = document.createElement('div');
        step2.className = 'step';
        step2.innerHTML = "Step 2: Choose number of spins";
    
        const buttonContainer = document.createElement('div');
        buttonContainer.className = 'spin-button-container';
    
        for (let i = 1; i <= 5; i++) {
            const btn = document.createElement('button');
            btn.className = 'spin-count-btn';
            btn.textContent = i;
            btn.onclick = () => {
                if (isSpinning) return;
                document.querySelectorAll('.spin-count-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                selectedSpinCount = i;
                if (selectedClass) {
                    generateLoadout(selectedClass, document.querySelector('.outlineCircleBtn.active'));
                }
            };
            buttonContainer.appendChild(btn);
        }
    
        const buttonsContainer = document.querySelector('.buttons');
        if (buttonsContainer && buttonsContainer.parentNode) {
            buttonsContainer.parentNode.insertBefore(step1, buttonsContainer);
            buttonsContainer.after(step2);
            step2.after(buttonContainer);
        }
    };

    // Set up copy button functionality
    if (copyButton) {
        copyButton.addEventListener("click", () => {
            const columns = Array.from(document.querySelectorAll(".scroll-container"));
            const selectedItems = columns.map(col => {
                const selectedItem = col.querySelector(".selected p");
                return selectedItem ? selectedItem.textContent.trim() : "Unknown";
            });
                
            if (selectedItems.includes("Unknown")) {
                alert("Please spin for a loadout first!");
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
                .catch(err => {
                    console.error("Could not copy text: ", err);
                    alert("Failed to copy loadout. Please try again.");
                });
        });
    }

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