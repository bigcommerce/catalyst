'use server';

import { getLocale } from 'next-intl/server';

import { signOut } from '~/auth';
import { b2bLogout } from '~/b2b/logout';
import { redirect } from '~/i18n/routing';

export const logout = async () => {
  const locale = await getLocale();

  await b2bLogout();
  await signOut({ redirect: false });

  redirect({ href: '/login', locale });
};
