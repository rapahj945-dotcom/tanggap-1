import { q } from '$lib/server/db';

export const load = async ({ locals, depends }) => {
  depends('app:notif');
  const daftar = await q(
    `SELECT n.id,n.jenis,n.judul,n.isi,n.laporan_id,n.dibaca,n.created_at FROM notifikasi n WHERE n.user_id=$1 ORDER BY n.created_at DESC,n.id DESC LIMIT 100`,
    [locals.user!.id]
  );
  return { daftar };
};

export const actions = {
  semua: async ({ locals }) => {
    await q('UPDATE notifikasi SET dibaca=TRUE WHERE user_id=$1 AND NOT dibaca', [locals.user!.id]);
    return { ok: 'Semua notifikasi ditandai dibaca.' };
  },
  hapus: async ({ locals }) => {
    await q('DELETE FROM notifikasi WHERE user_id=$1 AND dibaca', [locals.user!.id]);
    return { ok: 'Notifikasi yang sudah dibaca dihapus.' };
  }
};
