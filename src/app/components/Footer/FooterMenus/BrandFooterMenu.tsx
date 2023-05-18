import { removeEdgesAndNodes } from '@/lib/removeEdgesAndNodes';

import { bcFetch } from '../../../../lib/fetcher';

import { BaseFooterMenu } from './BaseFooterMenu';
import { getBrandMenuQuery } from './query';

export const BrandFooterMenu = async () => {
  const { data } = await bcFetch({
    query: getBrandMenuQuery,
  });

  const brands = removeEdgesAndNodes(data.site.brands);

  if (brands.length === 0) {
    return null;
  }

  return <BaseFooterMenu items={brands} title="Brands" />;
};
