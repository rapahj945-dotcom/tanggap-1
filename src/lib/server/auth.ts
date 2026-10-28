import { randomBytes } from 'node:crypto';
import type { Cookies } from '@sveltejs/kit';
import { one, q } from './db';

export type Role = 'admin' | 'petugas' | 'warga';
export interface SessionUser { id: number; nama: string; email: string; role: Role }

const COOKIE = 'tanggap_sid';
const TTL_DAYS = 14;

export async function createSession(cookies: Cookies, userId: number) {
  const id = randomBytes(32).toString('hex');
  const exp = new Date(Date.now() + TTL_DAYS * 86400000);
  await q('INSERT INTO sessions (id,user_id,expires_at) VALUES ($1,$2,$3)', [id, userId, exp]);
  cookies.set(COOKIE, id, { path: '/', httpOnly: true, sameSite: 'lax', secure: false, expires: exp });
}

export async function readSession(cookies: Cookies): Promise<SessionUser | null> {
  const id = cookies.get(COOKIE);
  if (!id) return null;
  return one<SessionUser>(
    `SELECT u.id,u.nama,u.email,u.role FROM sessions s JOIN users u ON u.id=s.user_id
     WHERE s.id=$1 AND s.expires_at>now() AND u.aktif`,
    [id]
  );
}

export async function destroySession(cookies: Cookies) {
  const id = cookies.get(COOKIE);
  if (id) await q('DELETE FROM sessions WHERE id=$1', [id]);
  cookies.delete(COOKIE, { path: '/' });
}
