import { getCategoryTree } from '@client';

import { BaseFooterMenu } from './BaseFooterMenu';

export const CategoryFooterMenu = async () => {
  const categoryTree = await getCategoryTree();

  if (!categoryTree.length) {
    return null;
  }

  return <BaseFooterMenu items={categoryTree} title="Categories" />;
};
