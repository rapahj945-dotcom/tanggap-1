import { error, fail } from '@sveltejs/kit';
import { q } from '$lib/server/db';

const admin = (l: App.Locals) => { if (l.user?.role !== 'admin') error(403, 'Khusus administrator'); };
const dipakai = 'Tidak bisa dihapus karena masih dipakai laporan atau data turunan.';

async function coba(fn: () => Promise<unknown>, ok: string) {
  try { await fn(); return { ok }; } catch (e: any) {
    if (e.code === '23503') return fail(400, { galat: dipakai });
    if (e.code === '23505') return fail(400, { galat: 'Nama itu sudah ada.' });
    throw e;
  }
}

export const load = async ({ locals }) => {
  admin(locals);
  return {
    kategori: await q(`SELECT k.id,k.nama,k.deskripsi,k.warna,(SELECT count(*)::int FROM laporan l WHERE l.kategori_id=k.id) AS dipakai FROM kategori k ORDER BY k.nama`),
    kecamatan: await q(`SELECT id,nama FROM kecamatan ORDER BY nama`),
    desa: await q(`SELECT id,kecamatan_id,nama FROM desa ORDER BY nama`)
  };
};

export const actions = {
  tambahKategori: async ({ request, locals }) => {
    admin(locals);
    const f = await request.formData();
    const nama = String(f.get('nama') ?? '').trim();
    const warna = String(f.get('warna') ?? '#1b1f23');
    if (!nama) return fail(400, { galat: 'Nama jenis masalah wajib diisi.' });
    if (!/^#[0-9a-fA-F]{6}$/.test(warna)) return fail(400, { galat: 'Warna tidak valid.' });
    return coba(() => q('INSERT INTO kategori (nama,deskripsi,warna) VALUES ($1,$2,$3)', [nama, String(f.get('deskripsi') ?? '').trim(), warna]), 'Jenis masalah ditambahkan.');
  },
  hapusKategori: async ({ request, locals }) => {
    admin(locals);
    const id = Number((await request.formData()).get('id'));
    return coba(() => q('DELETE FROM kategori WHERE id=$1', [id]), 'Jenis masalah dihapus.');
  },
  tambahKecamatan: async ({ request, locals }) => {
    admin(locals);
    const nama = String((await request.formData()).get('nama') ?? '').trim();
    if (!nama) return fail(400, { galat: 'Nama kecamatan wajib diisi.' });
    return coba(() => q('INSERT INTO kecamatan (nama) VALUES ($1)', [nama]), 'Kecamatan ditambahkan.');
  },
  hapusKecamatan: async ({ request, locals }) => {
    admin(locals);
    const id = Number((await request.formData()).get('id'));
    return coba(() => q('DELETE FROM kecamatan WHERE id=$1', [id]), 'Kecamatan dihapus.');
  },
  tambahDesa: async ({ request, locals }) => {
    admin(locals);
    const f = await request.formData();
    const nama = String(f.get('nama') ?? '').trim();
    const kec = Number(f.get('kecamatan_id'));
    if (!nama || !kec) return fail(400, { galat: 'Pilih kecamatan dan isi nama kelurahan/desa.' });
    return coba(() => q('INSERT INTO desa (kecamatan_id,nama) VALUES ($1,$2)', [kec, nama]), 'Kelurahan/desa ditambahkan.');
  },
  hapusDesa: async ({ request, locals }) => {
    admin(locals);
    const id = Number((await request.formData()).get('id'));
    return coba(() => q('DELETE FROM desa WHERE id=$1', [id]), 'Kelurahan/desa dihapus.');
  }
};
