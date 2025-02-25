import { cache } from 'react';

import { getSessionCustomerAccessToken } from '~/auth';
import { client } from '~/client';
import { graphql, VariablesOf } from '~/client/graphql';
import { shopperCachePolicy } from '~/client/cache-policy';
import { BreadcrumbsCategoryFragment } from '~/components/breadcrumbs/fragment';

const CategoryPageQuery = graphql(
  `
    query CategoryPageQuery($categoryId: Int!) {
      site {
        category(entityId: $categoryId) {
          entityId
          name
          ...BreadcrumbsFragment
          seo {
            pageTitle
            metaDescription
            metaKeywords
          }
        }
        categoryTree(rootEntityId: $categoryId) {
          entityId
          name
          path
          children {
            entityId
            name
            path
            children {
              entityId
              name
              path
            }
          }
        }
      }
    }
  `,
  [BreadcrumbsCategoryFragment],
);

type Variables = VariablesOf<typeof CategoryPageQuery>;

export const getCategoryPageData = cache(async (variables: Variables) => {
  const customerAccessToken = await getSessionCustomerAccessToken();

  const response = await client.fetch({
    document: CategoryPageQuery,
    variables,
    customerAccessToken,
    fetchOptions: shopperCachePolicy(customerAccessToken),
  });

  return response.data.site;
});
