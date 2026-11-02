import { fail, redirect } from '@sveltejs/kit';
import bcrypt from 'bcryptjs';
import { env } from '$env/dynamic/private';
import { one } from '$lib/server/db';
import { createSession } from '$lib/server/auth';

const aman = (p: string | null) => (p && p.startsWith('/app') && !p.startsWith('//') ? p : '/app');

export const load = ({ locals, url }) => {
  if (locals.user) redirect(303, '/app');
  return { lanjut: aman(url.searchParams.get('lanjut')), contoh: env.TAMPILKAN_AKUN_CONTOH !== 'false' };
};

export const actions = {
  default: async ({ request, cookies, url }) => {
    const f = await request.formData();
    const email = String(f.get('email') ?? '').trim().toLowerCase();
    const sandi = String(f.get('sandi') ?? '');
    const u = await one<{ id: number; password: string; aktif: boolean }>(
      'SELECT id,password,aktif FROM users WHERE email=$1',
      [email]
    );
    // pesan sama untuk email tak dikenal dan sandi salah agar akun tidak bisa ditebak
    if (!u || !(await bcrypt.compare(sandi, u.password))) return fail(400, { email, galat: 'Email atau kata sandi salah.' });
    if (!u.aktif) return fail(403, { email, galat: 'Akun dinonaktifkan. Hubungi administrator.' });
    await createSession(cookies, u.id);
    redirect(303, aman(String(f.get('lanjut') ?? url.searchParams.get('lanjut'))));
  }
};
