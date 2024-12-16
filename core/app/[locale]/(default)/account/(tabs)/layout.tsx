import { getTranslations, setRequestLocale } from 'next-intl/server';
import { PropsWithChildren } from 'react';

import { TabNavigation, TabType } from './_components/tab-navigation';

const tabList = ['orders', 'addresses', 'wishlists', 'settings'] as const;

export type TabType = (typeof tabList)[number];

interface Props extends PropsWithChildren {
  params: Promise<{ locale: string; tab?: TabType }>;
}

export default async function AccountTabLayout({ children, params }: Props) {
  const { locale } = await params;

  setRequestLocale(locale);

  const t = await getTranslations('Account.Home');

  const tabsTitles = {
    addresses: t('addresses'),
    wishlists: t('wishlists'),
    settings: t('settings'),
    orders: t('orders')
  };

  return (
    <>
    <div className='div-My-account-page w-[90%] m-auto'>
    <h1 className="my-8 text-4xl font-black lg:my-8 lg:text-5xl">{t('heading')}</h1>
      <TabNavigation />
      {children}
    </div>
    
    </>
  );
}
