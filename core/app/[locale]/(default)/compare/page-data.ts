import { removeEdgesAndNodes } from '@bigcommerce/catalyst-client';
import { cache } from 'react';

import { getSessionCustomerAccessToken } from '~/auth';
import { client } from '~/client';
import { graphql } from '~/client/graphql';
import { revalidate } from '~/client/revalidate-target';
import { ProductCardFragment } from '~/components/product-card/fragment';
import { getPreferredCurrencyCode } from '~/lib/currency';

export const MAX_COMPARE_LIMIT = 10;

export const CompareCardFragment = graphql(
  `
    fragment CompareCardFragment on Product {
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
  `,
  [ProductCardFragment],
);

const ComparePageQuery = graphql(
  `
    query ComparePageQuery($entityIds: [Int!], $first: Int, $currencyCode: currencyCode) {
      site {
        products(entityIds: $entityIds, first: $first) {
          edges {
            node {
              ...CompareCardFragment
              description
            }
          }
        }
      }
    }
  `,
  [CompareCardFragment],
);

export const getCompareData = cache(async (productIds: number[] = []) => {
  const customerAccessToken = await getSessionCustomerAccessToken();
  const currencyCode = await getPreferredCurrencyCode();

  const { data } = await client.fetch({
    document: ComparePageQuery,
    variables: {
      entityIds: productIds,
      first: productIds.length ? MAX_COMPARE_LIMIT : 0,
      currencyCode,
    },
    customerAccessToken,
    fetchOptions: customerAccessToken ? { cache: 'no-store' } : { next: { revalidate } },
  });

  return removeEdgesAndNodes(data.site.products);
});
