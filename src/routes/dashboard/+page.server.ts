import { redirect, type Actions } from '@sveltejs/kit';
import { verifyToken } from '$lib/server/services/auth';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ cookies }) => {
  const session = cookies.get('session');
  const payload = verifyToken(session);

  if (!payload) {
    throw redirect(303, '/');
  }

  return {
    email: payload.email,
    role: payload.role
  };
};

export const actions: Actions = {
  logout: async ({ cookies }) => {
    // 1. Clear the cookie
    cookies.delete('session', { path: '/' });

    // 2. Send them back home
    throw redirect(303, '/');
  }
};
