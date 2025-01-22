import { getSessionCustomerAccessToken } from '~/auth';
import { graphql } from '~/client/graphql';

import { client } from '..';

export async function fetchPaymentWalletButtons({ cartId }: { cartId: string }) {
  console.log(cartId, 'cartId');
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

  // await getCart(cartId);

  try {
    const data = await client.fetch({
      document: graphQLQuery,
      customerAccessToken: await getSessionCustomerAccessToken(),
      fetchOptions: { cache: 'no-store' },
    });

    console.log(data);

    const paymentMethodsList = data.data.site.paymentWallets.edges?.map((paymentWalletEdge) => {
      return paymentWalletEdge.node.entityId;
    });

    return paymentMethodsList;
  } catch (error) {

    return {};
  }
}
