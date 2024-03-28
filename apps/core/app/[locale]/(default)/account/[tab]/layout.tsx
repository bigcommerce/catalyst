import { NextIntlClientProvider } from 'next-intl';
import { getMessages, getTranslations, unstable_setRequestLocale } from 'next-intl/server';
import { PropsWithChildren } from 'react';

import { LocaleType } from '~/i18n';

import { AccountTabs } from './_components/account-tabs';

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

export default async function AccountTabLayout({ children, params: { locale, tab } }: Props) {
  unstable_setRequestLocale(locale);

  const t = await getTranslations({ locale, namespace: 'Account.Home' });

  const messages = await getMessages();

  return (
    <NextIntlClientProvider locale={locale} messages={{ Account: messages.Account ?? {} }}>
      <h1 className="my-6 my-8 text-4xl font-black lg:my-8 lg:text-5xl">{t('heading')}</h1>
      <AccountTabs activeTab={tab} tabs={[...tabList]}>
        {children}
      </AccountTabs>
    </NextIntlClientProvider>
  );
}
