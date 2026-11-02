import { error } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';
import { q } from '$lib/server/db';

/** Usulan instansi tujuan per kategori. Administrator tetap perlu memeriksanya sebelum meneruskan. */
const INSTANSI: Record<string, string> = {
  'Jalan rusak': 'Dinas Pekerjaan Umum dan Bina Marga',
  'Lampu jalan': 'Dinas Perhubungan / Penerangan Jalan Umum',
  Sampah: 'Dinas Lingkungan Hidup',
  Banjir: 'Dinas Sumber Daya Air / BPBD',
  Keamanan: 'Satuan Polisi Pamong Praja / Kepolisian setempat',
  'Pohon tumbang': 'Dinas Pertamanan dan Kehutanan / BPBD'
};

const KOLOM = ['judul_laporan', 'isi_laporan', 'tanggal_kejadian', 'lokasi_kejadian', 'kategori_laporan', 'instansi_tujuan', 'lampiran', 'anonim', 'rahasia', 'kode_tanggap', 'status_tanggap'] as const;

const esc = (v: unknown) => {
  let s = v == null ? '' : String(v);
  if (/^[=+\-@\t\r]/.test(s)) s = "'" + s; // cegah injeksi rumus di Excel/Sheets
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};

export const GET = async ({ locals, url }) => {
  if (locals.user!.role !== 'admin') error(403, 'Khusus administrator');
  const origin = (env.ORIGIN ?? url.origin).replace(/\/$/, '');
  const where: string[] = [];
  const args: unknown[] = [];
  const status = url.searchParams.get('status');
  if (status) { args.push(status); where.push(`l.status=$${args.length}`); }
  else where.push(`l.status <> 'Ditolak'`); // Ditolak tidak diikutkan kecuali difilter
  const kat = url.searchParams.get('kategori');
  if (kat && /^\d+$/.test(kat)) { args.push(Number(kat)); where.push(`l.kategori_id=$${args.length}`); }
  const kec = url.searchParams.get('kecamatan');
  if (kec && /^\d+$/.test(kec)) { args.push(Number(kec)); where.push(`l.kecamatan_id=$${args.length}`); }

  const rows = await q<any>(
    `SELECT l.kode,l.judul,l.uraian,l.alamat,l.lat,l.lng,l.foto,l.status,l.created_at,k.nama AS kategori,kc.nama AS kecamatan,d.nama AS desa
     FROM laporan l JOIN kategori k ON k.id=l.kategori_id LEFT JOIN kecamatan kc ON kc.id=l.kecamatan_id LEFT JOIN desa d ON d.id=l.desa_id
     WHERE ${where.join(' AND ')} ORDER BY l.created_at DESC`,
    args
  );

  const data = rows.map((r) => {
    const lokasi = [r.alamat, r.desa && `Kel. ${r.desa}`, r.kecamatan && `Kec. ${r.kecamatan}`, r.lat != null && r.lng != null ? `(${r.lat}, ${r.lng})` : ''].filter(Boolean).join(', ');
    return {
      judul_laporan: r.judul,
      isi_laporan: `${r.uraian}\n\nRujukan TANGGAP: ${r.kode} — ${origin}/lacak/${r.kode}`,
      tanggal_kejadian: new Date(r.created_at).toISOString().slice(0, 10),
      lokasi_kejadian: lokasi,
      kategori_laporan: r.kategori,
      instansi_tujuan: INSTANSI[r.kategori] ?? '',
      lampiran: r.foto ? `${origin}/berkas/${r.foto}` : '',
      anonim: 'Tidak',
      rahasia: 'Tidak',
      kode_tanggap: r.kode,
      status_tanggap: r.status
    };
  });

  const tgl = new Date().toISOString().slice(0, 10);
  if (url.searchParams.get('format') === 'json') {
    return new Response(JSON.stringify(data, null, 2), {
      headers: { 'content-type': 'application/json; charset=utf-8', 'content-disposition': `attachment; filename="sp4n-lapor-${tgl}.json"` }
    });
  }
  const csv = '\uFEFF' + [KOLOM.join(','), ...data.map((d) => KOLOM.map((k) => esc(d[k])).join(','))].join('\r\n');
  return new Response(csv, {
    headers: { 'content-type': 'text/csv; charset=utf-8', 'content-disposition': `attachment; filename="sp4n-lapor-${tgl}.csv"` }
  });
};
