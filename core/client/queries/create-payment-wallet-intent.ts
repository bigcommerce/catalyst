import { getSessionCustomerAccessToken } from '~/auth';
import { graphql } from '~/client/graphql';

import { client } from '..';

const CreatePaymentWalletIntentMutation = graphql(`
  mutation CreatePaymentWalletIntentMutation($cartId: String!, $walletEntityId: String!) {
    payment {
      paymentWallet {
        createPaymentWalletIntent(
          input: { cartEntityId: $cartId, paymentWalletEntityId: $walletEntityId }
        ) {
          errors {
            ... on CreatePaymentWalletIntentGenericError {
              __typename
              message
            }
          }
          paymentWalletIntentData {
            ... on PayPalCommercePaymentWalletIntentData {
              __typename
              approvalUrl
              orderId
            }
          }
        }
      }
    }
  }
`);

export async function createPaymentWalletIntent(cartId: string, walletEntityId: string) {
  try {
    return await client.fetch({
      document: CreatePaymentWalletIntentMutation,
      customerAccessToken: await getSessionCustomerAccessToken(),
      variables: {
        cartId,
        walletEntityId,
      },
      fetchOptions: { cache: 'no-store' },
    });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(error);

    throw error;
  }
}
