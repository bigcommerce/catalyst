import { removeEdgesAndNodes } from '@bigcommerce/catalyst-client';
import { VariablesOf } from 'gql.tada';
import { cache } from 'react';
import { z } from 'zod';

import { getSessionCustomerAccessToken } from '~/auth';
import { client } from '~/client';
import { graphql } from '~/client/graphql';
import { revalidate } from '~/client/revalidate-target';

import { MAX_COMPARE_LIMIT } from '../compare/page-data';

const CompareProductsSchema = z.object({
  entityIds: z
    .array(
      z.preprocess(
        (val) => (!Number.isNaN(val) ? val : undefined), // Remove NaN before validation
        z.number().optional(),
      ),
    )
    .transform((arr) => arr.filter((num) => num !== undefined)), // Remove `undefined` values
});

const CompareProductsQuery = graphql(`
  query CompareProductsQuery($entityIds: [Int!], $first: Int) {
    site {
      products(entityIds: $entityIds, first: $first) {
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

  const parsedVariables = CompareProductsSchema.parse(variables);

  if (parsedVariables.entityIds.length === 0) {
    return [];
  }

  const response = await client.fetch({
    document: CompareProductsQuery,
    variables: { ...parsedVariables, first: MAX_COMPARE_LIMIT },
    customerAccessToken,
    fetchOptions: customerAccessToken ? { cache: 'no-store' } : { next: { revalidate } },
  });

  return removeEdgesAndNodes(response.data.site.products);
});
