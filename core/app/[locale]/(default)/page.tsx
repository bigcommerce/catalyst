import { removeEdgesAndNodes } from '@bigcommerce/catalyst-client';
import { getTranslations, unstable_setRequestLocale } from 'next-intl/server';

import { FeaturedImage } from '@/vibes/soul/components/featured-image';
import { getSessionCustomerId } from '~/auth';
import { client } from '~/client';
import { graphql } from '~/client/graphql';
import { revalidate } from '~/client/revalidate-target';
import { FeaturedProductsCarousel } from '~/components/featured-products-carousel';
import { FeaturedProductsCarouselFragment } from '~/components/featured-products-carousel/fragment';
import { FeaturedProductsList } from '~/components/featured-products-list';
import { FeaturedProductsListFragment } from '~/components/featured-products-list/fragment';
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
  unstable_setRequestLocale(locale);

  const t = await getTranslations('Home');

  const customerId = await getSessionCustomerId();

  const { data } = await client.fetch({
    document: HomePageQuery,
    customerId,
    fetchOptions: customerId ? { cache: 'no-store' } : { next: { revalidate } },
  });

  const featuredProducts = removeEdgesAndNodes(data.site.featuredProducts);
  const newestProducts = removeEdgesAndNodes(data.site.newestProducts);

  return (
    <>
      <Slideshow />

      <FeaturedProductsCarousel products={newestProducts} title={t('Carousel.title')} />

      <FeaturedImage
        cta={{ href: '/#', label: t('FeaturedImage.cta') }}
        description="Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt."
        image={{
          src: image,
          altText: t('FeaturedImage.altText'),
        }}
        title={t('FeaturedImage.title')}
      />

      <FeaturedProductsList
        cta={{ href: '/#', label: t('List.cta') }}
        description="Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua."
        products={featuredProducts}
        title={t('List.title')}
      />
    </>
  );
}

export const runtime = 'edge';
