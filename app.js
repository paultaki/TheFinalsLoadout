function generateLoadout(spins) {
  const outputDiv = document.getElementById("output");
  outputDiv.innerHTML = ""; // Clear previous loadout

  let animationInterval = setInterval(() => {
      const classType = randomItem(Object.keys(loadouts));
      const data = loadouts[classType];
      const tempLoadout = {
          class: classType,
          weapon: randomItem(data.weapons),
          specialization: randomItem(data.specializations),
          gadgets: getUniqueGadgets(data.gadgets, 3),
      };

      outputDiv.innerHTML = `
          <p>Class: ${tempLoadout.class}</p>
          <p>Weapon: ${tempLoadout.weapon}</p>
          <p>Specialization: ${tempLoadout.specialization}</p>
          <p>Gadgets: ${tempLoadout.gadgets.join(", ")}</p>
      `;
  }, 100); // Change every 100ms for quick cycling

  setTimeout(() => {
      clearInterval(animationInterval);

      // Generate the final loadout
      const classType = randomItem(Object.keys(loadouts));
      const data = loadouts[classType];
      const finalLoadout = {
          class: classType,
          weapon: randomItem(data.weapons),
          specialization: randomItem(data.specializations),
          gadgets: getUniqueGadgets(data.gadgets, 3),
      };

      // Display the final loadout
      outputDiv.innerHTML = `
          <h3>Final Loadout:</h3>
          <p>Class: ${finalLoadout.class}</p>
          <p>Weapon: ${finalLoadout.weapon}</p>
          <p>Specialization: ${finalLoadout.specialization}</p>
          <p>Gadgets: ${finalLoadout.gadgets.join(", ")}</p>
      `;
  }, spins * 1000); // Cycle for the duration (e.g., 4 spins = 4 seconds)
}
