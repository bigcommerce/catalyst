import { unstable_cache } from 'next/cache';
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

const getCachedSearchPageData = unstable_cache(
  async () => {
    const response = await client.fetch({
      document: SearchPageQuery,
      fetchOptions: { cache: 'no-store' },
    });

    return response.data.site;
  },
  ['search-page-data'],
  { revalidate },
);

export const getSearchPageData = cache(async () => {
  return getCachedSearchPageData();
});
