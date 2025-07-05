import Anthropic from "@anthropic-ai/sdk";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  console.log("🔍 Received loadout analysis request:", JSON.stringify(req.body, null, 2));

  const apiKey = process.env.CLAUDE_API_KEY;
  if (!apiKey) {
    console.error("❌ CLAUDE_API_KEY environment variable not found");
    return res.status(500).json({ error: "API key not configured" });
  }

  const anthropic = new Anthropic({ apiKey });

  const { class: classType, weapon, specialization, gadgets } = req.body;
  if (!classType || !weapon || !specialization || !gadgets) {
    console.error("❌ Missing required loadout data:", {
      classType,
      weapon,
      specialization,
      gadgets,
    });
    return res.status(400).json({ error: "Missing required loadout data" });
  }

  try {
    // Tier definitions for Season 7
    const tierMap = {
      weapons: {
        meta: [
          // Light meta
          "M11", "XP-54", "V9S", "LH1", "Sword",
          // Medium meta  
          "AKM", "FAMAS", "Cerberus 12GA", "FCAR", "CL-40",
          // Heavy meta
          "M60", "Lewis Gun", "ShAK-50", "SA-1216", "M134 Minigun"
        ],
        offMeta: [
          // Light off-meta
          "ARN-220", "93R", "SH1900", "Dagger", "Throwing Knives",
          // Medium off-meta
          "Pike-556", "R.357", "Dual Blades", "Riot Shield",
          // Heavy off-meta
          "KS-23", "50 Akimbo", "Sledgehammer", "Spear", "Flamethrower"
        ],
        dumpster: [
          // Light dumpster
          "SR-84", "Recurve Bow", "M26 Matter",
          // Medium dumpster
          "CB-01 Repeater", "Model 1887",
          // Heavy dumpster
          "RPG-7", "Lockbolt Launcher", "M32GL"
        ]
      },
      gadgets: {
        meta: [
          "C4", "Pyro Mine", "Defibrillator", "Jump Pad", "Zipline",
          "Frag Grenade", "Goo Grenade", "Dome Shield", "Barricade",
          "APS Turret", "Explosive Mine", "Gas Mine", "Mesh Shield"
        ],
        offMeta: [
          "Flashbang", "Vanishing Bomb", "Gateway", "Glitch Grenade",
          "Smoke Grenade", "Pyro Grenade", "Gas Grenade", "Thermal Vision",
          "Proximity Sensor", "Breach Charge", "Glitch Trap", "Sonar Grenade"
        ],
        dumpster: [
          "Tracking Dart", "Data Reshaper", "Anti-Gravity Cube", "Nullifier",
          "Thermal Bore", "Gravity Vortex", "Health Canister"
        ]
      },
      specs: {
        meta: [
          "Healing Beam", "Grappling Hook", "Mesh Shield", "Winch Claw",
          "Recon Senses", "Evasive Dash"
        ],
        offMeta: [
          "Dematerializer", "Cloaking Device", "Guardian Turret", 
          "Charge N Slam", "Goo Gun", "Thermal Vision"
        ],
        dumpster: [
          "Data Reshaper", "H+ Infuser"
        ]
      }
    };

    function getTier(item, type) {
      const map = tierMap[type];
      if (map.meta.includes(item)) return "meta";
      if (map.offMeta.includes(item)) return "off-meta";
      if (map.dumpster.includes(item)) return "dumpster";
      return "unknown";
    }

    const weaponTier = getTier(weapon, "weapons");
    const specTier = getTier(specialization, "specs");
    const gadgetTiers = gadgets.map(g => getTier(g, "gadgets"));

    // Determine analysis style based on loadout quality
    let analysisStyle = "tactical"; // default
    
    const styleRoll = Math.random();
    
    if (weaponTier === "dumpster" || specTier === "dumpster" || gadgetTiers.includes("dumpster")) {
      // Dumpster tier gets more critical analysis
      if (styleRoll < 0.4) analysisStyle = "critical";
      else if (styleRoll < 0.7) analysisStyle = "constructive";
      else analysisStyle = "encouraging";
    } else if (weaponTier === "meta" && specTier === "meta" && gadgetTiers.every(t => t === "meta")) {
      // Full meta gets tactical or competitive analysis
      if (styleRoll < 0.5) analysisStyle = "tactical";
      else if (styleRoll < 0.8) analysisStyle = "competitive";
      else analysisStyle = "hype";
    } else {
      // Mixed loadouts get variety
      if (styleRoll < 0.3) analysisStyle = "tactical";
      else if (styleRoll < 0.5) analysisStyle = "balanced";
      else if (styleRoll < 0.7) analysisStyle = "constructive";
      else if (styleRoll < 0.9) analysisStyle = "encouraging";
      else analysisStyle = "competitive";
    }

    const persona = {
      "tactical": "competitive analyst breaking down synergies and effectiveness",
      "critical": "experienced player pointing out serious flaws",
      "constructive": "helpful coach suggesting improvements",
      "encouraging": "supportive mentor finding potential",
      "competitive": "ranked player analyzing tournament viability",
      "balanced": "objective reviewer weighing pros and cons",
      "hype": "enthusiastic caster excited about potential plays"
    }[analysisStyle] || "tactical analyst";

    const prompt = `
You are a ${persona} for The Finals Season 7. Analyze this loadout with a focus on viability and synergy. Keep it 20-30 words max, reference specific items, and end with a rating (X/10).

Class: ${classType}
Weapon: ${weapon} (${weaponTier} tier)
Specialization: ${specialization} (${specTier} tier)
Gadgets: ${gadgets.join(", ")} (${gadgetTiers.join(", ")} tier)

Analysis Style: ${analysisStyle}

IMPORTANT: Start directly with your analysis. NO prefixes like "Analysis:" or "Here's my take:". Reference actual items and their synergies.

${analysisStyle} Examples:
${analysisStyle === "tactical" ? `
- "XP-54 with Grappling Hook enables aggressive flanking. Frag Grenades finish retreating enemies. Strong meta combo. 8/10"
- "AKM provides reliable mid-range damage. Healing Beam sustains team fights. Solid all-around build. 7/10"
- "M60 suppression pairs perfectly with Dome Shield. Zone control specialist loadout. 8/10"` : ""}
${analysisStyle === "critical" ? `
- "93R burst damage can't compete with meta SMGs. Upgrade to XP-54 for better results. 3/10"
- "CB-01 Repeater lacks the punch for current meta. Consider FAMAS instead. 2/10"
- "Thermal Bore on Light class? Your positioning needs work before trying niche gadgets. 1/10"` : ""}
${analysisStyle === "constructive" ? `
- "SR-84 rewards good positioning. Practice your angles and this can work. 5/10"
- "Recurve Bow has potential but needs Thermal Vision for consistency. 4/10"
- "Sledgehammer post-nerf struggles but still dominates close quarters. 5/10"` : ""}
${analysisStyle === "encouraging" ? `
- "Dagger takes skill but backstab potential is huge! Keep practicing those flanks. 6/10"
- "Anti-Gravity Cube has unique utility. Creative players make it shine! 5/10"
- "M26 Matter up close is devastating. Work those angles and surprise enemies! 6/10"` : ""}
${analysisStyle === "competitive" ? `
- "FCAR Healing Beam is tournament standard. Pro team synergy right here. 9/10"
- "ShAK-50 Mesh Shield dominates ranked. Meta loadout for serious players. 9/10"
- "This combo lacks the consistency needed for high-level play. 4/10"` : ""}
${analysisStyle === "balanced" ? `
- "Lewis Gun offers good damage with manageable recoil. Solid choice for most situations. 7/10"
- "Pike-556 has range but lacks versatility. Strong in specific scenarios. 6/10"
- "Mixed bag loadout. Good synergy but some questionable choices. 5/10"` : ""}
${analysisStyle === "hype" ? `
- "Throwing Knives with Dash?! Ninja mode activated! High risk, high reward! 8/10"
- "Flamethrower Charge N Slam combo?! Maximum chaos energy unleashed! 9/10"
- "Dual Blades Vanishing Bomb?! Anime protagonist build complete! 8/10"` : ""}

Keep it punchy, specific, and under 30 words!
`;

    console.log("🎯 Selected analysis style:", analysisStyle);
    console.log("📝 Sending prompt to Claude:", prompt);

    const message = await anthropic.messages.create({
      model: "claude-3-5-haiku-latest",
      max_tokens: 150,
      temperature: 0.9,
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    const analysisText = message.content[0].text.trim();
    console.log("✅ Claude response:", analysisText);

    res.status(200).json({ analysis: analysisText });
  } catch (error) {
    console.error("❌ Error calling Claude API:", error);

    // Fallback analysis based on weapon tier
    let fallbackAnalysis = "Analysis unavailable. Still questionable though. 1/10";
    
    if (weapon && specialization) {
      const fallbacks = [
        `${weapon} with ${specialization}? Interesting choice. Needs work though. 4/10`,
        `${classType} running ${weapon}? Bold strategy. Practice recommended. 3/10`,
        `${specialization} synergy unclear with these gadgets. Mixed results expected. 5/10`,
        `${weapon} combo crashed our analyzer. That's... concerning. 2/10`,
        `${classType} class deserves better optimization. Room for improvement. 4/10`,
      ];
      fallbackAnalysis = fallbacks[Math.floor(Math.random() * fallbacks.length)];
    }

    res.status(200).json({ analysis: fallbackAnalysis, fallback: true });
  }
}