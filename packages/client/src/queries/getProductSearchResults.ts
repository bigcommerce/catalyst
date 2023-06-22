import { BigCommerceResponse, FetcherInput } from '../fetcher';
import { generateQueryOp, QueryResult } from '../generated';
import { removeEdgesAndNodes } from '../utils/removeEdgesAndNodes';

export interface ProductSearch {
  searchTerm: string;
  limit?: number;
  before?: string;
  after?: string;
}

export const getProductSearchResults = async <T>(
  customFetch: <U>(data: FetcherInput) => Promise<BigCommerceResponse<U>>,
  { searchTerm, limit = 9, before, after }: ProductSearch,
  config: T = {} as T,
) => {
  const paginationArgs = before ? { last: limit, before } : { first: limit, after };

  const query = {
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
  };

  const queryOp = generateQueryOp(query);
  const response = await customFetch<QueryResult<typeof query>>({
    ...queryOp,
    ...config,
  });
  const { site } = response.data;

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
