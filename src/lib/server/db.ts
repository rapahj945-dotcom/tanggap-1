import pg from 'pg';
import { Pool } from '@neondatabase/serverless';
import { env } from '$env/dynamic/private';
import { getRequestEvent } from '$app/server';
import skema from '../../../db/schema.sql?raw';

// BIGINT (dana) comes back as string by default; rupiah amounts fit safely in a JS number.
pg.types.setTypeParser(20, (v) => Number(v));

const isNeon = () => (env.DATABASE_URL ?? '').includes('neon.tech');

let pgPool: pg.Pool;
// Di lokal pakai pg biasa (TCP, aman lintas-request); di Cloudflare pakai driver
// serverless Neon (WebSocket) yang harus dibuat per-request.
const kunci = new WeakMap<object, Pool>();

export function pool(): any {
  if (!isNeon()) {
    pgPool ??= new pg.Pool({
      connectionString: env.DATABASE_URL ?? 'postgres://tanggap:tanggap@localhost:5432/tanggap',
      max: 10
    });
    return pgPool;
  }
  const ev = getRequestEvent() as any;
  let p = kunci.get(ev);
  if (!p) {
    p = new Pool({ connectionString: env.DATABASE_URL, max: 2 });
    kunci.set(ev, p);
  }
  return p;
}

export const q = async <T = any>(text: string, params: unknown[] = []): Promise<T[]> =>
  (await pool().query(text, params as any[])).rows as T[];

export const one = async <T = any>(text: string, params: unknown[] = []): Promise<T | null> =>
  (await q<T>(text, params))[0] ?? null;

export async function migrate() {
  await pool().query(skema);
}
