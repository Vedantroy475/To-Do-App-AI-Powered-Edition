// netlify/functions/login.js
import { connectToDatabase } from "./_db.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import cookie from "cookie";

export async function handler(event) {
  if (event.httpMethod !== "POST") return { statusCode: 405 };

  try {
    const { username, password } = JSON.parse(event.body || "{}");
    if (!username || !password) return { statusCode: 400, body: JSON.stringify({ error: "username and password required" }) };

    const { pool } = await connectToDatabase();
    
    const res = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
    if (res.rowCount === 0) {
      return { statusCode: 401, body: JSON.stringify({ error: "invalid credentials" }) };
    }
    
    const user = res.rows[0];

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) {
      return { statusCode: 401, body: JSON.stringify({ error: "invalid credentials" }) };
    }

    const payload = { userId: user.id, username: user.username };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "1d" });

    const isProd = process.env.NODE_ENV === "production";
    const cookieStr = cookie.serialize("token", token, {
      httpOnly: true,
      secure: isProd,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 // 1 day
    });

    return {
      statusCode: 200,
      headers: { "Set-Cookie": cookieStr },
      body: JSON.stringify({ message: "logged in", username: user.username })
    };
  } catch (err) {
    console.error("login error:", err);
    return { statusCode: 500, body: JSON.stringify({ error: "server error" }) };
  }
}