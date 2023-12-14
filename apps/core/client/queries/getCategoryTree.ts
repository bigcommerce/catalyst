import { newClient } from '..';
import { graphql } from '../generated';

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

export const getCategoryTree = async (categoryId?: number) => {
  const query = graphql(GET_CATEGORY_TREE_QUERY);

  const response = await newClient.fetch({
    document: query,
    variables: { categoryId },
  });

  return response.data.site.categoryTree;
};
