import { getLocale } from 'next-intl/server';

import { redirect } from '~/i18n/navigation-server';

export const GET = async () => {
  const locale = await getLocale();

  await redirect({ href: '/?section=register', locale });
};
