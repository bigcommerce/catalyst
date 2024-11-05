import { useFormatter } from 'next-intl';

import { ProductsCarousel as ProductsCarouselComponent } from '@/vibes/soul/primitives/products-carousel';
import { ResultOf } from '~/client/graphql';
import { pricesTransformer } from '~/data-transformers/prices-transformer';

import { ProductsCarouselFragment } from './fragment';

type Product = ResultOf<typeof ProductsCarouselFragment>;

export const ProductsCarousel = ({ products }: { products: Product[] }) => {
  const format = useFormatter();

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

  return <ProductsCarouselComponent products={formattedProducts} />;
};
