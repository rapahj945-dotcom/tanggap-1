CREATE TABLE IF NOT EXISTS users (
  id          SERIAL PRIMARY KEY,
  nama        TEXT NOT NULL,
  email       TEXT NOT NULL UNIQUE,
  no_hp       TEXT NOT NULL DEFAULT '',
  password    TEXT NOT NULL,
  role        TEXT NOT NULL CHECK (role IN ('admin','petugas','warga')),
  aktif       BOOLEAN NOT NULL DEFAULT TRUE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS sessions (
  id          TEXT PRIMARY KEY,
  user_id     INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  expires_at  TIMESTAMPTZ NOT NULL
);

CREATE TABLE IF NOT EXISTS kategori (
  id         SERIAL PRIMARY KEY,
  nama       TEXT NOT NULL UNIQUE,
  deskripsi  TEXT NOT NULL DEFAULT '',
  warna      TEXT NOT NULL DEFAULT '#1B1F23'
);

CREATE TABLE IF NOT EXISTS kecamatan (
  id    SERIAL PRIMARY KEY,
  nama  TEXT NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS desa (
  id            SERIAL PRIMARY KEY,
  kecamatan_id  INT NOT NULL REFERENCES kecamatan(id) ON DELETE CASCADE,
  nama          TEXT NOT NULL,
  UNIQUE (kecamatan_id, nama)
);

CREATE TABLE IF NOT EXISTS laporan (
  id            SERIAL PRIMARY KEY,
  kode          TEXT NOT NULL UNIQUE,
  pelapor_id    INT NOT NULL REFERENCES users(id),
  kategori_id   INT NOT NULL REFERENCES kategori(id),
  kecamatan_id  INT REFERENCES kecamatan(id),
  desa_id       INT REFERENCES desa(id),
  judul         TEXT NOT NULL,
  uraian        TEXT NOT NULL,
  alamat        TEXT NOT NULL DEFAULT '',
  lat           DOUBLE PRECISION,
  lng           DOUBLE PRECISION,
  foto          TEXT,
  foto_sesudah  TEXT,
  status        TEXT NOT NULL DEFAULT 'Diterima'
                CHECK (status IN ('Diterima','Diverifikasi','Ditangani','Survei','Perbaikan','Selesai','Ditolak')),
  petugas_id    INT REFERENCES users(id),
  dana          BIGINT,
  sumber_dana   TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS laporan_status_idx ON laporan(status);
CREATE INDEX IF NOT EXISTS laporan_pelapor_idx ON laporan(pelapor_id);
CREATE INDEX IF NOT EXISTS laporan_petugas_idx ON laporan(petugas_id);

CREATE TABLE IF NOT EXISTS riwayat (
  id          SERIAL PRIMARY KEY,
  laporan_id  INT NOT NULL REFERENCES laporan(id) ON DELETE CASCADE,
  status      TEXT NOT NULL,
  catatan     TEXT NOT NULL DEFAULT '',
  oleh        TEXT NOT NULL,
  peran       TEXT NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS riwayat_laporan_idx ON riwayat(laporan_id);

CREATE TABLE IF NOT EXISTS penilaian (
  laporan_id  INT PRIMARY KEY REFERENCES laporan(id) ON DELETE CASCADE,
  user_id     INT NOT NULL REFERENCES users(id),
  nilai       INT NOT NULL CHECK (nilai BETWEEN 1 AND 5),
  komentar    TEXT NOT NULL DEFAULT '',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS notifikasi (
  id          SERIAL PRIMARY KEY,
  user_id     INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  jenis       TEXT NOT NULL DEFAULT 'info',
  judul       TEXT NOT NULL,
  isi         TEXT NOT NULL DEFAULT '',
  laporan_id  INT REFERENCES laporan(id) ON DELETE CASCADE,
  dibaca      BOOLEAN NOT NULL DEFAULT FALSE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS notifikasi_user_idx ON notifikasi(user_id, dibaca, created_at DESC);
