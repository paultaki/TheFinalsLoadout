export default async function handler(req, res) {
  console.log("Test API called");
  console.log("Environment check:", {
    hasClaudeKey: !!process.env.CLAUDE_API_KEY,
    nodeVersion: process.version,
    method: req.method
  });
  
  res.status(200).json({ 
    status: "ok", 
    message: "Test API is working",
    hasClaudeKey: !!process.env.CLAUDE_API_KEY,
    timestamp: new Date().toISOString()
  });
}