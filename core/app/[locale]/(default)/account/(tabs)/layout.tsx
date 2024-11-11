import { setRequestLocale } from 'next-intl/server';
import { PropsWithChildren } from 'react';

import { LocaleType } from '~/i18n/routing';

import { TabNavigation } from './_components/tab-navigation';

interface Props extends PropsWithChildren {
  params: { locale: LocaleType };
}

export default function AccountTabLayout({ children, params: { locale } }: Props) {
  setRequestLocale(locale);

  return (
    <>
      <TabNavigation />
      {children}
    </>
  );
}
