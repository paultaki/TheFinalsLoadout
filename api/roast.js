import Anthropic from "@anthropic-ai/sdk";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  console.log("🔍 Received roast request:", JSON.stringify(req.body, null, 2));

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
    // Tier definitions (manually managed)
    const tierMap = {
      weapons: {
        meta: [
          // Light meta
          "M11", "XP-54", "LH1", "Throwing Knives",
          // Medium meta  
          "FCAR", "AKM", "Model 1887", "R.357", "FAMAS",
          // Heavy meta
          "M60", "Lewis Gun", "KS-23", "SA 1216", "Flamethrower"
        ],
        offMeta: [
          // Light off-meta
          "SR-84", "SH1900", "V9S", "Sword", "Dagger",
          // Medium off-meta
          "Pike-556", "CL-40", "Dual Blades", "Riot Shield",
          // Heavy off-meta
          "M32GL", "SHAK-50", "Sledgehammer", "Spear", "50 Akimbo", "M134 Minigun"
        ],
        dumpster: [
          // Light dumpster
          "93R", "Recurve Bow", "M26 Matter", "ARN-220",
          // Medium dumpster
          "CB-01 Repeater", "Cerberus 12GA",
          // Heavy dumpster
          "RPG-7", "Lockbolt Launcher"
        ]
      },
      gadgets: {
        meta: [
          "C4", "Pyro Mine", "Defibrillator", "Jump Pad", "Zipline",
          "Frag Grenade", "Goo Grenade", "Dome Shield", "Barricade",
          "APS Turret", "Explosive Mine", "Gas Mine"
        ],
        offMeta: [
          "Flashbang", "Vanishing Bomb", "Gateway", "Glitch Grenade",
          "Smoke Grenade", "Pyro Grenade", "Gas Grenade", "Thermal Vision",
          "Proximity Sensor", "Breach Charge", "Glitch Trap"
        ],
        dumpster: [
          "Tracking Dart", "Data Reshaper", "Anti-Gravity Cube", "Nullifier",
          "Sonar Grenade", "Thermal Bore", "Gravity Vortex", "Health Canister"
        ]
      },
      specs: {
        meta: [
          "Healing Beam", "Grappling Hook", "Mesh Shield", "Winch Claw"
        ],
        offMeta: [
          "Dematerializer", "Cloaking Device", "Guardian Turret", 
          "Charge N Slam", "Goo Gun", "Evasive Dash"
        ],
        dumpster: []
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

    // Determine analysis style based on loadout
    let analysisStyle = "tactical"; // default
    
    // Random style selection with weighted probabilities
    const styleRoll = Math.random();
    
    if (weaponTier === "dumpster" || specTier === "dumpster" || gadgetTiers.includes("dumpster")) {
      // Dumpster tier gets more roasts
      if (styleRoll < 0.6) analysisStyle = "roast";
      else if (styleRoll < 0.8) analysisStyle = "funny";
      else analysisStyle = "supportive";
    } else if (weaponTier === "meta" && specTier === "meta" && gadgetTiers.every(t => t === "meta")) {
      // Full meta gets tactical or sarcastic
      if (styleRoll < 0.5) analysisStyle = "tactical";
      else if (styleRoll < 0.8) analysisStyle = "sarcastic";
      else analysisStyle = "hype";
    } else {
      // Mixed loadouts get variety
      if (styleRoll < 0.25) analysisStyle = "tactical";
      else if (styleRoll < 0.45) analysisStyle = "funny";
      else if (styleRoll < 0.65) analysisStyle = "roast";
      else if (styleRoll < 0.85) analysisStyle = "supportive";
      else analysisStyle = "hype";
    }

    const persona = {
      "tactical": "competitive analyst breaking down synergies and weaknesses",
      "roast": "savage critic who's seen too many terrible loadouts",
      "funny": "comedian making witty observations about loadout choices",
      "supportive": "encouraging coach finding the silver lining",
      "sarcastic": "dry wit expert pointing out the obvious",
      "hype": "enthusiastic caster excited about potential plays"
    }[analysisStyle] || "tactical analyst";

    const nsfwTag = (specTier === "off-meta" && ["Dematerializer", "Cloaking Device"].includes(specialization)) ? "sneaky-banger" : "";

    const prompt = `
You are ${persona}. Deliver a short, punchy 15–25 word Loadout Analysis that references the SPECIFIC items. Include a rating at the end (X/10).

Class: ${classType}
Weapon: ${weapon} (${weaponTier})
Specialization: ${specialization} (${specTier})
Gadgets: ${gadgets.join(", ")} (${gadgetTiers.join(", ")})

Tone: ${tone}${nsfwTag ? ", " + nsfwTag : ""}

IMPORTANT: Your roast MUST mention the actual weapon/spec/gadget names. Be specific about synergies or conflicts.

Examples:
- "M11 spray with Evasive Dash? Hit-and-run, emphasis on run. 6/10"
- "Sledgehammer + Winch Claw pulls them into bonk range. Pure caveman genius. 8/10"
- "Thermal Bore on Light? You drilled a hole to watch yourself die faster. 1/10"
- "FCAR with Guardian Turret covers all ranges. Boring but effective. 7/10"
- "Throwing Knives + Cloaking Device? Ninja dreams, bronze reality. 4/10"
- "Lewis Gun hipfire with Mesh Shield. Walking fortress of 'no'. 8.5/10"
- "93R burst damage? More like burst disappointment. 0/10"
- "CL-40 spam with Jump Pad mobility. Annoying fly with explosives. 7/10"
- "Flamethrower + Charge N Slam? BBQ delivery service. 8/10"
- "Data Reshaper ruins turrets. Too bad you brought it to a gunfight. 2/10"

Keep it punchy. Never more than 25 words. Always reference the specific loadout items.
`;

    const metaSuffix = "Everyone knows Pyro + Goo is meta. This? Feels like a cry for help.";
    const fullPrompt = `${prompt}\n\nCompare it to meta: ${metaSuffix}`;

    console.log("📝 Sending prompt to Claude:", fullPrompt);

    const message = await anthropic.messages.create({
      model: "claude-3-5-haiku-latest",
      max_tokens: 150,
      temperature: 1.0,
      messages: [
        {
          role: "user",
          content: fullPrompt,
        },
      ],
    });

    const roastText = message.content[0].text.trim();
    console.log("✅ Claude response:", roastText);

    res.status(200).json({ roast: roastText });
  } catch (error) {
    console.error("❌ Error calling Claude API:", error);

    let specificFallback = "This loadout broke our roast generator. 0/10";
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