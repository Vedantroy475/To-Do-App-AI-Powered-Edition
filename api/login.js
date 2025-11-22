// api/login.js
import { connectToDatabase } from "./_db.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import cookie from "cookie";

export default async function handler(req, res) {
  try {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ error: "username and password required" });
    }

    const { pool } = await connectToDatabase();
    
    const resQuery = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
    
    if (resQuery.rowCount === 0) {
      return res.status(401).json({ error: "invalid credentials" });
    }
    
    const user = resQuery.rows[0];
    const ok = await bcrypt.compare(password, user.passwordHash);

    if (!ok) {
      return res.status(401).json({ error: "invalid credentials" });
    }
    
    const payload = { userId: user.id, username: user.username };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "1d" });
    
    // Secure cookie logic
    const isProd = process.env.NODE_ENV === "production";
    const cookieStr = cookie.serialize("token", token, {
      httpOnly: true,
      secure: isProd, 
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 // 1 day
    });

    res.setHeader('Set-Cookie', cookieStr);
    return res.status(200).json({ message: "logged in", username: user.username });
  } catch (err) {
    console.error("login error:", err);
    return res.status(500).json({ error: "server error" });
  }
}