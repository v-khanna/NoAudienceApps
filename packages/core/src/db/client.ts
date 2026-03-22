import { drizzle } from 'drizzle-orm/sqlite-proxy';
import * as schema from './schema';

let db: ReturnType<typeof createDb> | null = null;

type ExecuteFn = (sql: string, params: unknown[], method: string) => Promise<unknown[]>;

function createDb(execute: ExecuteFn) {
  return drizzle(
    async (sql, params, method) => {
      const result = await execute(sql, params as unknown[], method);
      if (method === 'get') {
        return { rows: result.length ? [result[0]] : [] };
      }
      return { rows: result || [] };
    },
    { schema }
  );
}

export function initDb(execute: ExecuteFn) {
  db = createDb(execute);
  return db;
}

export function getDb() {
  if (!db) throw new Error('Database not initialized. Call initDb() first.');
  return db;
}

export type Database = ReturnType<typeof createDb>;
