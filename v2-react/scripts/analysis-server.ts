import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = 4000;

app.use(cors());
app.use(express.json());

// Roast logic from ../roast.js
const TIERS = {
  S: { min: 90, label: 'S-Tier' },
  A: { min: 75, label: 'A-Tier' },
  B: { min: 60, label: 'B-Tier' },
  C: { min: 45, label: 'C-Tier' },
  D: { min: 30, label: 'D-Tier' },
  F: { min: 0, label: 'F-Tier' }
};

const PERSONAS = {
  LIGHT: {
    S: [
      "Speed demon build. This is what nightmares are made of. 10/10",
      "Absolutely cracked loadout. The Finals gods smile upon you. 10/10"
    ],
    A: [
      "Very solid picks. You know what you're doing. 8/10",
      "Strong choices all around. Just missing that final piece. 8/10"
    ],
    B: [
      "Decent setup but could use some optimization. 6/10",
      "Not bad, but I've seen better from a Light main. 6/10"
    ],
    C: [
      "This loadout is confused. Pick a playstyle and commit. 4/10",
      "Are you new here? This needs work. 4/10"
    ],
    D: [
      "Brother, what is this? Did you randomize on purpose? 2/10",
      "I'm concerned for your teammates. 2/10"
    ],
    F: [
      "This physically hurts to look at. Uninstall? 0/10",
      "My disappointment is immeasurable. 0/10"
    ]
  },
  MEDIUM: {
    S: [
      "Peak Medium gameplay incoming. Perfectly balanced. 10/10",
      "This is the ideal Medium build. You may not like it, but this is what peak performance looks like. 10/10"
    ],
    A: [
      "Strong and versatile. Classic Medium excellence. 8/10",
      "Very respectable choices. Your team will thank you. 8/10"
    ],
    B: [
      "Solid but unremarkable. The vanilla ice cream of loadouts. 6/10",
      "It works, but it's not winning any awards. 6/10"
    ],
    C: [
      "Questionable decisions were made here. 4/10",
      "This loadout has an identity crisis. 4/10"
    ],
    D: [
      "Did you lose a bet? This is rough. 2/10",
      "I've seen Bronze players with better game sense. 2/10"
    ],
    F: [
      "This is a war crime against The Finals. 0/10",
      "Please seek professional help. 0/10"
    ]
  },
  HEAVY: {
    S: [
      "Unstoppable force meets immovable object. Fear incarnate. 10/10",
      "This Heavy build could solo carry ranked. Absolute unit. 10/10"
    ],
    A: [
      "Powerful choices. The cashout trembles before you. 8/10",
      "Scary good picks. Almost perfect destruction. 8/10"
    ],
    B: [
      "Decent tank setup but missing some synergy. 6/10",
      "You'll hold the fort, but barely. 6/10"
    ],
    C: [
      "This Heavy skipped leg day AND brain day. 4/10",
      "Confused Heavy is confused. Pick a lane. 4/10"
    ],
    D: [
      "How do you mess up Heavy this badly? 2/10",
      "Your shield can't protect you from this L. 2/10"
    ],
    F: [
      "This loadout is heavier than your movement speed. 0/10",
      "Reported for throwing. 0/10"
    ]
  }
};

function calculateScore(className: string, weapon: string, spec: string, gadgets: string[]): number {
  // Simplified scoring logic
  let score = Math.random() * 40 + 30; // Base 30-70
  
  // Add some deterministic bonuses
  if (weapon && spec) score += 10;
  if (gadgets.length === 3) score += 10;
  if (className === 'Light' && weapon.includes('Sword')) score += 10;
  if (className === 'Heavy' && weapon.includes('Lewis')) score += 10;
  
  return Math.min(100, Math.max(0, Math.round(score)));
}

function getTier(score: number): string {
  for (const [tier, config] of Object.entries(TIERS)) {
    if (score >= config.min) return tier;
  }
  return 'F';
}

function getRoast(className: string, tier: string): string {
  const persona = PERSONAS[className.toUpperCase() as keyof typeof PERSONAS] || PERSONAS.MEDIUM;
  const roasts = persona[tier as keyof typeof persona] || persona.F;
  return roasts[Math.floor(Math.random() * roasts.length)];
}

app.post('/api/analysis', (req, res) => {
  try {
    const { class: className, weapon, specialization, gadgets } = req.body;
    
    if (!className || !weapon || !specialization || !gadgets) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    const score = calculateScore(className, weapon, specialization, gadgets);
    const tier = getTier(score);
    const roast = getRoast(className, tier);
    
    res.json({ roast, score, tier });
  } catch (error) {
    console.error('Analysis error:', error);
    res.status(500).json({ error: 'Analysis failed' });
  }
});

app.listen(PORT, () => {
  console.log(`Analysis server running on http://localhost:${PORT}`);
});