export default function handler(req, res) {
  return res.status(200).json({ message: "KV disabled until env vars added" });
}