document.addEventListener("DOMContentLoaded", () => {
    const randomLoadoutButton = document.getElementById("randomLoadoutButton");
    const outputDiv = document.getElementById("output");

    const loadouts = {
        Light: {
            weapons: ["Dagger", "Recurve Bow", "93R", "SR-84"],
            specializations: ["Cloaking Device"],
            gadgets: ["Breach Charge", "Gravity Vortex", "Thermal Bore", "Thermal Vision", "Tracking Dart"]
        },
        Medium: {
            weapons: ["Dual Blades", "Pike-556", "R.357", "Riot Shield", "Model 1887"],
            specializations: ["Dematerializer", "Guardian Turret"],
            gadgets: ["APS Turret", "Data Reshaper", "Smoke Grenade", "Gas Mine", "Proximity Sensor"]
        },
        Heavy: {
            weapons: ["KS-23", "MGL32", "Spear"],
            specializations: ["Charge_N_Slam", "Goo Gun"],
            gadgets: ["Anti-Gravity Cube", "Lockbolt Launcher", "Pyro Mine", "Proximity Sensor", "Smoke Grenade", "Lockbold Launcher"]
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
    
        // Ensure we have enough items to prevent blank spaces
        while (repeatedItems.length < 100) {  // Increased to 100 for longer spins
            repeatedItems.push(...items);
        }
    
        // Shuffle for randomness
        repeatedItems = shuffleArray(repeatedItems);
    
        // Limit the total count if necessary
        repeatedItems.length = 100;  // Match the number above
    
        // Generate HTML for items
        return repeatedItems
            .map(
                (item) => `
                    <div class="itemCol">
                        <img src="images/${item.replaceAll(" ", "_")}.webp" 
                             alt="The Finals ${item} - Random Loadout Item" 
                             title="The Finals ${item}"
                             width="140" 
                             height="144">
                        <p>${item}</p>
                    </div>
                `
            )
            .join("");
    };

    const startSpinAnimation = (columns, callback) => {
        const itemHeight = 188;
        const baseSpeed = 12;
        
        // Configure stop times based on whether it's the final spin
        const stopTimes = columns.map((_, index) => {
            // Single spin timing pattern
            switch(index) {
                case 0: return 700;  // First box
                case 1: return 1200; // +0.5s
                case 2: return 1700; // +0.5s
                case 3: return 2200; // +0.5s
                case 4: return 2900; // +0.7s
                case 5: return 3900; // +1.0s
                default: return 700 + (index * 110);
            }
        });
        
        // Create and add locked tags to each container
        columns.forEach(column => {
            const container = column.closest('.item-container');
            const existingTag = container.querySelector('.locked-tag');
            if (!existingTag) {
                const lockedTag = document.createElement('div');
                lockedTag.className = 'locked-tag';
                lockedTag.textContent = 'Locked In!';
                container.appendChild(lockedTag);
            }
        });
        
        let allStopped = new Array(columns.length).fill(false);
        document.querySelectorAll(".random").forEach((btn) => btn.setAttribute("disabled", "true"));
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
                    
                    // Calculate speed reduction for dramatic effect
                    let speed = baseSpeed;
                    if (index === columns.length - 2 && timeElapsed > stopTimes[index] - 500) {
                        // Gradually slow down second to last column
                        speed = baseSpeed * Math.max(0.3, (stopTimes[index] - timeElapsed) / 500);
                    } else if (index === columns.length - 1 && timeElapsed > stopTimes[index] - 800) {
                        // Gradually slow down last column even more
                        speed = baseSpeed * Math.max(0.2, (stopTimes[index] - timeElapsed) / 800);
                    }
                    
                    let newOffset = currentOffset + speed;
                    if (newOffset >= itemHeight * 8) newOffset = 0;
                    
                    if (shouldStop) {
                        allStopped[index] = true;
                        newOffset = itemHeight;
                        const selectedItem = column.children[0];
                        if (selectedItem) {
                            selectedItem.classList.add("selected");
                            // Add highlighting effect
                            const container = column.closest('.item-container');
                            container.classList.add('final-glow');
                            const tag = container.querySelector('.locked-tag');
                            if (tag) {
                                tag.classList.add('show');
                            }
                        }
                    }
                    
                    column.style.transform = `translateY(${newOffset}px)`;
                }
            });

            if (animationRunning) {
                requestAnimationFrame(animate);
            } else {
                // Enable the button again after spinning stops
                document.querySelectorAll(".random").forEach((btn) => btn.removeAttribute("disabled"));
                const selectedItems = columns.map(col => col.querySelector(".selected").innerText.trim());
                callback(selectedItems);
            }
        };

        requestAnimationFrame(animate);
    };

    const displayLoadout = (loadout, className) => {
        const { weapons, specializations, gadgets } = loadout;
        const selectedGadgets = getRandomUniqueItems(gadgets, 3);

        const loadoutHTML = `
            <div class="items-container">
                <div class="item-container">
                    <div class="scroll-container">${createItemContainer([className])}</div>
                </div>
                <div class="item-container">
                    <div class="scroll-container">${createItemContainer(weapons)}</div>
                </div>
                <div class="item-container">
                    <div class="scroll-container">${createItemContainer(specializations)}</div>
                </div>
                ${shuffleArray(selectedGadgets)
                    .map(
                        (gadget) => `
                        <div class="item-container">
                            <div class="scroll-container">
                                ${createItemContainer([gadget])}
                            </div>
                        </div>`
                    )
                    .join("")}
            </div>
            <button class="copy-button" onclick="copyLoadout()">Copy Loadout</button>
            <div class="funny-joke-container"></div>
        `;

        outputDiv.innerHTML = loadoutHTML;

        const scrollContainers = Array.from(outputDiv.querySelectorAll(".scroll-container"));
        startSpinAnimation(scrollContainers, (selectedItems) => {
            const jokes = [
                "This loadout is guaranteed to impress... no one.",
                "Good luck surviving this chaos.",
                "Your enemies are laughing already.",
                "Is it bad? Yes. Is it fun? Absolutely.",
                "This loadout is scientifically engineered to trigger your teammates.",
                "Fun fact: This setup has a 0.01% win rate. But hey, stats are overrated.",
                "Your enemies called—they're requesting this exact loadout to play against.",
                "Think of it as a learning experience. For your enemies.",
                "Your enemies might win, but at least you're memorable.",
                "You're not losing, you're just building character!",
                "Is it sabotage or genius? It's definitely sabotage.",
                "The only thing deadlier than this loadout is your decision-making.",
                "Brought to you by the RNG gods."
            ];
            const randomJoke = jokes[Math.floor(Math.random() * jokes.length)];
            const jokeContainer = outputDiv.querySelector('.funny-joke-container');
            jokeContainer.innerHTML = `<p class="funny-joke">${randomJoke}</p>`;
            requestAnimationFrame(() => {
                jokeContainer.classList.add('visible');
            });

            console.log("Selected Items:", selectedItems);
        });
    };

    randomLoadoutButton.onclick = () => {
        const classes = ["Light", "Medium", "Heavy"];
        const randomClass = classes[Math.floor(Math.random() * classes.length)];
        const loadout = loadouts[randomClass];
        displayLoadout(loadout, randomClass);
    };
});

window.copyLoadout = () => {
    const columns = Array.from(document.querySelectorAll(".scroll-container"));
    const selectedItems = columns.map(
        (col) => col.querySelector(".selected").innerText.trim()
    );

    const copyText = `
        Class: ${selectedItems[0]}, Weapon: ${selectedItems[1]}, Specialization: ${selectedItems[2]}, Gadgets: ${selectedItems[3]}, ${selectedItems[4]}, ${selectedItems[5]}
    `.trim();

    navigator.clipboard
        .writeText(copyText)
        .then(() => alert("Loadout copied to clipboard!"))
        .catch((err) => console.error("Could not copy text: ", err));
};