import bcrypt from 'bcryptjs';
import { pool, q, one } from './db';
import { buatKode } from './laporan';

const KATEGORI = [
  ['Jalan rusak', 'Lubang, retak, atau amblas di badan jalan', '#C8501E'],
  ['Lampu jalan', 'Penerangan jalan umum mati atau rusak', '#B58900'],
  ['Sampah', 'Tumpukan liar, TPS meluap, belum terangkut', '#4C7A34'],
  ['Banjir', 'Genangan tinggi atau luapan sungai', '#1F6F9C'],
  ['Keamanan', 'Titik rawan kriminal di fasilitas umum', '#6B4C9A'],
  ['Pohon tumbang', 'Pohon miring atau tumbang menutup jalan', '#2E7D6B']
];

// Jabodetabek: kecamatan diberi nama kota agar jelas di filter dan formulir.
const WILAYAH: Record<string, string[]> = {
  'Menteng (Jakarta Pusat)': ['Menteng', 'Pegangsaan', 'Kebon Sirih'],
  'Kebayoran Baru (Jakarta Selatan)': ['Senayan', 'Gandaria Utara', 'Melawai'],
  'Cengkareng (Jakarta Barat)': ['Kapuk', 'Duri Kosambi', 'Rawa Buaya'],
  'Bogor Tengah (Kota Bogor)': ['Pabaton', 'Babakan Pasar', 'Panaragan'],
  'Beji (Kota Depok)': ['Beji', 'Kemiri Muka', 'Pondok Cina'],
  'Ciputat (Tangerang Selatan)': ['Ciputat', 'Sawah Baru', 'Serua'],
  'Tangerang (Kota Tangerang)': ['Sukarasa', 'Cikokol', 'Babakan'],
  'Bekasi Selatan (Kota Bekasi)': ['Kayuringin Jaya', 'Pekayon Jaya', 'Margajaya']
};

const AKUN: [string, string, string, string, string][] = [
  ['Admin TANGGAP', 'admin@tanggap.id', '0811000001', 'admin', 'admin123'],
  ['Ahmad Subagja', 'ahmad@tanggap.id', '0811000002', 'petugas', 'petugas123'],
  ['Deni Kurniawan', 'deni@tanggap.id', '0811000003', 'petugas', 'petugas123'],
  ['Siti Rahmawati', 'siti@contoh.id', '0811000004', 'warga', 'warga123'],
  ['Rizky Pratama', 'rizky@contoh.id', '0811000005', 'warga', 'warga123']
];

export async function seedIfEmpty() {
  const jum = async (t: string) => Number((await one<{ c: string }>(`SELECT count(*) AS c FROM ${t}`))!.c);

  // Tiap bagian diperiksa sendiri-sendiri agar seed yang terpotong di tengah
  // (mis. koneksi terputus) bisa dilanjutkan, bukan berhenti selamanya.
  if ((await jum('users')) === 0) {
    for (const [nama, email, hp, role, pw] of AKUN) {
      await q('INSERT INTO users (nama,email,no_hp,role,password) VALUES ($1,$2,$3,$4,$5) ON CONFLICT (email) DO NOTHING', [
        nama, email, hp, role, await bcrypt.hash(pw, 10)
      ]);
    }
  }
  if ((await jum('kategori')) === 0) {
    for (const [nama, deskripsi, warna] of KATEGORI) {
      await q('INSERT INTO kategori (nama,deskripsi,warna) VALUES ($1,$2,$3) ON CONFLICT (nama) DO NOTHING', [nama, deskripsi, warna]);
    }
  }
  if ((await jum('kecamatan')) < Object.keys(WILAYAH).length) {
    for (const [kec, desa] of Object.entries(WILAYAH)) {
      const sudah = await one<{ id: number }>('SELECT id FROM kecamatan WHERE nama = $1', [kec]);
      const id = sudah?.id ?? (await one<{ id: number }>('INSERT INTO kecamatan (nama) VALUES ($1) ON CONFLICT (nama) DO NOTHING RETURNING id', [kec]))?.id
        ?? (await one<{ id: number }>('SELECT id FROM kecamatan WHERE nama = $1', [kec]))!.id;
      for (const d of desa) await q('INSERT INTO desa (kecamatan_id,nama) VALUES ($1,$2) ON CONFLICT (kecamatan_id,nama) DO NOTHING', [id, d]);
    }
  }
  if ((await jum('laporan')) > 0) return;

  const users = await q<{ id: number; email: string; nama: string }>('SELECT id,email,nama FROM users');
  const uid = (e: string) => users.find((u) => u.email === e)!;
  const siti = uid('siti@contoh.id'), rizky = uid('rizky@contoh.id');
  const ahmad = uid('ahmad@tanggap.id'), deni = uid('deni@tanggap.id');

  type S = [string, number, number, number, string, string, string, number, number, string, string | null, number | null, string | null, number];
  // pelapor, kategori, kecamatan, desa, judul, uraian, alamat, lat, lng, status, petugas, dana, sumber, hariLalu
  // kecamatan 1-8, kelurahan = (kec-1)*3 + 1..3
  const contoh = [
    [siti.id, 1, 5, 14, 'Lubang besar di depan pasar', 'Lubang selebar satu meter di jalur motor, sudah dua pengendara jatuh minggu ini.', 'Jl. Margonda Raya, depan Pasar Kemiri', -6.3735, 106.8335, 'Perbaikan', ahmad.id, 12500000, 'APBD Kota Depok', 9],
    [rizky.id, 2, 2, 6, 'Tiga lampu jalan padam', 'Ruas jalan gelap total sejak dua minggu lalu, rawan kecelakaan malam hari.', 'Jl. Wolter Monginsidi, Melawai', -6.2447, 106.8002, 'Survei', deni.id, null, null, 6],
    [siti.id, 3, 8, 22, 'TPS meluap sampai badan jalan', 'Sampah belum diangkut lima hari dan mulai berbau.', 'TPS Kayuringin, Jl. Ahmad Yani', -6.2570, 106.9998, 'Selesai', deni.id, 3200000, 'Dinas Lingkungan Hidup', 20],
    [rizky.id, 4, 3, 7, 'Genangan setinggi lutut setelah hujan', 'Saluran tersumbat, air baru surut setelah enam jam.', 'Jl. Kapuk Raya, Kapuk', -6.1355, 106.7440, 'Ditangani', ahmad.id, null, null, 3],
    [siti.id, 6, 4, 10, 'Pohon angsana miring ke arah rumah', 'Akar terangkat setelah angin kencang, dahan menjorok ke kabel listrik.', 'Jl. Pajajaran, dekat Kebun Raya', -6.6000, 106.7990, 'Diverifikasi', null, null, null, 2],
    [rizky.id, 1, 6, 16, 'Aspal mengelupas sepanjang 50 meter', 'Jalan lingkungan berubah jadi kerikil lepas.', 'Jl. Ir. H. Juanda, Ciputat', -6.3165, 106.7433, 'Diterima', null, null, null, 0],
    [siti.id, 5, 1, 1, 'Area parkir gelap sering ada kehilangan motor', 'Warga minta penerangan dan patroli.', 'Parkiran Taman Suropati, Menteng', -6.1979, 106.8334, 'Ditolak', null, null, null, 14],
    [rizky.id, 1, 7, 20, 'Jalan amblas dekat pintu air', 'Badan jalan turun sekitar 20 cm, motor sering oleng.', 'Jl. KH Hasyim Ashari, Cikokol', -6.1850, 106.6250, 'Diverifikasi', null, null, null, 1],
    [siti.id, 2, 1, 3, 'Lampu PJU mati sepanjang jalan', 'Delapan tiang tidak menyala sejak awal pekan.', 'Jl. Cikini Raya', -6.1900, 106.8400, 'Diterima', null, null, null, 1],
    [rizky.id, 4, 5, 14, 'Luapan kali di permukiman bantaran', 'Air kali naik setiap hujan deras, tiga RT terdampak.', 'Bantaran Kali Ciliwung, Kemiri Muka', -6.3790, 106.8420, 'Perbaikan', deni.id, 8500000, 'BPBD Kota Depok', 11],
    [siti.id, 3, 3, 8, 'Sampah liar menumpuk di tepi kali', 'Tumpukan sampah rumah tangga menutup separuh saluran.', 'Tepi Kali Angke, Duri Kosambi', -6.1650, 106.7250, 'Survei', ahmad.id, null, null, 5],
    [rizky.id, 6, 8, 23, 'Pohon tumbang menutup jalan', 'Pohon tumbang saat hujan angin, jalan tidak bisa dilewati mobil.', 'Jl. Pekayon Raya, Pekayon Jaya', -6.2700, 106.9800, 'Selesai', ahmad.id, 1800000, 'BPBD Kota Bekasi', 17]
  ] as unknown as S[];

  const urutan: Record<string, string[]> = {
    Diterima: ['Diterima'],
    Diverifikasi: ['Diterima', 'Diverifikasi'],
    Ditangani: ['Diterima', 'Diverifikasi', 'Ditangani'],
    Survei: ['Diterima', 'Diverifikasi', 'Ditangani', 'Survei'],
    Perbaikan: ['Diterima', 'Diverifikasi', 'Ditangani', 'Survei', 'Perbaikan'],
    Selesai: ['Diterima', 'Diverifikasi', 'Ditangani', 'Survei', 'Perbaikan', 'Selesai'],
    Ditolak: ['Diterima', 'Ditolak']
  };

  for (const [pel, kat, kec, des, judul, uraian, alamat, lat, lng, status, pet, dana, sumber, hari] of contoh) {
    const dibuat = new Date(Date.now() - hari * 86400000);
    const kode = await buatKode(dibuat);
    const r = await one<{ id: number }>(
      `INSERT INTO laporan (kode,pelapor_id,kategori_id,kecamatan_id,desa_id,judul,uraian,alamat,lat,lng,status,petugas_id,dana,sumber_dana,created_at,updated_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$15) RETURNING id`,
      [kode, pel, kat, kec, des, judul, uraian, alamat, lat, lng, status, pet, dana, sumber, dibuat]
    );
    const langkah = urutan[status];
    for (let i = 0; i < langkah.length; i++) {
      const t = new Date(dibuat.getTime() + i * 86400000 * Math.max(1, hari / langkah.length));
      await q(
        'INSERT INTO riwayat (laporan_id,status,catatan,oleh,peran,created_at) VALUES ($1,$2,$3,$4,$5,$6)',
        [r!.id, langkah[i], i === 0 ? 'Laporan masuk.' : '', i === 0 ? 'Sistem' : 'Admin TANGGAP', i === 0 ? 'warga' : 'admin', t]
      );
    }
  }
  // tanggal pembaruan terakhir = waktu riwayat terakhir, supaya "rata-rata hari sampai selesai" masuk akal
  await q(`UPDATE laporan l SET updated_at = (SELECT max(created_at) FROM riwayat r WHERE r.laporan_id = l.id)`);
  await q(
    `INSERT INTO penilaian (laporan_id,user_id,nilai,komentar) SELECT id, pelapor_id, 5, 'Cepat ditangani, terima kasih.' FROM laporan WHERE status='Selesai' LIMIT 1`
  );
  console.log('[tanggap] database kosong, data contoh dimuat');
}
