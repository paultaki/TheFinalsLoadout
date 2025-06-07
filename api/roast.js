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

    const prompt = `
You're ${persona}, forced to critique this loadout after a 0-3 wipe where your team coin-fed and got spawn camped.

Class: ${classType}
Weapon: ${weapon}
Specialization: ${specialization}
Gadgets: ${gadgets.join(", ")}

Roast it like it's Season 69 patch notes made by interns. Your job:
- Be savage, sarcastic, and specific to The Finals meta
- Drop Finals slang: wipe, ratting, griefing, foam spam, cube tossing, coin clutching, solo queue trauma
- Assume the reader plays. Make inside jokes land. No generic FPS roasts.
- Keep it short and painful. Max 20 words. End with an X/10 rating.

Examples:
- “Sword + Dash? You cosplaying Genji or griefing ranked? 1/10”
- “Pyro Mines + RPG = certified spawn camper loadout. 3/10”
- “No recon, no aim, no chance. 0/10”
`;

    const metaSuffix =
      "Everyone knows Pyro + Goo is meta. This? Feels like a cry for help.";
    const fullPrompt = `${prompt}\n\nCompare it to meta: ${metaSuffix}`;

    console.log("📝 Sending prompt to Claude:", fullPrompt);

    const message = await anthropic.messages.create({
      model: "claude-3-haiku-20240307",
      max_tokens: 100,
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
