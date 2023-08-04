import { BigCommerceResponse, FetcherInput } from '../fetcher';
import { generateQueryOp, QueryGenqlSelection, QueryResult } from '../generated';
import { removeEdgesAndNodes } from '../utils/removeEdgesAndNodes';

export interface GetCategoryOptions {
  categoryId: number;
  limit?: number;
  before?: string;
  after?: string;
  breadcrumbDepth?: number;
}

export const getCategory = async <T>(
  customFetch: <U>(data: FetcherInput) => Promise<BigCommerceResponse<U>>,
  { categoryId, limit = 9, before, after, breadcrumbDepth = 10 }: GetCategoryOptions,
  config: T = {} as T,
) => {
  const paginationArgs = before ? { last: limit, before } : { first: limit, after };

  const query = {
    site: {
      category: {
        __args: { entityId: categoryId },
        name: true,
        description: true,
        path: true,
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
        breadcrumbs: {
          __args: { depth: breadcrumbDepth },
          edges: {
            node: {
              entityId: true,
              name: true,
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

  const category = response.data.site.category;

  if (!category) {
    return undefined;
  }

  return {
    ...category,
    products: {
      pageInfo: category.products.pageInfo,
      items: removeEdgesAndNodes(category.products),
    },
    breadcrumbs: {
      items: removeEdgesAndNodes(category.breadcrumbs),
    },
  };
};
