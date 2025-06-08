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
    const personas = [
      "burned-out Finals coach stuck reviewing Bronze replays",
      "AI tuned for toxic callouts and zero encouragement",
      "dev who coded the RPG but regrets everything",
      "tournament ref who’s seen it all—and hates it",
      "guy who thinks ‘ratting’ is a valid strategy",
      "Heavy main who lost to foam and never recovered",
    ];
    const persona = personas[Math.floor(Math.random() * personas.length)];

// Replaced original prompt logic with dynamic analysis generator
// See appended updated prompt logic below

    const metaSuffix =
      "Everyone knows Pyro + Goo is meta. This? Feels like a cry for help.";
    const fullPrompt = `${prompt}\n\nCompare it to meta: ${metaSuffix}`;

    console.log("📝 Sending prompt to Claude:", fullPrompt);

    const message = await anthropic.messages.create({
      model: "claude-3-haiku-20240307",
      max_tokens: 150,
      temperature: 0.95,
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

const { class: classType, weapon, specialization, gadgets } = req.body;

// Tier definitions (manually managed)
const tierMap = {
  weapons: {
    meta: ["FCAR", "R.357", "M60", "MGL32", "Shotgun", "Cerberus 12GA"],
    offMeta: ["Recurve Bow", "Sword", "Thermal Scope LMG", "Goo Gun"],
    dumpster: ["93R", "CB-01 Repeater"]
  },
  gadgets: {
    meta: ["C4", "Pyro Mine", "Defibs"],
    offMeta: ["Flashbang", "Vanishing Bomb"],
    dumpster: ["Tracking Dart", "Data Reshaper", "Anti-Gravity Cube"]
  },
  specs: {
    meta: ["Healing Beam", "Glitch Cloak"],
    offMeta: ["Dematerializer", "Cloaking Device", "Charge 'n' Slash"],
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

let tone = "off-meta-challenge"; // default

if (weaponTier === "dumpster" || specTier === "dumpster" || gadgetTiers.includes("dumpster")) {
  tone = "dumpsterfire";
} else if (weaponTier === "meta" && specTier === "meta" && gadgetTiers.every(t => t === "meta")) {
  tone = "meta-edge";
}

const persona = {
  "meta-edge": "AI tuned for sarcastic admiration of broken meta abuse",
  "off-meta-challenge": "brutally honest coach rooting for weird picks",
  "dumpsterfire": "burned-out Finals ref forced to review bronze-tier disasters"
}[tone] || "exhausted analyst";

const nsfwTag = (specTier === "off-meta" && ["Dematerializer", "Cloaking Device"].includes(specialization)) ? "sneaky-banger" : "";

const prompt = `
You are ${persona}. Your job is to deliver a short, witty 15–25 word analysis for this loadout in The Finals. Include a meta rating (X/10).

Class: ${classType}
Weapon: ${weapon} (${weaponTier})
Specialization: ${specialization} (${specTier})
Gadgets: ${gadgets.join(", ")} (${gadgetTiers.join(", ")})

Tone: ${tone}${nsfwTag ? ", " + nsfwTag : ""}

Examples:
- “You blink in, blast hard, and vanish. Dematerializer isn't a spec—it's a one-night stand. 8/10”
- “Goo + Pyro = bonfire. Too bad you're the one on fire. 2/10”
- “You picked Tracking Dart. I didn’t even know that was still in the game. 1/10”

Keep it punchy. Never more than 25 words.
`;
// --- Injected Analysis Prompt Logic ---

const { class: classType, weapon, specialization, gadgets } = req.body;

// Tier definitions (manually managed)
const tierMap = {
  weapons: {
    meta: ["FCAR", "R.357", "M60", "MGL32", "Shotgun", "Cerberus 12GA"],
    offMeta: ["Recurve Bow", "Sword", "Thermal Scope LMG", "Goo Gun"],
    dumpster: ["93R", "CB-01 Repeater"]
  },
  gadgets: {
    meta: ["C4", "Pyro Mine", "Defibs"],
    offMeta: ["Flashbang", "Vanishing Bomb"],
    dumpster: ["Tracking Dart", "Data Reshaper", "Anti-Gravity Cube"]
  },
  specs: {
    meta: ["Healing Beam", "Glitch Cloak"],
    offMeta: ["Dematerializer", "Cloaking Device", "Charge 'n' Slash"],
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

let tone = "off-meta-challenge";

if (weaponTier === "dumpster" || specTier === "dumpster" || gadgetTiers.includes("dumpster")) {
  tone = "dumpsterfire";
} else if (weaponTier === "meta" && specTier === "meta" && gadgetTiers.every(t => t === "meta")) {
  tone = "meta-edge";
}

const persona = {
  "meta-edge": "AI tuned for sarcastic admiration of broken meta abuse",
  "off-meta-challenge": "brutally honest coach rooting for weird picks",
  "dumpsterfire": "burned-out Finals ref forced to review bronze-tier disasters"
}[tone] || "exhausted analyst";

const nsfwTag = (specTier === "off-meta" && ["Dematerializer", "Cloaking Device"].includes(specialization)) ? "sneaky-banger" : "";

const prompt = `
You are ${persona}. Deliver a short, punchy 15–25 word Loadout Analysis. Include a rating at the end (X/10).

Class: ${classType}
Weapon: ${weapon} (${weaponTier})
Specialization: ${specialization} (${specTier})
Gadgets: ${gadgets.join(", ")} (${gadgetTiers.join(", ")})

Tone: ${tone}${nsfwTag ? ", " + nsfwTag : ""}

Examples:
- “You blink in, blast hard, vanish. Dematerializer isn't a spec—it’s a one-night stand. 8/10”
- “Goo + Pyro = bonfire. Too bad you're the one on fire. 2/10”
- “Tracking Dart? The only threat is boredom. 1/10”
- “Data Reshaper? You turned a turret into a chair. They still shot you. 0/10”
- “Anti-Gravity Cube: floats well, achieves nothing. 2/10”
- “Recurve Bow? Quiet. Deadly. Unless you whiff. Then it’s interpretive dance. 5/10”
- “Dual Blades: no one knows if it’s genius or trolling. Either way, they’re bleeding. 7/10”
- “Cerberus + Glitch? You could win a fight mid-yawn. 9.5/10”
- “Cloak + Sword: from behind or not at all. 7.5/10”
- “93R? There’s a reason no one’s died to this. Keep it that way. 1/10”
- “Healing Beam + M60 = squad goals. Unless you wander. 8.5/10”
- “Charge ‘n’ Slash? Enough movement to die with flair. 5.5/10”

Keep it punchy. Never more than 25 words.
`;
