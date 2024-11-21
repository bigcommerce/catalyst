import { useFormatter } from 'next-intl';

import { FeaturedProductsCarousel as FeaturedProductsCarouselComponent } from '@/vibes/soul/sections/featured-products-carousel';
import { ResultOf } from '~/client/graphql';
import { pricesTransformer } from '~/data-transformers/prices-transformer';

import { FeaturedProductsCarouselFragment } from './fragment';

type Product = ResultOf<typeof FeaturedProductsCarouselFragment>;

export const FeaturedProductsCarousel = ({
  products,
  ...props
}: {
  products: Product[];
  title: string;
  description?: string;
  cta?: {
    label: string;
    href: string;
  };
}) => {
  const format = useFormatter();

  if (products.length === 0) {
    return null;
  }

  const formattedProducts = products.map((product) => ({
    id: product.entityId.toString(),
    title: product.name,
    href: product.path,
    image: product.defaultImage
      ? { src: product.defaultImage.url, alt: product.defaultImage.altText }
      : undefined,
    price: pricesTransformer(product.prices, format),
    subtitle: product.brand?.name ?? undefined,
  }));

  return <FeaturedProductsCarouselComponent products={formattedProducts} {...props} />;
};
