import { kv } from '@vercel/kv';

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    // Get the current count, default to 0 if not set
    const count = await kv.get('loadouts_generated') || 0;
    console.log(`📊 Current loadouts generated: ${count}`);

    res.status(200).json({ 
      totalGenerated: count
    });

  } catch (error) {
    console.error("❌ Error fetching counter:", error);
    
    res.status(500).json({ 
      error: "Failed to fetch counter",
      totalGenerated: 0
    });
  }
}