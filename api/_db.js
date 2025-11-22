// api/_db.js
import pg from "pg";
import { v4 as uuidv4 } from "uuid"; // We'll need this for user IDs

// This script caches the pool across warm invocations
let cached = global.__pgPool;

async function createSchema(pool) {
  // Create users table
await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id UUID PRIMARY KEY,
      username TEXT UNIQUE NOT NULL,
      "passwordHash" TEXT NOT NULL,
      "createdAt" TIMESTAMPTZ DEFAULT now()
    );
  `);

  // Create todos table
  await pool.query(`
    CREATE TABLE IF NOT EXISTS todos (
      id UUID PRIMARY KEY,
      "userId" UUID REFERENCES users(id) ON DELETE CASCADE,
      todo TEXT NOT NULL,
      "isCompleted" BOOLEAN DEFAULT false,
      "createdAt" TIMESTAMPTZ DEFAULT now(),
      INDEX ("userId", "createdAt" DESC)
    );
  `);

  // Configure TTL on the 'todos' table, matching your 86400-second expiry
  // This runs idempotently and won't error if already set.
  try {
    await pool.query(`
      ALTER TABLE todos SET (
        ttl_expire_after = '24 hours',
        ttl_job_cron = '@hourly'
      );
    `);
  } catch (err) {
    // Ignore error if TTL is already set (e.g., "column "crdb_internal_expiration" already exists")
    if (!err.message.includes("already exists")) {
      console.warn("Could not set TTL on todos:", err.message);
    }
  }
}

export async function connectToDatabase() {
  if (cached) {
    return { pool: cached, uuidv4 };
  }

  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) throw new Error("DATABASE_URL not set in env");

  // For CockroachDB Serverless, the connection string in the env var
  // (e.g., from the web console) includes all necessary SSL settings.
  const pool = new pg.Pool({
    connectionString: dbUrl,
  });

  // Test the connection
  try {
    await pool.query("SELECT now()");
  } catch (err) {
    console.error("Failed to connect to CockroachDB:", err);
    throw err;
  }

  // Create tables if they don't exist
  try {
    await createSchema(pool);
  } catch (err) {
    console.error("Failed to create schema:", err);
    throw err;
  }

  cached = pool;
  global.__pgPool = pool;
  return { pool, uuidv4 };
}