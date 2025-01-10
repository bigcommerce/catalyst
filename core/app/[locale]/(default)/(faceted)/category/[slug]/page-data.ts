import { cache } from 'react';

import { getSessionCustomerAccessToken } from '~/auth';
import { client } from '~/client';
import { graphql, VariablesOf } from '~/client/graphql';
import { revalidate } from '~/client/revalidate-target';
import { ExistingResultType } from '~/client/util';
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

const CategoryTreeQuery = graphql(`
  query CategoryTreeQuery($categoryId: Int) {
    site {
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
`);

type CategoryTreeQueryVariables = VariablesOf<typeof CategoryTreeQuery>;

export const getCategoryTree = cache(async (variables: CategoryTreeQueryVariables = {}) => {
  const response = await client.fetch({
    document: CategoryTreeQuery,
    variables,
    fetchOptions: { next: { revalidate } },
  });

  return response.data.site.categoryTree;
});

export type Categories = ExistingResultType<typeof getCategoryTree>;
export type Category = Omit<Categories[number], 'children'> & { children?: Category[] };
