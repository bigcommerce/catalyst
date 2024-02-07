import { getCategoryTree } from '~/client/queries/get-category-tree';

import { BaseFooterMenu } from './base-footer-menu';

export const CategoryFooterMenu = async () => {
  const categoryTree = await getCategoryTree();

  if (!categoryTree.length) {
    return null;
  }

  return <BaseFooterMenu items={categoryTree} title="Categories" />;
};
