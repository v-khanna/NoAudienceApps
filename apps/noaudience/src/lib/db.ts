import TauriDatabase from '@tauri-apps/plugin-sql';
import { initDb, getDb } from '@noaudience/core/db';

let tauriDb: Awaited<ReturnType<typeof TauriDatabase.load>> | null = null;

// Convert undefined → null in params before sending to SQLite
function sanitizeParams(params: unknown[]): unknown[] {
  return params.map(p => p === undefined ? null : p);
}

export async function initDatabase() {
  if (tauriDb) return getDb();

  tauriDb = await TauriDatabase.load('sqlite:noaudience.db');

  // Run lightweight migrations for schema changes
  await tauriDb.execute(
    `ALTER TABLE book_reviews ADD COLUMN date_started TEXT`,
    []
  ).catch(() => {}); // Ignore if column already exists

  const db = initDb(async (sql: string, params: unknown[], method: string) => {
    const safeParams = sanitizeParams(params);

    if (method === 'run') {
      await tauriDb!.execute(sql, safeParams as any[]);
      return [];
    }

    // tauri-plugin-sql returns rows as objects: {id: 1, title: "Movie", genres: "[]"}
    // Drizzle's sqlite-proxy mapResultRow accesses row[columnIndex] (numeric index),
    // expecting arrays: [1, "Movie", "[]"]
    // Object.values() preserves key insertion order, which matches SQL column order
    // because the Rust side uses IndexMap (ordered).
    const rawRows = await tauriDb!.select<Record<string, unknown>[]>(sql, safeParams as any[]);
    return rawRows.map(row => Object.values(row));
  });

  return db;
}

export { getDb } from '@noaudience/core/db';

export function getRawDb() {
  if (!tauriDb) throw new Error('Database not initialized');
  return tauriDb;
}
