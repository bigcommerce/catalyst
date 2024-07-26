import { removeEdgesAndNodes } from '@bigcommerce/catalyst-client';
import { cache } from 'react';

import { getSessionCustomerAccessToken } from '~/auth';
import { ProductCardFragment } from '~/components/product-card';

import { client } from '..';
import { graphql } from '../graphql';
import { revalidate } from '../revalidate-target';

interface QuickSearch {
  searchTerm: string;
}

const GET_QUICK_SEARCH_RESULTS_QUERY = graphql(
  `
    query getQuickSearchResults($filters: SearchProductsFiltersInput!) {
      site {
        search {
          searchProducts(filters: $filters) {
            products(first: 5) {
              edges {
                node {
                  categories {
                    edges {
                      node {
                        name
                        path
                      }
                    }
                  }
                  ...ProductCardFragment
                }
              }
            }
          }
        }
      }
    }
  `,
  [ProductCardFragment],
);

export const getQuickSearchResults = cache(async ({ searchTerm }: QuickSearch) => {
  const customerAccessToken = await getSessionCustomerAccessToken();

  const response = await client.fetch({
    document: GET_QUICK_SEARCH_RESULTS_QUERY,
    variables: { filters: { searchTerm } },
    customerAccessToken,
    fetchOptions: customerAccessToken ? { cache: 'no-store' } : { next: { revalidate } },
  });

  const { products } = response.data.site.search.searchProducts;

  return {
    products: removeEdgesAndNodes(products),
  };
});
