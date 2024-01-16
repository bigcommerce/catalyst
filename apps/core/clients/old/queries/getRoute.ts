import { BigCommerceResponse, FetcherInput } from '../fetcher';
import { generateQueryOp, QueryGenqlSelection, QueryResult } from '../generated';

export interface GetRouteOptions {
  path: string;
}

export const getRoute = async <T>(
  customFetch: <U>(data: FetcherInput) => Promise<BigCommerceResponse<U>>,
  { path }: GetRouteOptions,
  config: T = {} as T,
) => {
  const query = {
    site: {
      route: {
        __args: {
          path,
          redirectBehavior: 'IGNORE',
        },
        node: {
          __typename: true,
          on_Product: { entityId: true },
          on_Category: { entityId: true },
          on_Brand: { entityId: true },
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

  return site.route.node;
};
