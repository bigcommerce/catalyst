import { cache } from 'react';

import { getSessionCustomerAccessToken } from '~/auth';

import { client } from '..';
import { graphql } from '../graphql';
import { TAGS } from '../tags';

const MoneyFieldFragment = graphql(`
  fragment MoneyFieldFragment on Money {
    currencyCode
    value
  }
`);

const CheckoutCouponFieldsFragment = graphql(`
  fragment CheckoutCouponFieldsFragment on CheckoutCoupon {
    entityId
    code
    couponType
    discountedAmount {
      ...MoneyFieldFragment
    }
  }
`);

const GetCartQuery = graphql(
  `
    query GetCartQuery($cartId: String) {
      site {
        cart(entityId: $cartId) {
          entityId
          isTaxIncluded
          currencyCode
          id
          updatedAt {
            utc
          }
          createdAt {
            utc
          }
          discounts {
            entityId
            discountedAmount {
              currencyCode
              value
            }
          }
          baseAmount {
            currencyCode
            value
          }
          lineItems {
            totalQuantity
            customItems {
              entityId
              extendedListPrice {
                value
              }
              listPrice {
                value
              }
              name
              quantity
              sku
            }
            giftCertificates {
              amount {
                value
              }
              recipient {
                email
                name
              }
              sender {
                email
                name
              }
              theme
              entityId
              isTaxable
              message
              name
            }
            physicalItems {
              name
              brand
              imageUrl
              entityId
              quantity
              productEntityId
              variantEntityId
              couponAmount {
                value
                currencyCode
              }
              discountedAmount {
                value
              }
              discounts {
                discountedAmount {
                  value
                }
                entityId
              }
              extendedListPrice {
                ...MoneyFieldFragment
              }
              extendedSalePrice {
                ...MoneyFieldFragment
              }
              giftWrapping {
                amount {
                  value
                }
                message
                name
              }
              listPrice {
                value
              }
              originalPrice {
                value
              }
              salePrice {
                value
              }
              sku
              url
              isShippingRequired
              isTaxable
              selectedOptions {
                __typename
                entityId
                name
                ... on CartSelectedMultipleChoiceOption {
                  value
                  valueEntityId
                }
                ... on CartSelectedCheckboxOption {
                  value
                  valueEntityId
                }
                ... on CartSelectedNumberFieldOption {
                  number
                }
                ... on CartSelectedMultiLineTextFieldOption {
                  text
                }
                ... on CartSelectedTextFieldOption {
                  text
                }
                ... on CartSelectedDateFieldOption {
                  date {
                    utc
                  }
                }
              }
            }
            digitalItems {
              name
              brand
              imageUrl
              entityId
              quantity
              productEntityId
              variantEntityId
              extendedListPrice {
                ...MoneyFieldFragment
              }
              extendedSalePrice {
                ...MoneyFieldFragment
              }
              selectedOptions {
                __typename
                entityId
                name
                ... on CartSelectedMultipleChoiceOption {
                  value
                  valueEntityId
                }
                ... on CartSelectedCheckboxOption {
                  value
                  valueEntityId
                }
                ... on CartSelectedNumberFieldOption {
                  number
                }
                ... on CartSelectedMultiLineTextFieldOption {
                  text
                }
                ... on CartSelectedTextFieldOption {
                  text
                }
                ... on CartSelectedDateFieldOption {
                  date {
                    utc
                  }
                }
              }
            }
          }
          amount {
            ...MoneyFieldFragment
          }
          discountedAmount {
            ...MoneyFieldFragment
          }
        }
        checkout(entityId: $cartId) {
          coupons {
            ...CheckoutCouponFieldsFragment
          }
        }
      }
    }
  `,
  [MoneyFieldFragment, CheckoutCouponFieldsFragment],
);

export const fetchCart = async (cartId?: string, channelId?: string) => {
  const customerAccessToken = await getSessionCustomerAccessToken();

  return client.fetch({
    document: GetCartQuery,
    variables: { cartId },
    customerAccessToken,
    fetchOptions: {
      cache: 'no-store',
      next: {
        tags: [TAGS.cart],
      },
    },
    channelId,
  });
};

export const getCart = cache(async (cartId?: string, channelId?: string) => {
  const response = await fetchCart(cartId, channelId);

  const { cart, checkout } = response.data.site;

  if (!cart) {
    return;
  }

  const totalExtendedListPrice = cart.lineItems.physicalItems.reduce((acc, item) => {
    return acc + item.extendedListPrice.value;
  }, 0);

  return {
    ...cart,
    ...checkout,
    totalExtendedListPrice: {
      currencyCode: cart.currencyCode,
      value: totalExtendedListPrice,
    },
  };
});
