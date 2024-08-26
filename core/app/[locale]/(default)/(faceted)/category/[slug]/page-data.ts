import { cache } from 'react';

import { getSessionCustomerId } from '~/auth';
import { client } from '~/client';
import { graphql, VariablesOf } from '~/client/graphql';
import { revalidate } from '~/client/revalidate-target';
import { BreadcrumbsFragment } from '~/components/breadcrumbs/fragment';

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

type Variables = VariablesOf<typeof CategoryPageQuery>;

export const getCategoryPageData = cache(async (variables: Variables) => {
  const customerId = await getSessionCustomerId();

  const response = await client.fetch({
    document: CategoryPageQuery,
    variables,
    customerId,
    fetchOptions: customerId ? { cache: 'no-store' } : { next: { revalidate } },
  });

  return response.data.site;
});
