import { BigCommerceResponse, FetcherInput } from '../fetcher';
import { generateQueryOp, QueryGenqlSelection, QueryResult } from '../generated';

import { reshapeProductOptions } from './getProduct';

export interface GetRouteOptions {
  path: string;
  withSearchParams?: boolean;
}

export const getRoute = async <T>(
  customFetch: <U>(data: FetcherInput) => Promise<BigCommerceResponse<U>>,
  { path, withSearchParams = false }: GetRouteOptions,
  config: T = {} as T,
) => {
  const ProductOptions = {
    productOptions: {
      __args: { first: 3 },
      edges: {
        node: {
          __typename: true,
          entityId: true,
          displayName: true,
          isRequired: true,
          on_MultipleChoiceOption: {
            displayStyle: true,
            values: {
              __args: { first: 10 },
              edges: {
                node: {
                  __typename: true,
                  entityId: true,
                  label: true,
                },
              },
            },
          },
        },
      },
    },
  };

  const query = {
    site: {
      route: {
        __args: {
          path,
        },
        node: {
          __typename: true,
          on_Product: {
            entityId: true,
            ...(withSearchParams && ProductOptions),
          },
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

  const entity = response.data.site.route.node;

  if (entity && entity.__typename === 'Product' && typeof entity.productOptions === 'object') {
    return {
      ...entity,
      productOptions: reshapeProductOptions(entity.productOptions),
    };
  }

  return entity;
};
