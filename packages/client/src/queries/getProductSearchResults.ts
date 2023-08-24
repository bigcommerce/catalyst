import { BigCommerceResponse, FetcherInput } from '../fetcher';
import {
  generateQueryOp,
  QueryGenqlSelection,
  QueryResult,
  SearchProductsFiltersInput,
  SearchProductsSortInput,
} from '../generated';
import { removeEdgesAndNodes } from '../utils/removeEdgesAndNodes';

export interface ProductSearch {
  limit?: number;
  before?: string;
  after?: string;
  sort?: SearchProductsSortInput;
  filters?: SearchProductsFiltersInput;
}

export const getProductSearchResults = async <T>(
  customFetch: <U>(data: FetcherInput) => Promise<BigCommerceResponse<U>>,
  { limit = 9, before, after, sort, filters = {} }: ProductSearch,
  config: T = {} as T,
) => {
  const paginationArgs = before ? { last: limit, before } : { first: limit, after };

  const query = {
    site: {
      search: {
        searchProducts: {
          __args: {
            filters,
            sort,
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
            collectionInfo: {
              totalItems: true,
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
                    currencyCode: true,
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
          filters: {
            edges: {
              node: {
                __scalar: true,
                on_BrandSearchFilter: {
                  __scalar: true,
                  brands: {
                    edges: {
                      node: {
                        __scalar: true,
                      },
                    },
                  },
                },
                on_CategorySearchFilter: {
                  __scalar: true,
                  categories: {
                    edges: {
                      node: {
                        __scalar: true,
                      },
                    },
                  },
                },
                on_ProductAttributeSearchFilter: {
                  __scalar: true,
                  attributes: {
                    edges: {
                      node: {
                        __scalar: true,
                      },
                    },
                  },
                },
                on_RatingSearchFilter: {
                  __scalar: true,
                  ratings: {
                    edges: {
                      node: {
                        __scalar: true,
                      },
                    },
                  },
                },
                on_PriceSearchFilter: {
                  selected: {
                    __scalar: true,
                  },
                },
                on_OtherSearchFilter: {
                  __scalar: true,
                  freeShipping: {
                    __scalar: true,
                  },
                  isFeatured: {
                    __scalar: true,
                  },
                  isInStock: {
                    __scalar: true,
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
  const { site } = response.data;

  const searchResults = site.search.searchProducts;

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
      items: removeEdgesAndNodes(searchResults.products),
    },
  };
};
