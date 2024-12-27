import { removeEdgesAndNodes } from '@bigcommerce/catalyst-client';
import { getTranslations } from 'next-intl/server';

import { NotFound as NotFoundSection } from '@/vibes/soul/sections/not-found';
import { client } from '~/client';
import { graphql } from '~/client/graphql';
import { revalidate } from '~/client/revalidate-target';
import { Footer } from '~/components/footer/footer';
import { Header } from '~/components/header';
import { ProductCardFragment } from '~/components/product-card/fragment';
import { ProductCardCarousel } from '~/components/product-card-carousel';
import { SearchForm } from '~/components/search-form';

const NotFoundQuery = graphql(
  `
    query NotFoundQuery {
      site {
        featuredProducts(first: 4) {
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

export default async function NotFound() {
  const t = await getTranslations('NotFound');

  const { data } = await client.fetch({
    document: NotFoundQuery,
    fetchOptions: { next: { revalidate } },
  });

  const featuredProducts = removeEdgesAndNodes(data.site.featuredProducts);

  return (
    <>
      <Header />

      <NotFoundSection subtitle={t('message')} title={t('heading')} />

      <main className="mx-auto mb-10 max-w-[835px] space-y-8 px-4 sm:px-10 lg:px-0">
        <SearchForm />
        <ProductCardCarousel
          products={featuredProducts}
          showCart={false}
          showCompare={false}
          title={t('Carousel.featuredProducts')}
        />
      </main>

      <Footer />
    </>
  );
}
