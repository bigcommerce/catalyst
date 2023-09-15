import client from '~/client';

import { BaseFooterMenu } from './BaseFooterMenu';

export const BrandFooterMenu = async () => {
  const brands = await client.getBrands();

  // Temp workaround until we have the middleware that converts paths to real urls
  const items = brands.map((item) => ({
    ...item,
    path: `/brand/${item.entityId}`,
  }));

  if (!items.length) {
    return null;
  }

  return <BaseFooterMenu items={items} title="Brands" />;
};
