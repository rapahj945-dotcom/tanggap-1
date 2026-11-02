import { redirect } from '@sveltejs/kit';
import { destroySession } from '$lib/server/auth';

export const POST = async ({ cookies }) => {
  await destroySession(cookies);
  redirect(303, '/');
};
