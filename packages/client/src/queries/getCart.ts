import { bigcommerceFetch } from '@client/fetcher';

import { generateQueryOp, QueryGenqlSelection, QueryResult } from '../generated';

export const getCart = async (entityId: string) => {
  const query = {
    site: {
      cart: {
        __args: {
          entityId,
        },
        entityId: true,
        isTaxIncluded: true,
        currencyCode: true,
        lineItems: {
          totalQuantity: true,
          physicalItems: {
            name: true,
            brand: true,
            imageUrl: true,
            entityId: true,
            quantity: true,
            extendedListPrice: {
              currencyCode: true,
              value: true,
            },
            extendedSalePrice: {
              currencyCode: true,
              value: true,
            },
            discountedAmount: {
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
    cache: 'no-store',
    next: {
      tags: ['cart'],
    },
  });

  const cart = response.data.site.cart;

  if (!cart) {
    return;
  }

  const totalExtendedListPrice = cart.lineItems.physicalItems.reduce((acc, item) => {
    return acc + item.extendedListPrice.value;
  }, 0);

  const totalDiscountedAmount = cart.lineItems.physicalItems.reduce((acc, item) => {
    return acc + item.discountedAmount.value;
  }, 0);

  const totalExtendedSalePrice = cart.lineItems.physicalItems.reduce((acc, item) => {
    return acc + item.extendedSalePrice.value;
  }, 0);

  return {
    ...cart,
    totalExtendedListPrice: {
      currencyCode: cart.currencyCode,
      value: totalExtendedListPrice,
    },
    totalDiscountedAmount: {
      currencyCode: cart.currencyCode,
      value: totalDiscountedAmount,
    },
    totalExtendedSalePrice: {
      currencyCode: cart.currencyCode,
      value: totalExtendedSalePrice,
    },
  };
};
