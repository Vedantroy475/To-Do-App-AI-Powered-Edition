// api/addTodo.js
import { connectToDatabase } from "./_db.js";
import { getTokenPayloadFromRequest } from "./_auth.js";
import { callEmbedService } from "./_embed.js";

export default async function handler(req, res) {
  try {
    const payload = getTokenPayloadFromRequest(req);
    const userId = payload.userId;
    const { todo } = req.body;
    if (!todo || !todo.trim()) {
      return res.status(400).json({ error: "todo required" });
    }
    const { pool, uuidv4 } = await connectToDatabase();
    const countRes = await pool.query('SELECT COUNT(*) FROM todos WHERE "userId" = $1', [userId]);
    const count = parseInt(countRes.rows[0].count, 10);
   
    if (count >= 10) {
      return res.status(403).json({ error: "max 10 todos allowed" });
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
   
    return res.status(201).json({ todo: doc });
  } catch (err) {
    if (err.message === "no-token" || err.message === "invalid-token" || err.message === "no-cookie") {
      return res.status(401).json({ error: "not authenticated" });
    }
    console.error("addTodo error:", err);
    return res.status(500).json({ error: "server error" });
  }
}