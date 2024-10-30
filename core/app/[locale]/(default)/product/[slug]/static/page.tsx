import { removeEdgesAndNodes } from '@bigcommerce/catalyst-client';
import { cache } from 'react';

import { getSessionCustomerId } from '~/auth';
import { getChannelIdFromLocale } from '~/channels.config';
import { client } from '~/client';
import { graphql } from '~/client/graphql';
import { revalidate as revalidateTarget } from '~/client/revalidate-target';
import { locales } from '~/i18n/routing';

import ProductPage from '../page';

export { generateMetadata } from '../page';
export default ProductPage;

const FeaturedProductsQuery = graphql(`
  query FeaturedProductsQuery($first: Int) {
    site {
      featuredProducts(first: $first) {
        edges {
          node {
            entityId
          }
        }
      }
    }
  }
`);

interface Options {
  first?: number;
}

const getFeaturedProducts = cache(async ({ first = 12 }: Options = {}) => {
  const customerId = await getSessionCustomerId();

  const response = await client.fetch({
    document: FeaturedProductsQuery,
    variables: { first },
    customerId,
    fetchOptions: customerId ? { cache: 'no-store' } : { next: { revalidate: revalidateTarget } },
    channelId: getChannelIdFromLocale(), // Using default channel id
  });

  return removeEdgesAndNodes(response.data.site.featuredProducts);
});

export async function generateStaticParams() {
  const products = await getFeaturedProducts();

  return locales.map((locale) => {
    return products.map((product) => ({
      locale,
      slug: product.entityId.toString(),
    }));
  });
}

export const dynamic = 'force-static';
export const revalidate = 600;
