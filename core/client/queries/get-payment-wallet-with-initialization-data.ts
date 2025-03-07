import { getSessionCustomerAccessToken } from '~/auth';
import { graphql } from '~/client/graphql';

import { client } from '..';

export async function getPaymentWalletWithInitializationData(entityId: string) {
  const graphQLQuery = graphql(`
    query PaymentWalletInitializationData($entityId: String!) {
      site {
        paymentWalletWithInitializationData(filter: { paymentWalletEntityId: $entityId }) {
          clientToken
          initializationData
        }
      }
    }
  `);

  try {
    return await client.fetch({
      document: graphQLQuery,
      customerAccessToken: await getSessionCustomerAccessToken(),
      fetchOptions: { cache: 'no-store' },
      variables: { entityId },
    });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(error);

    throw error;
  }
}
