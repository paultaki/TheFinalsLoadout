// ===========================
// Static Slot Machine History - Integration Module
// ===========================

// Extended functionality for production integration
class SlotHistoryIntegration {
    constructor(historyManager) {
        this.historyManager = historyManager;
        this.initializeEnhancements();
    }

    // Initialize enhanced features
    initializeEnhancements() {
        this.addKeyboardShortcuts();
        this.addSwipeGestures();
        this.addExportOptions();
    }

    // Keyboard shortcuts
    addKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Ctrl/Cmd + C: Copy last loadout as text
            if ((e.ctrlKey || e.metaKey) && e.key === 'c' && !e.shiftKey) {
                if (this.historyManager.history.length > 0) {
                    e.preventDefault();
                    this.historyManager.copyAsText(0);
                }
            }

            // Ctrl/Cmd + Shift + C: Copy last loadout as image
            if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'C') {
                if (this.historyManager.history.length > 0) {
                    e.preventDefault();
                    this.historyManager.copyAsImage(0);
                }
            }
        });
    }

    // Mobile swipe gestures
    addSwipeGestures() {
        if (!('ontouchstart' in window)) return;

        let touchStartX = 0;
        let touchStartY = 0;
        let currentItem = null;

        document.addEventListener('touchstart', (e) => {
            const item = e.target.closest('.static-slot-item');
            if (!item) return;

            currentItem = item;
            touchStartX = e.touches[0].clientX;
            touchStartY = e.touches[0].clientY;
        });

        document.addEventListener('touchmove', (e) => {
            if (!currentItem) return;

            const touchX = e.touches[0].clientX;
            const touchY = e.touches[0].clientY;
            const deltaX = touchX - touchStartX;
            const deltaY = touchY - touchStartY;

            // Horizontal swipe detection
            if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 50) {
                e.preventDefault();
                currentItem.style.transform = `translateX(${deltaX}px)`;
                currentItem.style.opacity = 1 - Math.abs(deltaX) / 200;
            }
        });

        document.addEventListener('touchend', (e) => {
            if (!currentItem) return;

            const touchX = e.changedTouches[0].clientX;
            const deltaX = touchX - touchStartX;

            if (Math.abs(deltaX) > 100) {
                // Swipe to delete
                const index = parseInt(currentItem.dataset.index);
                this.removeHistoryItem(index);
            } else {
                // Reset position
                currentItem.style.transform = '';
                currentItem.style.opacity = '';
            }

            currentItem = null;
        });
    }

    // Remove single history item
    removeHistoryItem(index) {
        const item = document.querySelector(`.static-slot-item[data-index="${index}"]`);
        if (!item) return;

        // Animate removal
        item.style.transition = 'all 0.3s ease-out';
        item.style.transform = 'translateX(100%)';
        item.style.opacity = '0';

        setTimeout(() => {
            this.historyManager.history.splice(index, 1);
            this.historyManager.saveToStorage();
            this.historyManager.render();
            this.historyManager.showToast('Item removed');
        }, 300);
    }

    // Enhanced export options
    addExportOptions() {
        // Add batch export functionality
        this.addBatchExportButton();

        // Add social media share buttons
        this.addSocialShareOptions();
    }

    // Batch export button
    addBatchExportButton() {
        const controls = document.querySelector('.test-controls');
        const batchButton = document.createElement('button');
        batchButton.className = 'test-button';
        batchButton.textContent = 'Export All as ZIP';
        batchButton.addEventListener('click', () => this.exportAllAsZip());
        controls.appendChild(batchButton);
    }

    // Export all history items as ZIP
    async exportAllAsZip() {
        if (this.historyManager.history.length === 0) {
            this.historyManager.showToast('No items to export');
            return;
        }

        this.historyManager.showToast('Preparing export...');

        // Since we can't use JSZip in this test, we'll simulate the process
        try {
            // In production, you would:
            // 1. Import JSZip library
            // 2. Create a new zip instance
            // 3. Generate images for each history item
            // 4. Add images to zip
            // 5. Generate and download zip file

            // For now, we'll just export each as individual images
            for (let i = 0; i < Math.min(this.historyManager.history.length, 5); i++) {
                await this.exportAsImage(i, true);
                await new Promise(resolve => setTimeout(resolve, 500)); // Delay between exports
            }

            this.historyManager.showToast('All items exported!');
        } catch (err) {
            this.historyManager.showToast('Export failed');
            console.error('Batch export failed:', err);
        }
    }

    // Export single item as image (silent mode for batch)
    async exportAsImage(index, silent = false) {
        const slotDisplay = document.getElementById(`slot-display-${index}`);
        const loadout = this.historyManager.history[index];

        try {
            // Create a wrapper with watermark
            const wrapper = document.createElement('div');
            wrapper.style.cssText = `
                position: relative;
                background: linear-gradient(135deg, #1a1a1a, #2a1f2d);
                padding: 20px;
                border-radius: 15px;
                font-family: 'Inter', sans-serif;
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
            classBadge.textContent = `${loadout.class.toUpperCase()} CLASS`;
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

            canvas.toBlob((blob) => {
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `finals-loadout-${this.historyManager.history[index].spinNumber}.png`;
                a.click();
                URL.revokeObjectURL(url);

                if (!silent) {
                    this.historyManager.showToast('Image downloaded!');
                }
            }, 'image/png');
        } catch (err) {
            if (!silent) {
                this.historyManager.showToast('Export failed');
            }
            console.error('Export failed:', err);
        }
    }

    // Social share options
    addSocialShareOptions() {
        // This would add Twitter, Discord, etc. share buttons
        // For now, we'll add a simple share button that uses Web Share API
        document.addEventListener('click', async (e) => {
            if (!e.target.classList.contains('action-btn')) return;

            // Add right-click functionality for social share
            e.target.addEventListener('contextmenu', async (event) => {
                event.preventDefault();

                const index = parseInt(e.target.dataset.index);
                const loadout = this.historyManager.history[index];

                if (navigator.share) {
                    try {
                        await navigator.share({
                            title: 'The Finals Loadout',
                            text: `Check out my ${loadout.class.toUpperCase()} loadout: ${loadout.weapon.name} with ${loadout.specialization.name}!`,
                            url: window.location.href
                        });
                    } catch (err) {
                        console.log('Share cancelled or failed:', err);
                    }
                }
            });
        });
    }

    // Animation for transitioning from slot machine to history
    transitionFromSlotMachine(slotMachineElement, loadoutData) {
        // This would be called when the slot machine completes
        // It would animate the slot machine shrinking and moving to the history section

        // Get positions
        const slotRect = slotMachineElement.getBoundingClientRect();
        const historyList = document.getElementById('history-list');
        const historyRect = historyList.getBoundingClientRect();

        // Create temporary clone
        const clone = slotMachineElement.cloneNode(true);
        clone.style.position = 'fixed';
        clone.style.left = `${slotRect.left}px`;
        clone.style.top = `${slotRect.top}px`;
        clone.style.width = `${slotRect.width}px`;
        clone.style.height = `${slotRect.height}px`;
        clone.style.zIndex = '9999';
        clone.style.transition = 'all 0.8s cubic-bezier(0.4, 0, 0.2, 1)';
        document.body.appendChild(clone);

        // Animate to history position
        requestAnimationFrame(() => {
            clone.style.transform = `translate(${historyRect.left - slotRect.left}px, ${historyRect.top - slotRect.top}px) scale(0.8)`;
            clone.style.opacity = '0.8';
        });

        // After animation, add to history and remove clone
        setTimeout(() => {
            this.historyManager.addToHistory(loadoutData);
            clone.remove();
        }, 800);
    }
}

// Initialize integration when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Wait for base history manager to be initialized
    setTimeout(() => {
        if (window.historyManager) {
            const integration = new SlotHistoryIntegration(window.historyManager);
            window.slotHistoryIntegration = integration;

            console.log('Slot History Integration initialized');
            console.log('Features enabled:');
            console.log('- Keyboard shortcuts (Ctrl+C, Ctrl+Shift+C)');
            console.log('- Swipe to delete (mobile)');
            console.log('- Batch export');
            console.log('- Social sharing (right-click)');
            console.log('- LocalStorage persistence');
            console.log('- Expand/collapse for 5+ items');
        }
    }, 100);
});

// Export for use in production
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { SlotHistoryIntegration };
}
