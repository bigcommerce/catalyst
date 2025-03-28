import { getSessionCustomerAccessToken } from '~/auth';
import { graphql } from '~/client/graphql';

import { client } from '..';

const PaymentWalletWithInitializationDataQuery = graphql(`
  query PaymentWalletWithInitializationDataQuery($entityId: String!) {
    site {
      paymentWalletWithInitializationData(filter: { paymentWalletEntityId: $entityId }) {
        clientToken
        initializationData
      }
    }
  }
`);

export async function getPaymentWalletWithInitializationData(entityId: string) {
  try {
    return await client.fetch({
      document: PaymentWalletWithInitializationDataQuery,
      variables: {
        entityId,
      },
      customerAccessToken: await getSessionCustomerAccessToken(),
      fetchOptions: { cache: 'no-store' },
    });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(error);

    throw error;
  }
}
