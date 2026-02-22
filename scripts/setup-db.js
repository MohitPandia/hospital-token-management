/**
 * Run with: node scripts/setup-db.js
 * Loads .env then .env.local from project root (.env.local overrides).
 * Uses pg (TCP) for localhost, Neon for hosted. Uses DB_* creds or DATABASE_URL.
 */
const path = require("path");
const fs = require("fs");

const root = path.resolve(__dirname, "..");

function loadEnvFile(filename) {
  const envPath = path.join(root, filename);
  if (!fs.existsSync(envPath)) return;
  const content = fs.readFileSync(envPath, "utf8");
  content.split("\n").forEach((line) => {
    const match = line.match(/^([^#=]+)=(.*)$/);
    if (match) {
      const key = match[1].trim();
      const value = match[2].trim().replace(/^["']|["']$/g, "");
      if (!process.env[key]) process.env[key] = value;
    }
  });
}

loadEnvFile(".env");
loadEnvFile(".env.local");

function getConnectionString() {
  const url =
    process.env.DATABASE_URL ||
    process.env.POSTGRES_URL ||
    buildUrlFromDbEnv();
  if (!url) {
    console.error(
      "Set DATABASE_URL or POSTGRES_URL, or DB_HOST/DB_USERNAME/DB_PASSWORD/DB_DATABASE in .env or .env.local"
    );
    process.exit(1);
  }
  return url;
}

function buildUrlFromDbEnv() {
  const { DB_HOST, DB_PORT, DB_USERNAME, DB_PASSWORD, DB_DATABASE } =
    process.env;
  if (!DB_HOST || !DB_USERNAME || !DB_PASSWORD || !DB_DATABASE) return null;
  const port = DB_PORT || "5432";
  const enc = encodeURIComponent;
  return `postgresql://${enc(DB_USERNAME)}:${enc(DB_PASSWORD)}@${DB_HOST}:${port}/${enc(DB_DATABASE)}`;
}

function isLocal(connectionString) {
  return (
    connectionString.includes("localhost") ||
    connectionString.includes("127.0.0.1")
  );
}

// Tagged template -> pg parameterized query
function pgSql(pool) {
  return async function (strings, ...values) {
    let text = strings[0];
    for (let i = 0; i < values.length; i++) {
      text += `$${i + 1}` + (strings[i + 1] ?? "");
    }
    const result = await pool.query(text, values);
    return { rows: result.rows };
  };
}

async function main() {
  const connectionString = getConnectionString();

  if (isLocal(connectionString)) {
    const { Pool } = require("pg");
    const pool = new Pool({ connectionString });
    const sql = pgSql(pool);
    await runSchema(sql);
    await pool.end();
  } else {
    const { neon } = require("@neondatabase/serverless");
    const neonSql = neon(connectionString);
    const sql = async (strings, ...values) => {
      const result = await neonSql(strings, ...values);
      return { rows: Array.isArray(result) ? result : result ?? [] };
    };
    await runSchema(sql);
  }

  console.log("Schema created successfully.");
  process.exit(0);
}

async function runSchema(sql) {
  await sql`
    CREATE TABLE IF NOT EXISTS hospitals (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      contact TEXT,
      address TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
  `;
  await sql`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      hospital_id INTEGER NOT NULL REFERENCES hospitals(id) ON DELETE CASCADE,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
  `;
  await sql`
    CREATE TABLE IF NOT EXISTS doctors (
      id SERIAL PRIMARY KEY,
      hospital_id INTEGER NOT NULL REFERENCES hospitals(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      contact TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
  `;
  await sql`
    CREATE TABLE IF NOT EXISTS tokens (
      id SERIAL PRIMARY KEY,
      doctor_id INTEGER NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
      date DATE NOT NULL,
      patient_unique_code TEXT UNIQUE NOT NULL,
      patient_name TEXT,
      token_number INTEGER NOT NULL,
      status TEXT NOT NULL DEFAULT 'waiting' CHECK (status IN ('waiting', 'current', 'done', 'cancelled')),
      started_at TIMESTAMPTZ,
      ended_at TIMESTAMPTZ,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
  `;
  await sql`CREATE INDEX IF NOT EXISTS idx_tokens_doctor_date ON tokens(doctor_id, date);`;
  await sql`CREATE INDEX IF NOT EXISTS idx_tokens_code ON tokens(patient_unique_code);`;
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
