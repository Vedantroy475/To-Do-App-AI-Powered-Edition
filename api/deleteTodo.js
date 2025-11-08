// netlify/functions/deleteTodo.js
import { connectToDatabase } from "./_db.js";
import { getTokenPayloadFromEvent } from "./_auth.js";
import { callEmbedDelete } from "./_embed.js"; // Import the new delete helper

export async function handler(event) {
  if (event.httpMethod !== "DELETE") return { statusCode: 405 };

  try {
    // 1) auth
    const payload = getTokenPayloadFromEvent(event);
    const userId = payload.userId;

    // 2) parse id from path: /api/deleteTodo/<id>
    const parts = (event.path || "").split("/");
    const id = parts.pop() || parts.pop(); // handle trailing slash
    if (!id) return { statusCode: 400, body: JSON.stringify({ error: "id required in path" }) };

    // 3) get DB
    const { pool } = await connectToDatabase();

    // 4) Delete todo from 'todos' table. We can combine check and delete.
    const res = await pool.query(
      'DELETE FROM todos WHERE id = $1 AND "userId" = $2', 
      [id, userId]
    );

    // 5) Check if anything was actually deleted
    if (res.rowCount === 0) {
      return { statusCode: 404, body: JSON.stringify({ error: "not found" }) };
    }

    // 6) delete embedding(s) for this todo (best-effort)
    const EMBED_SERVICE_URL = process.env.EMBED_SERVICE_URL;
    const EMBED_API_KEY = process.env.EMBED_API_KEY;

    if (EMBED_SERVICE_URL && EMBED_API_KEY) {
      try {
        await callEmbedDelete({
          serviceUrl: EMBED_SERVICE_URL,
          apiKey: EMBED_API_KEY,
          userId,
          todoId: id
        });
      } catch (embedErr) {
        // log but don't fail the main request
        console.warn("Failed to delete embedding for todo", id, embedErr);
      }
    }

    return { statusCode: 200, body: JSON.stringify({ message: "deleted" }) };
  } catch (err) {
    if (err.message === "no-token" || err.message === "invalid-token" || err.message === "no-cookie") {
      return { statusCode: 401, body: JSON.stringify({ error: "not authenticated" }) };
    }
    console.error("deleteTodo error:", err);
    return { statusCode: 500, body: JSON.stringify({ error: "server error" }) };
  }
}