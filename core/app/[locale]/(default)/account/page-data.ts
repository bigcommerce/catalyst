import { removeEdgesAndNodes } from '@bigcommerce/catalyst-client';
import { cache } from 'react';

import { getSessionCustomerId } from '~/auth';
import { client } from '~/client';
import { graphql } from '~/client/graphql';

const AccountDataQuery = graphql(`
  query AccountQuery {
    customer {
      wishlists {
        edges {
          node {
            entityId
          }
        }
      }
    }
  }
`);

export const getAccountData = cache(async () => {
  const customerId = await getSessionCustomerId();

  const response = await client.fetch({
    document: AccountDataQuery,
    fetchOptions: { cache: 'no-store' },
    customerId,
  });

  const { customer } = response.data;

  const wishlists = customer ? removeEdgesAndNodes(customer.wishlists) : [];

  return { wishlists };
});
