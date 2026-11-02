import { error } from '@sveltejs/kit';
import fs from 'node:fs/promises';
import path from 'node:path';
import { uploadDir } from '$lib/server/upload';

const TIPE: Record<string, string> = { '.jpg': 'image/jpeg', '.png': 'image/png', '.webp': 'image/webp' };

export const GET = async ({ params }) => {
  // nama berkas dibuat server (uuid + ekstensi); tolak yang lain agar tidak bisa keluar dari folder
  if (!/^[a-f0-9-]{36}\.(jpg|png|webp)$/.test(params.nama)) error(404);
  try {
    const buf = await fs.readFile(path.join(uploadDir(), params.nama));
    return new Response(buf, {
      headers: { 'content-type': TIPE[path.extname(params.nama)], 'cache-control': 'public, max-age=31536000, immutable', 'x-content-type-options': 'nosniff' }
    });
  } catch {
    error(404);
  }
};
