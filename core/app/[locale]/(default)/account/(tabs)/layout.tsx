import { setRequestLocale } from 'next-intl/server';
import { PropsWithChildren } from 'react';

import { LocaleType } from '~/i18n/routing';

import { TabNavigation, TabType } from './_components/tab-navigation';

interface Props extends PropsWithChildren {
  params: Promise<{ locale: LocaleType; tab?: TabType }>;
}

export default async function AccountTabLayout({ children, params }: Props) {
  const { locale } = await params;

  setRequestLocale(locale);

  return (
    <>
      <TabNavigation />
      {children}
    </>
  );
}
