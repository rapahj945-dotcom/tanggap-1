# TANGGAP

Platform web pengaduan dan pelacakan penanganan masalah fasilitas umum.
Karya Tim Icikiwir untuk Web In Action (WIA), Multimedia In Action (MIA) 2026.
Tema: *Designing Digital Futures* · Sub tema: *Civic Reporting & Accountability*.

Warga melapor (jenis masalah, uraian, foto, titik peta) dan mendapat nomor laporan, misalnya `TGP-261110-0001`.
Siapa pun dapat melacak laporan di `/lacak/[kode]` tanpa masuk. Administrator memverifikasi dan menugaskan,
petugas menangani dan mencatat dana serta foto sesudah, lalu warga menilai.

## Tech stack
Svelte 5 + SvelteKit 2 · Framework7 9 (antarmuka mobile) · Leaflet 1.9 · TypeScript 5 + Vite 6 ·
Node.js (adapter-node) · PostgreSQL 16 · bcryptjs · Resend (surel) · Fonnte (WhatsApp) · Docker Compose.

## Menjalankan
```bash
cp .env.example .env
docker compose up --build
```
Aplikasi tersedia di <http://localhost:3000>. Basis data dan data contoh dibuat otomatis saat pertama dijalankan.
Alternatif: `scripts/termux.sh` untuk ponsel Android, atau `npm install && npm run dev` (butuh PostgreSQL, lihat `DATABASE_URL`).

Akun contoh (aktif bila `TAMPILKAN_AKUN_CONTOH=true`) ditampilkan di halaman masuk.

## Variabel lingkungan
| Variabel | Fungsi |
|---|---|
| `POSTGRES_PASSWORD`, `DATABASE_URL` | Koneksi basis data |
| `ORIGIN`, `PORT` | Alamat dasar (dipakai pada tautan di surel/WhatsApp dan ekspor) dan port |
| `TAMPILKAN_AKUN_CONTOH` | `false` di produksi |
| `RESEND_API_KEY`, `EMAIL_DARI` | Mengaktifkan notifikasi surel |
| `FONNTE_TOKEN` | Mengaktifkan notifikasi WhatsApp |
| `RESEND_API_URL`, `FONNTE_API_URL` | (opsional) alamat API pengganti, mis. server tiruan untuk uji |

## Fitur dan status
| Fitur | Status |
|---|---|
| Laporan + foto (maks 5 MB) + peta, nomor laporan, halaman lacak publik | Selesai |
| Tiga peran, status enam tahap + Ditolak, riwayat, dana, foto sesudah, penilaian | Selesai |
| Dasbor, peta sebaran, filter, ekspor CSV | Selesai |
| Notifikasi di aplikasi | Selesai |
| Notifikasi surel (Resend) dan WhatsApp (Fonnte) | Selesai; aktif bila kunci API diisi |
| Ekspor format SP4N-LAPOR! (CSV/JSON, admin) | Selesai sebagai berkas; **bukan** sambungan API |
| PWA: manifest, ikon, service worker, halaman offline, spanduk, tombol pasang | Selesai; butuh HTTPS di produksi |
| Peringatan laporan ganda (150 m / Jaccard 0,34, 30 hari) | Selesai |
| Uji kegunaan dengan pengguna nyata | Belum dilaksanakan, panduan di `docs/UJI-KEGUNAAN.md` |
| Antrean unggah offline, push notification, API langsung SP4N-LAPOR! | Belum (rencana) |

## Batasan
Peta hanya Jabodetabek · foto JPG/PNG/WebP maks 5 MB · kirim laporan dan ubah status butuh internet ·
penugasan petugas manual · antarmuka hanya berbahasa Indonesia · data pada prototipe adalah data contoh.

## Catatan produksi
Gunakan HTTPS, setel `TAMPILKAN_AKUN_CONTOH=false`, isi kunci API hanya untuk pengguna sungguhan,
dan lakukan audit keamanan (pembatasan percobaan masuk, persetujuan penggunaan nomor HP untuk WhatsApp).
