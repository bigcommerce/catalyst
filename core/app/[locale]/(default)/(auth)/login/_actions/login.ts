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
    console.log('Login action called with formData:', Object.fromEntries(formData));

    const credentials = Credentials.parse({
      type: 'password',
      email: formData.get('email'),
      password: formData.get('password'),
    });
    console.log('Parsed credentials:', credentials);

    const result = await signIn('credentials', {
      ...credentials,
      redirect: false,
    });
    console.log('SignIn result:', result);

    if (result?.error) {
      console.error('SignIn error:', result.error);
      return {
        status: 'error',
      };
    }

    redirect({ href: '/account/orders', locale });

    return {
      status: 'success',
    };
  } catch (error: unknown) {
    console.error('Login action error:', error);
    rethrow(error);

    return {
      status: 'error',
    };
  }
};
