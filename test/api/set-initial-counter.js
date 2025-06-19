import { Redis } from "@upstash/redis";

const redis = Redis.fromEnv();

export default async function handler(req, res) {
  try {
    // Set initial counter to 31,846
    await redis.set("loadouts_generated", 31846);
    const count = await redis.get("loadouts_generated");
    
    res.status(200).json({ 
      message: "Counter initialized successfully",
      count: count 
    });
  } catch (error) {
    console.error("Failed to set counter:", error);
    res.status(500).json({ 
      error: "Failed to initialize counter",
      details: error.message 
    });
  }
}