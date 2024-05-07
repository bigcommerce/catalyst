import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';

import { getCustomerAddresses } from '~/client/queries/get-customer-addresses';
import { LocaleType } from '~/i18n';

import { AddressesContent } from './_components/addresses-content';
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

const tabHeading = async (heading: string, locale: string) => {
  const t = await getTranslations({ locale, namespace: 'Account.Home' });

  return <h2 className="mb-8 text-3xl font-black lg:text-4xl">{t(heading)}</h2>;
};

export default async function AccountTabPage({ params: { tab, locale }, searchParams }: Props) {
  switch (tab) {
    case 'orders':
      return tabHeading(tab, locale);

    case 'messages':
      return tabHeading(tab, locale);

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
      return tabHeading(tab, locale);

    case 'recently-viewed':
      return tabHeading('recentlyViewed', locale);

    case 'settings':
      return tabHeading(tab, locale);

    default:
      return notFound();
  }
}

export { tabHeading };
export const runtime = 'edge';
