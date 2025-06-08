import { Redis } from "@upstash/redis";

const redis = Redis.fromEnv(); // automatically uses your Vercel env vars

export default async function handler(req, res) {
  try {
    if (req.method === "GET") {
      const count = await redis.get("loadouts_generated");
      return res.status(200).json({ totalGenerated: count || 0 });
    }

    if (req.method === "POST") {
      const newCount = await redis.incr("loadouts_generated");
      return res.status(200).json({ totalGenerated: newCount });
    }

    return res.status(405).json({ error: "Method not allowed" });
  } catch (error) {
    console.error("❌ Redis error:", error);
    return res.status(500).json({ error: "Failed to connect to Redis" });
  }
}
