import client from '~/client';

import { BaseFooterMenu } from './BaseFooterMenu';

export const CategoryFooterMenu = async () => {
  const categoryTree = await client.getCategoryTree();

  // Temp workaround until we have the middleware that converts paths to real urls
  const items = categoryTree.map((item) => ({
    ...item,
    path: `/category/${item.entityId}`,
  }));

  if (!items.length) {
    return null;
  }

  return <BaseFooterMenu items={items} title="Categories" />;
};
