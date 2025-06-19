import type { NextApiRequest, NextApiResponse } from 'next';
import Anthropic from '@anthropic-ai/sdk';

interface AnalysisRequest {
  class: string;
  weapon: string;
  specialization: string;
  gadgets: string[];
}

interface AnalysisResponse {
  roast: string;
}

interface TierMap {
  weapons: {
    meta: string[];
    offMeta: string[];
    dumpster: string[];
  };
  gadgets: {
    meta: string[];
    offMeta: string[];
    dumpster: string[];
  };
  specs: {
    meta: string[];
    offMeta: string[];
    dumpster: string[];
  };
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<AnalysisResponse | { error: string }>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (process.env.NODE_ENV === 'development') {
    console.log('🔍 Received roast request:', JSON.stringify(req.body, null, 2));
  }

  const apiKey = process.env.CLAUDE_API_KEY;
  if (!apiKey) {
    if (process.env.NODE_ENV === 'development') {
      console.error('❌ CLAUDE_API_KEY environment variable not found');
    }
    return res.status(500).json({ error: 'API key not configured' });
  }

  const anthropic = new Anthropic({ apiKey });

  const { class: classType, weapon, specialization, gadgets } = req.body as AnalysisRequest;
  if (!classType || !weapon || !specialization || !gadgets) {
    if (process.env.NODE_ENV === 'development') {
      console.error('❌ Missing required loadout data:', {
        classType,
        weapon,
        specialization,
        gadgets,
      });
    }
    return res.status(400).json({ error: 'Missing required loadout data' });
  }

  try {
    // Tier definitions (manually managed)
    const tierMap: TierMap = {
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

    function getTier(item: string, type: keyof TierMap): string {
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

    const personaMap: Record<string, string> = {
      'tactical': 'competitive analyst breaking down synergies and weaknesses',
      'roast': 'savage critic who\'s seen too many terrible loadouts',
      'funny': 'comedian making witty observations about loadout choices',
      'supportive': 'encouraging coach finding the silver lining',
      'sarcastic': 'dry wit expert pointing out the obvious',
      'hype': 'enthusiastic caster excited about potential plays'
    };

    const persona = personaMap[analysisStyle] || 'tactical analyst';

    const prompt = `
You are ${persona}. Deliver a short, punchy analysis in EXACTLY 15-20 words that references the SPECIFIC items. Include a rating at the end (X/10).

Class: ${classType}
Weapon: ${weapon} (${weaponTier})
Special: ${specialization} (${specTier})
Gadgets: ${gadgets.join(', ')} (${gadgetTiers.join(', ')})

Analysis Style: ${analysisStyle}

IMPORTANT: Match the style! Reference actual items. Be specific about synergies. DO NOT include any prefixes like "Here's a roast:" or "Analysis:" - start directly with your analysis. STRICT LIMIT: 15-20 WORDS INCLUDING THE RATING.

${analysisStyle} Examples:
${analysisStyle === 'tactical' ? `
- "FCAR + Guardian Turret provides solid mid-range control. Add Jump Pads for repositioning. 7/10"
- "M11 with Grappling Hook enables aggressive flanks. Smoke covers retreats. Solid hit-and-run. 8/10"
- "Lewis Gun suppression pairs well with Barricade. Zone denial specialist. 7.5/10"` : ''}
${analysisStyle === 'roast' ? `
- "93R burst damage? More like burst disappointment. Uninstall. 0/10"
- "Thermal Bore on Light? You drilled a hole to watch yourself die. 1/10"
- "CB-01 Repeater? Even the training bots feel bad killing you. 0/10"` : ''}
${analysisStyle === 'funny' ? `
- "Sledgehammer + Winch Claw? Fishing for players with malicious intent. 8/10"
- "Riot Shield + Healing Beam? Professional third wheel. At least you're useful. 6/10"
- "Throwing Knives + Cloaking? Mall ninja reached final form. 5/10"` : ''}
${analysisStyle === 'supportive' ? `
- "Recurve Bow takes skill! With practice, you'll surprise everyone. Keep grinding! 6/10"
- "Anti-Gravity Cube has niche uses. Creative players make it work! 5/10"
- "M26 Matter hits hard up close. Work those angles! 5.5/10"` : ''}
${analysisStyle === 'sarcastic' ? `
- "Oh wow, FCAR and Defibs. How original. Next you'll discover fire. 9/10"
- "Lewis Gun with Dome Shield. Groundbreaking tactics from 1917. 8/10"
- "M60 and C4. Someone watched a YouTube guide. 8.5/10"` : ''}
${analysisStyle === 'hype' ? `
- "THROWING KNIVES WITH DASH?! Ninja mode ACTIVATED! Let's GO! 9/10"
- "Flamethrower Charge N Slam combo?! MAXIMUM CHAOS ENERGY! 9.5/10"
- "Dual Blades with Vanishing Bomb?! ANIME PROTAGONIST TIME! 8/10"` : ''}

Keep it punchy. Never more than 25 words. Match the style!
`;

    if (process.env.NODE_ENV === 'development') {
      console.log('🎯 Selected analysis style:', analysisStyle);
      console.log('📝 Sending prompt to Claude:', prompt);
    }

    const message = await anthropic.messages.create({
      model: 'claude-3-5-haiku-latest',
      max_tokens: 150,
      temperature: 1.0,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    // Ensure we have valid content
    const roastText = message.content[0]?.text?.trim() || 'Analysis failed. Try again! 0/10';
    if (process.env.NODE_ENV === 'development') {
      console.log('✅ Claude response:', roastText);
    }
    
    // Ensure the response includes a score - add one if missing
    if (!roastText.match(/\d+\/10/)) {
      const defaultScore = '5/10';
      if (process.env.NODE_ENV === 'development') {
        console.log(`⚠️ No score found in response, adding ${defaultScore}`);
      }
      res.status(200).json({ roast: `${roastText} ${defaultScore}` });
    } else {
      res.status(200).json({ roast: roastText });
    }
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('❌ Error calling Claude API:', error);
    }

    let specificFallback = 'This loadout broke our roast generator. 0/10';
    if (weapon && specialization) {
      const fallbacks = [
        `${weapon} with ${specialization}? Someone's confused. 1/10`,
        `${classType} running ${weapon}? Your enemies aren't even worried. 0/10`,
        `${specialization} and these gadgets? Pick a strategy! 2/10`,
        `${weapon} combo so bad it crashed our AI. 0/10`,
        `${classType} class deserves better than this chaos. 1/10`,
      ];
      specificFallback =
        fallbacks[Math.floor(Math.random() * fallbacks.length)];
    }

    res.status(200).json({ roast: specificFallback });
  }
}