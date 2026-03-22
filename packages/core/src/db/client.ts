import { drizzle } from 'drizzle-orm/sqlite-proxy';
import * as schema from './schema';

let db: ReturnType<typeof createDb> | null = null;

function createDb(execute: (sql: string, params: unknown[]) => Promise<unknown[]>) {
  return drizzle(
    async (sql, params, method) => {
      const result = await execute(sql, params as unknown[]);
      if (method === 'get') {
        return { rows: result.length ? [result[0]] : [] };
      }
      return { rows: result || [] };
    },
    { schema }
  );
}

export function initDb(execute: (sql: string, params: unknown[]) => Promise<unknown[]>) {
  db = createDb(execute);
  return db;
}

export function getDb() {
  if (!db) throw new Error('Database not initialized. Call initDb() first.');
  return db;
}

export type Database = ReturnType<typeof createDb>;
