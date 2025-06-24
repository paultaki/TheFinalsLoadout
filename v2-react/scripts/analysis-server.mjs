import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import fetch from 'node-fetch';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Try to load from scripts/.env first, then .env.local
dotenv.config({ path: join(__dirname, '.env') });
dotenv.config({ path: '.env.local' });

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

// Roast logic from ../roast.js
const TIERS = {
  S: { min: 90, label: 'S-Tier' },
  A: { min: 75, label: 'A-Tier' },
  B: { min: 60, label: 'B-Tier' },
  C: { min: 45, label: 'C-Tier' },
  D: { min: 30, label: 'D-Tier' },
  F: { min: 0, label: 'F-Tier' },
};

const PERSONAS = {
  LIGHT: {
    S: [
      'Speed demon build. This is what nightmares are made of. 10/10',
      'Absolutely cracked loadout. The Finals gods smile upon you. 10/10',
    ],
    A: [
      "Very solid picks. You know what you're doing. 8/10",
      'Strong choices all around. Just missing that final piece. 8/10',
    ],
    B: [
      'Decent setup but could use some optimization. 6/10',
      "Not bad, but I've seen better from a Light main. 6/10",
    ],
    C: [
      'This loadout needs work. Are you trolling? 4/10',
      'I hope this was a random roll. 4/10',
    ],
    D: [
      'My eyes hurt looking at this. 2/10',
      'Did you close your eyes when picking? 2/10',
    ],
    F: [
      'Uninstall. 0/10',
      'This is a war crime. 0/10',
    ],
  },
  MEDIUM: {
    S: [
      'Perfectly balanced, as all things should be. 10/10',
      'Support god mode activated. Your team loves you. 10/10',
    ],
    A: [
      'Strong support vibes. Missing one key piece. 8/10',
      'Good all-around build. Almost meta. 8/10',
    ],
    B: [
      'Average Medium main energy. 6/10',
      'It works, but barely. 6/10',
    ],
    C: [
      'Are you sure you know how to play Medium? 4/10',
      'This ain\'t it, chief. 4/10',
    ],
    D: [
      'Your teammates are crying. 2/10',
      'Please reconsider your life choices. 2/10',
    ],
    F: [
      'Report this loadout for griefing. 0/10',
      'I\'m calling the police. 0/10',
    ],
  },
  HEAVY: {
    S: [
      'Destruction incarnate. The arena trembles. 10/10',
      'Tank supremacy achieved. Unstoppable force. 10/10',
    ],
    A: [
      'Solid tank build. Just needs a final touch. 8/10',
      'Heavy metal mayhem incoming. 8/10',
    ],
    B: [
      'Standard Heavy fare. Nothing special. 6/10',
      'It\'ll do the job, barely. 6/10',
    ],
    C: [
      'Are you trying to play Heavy like a Light? 4/10',
      'This loadout is confused. 4/10',
    ],
    D: [
      'Even your Mesh Shield can\'t save this. 2/10',
      'Heavy disappointment. 2/10',
    ],
    F: [
      'You\'re the reason we lose. 0/10',
      'Delete this loadout immediately. 0/10',
    ],
  },
};

// Season 7 meta references
const META = {
  Light: {
    weapons: ['XP-54', 'V9S', 'M11'],
    gadgets: ['Vanishing Bomb', 'Stun Gun', 'Goo Grenade'],
  },
  Medium: {
    weapons: ['FCAR', 'AKM', 'Model 1887'],
    gadgets: ['Healing Beam', 'Defibrillator', 'Jump Pad'],
  },
  Heavy: {
    weapons: ['KS-23', 'SA1216', 'Flamethrower'],
    gadgets: ['RPG-7', 'C4', 'Dome Shield'],
  },
};

function calculateScore(className, weapon, specialization, gadgets) {
  // Base score between 40-90
  let score = Math.floor(Math.random() * 50) + 40;
  
  // Bonus for meta weapons
  if (META[className]?.weapons?.includes(weapon)) {
    score += 10;
  }
  
  // Bonus for meta gadgets
  const metaGadgets = META[className]?.gadgets || [];
  gadgets.forEach(gadget => {
    if (metaGadgets.includes(gadget)) {
      score += 5;
    }
  });
  
  return Math.min(100, score);
}

function getTier(score) {
  for (const [tier, config] of Object.entries(TIERS)) {
    if (score >= config.min) {
      return tier;
    }
  }
  return 'F';
}

function getRoast(className, tier) {
  const classRoasts = PERSONAS[className.toUpperCase()]?.[tier] || PERSONAS.MEDIUM[tier];
  return classRoasts[Math.floor(Math.random() * classRoasts.length)];
}

app.post('/api/analysis', async (req, res) => {
  try {
    const { class: className, weapon, specialization, gadgets } = req.body;
    
    if (!className || !weapon || !specialization || !gadgets) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const score = calculateScore(className, weapon, specialization, gadgets);
    const tier = getTier(score);
    const roastLine = getRoast(className, tier);

    // Try to use Claude API if available
    if (process.env.ANTHROPIC_API_KEY) {
      try {
        const aiPrompt = `You are a witty game analyst for The Finals. Analyze this loadout:
Class: ${className}
Weapon: ${weapon}
Specialization: ${specialization}
Gadgets: ${gadgets.join(', ')}

Give a punchy, witty one-liner analysis. STRICT LIMIT: EXACTLY 15-20 WORDS INCLUDING THE RATING. Must end with X/10.
Example: "Goo Gun chaos with shotgun backup. Sticky situations guaranteed. 8/10" (10 words)`;

        const aiRes = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: {
            'x-api-key': process.env.ANTHROPIC_API_KEY,
            'anthropic-version': '2023-06-01',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'claude-3-haiku-20240307',
            max_tokens: 150,
            messages: [{
              role: 'user',
              content: aiPrompt
            }]
          }),
        });

        if (aiRes.ok) {
          const aiJSON = await aiRes.json();
          const aiText = aiJSON.content?.[0]?.text?.trim() || roastLine;
          
          return res.json({
            roast: aiText,
            score,
            tier,
          });
        } else {
          console.error('Claude API error:', aiRes.status);
        }
      } catch (error) {
        console.error('❌ Claude API error:', error);
        // Fall through to use regular roast
      }
    } else {
    }

    // Return regular roast if no API key or if API fails
    res.json({ roast: roastLine, score, tier });
    
  } catch (error) {
    console.error('Analysis error:', error);
    res.status(500).json({ error: 'Analysis failed' });
  }
});

app.listen(PORT, () => {
  console.log(`Analysis server running on http://localhost:${PORT}`);
});