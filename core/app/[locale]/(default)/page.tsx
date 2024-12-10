import { removeEdgesAndNodes } from '@bigcommerce/catalyst-client';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { cache } from 'react';

import { getSessionCustomerAccessToken } from '~/auth';
import { client } from '~/client';
import { graphql } from '~/client/graphql';
import { revalidate } from '~/client/revalidate-target';
import { FeaturedProductsCarousel } from '~/components/featured-products-carousel';
import { FeaturedProductsCarouselFragment } from '~/components/featured-products-carousel/fragment';
import { FeaturedProductsList } from '~/components/featured-products-list';
import { FeaturedProductsListFragment } from '~/components/featured-products-list/fragment';
import { Subscribe } from '~/components/subscribe';

import { Slideshow } from './_components/slideshow';

const HomePageQuery = graphql(
  `
    query HomePageQuery {
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

  const { data } = await client.fetch({
    document: HomePageQuery,
    customerAccessToken,
    fetchOptions: customerAccessToken ? { cache: 'no-store' } : { next: { revalidate } },
  });

  return data;
});

const getFeaturedProducts = async () => {
  const data = await getPageData();

  return removeEdgesAndNodes(data.site.featuredProducts);
};

const getNewestProducts = async () => {
  const data = await getPageData();

  return removeEdgesAndNodes(data.site.newestProducts);
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
        products={getFeaturedProducts()}
        title={t('FeaturedProducts.title')}
      />

      <FeaturedProductsCarousel
        cta={{ label: t('NewestProducts.cta'), href: '/shop-all/?sort=newest' }}
        description={t('NewestProducts.description')}
        products={getNewestProducts()}
        title={t('NewestProducts.title')}
      />

      <Subscribe />
    </>
  );
}

export const runtime = 'edge';
