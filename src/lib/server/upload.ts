import fs from 'node:fs/promises';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import { env } from '$env/dynamic/private';

export const uploadDir = () => path.resolve(env.UPLOAD_DIR ?? './uploads');
const MAKS = 5 * 1024 * 1024;

function jenis(b: Buffer): 'jpg' | 'png' | 'webp' | null {
  if (b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) return 'jpg';
  if (b.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) return 'png';
  if (b.subarray(0, 4).toString() === 'RIFF' && b.subarray(8, 12).toString() === 'WEBP') return 'webp';
  return null;
}

/** Simpan foto kiriman form. Mengembalikan nama berkas, null jika tidak ada berkas, atau lempar Error berpesan untuk pengguna. */
export async function simpanFoto(f: FormDataEntryValue | null): Promise<string | null> {
  if (!(f instanceof File) || f.size === 0) return null;
  if (f.size > MAKS) throw new Error('Foto terlalu besar. Maksimal 5 MB.');
  const buf = Buffer.from(await f.arrayBuffer());
  const t = jenis(buf);
  if (!t) throw new Error('Format foto harus JPG, PNG, atau WebP.');
  const nama = `${randomUUID()}.${t}`;
  await fs.mkdir(uploadDir(), { recursive: true });
  await fs.writeFile(path.join(uploadDir(), nama), buf);
  return nama;
}
