'use server';

import { isRedirectError } from 'next/dist/client/components/redirect';

import { Credentials, signIn } from '~/auth';
import { redirect } from '~/i18n/routing';

export const login = async (formData: FormData) => {
  try {
    const credentials = Credentials.parse({
      email: formData.get('customer-email'),
      password: formData.get('customer-password'),
    });

    await signIn('credentials', {
      ...credentials,
      // We want to use next/navigation for the redirect as it
      // follows basePath and trailing slash configurations.
      redirect: false,
    });

    redirect('/account');
  } catch (error: unknown) {
    if (isRedirectError(error)) {
      throw error;
    }

    return {
      status: 'error',
    };
  }
};
