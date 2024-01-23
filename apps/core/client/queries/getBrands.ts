import { removeEdgesAndNodes } from '@bigcommerce/catalyst-client';
import { cache } from 'react';

import { client } from '..';
import { graphql } from '../generated';

interface GetBrandsOptions {
  first?: number;
  brandIds?: number[];
}

const GET_BRANDS_QUERY = /* GraphQL */ `
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
`;

export const getBrands = cache(async ({ first = 5, brandIds }: GetBrandsOptions = {}) => {
  const query = graphql(GET_BRANDS_QUERY);

  const response = await client.fetch({
    document: query,
    variables: { first, entityIds: brandIds },
  });

  const { brands } = response.data.site;

  return removeEdgesAndNodes(brands);
});
