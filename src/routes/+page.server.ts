import { fail, redirect, type Actions } from '@sveltejs/kit';
import { createUser, verifyUser } from '$lib/server/services/auth';

const errorMap: Record<string, string> = {
  'AUTH_USER_NOT_FOUND': 'User not found',
  'AUTH_INVALID_PASSWORD': 'Invalid password.',
  'AUTH_USER_EXISTS': 'User already exists.',
};

export const actions: Actions = {
  signup: async ({ request, cookies }) => {
    const formData = await request.formData();
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    try {
      const user = await createUser(email, password);

      cookies.set('session', user.email, { path: '/' });
    } catch (err: any) {
      if (err.message in errorMap) {
        return fail(400, { errorCode: err.message, message: errorMap[err.message] });
      }
      return fail(500, { errorCode: err.message, message: 'Something went wrong' });
    }

    // Redirect or return success
    throw redirect(303, '/dashboard');
  },

  signin: async ({ request, cookies }) => {
    const formData = await request.formData();
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    try {
      const user = await verifyUser(email, password);

      cookies.set('session', user.email, { path: '/' });
    } catch (err: any) {
      if (err.message in errorMap) {
        return fail(400, { errorCode: err.message, message: errorMap[err.message] });
      }
      return fail(500, { errorCode: err.message, message: 'Something went wrong' });
    }

    throw redirect(303, '/dashboard');
  }
};
