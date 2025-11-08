// netlify/functions/change-password.js
import { connectToDatabase } from "./_db.js";
import { getTokenPayloadFromEvent } from "./_auth.js";
import bcrypt from "bcryptjs";

export async function handler(event) {
  if (event.httpMethod !== "POST") return { statusCode: 405 };

  try {
    const payload = getTokenPayloadFromEvent(event);
    const { currentPassword, newPassword } = JSON.parse(event.body || "{}");
    if (!currentPassword || !newPassword) {
      return { statusCode: 400, body: JSON.stringify({ error: "current and new password required" }) };
    }

    const { pool } = await connectToDatabase();

    // Fetch current hash
    const res = await pool.query('SELECT "passwordHash" FROM users WHERE id = $1', [payload.userId]);
    if (res.rowCount === 0) {
      return { statusCode: 404, body: JSON.stringify({ error: "user not found" }) };
    }

    const currentHash = res.rows[0].passwordHash;
    const isValidCurrent = await bcrypt.compare(currentPassword, currentHash);
    if (!isValidCurrent) {
      return { statusCode: 401, body: JSON.stringify({ error: "invalid current password" }) };
    }

    // Hash new password
    const saltRounds = 12;
    const newHash = await bcrypt.hash(newPassword, saltRounds);

    // Update
    await pool.query('UPDATE users SET "passwordHash" = $1 WHERE id = $2', [newHash, payload.userId]);

    return { statusCode: 200, body: JSON.stringify({ message: "password changed" }) };
  } catch (err) {
    console.error("change-password error:", err);
    return { statusCode: 500, body: JSON.stringify({ error: "server error" }) };
  }
}