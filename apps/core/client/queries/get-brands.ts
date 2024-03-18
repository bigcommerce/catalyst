import { removeEdgesAndNodes } from '@bigcommerce/catalyst-client';
import { cache } from 'react';

import { client } from '..';
import { graphql } from '../graphql';
import { revalidate } from '../revalidate-target';

interface GetBrandsOptions {
  first?: number;
  brandIds?: number[];
}

const GET_BRANDS_QUERY = graphql(`
  query getBrands($first: Int, $entityIds: [Int!]) {
    site {
      brands(first: $first, entityIds: $entityIds) {
        edges {
          node {
            entityId
            name
            path
          }
        }
      }
    }
  }
`);

export const getBrands = cache(async ({ first = 5, brandIds }: GetBrandsOptions = {}) => {
  const response = await client.fetch({
    document: GET_BRANDS_QUERY,
    variables: { first, entityIds: brandIds },
    fetchOptions: { next: { revalidate } },
  });

  const { brands } = response.data.site;

  return removeEdgesAndNodes(brands);
});
