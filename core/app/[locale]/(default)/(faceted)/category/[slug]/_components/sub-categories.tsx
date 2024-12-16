import { graphql } from '~/client/graphql';

export const CategoryTreeFragment = graphql(`
  fragment CategoryTreeFragment on Site {
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
`);
