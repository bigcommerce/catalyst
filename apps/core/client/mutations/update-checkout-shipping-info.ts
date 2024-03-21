import { client } from '..';
import { graphql, VariablesOf } from '../graphql';

const UPDATE_CHECKOUT_SHIPPING_INFO_MUTATION = graphql(`
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
`);

type Input = VariablesOf<typeof UPDATE_CHECKOUT_SHIPPING_INFO_MUTATION>['input'];
type CartId = Input['checkoutEntityId'];
type Consignment = Input['data']['consignment'];
type CheckoutAddressInput = Consignment['address'];
type CartItemsInput = Consignment['lineItems'];

interface UpdateCheckoutShippingInfoProps {
  cartId: CartId;
  shippingId: string;
  countryCode: CheckoutAddressInput['countryCode'];
  stateOrProvince: CheckoutAddressInput['stateOrProvince'];
  city: CheckoutAddressInput['city'];
  postalCode: CheckoutAddressInput['postalCode'];
  shouldSaveAddress?: CheckoutAddressInput['shouldSaveAddress'];
  cartItems: CartItemsInput;
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
  const response = await client.fetch({
    document: UPDATE_CHECKOUT_SHIPPING_INFO_MUTATION,
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
