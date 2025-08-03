import { removeEdgesAndNodes } from '@bigcommerce/catalyst-client';
import { cache } from 'react';

import { getSessionCustomerAccessToken } from '~/auth';
import { client } from '~/client';
import { graphql } from '~/client/graphql';
import { revalidate } from '~/client/revalidate-target';

export const SiteMapFragment = graphql(
  `
    query VisualSiteMap {
      site {
        brands(first: 20) {
          edges {
            node {
              id
              name
              path
            }
          }
        }
        categoryTree {
          name
          path
          children {
            name
            path
            children {
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

export const getSiteMapData = cache(async () => {
  const customerAccessToken = await getSessionCustomerAccessToken();

  const { data } = await client.fetch({
    document: SiteMapFragment,
    variables: {},
    customerAccessToken,
    fetchOptions: customerAccessToken ? { cache: 'no-store' } : { next: { revalidate } },
  });

  return {
    brands: removeEdgesAndNodes(data.site.brands),
    categories: data.site.categoryTree,
  };
});
