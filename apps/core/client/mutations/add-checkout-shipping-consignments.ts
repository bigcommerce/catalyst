import { getSessionCustomerId } from '~/auth';

import { client } from '..';
import { graphql, VariablesOf } from '../graphql';

const ADD_CHECKOUT_SHIPPING_CONSIGNMENTS_MUTATION = graphql(`
  mutation AddCheckoutShippingConsignments($input: AddCheckoutShippingConsignmentsInput!) {
    checkout {
      addCheckoutShippingConsignments(input: $input) {
        checkout {
          entityId
        }
      }
    }
  }
`);

type Input = VariablesOf<typeof ADD_CHECKOUT_SHIPPING_CONSIGNMENTS_MUTATION>['input'];
type CheckoutId = Input['checkoutEntityId'];
type Consignment = Input['data']['consignments'][number];
type CheckoutAddressInput = Consignment['address'];
type LineItemsInput = Consignment['lineItems'];

interface AddCheckoutShippingConsignmentsProps {
  checkoutId: CheckoutId;
  countryCode: CheckoutAddressInput['countryCode'];
  stateOrProvince: CheckoutAddressInput['stateOrProvince'];
  city: CheckoutAddressInput['city'];
  postalCode: CheckoutAddressInput['postalCode'];
  shouldSaveAddress?: CheckoutAddressInput['shouldSaveAddress'];
  lineItems: LineItemsInput;
}

export const addCheckoutShippingConsignments = async ({
  checkoutId,
  countryCode,
  stateOrProvince,
  city,
  postalCode,
  lineItems,
  shouldSaveAddress = false,
}: AddCheckoutShippingConsignmentsProps) => {
  const customerId = await getSessionCustomerId();

  const response = await client.fetch({
    document: ADD_CHECKOUT_SHIPPING_CONSIGNMENTS_MUTATION,
    variables: {
      input: {
        checkoutEntityId: checkoutId,
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
              lineItems,
            },
          ],
        },
      },
    },
    customerId,
    fetchOptions: { cache: 'no-store' },
  });

  const checkout = response.data.checkout.addCheckoutShippingConsignments?.checkout;

  if (checkout) {
    return checkout;
  }

  throw new Error('Something went wrong adding shipping info.');
};
