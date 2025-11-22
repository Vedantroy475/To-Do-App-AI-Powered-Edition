// api/delete-account.js
import { connectToDatabase } from "./_db.js";
import { getTokenPayloadFromRequest } from "./_auth.js";

export default async function handler(req, res) {
  try {
    const payload = getTokenPayloadFromRequest(req);
    const { pool } = await connectToDatabase();
    // Delete user (cascades to todos)
    const resQuery = await pool.query('DELETE FROM users WHERE id = $1', [payload.userId]);
    if (resQuery.rowCount === 0) {
      return res.status(404).json({ error: "user not found" });
    }
    // Optional: Delete embeddings via FastAPI (uncomment and configure EMBED_SERVICE_URL if deployed)
    const embedUrl = process.env.EMBED_SERVICE_URL || 'http://localhost:8000';
    await fetch(`${embedUrl}/delete-user`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': process.env.EMBED_API_KEY,
      },
      body: JSON.stringify({ userId: payload.userId }),
    });
    return res.status(200).json({ message: "account deleted" });
  } catch (err) {
    console.error("delete-account error:", err);
    return res.status(500).json({ error: "server error" });
  }
}