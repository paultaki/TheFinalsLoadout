<!--  =============================================================  -->
<!--                THE FINALS – CLAUDE PRIMER (PROD SITE)          -->
<!--  =============================================================  -->

## 0 · How to read this document

- Sections 1–6 are required for maintaining structure and functionality.
- This version applies to the original site: HTML + CSS + Vanilla JavaScript.

---

## 1 · Mission & vibe 🎰

Build a sleek, **glow-infused** random loadout generator for _The Finals_:

- Clean casino-vibe interface
- Responsive mobile support
- Fast, dopamine-rich slot spins
- No bloated frameworks

---

## 2 · File landscape 🗂️

/
├─ index.html # Main HTML scaffold
├─ style.css # Core styling, animations, gradients
├─ app.js # Spin logic, gadget randomness, filters
├─ images/ # Loadout icons (.webp, lowercase, underscore format)
├─ sounds/ # MP3s for clicks, wins, transitions
├─ punishment-loadout/ # Secondary mode (optional)
├─ ragequit/, feedback/, patch-notes/ # Linked sub-pages

yaml

---

## 3 · Loadout flow 🌀

1. **User clicks Spin** — single or multi-spin (class-based or random).
2. **Selected class shown** — Light, Medium, or Heavy.
3. **Slot machine reels** display:
   - 1 weapon
   - 1 specialization
   - 3 unique gadgets (from valid pool)
4. **History logged** — full loadout + timestamp, badges, copy/share options.

---

## 4 · Data sources & rules 📊

All loadout data defined in `app.js` under `const loadouts = {}`:

- Each class (`Light`, `Medium`, `Heavy`) has:
  - weapons: `string[]`
  - specializations: `string[]`
  - gadgets: `string[]`

Hard rules:

- Must pull **3 unique gadgets** per loadout
- Class determines allowed items
- Gadget filters update gadget pool via UI checkboxes
- No duplicates allowed in displayed loadout

---

## 5 · Styling & animation 🎨

- Primary colors: `#FFD700`, `#FF1493`, `#00D4FF`, `#1E90FF`
- Background: animated dark gradient with cyber-grid overlay
- Fonts: `Bebas Neue`, `Inter`
- Button glow + locked-in flash effects
- Final slot column has overshoot + snapback
- CLS < 0.1, no forced layout shifts on spin

---

## 6 · Tech stack & conventions ⚙️

- HTML5, vanilla JS (ES6+), no frameworks
- CSS3 (no Tailwind), uses keyframes + variables
- Custom DOM state via `window.state`
- Audio triggered by element `play()` with `soundEnabled` toggle
- Responsive rules via `@media` only
- Lazy load offscreen images using `loading="lazy"`

---

## 7 · Iteration rules 🧪

- Keep all core functionality visible in UI (don’t hide features unless toggled)
- Use `console.log()` with emoji markers for all major actions (✅, ⚠️, 🔥)
- New features must:
  - not break spin flow
  - not increase load time over 1.2s on mobile
  - degrade gracefully if JS fails

---

## 8 · Examples & definition-of-done ✅

### 8.1 · Class structure

```js
loadouts = {
  Light: {
    weapons: ["V9S", "Throwing Knives"],
    specializations: ["Cloaking Device"],
    gadgets: ["Goo Grenade", "Flashbang", "Smoke Grenade"],
  },
  ...
}
8.2 · Locked-in loadout sample
json

{
  "class": "Medium",
  "weapon": "AKM",
  "specialization": "Healing Beam",
  "gadgets": ["Pyro Grenade", "Frag Grenade", "Jump Pad"]
}
8.3 · Spin logic
Each reel spins 2600ms staggered (0ms, 250ms, 500ms, 750ms, 1000ms)

Final spin adds landing-flash + locked-tag

Only one spin active at a time (state.isSpinning = true)

getUniqueGadgets() ensures no repeats

End of primer – use this as your Claude reference for legacy site updates or debugging.
```
