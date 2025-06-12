import Anthropic from "@anthropic-ai/sdk";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const apiKey = process.env.CLAUDE_API_KEY;
  if (!apiKey) {
    console.error("CLAUDE_API_KEY not found");
    return res.status(500).json({ error: "Missing Claude API key" });
  }

  const { class: classType, weapon, gadgets, handicap } = req.body;

  if (!classType || !weapon || !gadgets || !handicap) {
    console.error("Missing loadout data");
    return res.status(400).json({ error: "Missing required loadout data" });
  }

  const anthropic = new Anthropic({ apiKey });

  const prompt = `
You are Scotty and June, the off-script announcers from THE FINALS. You're reviewing a punishment-tier loadout from Rage Quit Simulator.

Roast this terrible build in under 25 words. Be brutally funny. No sympathy. Mock the handicap, weapon, and gadgets like it's being broadcast live to an audience. End with a fake score (e.g. 0.5/10).

Details:
- Class: ${classType}
- Weapon: ${weapon}
- Gadgets: ${gadgets.join(", ")}
- Handicap: ${handicap}

Examples:
- "Guardian Turret AND Backwards Mode? Hope you like dying in reverse. 1.3/10"
- "Model 1887 + Flashbang + Smoke? You’re blind, loud, and already dead. 2/10"
- "Backwards Mode? Great. Now your KD can moonwalk into oblivion. 0.5/10"

Stay under 25 words. Speak like Scotty or June. No intro. Just drop the line directly.
`;

  try {
    const message = await anthropic.messages.create({
      model: "claude-3-5-haiku-latest",
      max_tokens: 150,
      temperature: 1.0,
      messages: [{ role: "user", content: prompt }],
    });

    const roast = message.content[0].text.trim();
    return res.status(200).json({ roast });
  } catch (err) {
    console.error("Claude API error:", err);
    return res.status(200).json({
      roast: `"You rolled so bad we ran out of jokes. Just... try not to cry. 0/10"`,
    });
  }
}
