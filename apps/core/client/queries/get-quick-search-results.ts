import { removeEdgesAndNodes } from '@bigcommerce/catalyst-client';
import { cache } from 'react';

import { getSessionCustomerId } from '~/auth';

import { client } from '..';
import { graphql } from '../generated';
import { revalidate } from '../revalidate-target';

interface QuickSearch {
  searchTerm: string;
}

const GET_QUICK_SEARCH_RESULTS_QUERY = /* GraphQL */ `
  query getQuickSearchResults($filters: SearchProductsFiltersInput!) {
    site {
      search {
        searchProducts(filters: $filters) {
          products(first: 5) {
            edges {
              node {
                ...ProductDetails
              }
            }
          }
        }
      }
    }
  }
`;

export const getQuickSearchResults = cache(async ({ searchTerm }: QuickSearch) => {
  const query = graphql(GET_QUICK_SEARCH_RESULTS_QUERY);
  const customerId = await getSessionCustomerId();

  const response = await client.fetch({
    document: query,
    variables: { filters: { searchTerm } },
    customerId,
    fetchOptions: customerId ? { cache: 'no-store' } : { next: { revalidate } },
  });

  const { products } = response.data.site.search.searchProducts;

  return {
    products: removeEdgesAndNodes(products),
  };
});
