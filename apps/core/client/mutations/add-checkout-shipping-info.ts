import { client } from '..';
import { graphql, VariablesOf } from '../graphql';

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

type Input = VariablesOf<typeof ADD_CHECKOUT_SHIPPING_INFO_MUTATION>['input'];
type CartId = Input['checkoutEntityId'];
type Consignment = Input['data']['consignments'][number];
type CheckoutAddressInput = Consignment['address'];
type CartItemsInput = Consignment['lineItems'];

interface AddCheckoutShippingInfoProps {
  cartId: CartId;
  countryCode: CheckoutAddressInput['countryCode'];
  stateOrProvince: CheckoutAddressInput['stateOrProvince'];
  city: CheckoutAddressInput['city'];
  postalCode: CheckoutAddressInput['postalCode'];
  shouldSaveAddress?: CheckoutAddressInput['shouldSaveAddress'];
  cartItems: CartItemsInput;
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
