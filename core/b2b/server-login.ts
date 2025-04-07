'use server';

import { BigCommerceGQLError } from '@bigcommerce/catalyst-client';
import { AuthError } from 'next-auth';
import { getTranslations } from 'next-intl/server';

import { signIn } from '~/auth';

export const login = async (email: string, password: string) => {
  const t = await getTranslations('Auth.Login');

  try {
    await signIn('password', {
      email,
      password,
      redirect: false,
    });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(error);

    if (error instanceof BigCommerceGQLError) {
      return error.errors.map(({ message }) => message).join(', ');
    }

    if (
      error instanceof AuthError &&
      error.name === 'CallbackRouteError' &&
      error.cause &&
      error.cause.err?.message.includes('Invalid credentials')
    ) {
      return t('invalidCredentials');
    }

    return t('somethingWentWrong');
  }
};
