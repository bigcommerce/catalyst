import { getTranslations, setRequestLocale } from 'next-intl/server';
import { PropsWithChildren } from 'react';

import { SidebarMenu } from '@/vibes/soul/sections/sidebar-menu';
import { StickySidebarLayout } from '@/vibes/soul/sections/sticky-sidebar-layout';

interface Props extends PropsWithChildren {
  params: Promise<{ locale: string }>;
}

export default async function Layout({ children, params }: Props) {
  const { locale } = await params;

  setRequestLocale(locale);

  const t = await getTranslations('Account.Layout');

  return (
    <StickySidebarLayout
      sidebar={
        <SidebarMenu
          links={[
            { href: '/account/orders/', label: t('orders') },
            { href: '/account/addresses/', label: t('addresses') },
            { href: '/account/settings/', label: t('settings') },
            { href: '/account/wishlists/', label: t('wishlists') },
            { href: '/logout', label: t('logout'), prefetch: 'none' },
          ]}
        />
      }
      sidebarSize="small"
    >
      {children}
    </StickySidebarLayout>
  );
}
