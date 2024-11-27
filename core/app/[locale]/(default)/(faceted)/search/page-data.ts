import { cache } from 'react';

import { getSessionCustomerAccessToken } from '~/auth';
import { client } from '~/client';
import { graphql, VariablesOf } from '~/client/graphql';
import { revalidate } from '~/client/revalidate-target';

const ProductsQuery = graphql(`
  query ProductsQuery($entityIds: [Int!]) {
    site {
      products(entityIds: $entityIds) {
        edges {
          node {
            entityId
            name
            path
            defaultImage {
              url: urlTemplate(lossy: true)
              altText
            }
          }
        }
      }
    }
  }
`);

type ProductVariables = VariablesOf<typeof ProductsQuery>;

export const getCompareProducts = cache(async (variables: ProductVariables) => {
  const customerAccessToken = await getSessionCustomerAccessToken();

  const response = await client.fetch({
    document: ProductsQuery,
    variables,
    customerAccessToken,
    fetchOptions: customerAccessToken ? { cache: 'no-store' } : { next: { revalidate } },
  });

  return response.data.site;
});
