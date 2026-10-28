import pg from 'pg';
import fs from 'node:fs';
import path from 'node:path';
import { env } from '$env/dynamic/private';

// BIGINT (dana) comes back as string by default; rupiah amounts fit safely in a JS number.
pg.types.setTypeParser(20, (v) => Number(v));

export const pool = new pg.Pool({
  connectionString: env.DATABASE_URL ?? 'postgres://tanggap:tanggap@localhost:5432/tanggap',
  max: 10
});

export const q = async <T = any>(text: string, params: unknown[] = []): Promise<T[]> =>
  (await pool.query(text, params as any[])).rows as T[];

export const one = async <T = any>(text: string, params: unknown[] = []): Promise<T | null> =>
  (await q<T>(text, params))[0] ?? null;

export async function migrate() {
  const file = path.resolve(process.cwd(), 'db/schema.sql');
  await pool.query(fs.readFileSync(file, 'utf8'));
}
