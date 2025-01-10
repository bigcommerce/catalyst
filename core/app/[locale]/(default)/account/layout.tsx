import { getTranslations, setRequestLocale } from 'next-intl/server';
import { PropsWithChildren } from 'react';

import { AccountLayout } from '@/vibes/soul/sections/account-layout';
import { auth } from '~/auth';
import { redirect } from '~/i18n/routing';

interface Props extends PropsWithChildren {
  params: Promise<{ locale: string }>;
}

export default async function Layout({ children, params }: Props) {
  const { locale } = await params;
  const session = await auth();
  const t = await getTranslations('Account.Layout');

  setRequestLocale(locale);

  if (!session) {
    redirect({ href: '/login', locale });
  }

  return (
    <AccountLayout
      links={[
        { href: '/account/orders', label: t('orders') },
        { href: '/account/addresses', label: t('addresses') },
        { href: '/account/settings', label: t('settings') },
        { href: '/logout', label: t('logout') },
      ]}
    >
      {children}
    </AccountLayout>
  );
}
