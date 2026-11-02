import { q, one } from '$lib/server/db';
import { WARNA_STATUS } from '$lib/format';

export const load = async ({ locals }) => {
  const u = locals.user!;

  if (u.role === 'warga') {
    const saya = await q(
      `SELECT l.id,l.kode,l.judul,l.status,l.created_at,l.updated_at,k.nama AS kategori,
              (p.laporan_id IS NOT NULL) AS dinilai
       FROM laporan l JOIN kategori k ON k.id=l.kategori_id LEFT JOIN penilaian p ON p.laporan_id=l.id
       WHERE l.pelapor_id=$1 ORDER BY l.updated_at DESC`,
      [u.id]
    );
    return { mode: 'warga' as const, saya };
  }

  // petugas hanya melihat tugasnya sendiri; admin melihat semuanya
  const lingkup = u.role === 'petugas' ? 'l.petugas_id = $1' : '$1::int IS NOT NULL';
  const arg = [u.id];

  const ringkas = (await one(
    `SELECT count(*) FILTER (WHERE status NOT IN ('Selesai','Ditolak'))::int AS aktif,
            count(*) FILTER (WHERE status IN ('Diterima','Diverifikasi') AND created_at < now() - interval '3 days')::int AS menunggu_lama,
            count(*) FILTER (WHERE status IN ('Diterima','Diverifikasi') AND petugas_id IS NULL)::int AS belum_ditugaskan,
            count(*) FILTER (WHERE status='Selesai' AND updated_at >= date_trunc('month', now()))::int AS selesai_bulan_ini,
            count(*) FILTER (WHERE created_at >= date_trunc('month', now()))::int AS masuk_bulan_ini,
            COALESCE(round(avg(EXTRACT(EPOCH FROM (updated_at-created_at))/86400) FILTER (WHERE status='Selesai')::numeric,1),0)::float AS rerata_hari,
            COALESCE(sum(dana),0)::bigint AS dana,
            COALESCE(sum(dana) FILTER (WHERE updated_at >= date_trunc('month', now())),0)::bigint AS dana_bulan_ini
     FROM laporan l WHERE ${lingkup}`,
    arg
  ))!;

  const kepuasan = await one<{ rata: number | null; n: number }>(
    `SELECT round(avg(p.nilai)::numeric,1)::float AS rata, count(*)::int AS n
     FROM penilaian p JOIN laporan l ON l.id=p.laporan_id WHERE ${lingkup}`,
    arg
  );

  const antrean = await q(
    `SELECT l.id,l.kode,l.judul,l.status,l.created_at,k.nama AS kategori,kc.nama AS kecamatan,pt.nama AS petugas
     FROM laporan l JOIN kategori k ON k.id=l.kategori_id
     LEFT JOIN kecamatan kc ON kc.id=l.kecamatan_id LEFT JOIN users pt ON pt.id=l.petugas_id
     WHERE l.status NOT IN ('Selesai','Ditolak') AND ${lingkup}
     ORDER BY l.created_at ASC LIMIT 10`,
    arg
  );

  const perStatus = await q(`SELECT status AS label, count(*)::int AS nilai FROM laporan l WHERE ${lingkup} GROUP BY status`, arg);
  const perKategori = await q(
    `SELECT k.nama AS label, count(*)::int AS nilai, k.warna FROM laporan l JOIN kategori k ON k.id=l.kategori_id WHERE ${lingkup} GROUP BY k.id ORDER BY nilai DESC`,
    arg
  );
  const perKecamatan = await q(
    `SELECT kc.nama AS label, count(*)::int AS nilai FROM laporan l JOIN kecamatan kc ON kc.id=l.kecamatan_id WHERE ${lingkup} GROUP BY kc.id ORDER BY nilai DESC`,
    arg
  );
  const tren = await q(
    `SELECT to_char(m, 'Mon') AS label, count(l.id)::int AS nilai
     FROM generate_series(date_trunc('month', now()) - interval '5 months', date_trunc('month', now()), interval '1 month') m
     LEFT JOIN laporan l ON date_trunc('month', l.created_at) = m AND ${lingkup}
     GROUP BY m ORDER BY m`,
    arg
  );
  const perSumber = await q(
    `SELECT COALESCE(NULLIF(sumber_dana,''),'Tanpa keterangan') AS label, sum(dana)::bigint AS nilai
     FROM laporan l WHERE dana IS NOT NULL AND ${lingkup} GROUP BY 1 ORDER BY nilai DESC`,
    arg
  );

  return {
    mode: 'staf' as const,
    peran: u.role,
    ringkas,
    kepuasan,
    antrean,
    perStatus: perStatus.map((s: any) => ({ ...s, warna: WARNA_STATUS[s.label] })),
    perKategori,
    perKecamatan,
    tren,
    perSumber
  };
};
