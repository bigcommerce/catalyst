import { removeEdgesAndNodes } from '@bigcommerce/catalyst-client';
import { cache } from 'react';

import { getChannelIdFromLocale } from '~/channels.config';
import { client } from '~/client';
import { graphql, VariablesOf } from '~/client/graphql';
import { revalidate as revalidateTarget } from '~/client/revalidate-target';
import { locales } from '~/i18n/routing';

import BrandPage from '../page';

export default BrandPage;

export { generateMetadata } from '../page';

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

type Variables = VariablesOf<typeof BrandsQuery>;

const getBrands = cache(async (variables: Variables = {}) => {
  const response = await client.fetch({
    document: BrandsQuery,
    variables,
    fetchOptions: { next: { revalidate: revalidateTarget } },
    channelId: getChannelIdFromLocale(), // Using default channel id
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
