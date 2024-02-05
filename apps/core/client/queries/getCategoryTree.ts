import { cache } from 'react';

import { client } from '..';
import { graphql } from '../generated';
import { useCustomerProvider } from '~/app/contexts/CustomerContext';

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
  const customerId = useCustomerProvider();

  const response = await client.fetch({
    document: query,
    variables: { categoryId },
    fetchOptions: {
      cache: customerId ? 'no-store' : 'force-cache',
    },
  });

  return response.data.site.categoryTree;
});
