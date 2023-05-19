import { removeEdgesAndNodes } from '@client/utils/removeEdgesAndNodes';

import { client } from '../client';

interface GetCategoryOptions {
  categoryId: number;
  first?: number;
}

export const getCategory = async ({ categoryId, first = 9 }: GetCategoryOptions) => {
  const { site } = await client.query({
    site: {
      category: {
        __args: { entityId: categoryId },
        name: true,
        description: true,
        path: true,
        products: {
          __args: { first },
          pageInfo: {
            startCursor: true,
            endCursor: true,
            hasNextPage: true,
            hasPreviousPage: true,
          },
          edges: {
            node: {
              entityId: true,
              name: true,
              path: true,
              brand: {
                name: true,
              },
              defaultImage: {
                url: {
                  __args: { width: 300 },
                },
                altText: true,
              },
            },
          },
        },
      },
    },
  });

  const category = site.category;

  if (!category) {
    return undefined;
  }

  return {
    ...category,
    products: {
      pageInfo: category.products.pageInfo,
      items: removeEdgesAndNodes(category.products),
    },
  };
};
