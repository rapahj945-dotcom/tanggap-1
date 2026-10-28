import { env } from '$env/dynamic/private';
import { q } from './db';

export type Notif = { jenis: 'baru' | 'tugas' | 'status' | 'petugas' | 'nilai'; judul: string; isi?: string; laporan_id: number };
type Klien = { query: (t: string, p?: unknown[]) => Promise<unknown> };

export type Antrean = { uid: number; n: Notif }[];

/** Ubah nomor HP lokal (diawali 0) menjadi format internasional 62. */
export const nomorInternasional = (hp: string) => {
  const d = (hp ?? '').replace(/[^\d]/g, '');
  if (!d) return '';
  if (d.startsWith('62')) return d;
  if (d.startsWith('0')) return '62' + d.slice(1);
  return d;
};

const pesan = (n: Notif) =>
  `[TANGGAP] ${n.judul}\n${n.isi ?? ''}\nBuka laporan: ${(env.ORIGIN ?? 'http://localhost:3000').replace(/\/$/, '')}/app/laporan/${n.laporan_id}`;

/** Akun contoh memakai surel/nomor fiktif; layanan luar hanya dipanggil bila kuncinya diisi. */
async function kirimLuar(uid: number, n: Notif) {
  const adaSurel = !!env.RESEND_API_KEY && !!env.EMAIL_DARI;
  const adaWa = !!env.FONNTE_TOKEN;
  if (!adaSurel && !adaWa) return;
  const u = (await q<{ email: string; no_hp: string }>('SELECT email,no_hp FROM users WHERE id=$1 AND aktif', [uid]))[0];
  if (!u) return;
  const teks = pesan(n);
  const tugas: Promise<unknown>[] = [];
  if (adaSurel && u.email) {
    tugas.push(
      fetch(env.RESEND_API_URL ?? 'https://api.resend.com/emails', {
        method: 'POST',
        headers: { authorization: `Bearer ${env.RESEND_API_KEY}`, 'content-type': 'application/json' },
        body: JSON.stringify({ from: env.EMAIL_DARI, to: [u.email], subject: `[TANGGAP] ${n.judul}`, text: teks })
      }).then((r) => { if (!r.ok) throw new Error(`Resend ${r.status}`); })
    );
  }
  const hp = nomorInternasional(u.no_hp);
  if (adaWa && hp) {
    tugas.push(
      fetch(env.FONNTE_API_URL ?? 'https://api.fonnte.com/send', {
        method: 'POST',
        headers: { authorization: env.FONNTE_TOKEN!, 'content-type': 'application/json' },
        body: JSON.stringify({ target: hp, message: teks })
      }).then((r) => { if (!r.ok) throw new Error(`Fonnte ${r.status}`); })
    );
  }
  // Kegagalan layanan luar hanya dicatat; aksi pengguna tidak boleh gagal karenanya.
  for (const r of await Promise.allSettled(tugas)) if (r.status === 'rejected') console.error('[tanggap] notifikasi luar gagal:', (r.reason as Error).message);
}

/** Teruskan ke surel dan WhatsApp. Panggil SETELAH transaksi basis data berhasil. Tidak pernah melempar galat. */
export function teruskan(antrean: Antrean) {
  for (const { uid, n } of antrean) kirimLuar(uid, n).catch((e) => console.error('[tanggap] notifikasi luar gagal:', e?.message ?? e));
}

/**
 * Simpan notifikasi untuk banyak penerima (satu pesan per orang, pengirim tidak diberi).
 * Dengan `klien` (di dalam transaksi) hasilnya berupa antrean yang harus diteruskan lewat `teruskan()` setelah COMMIT;
 * tanpa `klien` penerusan dilakukan langsung.
 */
export async function kirim(penerima: Map<number, Notif>, pengirimId: number, klien?: Klien): Promise<Antrean> {
  const antrean: Antrean = [];
  for (const [uid, n] of penerima) {
    if (uid === pengirimId) continue;
    const args = [uid, n.jenis, n.judul, n.isi ?? '', n.laporan_id];
    const sql = 'INSERT INTO notifikasi (user_id,jenis,judul,isi,laporan_id) VALUES ($1,$2,$3,$4,$5)';
    if (klien) await klien.query(sql, args);
    else await q(sql, args);
    antrean.push({ uid, n });
  }
  if (!klien) teruskan(antrean);
  return antrean;
}

export const idAdmin = async () => (await q<{ id: number }>(`SELECT id FROM users WHERE role='admin' AND aktif`)).map((r) => r.id);

export const jumlahBelumDibaca = async (uid: number) =>
  Number((await q<{ c: string }>('SELECT count(*) AS c FROM notifikasi WHERE user_id=$1 AND NOT dibaca', [uid]))[0].c);

/** Isi contoh dari data yang ada agar halaman notifikasi tidak kosong saat percobaan. */
export async function seedNotifikasi() {
  if (Number((await q<{ c: string }>('SELECT count(*) AS c FROM notifikasi'))[0].c) > 0) return;
  const ls = await q<any>('SELECT id,kode,judul,status,pelapor_id,petugas_id,created_at,updated_at FROM laporan ORDER BY created_at DESC');
  const ins = (u: number, jenis: string, judul: string, isi: string, l: number, dibaca: boolean, at: string) =>
    q('INSERT INTO notifikasi (user_id,jenis,judul,isi,laporan_id,dibaca,created_at) VALUES ($1,$2,$3,$4,$5,$6,$7)', [u, jenis, judul, isi, l, dibaca, at]);
  const adm = await idAdmin();
  let i = 0;
  for (const l of ls.slice(0, 12)) {
    for (const a of adm) await ins(a, 'baru', 'Laporan baru masuk', `${l.kode} · ${l.judul}`, l.id, i++ > 3, l.created_at);
    if (l.status !== 'Diterima') await ins(l.pelapor_id, 'status', `Status laporan Anda: ${l.status}`, `${l.kode} · ${l.judul}`, l.id, i % 3 === 0, l.updated_at);
    if (l.petugas_id) await ins(l.petugas_id, 'tugas', 'Tugas baru untuk Anda', `${l.kode} · ${l.judul}`, l.id, i % 2 === 0, l.updated_at);
  }
}
