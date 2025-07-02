import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { Anthropic } from '@anthropic-ai/sdk';

// Get directory path for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load system prompt from file
const SYSTEM_PROMPT = fs.readFileSync(
  path.join(__dirname, 'claude_analysis_prompt.txt'),
  'utf8'
);

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.CLAUDE_API_KEY;
  if (!apiKey) {
    console.error('CLAUDE_API_KEY environment variable not found');
    return res.status(500).json({ error: 'API key not configured' });
  }

  const anthropic = new Anthropic({ apiKey });

  const { class: classType, weapon, specialization, gadgets } = req.body;
  if (!classType || !weapon || !specialization || !gadgets) {
    return res.status(400).json({ error: 'Missing required loadout data' });
  }

  try {
    // Tier definitions
    const tierMap = {
      weapons: {
        meta: [
          // Light meta
          'M11', 'XP-54', 'LH1', 'Throwing Knives',
          // Medium meta  
          'FCAR', 'AKM', 'Model 1887', 'R.357', 'FAMAS',
          // Heavy meta
          'M60', 'Lewis Gun', 'KS-23', 'SA 1216', 'Flamethrower'
        ],
        offMeta: [
          // Light off-meta
          'SR-84', 'SH1900', 'V9S', 'Sword', 'Dagger',
          // Medium off-meta
          'Pike-556', 'CL-40', 'Dual Blades', 'Riot Shield',
          // Heavy off-meta
          'M32GL', 'SHAK-50', 'Sledgehammer', 'Spear', '50 Akimbo', 'M134 Minigun'
        ],
        dumpster: [
          // Light dumpster
          '93R', 'Recurve Bow', 'M26 Matter', 'ARN-220',
          // Medium dumpster
          'CB-01 Repeater', 'Cerberus 12GA',
          // Heavy dumpster
          'RPG-7', 'Lockbolt Launcher'
        ]
      },
      gadgets: {
        meta: [
          'C4', 'Pyro Mine', 'Defibrillator', 'Jump Pad', 'Zipline',
          'Frag Grenade', 'Goo Grenade', 'Dome Shield', 'Barricade',
          'APS Turret', 'Explosive Mine', 'Gas Mine'
        ],
        offMeta: [
          'Flashbang', 'Vanishing Bomb', 'Gateway', 'Glitch Grenade',
          'Smoke Grenade', 'Pyro Grenade', 'Gas Grenade', 'Thermal Vision',
          'Proximity Sensor', 'Breach Charge', 'Glitch Trap'
        ],
        dumpster: [
          'Tracking Dart', 'Data Reshaper', 'Anti-Gravity Cube', 'Nullifier',
          'Sonar Grenade', 'Thermal Bore', 'Gravity Vortex', 'Health Canister'
        ]
      },
      specs: {
        meta: [
          'Healing Beam', 'Grappling Hook', 'Mesh Shield', 'Winch Claw'
        ],
        offMeta: [
          'Dematerializer', 'Cloaking Device', 'Guardian Turret', 
          'Charge N Slam', 'Goo Gun', 'Evasive Dash'
        ],
        dumpster: []
      }
    };

    function getTier(item, type) {
      const map = tierMap[type];
      if (map.meta.includes(item)) return 'meta';
      if (map.offMeta.includes(item)) return 'off-meta';
      if (map.dumpster.includes(item)) return 'dumpster';
      return 'unknown';
    }

    const weaponTier = getTier(weapon, 'weapons');
    const specTier = getTier(specialization, 'specs');
    const gadgetTiers = gadgets.map(g => getTier(g, 'gadgets'));

    // Determine analysis style based on loadout
    let analysisStyle = 'tactical'; // default
    
    // Random style selection with weighted probabilities
    const styleRoll = Math.random();
    
    if (weaponTier === 'dumpster' || specTier === 'dumpster' || gadgetTiers.includes('dumpster')) {
      // Dumpster tier gets more roasts
      if (styleRoll < 0.6) analysisStyle = 'roast';
      else if (styleRoll < 0.8) analysisStyle = 'funny';
      else analysisStyle = 'supportive';
    } else if (weaponTier === 'meta' && specTier === 'meta' && gadgetTiers.every(t => t === 'meta')) {
      // Full meta gets tactical or sarcastic
      if (styleRoll < 0.5) analysisStyle = 'tactical';
      else if (styleRoll < 0.8) analysisStyle = 'sarcastic';
      else analysisStyle = 'hype';
    } else {
      // Mixed loadouts get variety
      if (styleRoll < 0.25) analysisStyle = 'tactical';
      else if (styleRoll < 0.45) analysisStyle = 'funny';
      else if (styleRoll < 0.65) analysisStyle = 'roast';
      else if (styleRoll < 0.85) analysisStyle = 'supportive';
      else analysisStyle = 'hype';
    }

    const personaMap = {
      'tactical': 'competitive analyst breaking down synergies and weaknesses',
      'roast': 'savage critic who\'s seen too many terrible loadouts',
      'funny': 'comedian making witty observations about loadout choices',
      'supportive': 'encouraging coach finding the silver lining',
      'sarcastic': 'dry wit expert pointing out the obvious',
      'hype': 'enthusiastic caster excited about potential plays'
    };

    const persona = personaMap[analysisStyle] || 'tactical analyst';

    // Prepare the loadout data for the API
    const loadoutData = {
      specialization,
      weapon,
      gadgets,
      classType,
      weaponTier,
      specTier,
      gadgetTiers,
      analysisStyle,
      persona
    };

    const message = await anthropic.messages.create({
      model: 'claude-3-5-haiku-latest',
      max_tokens: 350,
      temperature: 0.7,
      messages: [
        {
          role: 'system',
          content: SYSTEM_PROMPT
        },
        {
          role: 'user',
          content: JSON.stringify(loadoutData)
        }
      ]
    });

    // Ensure we have valid content
    const analysisText = message.content[0]?.text?.trim() || 'Analysis failed. Try again! 0/10';
    
    // Ensure the response includes a score - add one if missing
    let finalAnalysis = analysisText;
    if (!analysisText.match(/\d+\/10/)) {
      finalAnalysis = `${analysisText} 5/10`;
    }

    // Return with 'analysis' property to match frontend expectations
    res.status(200).json({ 
      analysis: finalAnalysis,
      roast: finalAnalysis, // Include both for compatibility
      fallback: false
    });

  } catch (error) {
    console.error('Error calling Claude API:', error);

    // Generate fallback response
    let specificFallback = 'This loadout broke our roast generator. 0/10';
    if (weapon && specialization) {
      const fallbacks = [
        `${weapon} with ${specialization}? Someone's confused. 1/10`,
        `${classType} running ${weapon}? Your enemies aren't even worried. 0/10`,
        `${specialization} and these gadgets? Pick a strategy! 2/10`,
        `${weapon} combo so bad it crashed our AI. 0/10`,
        `${classType} class deserves better than this chaos. 1/10`,
      ];
      specificFallback = fallbacks[Math.floor(Math.random() * fallbacks.length)];
    }

    res.status(200).json({ 
      analysis: specificFallback,
      roast: specificFallback,
      fallback: true
    });
  }
};