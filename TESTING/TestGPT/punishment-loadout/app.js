document.addEventListener("DOMContentLoaded", () => {
    const randomLoadoutButton = document.getElementById("randomLoadoutButton");
    const outputDiv = document.getElementById("output");

    const loadouts = {
        Light: {
            weapons: ["Dagger", "Recurve Bow", "Sword"],
            specializations: ["Cloaking Device"],
            gadgets: ["Breach Charge", "Gravity Vortex", "Thermal Bore", "Thermal Vision", "Tracking Dart"]
        },
        Medium: {
            weapons: ["Dual Blades", "Pike-556", "R.357", "Riot Shield"],
            specializations: ["Dematerializer", "Guardian Turret"],
            gadgets: ["APS Turret", "Data Reshaper", "Smoke Grenade", "Gas Mine", "Proximity Sensor"]
        },
        Heavy: {
            weapons: ["KS-23", "MGL32", "Spear"],
            specializations: ["Charge_N_Slam", "Goo Gun"],
            gadgets: ["Anti-Gravity Cube", "Lockbolt Launcher", "Pyro Mine", "Proximity Sensor", "Smoke Grenade"]
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
            repeatedItems.push(...items);
        }
        repeatedItems = shuffleArray(repeatedItems);
        repeatedItems.length = 8;

        return repeatedItems
            .map(
                (item) => `
                    <div class="itemCol">
                        <img src="images/${item.replaceAll(" ", "_")}_Rank_1.webp" alt="${item}">
                        <p>${item}</p>
                    </div>
                `
            )
            .join("");
    };

    const startSpinAnimation = (columns, callback) => {
        const itemHeight = 188;
        const stopOffsets = columns.map((_, index) => itemHeight * (1 + index));

        let allStopped = new Array(columns.length).fill(false);

        document.querySelectorAll(".random").forEach((btn) => btn.setAttribute("disabled", "true"));

        const animate = () => {
            let animationRunning = false;

            columns.forEach((column, index) => {
                if (!allStopped[index]) {
                    animationRunning = true;

                    const currentOffset = parseFloat(column.style.transform.replace("translateY(", "").replace("px)", "")) || 0;
                    const newOffset = currentOffset + 7;
                    column.style.transform = `translateY(${newOffset}px)`;

                    if (newOffset >= stopOffsets[index]) {
                        allStopped[index] = true;
                        column.style.transform = `translateY(${stopOffsets[index]}px)`;
                        const selectedIndex = (7 - ((stopOffsets[index] / itemHeight) % 8)) % 8;
                        const selectedItem = column.children[selectedIndex];
                        selectedItem.classList.add("selected");
                    }
                }
            });

            if (animationRunning) {
                requestAnimationFrame(animate);
            } else {
                document.querySelectorAll(".random").forEach((btn) => btn.removeAttribute("disabled"));
                callback(columns.map((col) => col.querySelector(".selected").innerText.trim()));
            }
        };

        animate();
    };

    const displayLoadout = ({ weapons, specializations, gadgets }) => {
        const selectedGadgets = getRandomUniqueItems(gadgets, 3);

        const loadoutHTML = `
            <div class="items-container">
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
        `;

        outputDiv.innerHTML = loadoutHTML;

        const scrollContainers = Array.from(outputDiv.querySelectorAll(".scroll-container"));
        startSpinAnimation(scrollContainers, (selectedItems) => {
            const jokes = [
                "This loadout is guaranteed to impress... no one.",
                "Good luck surviving this chaos.",
                "Your enemies are laughing already.",
                "Is it bad? Yes. Is it fun? Absolutely.",
                "Brought to you by the RNG gods."
            ];
            const randomJoke = jokes[Math.floor(Math.random() * jokes.length)];
            outputDiv.insertAdjacentHTML("beforeend", `<p class="funny-joke">${randomJoke}</p>`);

            console.log("Selected Items:", selectedItems);
        });
    };

    randomLoadoutButton.onclick = () => {
        const classes = ["Light", "Medium", "Heavy"];
        const randomClass = classes[Math.floor(Math.random() * classes.length)];
        const loadout = loadouts[randomClass];
        displayLoadout(loadout);
    };
});

window.copyLoadout = () => {
    const columns = Array.from(document.querySelectorAll(".scroll-container"));
    const selectedItems = columns.map(
        (col) => col.querySelector(".selected").innerText.trim()
    );

    const copyText = `
        Weapon: ${selectedItems[0]}, Specialization: ${selectedItems[1]}, Gadgets: ${selectedItems[2]}, ${selectedItems[3]}, ${selectedItems[4]}
    `.trim();

    navigator.clipboard
        .writeText(copyText)
        .then(() => alert("Loadout copied to clipboard!"))
        .catch((err) => console.error("Could not copy text: ", err));
};
