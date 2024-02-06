import { getBrands } from '~/client/queries/get-brands';

import { BaseFooterMenu } from './base-footer-menu';

export const BrandFooterMenu = async () => {
  const brands = await getBrands();

  if (!brands.length) {
    return null;
  }

  return <BaseFooterMenu items={brands} title="Brands" />;
};
