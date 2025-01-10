import { removeEdgesAndNodes } from '@bigcommerce/catalyst-client';
import { cache } from 'react';

import { client } from '~/client';
import { graphql, VariablesOf } from '~/client/graphql';
import { revalidate } from '~/client/revalidate-target';

const BrandQuery = graphql(`
  query BrandQuery($entityId: Int!) {
    site {
      brand(entityId: $entityId) {
        name
        seo {
          pageTitle
          metaDescription
          metaKeywords
        }
      }
    }
  }
`);

type Variables = VariablesOf<typeof BrandQuery>;

export const getBrand = cache(async (variables: Variables) => {
  const response = await client.fetch({
    document: BrandQuery,
    variables,
    fetchOptions: { next: { revalidate } },
  });

  return response.data.site.brand;
});

const BrandsQuery = graphql(`
  query BrandsQuery($first: Int, $entityIds: [Int!]) {
    site {
      brands(first: $first, entityIds: $entityIds) {
        edges {
          node {
            entityId
          }
        }
      }
    }
  }
`);

type BrandsQueryVariables = VariablesOf<typeof BrandsQuery>;

export const getBrands = cache(async (variables: BrandsQueryVariables = {}) => {
  const response = await client.fetch({
    document: BrandsQuery,
    variables,
    fetchOptions: { next: { revalidate } },
  });

  return removeEdgesAndNodes(response.data.site.brands);
});
