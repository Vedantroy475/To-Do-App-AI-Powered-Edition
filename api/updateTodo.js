// netlify/functions/updateTodo.js
import { connectToDatabase } from "./_db.js";
import { getTokenPayloadFromEvent } from "./_auth.js";
import { callEmbedService } from "./_embed.js";

export async function handler(event) {
  if (event.httpMethod !== "PUT") return { statusCode: 405 };

  try {
    const payload = getTokenPayloadFromEvent(event);
    const userId = payload.userId;

    const body = JSON.parse(event.body || "{}");
    const { id, todo, isCompleted } = body;
    if (!id) return { statusCode: 400, body: JSON.stringify({ error: "id required" }) };

    const { pool } = await connectToDatabase();

    const updateFields = {};
    if (typeof todo === "string") updateFields.todo = todo.trim();
    if (typeof isCompleted === "boolean") updateFields.isCompleted = isCompleted;

    if (Object.keys(updateFields).length === 0) {
      return { statusCode: 400, body: JSON.stringify({ error: "nothing to update" }) };
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
      return { statusCode: 404, body: JSON.stringify({ error: "not found" }) };
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

    return { statusCode: 200, body: JSON.stringify({ todo: updatedDoc }) };
  } catch (err) {
    if (err.message === "no-token" || err.message === "invalid-token" || err.message === "no-cookie") {
      return { statusCode: 401, body: JSON.stringify({ error: "not authenticated" }) };
    }
    console.error("updateTodo error:", err);
    return { statusCode: 500, body: JSON.stringify({ error: "server error" }) };
  }
}