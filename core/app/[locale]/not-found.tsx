import { removeEdgesAndNodes } from '@bigcommerce/catalyst-client';
import { getTranslations } from 'next-intl/server';
import { Suspense } from 'react';

import { NotFound as NotFoundComponent } from '@/vibes/soul/sections/not-found';
import { Subscribe } from '@/vibes/soul/sections/subscribe';
import { client } from '~/client';
import { graphql } from '~/client/graphql';
import { revalidate } from '~/client/revalidate-target';
import { Footer } from '~/components/footer/footer';
import { Header } from '~/components/header';
import { ProductCardFragment } from '~/components/product-card/fragment';
import { ProductsCarousel } from '~/components/products-carousel';

const NotFoundQuery = graphql(
  `
    query NotFoundQuery {
      site {
        featuredProducts(first: 8) {
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
      <Suspense>
        <Header />
      </Suspense>

      <main>
        {/* TODO: add translations */}
        <NotFoundComponent />

        <ProductsCarousel products={featuredProducts} />

        <Subscribe
          description="Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor."
          title={t('Subscribe.title')}
        />
      </main>

      <Suspense>
        <Footer />
      </Suspense>
    </>
  );
}

export const runtime = 'edge';
