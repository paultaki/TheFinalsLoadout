import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { Anthropic } from "@anthropic-ai/sdk";

// Get directory path for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load system prompt from file
const SYSTEM_PROMPT = fs.readFileSync(
  path.join(__dirname, "claude_analysis_prompt.txt"),
  "utf8"
);

// Load The Finals data files for chat context
let finalsData = null;

function loadFinalsData() {
  if (!finalsData) {
    try {
      const dataDir = path.join(__dirname, "..", "data");
      finalsData = {
        weapons: JSON.parse(
          fs.readFileSync(path.join(dataDir, "AI_weapons_s7.json"), "utf8")
        ),
        gadgets: JSON.parse(
          fs.readFileSync(
            path.join(dataDir, "AI_gadgets_specs_s7.json"),
            "utf8"
          )
        ),
        playerSlang: JSON.parse(
          fs.readFileSync(path.join(dataDir, "player_slang.json"), "utf8")
        ),
        announcerLines: JSON.parse(
          fs.readFileSync(path.join(dataDir, "announcer_lines.json"), "utf8")
        ),
        officialTerms: JSON.parse(
          fs.readFileSync(path.join(dataDir, "official_terms.json"), "utf8")
        ),
        commentatorBios: JSON.parse(
          fs.readFileSync(path.join(dataDir, "commentator_bios.json"), "utf8")
        ),
      };
      console.log("🤖 Finals data loaded successfully");
    } catch (error) {
      console.error("Error loading Finals data:", error);
      finalsData = {
        weapons: [],
        gadgets: [],
        playerSlang: [],
        announcerLines: [],
        officialTerms: [],
        commentatorBios: [],
      };
    }
  }
  return finalsData;
}

// Context retrieval function for chat mode
function retrieveContext(prompt, maxItems = 8) {
  const data = loadFinalsData();
  const results = [];
  const lowerPrompt = prompt.toLowerCase();

  // Search weapons
  data.weapons.forEach((weapon) => {
    const searchText = JSON.stringify(weapon).toLowerCase();
    if (
      searchText.includes(lowerPrompt) ||
      lowerPrompt.includes(weapon.name.toLowerCase()) ||
      (weapon.communitySentiment &&
        weapon.communitySentiment.toLowerCase().includes(lowerPrompt))
    ) {
      results.push({ type: "weapon", data: weapon });
    }
  });

  // Search gadgets
  data.gadgets.forEach((gadget) => {
    const searchText = JSON.stringify(gadget).toLowerCase();
    if (
      searchText.includes(lowerPrompt) ||
      lowerPrompt.includes(gadget.name?.toLowerCase() || "")
    ) {
      results.push({ type: "gadget", data: gadget });
    }
  });

  // Search player slang
  data.playerSlang.forEach((slang) => {
    if (
      lowerPrompt.includes(slang.term.toLowerCase()) ||
      slang.def.toLowerCase().includes(lowerPrompt)
    ) {
      results.push({ type: "slang", data: slang });
    }
  });

  // Search official terms
  data.officialTerms.forEach((term) => {
    if (
      lowerPrompt.includes(term.term?.toLowerCase() || "") ||
      (term.definition && term.definition.toLowerCase().includes(lowerPrompt))
    ) {
      results.push({ type: "term", data: term });
    }
  });

  // Return top matches
  return results.slice(0, maxItems);
}

// Handle chat mode
async function handleChatMode(req, res, anthropic, prompt) {
  try {
    if (!prompt || typeof prompt !== "string" || prompt.trim().length === 0) {
      return res.status(400).json({ error: "Invalid or missing prompt" });
    }

    // Retrieve relevant context
    const context = retrieveContext(prompt, 8);

    // Build system prompt for chat mode
    const chatSystemPrompt = `You are an expert AI assistant for The Finals, a fast-paced destruction-based FPS game. You provide helpful, entertaining, and accurate information about weapons, gadgets, strategies, meta builds, and game mechanics.

PERSONALITY:
- Knowledgeable and enthusiastic about The Finals
- Use gaming terminology naturally
- Be concise (2-3 sentences max)
- Match the game's high-energy vibe
- Include community insights when relevant

CONTEXT PROVIDED:
${
  context.length > 0
    ? context
        .map((item) => {
          switch (item.type) {
            case "weapon":
              return `WEAPON: ${item.data.name} (${item.data.class}, Tier ${
                item.data.tier
              }) - ${
                item.data.communitySentiment ||
                item.data.meta ||
                "No sentiment available"
              }`;
            case "gadget":
              return `GADGET: ${item.data.name || "Unknown"} - ${
                item.data.description ||
                item.data.function ||
                "No description available"
              }`;
            case "slang":
              return `SLANG: "${item.data.term}" = ${item.data.def}`;
            case "term":
              return `TERM: "${item.data.term}" = ${
                item.data.definition ||
                item.data.def ||
                "No definition available"
              }`;
            default:
              return `DATA: ${JSON.stringify(item.data)}`;
          }
        })
        .join("\n")
    : "No specific context found for this query."
}

GUIDELINES:
- Use the context above when relevant to the user's question
- If no context matches, provide general Finals knowledge
- Be helpful but keep responses brief
- Include TTK, DPS, or tier info when discussing weapons
- Mention strategy tips when relevant
- Don't make up specific numbers if not in context`;

    const message = await anthropic.messages.create({
      model: "claude-3-5-haiku-latest",
      max_tokens: 200,
      temperature: 0.8,
      system: chatSystemPrompt,
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    const response =
      message.content[0]?.text?.trim() ||
      "Sorry, I couldn't generate a response. Try asking about specific weapons, gadgets, or strategies!";

    res.status(200).json({ response });
  } catch (error) {
    console.error("🤖 Chat error:", error);
    res.status(200).json({
      response:
        "Sorry, I encountered an error. Try asking about The Finals weapons, gadgets, or strategies!",
    });
  }
}

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader("Access-Control-Allow-Credentials", true);
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET,OPTIONS,PATCH,DELETE,POST,PUT"
  );
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version"
  );

  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const apiKey = process.env.CLAUDE_API_KEY;
  if (!apiKey) {
    console.error("CLAUDE_API_KEY environment variable not found");
    return res.status(500).json({ error: "API key not configured" });
  }

  const anthropic = new Anthropic({ apiKey });

  // Check if this is chat mode or loadout analysis mode
  const { mode, prompt } = req.body;

  if (mode === "chat") {
    // Handle chat mode
    return handleChatMode(req, res, anthropic, prompt);
  }

  // Handle existing loadout analysis mode
  const { class: classType, weapon, specialization, gadgets } = req.body;
  if (!classType || !weapon || !specialization || !gadgets) {
    return res.status(400).json({ error: "Missing required loadout data" });
  }

  try {
    // Tier definitions
    const tierMap = {
      weapons: {
        meta: [
          // Light meta
          "M11",
          "XP-54",
          "LH1",
          "Throwing Knives",
          // Medium meta
          "FCAR",
          "AKM",
          "Model 1887",
          "R.357",
          "FAMAS",
          // Heavy meta
          "M60",
          "Lewis Gun",
          "KS-23",
          "SA 1216",
          "Flamethrower",
        ],
        offMeta: [
          // Light off-meta
          "SR-84",
          "SH1900",
          "V9S",
          "Sword",
          "Dagger",
          // Medium off-meta
          "Pike-556",
          "CL-40",
          "Dual Blades",
          "Riot Shield",
          // Heavy off-meta
          "M32GL",
          "SHAK-50",
          "Sledgehammer",
          "Spear",
          "50 Akimbo",
          "M134 Minigun",
        ],
        dumpster: [
          // Light dumpster
          "93R",
          "Recurve Bow",
          "M26 Matter",
          "ARN-220",
          // Medium dumpster
          "CB-01 Repeater",
          "Cerberus 12GA",
          // Heavy dumpster
          "RPG-7",
          "Lockbolt Launcher",
        ],
      },
      gadgets: {
        meta: [
          "C4",
          "Pyro Mine",
          "Defibrillator",
          "Jump Pad",
          "Zipline",
          "Frag Grenade",
          "Goo Grenade",
          "Dome Shield",
          "Barricade",
          "APS Turret",
          "Explosive Mine",
          "Gas Mine",
        ],
        offMeta: [
          "Flashbang",
          "Vanishing Bomb",
          "Gateway",
          "Glitch Grenade",
          "Smoke Grenade",
          "Pyro Grenade",
          "Gas Grenade",
          "Thermal Vision",
          "Proximity Sensor",
          "Breach Charge",
          "Glitch Trap",
        ],
        dumpster: [
          "Tracking Dart",
          "Data Reshaper",
          "Anti-Gravity Cube",
          "Nullifier",
          "Sonar Grenade",
          "Thermal Bore",
          "Gravity Vortex",
          "Health Canister",
        ],
      },
      specs: {
        meta: ["Healing Beam", "Grappling Hook", "Mesh Shield", "Winch Claw"],
        offMeta: [
          "Dematerializer",
          "Cloaking Device",
          "Guardian Turret",
          "Charge N Slam",
          "Goo Gun",
          "Evasive Dash",
        ],
        dumpster: [],
      },
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
    const gadgetTiers = gadgets.map((g) => getTier(g, "gadgets"));

    // Determine analysis style based on loadout
    let analysisStyle = "tactical"; // default

    // Random style selection with weighted probabilities
    const styleRoll = Math.random();

    if (
      weaponTier === "dumpster" ||
      specTier === "dumpster" ||
      gadgetTiers.includes("dumpster")
    ) {
      // Dumpster tier gets more roasts
      if (styleRoll < 0.6) analysisStyle = "roast";
      else if (styleRoll < 0.8) analysisStyle = "funny";
      else analysisStyle = "supportive";
    } else if (
      weaponTier === "meta" &&
      specTier === "meta" &&
      gadgetTiers.every((t) => t === "meta")
    ) {
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

    const personaMap = {
      tactical: "competitive analyst breaking down synergies and weaknesses",
      roast: "savage critic who's seen too many terrible loadouts",
      funny: "comedian making witty observations about loadout choices",
      supportive: "encouraging coach finding the silver lining",
      sarcastic: "dry wit expert pointing out the obvious",
      hype: "enthusiastic caster excited about potential plays",
    };

    const persona = personaMap[analysisStyle] || "tactical analyst";

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
      persona,
    };

    const message = await anthropic.messages.create({
      model: "claude-3-5-haiku-latest",
      max_tokens: 350,
      temperature: 0.7,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: "user",
          content: JSON.stringify(loadoutData),
        },
      ],
    });

    // Ensure we have valid content
    const analysisText =
      message.content[0]?.text?.trim() || "Analysis failed. Try again! 0/10";

    // Ensure the response includes a score - add one if missing
    let finalAnalysis = analysisText;
    if (!analysisText.match(/\d+\/10/)) {
      finalAnalysis = `${analysisText} 5/10`;
    }

    // Return with 'analysis' property to match frontend expectations
    res.status(200).json({
      analysis: finalAnalysis,
      roast: finalAnalysis, // Include both for compatibility
      fallback: false,
    });
  } catch (error) {
    console.error("Error calling Claude API:", error);

    // Generate fallback response
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

          res.status(200).json({
        analysis: specificFallback,
        roast: specificFallback,
        fallback: true,
      });
    }
  }
};