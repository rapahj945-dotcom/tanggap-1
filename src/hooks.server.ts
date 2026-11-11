import { redirect, type Handle } from '@sveltejs/kit';
import { migrate } from '$lib/server/db';
import { seedIfEmpty } from '$lib/server/seed';
import { seedNotifikasi } from '$lib/server/notifikasi';
import { readSession } from '$lib/server/auth';

let ready: Promise<void> | null = null;

function inisialisasi() {
  ready ??= (async () => {
    await migrate();
    await seedIfEmpty();
    await seedNotifikasi();
  })();
  return ready;
}

export const handle: Handle = async ({ event, resolve }) => {
  await inisialisasi().catch((e) => console.error('[tanggap] gagal inisialisasi database', e));
  event.locals.user = await readSession(event.cookies);
  if (event.url.pathname.startsWith('/app') && !event.locals.user) {
    redirect(303, `/masuk?lanjut=${encodeURIComponent(event.url.pathname)}`);
  }
  return resolve(event);
};
