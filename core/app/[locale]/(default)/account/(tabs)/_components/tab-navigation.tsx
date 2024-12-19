'use client';

import { useTranslations } from 'next-intl';

import { Link } from '~/components/link';
import { usePathname } from '~/i18n/routing';
import { cn } from '~/lib/utils';

const tabList = ['addresses', 'settings', 'wishlists', 'orders'] as const;

export type TabType = (typeof tabList)[number];

export const TabNavigation = () => {
  const t = useTranslations('Account.Home');
  const pathname = usePathname();
  let activeTab: any = pathname.slice(0, -1).split('/').pop();
  if(!isNaN(activeTab)) {
    activeTab = 'orders';
  }
  const tabsTitles = {
    addresses: t('addresses'),
    settings: t('settings'),
    wishlists: t('wishlists'),
    orders: t('orders'),
  };

  return (
    <nav aria-label={t('accountTabsLabel')}>
      <ul className="mb-8 flex items-start overflow-x-auto">
        {tabList.map((tab) => (
          <li key={tab} className='mr-[3em]'>
            <Link
              className={cn('block whitespace-nowrap font-semibold', {
                'border-b-2 border-[#03465C] text-[#03465C]': activeTab === tab,
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
