document.addEventListener("DOMContentLoaded", () => {
  const outputDiv = document.getElementById("output");

  const loadouts = {
      light: {
          specializations: ["Cloaking Device", "Evasive Dash", "Grappling Hook"],
          weapons: ["93R", "LH1", "Recurve Bow", "Sword", "Throwing Knives"],
          gadgets: [
              "Breach Charge",
              "Gateway",
              "Glitch Grenade",
              "Gravity Vortex",
              "Sonar Grenade",
              "Stun Gun",
              "Thermal Vision",
              "Tracking Dart",
              "Vanishing Bomb",
          ],
      },
      medium: {
          specializations: ["Guardian Turret", "Healing Beam", "Dematerializer"],
          weapons: [
              "AKM",
              "Cerberus 12GA",
              "FAMAS",
              "FCAR",
              "Model 1887",
              "R357",
          ],
          gadgets: [
              "APS Turret",
              "Data Reshaper",
              "Defibrillator",
              "Explosive Mine",
              "Gas Mine",
              "Glitch Trap",
              "Jump Pad",
              "Proximity Sensor",
              "Zipline",
          ],
      },
      heavy: {
          specializations: ["Charge 'N' Slam", "Goo Gun", "Mesh Shield"],
          weapons: [
              "50 Akimbo",
              "Flamethrower",
              "KS-23",
              "Lewis Gun",
              "M60",
              "ShAK-50",
              "Sledgehammer",
          ],
          gadgets: [
              "Anti-Gravity Cube",
              "Barricade",
              "C4",
              "Dome Shield",
              "Lockbolt Launcher",
              "Pyro Grenade",
              "Pyro Mine",
              "RPG-7",
          ],
      },
      universalGadgets: [
          "Flashbang",
          "Frag Grenade",
          "Gas Grenade",
          "Goo Grenade",
          "Smoke Grenade",
      ],
  };

  function getRandomItem(array) {
      return array[Math.floor(Math.random() * array.length)];
  }

  function getUniqueGadgets(gadgetPool, count) {
      const uniqueGadgets = [];
      while (uniqueGadgets.length < count) {
          const gadget = getRandomItem(gadgetPool);
          if (!uniqueGadgets.includes(gadget)) {
              uniqueGadgets.push(gadget);
          }
      }
      return uniqueGadgets;
  }

  function generateLoadout(classType) {
      const classData = loadouts[classType];
      const randomSpecialization = getRandomItem(classData.specializations);
      const randomWeapon = getRandomItem(classData.weapons);
      const randomGadgets = getUniqueGadgets(
          [...classData.gadgets, ...loadouts.universalGadgets],
          3
      );

      outputDiv.innerHTML = `
          <div class="loadout">
              <div class="loadout-item">
                  <h3>Specialization:</h3>
                  <img src="images/${randomSpecialization.replaceAll(
                      " ",
                      "_"
                  )}_Rank_1.png" alt="${randomSpecialization}">
                  <p>${randomSpecialization}</p>
              </div>
              <div class="loadout-item">
                  <h3>Weapon:</h3>
                  <img src="images/${randomWeapon.replaceAll(
                      " ",
                      "_"
                  )}_Rank_1.png" alt="${randomWeapon}">
                  <p>${randomWeapon}</p>
              </div>
              <div class="loadout-item">
                  <h3>Gadgets:</h3>
                  <div class="gadget-row">
                      ${randomGadgets
                          .map(
                              (gadget) => `
                          <div>
                              <img src="images/${gadget.replaceAll(
                                  " ",
                                  "_"
                              )}_Rank_1.png" alt="${gadget}">
                              <p>${gadget}</p>
                          </div>
                      `
                          )
                          .join("")}
                  </div>
              </div>
          </div>
      `;
  }

  // Event Listeners
  document.getElementById("randomizeClass").onclick = () => {
      const classTypes = ["light", "medium", "heavy"];
      const randomClass = getRandomItem(classTypes);
      generateLoadout(randomClass);
  };

  document.getElementById("lightButton").onclick = () => {
      generateLoadout("light");
  };

  document.getElementById("mediumButton").onclick = () => {
      generateLoadout("medium");
  };

  document.getElementById("heavyButton").onclick = () => {
      generateLoadout("heavy");
  };
});
