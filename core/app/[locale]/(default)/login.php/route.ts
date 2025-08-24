import { getLocale } from 'next-intl/server';

import { redirect } from '~/i18n/routing';

export const GET = async () => {
  const locale = await getLocale();

  redirect({ href: '/login', locale });
};
