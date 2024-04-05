import { getSessionCustomerId } from '~/auth';

import { client } from '..';
import { graphql, VariablesOf } from '../graphql';

const UPDATE_CHECKOUT_SHIPPING_CONSIGNMENT = graphql(`
  mutation UpdateCheckoutShippingConsignment($input: UpdateCheckoutShippingConsignmentInput!) {
    checkout {
      updateCheckoutShippingConsignment(input: $input) {
        checkout {
          entityId
        }
      }
    }
  }
`);

type Input = VariablesOf<typeof UPDATE_CHECKOUT_SHIPPING_CONSIGNMENT>['input'];
type CheckoutId = Input['checkoutEntityId'];
type Consignment = Input['data']['consignment'];
type CheckoutAddressInput = Consignment['address'];
type LineItemsInput = Consignment['lineItems'];

interface UpdateCheckoutShippingConsignmentProps {
  checkoutId: CheckoutId;
  shippingId: string;
  countryCode: CheckoutAddressInput['countryCode'];
  stateOrProvince: CheckoutAddressInput['stateOrProvince'];
  city: CheckoutAddressInput['city'];
  postalCode: CheckoutAddressInput['postalCode'];
  shouldSaveAddress?: CheckoutAddressInput['shouldSaveAddress'];
  lineItems: LineItemsInput;
}

export const updateCheckoutShippingConsignment = async ({
  checkoutId,
  shippingId,
  countryCode,
  stateOrProvince,
  city,
  postalCode,
  lineItems,
  shouldSaveAddress = false,
}: UpdateCheckoutShippingConsignmentProps) => {
  const customerId = await getSessionCustomerId();

  const response = await client.fetch({
    document: UPDATE_CHECKOUT_SHIPPING_CONSIGNMENT,
    variables: {
      input: {
        checkoutEntityId: checkoutId,
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
            lineItems,
          },
        },
      },
    },
    customerId,
    fetchOptions: { cache: 'no-store' },
  });

  const checkout = response.data.checkout.updateCheckoutShippingConsignment?.checkout;

  if (checkout) {
    return checkout;
  }

  return null;
};
