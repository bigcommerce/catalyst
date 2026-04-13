import { unstable_cache } from 'next/cache';
import { getLocale } from 'next-intl/server';
import { cache } from 'react';

import { client } from '~/client';
import { graphql } from '~/client/graphql';
import { revalidate } from '~/client/revalidate-target';
import { CurrencyCode } from '~/components/header/fragment';
import { StoreLogoFragment } from '~/components/store-logo/fragment';
import { logoTransformer } from '~/data-transformers/logo-transformer';

import { GiftCertificateSettingsFragment } from './fragment';

const GiftCertificatePurchaseSettingsQuery = graphql(
  `
    query GiftCertificatePurchaseSettingsQuery($currencyCode: currencyCode) {
      site {
        settings {
          giftCertificates(currencyCode: $currencyCode) {
            ...GiftCertificateSettingsFragment
          }
          currency {
            defaultCurrency
          }
          storeName
          ...StoreLogoFragment
        }
      }
    }
  `,
  [GiftCertificateSettingsFragment, StoreLogoFragment],
);

const getCachedGiftCertificatePurchaseData = unstable_cache(
  async (currencyCode: CurrencyCode | undefined, locale: string) => {
    const response = await client.fetch({
      document: GiftCertificatePurchaseSettingsQuery,
      variables: { currencyCode },
      locale,
      fetchOptions: { cache: 'no-store' },
    });

    return {
      giftCertificateSettings: response.data.site.settings?.giftCertificates ?? null,
      logo: response.data.site.settings ? logoTransformer(response.data.site.settings) : '',
      storeName: response.data.site.settings?.storeName ?? undefined,
      defaultCurrency: response.data.site.settings?.currency.defaultCurrency ?? undefined,
    };
  },
  ['gift-certificate-purchase-data'],
  { revalidate },
);

export const getGiftCertificatePurchaseData = cache(async (currencyCode?: CurrencyCode) => {
  const locale = await getLocale();

  return getCachedGiftCertificatePurchaseData(currencyCode, locale);
});
