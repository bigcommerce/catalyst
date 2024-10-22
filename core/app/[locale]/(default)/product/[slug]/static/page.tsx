import { removeEdgesAndNodes } from '@bigcommerce/catalyst-client';
import { Metadata } from 'next';
import { cache } from 'react';

import { getSessionCustomerId } from '~/auth';
import { getChannelIdFromLocale } from '~/channels.config';
import { client } from '~/client';
import { graphql } from '~/client/graphql';
import { revalidate as revalidateTarget } from '~/client/revalidate-target';
import { locales, LocaleType } from '~/i18n/routing';

import ProductPage from '../page';
import { getProduct } from '../page-data';

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

interface Props {
  params: Promise<{ slug: string; locale: LocaleType }>;
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const params = await props.params;
  const productId = Number(params.slug);

  const product = await getProduct({
    entityId: productId,
    useDefaultOptionSelections: true,
  });

  if (!product) {
    return {};
  }

  const { pageTitle, metaDescription, metaKeywords } = product.seo;
  const { url, altText: alt } = product.defaultImage || {};

  return {
    title: pageTitle || product.name,
    description: metaDescription || `${product.plainTextDescription.slice(0, 150)}...`,
    keywords: metaKeywords ? metaKeywords.split(',') : null,
    openGraph: url
      ? {
          images: [
            {
              url,
              alt,
            },
          ],
        }
      : null,
  };
}

export const dynamic = 'force-static';
export const revalidate = 600;
