document.addEventListener("DOMContentLoaded", () => {
    const spinButton = document.getElementById("spinButton");
    const weaponSlot = document.getElementById("weaponSlot");
    const specializationSlot = document.getElementById("specializationSlot");
    const gadgetSlot = document.getElementById("gadgetSlot");

    const loadouts = {
        weapons: ["93R", "Dagger", "LH1", "M26 Matter", "Recurve Bow", "Sword", "V9S", "XP-54"],
        specializations: ["Cloaking Device", "Evasive Dash", "Grappling Hook"],
        gadgets: ["Breach Charge", "Gateway", "Glitch Grenade", "Gravity Vortex", "Sonar Grenade"]
    };

    const createSlotImages = (slot, items) => {
        slot.innerHTML = items
            .map(item => `<img src="./images/${item.replaceAll(" ", "_")}.png" alt="${item}">`)
            .join("");
    };

    const spinSlot = (slot, items, delay) => {
        createSlotImages(slot, items);

        const images = slot.querySelectorAll("img");
        let counter = 0;

        const spin = setInterval(() => {
            slot.scrollTop = (slot.scrollTop + 100) % (images.length * 100);
            counter++;
            if (counter > 20 + delay) {
                clearInterval(spin);
                const randomItem = items[Math.floor(Math.random() * items.length)];
                slot.innerHTML = `<img src="./images/${randomItem.replaceAll(" ", "_")}.png" alt="${randomItem}">`;
            }
        }, 50);
    };

    spinButton.addEventListener("click", () => {
        spinSlot(weaponSlot, loadouts.weapons, 0);
        spinSlot(specializationSlot, loadouts.specializations, 10);
        spinSlot(gadgetSlot, loadouts.gadgets, 20);
    });
});
