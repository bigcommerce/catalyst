import { removeEdgesAndNodes } from '@bigcommerce/catalyst-client';
import { getFormatter, getTranslations } from 'next-intl/server';

import { CarouselProduct } from '@/vibes/soul/primitives/products-carousel';
import { FeaturedProductsCarousel } from '@/vibes/soul/sections/featured-products-carousel';
import { NotFound as NotFoundSection } from '@/vibes/soul/sections/not-found';
import { client } from '~/client';
import { graphql } from '~/client/graphql';
import { revalidate } from '~/client/revalidate-target';
import { Footer } from '~/components/footer';
import { Header } from '~/components/header';
import { ProductCardFragment } from '~/components/product-card/fragment';
import { productCardTransformer } from '~/data-transformers/product-card-transformer';

const NotFoundQuery = graphql(
  `
    query NotFoundQuery {
      site {
        featuredProducts(first: 10) {
          edges {
            node {
              ...ProductCardFragment
            }
          }
        }
      }
    }
  `,
  [ProductCardFragment],
);

async function getFeaturedProducts(): Promise<CarouselProduct[]> {
  const format = await getFormatter();
  const { data } = await client.fetch({
    document: NotFoundQuery,
    fetchOptions: { next: { revalidate } },
  });

  const featuredProducts = removeEdgesAndNodes(data.site.featuredProducts);

  return productCardTransformer(featuredProducts, format);
}

export default async function NotFound() {
  const t = await getTranslations('NotFound');

  return (
    <>
      <Header />

      <NotFoundSection subtitle={t('message')} title={t('heading')} />

      <FeaturedProductsCarousel products={getFeaturedProducts()} />

      <Footer />
    </>
  );
}
