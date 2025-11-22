// api/change-password.js
import { connectToDatabase } from "./_db.js";
import { getTokenPayloadFromRequest } from "./_auth.js";
import bcrypt from "bcryptjs";

export default async function handler(req, res) {
  try {
    const payload = getTokenPayloadFromRequest(req);
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: "current and new password required" });
    }
    const { pool } = await connectToDatabase();
    // Fetch current hash
    const resQuery = await pool.query('SELECT "passwordHash" FROM users WHERE id = $1', [payload.userId]);
    if (resQuery.rowCount === 0) {
      return res.status(404).json({ error: "user not found" });
    }
    const currentHash = resQuery.rows[0].passwordHash;
    const isValidCurrent = await bcrypt.compare(currentPassword, currentHash);
    if (!isValidCurrent) {
      return res.status(401).json({ error: "invalid current password" });
    }
    // Hash new password
    const saltRounds = 12;
    const newHash = await bcrypt.hash(newPassword, saltRounds);
    // Update
    await pool.query('UPDATE users SET "passwordHash" = $1 WHERE id = $2', [newHash, payload.userId]);
    return res.status(200).json({ message: "password changed" });
  } catch (err) {
    console.error("change-password error:", err);
    return res.status(500).json({ error: "server error" });
  }
}