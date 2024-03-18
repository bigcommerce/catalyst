import { cache } from 'react';

import { client } from '..';
import { graphql } from '../graphql';
import { revalidate } from '../revalidate-target';

export interface GetBrandOptions {
  brandId: number;
}

const GET_BRAND_QUERY = graphql(`
  query getBrand($entityId: Int!) {
    site {
      brand(entityId: $entityId) {
        entityId
        name
        path
      }
    }
  }
`);

export const getBrand = cache(async ({ brandId }: GetBrandOptions) => {
  const response = await client.fetch({
    document: GET_BRAND_QUERY,
    variables: { entityId: brandId },
    fetchOptions: { next: { revalidate } },
  });

  const brand = response.data.site.brand;

  if (!brand) {
    return null;
  }

  return brand;
});
