document.addEventListener("DOMContentLoaded", () => {
    let state = {
        selectedClass: null,
        isSpinning: false,
        currentSpin: 1,
        totalSpins: 0
    };

    const loadouts = {
        Light: {
            weapons: ["93R", "Dagger", "LH1", "M26 Matter", "Recurve Bow", "Sword", "V9S", "XP-54", "Throwing Knives"],
            specializations: ["Cloaking Device", "Evasive Dash", "Grappling Hook"],
            gadgets: ["Breach Charge", "Gateway", "Glitch Grenade", "Gravity Vortex", "Sonar Grenade", "Stun Gun"]
        },
        Medium: {
            weapons: ["AKM", "Cerberus 12GA", "Dual Blades", "FAMAS", "FCAR", "Model 1887", "Pike-556", "R.357", "Riot Shield"],
            specializations: ["Dematerializer", "Guardian Turret", "Healing Beam"],
            gadgets: ["APS Turret", "Data Reshaper", "Defibrillator", "Explosive Mine", "Gas Mine", "Glitch Trap"]
        },
        Heavy: {
            weapons: ["50 Akimbo", "Flamethrower", "KS-23", "Lewis Gun", "M60", "MGL32", "Sledgehammer", "SHAK-50", "Spear"],
            specializations: ["Charge_N_Slam", "Goo Gun", "Mesh Shield", "Winch Claw"],
            gadgets: ["Anti-Gravity Cube", "Barricade", "Dome Shield", "Lockbolt Launcher", "Pyro Mine", "RPG-7"]
        }
    };

    const classButtons = document.querySelectorAll('.class-button');
    const spinButtons = document.querySelectorAll('.spin-button');
    const spinSelection = document.getElementById('spinSelection');
    const outputDiv = document.getElementById("output");

    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }

    function getRandomItems(array, count) {
        return shuffleArray([...array]).slice(0, count);
    }

    function createScrollContainer(items, index, isLast) {
        const container = document.createElement('div');
        container.className = 'scroll-container';
        container.style.position = 'relative';
        container.style.height = '191px';
        container.style.overflow = 'hidden';
        container.style.transform = 'translateY(0px)';

        const spinDuration = isLast ? 2000 + (index * 300) : 1000 + (index * 200);
        const itemsToShow = 20;
        let html = '';

        // Repeat items to create illusion of infinite scroll
        for (let i = 0; i < itemsToShow; i++) {
            const item = items[i % items.length];
            html += `
                <div class="itemCol" style="position: absolute; top: ${i * 191}px; width: 100%;">
                    <img src="images/${item.replace(/ /g, "_")}.webp" alt="${item}">
                    <p>${item}</p>
                </div>
            `;
        }

        container.innerHTML = html;
        return { container, spinDuration };
    }

    function animateContainer(container, spinDuration, finalPosition) {
        return new Promise(resolve => {
            const totalDistance = 191 * 19; // 19 items to scroll past
            const start = performance.now();
            
            function animate(currentTime) {
                const elapsed = currentTime - start;
                const progress = Math.min(elapsed / spinDuration, 1);
                
                let currentPosition;
                if (progress < 0.7) {
                    // Fast spin at constant speed
                    currentPosition = -(totalDistance * (progress / 0.7));
                } else {
                    // Gradual slowdown
                    const slowdownProgress = (progress - 0.7) / 0.3;
                    const easeOut = 1 - Math.pow(1 - slowdownProgress, 3);
                    currentPosition = -(totalDistance + (191 * easeOut));
                }
                
                container.style.transform = `translateY(${currentPosition}px)`;
                
                if (progress < 1) {
                    requestAnimationFrame(animate);
                } else {
                    container.style.transform = `translateY(${finalPosition}px)`;
                    resolve();
                }
            }
            
            requestAnimationFrame(animate);
        });
    }

    async function spinLoadout(spins) {
        if (!state.selectedClass || state.isSpinning) {
            alert("Please select a class first!");
            return;
        }
        
        state.isSpinning = true;
        state.totalSpins = spins;
        
        for (let currentSpin = 1; currentSpin <= spins; currentSpin++) {
            state.currentSpin = currentSpin;
            const isLastSpin = currentSpin === spins;
            
            const classType = state.selectedClass === 'random' ? 
                ['Light', 'Medium', 'Heavy'][Math.floor(Math.random() * 3)] : 
                state.selectedClass;
                
            const loadout = loadouts[classType];
            const selectedGadgets = getRandomItems(loadout.gadgets, 3);
            
            // Create containers
            outputDiv.innerHTML = '';
            const containers = [
                createScrollContainer([classType], 0, isLastSpin),
                createScrollContainer(loadout.weapons, 1, isLastSpin),
                createScrollContainer(loadout.specializations, 2, isLastSpin),
                ...selectedGadgets.map((gadget, idx) => 
                    createScrollContainer([gadget], 3 + idx, isLastSpin)
                )
            ];
            
            // Add containers to DOM
            const itemsContainer = document.createElement('div');
            itemsContainer.className = 'items-container';
            containers.forEach(({ container }) => {
                const itemContainer = document.createElement('div');
                itemContainer.className = 'item-container';
                itemContainer.appendChild(container);
                itemsContainer.appendChild(itemContainer);
            });
            outputDiv.appendChild(itemsContainer);
            
            // Animate all containers
            await Promise.all(containers.map(({ container, spinDuration }) => 
                animateContainer(container, spinDuration, -191)
            ));
            
            if (!isLastSpin) {
                await new Promise(resolve => setTimeout(resolve, 500));
            }
        }
        
        state.isSpinning = false;
        state.currentSpin = 1;
        state.selectedClass = null;
        
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

    classButtons.forEach(button => {
        button.addEventListener('click', () => {
            if (state.isSpinning) return;
            
            classButtons.forEach(b => b.classList.remove('selected'));
            button.classList.add('selected');
            
            state.selectedClass = button.dataset.class;
            
            if (state.selectedClass === 'random') {
                spinLoadout(1);
            } else {
                spinSelection.classList.remove('disabled');
            }
        });
    });

    spinButtons.forEach(button => {
        button.addEventListener('click', () => {
            if (state.isSpinning) return;
            
            spinButtons.forEach(b => b.classList.remove('selected'));
            button.classList.add('selected');
            
            spinLoadout(parseInt(button.dataset.spins));
        });
    });

    document.getElementById("copyLoadoutButton")?.addEventListener("click", () => {
        const selectedItems = Array.from(document.querySelectorAll(".scroll-container"))
            .map(container => {
                const selectedItem = container.querySelector(".itemCol");
                return selectedItem ? selectedItem.querySelector("p").textContent.trim() : "Unknown";
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