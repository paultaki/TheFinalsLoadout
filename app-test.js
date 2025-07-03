// ===========================
// Static Slot Machine History - Main App
// ===========================

// Test data for generating random loadouts
const testData = {
    light: {
        weapons: [
            { name: 'V9S', image: 'images/weapons/V9S.png' },
            { name: 'XP-54', image: 'images/weapons/XP-54.png' },
            { name: 'M11', image: 'images/weapons/M11.png' },
            { name: 'SH1900', image: 'images/weapons/SH1900.png' },
            { name: 'LH1', image: 'images/weapons/LH1.png' }
        ],
        specializations: [
            { name: 'Cloaking Device', image: 'images/specializations/Cloaking Device.png' },
            { name: 'Grappling Hook', image: 'images/specializations/Grappling Hook.png' },
            { name: 'Dash', image: 'images/specializations/Dash.png' }
        ],
        gadgets: [
            { name: 'Breach Charge', image: 'images/gadgets/Breach Charge.png' },
            { name: 'Flashbang', image: 'images/gadgets/Flashbang.png' },
            { name: 'Smoke Grenade', image: 'images/gadgets/Smoke Grenade.png' },
            { name: 'Stun Gun', image: 'images/gadgets/Stun Gun.png' },
            { name: 'Thermal Bore', image: 'images/gadgets/Thermal Bore.png' },
            { name: 'Glitch Grenade', image: 'images/gadgets/Glitch Grenade.png' },
            { name: 'Frag Grenade', image: 'images/gadgets/Frag Grenade.png' },
            { name: 'Pyro Grenade', image: 'images/gadgets/Pyro Grenade.png' }
        ]
    },
    medium: {
        weapons: [
            { name: 'AKM', image: 'images/weapons/AKM.png' },
            { name: 'R.357', image: 'images/weapons/R.357.png' },
            { name: 'CL-40', image: 'images/weapons/CL-40.png' },
            { name: 'FCAR', image: 'images/weapons/FCAR.png' },
            { name: 'Model 1887', image: 'images/weapons/Model 1887.png' }
        ],
        specializations: [
            { name: 'Healing Beam', image: 'images/specializations/Healing Beam.png' },
            { name: 'Recon Senses', image: 'images/specializations/Recon Senses.png' },
            { name: 'Turret', image: 'images/specializations/Guardian Turret.png' }
        ],
        gadgets: [
            { name: 'Defibrillator', image: 'images/gadgets/Defibrillator.png' },
            { name: 'Jump Pad', image: 'images/gadgets/Jump Pad.png' },
            { name: 'Gas Grenade', image: 'images/gadgets/Gas Grenade.png' },
            { name: 'Zipline', image: 'images/gadgets/Zipline.png' },
            { name: 'APS Turret', image: 'images/gadgets/APS Turret.png' },
            { name: 'Frag Grenade', image: 'images/gadgets/Frag Grenade.png' },
            { name: 'Flashbang', image: 'images/gadgets/Flashbang.png' },
            { name: 'Smoke Grenade', image: 'images/gadgets/Smoke Grenade.png' }
        ]
    },
    heavy: {
        weapons: [
            { name: 'Flamethrower', image: 'images/weapons/Flamethrower.png' },
            { name: 'M60', image: 'images/weapons/M60.png' },
            { name: 'SA1216', image: 'images/weapons/SA1216.png' },
            { name: 'Sledgehammer', image: 'images/weapons/Sledgehammer.png' },
            { name: 'Lewis Gun', image: 'images/weapons/Lewis Gun.png' }
        ],
        specializations: [
            { name: 'Mesh Shield', image: 'images/specializations/Mesh Shield.png' },
            { name: 'Charge \'N\' Slam', image: 'images/specializations/Charge N Slam.png' },
            { name: 'Goo Gun', image: 'images/specializations/Goo Gun.png' }
        ],
        gadgets: [
            { name: 'Barricade', image: 'images/gadgets/Barricade.png' },
            { name: 'C4', image: 'images/gadgets/C4.png' },
            { name: 'Dome Shield', image: 'images/gadgets/Dome Shield.png' },
            { name: 'RPG-7', image: 'images/gadgets/RPG.png' },
            { name: 'Pyro Grenade', image: 'images/gadgets/Pyro Grenade.png' },
            { name: 'Frag Grenade', image: 'images/gadgets/Frag Grenade.png' },
            { name: 'Smoke Grenade', image: 'images/gadgets/Smoke Grenade.png' },
            { name: 'Flashbang', image: 'images/gadgets/Flashbang.png' }
        ]
    }
};

// History manager class
class SlotHistoryManager {
    constructor() {
        this.history = [];
        this.maxHistory = 5; // Changed from 10 to 5
        this.spinCounter = 0;
        this.soundEnabled = true;
        this.showAll = false; // For expand/collapse functionality
        this.loadFromStorage();
    }

    // Load history from localStorage
    loadFromStorage() {
        try {
            const savedHistory = localStorage.getItem('slotMachineHistory');
            const savedCounter = localStorage.getItem('slotMachineSpinCounter');

            if (savedHistory) {
                this.history = JSON.parse(savedHistory);
            }
            if (savedCounter) {
                this.spinCounter = parseInt(savedCounter);
            }
        } catch (error) {
            console.error('Failed to load history from storage:', error);
        }
    }

    // Save history to localStorage
    saveToStorage() {
        try {
            localStorage.setItem('slotMachineHistory', JSON.stringify(this.history));
            localStorage.setItem('slotMachineSpinCounter', this.spinCounter.toString());
        } catch (error) {
            console.error('Failed to save history to storage:', error);
        }
    }

    // Generate random test loadout - now with 3 gadgets
    generateTestLoadout() {
        const classes = ['light', 'medium', 'heavy'];
        const selectedClass = classes[Math.floor(Math.random() * classes.length)];
        const classData = testData[selectedClass];

        // Randomly select items
        const weapon = classData.weapons[Math.floor(Math.random() * classData.weapons.length)];
        const specialization = classData.specializations[Math.floor(Math.random() * classData.specializations.length)];

        // Select 3 different gadgets
        const gadgetIndices = [];
        while (gadgetIndices.length < 3) {
            const index = Math.floor(Math.random() * classData.gadgets.length);
            if (!gadgetIndices.includes(index)) {
                gadgetIndices.push(index);
            }
        }

        const gadgets = gadgetIndices.map(i => classData.gadgets[i]);

        return {
            class: selectedClass,
            weapon: weapon,
            specialization: specialization,
            gadgets: gadgets,
            spinNumber: ++this.spinCounter,
            timestamp: new Date()
        };
    }

    // Add loadout to history
    addToHistory(loadout) {
        this.history.unshift(loadout);

        // No limit on storage, but we'll only display 5 by default
        this.saveToStorage();
        this.render();
        this.playSound('addSound');
        this.showToast('Loadout added to history!');
    }

    // Clear history
    clearHistory() {
        this.history = [];
        this.spinCounter = 0;
        this.saveToStorage();
        this.render();
        this.showToast('History cleared!');
    }

    // Toggle show all history
    toggleShowAll() {
        this.showAll = !this.showAll;
        this.render();
    }

    // Render history
    render() {
        const historyList = document.getElementById('history-list');
        const historyCount = document.getElementById('history-count');

        historyCount.textContent = `(${this.history.length})`;

        if (this.history.length === 0) {
            historyList.innerHTML = `
                <div class="empty-state">
                    <p>No loadouts yet. Click "Add Test History Item" to begin!</p>
                </div>
            `;
            return;
        }

        // Show only first 5 items unless showAll is true
        const itemsToShow = this.showAll ? this.history : this.history.slice(0, 5);

        historyList.innerHTML = itemsToShow.map((loadout, index) =>
            this.createHistoryItemHTML(loadout, index)
        ).join('');

        // Add expand/collapse button if more than 5 items
        if (this.history.length > 5) {
            const expandButton = document.createElement('button');
            expandButton.className = 'expand-history-btn';
            expandButton.textContent = this.showAll ? 'Show Less' : `Show All (${this.history.length} total)`;
            expandButton.addEventListener('click', () => this.toggleShowAll());
            historyList.appendChild(expandButton);
        }

        // Add event listeners
        this.attachEventListeners();
    }

    // Create HTML for history item - updated structure
    createHistoryItemHTML(loadout, index) {
        const timeAgo = this.getTimeAgo(loadout.timestamp);

        return `
            <div class="static-slot-item" data-index="${index}">
                <div class="item-header">
                    <div class="item-metadata">
                        <span class="class-badge ${loadout.class}">${loadout.class.toUpperCase()} CLASS</span>
                        <span class="spin-number">#${loadout.spinNumber}</span>
                        <span class="timestamp">${timeAgo}</span>
                    </div>
                    <div class="action-buttons">
                        <button class="action-btn copy-text" data-index="${index}">Copy Text</button>
                        <button class="action-btn copy-image" data-index="${index}">Copy Image</button>
                    </div>
                </div>

                <div class="slot-display" id="slot-display-${index}">
                    <!-- Weapon -->
                    <div class="slot-box ${loadout.class}">
                        <div class="slot-label">WEAPON</div>
                        <img src="${loadout.weapon.image}" alt="${loadout.weapon.name}" class="slot-image" onerror="this.src='images/placeholder.png'">
                        <div class="slot-name">${loadout.weapon.name}</div>
                    </div>

                    <!-- Specialization -->
                    <div class="slot-box ${loadout.class}">
                        <div class="slot-label">SPECIAL</div>
                        <img src="${loadout.specialization.image}" alt="${loadout.specialization.name}" class="slot-image" onerror="this.src='images/placeholder.png'">
                        <div class="slot-name">${loadout.specialization.name}</div>
                    </div>

                    <!-- Gadgets -->
                    ${loadout.gadgets.map((gadget, i) => `
                        <div class="slot-box ${loadout.class}">
                            <div class="slot-label">GADGET ${i + 1}</div>
                            <img src="${gadget.image}" alt="${gadget.name}" class="slot-image" onerror="this.src='images/placeholder.png'">
                            <div class="slot-name">${gadget.name}</div>
                        </div>
                    `).join('')}
                </div>

                <!-- Particle effects -->
                <div class="particles"></div>
            </div>
        `;
    }

    // Get relative time
    getTimeAgo(timestamp) {
        if (typeof timestamp === 'string') {
            timestamp = new Date(timestamp);
        }

        const seconds = Math.floor((new Date() - timestamp) / 1000);

        if (seconds < 60) return 'Just now';
        if (seconds < 3600) return `${Math.floor(seconds / 60)} mins ago`;
        if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
        return `${Math.floor(seconds / 86400)} days ago`;
    }

    // Copy loadout as text
    copyAsText(index) {
        const loadout = this.history[index];
        const text = `[${loadout.class.toUpperCase()}] Weapon: ${loadout.weapon.name} | Special: ${loadout.specialization.name} | Gadgets: ${loadout.gadgets.map(g => g.name).join(', ')}`;

        navigator.clipboard.writeText(text).then(() => {
            this.playSound('copySound');
            this.showToast('Loadout copied to clipboard!');
        }).catch(err => {
            this.showToast('Failed to copy text');
            console.error('Copy failed:', err);
        });
    }

    // Copy loadout as image with watermark
    async copyAsImage(index) {
        const slotDisplay = document.getElementById(`slot-display-${index}`);
        const button = document.querySelector(`.copy-image[data-index="${index}"]`);
        const loadout = this.history[index];

        // Add loading state
        button.classList.add('loading');
        button.textContent = 'Generating...';

        try {
            // Create a wrapper with watermark
            const wrapper = document.createElement('div');
            wrapper.style.cssText = `
                position: relative;
                background: linear-gradient(135deg, #1a1a1a, #2a1f2d);
                padding: 20px;
                border-radius: 15px;
            `;

            // Clone the display
            const displayClone = slotDisplay.cloneNode(true);
            wrapper.appendChild(displayClone);

            // Add class badge at the top
            const classBadge = document.createElement('div');
            classBadge.style.cssText = `
                text-align: center;
                margin-bottom: 15px;
                font-size: 24px;
                font-weight: 800;
                text-transform: uppercase;
                color: ${loadout.class === 'light' ? '#4fc3f7' : loadout.class === 'medium' ? '#ab47bc' : '#ff1744'};
                font-family: 'Bebas Neue', sans-serif;
                letter-spacing: 0.1em;
            `;
            classBadge.textContent = `${loadout.class} CLASS`;
            wrapper.insertBefore(classBadge, displayClone);

            // Add watermark
            const watermark = document.createElement('div');
            watermark.style.cssText = `
                position: absolute;
                bottom: 10px;
                right: 15px;
                font-size: 14px;
                color: rgba(255, 255, 255, 0.6);
                font-weight: 600;
                letter-spacing: 0.05em;
            `;
            watermark.textContent = 'thefinalsloadout.com';
            wrapper.appendChild(watermark);

            // Temporarily add to body (hidden)
            wrapper.style.position = 'fixed';
            wrapper.style.left = '-9999px';
            document.body.appendChild(wrapper);

            // Create canvas from wrapper
            const canvas = await html2canvas(wrapper, {
                backgroundColor: '#1a1a1a',
                scale: 2,
                logging: false,
                useCORS: true,
                allowTaint: true
            });

            // Remove temporary wrapper
            document.body.removeChild(wrapper);

            // Convert canvas to blob
            canvas.toBlob(async (blob) => {
                try {
                    // Try modern clipboard API first
                    if (navigator.clipboard && window.ClipboardItem) {
                        const item = new ClipboardItem({ 'image/png': blob });
                        await navigator.clipboard.write([item]);
                        this.playSound('exportSound');
                        this.showToast('Image copied to clipboard!');
                    } else {
                        // Fallback: download the image
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = `finals-loadout-${this.history[index].spinNumber}.png`;
                        a.click();
                        URL.revokeObjectURL(url);
                        this.showToast('Image downloaded!');
                    }
                } catch (err) {
                    this.showToast('Failed to copy image');
                    console.error('Image copy failed:', err);
                }
            }, 'image/png');
        } catch (err) {
            this.showToast('Failed to generate image');
            console.error('Image generation failed:', err);
        } finally {
            // Reset button state
            button.classList.remove('loading');
            button.innerHTML = '<span>Copy Image</span>';
        }
    }

    // Attach event listeners
    attachEventListeners() {
        // Copy text buttons
        document.querySelectorAll('.copy-text').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const index = parseInt(e.currentTarget.dataset.index);
                this.copyAsText(index);
            });
        });

        // Copy image buttons
        document.querySelectorAll('.copy-image').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const index = parseInt(e.currentTarget.dataset.index);
                this.copyAsImage(index);
            });
        });

        // Add hover particle effects
        document.querySelectorAll('.static-slot-item').forEach(item => {
            item.addEventListener('mouseenter', () => this.createParticles(item));
        });
    }

    // Create particle effects
    createParticles(element) {
        const particleContainer = element.querySelector('.particles');
        particleContainer.innerHTML = '';

        for (let i = 0; i < 5; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle';
            particle.style.left = `${Math.random() * 100}%`;
            particle.style.animationDelay = `${Math.random() * 3}s`;
            particleContainer.appendChild(particle);
        }
    }

    // Play sound effect
    playSound(soundId) {
        if (!this.soundEnabled) return;

        const sound = document.getElementById(soundId);
        if (sound) {
            sound.currentTime = 0;
            sound.volume = 0.3;
            sound.play().catch(e => console.log('Sound play failed:', e));
        }
    }

    // Show toast notification
    showToast(message) {
        const toast = document.getElementById('toast');
        toast.textContent = message;
        toast.classList.add('show');

        setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    }
}

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    const historyManager = new SlotHistoryManager();

    // Add test item button
    document.getElementById('add-test-item').addEventListener('click', () => {
        const testLoadout = historyManager.generateTestLoadout();
        historyManager.addToHistory(testLoadout);
    });

    // Clear history button
    document.getElementById('clear-history').addEventListener('click', () => {
        if (confirm('Are you sure you want to clear all history?')) {
            historyManager.clearHistory();
        }
    });

    // Initial render
    historyManager.render();

    // Expose to window for testing
    window.historyManager = historyManager;
});
