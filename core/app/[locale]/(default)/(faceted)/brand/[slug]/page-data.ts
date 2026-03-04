import { cacheLife } from 'next/cache';
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

async function getCachedBrandPageData(locale: string, entityId: number) {
  'use cache';

  cacheLife({ revalidate });

  const response = await client.fetch({
    document: BrandPageQuery,
    variables: { entityId },
    locale,
  });

  return response.data.site;
}

export const getBrandPageData = cache(
  async (locale: string, entityId: number, customerAccessToken?: string) => {
    if (customerAccessToken) {
      const response = await client.fetch({
        document: BrandPageQuery,
        variables: { entityId },
        customerAccessToken,
        locale,
        fetchOptions: { cache: 'no-store' },
      });

      return response.data.site;
    }

    return getCachedBrandPageData(locale, entityId);
  },
);
