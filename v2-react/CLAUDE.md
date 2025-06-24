<!--  =============================================================  -->
<!--                      THE FINALS – CLAUDE PRIMER                 -->
<!--  =============================================================  -->

## 0 · How to read this document

- **Sections 1-6** = hard product specs (do **not** change without approval).
- **Section 7** = workflow rules: concise replies, iterative check-ins, admit unknowns.
- **Section 8** = examples & definition-of-done for common tasks.

---

## 1 · Mission & vibe 🎰

Turn random loadout selection for _The Finals_ into a **premium Vegas mini-casino**: neon-glow UI, dopamine-rich spins, zero “tacky” clutter.

---

## 2 · File landscape 📂

public/ → images/, sounds/, fonts
src/
├─ components/
│ ├─ SpinWheel/ # “Spin Selector”
│ ├─ ClassRoulette/ # “Class Call”
│ └─ SlotMachine/ # “Loadout Locked-In”
├─ context/ # GameProvider + reducer
├─ pages/ # route shells
├─ hooks/ # useRouletteSpin, useSlotMachine, etc.
├─ utils/ # aiAnalysis, animationMath, audio
└─ styles/ # Tailwind layers + effects.css

_(Symlinks from `public/images → ../New Test/images` etc. remain.)_

---

## 3 · Step-by-step game flow 🎞️

1. **Spin Selector** → lever determines `spinsRemaining` (Jackpot path sets unlimited).
2. **Class Call** → roulette picks `class` (Light | Medium | Heavy).
3. **Loadout Locked-In** → three-reel slot scrolls **weapon / specialization / gadgets**.
4. **AI Roast** → POST `/api/analysis`, returns ≤ 20-word roast + 0-10 score.

---

## 4 · Data models (excerpt) 📊

````ts
type ClassKey = 'Light' | 'Medium' | 'Heavy';

interface Loadout {
  class: ClassKey;
  weapon: string;
  specialization: string;
  gadgets: [string, string, string];
}
Full weapon & gadget lists live in src/data/.

5 · Visual & animation specs 🎨
Theme colours: #FFD700 (gold glow), #7328FF (casino-purple), #00FFF7 (cyber-cyan).

Banner: 96 px tall, neon border, title above live info text (stacked, centred).

Timings:

Spin-wheel decel = 2200 ms ⇢ 0.25 turn ease-out-expo.

Roulette spin = 3000 ms with elastic rebound.

Slot reels = stagger (0 ms, 250 ms, 500 ms) ; each reel 2600 ms.

CLS target: < 0 .05 ; main-thread blocking < 75 ms.

Mobile-first: design for 320 px then upscale.

6 · Hard rules 📏
Never duplicate a gadget inside one loadout.

Do not rename public props / break imports.

Use Tailwind v4; utility classes must be literal or whitelisted in tailwind.config.js safelist.

No animation constants may change unless a task explicitly says so.

Keep React 18, Vite, TypeScript strict mode.

7 · Workflow & communication rules 🗣️
Concise language: bullet lists, short sentences.

Iterative refinement: after each logical step (file move, style tweak), reply Done ✅, wait for feedback.

Transparency: if you’re unsure or missing info, say “I don’t know – need clarification ❓”.

Constraints recap: restate any new constraint you infer before applying it.

No hidden work: every code change appears in a ```diff block.

8 · Examples & “definition-of-done” 📋
8.1 · Sample API payload/response

// request → POST /api/analysis
{
  "class": "Medium",
  "weapon": "AKM",
  "specialization": "Guardian Turret",
  "gadgets": ["Jump Pad","Pyro Grenade","Goo Grenade"]
}
// response
{
  "roast": "Guardian farmer with splash-boom flair. 8/10",
  "score": 8,
  "tier": "A"
}

8.2 · UI tweak checklist
 Before/after screenshot attached

 No console warnings

 Lighthouse CLS < 0.05 unchanged

 All unit tests pass (npm run test)

End of primer – follow Sections 1-7 exactly; ask if anything is unclear.

````
