'use client';

import { useTranslations } from 'next-intl';
import { PropsWithChildren, useEffect } from 'react';

import { Link } from '~/components/link';
import { Tabs } from '~/components/ui/tabs';

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
    <Tabs
      defaultValue={activeTab}
      label="Account Tabs"
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
