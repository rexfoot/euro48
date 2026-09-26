import { query } from "./db";

// Per-source rotation cursor, persisted in the DB (see worker_cursors in
// db/schema.sql) so a source that can't fetch "everything" in one call
// (page limits, per-country quota) samples a different slice each run
// instead of the same top results every time.
export async function getCursor<T extends Record<string, unknown>>(source: string): Promise<T> {
  const rows = await query<{ cursor: T }>(`SELECT cursor FROM worker_cursors WHERE source = $1`, [source]);
  return rows[0]?.cursor ?? ({} as T);
}

export async function setCursor(source: string, cursor: Record<string, unknown>): Promise<void> {
  await query(
    `INSERT INTO worker_cursors (source, cursor, updated_at) VALUES ($1, $2, now())
     ON CONFLICT (source) DO UPDATE SET cursor = EXCLUDED.cursor, updated_at = now()`,
    [source, JSON.stringify(cursor)]
  );
}
