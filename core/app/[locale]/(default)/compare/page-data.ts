import { removeEdgesAndNodes } from '@bigcommerce/catalyst-client';
import { cache } from 'react';

import { client } from '~/client';
import { graphql } from '~/client/graphql';
import { revalidate } from '~/client/revalidate-target';
import { CurrencyCode } from '~/components/header/fragment';
import { ProductCardFragment } from '~/components/product-card/fragment';

export const MAX_COMPARE_LIMIT = 10;

const ComparedProductsQuery = graphql(
  `
    query ComparedProductsQuery($entityIds: [Int!], $first: Int, $currencyCode: currencyCode) {
      site {
        products(entityIds: $entityIds, first: $first) {
          edges {
            node {
              ...ProductCardFragment
              description
              sku
              weight {
                value
                unit
              }
              condition
              customFields {
                edges {
                  node {
                    entityId
                    name
                    value
                  }
                }
              }
              productOptions(first: 1) {
                edges {
                  node {
                    entityId
                  }
                }
              }
              inventory {
                isInStock
              }
              availabilityV2 {
                status
              }
            }
          }
        }
      }
    }
  `,
  [ProductCardFragment],
);

export const getComparedProducts = cache(
  async (productIds: number[] = [], currencyCode?: CurrencyCode, customerAccessToken?: string) => {
    if (productIds.length === 0) {
      return [];
    }

    const { data } = await client.fetch({
      document: ComparedProductsQuery,
      variables: {
        entityIds: productIds,
        first: productIds.length ? MAX_COMPARE_LIMIT : 0,
        currencyCode,
      },
      customerAccessToken,
      fetchOptions: customerAccessToken ? { cache: 'no-store' } : { next: { revalidate } },
    });

    return removeEdgesAndNodes(data.site.products);
  },
);
