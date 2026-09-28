/** Minimal D1-compatible wrapper around node:sqlite so the real SQL and migrations are exercised in unit tests. */
import { readFileSync } from 'node:fs';
import { DatabaseSync } from 'node:sqlite';

type Value = string | number | null;

export function createTestDb(): { db: D1Database; raw: DatabaseSync } {
  const raw = new DatabaseSync(':memory:');
  raw.exec(readFileSync('migrations/0001_init.sql', 'utf8'));
  const prepare = (sql: string) => {
    let params: Value[] = [];
    const stmt = {
      bind: (...values: Value[]) => {
        params = values;
        return stmt;
      },
      first: async <T>() => (raw.prepare(sql).get(...params) as T | undefined) ?? null,
      run: async () => {
        const info = raw.prepare(sql).run(...params);
        return { success: true, meta: { changes: Number(info.changes) } };
      },
      all: async <T>() => ({ results: raw.prepare(sql).all(...params) as T[] }),
    };
    return stmt;
  };
  return { db: { prepare } as unknown as D1Database, raw };
}
