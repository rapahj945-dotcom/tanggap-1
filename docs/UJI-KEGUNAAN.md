# Panduan Uji Kegunaan TANGGAP

> Dokumen ini adalah **panduan**. Pengujian belum dilaksanakan; kolom hasil di bawah sengaja dikosongkan
> dan baru diisi dari sesi nyata. Jangan mengisinya dengan perkiraan.

## Tujuan
Mengetahui apakah warga dan petugas dapat menyelesaikan tugas inti tanpa bantuan, dan menemukan hambatan sebelum dipakai lebih luas.

## Peserta
Minimal 5 warga dan 3 petugas lapangan (atau yang setara). Sesi individual sekitar 20 menit, memakai ponsel milik peserta bila memungkinkan.
Catat: usia, pengalaman memakai aplikasi pengaduan, jenis ponsel. Minta persetujuan lisan/tertulis sebelum mencatat atau merekam.

## Persiapan
1. Jalankan aplikasi dengan data contoh (`docker compose up --build`), buka lewat tautan yang dapat diakses ponsel peserta.
2. Pastikan `RESEND_API_KEY`/`FONNTE_TOKEN` **kosong** agar tidak ada pesan terkirim ke nomor fiktif.
3. Siapkan satu laporan aktif di dekat titik uji agar peringatan laporan ganda dapat diamati.
4. Siapkan pencatat waktu dan lembar catatan (tabel di bawah).

## Skrip singkat untuk fasilitator
"Kami menguji aplikasinya, bukan Anda. Tidak ada jawaban salah. Mohon ucapkan keras-keras apa yang Anda pikirkan. Saya tidak akan membantu kecuali Anda meminta."

## Tugas warga
| # | Tugas | Dianggap berhasil bila |
|---|---|---|
| W1 | Membuat laporan lengkap (jenis, uraian, foto, titik peta) | Laporan terkirim dan kode laporan terlihat |
| W2 | Menanggapi peringatan laporan serupa | Peserta memilih memantau laporan lama atau "tetap kirim" dengan sadar |
| W3 | Melacak laporan memakai nomor tanpa masuk | Halaman status terbuka |
| W4 | Menilai laporan yang sudah Selesai | Nilai tersimpan |
| W5 | Memasang aplikasi ke layar utama, lalu membukanya saat offline | Aplikasi terpasang dan halaman yang pernah dibuka tampil |

## Tugas petugas
| # | Tugas | Dianggap berhasil bila |
|---|---|---|
| P1 | Menemukan tugas hari ini dan lokasinya di peta | Detail dan peta tugas terbuka |
| P2 | Mengubah status ke Survei lalu Perbaikan | Status berubah |
| P3 | Mengunggah foto sesudah dan mencatat dana serta sumber dana | Tersimpan dan tampil di detail |
| P4 | Membuka daftar tugas saat sinyal hilang | Salinan terakhir tampil beserta spanduk offline |

## Yang dicatat per tugas
| Peserta | Tugas | Berhasil (ya/sebagian/tidak) | Waktu (detik) | Jumlah kesalahan | Catatan/kutipan |
|---|---|---|---|---|---|
| | | | | | |

## Kuesioner SUS (isi setelah semua tugas)
Skala 1 (sangat tidak setuju) sampai 5 (sangat setuju).

1. Saya rasa saya akan sering memakai aplikasi ini.
2. Saya menemukan aplikasi ini terlalu rumit tanpa alasan.
3. Saya rasa aplikasi ini mudah dipakai.
4. Saya rasa saya akan butuh bantuan orang teknis untuk memakai aplikasi ini.
5. Saya menemukan berbagai fungsi dalam aplikasi ini terpadu dengan baik.
6. Saya rasa terlalu banyak ketidakkonsistenan dalam aplikasi ini.
7. Saya membayangkan kebanyakan orang akan cepat belajar memakai aplikasi ini.
8. Saya menemukan aplikasi ini sangat membingungkan.
9. Saya merasa sangat percaya diri memakai aplikasi ini.
10. Saya perlu belajar banyak hal sebelum bisa memakai aplikasi ini.

**Cara menghitung:** butir ganjil: skor − 1; butir genap: 5 − skor. Jumlahkan kesepuluh butir, kalikan 2,5 → skor 0 sampai 100 per peserta.
Rata-rata semua peserta dibandingkan ambang **68**.

| Peserta | B1 | B2 | B3 | B4 | B5 | B6 | B7 | B8 | B9 | B10 | Skor SUS |
|---|---|---|---|---|---|---|---|---|---|---|---|
| | | | | | | | | | | | |

## Setelah sesi
1. Kelompokkan masalah menurut keparahan: **kritis** (tugas gagal), **berat** (berhasil dengan kesulitan besar), **ringan** (mengganggu saja).
2. Perbaiki yang kritis dan berat lebih dulu, lalu uji ulang tugas terkait.
3. Ringkas hasil (jumlah peserta, tingkat keberhasilan, waktu rata-rata, skor SUS rata-rata, temuan utama) dan masukkan ke Subbab 3.1 proposal sebagai data primer.

## Hasil
*(Belum ada. Isi setelah pengujian dilaksanakan.)*
