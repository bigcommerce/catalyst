import { removeEdgesAndNodes } from '@bigcommerce/catalyst-client';
import { ShoppingCart } from 'lucide-react';
import { NextIntlClientProvider } from 'next-intl';
import { getLocale, getMessages, getTranslations } from 'next-intl/server';

import { client } from '~/client';
import { PRODUCT_DETAILS_FRAGMENT } from '~/client/fragments/product-details';
import { graphql } from '~/client/graphql';
import { revalidate } from '~/client/revalidate-target';
import { Footer, FooterFragment } from '~/components/footer/footer';
import { Header, HeaderFragment } from '~/components/header';
import { CartLink } from '~/components/header/cart';
import { ProductCard } from '~/components/product-card';
import { SearchForm } from '~/components/search-form';

export const metadata = {
  title: 'Not Found',
};

const NotFoundQuery = graphql(
  `
    query NotFoundQuery {
      site {
        ...HeaderFragment
        ...FooterFragment
        featuredProducts(first: 4) {
          edges {
            node {
              ...ProductDetails
            }
          }
        }
      }
    }
  `,
  [HeaderFragment, FooterFragment, PRODUCT_DETAILS_FRAGMENT],
);

export default async function NotFound() {
  const locale = await getLocale();
  const t = await getTranslations('NotFound');
  const messages = await getMessages({ locale });

  const { data } = await client.fetch({
    document: NotFoundQuery,
    fetchOptions: { next: { revalidate } },
  });

  const featuredProducts = removeEdgesAndNodes(data.site.featuredProducts).map(
    (featuredProduct) => ({
      ...featuredProduct,
      productOptions: removeEdgesAndNodes(featuredProduct.productOptions),
    }),
  );

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

      <main className="mx-auto mb-10 max-w-[835px] space-y-8 px-6 sm:px-10 lg:px-0">
        <div className="flex flex-col gap-8 px-0 py-16">
          <h2 className="text-4xl font-black lg:text-5xl">{t('heading')}</h2>
          <p className="text-lg">{t('message')}</p>
        </div>
        <NextIntlClientProvider locale={locale} messages={{ NotFound: messages.NotFound ?? {} }}>
          <SearchForm />
        </NextIntlClientProvider>
        <section>
          <h3 className="mb-8 text-3xl font-black lg:text-4xl">{t('featuredProducts')}</h3>
          <div className="grid grid-cols-2 gap-x-8 gap-y-8 md:grid-cols-4">
            {featuredProducts.map((product) => (
              <NextIntlClientProvider
                key={product.entityId}
                locale={locale}
                messages={{ Product: messages.Product ?? {} }}
              >
                <ProductCard
                  product={product}
                  showCart={false}
                  showCompare={false}
                  showReviews={false}
                />
              </NextIntlClientProvider>
            ))}
          </div>
        </section>
      </main>

      <Footer data={data.site} />
    </>
  );
}

export const runtime = 'edge';
