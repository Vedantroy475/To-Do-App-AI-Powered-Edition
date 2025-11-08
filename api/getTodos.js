// netlify/functions/getTodos.js
import { connectToDatabase } from "./_db.js";
import { getTokenPayloadFromEvent } from "./_auth.js";

export async function handler(event) {
  if (event.httpMethod !== "GET") return { statusCode: 405 };

  try {
    const payload = getTokenPayloadFromEvent(event);
    const userId = payload.userId;

    const { pool } = await connectToDatabase();
    
    const res = await pool.query(
      'SELECT * FROM todos WHERE "userId" = $1 ORDER BY "createdAt" DESC', 
      [userId]
    );
    
    return { statusCode: 200, body: JSON.stringify({ todos: res.rows }) };
  } catch (err) {
    if (err.message === "no-token" || err.message === "invalid-token" || err.message === "no-cookie") {
      return { statusCode: 401, body: JSON.stringify({ error: "not authenticated" }) };
    }
    console.error("getTodos error:", err);
    return { statusCode: 500, body: JSON.stringify({ error: "server error" }) };
  }
}