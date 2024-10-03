import { useFormatter } from 'next-intl';

import { FeaturedProductsCarousel as FeaturedProductsCarouselComponent } from '@/vibes/soul/components/featured-products-carousel';
import { ResultOf } from '~/client/graphql';
import { pricesTransformer } from '~/data-transformers/prices-transformer';

import { FeaturedProductsCarouselFragment } from './fragment';

type Product = ResultOf<typeof FeaturedProductsCarouselFragment>;

export const FeaturedProductsCarousel = ({
  products,
  title,
  cta,
}: {
  products: Product[];
  title: string;
  cta?: { label: string; href: string };
}) => {
  const format = useFormatter();

  const formattedProducts = products.map((product) => ({
    id: product.entityId.toString(),
    name: product.name,
    href: product.path,
    image: product.defaultImage
      ? { src: product.defaultImage.url, altText: product.defaultImage.altText }
      : undefined,
    price: pricesTransformer(product.prices, format),
    subtitle: product.brand?.name ?? undefined,
  }));

  return <FeaturedProductsCarouselComponent cta={cta} products={formattedProducts} title={title} />;
};
