import { PropsWithChildren } from 'react';

import { auth } from '~/auth';
import { redirect } from '~/i18n/routing';

interface Props extends PropsWithChildren {
  params: Promise<{ locale: string }>;
}

export default async function Layout({ children, params }: Props) {
  const session = await auth();
  const { locale } = await params;

  if (session) {
    redirect({ href: '/?section=orders', locale });
  }

  return children;
}
