// Simple in-memory counter (resets when server restarts)
let count = 31846; // Starting count

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST');
  
  try {
    if (req.method === 'GET') {
      // Return current count
      return res.status(200).json({ count });
    }
    
    if (req.method === 'POST') {
      // Increment count
      count++;
      return res.status(200).json({ 
        success: true,
        totalGenerated: count,
        message: "Spin counted successfully"
      });
    }
    
    return res.status(405).json({ error: "Method not allowed" });
  } catch (error) {
    console.error("Counter error:", error);
    return res.status(200).json({ count: 31846 });
  }
}