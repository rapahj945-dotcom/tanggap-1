import { error } from '@sveltejs/kit';
import { q } from '$lib/server/db';
import { lingkupLaporan } from '$lib/server/akses';
import { WARNA_STATUS } from '$lib/format';

export const load = async ({ locals }) => {
  const u = locals.user!;
  if (u.role === 'warga') error(403, 'Peta sebaran khusus petugas dan administrator');
  const rows = await q(
    `SELECT l.id,l.kode,l.judul,l.lat,l.lng,l.status,l.created_at,k.nama AS kategori,kc.nama AS kecamatan FROM laporan l JOIN kategori k ON k.id=l.kategori_id LEFT JOIN kecamatan kc ON kc.id=l.kecamatan_id WHERE l.lat IS NOT NULL AND l.lng IS NOT NULL AND ${lingkupLaporan(u)}`,
    [u.id]
  );
  return { titik: rows.map((r: any) => ({ ...r, warna: WARNA_STATUS[r.status] })), user: u };
};
