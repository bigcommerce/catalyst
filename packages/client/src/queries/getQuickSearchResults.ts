import { BigCommerceResponse, FetcherInput } from '../fetcher';
import { generateQueryOp, QueryGenqlSelection, QueryResult } from '../generated';
import { removeEdgesAndNodes } from '../utils/removeEdgesAndNodes';

export const getQuickSearchResults = async <T>(
  customFetch: <U>(data: FetcherInput) => Promise<BigCommerceResponse<U>>,
  searchTerm?: string,
  config: T = {} as T,
) => {
  const query = {
    site: {
      search: {
        searchProducts: {
          __args: {
            filters: { searchTerm },
          },
          products: {
            __args: {
              first: 5,
            },
            edges: {
              node: {
                brand: {
                  name: true,
                  path: true,
                },
                categories: {
                  edges: {
                    node: {
                      name: true,
                      path: true,
                    },
                  },
                },
                defaultImage: {
                  url: {
                    __args: { width: 150, height: 150 },
                  },
                  altText: true,
                },
                entityId: true,
                name: true,
                path: true,
                prices: {
                  basePrice: {
                    currencyCode: true,
                    value: true,
                  },
                  price: {
                    currencyCode: true,
                    value: true,
                  },
                  retailPrice: {
                    currencyCode: true,
                    value: true,
                  },
                  salePrice: {
                    currencyCode: true,
                    value: true,
                  },
                  priceRange: {
                    min: {
                      value: true,
                      currencyCode: true,
                    },
                    max: {
                      value: true,
                      currencyCode: true,
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  } satisfies QueryGenqlSelection;

  const queryOp = generateQueryOp(query);

  const response = await customFetch<QueryResult<typeof query>>({
    ...queryOp,
    ...config,
  });

  const { products } = response.data.site.search.searchProducts;

  return {
    products: removeEdgesAndNodes(products),
  };
};
