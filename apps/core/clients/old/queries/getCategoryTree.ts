import { BigCommerceResponse, FetcherInput } from '../fetcher';
import { generateQueryOp, QueryGenqlSelection, QueryResult } from '../generated';

export const getCategoryTree = async <T>(
  customFetch: <U>(data: FetcherInput) => Promise<BigCommerceResponse<U>>,
  rootEntityId?: number,
  config: T = {} as T,
) => {
  const Category = {
    entityId: true,
    name: true,
    path: true,
  };

  const query = {
    site: {
      categoryTree: {
        __args: {
          rootEntityId,
        },
        ...Category,
        children: {
          ...Category,
          children: {
            ...Category,
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

  return response.data.site.categoryTree;
};
