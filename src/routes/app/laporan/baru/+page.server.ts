import { error, fail, redirect } from '@sveltejs/kit';
import { q, one, pool } from '$lib/server/db';
import { buatKode } from '$lib/server/laporan';
import { simpanFoto } from '$lib/server/upload';
import { cariSerupa } from '$lib/server/ganda';
import { kirim, teruskan, idAdmin, type Antrean, type Notif } from '$lib/server/notifikasi';

export const load = async ({ locals }) => {
  if (locals.user!.role === 'petugas') error(403, 'Petugas tidak membuat laporan');
  return {
    kategori: await q('SELECT id,nama,deskripsi FROM kategori ORDER BY nama'),
    kecamatan: await q('SELECT id,nama FROM kecamatan ORDER BY nama'),
    desa: await q('SELECT id,kecamatan_id,nama FROM desa ORDER BY nama')
  };
};

export const actions = {
  default: async ({ request, locals }) => {
    const u = locals.user!;
    if (u.role === 'petugas') error(403);
    const f = await request.formData();
    const v = {
      judul: String(f.get('judul') ?? '').trim(),
      uraian: String(f.get('uraian') ?? '').trim(),
      alamat: String(f.get('alamat') ?? '').trim(),
      kategori_id: Number(f.get('kategori_id')),
      kecamatan_id: Number(f.get('kecamatan_id')) || null,
      desa_id: Number(f.get('desa_id')) || null,
      lat: f.get('lat') ? Number(f.get('lat')) : null,
      lng: f.get('lng') ? Number(f.get('lng')) : null
    };
    const balik = { judul: v.judul, uraian: v.uraian, alamat: v.alamat };
    if (v.judul.length < 8) return fail(400, { ...balik, galat: 'Judul minimal 8 karakter, misalnya "Lubang besar di depan pasar".' });
    if (v.uraian.length < 20) return fail(400, { ...balik, galat: 'Ceritakan lebih rinci, minimal 20 karakter.' });
    if (!v.kategori_id || !(await one('SELECT 1 FROM kategori WHERE id=$1', [v.kategori_id]))) return fail(400, { ...balik, galat: 'Pilih jenis masalah.' });
    if (v.lat != null && (!Number.isFinite(v.lat) || Math.abs(v.lat) > 90)) v.lat = v.lng = null;
    if (v.lng != null && (!Number.isFinite(v.lng) || Math.abs(v.lng) > 180)) v.lat = v.lng = null;
    // Peta hanya melayani Jabodetabek; titik di luar wilayah itu dibuang.
    if (v.lat != null && v.lng != null && (v.lat < -6.8 || v.lat > -5.95 || v.lng < 106.35 || v.lng > 107.3)) return fail(400, { ...balik, galat: 'Lokasi di luar wilayah Jabodetabek. Tandai titik di dalam peta.' });
    if (v.desa_id && !(await one('SELECT 1 FROM desa WHERE id=$1 AND kecamatan_id=$2', [v.desa_id, v.kecamatan_id]))) v.desa_id = null;

    // Peringatan laporan ganda: dicek sebelum foto disimpan; isian di sisi klien tidak hilang.
    if (f.get('abaikan_ganda') !== '1') {
      const serupa = await cariSerupa(v);
      if (serupa.length) return fail(409, { ...balik, serupa });
    }

    let foto: string | null = null;
    try { foto = await simpanFoto(f.get('foto')); } catch (e) { return fail(400, { ...balik, galat: (e as Error).message }); }

    const kode = await buatKode();
    const klien = await pool().connect();
    let id: number;
    let antrean: Antrean = [];
    try {
      await klien.query('BEGIN');
      const r = await klien.query(
        `INSERT INTO laporan (kode,pelapor_id,kategori_id,kecamatan_id,desa_id,judul,uraian,alamat,lat,lng,foto)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11) RETURNING id`,
        [kode, u.id, v.kategori_id, v.kecamatan_id, v.desa_id, v.judul, v.uraian, v.alamat, v.lat, v.lng, foto]
      );
      id = r.rows[0].id;
      await klien.query(`INSERT INTO riwayat (laporan_id,status,catatan,oleh,peran) VALUES ($1,'Diterima','Laporan masuk.',$2,$3)`, [id, u.nama, u.role]);
      const tuju = new Map<number, Notif>();
      for (const a of await idAdmin()) tuju.set(a, { jenis: 'baru', judul: 'Laporan baru masuk', isi: `${kode} · ${v.judul}`, laporan_id: id });
      antrean = await kirim(tuju, u.id, klien);
      await klien.query('COMMIT');
    } catch (e) {
      await klien.query('ROLLBACK');
      throw e;
    } finally {
      klien.release();
    }
    teruskan(antrean);
    redirect(303, `/app/laporan/${id}?baru=1`);
  }
};
