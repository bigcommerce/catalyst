import { cache } from 'react';

import { client } from '~/client';
import { graphql } from '~/client/graphql';
import { revalidate } from '~/client/revalidate-target';
import { CurrencyCode } from '~/components/header/fragment';
import { StoreLogoFragment } from '~/components/store-logo/fragment';
import { logoTransformer } from '~/data-transformers/logo-transformer';

const GiftCertificatesRootQuery = graphql(
  `
    query GiftCertificatesRootQuery($currencyCode: currencyCode) {
      site {
        settings {
          giftCertificates(currencyCode: $currencyCode) {
            isEnabled
          }
          currency {
            defaultCurrency
          }
          ...StoreLogoFragment
        }
      }
    }
  `,
  [StoreLogoFragment],
);

export const getGiftCertificatesData = cache(async (currencyCode?: CurrencyCode) => {
  const response = await client.fetch({
    document: GiftCertificatesRootQuery,
    variables: { currencyCode },
    fetchOptions: { next: { revalidate } },
  });

  return {
    giftCertificatesEnabled: response.data.site.settings?.giftCertificates?.isEnabled ?? false,
    defaultCurrency: response.data.site.settings?.currency.defaultCurrency ?? undefined,
    logo: response.data.site.settings ? logoTransformer(response.data.site.settings) : '',
  };
});
