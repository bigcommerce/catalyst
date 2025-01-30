'use server';

import { BigCommerceGQLError } from '@bigcommerce/catalyst-client';
import { SubmissionResult } from '@conform-to/react';
import { parseWithZod } from '@conform-to/zod';
import { AuthError } from 'next-auth';
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
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(error);

    if (error instanceof BigCommerceGQLError) {
      return submission.reply({
        formErrors: error.errors.map(({ message }) => message),
      });
    }

    if (error instanceof AuthError) {
      if (error.name === 'CallbackRouteError') {
        if (error.cause && error.cause.err?.message.includes('Invalid credentials')) {
          return submission.reply({ formErrors: [t('Form.invalidCredentials')] });
        }
      }

      return submission.reply({ formErrors: [error.name] });
    }

    return submission.reply({ formErrors: [t('Form.somethingWentWrong')] });
  }

  return redirect({ href: '/account/orders', locale });
};
