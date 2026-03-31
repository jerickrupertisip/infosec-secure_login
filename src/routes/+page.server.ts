import { fail, redirect, type Actions } from '@sveltejs/kit';
import { createToken, createUser, authenticateUser } from '$lib/server/services/auth';

const errorMap: Record<string, string> = {
  'AUTH_USER_NOT_FOUND': 'User not found',
  'AUTH_INVALID_PASSWORD': 'Invalid password.',
  'AUTH_USER_EXISTS': 'User already exists.',
  'AUTH_USER_LOCKED': 'User is locked.',
};

export const actions: Actions = {
  signup: async ({ request, cookies }) => {
    const formData = await request.formData();
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    try {
      const user = await createUser(email, password);
      const token = createToken({ id: user.id, email: user.email });

      cookies.set('session', token, {
        path: '/',
        httpOnly: true,
        sameSite: 'lax'
      });
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
      const user = await authenticateUser(email, password);
      const token = createToken({ id: user.id, email: user.email });

      cookies.set('session', token, {
        path: '/',
        httpOnly: true,
        sameSite: 'lax'
      });
    } catch (err: any) {
      if (err.message in errorMap) {
        return fail(400, { errorCode: err.message, message: errorMap[err.message] });
      }
      return fail(500, { errorCode: err.message, message: 'Something went wrong' });
    }

    throw redirect(303, '/dashboard');
  }
};
