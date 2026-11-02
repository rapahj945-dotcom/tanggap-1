import { error } from '@sveltejs/kit';
import { q } from '$lib/server/db';
import { lingkupLaporan } from '$lib/server/akses';

const esc = (v: unknown) => {
  let s = v == null ? '' : v instanceof Date ? v.toISOString() : String(v);
  // cegah injeksi rumus saat dibuka di Excel/Sheets
  if (/^[=+\-@\t\r]/.test(s)) s = "'" + s;
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};

export const GET = async ({ locals, url }) => {
  const u = locals.user!;
  if (u.role === 'warga') error(403, 'Khusus petugas dan administrator');
  const where = [lingkupLaporan(u)];
  const args: unknown[] = [u.id];
  const status = url.searchParams.get('status');
  if (status) { args.push(status); where.push(`l.status=$${args.length}`); }
  const kat = url.searchParams.get('kategori');
  if (kat && /^\d+$/.test(kat)) { args.push(Number(kat)); where.push(`l.kategori_id=$${args.length}`); }
  const kec = url.searchParams.get('kecamatan');
  if (kec && /^\d+$/.test(kec)) { args.push(Number(kec)); where.push(`l.kecamatan_id=$${args.length}`); }

  const rows = await q(
    `SELECT l.kode,l.judul,k.nama AS kategori,kc.nama AS kecamatan,d.nama AS desa,l.alamat,l.status,pt.nama AS petugas,l.dana,l.sumber_dana,l.created_at,l.updated_at
     FROM laporan l JOIN kategori k ON k.id=l.kategori_id LEFT JOIN kecamatan kc ON kc.id=l.kecamatan_id
     LEFT JOIN desa d ON d.id=l.desa_id LEFT JOIN users pt ON pt.id=l.petugas_id
     WHERE ${where.join(' AND ')} ORDER BY l.created_at DESC`,
    args
  );
  const kolom = ['kode', 'judul', 'kategori', 'kecamatan', 'desa', 'alamat', 'status', 'petugas', 'dana', 'sumber_dana', 'created_at', 'updated_at'];
  const csv = '\uFEFF' + [kolom.join(','), ...rows.map((r: any) => kolom.map((k) => esc(r[k])).join(','))].join('\r\n');
  return new Response(csv, {
    headers: { 'content-type': 'text/csv; charset=utf-8', 'content-disposition': `attachment; filename="laporan-tanggap-${new Date().toISOString().slice(0, 10)}.csv"` }
  });
};
