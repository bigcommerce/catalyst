import { getBrands } from '~/client/queries/getBrands';

import { BaseFooterMenu } from './BaseFooterMenu';

export const BrandFooterMenu = async () => {
  const brands = await getBrands();

  if (!brands.length) {
    return null;
  }

  return <BaseFooterMenu items={brands} title="Brands" />;
};
