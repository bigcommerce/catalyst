'use server';

import { unstable_rethrow as rethrow } from 'next/navigation';
import { getLocale } from 'next-intl/server';

import { Credentials, signIn } from '~/auth';
import { redirect } from '~/i18n/routing';

interface LoginResponse {
  status: 'success' | 'error';
}

export const login = async (formData: FormData): Promise<LoginResponse> => {
  try {
    const locale = await getLocale();

    const credentials = Credentials.parse({
      type: 'password',
      email: formData.get('email'),
      password: formData.get('password'),
    });

    await signIn('credentials', {
      ...credentials,
      // We want to use next/navigation for the redirect as it
      // follows basePath and trailing slash configurations.
      redirect: false,
    });

    redirect({ href: '/account/orders', locale });

    return {
      status: 'success',
    };
  } catch (error: unknown) {
    rethrow(error);

    return {
      status: 'error',
    };
  }
};
