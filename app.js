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
            btn.className = 'spin-count-btn' + (i === 1 ? ' active' : '');
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
        buttonsContainer.parentNode.insertBefore(step1, buttonsContainer);
        buttonsContainer.parentNode.insertBefore(buttonContainer, buttonsContainer);
        buttonsContainer.parentNode.insertBefore(step2, buttonsContainer);
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
                    <img src="images/${item.replaceAll(" ", "_")}.webp" alt="${item}">
                    <p>${item}</p>
                </div>
            `)
            .join("");
    };

    const startSpinAnimation = (columns, callback) => {
        const itemHeight = 188;
        const baseSpeed = 12;
        
        // First box always stops quickly, later boxes have varying delays based on spin number
        const stopTimes = columns.map((_, index) => {
            if (index === 0) {
                return 700; // First box stops faster (reduced from 1000ms)
            } else if (currentSpin === selectedSpinCount) {
                // On final spin, add increasing delays between boxes
                return 700 + (index * 500); // Keep dramatic pacing for final spin
            } else {
                // For initial spins, boxes stop more quickly
                return 700 + (index * 130); // Reduced from 200ms to 130ms for faster pacing
            }
        });
        
        let allStopped = new Array(columns.length).fill(false);
        const startTime = Date.now();
    
        document.querySelectorAll(".outlineCircleBtn, .random, .spin-count-btn").forEach((btn) => 
            btn.setAttribute("disabled", "true")
        );
    
        columns.forEach(column => {
            const originalContent = column.innerHTML;
        
            // Generate a sequence of random images for the "spinning effect"
            let tempImages = [];
            for (let i = 0; i < 10; i++) {  // Increase iterations for a better effect
                const randomItem = column.children[Math.floor(Math.random() * column.children.length)];
                tempImages.push(`<div class="itemCol">${randomItem.innerHTML}</div>`);
            }
        
            column.innerHTML = tempImages.join("");  // Replace with randomized sequence
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
    newOffset = itemHeight; // Just stop at one full height
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
                callback(columns.map((col) => 
                    col.querySelector(".selected").innerText.trim()
                ));
            }
        };
    
        animate();
    };

    const displayLoadout = ({ weapons, specializations, gadgets }, classType) => {
        const isFinalSpin = currentSpin === selectedSpinCount;
        
        // Add spin progress indicator
        const progressDiv = document.createElement('div');
        progressDiv.className = `spin-progress ${isFinalSpin ? 'final-spin' : ''}`;
        progressDiv.textContent = isFinalSpin ? 'Final Spin!' : `Spin ${currentSpin} of ${selectedSpinCount}`;
        outputDiv.insertBefore(progressDiv, outputDiv.firstChild);

        const selectedGadgets = getRandomUniqueItems(gadgets, 3);
    
        const loadoutHTML = `
            <div class="items-container">
                <div class="item-container">
                    <div class="scroll-container">
                        ${createItemContainer([classType])}
                    </div>
                </div>
                <div class="item-container">
                    <div class="scroll-container">
                        ${createItemContainer(weapons)}
                    </div>
                </div>
                <div class="item-container">
                    <div class="scroll-container">
                        ${createItemContainer(specializations)}
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
            if (currentSpin < selectedSpinCount) {
                // Start next spin after a brief pause
                setTimeout(() => {
                    currentSpin++;
                    displayLoadout({ weapons, specializations, gadgets }, classType);
                }, 500); // Reduced from 1000 to 500 for quicker transitions between spins
            } else {
                // Final spin completed
                progressDiv.textContent = '🎉 Final Loadout Locked In! 🎉';
isSpinning = false;
currentSpin = 1;

// ✅ Reset spin count buttons (1-5)
document.querySelectorAll(".spin-count-btn").forEach(btn => {
    btn.classList.remove("active");
    btn.removeAttribute("disabled"); // Make sure they are clickable
});

// ✅ Reset Light/Medium/Heavy buttons **without removing instructions**
[lightLoadoutButton, mediumLoadoutButton, heavyLoadoutButton].forEach(btn => {
    btn.classList.remove("active");
    btn.disabled = false; // Ensure they are re-enabled
});

// ✅ Ensure the Random Contestant button is also re-enabled
randomLoadoutButton.disabled = false;

// ❌ Do NOT touch the instruction text, so it stays visible!

            }
        });
    };

    const setActiveButton = (button) => {
        [lightLoadoutButton, mediumLoadoutButton, heavyLoadoutButton].forEach((btn) =>
            btn.classList.remove("active")
        );
        button.classList.add("active");
    };

    const generateLoadout = (classType, button) => {
        if (isSpinning) return;
        isSpinning = true;
        currentSpin = 1;
        setActiveButton(button);
        const loadout = loadouts[classType];
        displayLoadout(loadout, classType);
    };

    // Button click handlers
    lightLoadoutButton.onclick = () => generateLoadout("Light", lightLoadoutButton);
    mediumLoadoutButton.onclick = () => generateLoadout("Medium", mediumLoadoutButton);
    heavyLoadoutButton.onclick = () => generateLoadout("Heavy", heavyLoadoutButton);
    
    randomLoadoutButton.onclick = () => {
        const classes = ["Light", "Medium", "Heavy"];
        const randomClass = classes[Math.floor(Math.random() * classes.length)];
        const buttonMap = {
            Light: lightLoadoutButton,
            Medium: mediumLoadoutButton,
            Heavy: heavyLoadoutButton
        };
        generateLoadout(randomClass, buttonMap[randomClass]);
    };

    // Copy loadout function
    window.copyLoadout = () => {
        const columns = Array.from(document.querySelectorAll(".scroll-container"));
        const selectedItems = columns.map(
            (col) => col.querySelector(".selected").innerText.trim()
        );

        const copyText = `Class: ${selectedItems[0]}, Weapon: ${selectedItems[1]}, Specialization: ${selectedItems[2]}, Gadgets: ${selectedItems[3]}, ${selectedItems[4]}, ${selectedItems[5]}`.trim();

        navigator.clipboard
            .writeText(copyText)
            .then(() => alert("Loadout copied to clipboard!"))
            .catch((err) => console.error("Could not copy text: ", err));
    };

// Punishment Loadout Button Functionality
const punishmentLoadoutButton = document.getElementById("punishmentLoadoutButton");

if (punishmentLoadoutButton) {
    punishmentLoadoutButton.onclick = () => {
        window.location.href = "/punishment-loadout"; // Redirect to Punishment Loadout page
    };
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