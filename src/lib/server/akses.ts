import type { SessionUser } from './auth';

/** Potongan WHERE sesuai peran. Parameter pertama selalu id pengguna. */
export function lingkupLaporan(u: SessionUser, alias = 'l') {
  if (u.role === 'warga') return `${alias}.pelapor_id = $1`;
  if (u.role === 'petugas') return `${alias}.petugas_id = $1`;
  return `$1::int IS NOT NULL`;
}
