import { removeEdgesAndNodes } from '@bigcommerce/catalyst-client';
import { getTranslations, setRequestLocale } from 'next-intl/server';

import { getSessionCustomerAccessToken } from '~/auth';
import { client } from '~/client';
import { graphql } from '~/client/graphql';
import { revalidate } from '~/client/revalidate-target';
import { FeaturedProductsCarousel } from '~/components/featured-products-carousel';
import { FeaturedProductsCarouselFragment } from '~/components/featured-products-carousel/fragment';
import { FeaturedProductsList } from '~/components/featured-products-list';
import { FeaturedProductsListFragment } from '~/components/featured-products-list/fragment';
import { HomepageSlideshow } from '~/components/homepage-slideshow';

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
        bestSellingProducts(first: 12) {
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

interface Props {
  params: Promise<{ locale: string }>;
}

export default async function Home({ params }: Props) {
  const { locale } = await params;

  setRequestLocale(locale);

  const t = await getTranslations('Home');
  const customerAccessToken = await getSessionCustomerAccessToken();

  const { data } = await client.fetch({
    document: HomePageQuery,
    customerAccessToken,
    fetchOptions: customerAccessToken ? { cache: 'no-store' } : { next: { revalidate } },
  });

  const featuredProducts = removeEdgesAndNodes(data.site.featuredProducts);
  const newestProducts = removeEdgesAndNodes(data.site.newestProducts);
  const bestSellingProducts = removeEdgesAndNodes(data.site.bestSellingProducts);

  return (
    <>
      <HomepageSlideshow />

      <FeaturedProductsList
        cta={{ label: t('FeaturedProducts.cta'), href: '/shop-all' }}
        description={t('FeaturedProducts.description')}
        products={featuredProducts}
        title={t('FeaturedProducts.title')}
      />

      <FeaturedProductsCarousel
        cta={{ label: t('NewestProducts.cta'), href: '/shop-all/?sort=newest' }}
        description={t('NewestProducts.description')}
        products={newestProducts}
        title={t('NewestProducts.title')}
      />

      <FeaturedProductsCarousel
        cta={{ label: t('BestSellingProducts.cta'), href: '/shop-all/?sort=best_selling' }}
        description={t('BestSellingProducts.description')}
        products={bestSellingProducts}
        title={t('BestSellingProducts.title')}
      />
    </>
  );
}

export const runtime = 'edge';
