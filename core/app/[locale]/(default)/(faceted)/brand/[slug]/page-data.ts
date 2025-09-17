import { cache } from 'react';

import { client } from '~/client';
import { TaxSettingsFragment } from '~/client/fragments/pricing';
import { graphql } from '~/client/graphql';
import { revalidate } from '~/client/revalidate-target';

const BrandPageQuery = graphql(
  `
    query BrandPageQuery($entityId: Int!) {
      site {
        brand(entityId: $entityId) {
          name
          seo {
            pageTitle
            metaDescription
            metaKeywords
          }
        }
        settings {
          ...TaxSettingsFragment
          storefront {
            catalog {
              productComparisonsEnabled
            }
          }
        }
      }
    }
  `,
  [TaxSettingsFragment],
);

export const getBrandPageData = cache(async (entityId: number, customerAccessToken?: string) => {
  const response = await client.fetch({
    document: BrandPageQuery,
    variables: { entityId },
    customerAccessToken,
    fetchOptions: customerAccessToken ? { cache: 'no-store' } : { next: { revalidate } },
  });

  return response.data.site;
});
