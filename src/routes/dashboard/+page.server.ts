import { redirect, type Actions } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ cookies }) => {
  const session = cookies.get('session');

  if (!session) {
    throw redirect(303, '/');
  }

  return {
    email: session
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
