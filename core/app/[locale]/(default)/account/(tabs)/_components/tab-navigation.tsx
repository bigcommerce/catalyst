'use client';

import { useTranslations } from 'next-intl';

import { Link } from '~/components/link';
import { usePathname } from '~/i18n/routing';
import { cn } from '~/lib/utils';

const tabList = ['addresses', 'settings'] as const;

export type TabType = (typeof tabList)[number];

export const TabNavigation = () => {
  const t = useTranslations('Account.Home');
  const pathname = usePathname();
  const activeTab = pathname.slice(0, -1).split('/').pop();

  const tabsTitles = {
    addresses: t('addresses'),
    settings: t('settings'),
  };

  return (
    <nav aria-label={t('accountTabsLabel')}>
      <ul className="mb-8 flex items-start overflow-x-auto">
        {tabList.map((tab) => (
          <li key={tab}>
            <Link
              className={cn('block whitespace-nowrap px-4 pb-2 font-semibold', {
                'border-b-4 border-primary text-primary': activeTab === tab,
              })}
              href={`/account/${tab}`}
              prefetch="viewport"
              prefetchKind="full"
            >
              {tabsTitles[tab]}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
};
