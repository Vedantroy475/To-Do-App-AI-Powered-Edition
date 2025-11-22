// api/getTodos.js
import { connectToDatabase } from "./_db.js";
import { getTokenPayloadFromRequest } from "./_auth.js";

export default async function handler(req, res) {
  try {
    const payload = getTokenPayloadFromRequest(req);
    const userId = payload.userId;
    const { pool } = await connectToDatabase();
   
    const resQuery = await pool.query(
      'SELECT * FROM todos WHERE "userId" = $1 ORDER BY "createdAt" DESC',
      [userId]
    );
   
    return res.status(200).json({ todos: resQuery.rows });
  } catch (err) {
    if (err.message === "no-token" || err.message === "invalid-token" || err.message === "no-cookie") {
      return res.status(401).json({ error: "not authenticated" });
    }
    console.error("getTodos error:", err);
    return res.status(500).json({ error: "server error" });
  }
}