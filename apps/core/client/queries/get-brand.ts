import { cache } from 'react';

import { client } from '..';
import { graphql } from '../generated';

export interface GetBrandOptions {
  brandId: number;
}

const GET_BRAND_QUERY = /* GraphQL */ `
  query getBrand($entityId: Int!) {
    site {
      brand(entityId: $entityId) {
        entityId
        name
        path
      }
    }
  }
`;

export const getBrand = cache(async ({ brandId }: GetBrandOptions) => {
  const query = graphql(GET_BRAND_QUERY);

  const response = await client.fetch({
    document: query,
    variables: { entityId: brandId },
  });

  const brand = response.data.site.brand;

  if (!brand) {
    return null;
  }

  return brand;
});
