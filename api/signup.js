// netlify/functions/signup.js
import { connectToDatabase } from "./_db.js";
import bcrypt from "bcryptjs";

export async function handler(event) {
  if (event.httpMethod !== "POST") return { statusCode: 405 };

  try {
    const { username, password } = JSON.parse(event.body || "{}");
    if (!username || !password) {
      return { statusCode: 400, body: JSON.stringify({ error: "username and password required" }) };
    }
    const { pool, uuidv4 } = await connectToDatabase();
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(password, saltRounds);
    const userId = uuidv4();
    const createdAt = new Date();

    await pool.query(
      'INSERT INTO users (id, username, "passwordHash", "createdAt") VALUES ($1, $2, $3, $4)',
      [userId, username, passwordHash, createdAt]
    );

    return { statusCode: 201, body: JSON.stringify({ message: "user created" }) };
  } catch (err) {
    console.error("signup error:", err);
    // Handle unique constraint violation for username
    if (err.code === "23505") { // 23505 is the code for unique_violation
      return { statusCode: 409, body: JSON.stringify({ error: "username already exists" }) };
    }
    return { statusCode: 500, body: JSON.stringify({ error: "server error" }) };
  }
}