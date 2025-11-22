// api/signup.js
import { connectToDatabase } from "./_db.js";
import bcrypt from "bcryptjs";

export default async function handler(req, res) {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: "username and password required" });
    }
    const { pool, uuidv4 } = await connectToDatabase();
    
    const saltRounds = 10; 
    
    const passwordHash = await bcrypt.hash(password, saltRounds);
    const userId = uuidv4();
    const createdAt = new Date();
    await pool.query(
      'INSERT INTO users (id, username, "passwordHash", "createdAt") VALUES ($1, $2, $3, $4)',
      [userId, username, passwordHash, createdAt]
    );
    return res.status(201).json({ message: "user created" });
  } catch (err) {
    console.error("signup error:", err);
    if (err.code === "23505") { 
      return res.status(409).json({ error: "username already exists" });
    }
    return res.status(500).json({ error: "server error" });
  }
}