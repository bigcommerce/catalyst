import { BigCommerceResponse, FetcherInput } from '../fetcher';
import { generateQueryOp, QueryGenqlSelection, QueryResult } from '../generated';

export async function getCart<T>(
  customFetch: <U>(data: FetcherInput) => Promise<BigCommerceResponse<U>>,
  entityId: string,
  config: T = {} as T,
) {
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
            productEntityId: true,
            variantEntityId: true,
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
            selectedOptions: {
              __typename: true,
              entityId: true,
              name: true,
              on_CartSelectedMultipleChoiceOption: {
                value: true,
              },
              on_CartSelectedCheckboxOption: {
                value: true,
              },
              on_CartSelectedNumberFieldOption: {
                number: true,
              },
              on_CartSelectedMultiLineTextFieldOption: {
                text: true,
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
}
