import { jumlahBelumDibaca } from '$lib/server/notifikasi';

export const load = async ({ locals, depends }) => {
  depends('app:notif');
  return { user: locals.user!, belum: await jumlahBelumDibaca(locals.user!.id) };
};
