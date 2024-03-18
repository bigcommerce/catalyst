import { cache } from 'react';

import { getSessionCustomerId } from '~/auth';

import { client } from '..';
import { graphql } from '../graphql';
import { revalidate } from '../revalidate-target';

const GET_CATEGORY_TREE_QUERY = graphql(`
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
`);

export const getCategoryTree = cache(async (categoryId?: number) => {
  const customerId = await getSessionCustomerId();

  const response = await client.fetch({
    document: GET_CATEGORY_TREE_QUERY,
    variables: { categoryId },
    customerId,
    fetchOptions: customerId ? { cache: 'no-store' } : { next: { revalidate } },
  });

  return response.data.site.categoryTree;
});
