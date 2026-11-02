import { fail, redirect } from '@sveltejs/kit';
import bcrypt from 'bcryptjs';
import { one } from '$lib/server/db';
import { createSession } from '$lib/server/auth';

export const load = ({ locals }) => {
  if (locals.user) redirect(303, '/app');
};

export const actions = {
  default: async ({ request, cookies }) => {
    const f = await request.formData();
    const nama = String(f.get('nama') ?? '').trim();
    const email = String(f.get('email') ?? '').trim().toLowerCase();
    const no_hp = String(f.get('no_hp') ?? '').trim();
    const sandi = String(f.get('sandi') ?? '');
    const nilai = { nama, email, no_hp };

    if (nama.length < 3) return fail(400, { ...nilai, galat: 'Nama minimal 3 karakter.' });
    if (!/^\S+@\S+\.\S+$/.test(email)) return fail(400, { ...nilai, galat: 'Format email belum benar.' });
    if (sandi.length < 8) return fail(400, { ...nilai, galat: 'Kata sandi minimal 8 karakter.' });
    if (await one('SELECT 1 FROM users WHERE email=$1', [email])) return fail(400, { ...nilai, galat: 'Email ini sudah terdaftar. Coba masuk.' });

    const u = await one<{ id: number }>(
      `INSERT INTO users (nama,email,no_hp,password,role) VALUES ($1,$2,$3,$4,'warga') RETURNING id`,
      [nama, email, no_hp, await bcrypt.hash(sandi, 10)]
    );
    await createSession(cookies, u!.id);
    redirect(303, '/app/laporan/baru');
  }
};
