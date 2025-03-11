import { removeEdgesAndNodes } from '@bigcommerce/catalyst-client';
import { getFormatter, getTranslations, setRequestLocale } from 'next-intl/server';
import { cache } from 'react';

import { FeaturedProductsCarousel } from '@/vibes/soul/sections/featured-products-carousel';
import { FeaturedProductsList } from '@/vibes/soul/sections/featured-products-list';
import { getSessionCustomerAccessToken } from '~/auth';
import { client } from '~/client';
import { graphql } from '~/client/graphql';
import { revalidate } from '~/client/revalidate-target';
import { FeaturedProductsCarouselFragment } from '~/components/featured-products-carousel/fragment';
import { FeaturedProductsListFragment } from '~/components/featured-products-list/fragment';
import { Subscribe } from '~/components/subscribe';
import { productCardTransformer } from '~/data-transformers/product-card-transformer';
import { getPreferredCurrencyCode } from '~/lib/currency';

import { Slideshow } from './_components/slideshow';

const HomePageQuery = graphql(
  `
    query HomePageQuery($currencyCode: currencyCode) {
      site {
        featuredProducts(first: 12) {
          edges {
            node {
              ...FeaturedProductsListFragment
            }
          }
        }
        newestProducts(first: 12) {
          edges {
            node {
              ...FeaturedProductsCarouselFragment
            }
          }
        }
      }
    }
  `,
  [FeaturedProductsCarouselFragment, FeaturedProductsListFragment],
);

const getPageData = cache(async () => {
  const customerAccessToken = await getSessionCustomerAccessToken();
  const currencyCode = await getPreferredCurrencyCode();
  const { data } = await client.fetch({
    document: HomePageQuery,
    customerAccessToken,
    variables: { currencyCode },
    fetchOptions: customerAccessToken ? { cache: 'no-store' } : { next: { revalidate } },
  });

  return data;
});

const getFeaturedProducts = async () => {
  const data = await getPageData();
  const format = await getFormatter();

  const featuredProducts = removeEdgesAndNodes(data.site.featuredProducts);

  return productCardTransformer(featuredProducts, format);
};

const getNewestProducts = async () => {
  const data = await getPageData();
  const format = await getFormatter();

  const newestProducts = removeEdgesAndNodes(data.site.newestProducts);

  return productCardTransformer(newestProducts, format);
};

interface Props {
  params: Promise<{ locale: string }>;
}

export default async function Home({ params }: Props) {
  const { locale } = await params;

  setRequestLocale(locale);

  const t = await getTranslations('Home');

  return (
    <>
      <Slideshow />

      <FeaturedProductsList
        cta={{ label: t('FeaturedProducts.cta'), href: '/shop-all' }}
        description={t('FeaturedProducts.description')}
        emptyStateSubtitle={t('FeaturedProducts.emptyStateSubtitle')}
        emptyStateTitle={t('FeaturedProducts.emptyStateTitle')}
        products={getFeaturedProducts()}
        title={t('FeaturedProducts.title')}
      />

      <FeaturedProductsCarousel
        cta={{ label: t('NewestProducts.cta'), href: '/shop-all/?sort=newest' }}
        description={t('NewestProducts.description')}
        emptyStateSubtitle={t('NewestProducts.emptyStateSubtitle')}
        emptyStateTitle={t('NewestProducts.emptyStateTitle')}
        nextLabel={t('NewestProducts.nextProducts')}
        previousLabel={t('NewestProducts.previousProducts')}
        products={getNewestProducts()}
        title={t('NewestProducts.title')}
      />

      <Subscribe />
    </>
  );
}
