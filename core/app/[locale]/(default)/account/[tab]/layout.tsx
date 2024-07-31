import { NextIntlClientProvider } from 'next-intl';
import { getMessages, getTranslations, unstable_setRequestLocale } from 'next-intl/server';
import { PropsWithChildren } from 'react';

import { Link } from '~/components/link';
import { LocaleType } from '~/i18n';
import { cn } from '~/lib/utils';

import { AccountStatusProvider } from './_components/account-status-provider';

const tabList = [
  'orders',
  'messages',
  'addresses',
  'wishlists',
  'recently-viewed',
  'settings',
] as const;

export type TabType = (typeof tabList)[number];

interface Props extends PropsWithChildren {
  params: { locale: LocaleType; tab?: TabType };
}

export default async function AccountTabLayout({
  children,
  params: { locale, tab: activeTab },
}: Props) {
  unstable_setRequestLocale(locale);

  const t = await getTranslations({ locale, namespace: 'Account.Home' });

  const messages = await getMessages();

  const tabsTitles = {
    orders: t('orders'),
    messages: t('messages'),
    addresses: t('addresses'),
    wishlists: t('wishlists'),
    'recently-viewed': t('recentlyViewed'),
    settings: t('settings'),
  };

  return (
    <NextIntlClientProvider locale={locale} messages={{ Account: messages.Account ?? {} }}>
      <AccountStatusProvider>
        <h1 className="my-8 text-4xl font-black lg:my-8 lg:text-5xl">{t('heading')}</h1>
        <nav aria-label={t('accountTabsLabel')}>
          <ul className="mb-8 flex items-start overflow-x-auto">
            {tabList.map((tab) => (
              <li key={tab}>
                <Link
                  className={cn(
                    'block whitespace-nowrap px-4 pb-2 font-semibold',
                    activeTab === tab && 'border-b-4 border-primary text-primary',
                  )}
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
      </AccountStatusProvider>
    </NextIntlClientProvider>
  );
}
