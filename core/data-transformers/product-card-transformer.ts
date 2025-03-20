import { ResultOf } from 'gql.tada';
import { getFormatter } from 'next-intl/server';

import { ProductCardWithId } from '@/vibes/soul/primitives/product-card';
import { ExistingResultType } from '~/client/util';
import { ProductCardFragment } from '~/components/product-card/fragment';

import { pricesTransformer } from './prices-transformer';

export const productCardTransformer = (
  products: Array<ResultOf<typeof ProductCardFragment>>,
  format: ExistingResultType<typeof getFormatter>,
): ProductCardWithId[] => {
  return products.map((product) => ({
    id: product.entityId.toString(),
    title: product.name,
    href: product.path,
    image: product.defaultImage
      ? { src: product.defaultImage.url, alt: product.defaultImage.altText }
      : undefined,
    price: pricesTransformer(product.prices, format),
    subtitle: product.brand?.name ?? undefined,
    rating: product.reviewSummary.averageRating,
  }));
};
