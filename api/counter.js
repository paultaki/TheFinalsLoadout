import { Redis } from "@upstash/redis";

const redis = Redis.fromEnv();

export default async function handler(req, res) {
  try {
    // Add debugging info
    console.log("Counter API called");
    
    const count = await redis.get("loadouts_generated");
    console.log("Redis returned:", count);
    
    const finalCount = count || 0;
    console.log("Final count:", finalCount);
    
    res.status(200).json({ count: finalCount });
  } catch (error) {
    console.error("Failed to get counter:", error);
    res.status(500).json({ 
      count: 0, 
      error: error.message,
      debug: "Check Vercel function logs"
    });
  }
}
