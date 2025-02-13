var MyClass = React.createClass({
  render: function() {
    return (
      <div>
        {/* Mirrored from thefinalsloadout.com/ by HTTrack Website Copier/3.x [XR&CO'2014], Wed, 05 Feb 2025 20:25:03 GMT */}
        {/* Added by HTTrack */}<meta httpEquiv="content-type" content="text/html;charset=utf-8" />{/* /Added by HTTrack */}
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title> The Finals Best Random Loadout Generator | Fun &amp; Unique Loadouts</title>
        <meta name="description" content="Get the best random loadouts for The Finals game to have fun and be challenged. Find new weapon builds for Light, Medium, and Heavy playstyles." />
        <link rel="icon" type="image/x-icon" href="images/favicon.ico" />
        <link rel="preload" href="https://fonts.googleapis.com/css2?family=Oswald:wght@200..700&display=swap" as="style" onload="this.onload=null;this.rel='stylesheet'" />
        <noscript>
          &lt;link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Oswald:wght@200..700&amp;amp;display=swap"&gt;
        </noscript>
        {/* Stylesheet */}
        <link rel="stylesheet" href="style.css" />
        <style dangerouslySetInnerHTML={{__html: "\n        html {\n            min-height: 100%;\n            background: linear-gradient(-45deg, \n                #1d1a21,    /* Original dark */\n                #2a1f2d,    /* Slightly purple */\n                #1f2a2d,    /* Slightly blue-ish */\n                #201c24     /* Back to dark */\n            );\n            background-size: 400% 400%;\n            animation: gradientShift 20s ease infinite;\n        }\n\n        @keyframes gradientShift {\n            0% {\n                background-position: 0% 50%;\n            }\n            50% {\n                background-position: 100% 50%;\n            }\n            100% {\n                background-position: 0% 50%;\n            }\n        }\n\n        body {\n            font-family: 'Oswald', sans-serif;\n            color: #fff;\n            text-align: center;\n            margin: 0;\n            padding: 0;\n            min-height: 100vh;\n        }\n    " }} />
        <header className="headerSection">
          <div className="container">
            <img src="images/the-finals.webp" alt="Random Loadout Generator for The Finals Game" className="finals-logo" />
            <h1 className="mainTitle">The Finals Loadout Generator - Spin for Random Builds!</h1>
          </div>
        </header>
        <main className="mainContent">
          <div className="container">
            <div className="buttons">
              <div className="step-container">
                {/* Step 1: Class Selection */}
                <div id="classSelection" className="step">
                  <div className="step-highlight" />
                  <h2>Choose Your Class</h2>
                  <div className="btnRow">
                    <button className="class-button outlineCircleBtn" data-class="Light">LIGHT</button>
                    <button className="class-button outlineCircleBtn" data-class="Medium">MEDIUM</button>
                    <button className="class-button outlineCircleBtn" data-class="Heavy">HEAVY</button>
                    <button className="class-button outlineCircleBtn random" data-class="random">?</button>
                  </div>
                </div>
                {/* Step 2: Spin Selection */}
                <div id="spinSelection" className="step disabled">
                  <div className="step-highlight" />
                  <h2>Number of Spins</h2>
                  <div className="btnRow">
                    <button className="spin-button outlineCircleBtn" data-spins={1}>1</button>
                    <button className="spin-button outlineCircleBtn" data-spins={2}>2</button>
                    <button className="spin-button outlineCircleBtn" data-spins={3}>3</button>
                    <button className="spin-button outlineCircleBtn" data-spins={4}>4</button>
                    <button className="spin-button outlineCircleBtn" data-spins={5}>5</button>
                  </div>
                </div>
              </div>
              <div id="output">
                <div className="slot-machine-wrapper">
                  <div className="items-container">
                    <div className="placeholder-container">
                      <img src="images/placeholder.webp" alt="?" loading="lazy" />
                      <p>Contestant</p>
                    </div>
                    <div className="placeholder-container">
                      <img src="images/placeholder.webp" alt="?" loading="lazy" />
                      <p>Weapon</p>
                    </div>
                    <div className="placeholder-container">
                      <img src="images/placeholder.webp" alt="?" loading="lazy" />
                      <p>Specialization</p>
                    </div>
                    <div className="placeholder-container">
                      <img src="images/placeholder.webp" alt="?" loading="lazy" />
                      <p>Gadget 1</p>
                    </div>
                    <div className="placeholder-container">
                      <img src="images/placeholder.webp" alt="?" loading="lazy" />
                      <p>Gadget 2</p>
                    </div>
                    <div className="placeholder-container">
                      <img src="images/placeholder.webp" alt="?" loading="lazy" />
                      <p>Gadget 3</p>
                    </div>
                  </div>
                </div>
              </div>
              {/* Single set of buttons */}
              <div className="btnRow">
                <button id="copyLoadoutButton" className="copy-button">Copy Loadout</button>
              </div>
              <div className="btnRow">
                <a href="punishment-loadout/index.html" className="outlineBtnStyle">
                  <img src="images/punishment.webp" className="skull-icon" alt="💀" />
                  Punishment Loadout
                  <img src="images/punishment.webp" className="skull-icon" alt="💀" />
                </a>
              </div>
            </div>
          </div>
        </main>
        <section id="recent-buffs" className="recentBuffsSection">
          <div className="container">
            <h2>Recent Buffs, Nerfs and Fixes</h2>
            <div className="buffs-container">
              <div className="buff-item">
                <p className="patch-date">Patch Date: February 5, 2025</p>
                <h3>Weapons</h3>
                <h4>Buffs</h4>
                <div className="buff-section">
                  <p className="buff"><strong>Cerberus (Buff)</strong></p>
                  <ul>
                    <li>Increased damage (9 → 10 per pellet)</li>
                    <li>Tighter pellet spread for better accuracy</li>
                    <li>Reduced reload times</li>
                  </ul>
                </div>
                <div className="buff-section">
                  <p className="buff"><strong>Pike-556 (Buff)</strong></p>
                  <ul>
                    <li>Increased damage (47 → 50)</li>
                  </ul>
                </div>
                <div className="buff-section">
                  <p className="buff"><strong>SR-84 (Buff)</strong></p>
                  <ul>
                    <li>Faster bolt action animation (1.25s → 1.05s), increasing fire rate</li>
                    <li>Increased damage (115 → 118)</li>
                  </ul>
                </div>
                <div className="buff-section">
                  <p className="buff"><strong>Sword (Buff/Revert)</strong></p>
                  <ul>
                    <li>Increased secondary attack hit sweep length by 55cm (restored previous range)</li>
                  </ul>
                </div>
                <h4>Nerfs</h4>
                <div className="nerf-section">
                  <p className="nerf"><strong>FAMAS (Nerf)</strong></p>
                  <ul>
                    <li>Reduced fire rate (230 → 220 RPM)</li>
                    <li>Reduced damage per bullet (24 → 23)</li>
                  </ul>
                </div>
                <div className="nerf-section">
                  <p className="nerf"><strong>LH1 (Nerf)</strong></p>
                  <ul>
                    <li>Reduced damage (48 → 46)</li>
                    <li>Reduced fire rate (280 → 270 RPM)</li>
                  </ul>
                </div>
                <div className="nerf-section">
                  <p className="nerf"><strong>Model 1887 (Nerf)</strong></p>
                  <ul>
                    <li>Reduced damage (13 → 11 per pellet)</li>
                    <li>Min damage falloff multiplier increased (0.6 → 0.7), keeping same max-range damage as in 5.7</li>
                  </ul>
                </div>
                <h4>Quality of Life Adjustments</h4>
                <div className="qol-section">
                  <p className="qol"><strong>CL-40 (QoL Buff)</strong></p>
                  <ul>
                    <li>Reduced projectile radius (10cm → 5cm) to prevent accidental surface hits</li>
                    <li>Lowered self-damage multiplier (1.6 → 1.25)</li>
                  </ul>
                </div>
                <div className="qol-section">
                  <p className="qol"><strong>Dagger (QoL Adjustment)</strong></p>
                  <ul>
                    <li>Added FoV change during secondary attack charge-up for better clarity</li>
                  </ul>
                </div>
                <h3>Gadgets</h3>
                <h4>Buffs</h4>
                <div className="buff-section">
                  <p className="buff"><strong>Breach Charge (Buff)</strong></p>
                  <ul>
                    <li>Reduced throw delay (0.9s → 0.6s)</li>
                  </ul>
                </div>
                <h4>Nerfs</h4>
                <div className="nerf-section">
                  <p className="nerf"><strong>Winch Claw (Nerf)</strong></p>
                  <ul>
                    <li>Reduced range (12m → 10m)</li>
                  </ul>
                </div>
                <h3>Specializations</h3>
                <h4>Nerfs</h4>
                <div className="nerf-section">
                  <p className="nerf"><strong>Charge N’ Slam (Nerf)</strong></p>
                  <ul>
                    <li>Reduced initial impact damage (130 → 100)</li>
                    <li>Reduced subsequent hit damage (50 → 40)</li>
                    <li>Reduced minimum ground slam damage (80 → 50)</li>
                  </ul>
                </div>
                <div className="nerf-section">
                  <p className="nerf"><strong>Dematerializer (Nerf)</strong></p>
                  <ul>
                    <li>Reduced duration of dematerialized objects (30s → 15s)</li>
                    <li>Now removes props attached to wall segments for cleaner passageways</li>
                  </ul>
                </div>
                <a href="https://www.reachthefinals.com/patchnotes/580" target="_blank" className="read-more">Read Full Patch Notes</a>
              </div>
            </div>
          </div>
        </section>
        {/* Replace old FAQ section with this div */}
        <div id="faq-root" />
        <footer className="footerSection">
          <div className="container">
            <div className="footerRow" style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
              <p className="text-start">
                © 2025 TheFinalsLoadout.com | 
                <a href="legal/legal.html">Legal Disclaimer</a> | 
                1-800-FAT-MOMS Production
              </p>
              <a href="https://www.buymeacoffee.com/dismiss3d">
                <img src="https://img.buymeacoffee.com/button-api/?text=Support Me&emoji=&slug=dismiss3d&button_colour=ffb700&font_colour=000000&font_family=Poppins&outline_colour=000000&coffee_colour=FFDD00" style={{width: '95%', maxWidth: '150px', height: 'auto'}} />
              </a>
            </div>
          </div>
        </footer>
        {/* Load React and ReactDOM first */}
        {/* Then load app.js and FAQSection.js */}
        {/* Mirrored from thefinalsloadout.com/ by HTTrack Website Copier/3.x [XR&CO'2014], Wed, 05 Feb 2025 20:25:07 GMT */}
      </div>
    );
  }
});