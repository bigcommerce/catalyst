'use server';

import { unstable_rethrow as rethrow } from 'next/navigation';
import { getLocale } from 'next-intl/server';

import { Credentials, signIn } from '~/auth';
import { redirect } from '~/i18n/routing';
import { cookies } from 'next/headers';

export const getRememberMeCookie = async () => {
  const cookieStore = await cookies();
  return cookieStore.get('rememberMe');
}

export const deleteRememberCookie = async () => {
  const cookieStore = await cookies();
  cookieStore.delete('rememberMe');
}

export const login = async (_previousState: unknown, formData: FormData) => {
  try {
    const locale = await getLocale();

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

    redirect({ href: '/account', locale });
  } catch (error: unknown) {
    rethrow(error);

    return {
      status: 'error',
    };
  }
};
