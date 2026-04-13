import { cacheLife } from 'next/cache';
import { cache } from 'react';

import { client } from '~/client';
import { graphql } from '~/client/graphql';
import { revalidate } from '~/client/revalidate-target';

const SearchPageQuery = graphql(`
  query SearchPageQuery {
    site {
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

async function getCachedSearchPageData(locale: string) {
  'use cache';

  cacheLife({ revalidate });

  const response = await client.fetch({
    document: SearchPageQuery,
    locale,
    fetchOptions: { cache: 'no-store' },
  });

  return response.data.site;
}

export const getSearchPageData = cache(async (locale: string) => {
  return getCachedSearchPageData(locale);
});
