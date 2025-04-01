import { getLocale } from 'next-intl/server';

import { signOut } from '~/auth';
import { redirect } from '~/i18n/routing';
import { setForceRefreshCookie } from '~/lib/force-refresh';

export const GET = async () => {
  const locale = await getLocale();

  await signOut({ redirect: false });
  await setForceRefreshCookie();

  redirect({ href: '/login', locale });
};
