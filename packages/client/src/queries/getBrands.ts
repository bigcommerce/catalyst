import { BigCommerceResponse, FetcherInput } from '../fetcher';
import { generateQueryOp, QueryGenqlSelection, QueryResult } from '../generated';
import { removeEdgesAndNodes } from '../utils/removeEdgesAndNodes';

export interface GetBrandsOptions {
  first?: number;
}

export const getBrands = async <T>(
  customFetch: <U>(data: FetcherInput) => Promise<BigCommerceResponse<U>>,
  { first = 5 }: GetBrandsOptions = {},
  config: T = {} as T,
) => {
  const query = {
    site: {
      brands: {
        __args: {
          first,
        },
        edges: {
          node: {
            name: true,
            path: true,
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

  return removeEdgesAndNodes(site.brands);
};
