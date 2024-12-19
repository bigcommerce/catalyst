import { setRequestLocale } from 'next-intl/server';
import { PropsWithChildren } from 'react';

import { auth } from '~/auth';
import { redirect } from '~/i18n/routing';

import { TabNavigation } from './_components/tab-navigation';

interface Props extends PropsWithChildren {
  params: Promise<{ locale: string }>;
}

export default async function AccountLayout({ children, params }: Props) {
  const { locale } = await params;
  const session = await auth();

  setRequestLocale(locale);

  if (!session) {
    redirect({ href: '/login', locale });
  }

  if (session?.b2bToken) {
    redirect({ href: '/#/orders', locale });
  }

  return (
    <>
      <TabNavigation />
      {children}
    </>
  );
}
