'use client';

import { useTranslations } from 'next-intl';
import { PropsWithChildren } from 'react';

import { Link } from '~/components/link';
import { Tabs } from '~/components/ui/tabs';

import { TabType } from '../layout';

interface Props extends PropsWithChildren {
  tabs: TabType[];
  activeTab?: TabType;
}

export const AccountTabs = ({ children, activeTab, tabs }: Props) => {
  const t = useTranslations('Account.Home');

  return (
    <Tabs
      defaultValue={activeTab}
      tabs={tabs.map((tab) => ({
        value: tab,
        title: (
          <Link
            className="whitespace-nowrap font-semibold"
            href={`/account/${tab}`}
            prefetch="viewport"
            prefetchKind="full"
          >
            {tab === 'recently-viewed' ? t('recentlyViewed') : t(tab)}
          </Link>
        ),
        content: children,
      }))}
    />
  );
};
