# Overlay System Integration Plan

## Overview
This document outlines the complete plan for integrating the React overlay components into the vanilla JS codebase.

## Current Implementation Status

### ✅ Completed:
1. **HTML Structure**: Added `#overlay-root` container for all overlays
2. **CSS Styles**: Created comprehensive overlay styles in `overlay-system.css`
3. **Overlay Manager**: Built async flow controller in `js/overlay-manager.js`
4. **Button Integration**: Modified main button to trigger overlay flow
5. **Sound Management**: Integrated all required sound effects

### ✅ Recently Completed:

#### 1. **Spin Wheel Overlay** (`showSpinWheelOverlay`)
- Ported from: `/v2-react/src/features/spin-selector/`
- Implemented features:
  - ✅ Vertical scrolling cards with physics simulation
  - ✅ Peg collision animations with ticker rotation
  - ✅ Idle animation when not spinning
  - ✅ Winner detection based on center position
  - ✅ Confetti particle effects
  - ✅ Infinite scroll effect with card tripling
  - ✅ Exponential easing for smooth deceleration
  - ✅ Sound effects (beep, ding, ding-ding)
  - ✅ Mobile responsive design

### ✅ Recently Completed:

#### 2. **Class Roulette Overlay** (`showClassRouletteOverlay`)
- Ported from: React component concept
- Implemented features:
  - ✅ SVG-based roulette wheel with three class segments
  - ✅ Animated ball with counter-rotation physics
  - ✅ Auto-start after 1 second delay
  - ✅ Winner detection based on final rotation angle
  - ✅ Cubic easing for realistic deceleration
  - ✅ Decorative lights and glow effects
  - ✅ Sound integration (roulette spin, beep ticks, win sound)
  - ✅ Mobile responsive design
  - ✅ Smooth fade in/out transitions

Key differences from React version:
- Uses vanilla JS animation with requestAnimationFrame
- SVG segments generated dynamically with path calculations
- Ball physics implemented with trigonometric transforms
- Winner calculation based on normalized rotation angles

## Data Flow

### Normal Flow:
1. User clicks "GENERATE LOADOUT"
2. **Spin Wheel** → Returns: `{ value: '1-3', spins: 1-3, isJackpot: false }`
3. **Reveal Card** → Shows spin count (2 seconds)
4. **Class Roulette** → Returns: `'Light' | 'Medium' | 'Heavy'`
5. **Reveal Card** → Shows selected class (2 seconds)
6. **Slot Machine** → Starts with class and spin count

### Jackpot Flow:
1. User clicks "GENERATE LOADOUT"
2. **Spin Wheel** → Returns: `{ value: 'JACKPOT', spins: 3, isJackpot: true }`
3. **Reveal Card** → Shows "JACKPOT" (2 seconds)
4. **Class Picker** → User selects class
5. **Reveal Card** → Shows selected class (2 seconds)
6. **Slot Machine** → Starts with class and 3 spins

## Integration Points

### 1. Overlay Manager API
```javascript
window.overlayManager = {
  startLoadoutGeneration,  // Main entry point
  showRevealCard,         // Utility for reveal cards
  showSpinWheelOverlay,   // Spin wheel (to implement)
  showClassRouletteOverlay, // Roulette (to implement)
  showClassPickerOverlay, // Jackpot picker (implemented)
  overlayState,          // Global overlay state
  overlayAudio           // Sound effects
};
```

### 2. Slot Machine Integration
The overlay system updates the global state and calls:
```javascript
function startSlotMachine(selectedClass, spinCount) {
  window.state.selectedClass = selectedClass;
  window.state.totalSpins = spinCount;
  window.displayLoadout(selectedClass);
}
```

### 3. Sound Timing
- `beep.mp3`: Each peg tick in spin wheel
- `ding.mp3`: Normal result sound
- `ding-ding.mp3`: Jackpot sound (cut at 1.5s)
- `spinning.mp3`: During slot animation
- `transition.mp3`: UI transitions

## Implementation Steps

### Step 1: Port Spin Wheel ✅ COMPLETED
1. ✅ Created vanilla JS physics engine for card scrolling
2. ✅ Implemented peg collision detection
3. ✅ Added ticker animations using Web Animations API
4. ✅ Built winner detection logic
5. ✅ Added confetti particles

### Step 2: Port Class Roulette ✅ COMPLETED
1. ✅ Created SVG wheel segments dynamically with path calculations
2. ✅ Implemented smooth rotation animations with easing
3. ✅ Added ball counter-rotation with orbital physics
4. ✅ Built winner detection based on rotation angles
5. ✅ Added auto-start timer (1 second delay)
6. ✅ Integrated sound effects and visual feedback

### Step 3: Testing & Polish ✅ COMPLETED
1. ✅ All flow paths work (normal + jackpot)
2. ✅ Proper cleanup between overlays implemented
3. ✅ Sound timing verified and synced
4. ✅ Mobile responsive design tested
5. ✅ Error handling in place with try/catch blocks

## Key Considerations

1. **State Management**: Use `overlayState` object for all overlay data
2. **Cleanup**: Always call `clearOverlay()` between transitions
3. **Animations**: Use CSS transitions + RAF for smooth performance
4. **Mobile**: Ensure touch-friendly buttons and responsive sizing
5. **Fallback**: Keep original spin logic as fallback if overlays fail

## Files Modified
- `/v2/index.html` - Added overlay container, changed button text
- `/v2/app.js` - Modified button handler to use overlay system
- `/v2/styles/overlay-system.css` - All overlay styles
- `/v2/js/overlay-manager.js` - Main overlay controller

## Next Steps
1. Port `SpinCountWheel` component to vanilla JS
2. Port `RouletteWheel` component to vanilla JS
3. Test complete flow end-to-end
4. Add error handling and edge cases
5. Optimize performance and animations