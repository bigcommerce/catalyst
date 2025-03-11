import { removeEdgesAndNodes } from '@bigcommerce/catalyst-client';
import { VariablesOf } from 'gql.tada';
import { cache } from 'react';

import { getSessionCustomerAccessToken } from '~/auth';
import { client } from '~/client';
import { graphql } from '~/client/graphql';
import { revalidate } from '~/client/revalidate-target';

const CompareProductsQuery = graphql(`
  query CompareProductsQuery($entityIds: [Int!]) {
    site {
      products(entityIds: $entityIds) {
        edges {
          node {
            entityId
            name
            defaultImage {
              url: urlTemplate(lossy: true)
              altText
            }
            path
          }
        }
      }
    }
  }
`);

type Variables = VariablesOf<typeof CompareProductsQuery>;

export const getCompareProducts = cache(async (variables: Variables) => {
  const customerAccessToken = await getSessionCustomerAccessToken();

  const response = await client.fetch({
    document: CompareProductsQuery,
    variables,
    customerAccessToken,
    fetchOptions: customerAccessToken ? { cache: 'no-store' } : { next: { revalidate } },
  });

  return removeEdgesAndNodes(response.data.site.products);
});
