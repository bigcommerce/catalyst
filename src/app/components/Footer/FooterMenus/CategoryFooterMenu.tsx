import { bcFetch } from '../../../../lib/fetcher';

import { BaseFooterMenu } from './BaseFooterMenu';
import { getCategoryMenuQuery } from './query';

export const CategoryFooterMenu = async () => {
  const { data } = await bcFetch({
    query: getCategoryMenuQuery,
  });

  if (!data.site.categoryTree.length) {
    return null;
  }

  return <BaseFooterMenu items={data.site.categoryTree} title="Categories" />;
};
