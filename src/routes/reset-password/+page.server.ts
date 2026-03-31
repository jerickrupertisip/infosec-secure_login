import { fail, type Actions } from '@sveltejs/kit';
import { createResetToken, resetPassword } from '$lib/server/services/auth';
import { resetPasswordSchema } from '$lib/schemas';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ url }) => {
  return {
    token: url.searchParams.get('token') ?? null,
  };
};

export const actions: Actions = {
  request: async ({ request, url }) => {
    const formData = await request.formData();
    const email = formData.get('email') as string;

    if (!email) {
      return fail(400, { error: 'Email is required' });
    }

    const token = await createResetToken(email);
    const resetUrl = token ? `${url.origin}/reset-password?token=${token}` : null;

    return {
      resetUrl,
      message: token ? undefined : 'If an account exists for that email, a reset link has been generated.',
    };
  },

  reset: async ({ request }) => {
    const formData = await request.formData();
    const token = formData.get('token') as string;
    const password = formData.get('password') as string;

    if (!token || !password) {
      return fail(400, { error: 'Token and password are required' });
    }

    const validation = resetPasswordSchema.safeParse({ password });
    if (!validation.success) {
      return fail(400, { error: validation.error.issues[0]?.message ?? 'Invalid password' });
    }

    try {
      await resetPassword(token, password);
      return { success: true };
    } catch (err: any) {
      return fail(400, { error: err.message ?? 'Invalid or expired reset token' });
    }
  },
};
