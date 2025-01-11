document.addEventListener("DOMContentLoaded", () => {
  const outputDiv = document.getElementById("output");

  const loadoutTypes = {
      light: {
          specialization: "Cloaking Device",
          weapon: "M11",
          gadgets: ["Smoke Grenade", "Sonar Grenade", "Gateway"],
      },
      medium: {
          specialization: "Guardian Turret",
          weapon: "AKM",
          gadgets: ["Frag Grenade", "Gas Mine", "Jump Pad"],
      },
      heavy: {
          specialization: "Mesh Shield",
          weapon: "ShAK-50",
          gadgets: ["Pyro Grenade", "Lockbolt Launcher", "Dome Shield"],
      },
  };

  function createLoadout(loadout) {
      outputDiv.innerHTML = `
          <div>
              <img src="images/${loadout.specialization.replaceAll(" ", "_")}_Rank_1.png" alt="${loadout.specialization}">
              <p>${loadout.specialization.toUpperCase()}</p>
          </div>
          <div>
              <img src="images/${loadout.weapon.replaceAll(" ", "_")}_Rank_1.png" alt="${loadout.weapon}">
              <p>${loadout.weapon.toUpperCase()}</p>
          </div>
          <div class="gadget-row">
              ${loadout.gadgets
                  .map(
                      (gadget) => `
                  <div>
                      <img src="images/${gadget.replaceAll(" ", "_")}_Rank_1.png" alt="${gadget}">
                      <p>${gadget.toUpperCase()}</p>
                  </div>
              `
                  )
                  .join("")}
          </div>
      `;
  }

  document.getElementById("randomizeClass").onclick = () => {
      const randomClass =
          Object.keys(loadoutTypes)[
              Math.floor(Math.random() * Object.keys(loadoutTypes).length)
          ];
      createLoadout(loadoutTypes[randomClass]);
  };

  document.getElementById("lightButton").onclick = () => {
      createLoadout(loadoutTypes.light);
  };

  document.getElementById("mediumButton").onclick = () => {
      createLoadout(loadoutTypes.medium);
  };

  document.getElementById("heavyButton").onclick = () => {
      createLoadout(loadoutTypes.heavy);
  };
});
