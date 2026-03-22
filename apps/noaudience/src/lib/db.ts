import TauriDatabase from '@tauri-apps/plugin-sql';
import { initDb, getDb } from '@noaudience/core/db';

let tauriDb: Awaited<ReturnType<typeof TauriDatabase.load>> | null = null;

// Convert undefined → null in params before sending to SQLite
function sanitizeParams(params: unknown[]): unknown[] {
  return params.map(p => p === undefined ? null : p);
}

// Convert undefined → null in result rows so JSON.parse(undefined) never happens
function sanitizeRows(rows: Record<string, unknown>[]): Record<string, unknown>[] {
  return rows.map(row => {
    const clean: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(row)) {
      clean[key] = value === undefined ? null : value;
    }
    return clean;
  });
}

export async function initDatabase() {
  if (tauriDb) return getDb();

  tauriDb = await TauriDatabase.load('sqlite:noaudience.db');

  const db = initDb(async (sql: string, params: unknown[], method: string) => {
    const safeParams = sanitizeParams(params);

    if (method === 'run') {
      await tauriDb!.execute(sql, safeParams as any[]);
      return [];
    }
    const rows = await tauriDb!.select<Record<string, unknown>[]>(sql, safeParams as any[]);
    return sanitizeRows(rows);
  });

  return db;
}

export { getDb } from '@noaudience/core/db';

export function getRawDb() {
  if (!tauriDb) throw new Error('Database not initialized');
  return tauriDb;
}
