import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';

import { getCustomerAddresses } from '~/client/queries/get-customer-addresses';
import { LocaleType } from '~/i18n';

import { AddressesContent } from './_components/addresses-content';
import { SettingsContent } from './_components/settings-content';
import { TabHeading } from './_components/tab-heading';
import { TabType } from './layout';

interface Props {
  params: {
    locale: LocaleType;
    tab: TabType;
  };
  searchParams: {
    [key: string]: string | string[] | undefined;
    before?: string;
    after?: string;
  };
}

export async function generateMetadata({ params: { tab, locale } }: Props): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: 'Account.Home' });

  return {
    title: t(tab === 'recently-viewed' ? 'recentlyViewed' : tab),
  };
}

export default async function AccountTabPage({ params: { tab, locale }, searchParams }: Props) {
  switch (tab) {
    case 'orders':
      return <TabHeading heading={tab} locale={locale} />;

    case 'messages':
      return <TabHeading heading={tab} locale={locale} />;

    case 'addresses': {
      const { before, after } = searchParams;
      const customerAddressesDetails = await getCustomerAddresses({
        ...(after && { after }),
        ...(before && { before }),
        limit: 2,
      });

      if (!customerAddressesDetails) {
        notFound();
      }

      const { addresses, pageInfo } = customerAddressesDetails;

      return <AddressesContent addresses={addresses} pageInfo={pageInfo} title={tab} />;
    }

    case 'wishlists':
      return <TabHeading heading={tab} locale={locale} />;

    case 'recently-viewed':
      return <TabHeading heading={tab} locale={locale} />;

    case 'settings': {
      return <SettingsContent action={searchParams.action} title={tab} />;
    }

    default:
      return notFound();
  }
}

export const runtime = 'edge';
