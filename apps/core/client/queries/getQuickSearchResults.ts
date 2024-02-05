import { removeEdgesAndNodes } from '@bigcommerce/catalyst-client';
import { cache } from 'react';

import { client } from '..';
import { graphql } from '../generated';
import { useCustomerProvider } from '~/app/contexts/CustomerContext';

interface QuickSearch {
  searchTerm: string;
  imageWidth?: number;
  imageHeight?: number;
}

const GET_QUICK_SEARCH_RESULTS_QUERY = /* GraphQL */ `
  query getQuickSearchResults(
    $filters: SearchProductsFiltersInput!
    $imageHeight: Int!
    $imageWidth: Int!
  ) {
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

export const getQuickSearchResults = cache(
  async ({ searchTerm, imageHeight = 300, imageWidth = 300 }: QuickSearch) => {
    const query = graphql(GET_QUICK_SEARCH_RESULTS_QUERY);
    const customerId = useCustomerProvider();

    const response = await client.fetch({
      document: query,
      variables: { filters: { searchTerm }, imageHeight, imageWidth },
      customerId,
      fetchOptions: {
        cache: customerId ? 'no-store' : 'force-cache',
      },
    });

    const { products } = response.data.site.search.searchProducts;

    return {
      products: removeEdgesAndNodes(products),
    };
  },
);
