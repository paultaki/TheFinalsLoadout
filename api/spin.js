import { kv } from '@vercel/kv';

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  console.log("🎲 Received spin request");

  try {
    // Increment the loadouts generated counter
    const newCount = await kv.incr('loadouts_generated');
    console.log(`📊 Loadouts generated counter incremented to: ${newCount}`);

    // Return success response
    res.status(200).json({ 
      success: true,
      totalGenerated: newCount,
      message: "Spin counted successfully"
    });

  } catch (error) {
    console.error("❌ Error incrementing spin counter:", error);
    
    // Still return success since the spin itself worked, just counter failed
    res.status(200).json({ 
      success: true,
      totalGenerated: null,
      message: "Spin completed, counter unavailable"
    });
  }
}