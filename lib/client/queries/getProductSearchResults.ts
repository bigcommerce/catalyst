import { removeEdgesAndNodes } from '@client/utils/removeEdgesAndNodes';

import { client } from '../client';

interface ProductSearch {
  searchTerm: string;
  limit?: number;
  before?: string;
  after?: string;
}

export const getProductSearchResults = async ({
  searchTerm,
  limit = 9,
  before,
  after,
}: ProductSearch) => {
  const paginationArgs = before ? { last: limit, before } : { first: limit, after };

  const { site } = await client.query({
    site: {
      search: {
        searchProducts: {
          __args: {
            filters: {
              searchTerm,
            },
          },
          products: {
            __args: {
              ...paginationArgs,
            },
            pageInfo: {
              startCursor: true,
              endCursor: true,
              hasNextPage: true,
              hasPreviousPage: true,
            },
            edges: {
              node: {
                entityId: true,
                id: true,
                sku: true,
                warranty: true,
                name: true,
                plainTextDescription: {
                  __args: { characterLimit: 2_000 },
                },
                availabilityV2: {
                  status: true,
                  description: true,
                },
                defaultImage: {
                  altText: true,
                  url: {
                    __args: { width: 320 },
                  },
                },
                productOptions: {
                  __args: { first: 3 },
                  edges: {
                    node: {
                      entityId: true,
                      displayName: true,
                      isRequired: true,
                      __typename: true,
                      on_MultipleChoiceOption: {
                        displayStyle: true,
                        values: {
                          __args: { first: 5 },
                          edges: {
                            node: {
                              entityId: true,
                              label: true,
                              isDefault: true,
                              on_SwatchOptionValue: {
                                hexColors: true,
                                imageUrl: {
                                  __args: { width: 200 },
                                },
                              },
                            },
                          },
                        },
                      },
                    },
                  },
                },
                prices: {
                  price: {
                    value: true,
                    currencyCode: true,
                  },
                },
                brand: {
                  name: true,
                },
              },
            },
          },
        },
      },
    },
  });

  const searchResults = site.search.searchProducts;

  return {
    filters: {
      searchTerm,
      ...paginationArgs,
    },
    products: {
      pageInfo: searchResults.products.pageInfo,
      items: removeEdgesAndNodes(searchResults.products),
    },
  };
};
