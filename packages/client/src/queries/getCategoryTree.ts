import { BigCommerceResponse, FetcherInput } from '../fetcher';
import { generateQueryOp, QueryResult } from '../generated';

export const getCategoryTree = async <T>(
  customFetch: <U>(data: FetcherInput) => Promise<BigCommerceResponse<U>>,
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
        ...Category,
        children: {
          ...Category,
          children: {
            ...Category,
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

  return response.data.site.categoryTree;
};
