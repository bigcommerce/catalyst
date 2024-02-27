import { client } from '..';
import { graphql } from '../generated';

export const SELECT_CHECKOUT_SHIPPING_OPTION_MUTATION = /* GraphQL */ `
  mutation SelectCheckoutShippingOption($input: SelectCheckoutShippingOptionInput!) {
    checkout {
      selectCheckoutShippingOption(input: $input) {
        checkout {
          entityId
          shippingCostTotal {
            value
            currencyCode
          }
          handlingCostTotal {
            value
            currencyCode
          }
          shippingConsignments {
            selectedShippingOption {
              entityId
              description
              type
              cost {
                value
                currencyCode
              }
            }
          }
        }
      }
    }
  }
`;

export const selectCheckoutShippingOption = async ({
  checkoutEntityId,
  consignmentEntityId,
  shippingOptionEntityId,
}: {
  checkoutEntityId: string;
  consignmentEntityId: string;
  shippingOptionEntityId: string;
}) => {
  const mutation = graphql(SELECT_CHECKOUT_SHIPPING_OPTION_MUTATION);

  const response = await client.fetch({
    document: mutation,
    variables: {
      input: {
        checkoutEntityId,
        consignmentEntityId,
        data: {
          shippingOptionEntityId,
        },
      },
    },
  });

  const shippingCosts = response.data.checkout.selectCheckoutShippingOption?.checkout;

  if (shippingCosts) {
    return shippingCosts;
  }

  return null;
};
