import { removeEdgesAndNodes } from '@bigcommerce/catalyst-client';
import { cache } from 'react';

import { getSessionCustomerId } from '~/auth';

import { client } from '..';
import { PRODUCT_DETAILS_FRAGMENT } from '../fragments/product-details';
import { graphql } from '../graphql';
import { revalidate } from '../revalidate-target';

interface QuickSearch {
  searchTerm: string;
  imageWidth?: number;
  imageHeight?: number;
}

const GET_QUICK_SEARCH_RESULTS_QUERY = graphql(
  `
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
  `,
  [PRODUCT_DETAILS_FRAGMENT],
);

export const getQuickSearchResults = cache(
  async ({ searchTerm, imageHeight = 300, imageWidth = 300 }: QuickSearch) => {
    const customerId = await getSessionCustomerId();

    const response = await client.fetch({
      document: GET_QUICK_SEARCH_RESULTS_QUERY,
      variables: { filters: { searchTerm }, imageHeight, imageWidth },
      customerId,
      fetchOptions: customerId ? { cache: 'no-store' } : { next: { revalidate } },
    });

    const { products } = response.data.site.search.searchProducts;

    return {
      products: removeEdgesAndNodes(products),
    };
  },
);
