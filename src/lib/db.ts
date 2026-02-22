import { neon } from "@neondatabase/serverless";
import { createPgSql, isLocalConnection } from "./db-pg";

function getConnectionString(): string {
  const url =
    process.env.DATABASE_URL ??
    process.env.POSTGRES_URL ??
    buildUrlFromDbEnv();
  if (!url) {
    throw new Error(
      "Set DATABASE_URL or POSTGRES_URL, or DB_HOST/DB_USERNAME/DB_PASSWORD/DB_DATABASE"
    );
  }
  return url;
}

function buildUrlFromDbEnv(): string | undefined {
  const { DB_HOST, DB_PORT, DB_USERNAME, DB_PASSWORD, DB_DATABASE } =
    process.env;
  if (!DB_HOST || !DB_USERNAME || !DB_PASSWORD || !DB_DATABASE) return undefined;
  const port = DB_PORT || "5432";
  const enc = encodeURIComponent;
  return `postgresql://${enc(DB_USERNAME)}:${enc(DB_PASSWORD)}@${DB_HOST}:${port}/${enc(DB_DATABASE)}`;
}

let sqlImpl: ((strings: TemplateStringsArray, ...values: unknown[]) => Promise<{ rows: unknown[] }>) | null = null;

function getSqlImpl() {
  if (sqlImpl) return sqlImpl;
  const connectionString = getConnectionString();
  if (isLocalConnection(connectionString)) {
    sqlImpl = createPgSql(connectionString);
  } else {
    const neonSql = neon(connectionString);
    sqlImpl = async (
      strings: TemplateStringsArray,
      ...values: unknown[]
    ): Promise<{ rows: unknown[] }> => {
      const result = await neonSql(strings as unknown as TemplateStringsArray, ...values);
      const rows = Array.isArray(result) ? result : result ?? [];
      return { rows };
    };
  }
  return sqlImpl;
}

/**
 * Tagged template SQL helper. Returns { rows } for compatibility.
 * Uses pg (TCP) for localhost / Docker, Neon (HTTP) for hosted DB.
 */
export async function sql(
  strings: TemplateStringsArray,
  ...values: unknown[]
): Promise<{ rows: unknown[] }> {
  return getSqlImpl()(strings, ...values);
}

export type TokenStatus = "waiting" | "current" | "done" | "cancelled";

export async function ensureSchema() {
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
  await sql`
    CREATE INDEX IF NOT EXISTS idx_tokens_doctor_date ON tokens(doctor_id, date);
  `;
  await sql`
    CREATE INDEX IF NOT EXISTS idx_tokens_code ON tokens(patient_unique_code);
  `;
}
