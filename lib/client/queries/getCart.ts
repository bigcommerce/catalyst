import { bigcommerceFetch } from '@client/fetcher';

import { generateQueryOp, QueryGenqlSelection, QueryResult } from '../generated';

export const getCart = async (entityId: string) => {
  const query = {
    site: {
      cart: {
        __args: {
          entityId,
        },
        lineItems: {
          totalQuantity: true,
          physicalItems: {
            name: true,
            imageUrl: true,
            entityId: true,
            quantity: true,
            listPrice: {
              currencyCode: true,
              value: true,
            },
          },
        },
      },
    },
  } satisfies QueryGenqlSelection;

  const queryOp = generateQueryOp(query);

  const response = await bigcommerceFetch<QueryResult<typeof query>>({
    ...queryOp,
    // TODO: This is next-specific, move it somewhere else.
    next: {
      tags: ['cart'],
    },
  });

  return response.data.site.cart;
};
