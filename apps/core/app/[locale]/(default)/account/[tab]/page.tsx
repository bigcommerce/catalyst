import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';

import { LocaleType } from '~/i18n';

import { TabType } from './layout';

interface Props {
  params: {
    locale: LocaleType;
    tab: TabType;
  };
}

export async function generateMetadata({ params: { tab, locale } }: Props): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: 'Account.Home' });

  return {
    title: t(tab === 'recently-viewed' ? 'recentlyViewed' : tab),
  };
}

const tabHeading = async (heading: string, locale: LocaleType) => {
  const t = await getTranslations({ locale, namespace: 'Account.Home' });

  return <h2 className="mb-8 text-3xl font-black lg:text-4xl">{t(heading)}</h2>;
};

export default async function AccountTabPage({ params: { tab, locale } }: Props) {
  switch (tab) {
    case 'orders':
      return tabHeading(tab, locale);

    case 'messages':
      return tabHeading(tab, locale);

    case 'addresses':
      return tabHeading(tab, locale);

    case 'wishlists':
      return tabHeading(tab, locale);

    case 'recently-viewed':
      return tabHeading('recentlyViewed', locale);

    case 'settings':
      return tabHeading(tab, locale);

    default:
      return notFound();
  }
}

export const runtime = 'edge';
