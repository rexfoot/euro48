import { Pool } from "pg";

declare global {
  // eslint-disable-next-line no-var
  var _euro48Pool: Pool | undefined;
}

export function getPool(): Pool {
  if (!global._euro48Pool) {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
      throw new Error("DATABASE_URL is not set");
    }
    global._euro48Pool = new Pool({
      connectionString,
      ssl: connectionString.includes("localhost") ? undefined : { rejectUnauthorized: false },
      max: 5,
    });
  }
  return global._euro48Pool;
}

export async function query<T = unknown>(text: string, params?: unknown[]): Promise<T[]> {
  const pool = getPool();
  const result = await pool.query(text, params);
  return result.rows as T[];
}
