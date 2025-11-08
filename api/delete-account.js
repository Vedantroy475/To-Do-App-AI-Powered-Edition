// netlify/functions/delete-account.js
import { connectToDatabase } from "./_db.js";
import { getTokenPayloadFromEvent } from "./_auth.js";

export async function handler(event) {
  if (event.httpMethod !== "POST") return { statusCode: 405 };

  try {
    const payload = getTokenPayloadFromEvent(event);
    const { pool } = await connectToDatabase();

    // Delete user (cascades to todos)
    const res = await pool.query('DELETE FROM users WHERE id = $1', [payload.userId]);
    if (res.rowCount === 0) {
      return { statusCode: 404, body: JSON.stringify({ error: "user not found" }) };
    }

    // Delete embeddings via FastAPI when deleting user account (uncomment and configure EMBED_SERVICE_URL if deployed)
    const embedUrl = process.env.EMBED_SERVICE_URL || 'http://localhost:8000';
    await fetch(`${embedUrl}/delete-user`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': process.env.EMBED_API_KEY,
      },
      body: JSON.stringify({ userId: payload.userId }),
    });

    return { statusCode: 200, body: JSON.stringify({ message: "account deleted" }) };
  } catch (err) {
    console.error("delete-account error:", err);
    return { statusCode: 500, body: JSON.stringify({ error: "server error" }) };
  }
}