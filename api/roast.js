import Anthropic from '@anthropic-ai/sdk';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Debug logging - log incoming request body
  console.log('🔍 Received roast request:', JSON.stringify(req.body, null, 2));

  const anthropic = new Anthropic({
    apiKey: process.env.CLAUDE_API_KEY,
  });

  const { class: classType, weapon, specialization, gadgets } = req.body;

  // Validate that we have all required data
  if (!classType || !weapon || !specialization || !gadgets) {
    console.error('❌ Missing required loadout data:', { classType, weapon, specialization, gadgets });
    return res.status(400).json({ error: 'Missing required loadout data' });
  }

  try {
    // Create more specific prompt
    const prompt = `Roast this specific Finals loadout combination:
- ${classType} class using ${weapon}
- With ${specialization} ability
- Carrying: ${gadgets.join(', ')}

Make fun of why THIS SPECIFIC combination is terrible. Reference the actual items by name. Be creative and specific. Max 80 chars. End with X/10.

Example for "Heavy with Sledgehammer and Healing Beam":
"Sledgehammer healer? What are you, a violent therapist? 2/10"`;

    // Debug logging - log the prompt being sent
    console.log('📝 Sending prompt to Claude:', prompt);

    const message = await anthropic.messages.create({
      model: 'claude-3-haiku-20240307',
      max_tokens: 80,
      temperature: 0.9,
      messages: [{
        role: 'user',
        content: prompt
      }]
    });
    
    const roastText = message.content[0].text.trim();
    console.log('✅ Claude response:', roastText);
    
    res.status(200).json({ roast: roastText });
  } catch (error) {
    console.error('❌ Error calling Claude API:', error);
    res.status(200).json({ roast: "This loadout broke our roast generator. 0/10" });
  }
}