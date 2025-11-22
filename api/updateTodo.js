// api/updateTodo.js
import { connectToDatabase } from "./_db.js";
import { getTokenPayloadFromRequest } from "./_auth.js";
import { callEmbedService } from "./_embed.js";

export default async function handler(req, res) {
  try {
    const payload = getTokenPayloadFromRequest(req);
    const userId = payload.userId;
    const { id, todo, isCompleted } = req.body;
    if (!id) {
      return res.status(400).json({ error: "id required" });
    }
    const { pool } = await connectToDatabase();
    const updateFields = {};
    if (typeof todo === "string") updateFields.todo = todo.trim();
    if (typeof isCompleted === "boolean") updateFields.isCompleted = isCompleted;
    if (Object.keys(updateFields).length === 0) {
      return res.status(400).json({ error: "nothing to update" });
    }
    // 1. Build the dynamic UPDATE query
    const fields = [];
    const values = [];
    let i = 1;
    for (const [key, value] of Object.entries(updateFields)) {
      // Use "isCompleted" for the column name
      const colName = key === "isCompleted" ? '"isCompleted"' : key;
      fields.push(`${colName} = $${i++}`);
      values.push(value);
    }
   
    // Add the WHERE clause values
    values.push(id); // $${i++}
    values.push(userId); // $${i++}
    const updateQuery = `
      UPDATE todos
      SET ${fields.join(", ")}
      WHERE id = $${i} AND "userId" = $${i + 1}
      RETURNING *
    `;
    // 2. Perform the update and get the returned doc
    const updateResult = await pool.query(updateQuery, values);
    // 3. Check if a document was actually found and updated
    if (updateResult.rowCount === 0) {
      return res.status(404).json({ error: "not found" });
    }
    const updatedDoc = updateResult.rows[0];
    // 4. If the todo text changed, re-embed (best-effort)
    if (typeof todo === "string") {
      const EMBED_SERVICE_URL = process.env.EMBED_SERVICE_URL;
      const EMBED_API_KEY = process.env.EMBED_API_KEY;
      if (EMBED_SERVICE_URL && EMBED_API_KEY) {
        try {
          const embedResp = await callEmbedService({
            serviceUrl: EMBED_SERVICE_URL,
            apiKey: EMBED_API_KEY,
            userId,
            todoId: updatedDoc.id,
            text: updatedDoc.todo
          });
          if (!embedResp.ok) {
            console.warn("Failed to update embedding for todo", updatedDoc.id, embedResp);
          }
        } catch (err) {
          console.error("Embedding call error (ignored):", err);
        }
      } else {
        console.info("Embed service not configured. Skipping re-embed.");
      }
    }
    return res.status(200).json({ todo: updatedDoc });
  } catch (err) {
    if (err.message === "no-token" || err.message === "invalid-token" || err.message === "no-cookie") {
      return res.status(401).json({ error: "not authenticated" });
    }
    console.error("updateTodo error:", err);
    return res.status(500).json({ error: "server error" });
  }
}