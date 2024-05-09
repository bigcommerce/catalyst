'use client';

import { useTranslations } from 'next-intl';
import { PropsWithChildren } from 'react';

import { Link } from '~/components/link';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '~/components/ui/tabs';

import { TabType } from '../layout';

interface Props extends PropsWithChildren {
  tabs: TabType[];
  activeTab?: TabType;
}

export const AccountTabs = ({ children, activeTab, tabs }: Props) => {
  const t = useTranslations('Account.Home');

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
