document.addEventListener("DOMContentLoaded", () => {
    const randomLoadoutButton = document.getElementById("randomLoadoutButton");
    const weaponSlot = document.getElementById("weaponSlot");
    const specializationSlot = document.getElementById("specializationSlot");
    const gadgetsSlot = document.getElementById("gadgetsSlot");

    const loadouts = {
        weapons: ["93R", "Dagger", "LH1", "M26 Matter", "Recurve Bow", "Sword", "V9S", "XP-54"],
        specializations: ["Cloaking Device", "Evasive Dash", "Grappling Hook"],
        gadgets: ["Breach Charge", "Gateway", "Glitch Grenade", "Gravity Vortex", "Sonar Grenade"]
    };

    const loadImages = (slot, items) => {
        slot.innerHTML = items
            .map(item => `<img src="images/${item.replaceAll(" ", "_")}.png" alt="${item}">`)
            .join("");
    };

    const spinSlot = (slot, items, delay) => {
        const images = slot.querySelectorAll("img");
        images.forEach((img, index) => {
            img.style.animation = `spin 0.5s linear infinite`;
            img.style.animationDelay = `${index * 0.1}s`;
        });

        setTimeout(() => {
            const selectedItem = items[Math.floor(Math.random() * items.length)];
            slot.innerHTML = `<img src="images/${selectedItem.replaceAll(" ", "_")}.png" alt="${selectedItem}">`;
        }, delay);
    };

    randomLoadoutButton.onclick = () => {
        loadImages(weaponSlot, loadouts.weapons);
        loadImages(specializationSlot, loadouts.specializations);
        loadImages(gadgetsSlot, loadouts.gadgets);

        spinSlot(weaponSlot, loadouts.weapons, 3000);
        spinSlot(specializationSlot, loadouts.specializations, 4000);
        spinSlot(gadgetsSlot, loadouts.gadgets, 5000);
    };
});
