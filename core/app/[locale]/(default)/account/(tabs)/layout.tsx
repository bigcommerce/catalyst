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
    orders: t('orders'),
  };

  return (
    <>
      <div className="div-My-account-page m-auto w-[82%] mt-[40px]">
        <h1 className="text-[24px] font-semibold leading-[32px] text-[#353535] mb-[20px]">{t('heading')}</h1>
        <TabNavigation />
        {children}
      </div>
    </>
  );
}
