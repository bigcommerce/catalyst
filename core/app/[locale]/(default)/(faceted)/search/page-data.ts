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
  async (locale: string) => {
    const response = await client.fetch({
      document: SearchPageQuery,
      locale,
    });

    return response.data.site;
  },
  ['get-search-page-data'],
  { revalidate },
);

export const getSearchPageData = cache(async (locale: string) => {
  return getCachedSearchPageData(locale);
});
