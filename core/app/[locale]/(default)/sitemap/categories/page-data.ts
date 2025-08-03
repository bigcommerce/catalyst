import { cache } from 'react';

import { getSessionCustomerAccessToken } from '~/auth';
import { client } from '~/client';
import { graphql } from '~/client/graphql';
import { revalidate } from '~/client/revalidate-target';

export const SiteMapCategories = graphql(
  `
    query VisualSiteMap {
      site {
        categoryTree {
          name
          path
          children {
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
    }
  `,
  [],
);

export const getSiteMapCategoriesData = cache(async () => {
  const customerAccessToken = await getSessionCustomerAccessToken();

  const { data } = await client.fetch({
    document: SiteMapCategories,
    variables: {},
    customerAccessToken,
    fetchOptions: customerAccessToken ? { cache: 'no-store' } : { next: { revalidate } },
  });

  return data.site.categoryTree;
});
