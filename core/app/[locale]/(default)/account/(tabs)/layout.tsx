import { useTranslations } from 'next-intl';
import { setRequestLocale } from 'next-intl/server';
import { PropsWithChildren, use } from 'react';

import { Link } from '~/components/link';
import { LocaleType } from '~/i18n/routing';
import { cn } from '~/lib/utils';

const tabList = ['addresses', 'settings'] as const;

export type TabType = (typeof tabList)[number];

interface Props extends PropsWithChildren {
  params: Promise<{ locale: LocaleType; tab?: TabType }>;
}

export default function AccountTabLayout({ children, params }: Props) {
  const { locale } = use(params);

  setRequestLocale(locale);

  const t = useTranslations('Account.Home');

  const tabsTitles = {
    addresses: t('addresses'),
    settings: t('settings'),
  };

  return (
    <>
      <h1 className="my-8 text-4xl font-black lg:my-8 lg:text-5xl">{t('heading')}</h1>
      <nav aria-label={t('accountTabsLabel')}>
        <ul className="mb-8 flex items-start overflow-x-auto">
          {tabList.map((tab) => (
            <li key={tab}>
              <Link
                className={cn('block whitespace-nowrap px-4 pb-2 font-semibold')}
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
      {children}
    </>
  );
}
