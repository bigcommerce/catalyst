'use server';

import { getLocale } from 'next-intl/server';

import { signOut } from '~/auth';
import { redirect } from '~/i18n/routing';

export const logout = async () => {
  const locale = await getLocale();

  await signOut({ redirect: false });

  redirect({ href: '/login', locale });
};
