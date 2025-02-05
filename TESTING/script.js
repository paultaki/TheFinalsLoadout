document.getElementById('spinButton').addEventListener('click', function() {
    let spinners = document.querySelectorAll('.spinner');
    let items = {
        'Light': {
            'Weapons': ['93R', 'Dagger', 'LH1', 'M26 Matter', 'Recurve Bow', 'Sword', 'V9S', 'XP-54'],
            'Specializations': ['Cloaking Device', 'Evasive Dash', 'Grappling Hook'],
            'Gadgets': ['Breach Charge', 'Gateway', 'Glitch Grenade', 'Gravity Vortex', 'Sonar Grenade', 'Stun Gun', 'Thermal Bore', 'Thermal Vision', 'Tracking Dart', 'Vanishing Bomb']
        },
        'Medium': {
            'Weapons': ['AKM', 'Cerberus 12GA', 'Dual Blades', 'FAMAS', 'FCAR', 'Model 1887', 'Pike-556', 'R.357', 'Riot Shield', 'Dagger', 'Recurve Bow'],
            'Specializations': ['Dematerializer', 'Guardian Turret', 'Healing Beam'],
            'Gadgets': ['APS Turret', 'Data Reshaper', 'Defibrillator', 'Explosive Mine', 'Gas Mine', 'Glitch Trap', 'Jump Pad', 'Zipline', 'Pyro Grenade', 'Flashbang', 'Frag Grenade', 'Smoke Grenade', 'Gravity Vortex']
        },
        'Heavy': {
            'Weapons': ['50 Akimbo', 'Flamethrower', 'KS-23', 'Lewis Gun', 'M60', 'MGL32', 'Sledgehammer', 'SHAK-50', 'Spear'],
            'Specializations': ['Charge N Slam', 'Goo Gun', 'Mesh Shield', 'Winch Claw'],
            'Gadgets': ['Anti-Gravity Cube', 'Barricade', 'Dome Shield', 'Lockbolt Launcher', 'Pyro Mine', 'Motion Sensor', 'RPG-7', 'Goo Grenade', 'Gas Grenade', 'Frag Grenade', 'Smoke Grenade', 'C4']
        }
    };

    spinners.forEach((spinner, index) => {
        spinner.innerHTML = '';
        let category = Object.keys(items)[index];
        let columnItems = items[category][Object.keys(items[category])[index]];
        let shuffleList = '';
        
        for (let i = 0; i < 10; i++) {
            let item = columnItems[Math.floor(Math.random() * columnItems.length)];
            shuffleList += `<div><img src='images/${item.replace(/ /g, '_')}.webp' alt='${item}'></div>`;
        }
        
        spinner.innerHTML = shuffleList;
        spinner.style.animation = 'none';
        spinner.style.transition = 'transform 2s ease-out';
        setTimeout(() => {
            spinner.style.transform = `translateY(100%)`;
            setTimeout(() => {
                let finalSelection = columnItems[Math.floor(Math.random() * columnItems.length)];
                spinner.innerHTML = `<div class='highlight'><img src='images/${finalSelection.replace(/ /g, '_')}.webp' alt='${finalSelection}'></div>`;
                spinner.style.transform = 'translateY(0)';
            }, 2000 + index * 500);
        }, 100);
    });
});
