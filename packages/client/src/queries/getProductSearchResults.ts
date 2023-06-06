import { client } from '../client';
import { removeEdgesAndNodes } from '../utils/removeEdgesAndNodes';

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
                name: true,
                path: true,
                brand: {
                  name: true,
                },
                prices: {
                  price: {
                    value: true,
                  },
                },
                defaultImage: {
                  url: {
                    __args: { width: 300 },
                  },
                  altText: true,
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
