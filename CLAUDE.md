# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

The Finals Loadout Generator - A web application for generating random loadouts for The Finals game. The app features slot machine animations, class selection, and various interactive elements.

**Current Working Directory**: This project has been moved to Z:\DevProjects\TheFinalsLoadout

## Development Commands

### Build & Development
```bash
# Development server (Vite) on port 5173
npm run dev

# Production build to dist/
npm run build

# Compile weapon data from source JSON files
npm run build:data
```

### Testing & Quality
```bash
# TypeScript type checking (no emit)
npm run typecheck

# Run Jest unit tests with coverage
npm run test

# Visual regression testing with Percy & Playwright
npm run test:visual

# Full CI pipeline (typecheck + tests + visual tests)
npm run ci
```

### Single Test Execution
```bash
# Run specific test file
npx jest path/to/test.js

# Run tests matching pattern
npx jest --testNamePattern="pattern"
```

## Architecture Overview

### Frontend Structure
- **Main Entry**: `index.html` - Progressive enhancement with inline critical CSS
- **JavaScript Modules**: ES6 modules with dependency management
  - `js/app.js` - Main application controller
  - `js/slot-machine.js` - Slot machine animation logic
  - `js/class-animation.js` - Class selection animations
  - `js/filter-system.js` - Weapon/gadget filtering
  - `js/history-system.js` - Loadout history management
  - `js/roulette-animations.js` - Roulette wheel physics

### API Endpoints (Vercel Serverless)
Located in `/api/`:
- `loadout-analysis.js` - Claude AI-powered loadout analysis
- `spin.js` - Spin counter tracking
- `roast.js` - AI roast generation
- `counter.js` - General counter operations

### Data Management
- **Weapon/Gadget Data**: JSON files in `/data/` directory
  - `compiled-weapons.json` - Main weapon database
  - `AI_weapons_s7.json` - Season 7 weapon specs
  - `AI_gadgets_specs_s7.json` - Gadget specifications
- **Loadout Configuration**: `loadouts.json` defines class-specific items

### Performance Optimizations
- **Mobile-specific**: Device profiling and adaptive animations
- **Critical CSS**: Inline styles to prevent render blocking
- **Image optimization**: WebP format, lazy loading
- **Sound preloading**: Progressive audio loading

### Deployment
- **Platform**: Vercel with static file serving
- **Routing**: URL rewrites in `vercel.json` for clean URLs
- **Caching**: Aggressive caching for static assets (images, sounds, JS)
- **API**: Serverless functions with KV storage for persistence

### Key Dependencies
- **Frontend**: Vite build tool, vanilla JavaScript
- **Testing**: Jest, Playwright, Percy for visual regression
- **API**: Anthropic SDK for AI features, Vercel KV for storage
- **Types**: TypeScript for type checking (not transpiled)

## Important Patterns

### Animation System
The app uses a multi-layered animation approach:
1. CSS-only animations for performance
2. JavaScript-controlled timing for complex sequences
3. Mobile-specific reduced motion variants

### State Management
- No framework - vanilla JavaScript with event-driven architecture
- LocalStorage for history persistence
- URL parameters for shareable states

### Error Handling
- Graceful degradation for missing assets
- Fallback placeholders for images
- Try-catch blocks around API calls with user-friendly messages

## Recent Work (August 2024)

### v3 Folder - Slot Machine Animation Fix
**Status**: Completed - Fixed infinite upward scrolling bug

#### Problem Solved:
- Slot machine was scrolling upward infinitely instead of downward
- Items were not centering properly on the winner
- Animation loop had incorrect boundary conditions

#### Solution Implemented:
1. **Fixed Velocity Direction** (animation-engine.js:573-580)
   - Force positive velocity with `Math.abs()` to ensure downward motion
   
2. **Fixed Loop Reset Boundary** (multiple locations)
   - Changed from `if (position > viewportHeight)` to `if (position >= 0)`
   - Proper seamless loop when items scroll past position 0
   
3. **Fixed Winner Centering** (animation-engine.js:708-715)
   - Winner at index 20 properly centers at -1520px
   - Correct calculation: -(20 * 80) + 80 = -1520px

4. **Added Debug Features**:
   - Real-time debug overlay showing position/velocity
   - Console logging at key animation phases
   - Red border on winner items for visual verification
   - Position tracking every 500ms during chaos phase

#### Key Files Modified:
- `/v3/animation-engine.js` - Main animation fixes
- `/v3/slot-machine.js` - Winner placement debugging

#### Testing Notes:
- Animation now scrolls downward consistently
- Winner properly centers in middle slot (80px from viewport top)
- No visible jumps or resets during animation
- Debug mode enabled (`this.debugMode = true` in constructor)

### Git Configuration
- Removed Zone.Identifier files from tracking
- Added `*Zone.Identifier` to .gitignore
- Repository ready for GitHub Desktop integration