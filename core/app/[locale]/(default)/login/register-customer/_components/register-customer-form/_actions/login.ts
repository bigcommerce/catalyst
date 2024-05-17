'use server';

import { isRedirectError } from 'next/dist/client/components/redirect';

import { signIn } from '~/auth';

export const login = async (
  email: FormDataEntryValue | null,
  password: FormDataEntryValue | null,
) => {
  try {
    return await signIn('credentials', {
      email,
      password,
      redirectTo: '/account',
    });
  } catch (error: unknown) {
    if (isRedirectError(error)) {
      throw error;
    }

    return {
      status: 'error',
    };
  }
};
