'use server';

import { isRedirectError } from 'next/dist/client/components/redirect';
import { cookies } from 'next/headers';
import { Credentials, signIn } from '~/auth';
import { redirect } from '~/i18n/routing';

export const getRememberMeCookie = async () => {
  return await cookies().get('rememberMe');
}

export const deleteRememberCookie = async () => {
  cookies().delete('rememberMe');
}

export const login = async (_previousState: unknown, formData: FormData) => {
  try {
    const credentials = Credentials.parse({
      email: formData.get('email'),
      password: formData.get('password'),
    });
    const createCookie = async (email: string) => {
      const oneMonth = 30 * 24 * 60 * 60 * 1000;
      await cookies().set({
        name: 'rememberMe',
        value: email,
        sameSite: 'lax',
        secure: true,
        path: '/',
        expires: Date.now() + oneMonth
      });
    }

    await signIn('credentials', {
      ...credentials,
      // We want to use next/navigation for the redirect as it
      // follows basePath and trailing slash configurations.
      redirect: false,
    });
    let rememberMe = formData.get('remember-me');
    if(rememberMe) {
      let emailData: any = formData.get('email');
      await createCookie(emailData);
    }
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