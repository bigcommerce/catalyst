import { getLocale } from 'next-intl/server';
import { PropsWithChildren } from 'react';

import { auth } from '~/auth';
import { redirect } from '~/i18n/routing';

export default async function AccountLayout({ children }: PropsWithChildren) {
  const locale = await getLocale();
  const session = await auth();

  if (!session) {
    redirect({ href: '/login', locale });
  }

  return children;
}
