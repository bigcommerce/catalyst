import { client } from '../client';

export const getCategoryTree = async () => {
  const Category = {
    entityId: true,
    name: true,
    path: true,
  };

  const response = await client.query({
    site: {
      categoryTree: {
        ...Category,
        children: {
          ...Category,
          children: {
            ...Category,
          },
        },
      },
    },
  });

  return response.site.categoryTree;
};
