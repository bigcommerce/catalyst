import { client } from '..';
import { graphql } from '../generated';
import { CheckoutAddressInput } from '../generated/graphql';

export const UPDATE_CHECKOUT_SHIPPING_INFO_MUTATION = /* GraphQL */ `
  mutation UpdateCheckoutShippingInfo($input: UpdateCheckoutShippingConsignmentInput!) {
    checkout {
      updateCheckoutShippingConsignment(input: $input) {
        checkout {
          entityId
          handlingCostTotal {
            value
            currencyCode
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
              type
              isRecommended
            }
          }
        }
      }
    }
  }
`;

interface UpdateCheckoutShippingInfoProps {
  cartId: string;
  shippingId: string;
  countryCode: CheckoutAddressInput['countryCode'];
  stateOrProvince: CheckoutAddressInput['stateOrProvince'];
  city: CheckoutAddressInput['city'];
  postalCode: CheckoutAddressInput['postalCode'];
  shouldSaveAddress?: CheckoutAddressInput['shouldSaveAddress'];
  cartItems: Array<{ quantity: number; lineItemEntityId: string }>;
}

export const updateCheckoutShippingInfo = async ({
  cartId,
  shippingId,
  countryCode,
  stateOrProvince,
  city,
  postalCode,
  cartItems,
  shouldSaveAddress = false,
}: UpdateCheckoutShippingInfoProps) => {
  const mutation = graphql(UPDATE_CHECKOUT_SHIPPING_INFO_MUTATION);

  const response = await client.fetch({
    document: mutation,
    variables: {
      input: {
        checkoutEntityId: cartId,
        consignmentEntityId: shippingId,
        data: {
          consignment: {
            address: {
              countryCode,
              city,
              stateOrProvince,
              shouldSaveAddress,
              postalCode,
            },
            lineItems: cartItems,
          },
        },
      },
    },
  });

  const checkout = response.data.checkout.updateCheckoutShippingConsignment?.checkout;

  if (checkout) {
    return checkout;
  }

  return null;
};
