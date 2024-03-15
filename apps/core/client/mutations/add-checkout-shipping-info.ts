import { client } from '..';
import { CheckoutAddressInput } from '../generated/graphql';
import { graphql } from '../graphql';

const ADD_CHECKOUT_SHIPPING_INFO_MUTATION = graphql(`
  mutation AddCheckoutShippingInfo($input: AddCheckoutShippingConsignmentsInput!) {
    checkout {
      addCheckoutShippingConsignments(input: $input) {
        checkout {
          entityId
          handlingCostTotal {
            currencyCode
            value
          }
          shippingCostTotal {
            value
            currencyCode
          }
          shippingConsignments {
            entityId
            shippingCost {
              value
              currencyCode
            }
            handlingCost {
              value
              currencyCode
            }
            availableShippingOptions {
              entityId
              description
              cost {
                value
                currencyCode
              }
              isRecommended
              type
            }
          }
        }
      }
    }
  }
`);

interface AddCheckoutShippingInfoProps {
  cartId: string;
  countryCode: CheckoutAddressInput['countryCode'];
  stateOrProvince: CheckoutAddressInput['stateOrProvince'];
  city: CheckoutAddressInput['city'];
  postalCode: CheckoutAddressInput['postalCode'];
  shouldSaveAddress?: CheckoutAddressInput['shouldSaveAddress'];
  cartItems: Array<{ quantity: number; lineItemEntityId: string }>;
}

export const addCheckoutShippingInfo = async ({
  cartId,
  countryCode,
  stateOrProvince,
  city,
  postalCode,
  cartItems,
  shouldSaveAddress = false,
}: AddCheckoutShippingInfoProps) => {
  const response = await client.fetch({
    document: ADD_CHECKOUT_SHIPPING_INFO_MUTATION,
    variables: {
      input: {
        checkoutEntityId: cartId,
        data: {
          consignments: [
            {
              address: {
                countryCode,
                city,
                stateOrProvince,
                shouldSaveAddress,
                postalCode,
              },
              lineItems: cartItems,
            },
          ],
        },
      },
    },
  });

  const checkout = response.data.checkout.addCheckoutShippingConsignments?.checkout;

  if (checkout) {
    return checkout;
  }

  return null;
};
