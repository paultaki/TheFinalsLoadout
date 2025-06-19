# Project: The Finals Loadout Randomizer (v2 - React)
## Current Phase: Development / Pre-Production

---

## 0 · Mission & Vibe 🎰
Turn random loadout selection for _The Finals_ into a **premium Vegas mini-casino**:
- Neon-glow UI
- Dopamine-rich animations
- Polished microinteractions
- No tacky clutter

---

## 1 · File Landscape 📂
```
public/
  ├─ images/, sounds/, fonts
src/
  ├─ components/
  │   ├─ SpinWheel/         # "Spin Selector"
  │   ├─ ClassRoulette/     # "Class Call"
  │   └─ SlotMachine/       # "Loadout Locked-In"
  ├─ context/               # GameProvider + reducer
  ├─ pages/                 # route shells
  ├─ hooks/                 # useRouletteSpin, useSlotMachine, etc.
  ├─ utils/                 # aiAnalysis, animationMath, audio
  └─ styles/                # Tailwind layers + effects.css
```
> Symlinks remain from public/ to `../New Test/*`

---

## 2 · Loadout Flow 🎞️
1. **Spin Selector** → lever sets `spinsRemaining` (Jackpot = infinite)
2. **Class Call** → roulette randomly selects `class`
3. **SlotMachine** → 3 reels show weapon, specialization, 3 gadgets
4. **AI Roast** → `/api/analysis` POST returns short roast + score (0–10)

---

## 3 · Data Models (excerpt) 📊
```ts
type ClassKey = 'Light' | 'Medium' | 'Heavy';

interface Loadout {
  class: ClassKey;
  weapon: string;
  specialization: string;
  gadgets: [string, string, string];
}
```
- Full data lives in `src/data/`

---

## 4 · Styling & Animation Specs 🎨
- Colors: `#FFD700` (gold), `#7328FF` (casino-purple), `#00FFF7` (cyber-cyan)
- Banner: 96px height, neon border, stacked centered text
- Timing:
  - Spin decel: 2200ms (ease-out-expo)
  - Roulette spin: 3000ms (elastic rebound)
  - Slot reels: staggered (0ms, 250ms, 500ms) — each 2600ms
- CLS target: < 0.05
- Main-thread blocking: < 75ms
- Mobile-first: 320px min width

---

## 5 · Hard Rules 📏
- No duplicate gadgets in one loadout
- Never rename public props or break imports
- Tailwind v4 only (utility classes must be literal or safelisted)
- No changes to animation constants unless task says so
- React 18 + Vite + TypeScript (strict mode)

---

## 6 · Dev Workflow 🛠️
- Concise language: bullets, short lines
- Wait for feedback after key steps
- Say “I don’t know ❓” if unsure
- No silent changes – use ```diff blocks
- Restate inferred constraints before acting

---

## 7 · Examples & Definition of Done ✅
### 7.1 · Sample API payload
```json
// POST /api/analysis
{
  "class": "Medium",
  "weapon": "AKM",
  "specialization": "Guardian Turret",
  "gadgets": ["Jump Pad", "Pyro Grenade", "Goo Grenade"]
}
```
**Response:** `{ "roast": "Guardian farmer with splash-boom flair. 8/10", "score": 8, "tier": "A" }`

### 7.2 · UI tweak definition
- Before/after screenshots included
- No console warnings
- Lighthouse CLS unchanged
- `npm run test` passes

---

## 8 · Current Status 🚧
- Animations built but need polish
- AI roast endpoint functional (test mode)
- Some mobile spacing/layout bugs persist
- Gradients + audio not final

---

## 9 · Tasks Often Needed ⚒️
- Fix spacing around Spin + SlotMachine
- Add fallback data for local dev
- Polish mobile layout scaling
- Add shimmer/glow on hover
- Reinforce class color styling
- Tighten slot timing sequence
