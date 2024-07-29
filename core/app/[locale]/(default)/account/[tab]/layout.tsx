import { NextIntlClientProvider } from 'next-intl';
import { getMessages, unstable_setRequestLocale } from 'next-intl/server';
import { PropsWithChildren } from 'react';

import { LocaleType } from '~/i18n';

import { AccountStatusProvider } from './_components/account-status-provider';
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

  const messages = await getMessages();

  return (
    <NextIntlClientProvider
      locale={locale}
      messages={{ Account: messages.Account ?? {}, Product: messages.Product ?? {} }}
    >
      <AccountStatusProvider>
        <AccountTabs activeTab={tab} tabs={[...tabList]}>
          {children}
        </AccountTabs>
      </AccountStatusProvider>
    </NextIntlClientProvider>
  );
}
