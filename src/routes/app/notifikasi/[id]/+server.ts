import { redirect, error } from '@sveltejs/kit';
import { one } from '$lib/server/db';

/** Buka notifikasi: tandai dibaca lalu arahkan ke laporan terkait (hanya milik sendiri). */
export const GET = async ({ params, locals }) => {
  const n = await one<{ laporan_id: number | null }>(
    'UPDATE notifikasi SET dibaca=TRUE WHERE id=$1 AND user_id=$2 RETURNING laporan_id',
    [Number(params.id), locals.user!.id]
  );
  if (!n) error(404);
  redirect(303, n.laporan_id ? `/app/laporan/${n.laporan_id}` : '/app/notifikasi');
};
