# TheFinalLoadout.com Casino Style Guide

## Overview

Style guide for the FUN ZONE: Loadout Generator and Rage Quit pages. These pages prioritize excitement, engagement, and dopamine-rich interactions.

## Design Principles

1. **Excitement First** - Visual flair drives engagement
2. **Game Authentic** - Match The Finals aesthetic
3. **Mobile Optimized** - Touch-friendly animations
4. **Addictive UX** - Encourage repeated spins

## Color System

### The Finals-Inspired Palette

```css
/* Primary game colors */
--finals-orange: #FF6B35;    /* The Finals signature */
--finals-cyan: #00D4FF;      /* Light class energy */
--finals-pink: #FF1493;      /* Medium class energy */
--finals-gold: #FFD700;      /* Victory/legendary */
--finals-purple: #9D4EDD;    /* Epic tier */

/* Class-specific glows */
--light-glow: #00D4FF;
--medium-glow: #FF1493;
--heavy-glow: #FF6B35;

/* Effects ENCOURAGED */
--neon-glow: 0 0 20px;
--deep-glow: 0 0 40px;
--slot-shadow: 0 4px 20px rgba(0,0,0,0.5);
--text-glow: 0 0 10px;

Typography
css/* Display Font - Big, bold, exciting */
font-family: 'Bebas Neue', Impact, sans-serif;

/* All headers uppercase with spacing */
text-transform: uppercase;
letter-spacing: 0.1em;

/* Sizes for impact */
--casino-xl: 3rem;     /* Main headers */
--casino-lg: 2rem;     /* Section headers */
--casino-md: 1.5rem;   /* Buttons */
Allowed Effects

Gradients: cyber-grid, neon sweeps, animated backgrounds
Shadows: Deep glows, neon outlines, layered shadows
Animations: Pulse, spin, flash, shake, bounce
Transitions: Overshoot, elastic, spring physics
Particles: Confetti, sparks, glitter on wins
Audio: Click sounds, win jingles, spin whirrs

Component Patterns
Spin Button
css.spin-button {
  background: linear-gradient(135deg, var(--finals-orange), var(--finals-pink));
  box-shadow: var(--neon-glow) var(--finals-orange);
  text-shadow: 0 0 20px rgba(255,255,255,0.8);
  animation: pulse 2s infinite;
  transform: scale(1);
  transition: all 200ms cubic-bezier(0.68, -0.55, 0.265, 1.55);
}

.spin-button:hover {
  transform: scale(1.1);
  box-shadow: var(--deep-glow) var(--finals-orange);
}
Slot Reels
css.slot-reel {
  background: linear-gradient(180deg, transparent, rgba(255,107,53,0.1), transparent);
  box-shadow: inset 0 0 20px rgba(0,212,255,0.2);
  animation: reel-glow 3s ease-in-out infinite;
}
Win States
css@keyframes jackpot-explosion {
  0% {
    box-shadow: 0 0 20px var(--finals-gold);
    transform: scale(1);
  }
  50% {
    box-shadow: 0 0 60px var(--finals-gold),
                0 0 120px var(--finals-cyan);
    transform: scale(1.2);
  }
  100% {
    box-shadow: 0 0 30px var(--finals-gold);
    transform: scale(1);
  }
}
Mobile Considerations

Touch targets minimum 48px
Reduce particle effects on low-end devices
Ensure 60fps animations via GPU acceleration
Test on iPhone SE for performance baseline

What TO Do

Make it feel like a AAA game UI
Use sound to enhance actions
Create anticipation with animations
Celebrate wins dramatically
Keep energy high throughout

What NOT to Do

Don't worry about "clean" here
Don't limit effects for "performance"
Don't use subtle - go bold
Don't follow web best practices
This is entertainment, not utility
```
