import { removeEdgesAndNodes } from '@bigcommerce/catalyst-client';
import { cache } from 'react';

import { getSessionCustomerAccessToken } from '~/auth';
import { client } from '~/client';
import { graphql, ResultOf } from '~/client/graphql';
import { revalidate } from '~/client/revalidate-target';

const GetCategoriesByIdsQuery = graphql(
  `
    query GetCategoriesByIds($entityIds: [Int!]) {
      site {
        categories(entityIds: $entityIds) {
          edges {
            node {
              id
              name
              path
              description
              parentId
              defaultImage {
                url(width: 300)
                altText
              }
              breadcrumbs {
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

export type GetCategoriesResponse = Array<
  NonNullable<
    ResultOf<typeof GetCategoriesByIdsQuery>['site']['categories']['edges']
  >[number]['node']
>;

const getCategoriesByIds = cache(async (entityIds: number[]) => {
  const customerAccessToken = await getSessionCustomerAccessToken();

  try {
    const response = await client.fetch({
      document: GetCategoriesByIdsQuery,
      variables: { entityIds },
      customerAccessToken,
      fetchOptions: customerAccessToken ? { cache: 'no-store' } : { next: { revalidate } },
    });

    const { categories } = response.data.site;

    return {
      status: 'success',
      categories: removeEdgesAndNodes(categories),
    };
  } catch (error: unknown) {
    if (error instanceof Error) {
      return { status: 'error', error: error.message };
    }

    return { status: 'error', error: 'Something went wrong. Please try again.' };
  }
});

export {