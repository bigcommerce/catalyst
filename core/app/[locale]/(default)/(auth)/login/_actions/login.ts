'use server';

import { BigCommerceGQLError } from '@bigcommerce/catalyst-client';
import { SubmissionResult } from '@conform-to/react';
import { parseWithZod } from '@conform-to/zod';
import { AuthError } from 'next-auth';
import { getLocale, getTranslations } from 'next-intl/server';

import { schema } from '@/vibes/soul/sections/sign-in-section/schema';
import { signIn } from '~/auth';
import { redirect } from '~/i18n/routing';
import { getCartId } from '~/lib/cart';

export const login = async (
  { redirectTo }: { redirectTo: string },
  _lastResult: SubmissionResult | null,
  formData: FormData,
) => {
  const locale = await getLocale();
  const t = await getTranslations('Auth.Login');
  const cartId = await getCartId();

  const submission = parseWithZod(formData, { schema });

  if (submission.status !== 'success') {
    return submission.reply();
  }

  try {
    await signIn('password', {
      email: submission.value.email,
      password: submission.value.password,
      cartId,
      redirect: false,
    });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(error);

    if (error instanceof BigCommerceGQLError) {
      return submission.reply({
        formErrors: error.errors.map(({ message }) => message),
      });
    }

    if (
      error instanceof AuthError &&
      error.name === 'CallbackRouteError' &&
      error.cause &&
      error.cause.err?.message.includes('Invalid credentials')
    ) {
      return submission.reply({ formErrors: [t('invalidCredentials')] });
    }

    return submission.reply({ formErrors: [t('somethingWentWrong')] });
  }

  return redirect({ href: redirectTo, locale });
};