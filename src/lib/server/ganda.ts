import { q } from './db';

export const JARAK_MAKS_M = 150;
export const AMBANG_JACCARD = 0.34;
export const HARI_MAKS = 30;
export const MAKS_TAMPIL = 3;

export type Serupa = { id: number; kode: string; judul: string; alamat: string; status: string; jarak: number | null };

/** Jarak dua titik (meter) dengan rumus haversine. */
export function jarakMeter(a: [number, number], b: [number, number]) {
  const r = (d: number) => (d * Math.PI) / 180;
  const h = Math.sin(r(b[0] - a[0]) / 2) ** 2 + Math.cos(r(a[0])) * Math.cos(r(b[0])) * Math.sin(r(b[1] - a[1]) / 2) ** 2;
  return 2 * 6371000 * Math.asin(Math.sqrt(h));
}

const kata = (t: string) =>
  new Set(t.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').split(/\s+/).filter((k) => k.length > 2));

/** Koefisien Jaccard antara dua teks (0 sampai 1). */
export function jaccard(a: string, b: string) {
  const x = kata(a), y = kata(b);
  if (!x.size || !y.size) return 0;
  let irisan = 0;
  for (const k of x) if (y.has(k)) irisan++;
  return irisan / (x.size + y.size - irisan);
}

/**
 * Cari laporan aktif (belum Selesai/Ditolak) dalam 30 hari terakhir dengan jenis masalah yang sama.
 * Mirip bila (a) keduanya punya koordinat dan jaraknya <= 150 m, atau
 * (b) satu kelurahan dan kemiripan kata judul+alamat >= 0,34.
 */
export async function cariSerupa(v: { kategori_id: number; desa_id: number | null; judul: string; alamat: string; lat: number | null; lng: number | null }): Promise<Serupa[]> {
  const kandidat = await q<any>(
    `SELECT id,kode,judul,alamat,status,lat,lng,desa_id FROM laporan
     WHERE kategori_id=$1 AND status NOT IN ('Selesai','Ditolak') AND created_at >= now() - ($2 || ' days')::interval`,
    [v.kategori_id, String(HARI_MAKS)]
  );
  const hasil: Serupa[] = [];
  for (const k of kandidat) {
    const punyaTitik = v.lat != null && v.lng != null && k.lat != null && k.lng != null;
    const jarak = punyaTitik ? jarakMeter([v.lat!, v.lng!], [k.lat, k.lng]) : null;
    const dekat = jarak != null && jarak <= JARAK_MAKS_M;
    const sama = v.desa_id != null && k.desa_id === v.desa_id && jaccard(`${v.judul} ${v.alamat}`, `${k.judul} ${k.alamat}`) >= AMBANG_JACCARD;
    if (dekat || sama) hasil.push({ id: k.id, kode: k.kode, judul: k.judul, alamat: k.alamat, status: k.status, jarak: jarak == null ? null : Math.round(jarak) });
  }
  hasil.sort((a, b) => (a.jarak ?? 1e9) - (b.jarak ?? 1e9));
  return hasil.slice(0, MAKS_TAMPIL);
}
