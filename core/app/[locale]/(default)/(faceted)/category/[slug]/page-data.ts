import { cache } from 'react';

import { getSessionCustomerAccessToken } from '~/auth';
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
          path
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
  const customerAccessToken = await getSessionCustomerAccessToken();

  const response = await client.fetch({
    document: CategoryPageQuery,
    variables,
    customerAccessToken,
    fetchOptions: customerAccessToken ? { cache: 'no-store' } : { next: { revalidate } },
  });

  return response.data.site;
});

const ProductsQuery = graphql(`
  query ProductsQuery($entityIds: [Int!]) {
    site {
      products(entityIds: $entityIds) {
        edges {
          node {
            entityId
            name
            path
            defaultImage {
              url: urlTemplate(lossy: true)
              altText
            }
          }
        }
      }
    }
  }
`);

type ProductVariables = VariablesOf<typeof ProductsQuery>;

export const getCompareProducts = cache(async (variables: ProductVariables) => {
  const customerAccessToken = await getSessionCustomerAccessToken();

  const response = await client.fetch({
    document: ProductsQuery,
    variables,
    customerAccessToken,
    fetchOptions: customerAccessToken ? { cache: 'no-store' } : { next: { revalidate } },
  });

  return response.data.site;
});
