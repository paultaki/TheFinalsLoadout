import { Redis } from "@upstash/redis";

const redis = Redis.fromEnv();

export default async function handler(req, res) {
  try {
    const count = (await redis.get("loadouts_generated")) || 0;
    res.status(200).json({ count });
  } catch (error) {
    console.error("Failed to get counter:", error);
    res.status(200).json({ count: 0 });
  }
}
