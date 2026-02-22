/**
 * TCP Postgres client (pg) for local Docker / localhost.
 * Converts tagged template to parameterized query and returns { rows } like the Neon path.
 */
import { Pool } from "pg";

function buildParameterizedQuery(
  strings: TemplateStringsArray,
  values: unknown[]
): { text: string; values: unknown[] } {
  let text = strings[0];
  for (let i = 0; i < values.length; i++) {
    text += `$${i + 1}` + (strings[i + 1] ?? "");
  }
  return { text, values };
}

export function createPgSql(connectionString: string) {
  const pool = new Pool({ connectionString });

  return async function sql(
    strings: TemplateStringsArray,
    ...values: unknown[]
  ): Promise<{ rows: unknown[] }> {
    const { text, values: params } = buildParameterizedQuery(strings, values);
    const result = await pool.query(text, params);
    return { rows: result.rows };
  };
}

export function isLocalConnection(connectionString: string): boolean {
  return (
    connectionString.includes("localhost") ||
    connectionString.includes("127.0.0.1")
  );
}
