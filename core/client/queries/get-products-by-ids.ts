import { removeEdgesAndNodes } from '@bigcommerce/catalyst-client';
import { cache } from 'react';

import { SearchProductFragment } from '~/components/header/_actions/fragment';
import type { CurrencyCode } from '~/components/header/fragment';

import { client } from '..';
import { graphql } from '../graphql';
import { revalidate } from '../revalidate-target';

const GetProductsByIdsQuery = graphql(
  `
    query GetProductsByIds($entityIds: [Int!]!, $currencyCode: currencyCode) {
      site {
        products(entityIds: $entityIds, first: 50) {
          edges {
            node {
              ...SearchProductFragment
            }
          }
        }
      }
    }
  `,
  [SearchProductFragment],
);

export const getProductsByIds = cache(
  async (entityIds: number[], currencyCode?: CurrencyCode, customerAccessToken?: string | null) => {
    if (entityIds.length === 0) {
      return [];
    }

    const { data } = await client.fetch({
      document: GetProductsByIdsQuery,
      variables: { entityIds, currencyCode },
      customerAccessToken: customerAccessToken ?? undefined,
      fetchOptions: customerAccessToken ? { cache: 'no-store' } : { next: { revalidate } },
    });

    return removeEdgesAndNodes(data.site.products);
  },
);
