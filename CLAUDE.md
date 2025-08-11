# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

The Finals Loadout Generator - A web application for generating random loadouts for The Finals game. The app features slot machine animations, class selection, and various interactive elements.

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