'use client';

import { useTranslations } from 'next-intl';
import { PropsWithChildren, useEffect } from 'react';

import { Link } from '~/components/link';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '~/components/ui/tabs';

import { TabType } from '../layout';

import { useAccountStatusContext } from './account-status-provider';

interface Props extends PropsWithChildren {
  tabs: TabType[];
  activeTab?: TabType;
}

export const AccountTabs = ({ children, activeTab, tabs }: Props) => {
  const t = useTranslations('Account.Home');
  const { activeTabRef } = useAccountStatusContext();

  useEffect(() => {
    if (activeTabRef.current) {
      activeTabRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'center',
      });
    }
  }, [activeTab, activeTabRef]);

  return (
    <Tabs activationMode="manual" defaultValue={activeTab}>
      <TabsList aria-label={t('accountTabsLabel')} className="mb-5 pb-3 pt-1">
        {tabs.map((tab) => (
          <TabsTrigger asChild key={tab} value={tab}>
            <Link
              className="whitespace-nowrap font-semibold"
              href={`/account/${tab}`}
              prefetch="viewport"
              prefetchKind="full"
              ref={activeTab === tab ? activeTabRef : null}
            >
              {tab === 'recently-viewed' ? t('recentlyViewed') : t(tab)}
            </Link>
          </TabsTrigger>
        ))}
      </TabsList>
      <TabsContent value={activeTab ?? ''}>{children}</TabsContent>
    </Tabs>
  );
};
