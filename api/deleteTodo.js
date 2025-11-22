// api/deleteTodo.js
import { connectToDatabase } from "./_db.js";
import { getTokenPayloadFromRequest } from "./_auth.js";
import { callEmbedDelete } from "./_embed.js"; // Import the new delete helper

export default async function handler(req, res) {
  try {
    // 1) auth
    const payload = getTokenPayloadFromRequest(req);
    const userId = payload.userId;
    // 2) parse id from params: /deleteTodo/:id
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ error: "id required in path" });
    }
    // 3) get DB
    const { pool } = await connectToDatabase();
    // 4) Delete todo from 'todos' table. We can combine check and delete.
    const resQuery = await pool.query(
      'DELETE FROM todos WHERE id = $1 AND "userId" = $2',
      [id, userId]
    );
    // 5) Check if anything was actually deleted
    if (resQuery.rowCount === 0) {
      return res.status(404).json({ error: "not found" });
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
    return res.status(200).json({ message: "deleted" });
  } catch (err) {
    if (err.message === "no-token" || err.message === "invalid-token" || err.message === "no-cookie") {
      return res.status(401).json({ error: "not authenticated" });
    }
    console.error("deleteTodo error:", err);
    return res.status(500).json({ error: "server error" });
  }
}