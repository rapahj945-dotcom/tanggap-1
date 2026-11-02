import { error, fail } from '@sveltejs/kit';
import bcrypt from 'bcryptjs';
import { q, one } from '$lib/server/db';

const admin = (l: App.Locals) => { if (l.user?.role !== 'admin') error(403, 'Khusus administrator'); return l.user; };

export const load = async ({ locals }) => {
  admin(locals);
  return {
    daftar: await q(
      `SELECT u.id,u.nama,u.email,u.no_hp,u.role,u.aktif,u.created_at,
              (SELECT count(*)::int FROM laporan l WHERE l.pelapor_id=u.id OR l.petugas_id=u.id) AS laporan
       FROM users u ORDER BY u.role, u.nama`
    )
  };
};

export const actions = {
  tambah: async ({ request, locals }) => {
    admin(locals);
    const f = await request.formData();
    const nama = String(f.get('nama') ?? '').trim();
    const email = String(f.get('email') ?? '').trim().toLowerCase();
    const role = String(f.get('role'));
    const sandi = String(f.get('sandi') ?? '');
    if (nama.length < 3 || !/^\S+@\S+\.\S+$/.test(email)) return fail(400, { galat: 'Isi nama dan email yang valid.' });
    if (!['admin', 'petugas', 'warga'].includes(role)) return fail(400, { galat: 'Peran tidak valid.' });
    if (sandi.length < 8) return fail(400, { galat: 'Kata sandi minimal 8 karakter.' });
    if (await one('SELECT 1 FROM users WHERE email=$1', [email])) return fail(400, { galat: 'Email sudah terdaftar.' });
    await q('INSERT INTO users (nama,email,no_hp,password,role) VALUES ($1,$2,$3,$4,$5)', [nama, email, String(f.get('no_hp') ?? ''), await bcrypt.hash(sandi, 10), role]);
    return { ok: `Akun ${nama} dibuat.` };
  },

  ubah: async ({ request, locals }) => {
    const me = admin(locals);
    const f = await request.formData();
    const id = Number(f.get('id'));
    const role = String(f.get('role'));
    if (!['admin', 'petugas', 'warga'].includes(role)) return fail(400, { galat: 'Peran tidak valid.' });
    const aktif = f.get('aktif') === 'on';
    if (id === me.id && (!aktif || role !== 'admin')) return fail(400, { galat: 'Anda tidak bisa menurunkan atau menonaktifkan akun sendiri.' });
    await q('UPDATE users SET role=$2, aktif=$3 WHERE id=$1', [id, role, aktif]);
    if (!aktif) await q('DELETE FROM sessions WHERE user_id=$1', [id]);
    return { ok: 'Perubahan disimpan.' };
  }
};
