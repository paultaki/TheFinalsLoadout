  // SIMPLIFIED: Animate handicap selection - just select and continue
  async animateHandicapSelection() {
    console.log("🎯 Starting handicap selection");

    // List of handicaps
    const handicaps = [
      { name: "ADS Only", desc: "Can only use ADS (Aim Down Sights)" },
      { name: "No Healing", desc: "Cannot use healing items or abilities" },
      { name: "Inverted Controls", desc: "Mouse movement is inverted" },
      { name: "Sloth Mode", desc: "No sprinting - must walk everywhere" },
      { name: "Bunny Hop Ban", desc: "No jumping - stairs and ramps only" },
      { name: "Squirrel Mode", desc: "Max out your mouse DPI/sensitivity" },
      { name: "Snail Aim", desc: "Set sensitivity to the lowest value" },
      { name: "Reload Addict", desc: "Must reload after every kill or 3 shots" },
      { name: "Permanent Crouch", desc: "Must stay crouched the entire game" },
      { name: "Silent Treatment", desc: "Play with all audio muted" },
      { name: "One Life", desc: "No respawning - death ends the round" },
      { name: "Melee Only", desc: "Can only use melee weapons" },
      { name: "Backwards Mode", desc: "Can only move backwards" },
      { name: "No Minimap", desc: "Cover your minimap completely" },
      { name: "Pacifist Run", desc: "Win without eliminating anyone" },
      { name: "Blind Spots", desc: "Cover corners of your screen" },
      { name: "Wrong Hand", desc: "Use opposite hand for mouse/controller" },
      { name: "No Cover", desc: "Cannot hide behind objects" },
      { name: "Panic Mode", desc: "Must constantly move - no standing still" }
    ];

    // Select a random handicap
    const selectedIndex = Math.floor(Math.random() * handicaps.length);
    this.selectedHandicap = handicaps[selectedIndex].name;
    this.selectedHandicapDesc = handicaps[selectedIndex].desc;

    console.log("🎲 Selected handicap:", {
      name: this.selectedHandicap,
      desc: this.selectedHandicapDesc
    });

    // Quick visual display
    const container = document.createElement("div");
    container.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: rgba(139, 0, 0, 0.95);
      padding: 2rem;
      border-radius: 12px;
      z-index: 999999;
      text-align: center;
      color: white;
      font-family: 'Orbitron', monospace;
      box-shadow: 0 0 40px rgba(255, 0, 0, 0.8);
    `;

    container.innerHTML = `
      <h2 style="color: #ff4444; margin-bottom: 1rem;">💀 HANDICAP SELECTED 💀</h2>
      <h3 style="color: #ff6666; margin-bottom: 0.5rem;">${this.selectedHandicap}</h3>
      <p style="color: #ffaaaa; font-style: italic;">${this.selectedHandicapDesc}</p>
    `;

    document.body.appendChild(container);

    // Wait 2 seconds then remove
    await new Promise(resolve => {
      setTimeout(() => {
        if (container && container.parentNode) {
          container.parentNode.removeChild(container);
        }
        resolve();
      }, 2000);
    });

    console.log("✅ Handicap selection complete");
    return Promise.resolve();
  }