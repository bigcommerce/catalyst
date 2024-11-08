import { useTranslations } from 'next-intl';
import { setRequestLocale } from 'next-intl/server';
import { PropsWithChildren, use } from 'react';

import { LocaleType } from '~/i18n/routing';

import { TabNavigation, TabType } from './_components/tab-navigation';

interface Props extends PropsWithChildren {
  params: Promise<{ locale: LocaleType; tab?: TabType }>;
}

export default function AccountTabLayout({ children, params }: Props) {
  const { locale } = use(params);

  setRequestLocale(locale);

  const t = useTranslations('Account.Home');

  return (
    <>
      <h1 className="my-8 text-4xl font-black lg:my-8 lg:text-5xl">{t('heading')}</h1>
      <TabNavigation />
      {children}
    </>
  );
}
