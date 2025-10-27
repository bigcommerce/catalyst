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

export const getGiftCertificatePurchaseData = cache(async (currencyCode?: CurrencyCode) => {
  const response = await client.fetch({
    document: GiftCertificatePurchaseSettingsQuery,
    variables: { currencyCode },
    fetchOptions: { next: { revalidate } },
  });

  return {
    giftCertificateSettings: response.data.site.settings?.giftCertificates ?? null,
    logo: response.data.site.settings ? logoTransformer(response.data.site.settings) : '',
    storeName: response.data.site.settings?.storeName ?? undefined,
    defaultCurrency: response.data.site.settings?.currency.defaultCurrency ?? undefined,
  };
});
