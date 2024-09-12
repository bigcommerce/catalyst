'use server';

import { isRedirectError } from 'next/dist/client/components/redirect';

import { Credentials, signIn } from '~/auth';
import { redirect } from '~/i18n/routing';

export const login = async (_previousState: unknown, formData: FormData) => {
  try {
    const credentials = Credentials.parse({
      email: formData.get('email'),
      password: formData.get('password'),
    });

    await signIn('credentials', {
      ...credentials,
      // We want to use next/navigation for the redirect as it
      // follows basePath and trailing slash configurations.
      redirect: false,
    });

    redirect('/account');
  } catch (error: unknown) {
    // We need to throw this error to trigger the redirect as Next.js uses error boundaries to redirect.
    if (isRedirectError(error)) {
      throw error;
    }

    return {
      status: 'error',
    };
  }
};
