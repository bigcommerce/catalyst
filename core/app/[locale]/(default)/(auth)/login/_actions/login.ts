'use server';

import { SubmissionResult } from '@conform-to/react';
import { parseWithZod } from '@conform-to/zod';
import { getLocale, getTranslations } from 'next-intl/server';

import { schema } from '@/vibes/soul/sections/sign-in-section/schema';
import { signIn } from '~/auth';
import { redirect } from '~/i18n/routing';

export const login = async (_lastResult: SubmissionResult | null, formData: FormData) => {
  const locale = await getLocale();
  const t = await getTranslations('Login');

  const submission = parseWithZod(formData, { schema });

  if (submission.status !== 'success') {
    return submission.reply({ formErrors: [t('Form.error')] });
  }

  try {
    await signIn(
      {
        type: 'password',
        email: submission.value.email,
        password: submission.value.password,
      },
      {
        // We want to use next/navigation for the redirect as it
        // follows basePath and trailing slash configurations.
        redirect: false,
      },
    );
  } catch {
    return submission.reply({ formErrors: [t('Form.error')] });
  }

  return redirect({ href: '/account/orders', locale });
};
