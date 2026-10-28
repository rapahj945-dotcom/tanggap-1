import { one } from './db';

export const STATUS = ['Diterima', 'Diverifikasi', 'Ditangani', 'Survei', 'Perbaikan', 'Selesai', 'Ditolak'] as const;
export type Status = (typeof STATUS)[number];

export async function buatKode(d = new Date()): Promise<string> {
  const tgl = d.toISOString().slice(2, 10).replace(/-/g, '');
  const r = await one<{ c: string }>('SELECT count(*) AS c FROM laporan WHERE kode LIKE $1', [`TGP-${tgl}-%`]);
  return `TGP-${tgl}-${String(Number(r!.c) + 1).padStart(4, '0')}`;
}
