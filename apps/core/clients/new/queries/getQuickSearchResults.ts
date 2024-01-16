import { removeEdgesAndNodes } from '../utils/removeEdgesAndNodes';

import { newClient } from '../..';
import { graphql } from '../generated';

const GET_QUICK_SEARCH_RESULTS_QUERY = /* GraphQL */ `
  query getQuickSearchResults($filters: SearchProductsFiltersInput!) {
    site {
      search {
        searchProducts(filters: $filters) {
          products(first: 5) {
            edges {
              node {
                brand {
                  name
                  path
                }
                categories {
                  edges {
                    node {
                      name
                      path
                    }
                  }
                }
                defaultImage {
                  url(width: 150)
                  altText
                }
                entityId
                name
                path
                ...Prices
              }
            }
          }
        }
      }
    }
  }
`;

export const getQuickSearchResults = async (searchTerm: string) => {
  const query = graphql(GET_QUICK_SEARCH_RESULTS_QUERY);

  const response = await newClient.fetch({
    document: query,
    variables: { filters: { searchTerm } },
  });

  const { products } = response.data.site.search.searchProducts;

  return {
    products: removeEdgesAndNodes(products),
  };
};
