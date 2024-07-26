import { cache } from 'react';

import { getSessionCustomerAccessToken } from '~/auth';
import { client } from '~/client';
import { graphql, VariablesOf } from '~/client/graphql';
import { revalidate } from '~/client/revalidate-target';
import { BreadcrumbsFragment } from '~/components/breadcrumbs';

import { CategoryTreeFragment } from './_components/sub-categories';

const CategoryPageQuery = graphql(
  `
    query CategoryPageQuery($categoryId: Int!) {
      site {
        category(entityId: $categoryId) {
          name
          ...BreadcrumbsFragment
          seo {
            pageTitle
            metaDescription
            metaKeywords
          }
        }
        ...CategoryTreeFragment
      }
    }
  `,
  [BreadcrumbsFragment, CategoryTreeFragment],
);

type CategoryPageQueryVariables = VariablesOf<typeof CategoryPageQuery>;

export const getCategoryPageData = cache(async (variables: CategoryPageQueryVariables) => {
  const customerAccessToken = await getSessionCustomerAccessToken();

  const response = await client.fetch({
    document: CategoryPageQuery,
    variables,
    customerAccessToken,
    fetchOptions: customerAccessToken ? { cache: 'no-store' } : { next: { revalidate } },
  });

  return response.data.site;
});
