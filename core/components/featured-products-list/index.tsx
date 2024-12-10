import { useFormatter } from 'next-intl';

import { Streamable } from '@/vibes/soul/lib/streamable';
import { FeaturedProductsList as FeaturedProductsListComponent } from '@/vibes/soul/sections/featured-products-list';
import { ResultOf } from '~/client/graphql';
import { pricesTransformer } from '~/data-transformers/prices-transformer';

import { FeaturedProductsListFragment } from './fragment';

type Product = ResultOf<typeof FeaturedProductsListFragment>;

export const FeaturedProductsList = ({
  products: streamableProducts,
  ...props
}: {
  products: Streamable<Product[]>;
  title: string;
  description?: string;
  cta?: {
    label: string;
    href: string;
  };
}) => {
  const format = useFormatter();

  const formattedProducts = async () => {
    const products = await streamableProducts;

    return products.map((product) => ({
      id: product.entityId.toString(),
      title: product.name,
      href: product.path,
      image: product.defaultImage
        ? { src: product.defaultImage.url, alt: product.defaultImage.altText }
        : undefined,
      price: pricesTransformer(product.prices, format),
      subtitle: product.brand?.name ?? undefined,
    }));
  };

  return <FeaturedProductsListComponent products={formattedProducts()} {...props} />;
};
