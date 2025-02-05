import React from 'react';
import ReactDOM from 'react-dom';
import SlotMachine from './SlotMachine.jsx';

// Initialize React components
document.addEventListener('DOMContentLoaded', () => {
    // Mount Slot Machine
    const slotMachineRoot = document.getElementById('slot-machine-root');
    if (slotMachineRoot) {
        ReactDOM.render(<SlotMachine />, slotMachineRoot);
    }

    // Mount Recent Buffs (if needed)
    const recentBuffsRoot = document.getElementById('recent-buffs-root');
    if (recentBuffsRoot) {
        // Initialize recent buffs component
    }

    // Mount FAQ (if needed)
    const faqRoot = document.getElementById('faq-root');
    if (faqRoot) {
        // Initialize FAQ component
    }
});

// Handle copy functionality
window.copyLoadout = (loadout) => {
    const copyText = `Class: ${loadout.class}\n` +
        `Weapon: ${loadout.weapon}\n` +
        `Specialization: ${loadout.specialization}\n` +
        `Gadget 1: ${loadout.gadgets[0]}\n` +
        `Gadget 2: ${loadout.gadgets[1]}\n` +
        `Gadget 3: ${loadout.gadgets[2]}`;

    navigator.clipboard.writeText(copyText)
        .then(() => alert('Loadout copied to clipboard!'))
        .catch(err => console.error('Could not copy text: ', err));
};