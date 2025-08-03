import { removeEdgesAndNodes } from '@bigcommerce/catalyst-client';
import { cache } from 'react';

import { getSessionCustomerAccessToken } from '~/auth';
import { client } from '~/client';
import { graphql } from '~/client/graphql';
import { revalidate } from '~/client/revalidate-target';

export const SiteMapBrands = graphql(
  `
    query VisualSiteMap {
      site {
        brands(first: 50) {
          edges {
            node {
              id
              name
              path
            }
          }
        }
      }
    }
  `,
  [],
);

export const getSiteMapBrandsData = cache(async () => {
  const customerAccessToken = await getSessionCustomerAccessToken();

  const { data } = await client.fetch({
    document: SiteMapBrands,
    variables: {},
    customerAccessToken,
    fetchOptions: customerAccessToken ? { cache: 'no-store' } : { next: { revalidate } },
  });

  return removeEdgesAndNodes(data.site.brands);
});
