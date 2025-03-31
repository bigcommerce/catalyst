import { PropsWithChildren } from 'react';

import { isLoggedIn } from '~/auth';
import { redirect } from '~/i18n/routing';

interface Props extends PropsWithChildren {
  params: Promise<{ locale: string }>;
}

export default async function Layout({ children, params }: Props) {
  const loggedIn = await isLoggedIn();
  const { locale } = await params;

  if (loggedIn) {
    redirect({ href: '/account/orders', locale });
  }

  return children;
}
