import { removeEdgesAndNodes } from '@bigcommerce/catalyst-client';
import { getTranslations, unstable_setRequestLocale } from 'next-intl/server';

import { getSessionCustomerId } from '~/auth';
import { client } from '~/client';
import { graphql } from '~/client/graphql';
import { revalidate } from '~/client/revalidate-target';
import { FeaturedProductsCarousel } from '~/components/featured-products-carousel';
import { FeaturedProductsCarouselFragment } from '~/components/featured-products-carousel/fragment';
import { FeaturedProductsList } from '~/components/featured-products-list';
import { FeaturedProductsListFragment } from '~/components/featured-products-list/fragment';
import { Slideshow } from '~/components/slideshow';
import { FeaturedImage } from '~/components/vibes/featured-image';
import { Subscribe } from '~/components/vibes/subscribe';
import { LocaleType } from '~/i18n/routing';

import image from './_images/featured1.jpg';

const HomePageQuery = graphql(
  `
    query HomePageQuery {
      site {
        newestProducts(first: 12) {
          edges {
            node {
              ...FeaturedProductsCarouselFragment
            }
          }
        }
        featuredProducts(first: 12) {
          edges {
            node {
              ...FeaturedProductsCarouselFragment
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

      <FeaturedProductsCarousel products={newestProducts} title={t('Carousel.newestProducts')} />

      <FeaturedImage
        cta={{ href: '/#', label: 'Shop now' }}
        description="Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt."
        image={{
          src: image,
          altText: 'An assortment of brandless products against a blank background',
        }}
        title="Title"
      />

      <FeaturedProductsList
        cta={{ href: '/#', label: 'Shop now' }}
        description="Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua."
        products={featuredProducts}
        title="Featured products"
      />

      <FeaturedProductsCarousel products={featuredProducts} title="Recently viewed" />

      <Subscribe
        description="Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor."
        title="Sign up for our newsletter"
      />
    </>
  );
}

export const runtime = 'edge';
