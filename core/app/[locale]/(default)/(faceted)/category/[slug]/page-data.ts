import { cache } from 'react';

import { getSessionCustomerAccessToken } from '~/auth';
import { client } from '~/client';
import { graphql, VariablesOf } from '~/client/graphql';
import { revalidate } from '~/client/revalidate-target';
import { BreadcrumbsFragment } from '~/components/breadcrumbs/fragment';

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
  [BreadcrumbsFragment],
);

type Variables = VariablesOf<typeof CategoryPageQuery>;

export const getCategoryPageData = cache(async (categoryId: Variables['categoryId']) => {
  const customerAccessToken = await getSessionCustomerAccessToken();

  const response = await client.fetch({
    document: CategoryPageQuery,
    variables: { categoryId },
    customerAccessToken,
    fetchOptions: customerAccessToken ? { cache: 'no-store' } : { next: { revalidate } },
  });

  return response.data.site;
});
