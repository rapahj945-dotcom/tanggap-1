import { error, fail } from '@sveltejs/kit';
import { q, one } from '$lib/server/db';
import { lingkupLaporan } from '$lib/server/akses';
import { STATUS } from '$lib/server/laporan';

const PER_HAL = 20;

export const load = async ({ locals, url }) => {
  const u = locals.user!;
  const status = url.searchParams.get('status') ?? '';
  const kategori = url.searchParams.get('kategori') ?? '';
  const kecamatan = url.searchParams.get('kecamatan') ?? '';
  const desa = url.searchParams.get('desa') ?? '';
  const petugasId = url.searchParams.get('petugas') ?? '';
  const pelapor = url.searchParams.get('pelapor') ?? '';
  const bulan = url.searchParams.get('bulan') ?? '';
  const sumber = url.searchParams.get('sumber') ?? '';
  // penanda cepat dari halaman ringkasan: 1 = aktif
  const tanda = Object.fromEntries(['aktif', 'lama', 'belum', 'selesaibln', 'masukbln', 'berdana'].map((k) => [k, url.searchParams.get(k) === '1' ? '1' : '']));
  const cari = (url.searchParams.get('q') ?? '').trim();
  const hal = Math.max(1, Number(url.searchParams.get('hal')) || 1);

  const where = [lingkupLaporan(u)];
  const args: unknown[] = [u.id];
  if ((STATUS as readonly string[]).includes(status)) { args.push(status); where.push(`l.status = $${args.length}`); }
  if (/^\d+$/.test(kategori)) { args.push(Number(kategori)); where.push(`l.kategori_id = $${args.length}`); }
  if (/^\d+$/.test(kecamatan)) { args.push(Number(kecamatan)); where.push(`l.kecamatan_id = $${args.length}`); }
  if (/^\d+$/.test(desa)) { args.push(Number(desa)); where.push(`l.desa_id = $${args.length}`); }
  if (/^\d+$/.test(petugasId)) { args.push(Number(petugasId)); where.push(`l.petugas_id = $${args.length}`); }
  if (u.role === 'admin' && /^\d+$/.test(pelapor)) { args.push(Number(pelapor)); where.push(`l.pelapor_id = $${args.length}`); }
  if (/^\d{4}-\d{2}$/.test(bulan)) { args.push(`${bulan}-01`); where.push(`date_trunc('month', l.created_at) = $${args.length}::date`); }
  if (sumber) { args.push(sumber); where.push(`COALESCE(NULLIF(l.sumber_dana,''),'Tanpa keterangan') = $${args.length}`); }
  if (tanda.aktif) where.push(`l.status NOT IN ('Selesai','Ditolak')`);
  if (tanda.lama) where.push(`l.status IN ('Diterima','Diverifikasi') AND l.created_at < now() - interval '3 days'`);
  if (tanda.belum) where.push(`l.status IN ('Diterima','Diverifikasi') AND l.petugas_id IS NULL`);
  if (tanda.selesaibln) where.push(`l.status = 'Selesai' AND l.updated_at >= date_trunc('month', now())`);
  if (tanda.masukbln) where.push(`l.created_at >= date_trunc('month', now())`);
  if (tanda.berdana) where.push(`l.dana IS NOT NULL`);
  if (cari) { args.push(`%${cari}%`); where.push(`(l.judul ILIKE $${args.length} OR l.kode ILIKE $${args.length} OR l.alamat ILIKE $${args.length})`); }
  const w = where.join(' AND ');

  const total = (await one<{ c: number }>(`SELECT count(*)::int AS c FROM laporan l WHERE ${w}`, args))!.c;
  const baris = await q(
    `SELECT l.id,l.kode,l.judul,l.status,l.created_at,l.dana,k.nama AS kategori,k.warna,kc.nama AS kecamatan,pt.nama AS petugas
     FROM laporan l JOIN kategori k ON k.id=l.kategori_id
     LEFT JOIN kecamatan kc ON kc.id=l.kecamatan_id LEFT JOIN users pt ON pt.id=l.petugas_id
     WHERE ${w} ORDER BY l.created_at DESC LIMIT ${PER_HAL} OFFSET ${(hal - 1) * PER_HAL}`,
    args
  );
  return {
    baris, total, hal, jumlahHal: Math.max(1, Math.ceil(total / PER_HAL)),
    filter: { status, kategori, kecamatan, q: cari, desa, petugas: petugasId, pelapor, bulan, sumber, ...tanda },
    kategoriList: await q('SELECT id,nama FROM kategori ORDER BY nama'),
    kecamatanList: await q('SELECT id,nama FROM kecamatan ORDER BY nama'),
    statusList: STATUS
  };
};

export const actions = {
  /** Hapus dari daftar (dipakai geser-untuk-hapus). Hanya admin; sama seperti aksi hapus di halaman detail. */
  hapus: async ({ request, locals }) => {
    const u = locals.user!;
    if (u.role !== 'admin') error(403);
    const id = Number((await request.formData()).get('id'));
    if (!Number.isInteger(id)) return fail(400, { galat: 'ID tidak valid.' });
    await q('DELETE FROM laporan WHERE id=$1', [id]);
    return { ok: true };
  }
};
