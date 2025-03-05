import { getSessionCustomerAccessToken } from '~/auth';
import { graphql } from '~/client/graphql';

import { client } from '..';

export async function createPaymentWalletIntent(cartId: string, walletEntityId: string) {
  const graphQLQuery = graphql(`
    mutation {
      payment {
        paymentWallet {
          createPaymentWalletIntent(
            input: {cartEntityId: "${cartId}", paymentWalletEntityId: "${walletEntityId}"}
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

  try {
    return await client.fetch({
      document: graphQLQuery,
      customerAccessToken: await getSessionCustomerAccessToken(),
      fetchOptions: { cache: 'no-store' },
    });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(error);

    throw error;
  }
}
