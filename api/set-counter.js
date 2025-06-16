import { kv } from '@vercel/kv';

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    // Set the counter to 1231
    await kv.set('loadouts_generated', 1231);
    console.log(`✅ Counter set to: 1231`);

    // Verify the value was set
    const count = await kv.get('loadouts_generated');
    
    res.status(200).json({ 
      message: `Counter set to 1231`,
      totalGenerated: count
    });

  } catch (error) {
    console.error("❌ Error setting counter:", error);
    
    res.status(500).json({ 
      error: "Failed to set counter"
    });
  }
}