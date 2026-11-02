import { error } from '@sveltejs/kit';
import { one, q } from '$lib/server/db';

export const load = async ({ params }) => {
  const l = await one(
    `SELECT l.id,l.kode,l.judul,l.uraian,l.alamat,l.status,l.foto,l.foto_sesudah,l.dana,l.sumber_dana,l.created_at,l.updated_at,
            k.nama AS kategori, kc.nama AS kecamatan, d.nama AS desa, p.nama AS petugas
     FROM laporan l JOIN kategori k ON k.id=l.kategori_id
     LEFT JOIN kecamatan kc ON kc.id=l.kecamatan_id LEFT JOIN desa d ON d.id=l.desa_id
     LEFT JOIN users p ON p.id=l.petugas_id WHERE l.kode=$1`,
    [params.kode.toUpperCase()]
  );
  if (!l) error(404, 'Nomor laporan tidak ditemukan');
  const riwayat = await q('SELECT status,catatan,oleh,created_at FROM riwayat WHERE laporan_id=$1 ORDER BY created_at,id', [l.id]);
  return { l, riwayat };
};
