import { removeEdgesAndNodes } from '@bigcommerce/catalyst-client';
import { VariablesOf } from 'gql.tada';
import { unstable_cache } from 'next/cache';
import { cache } from 'react';
import { z } from 'zod';

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

const getCachedCompareProducts = unstable_cache(
  async (locale: string, variables: Variables) => {
    const parsedVariables = CompareProductsSchema.parse(variables);

    if (parsedVariables.entityIds.length === 0) {
      return [];
    }

    const response = await client.fetch({
      document: CompareProductsQuery,
      variables: { ...parsedVariables, first: MAX_COMPARE_LIMIT },
      locale,
      fetchOptions: { cache: 'no-store' },
    });

    return removeEdgesAndNodes(response.data.site.products);
  },
  ['get-compare-products'],
  { revalidate },
);

export const getCompareProducts = cache(
  async (locale: string, variables: Variables, customerAccessToken?: string) => {
    if (customerAccessToken) {
      const parsedVariables = CompareProductsSchema.parse(variables);

      if (parsedVariables.entityIds.length === 0) {
        return [];
      }

      const response = await client.fetch({
        document: CompareProductsQuery,
        variables: { ...parsedVariables, first: MAX_COMPARE_LIMIT },
        customerAccessToken,
        locale,
        fetchOptions: { cache: 'no-store' },
      });

      return removeEdgesAndNodes(response.data.site.products);
    }

    return getCachedCompareProducts(locale, variables);
  },
);
