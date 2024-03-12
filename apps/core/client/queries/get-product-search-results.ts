import { removeEdgesAndNodes } from '@bigcommerce/catalyst-client';
import { cache } from 'react';

import { getSessionCustomerId } from '~/auth';

import { client } from '..';
import { graphql } from '../generated';
import { SearchProductsFiltersInput, SearchProductsSortInput } from '../generated/graphql';
import { revalidate } from '../revalidate-target';

interface ProductSearch {
  limit?: number;
  before?: string;
  after?: string;
  sort?: SearchProductsSortInput;
  filters: SearchProductsFiltersInput;
  imageWidth?: number;
  imageHeight?: number;
}

const GET_PRODUCT_SEARCH_RESULTS_QUERY = /* GraphQL */ `
  query getProductSearchResults(
    $first: Int
    $last: Int
    $after: String
    $before: String
    $filters: SearchProductsFiltersInput!
    $sort: SearchProductsSortInput
    $imageHeight: Int!
    $imageWidth: Int!
  ) {
    site {
      search {
        searchProducts(filters: $filters, sort: $sort) {
          products(first: $first, after: $after, last: $last, before: $before) {
            pageInfo {
              ...PageDetails
            }
            collectionInfo {
              totalItems
            }
            edges {
              node {
                ...ProductDetails
              }
            }
          }
          filters {
            edges {
              node {
                __typename
                name
                isCollapsedByDefault
                ... on BrandSearchFilter {
                  displayProductCount
                  brands {
                    pageInfo {
                      ...PageDetails
                    }
                    edges {
                      cursor
                      node {
                        entityId
                        name
                        isSelected
                        productCount
                      }
                    }
                  }
                }
                ... on CategorySearchFilter {
                  displayProductCount
                  categories {
                    pageInfo {
                      ...PageDetails
                    }
                    edges {
                      cursor
                      node {
                        entityId
                        name
                        isSelected
                        productCount
                        subCategories {
                          pageInfo {
                            ...PageDetails
                          }
                          edges {
                            cursor
                            node {
                              entityId
                              name
                              isSelected
                              productCount
                            }
                          }
                        }
                      }
                    }
                  }
                }
                ... on ProductAttributeSearchFilter {
                  displayProductCount
                  filterName
                  attributes {
                    pageInfo {
                      ...PageDetails
                    }
                    edges {
                      cursor
                      node {
                        value
                        isSelected
                        productCount
                      }
                    }
                  }
                }
                ... on RatingSearchFilter {
                  ratings {
                    pageInfo {
                      ...PageDetails
                    }
                    edges {
                      cursor
                      node {
                        value
                        isSelected
                        productCount
                      }
                    }
                  }
                }
                ... on PriceSearchFilter {
                  selected {
                    minPrice
                    maxPrice
                  }
                }
                ... on OtherSearchFilter {
                  displayProductCount
                  freeShipping {
                    isSelected
                    productCount
                  }
                  isFeatured {
                    isSelected
                    productCount
                  }
                  isInStock {
                    isSelected
                    productCount
                  }
                }
              }
            }
          }
        }
      }
    }
  }
`;

export const getProductSearchResults = cache(
  async ({
    limit = 9,
    after,
    before,
    sort,
    filters,
    imageHeight = 300,
    imageWidth = 300,
  }: ProductSearch) => {
    const query = graphql(GET_PRODUCT_SEARCH_RESULTS_QUERY);
    const customerId = await getSessionCustomerId();
    const filterArgs = { filters, sort, imageHeight, imageWidth };
    const paginationArgs = before ? { last: limit, before } : { first: limit, after };

    const response = await client.fetch({
      document: query,
      variables: { ...filterArgs, ...paginationArgs },
      customerId,
      fetchOptions: customerId ? { cache: 'no-store' } : { next: { revalidate: 300 } },
    });

    const { site } = response.data;

    const searchResults = site.search.searchProducts;

    const items = removeEdgesAndNodes(searchResults.products).map((product) => ({
      ...product,
      productOptions: removeEdgesAndNodes(product.productOptions),
      fetchOptions: { next: { revalidate } },
    }));

    return {
      facets: {
        items: removeEdgesAndNodes(searchResults.filters).map((node) => {
          switch (node.__typename) {
            case 'BrandSearchFilter':
              return {
                ...node,
                brands: removeEdgesAndNodes(node.brands),
              };

            case 'CategorySearchFilter':
              return {
                ...node,
                categories: removeEdgesAndNodes(node.categories),
              };

            case 'ProductAttributeSearchFilter':
              return {
                ...node,
                attributes: removeEdgesAndNodes(node.attributes),
              };

            case 'RatingSearchFilter':
              return {
                ...node,
                ratings: removeEdgesAndNodes(node.ratings),
              };

            default:
              return node;
          }
        }),
      },
      products: {
        collectionInfo: searchResults.products.collectionInfo,
        pageInfo: searchResults.products.pageInfo,
        items,
      },
    };
  },
);
