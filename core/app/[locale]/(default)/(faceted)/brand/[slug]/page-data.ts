import { unstable_cache } from 'next/cache';
import { getLocale } from 'next-intl/server';
import { cache } from 'react';

import { client } from '~/client';
import { graphql } from '~/client/graphql';
import { revalidate } from '~/client/revalidate-target';

const BrandPageQuery = graphql(`
  query BrandPageQuery($entityId: Int!) {
    site {
      brand(entityId: $entityId) {
        name
        path
        seo {
          pageTitle
          metaDescription
          metaKeywords
        }
      }
      settings {
        inventory {
          defaultOutOfStockMessage
          showOutOfStockMessage
          showBackorderMessage
        }
        storefront {
          catalog {
            productComparisonsEnabled
          }
        }
        display {
          showProductRating
        }
        reviews {
          enabled
        }
      }
    }
  }
`);

const getCachedBrandPageData = unstable_cache(
  async (_locale: string, entityId: number) => {
    const response = await client.fetch({
      document: BrandPageQuery,
      variables: { entityId },
      fetchOptions: { cache: 'no-store' },
    });

    return response.data.site;
  },
  ['get-brand-page-data'],
  { revalidate },
);

export const getBrandPageData = cache(async (entityId: number, customerAccessToken?: string) => {
  if (customerAccessToken) {
    const response = await client.fetch({
      document: BrandPageQuery,
      variables: { entityId },
      customerAccessToken,
      fetchOptions: { cache: 'no-store' },
    });

    return response.data.site;
  }

  const locale = await getLocale();

  return getCachedBrandPageData(locale, entityId);
});
