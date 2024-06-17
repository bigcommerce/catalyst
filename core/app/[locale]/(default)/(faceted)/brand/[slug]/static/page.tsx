import { removeEdgesAndNodes } from '@bigcommerce/catalyst-client';
import { cache } from 'react';

import { client } from '~/client';
import { graphql, VariablesOf } from '~/client/graphql';
import { revalidate as revalidateTarget } from '~/client/revalidate-target';
import { locales } from '~/i18n';

import BrandPage from '../page';

export default BrandPage;

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

const getBrands = cache(async (variables: BrandsQueryVariables = {}) => {
  const response = await client.fetch({
    document: BrandsQuery,
    variables,
    fetchOptions: { next: { revalidate: revalidateTarget } },
  });

  return removeEdgesAndNodes(response.data.site.brands);
});

export async function generateStaticParams() {
  const brands = await getBrands();

  return locales.map((locale) => {
    return brands.map((brand) => ({
      locale,
      slug: brand.entityId.toString(),
    }));
  });
}

export const dynamic = 'force-static';
export const revalidate = 600;
