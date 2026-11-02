import { q, one } from '$lib/server/db';

export const load = async () => {
  const ringkas = await one(
    `SELECT count(*)::int AS total,
            count(*) FILTER (WHERE status='Selesai')::int AS selesai,
            COALESCE(round(avg(EXTRACT(EPOCH FROM (updated_at-created_at))/86400) FILTER (WHERE status='Selesai')::numeric,1),0)::float AS rerata_hari,
            COALESCE(sum(dana),0)::bigint AS dana
     FROM laporan`
  );
  const terbaru = await q(
    `SELECT l.kode, l.judul, l.status, l.created_at, k.nama AS kategori, kc.nama AS kecamatan
     FROM laporan l JOIN kategori k ON k.id=l.kategori_id LEFT JOIN kecamatan kc ON kc.id=l.kecamatan_id
     ORDER BY l.created_at DESC LIMIT 6`
  );
  return { ringkas, terbaru };
};
