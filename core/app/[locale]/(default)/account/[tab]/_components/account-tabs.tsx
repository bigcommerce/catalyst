'use client';

import * as TabsPrimitive from '@radix-ui/react-tabs';
import { useTranslations } from 'next-intl';
import { PropsWithChildren } from 'react';

import { Link } from '~/components/link';

import { TabType } from '../layout';

interface Props extends PropsWithChildren {
  tabs: TabType[];
  activeTab?: TabType;
}

export const AccountTabs = ({ activeTab, tabs }: Props) => {
  const t = useTranslations('Account.Home');

  return (
    <TabsPrimitive.Root activationMode="manual" defaultValue={activeTab}>
      <TabsPrimitive.List
        aria-label={t('accountTabsLabel')}
        className="mb-5 flex list-none items-start overflow-x-auto pb-3 pt-1 text-base"
      >
        {tabs.map((tab) => (
          <TabsPrimitive.Trigger
            asChild
            className="px-4 pb-2 data-[state=active]:border-b-4 data-[state=active]:border-primary data-[state=active]:text-primary"
            key={tab}
            value={tab}
          >
            <Link
              className="whitespace-nowrap font-semibold"
              href={`/account/${tab}`}
              prefetch="viewport"
              prefetchKind="full"
            >
              {tab === 'recently-viewed' ? t('recentlyViewed') : t(tab)}
            </Link>
          </TabsPrimitive.Trigger>
        ))}
      </TabsPrimitive.List>
    </TabsPrimitive.Root>
  );
};
