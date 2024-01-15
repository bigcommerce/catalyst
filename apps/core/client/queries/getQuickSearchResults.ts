import { removeEdgesAndNodes } from '@bigcommerce/catalyst-client-new';

import { newClient } from '..';
import { graphql } from '../generated';

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

export const getQuickSearchResults = async ({
  searchTerm,
  imageHeight = 300,
  imageWidth = 300,
}: QuickSearch) => {
  const query = graphql(GET_QUICK_SEARCH_RESULTS_QUERY);

  const response = await newClient.fetch({
    document: query,
    variables: { filters: { searchTerm }, imageHeight, imageWidth },
  });

  const { products } = response.data.site.search.searchProducts;

  return {
    products: removeEdgesAndNodes(products),
  };
};
