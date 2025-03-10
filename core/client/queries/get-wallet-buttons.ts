import { getSessionCustomerAccessToken } from '~/auth';
import { graphql } from '~/client/graphql';

import { client } from '..';

export async function fetchPaymentWalletButtons(cartId: string) {
  const graphQLQuery = graphql(`
    query {
      site {
        paymentWallets(filter: {cartEntityId: "${cartId}"}) {
          edges {
            node {
              entityId
            }
          }
        }
      }
    }
  `);

  try {
    const data = await client.fetch({
      document: graphQLQuery,
      customerAccessToken: await getSessionCustomerAccessToken(),
      fetchOptions: { cache: 'no-store' },
    });

    return data.data.site.paymentWallets.edges?.map(
      (paymentWalletEdge) => paymentWalletEdge.node.entityId,
    );
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(error);

    throw error;
  }
}
