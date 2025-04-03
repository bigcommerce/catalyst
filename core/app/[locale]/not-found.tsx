import { removeEdgesAndNodes } from '@bigcommerce/catalyst-client';
import { getFormatter, getTranslations } from 'next-intl/server';

import { FeaturedProductCarousel } from '@/vibes/soul/sections/featured-product-carousel';
import { NotFound as NotFoundSection } from '@/vibes/soul/sections/not-found';
import { CarouselProduct } from '@/vibes/soul/sections/product-carousel';
import { client } from '~/client';
import { graphql } from '~/client/graphql';
import { revalidate } from '~/client/revalidate-target';
import { Footer } from '~/components/footer';
import { Header } from '~/components/header';
import { ProductCardFragment } from '~/components/product-card/fragment';
import { productCardTransformer } from '~/data-transformers/product-card-transformer';
import { getPreferredCurrencyCode } from '~/lib/currency';

const NotFoundQuery = graphql(
  `
    query NotFoundQuery($currencyCode: currencyCode) {
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
  const currencyCode = await getPreferredCurrencyCode();
  const { data } = await client.fetch({
    document: NotFoundQuery,
    variables: { currencyCode },
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

      <NotFoundSection subtitle={t('subtitle')} title={t('title')} />

      <FeaturedProductCarousel products={getFeaturedProducts()} title={t('featuredProducts')} />

      <Footer />
    </>
  );
}
