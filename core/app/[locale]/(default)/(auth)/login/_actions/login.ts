'use server';

import { SubmissionResult } from '@conform-to/react';
import { parseWithZod } from '@conform-to/zod';
import { isRedirectError } from 'next/dist/client/components/redirect';
import { getLocale, getTranslations } from 'next-intl/server';
import { cookies } from 'next/headers';
import { schema } from '@/vibes/soul/sections/sign-in-section/schema';
import { Credentials, signIn } from '~/auth';
import { redirect } from '~/i18n/routing';

export const getRememberMeCookie = async () => {
  return await cookies().get('rememberMe');
}

export const deleteRememberCookie = async () => {
  return await cookies().delete('rememberMe');
}

export const login = async (_lastResult: SubmissionResult | null, formData: FormData) => {
  const locale = await getLocale();
  const t = await getTranslations('Login');

  const submission = parseWithZod(formData, { schema });

  if (submission.status !== 'success') {
    return submission.reply({ formErrors: [t('Form.error')] });
  }

  try {
    const credentials = Credentials.parse({
      email: submission.value.email,
      password: submission.value.password,
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
    return redirect({ href: '/account', locale });
  } catch (error) {
    // We need to throw this error to trigger the redirect as Next.js uses error boundaries to redirect.
    if (isRedirectError(error)) {
      throw error;
    }

    return submission.reply({ formErrors: [t('Form.error')] });
  }
};
