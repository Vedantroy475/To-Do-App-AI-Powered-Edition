// netlify/functions/addTodo.js
import { connectToDatabase } from "./_db.js";
// Note: We get uuidv4 from _db.js now
import { getTokenPayloadFromEvent } from "./_auth.js";
import { callEmbedService } from "./_embed.js";

export async function handler(event) {
  if (event.httpMethod !== "POST") return { statusCode: 405 };

  try {
    const payload = getTokenPayloadFromEvent(event);
    const userId = payload.userId;

    const body = JSON.parse(event.body || "{}");
    const { todo } = body;
    if (!todo || !todo.trim()) return { statusCode: 400, body: JSON.stringify({ error: "todo required" }) };

    const { pool, uuidv4 } = await connectToDatabase();

    const countRes = await pool.query('SELECT COUNT(*) FROM todos WHERE "userId" = $1', [userId]);
    const count = parseInt(countRes.rows[0].count, 10);
    
    if (count >= 10) {
      return { statusCode: 403, body: JSON.stringify({ error: "max 10 todos allowed" }) };
    }

    const doc = {
      id: uuidv4(),
      userId,
      todo: todo.trim(),
      isCompleted: false,
      createdAt: new Date()
    };

    await pool.query(
      'INSERT INTO todos (id, "userId", todo, "isCompleted", "createdAt") VALUES ($1, $2, $3, $4, $5)',
      [doc.id, doc.userId, doc.todo, doc.isCompleted, doc.createdAt]
    );

    // --- Attempt to create embedding (best-effort) ---
    // This logic remains unchanged as it calls the external service
    const EMBED_SERVICE_URL = process.env.EMBED_SERVICE_URL;
    const EMBED_API_KEY = process.env.EMBED_API_KEY;

    if (EMBED_SERVICE_URL && EMBED_API_KEY) {
      try {
        const embedResp = await callEmbedService({
          serviceUrl: EMBED_SERVICE_URL,
          apiKey: EMBED_API_KEY,
          userId,
          todoId: doc.id,
          text: doc.todo
        });
        if (!embedResp.ok) {
          console.warn("Embedding failed for todo", doc.id, embedResp);
        }
      } catch (err) {
        console.error("Embedding call error (ignored):", err);
      }
    } else {
      console.info("Embed service not configured. Skipping embed call.");
    }
    
    // Return the doc we just created, as the INSERT was successful
    return { statusCode: 201, body: JSON.stringify({ todo: doc }) };
  } catch (err) {
    if (err.message === "no-token" || err.message === "invalid-token" || err.message === "no-cookie") {
      return { statusCode: 401, body: JSON.stringify({ error: "not authenticated" }) };
    }
    console.error("addTodo error:", err);
    return { statusCode: 500, body: JSON.stringify({ error: "server error" }) };
  }
}