import client from '~/client';

import { BaseFooterMenu } from './BaseFooterMenu';

export const CategoryFooterMenu = async () => {
  const categoryTree = await client.getCategoryTree();

  if (!categoryTree.length) {
    return null;
  }

  return <BaseFooterMenu items={categoryTree} title="Categories" />;
};
