import { removeEdgesAndNodes } from '@bigcommerce/catalyst-client';
import { ShoppingCart } from 'lucide-react';
import { getTranslations } from 'next-intl/server';

import { client } from '~/client';
import { graphql } from '~/client/graphql';
import { revalidate } from '~/client/revalidate-target';
import { Footer } from '~/components/footer/footer';
import { FooterFragment } from '~/components/footer/fragment';
import { Header } from '~/components/header';
import { CartLink } from '~/components/header/cart';
import { HeaderFragment } from '~/components/header/fragment';
import { ProductCardFragment } from '~/components/product-card/fragment';
import { ProductCardCarousel } from '~/components/product-card-carousel';
import { SearchForm } from '~/components/search-form';

const NotFoundQuery = graphql(
  `
    query NotFoundQuery {
      site {
        ...HeaderFragment
        ...FooterFragment
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
  [HeaderFragment, FooterFragment, ProductCardFragment],
);

export const metadata = {
  title: 'Not Found',
};

export default async function NotFound() {
  const t = await getTranslations('NotFound');

  const { data } = await client.fetch({
    document: NotFoundQuery,
    fetchOptions: { next: { revalidate } },
  });

  const featuredProducts = removeEdgesAndNodes(data.site.featuredProducts);

  return (
    <>
      <Header
        cart={
          <CartLink>
            <ShoppingCart aria-label="cart" />
          </CartLink>
        }
        data={data.site}
      />

      <main className="mx-auto mb-10 max-w-[835px] space-y-8 px-4 sm:px-10 lg:px-0">
        <div className="flex flex-col gap-8 px-0 py-16">
          <h2 className="text-4xl font-black lg:text-5xl">{t('heading')}</h2>
          <p className="text-lg">{t('message')}</p>
        </div>
        <SearchForm />
        <ProductCardCarousel
          products={featuredProducts}
          showCart={false}
          showCompare={false}
          title={t('Carousel.featuredProducts')}
        />
      </main>

      <Footer data={data.site} />
    </>
  );
}

export const runtime = 'edge';
