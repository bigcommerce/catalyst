'use server';

import { isRedirectError } from 'next/dist/client/components/redirect';

import { Credentials, signIn } from 'auth';

export type State = { status: 'idle' } | { status: 'failed' };

export const submitLoginForm = async (_previousState: unknown, formData: FormData) => {
  try {
    const credentials = Credentials.parse({
      email: formData.get('email'),
      password: formData.get('password'),
    });

    await signIn('credentials', {
      ...credentials,
      // TODO: Redirect to previous page
      redirectTo: '/',
    });
  } catch (error: unknown) {
    // We need to throw this error to trigger the redirect as Next.js uses error boundaries to redirect.
    if (isRedirectError(error)) {
      throw error;
    }

    return {
      status: 'failed',
    };
  }
};
