import { removeEdgesAndNodes } from '@bigcommerce/catalyst-client';
import { getTranslations, setRequestLocale } from 'next-intl/server';

import { FeaturedImage } from '@/vibes/soul/sections/featured-image';
// import { Subscribe } from '@/vibes/soul/sections/subscribe';
import { getSessionCustomerAccessToken } from '~/auth';
import { client } from '~/client';
import { graphql } from '~/client/graphql';
import { revalidate } from '~/client/revalidate-target';
import { FeaturedProductsList } from '~/components/featured-product-list';
import { FeaturedProductsListFragment } from '~/components/featured-product-list/fragment';
import { FeaturedProductsCarousel } from '~/components/featured-products-carousel';
import { FeaturedProductsCarouselFragment } from '~/components/featured-products-carousel/fragment';
import { Slideshow } from '~/components/slideshow';
import { LocaleType } from '~/i18n/routing';

import image from './_images/featured1.jpg';

const HomePageQuery = graphql(
  `
    query HomePageQuery {
      site {
        newestProducts(first: 8) {
          edges {
            node {
              ...FeaturedProductsCarouselFragment
            }
          }
        }
        featuredProducts(first: 6) {
          edges {
            node {
              ...FeaturedProductsListFragment
            }
          }
        }
      }
    }
  `,
  [FeaturedProductsCarouselFragment, FeaturedProductsListFragment],
);

interface Props {
  params: {
    locale: LocaleType;
  };
}

export default async function Home({ params: { locale } }: Props) {
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

  return (
    <>
      <Slideshow />

      <FeaturedProductsCarousel products={newestProducts} title={t('Carousel.title')} />

      <FeaturedImage
        cta={{ href: '/shop-all', label: t('FeaturedImage.cta') }}
        description="Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt."
        image={{
          src: image.src,
          alt: t('FeaturedImage.altText'),
          blurDataUrl: image.blurDataURL,
        }}
        title={t('FeaturedImage.title')}
      />

      <FeaturedProductsList
        cta={{ href: '/#', label: t('List.cta') }}
        description="Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua."
        products={featuredProducts}
        title={t('List.title')}
      />

      {/* TODO: Wire up action */}
      {/* <Subscribe
        description="Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor."
        title={t('Subscribe.title')}
      /> */}
    </>
  );
}

export const runtime = 'edge';
