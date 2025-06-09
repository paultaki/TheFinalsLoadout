// /api/init-counter.js
import { Redis } from "@upstash/redis";

const redis = Redis.fromEnv();

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const value = 5321; // 🎯 Adjust this number as needed
    await redis.set("loadouts_generated", value);
    console.log("✅ Seeded Redis counter:", value);
    res.status(200).json({ message: `Counter initialized to ${value}` });
  } catch (error) {
    console.error("❌ Failed to set counter:", error);
    res.status(500).json({ error: "Failed to initialize counter" });
  }
}
