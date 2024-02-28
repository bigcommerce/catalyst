import { cache } from 'react';

import { getSessionCustomerId } from '~/auth';

import { client } from '..';
import { graphql } from '../generated';
import { revalidate } from '../revalidate-target';

export const GET_CATEGORY_TREE_QUERY = /* GraphQL */ `
  query getCategoryTree($categoryId: Int) {
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
`;

export const getCategoryTree = cache(async (categoryId?: number) => {
  const query = graphql(GET_CATEGORY_TREE_QUERY);
  const customerId = await getSessionCustomerId();

  const response = await client.fetch({
    document: query,
    variables: { categoryId },
    customerId,
    fetchOptions: customerId ? { cache: 'no-store' } : { next: { revalidate } },
  });

  return response.data.site.categoryTree;
});
