import { client } from '..';
import { graphql } from '../graphql';

const SELECT_CHECKOUT_SHIPPING_OPTION_MUTATION = graphql(`
  mutation SelectCheckoutShippingOption($input: SelectCheckoutShippingOptionInput!) {
    checkout {
      selectCheckoutShippingOption(input: $input) {
        checkout {
          entityId
        }
      }
    }
  }
`);

export const selectCheckoutShippingOption = async ({
  checkoutEntityId,
  consignmentEntityId,
  shippingOptionEntityId,
}: {
  checkoutEntityId: string;
  consignmentEntityId: string;
  shippingOptionEntityId: string;
}) => {
  const response = await client.fetch({
    document: SELECT_CHECKOUT_SHIPPING_OPTION_MUTATION,
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
