#!/data/data/com.termux/files/usr/bin/bash
# TANGGAP di Termux: install dependensi, siapkan PostgreSQL lokal, jalankan app.
# Bisa diulang kapan saja; langkah yang sudah selesai akan dilewati.
set -e

DATA="$PREFIX/var/lib/postgres"
DB_USER="tanggap"
DB_PASS="tanggap"   # sama dengan fallback default di src/lib/server/db.ts

# 1. Paket basis
pkg update -y || true
pkg install -y nodejs-lts postgresql || exit 1

# 2. Inisialisasi cluster PostgreSQL (sekali)
if [ ! -f "$DATA/PG_VERSION" ]; then
  mkdir -p "$DATA"
  initdb -D "$DATA" -U "$DB_USER" --pwfile=<(echo "$DB_PASS")
fi

# 3. Jalankan server PostgreSQL (abaikan jika sudah jalan)
pg_ctl -D "$DATA" -l "$PREFIX/tmp/postgres.log" start || true

# 4. Buat database app (idempoten)
psql -U "$DB_USER" -d postgres -tc "SELECT 1 FROM pg_database WHERE datname='tanggap'" | grep -q 1 \
  || createdb -U "$DB_USER" tanggap

# 5. Dependensi Node
npm install

# 6. Jalankan (skema tabel & data contoh dibuat otomatis saat request pertama)
echo ""
echo "=== TANGGAP siap dijalankan ==="
echo "Mulai:   npm run dev -- --host --port 3000"
echo "Buka:    http://localhost:3000 (login admin: admin@tanggap.id / admin123)"
echo "DB log:  $PREFIX/tmp/postgres.log"
echo ""
npm run dev -- --host --port 3000
