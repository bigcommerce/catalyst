import { removeEdgesAndNodes } from '@bigcommerce/catalyst-client';
import { ResultOf } from 'gql.tada';
import { getFormatter } from 'next-intl/server';

import { Product } from '@/vibes/soul/primitives/product-card';
import { ExistingResultType } from '~/client/util';
import { ProductCardFragment } from '~/components/product-card/fragment';

import { pricesTransformer } from './prices-transformer';

const getInventoryMessage = (
  product: ResultOf<typeof ProductCardFragment>,
  outOfStockMessage?: string,
  showBackorderMessage?: boolean,
) => {
  if (!product.inventory.isInStock) {
    return outOfStockMessage;
  }

  if (!showBackorderMessage || product.inventory.hasVariantInventory) {
    return undefined;
  }

  const { availableForBackorder, unlimitedBackorder, availableOnHand } =
    product.inventory.aggregated ?? {};

  if (availableOnHand) {
    return undefined;
  }

  const hasBackorderAvailablity = !!availableForBackorder || unlimitedBackorder;

  if (!hasBackorderAvailablity) {
    return undefined;
  }

  const baseVariant = removeEdgesAndNodes(product.variants).at(0);

  if (!baseVariant?.inventory?.byLocation) {
    return undefined;
  }

  const inventoryByLocation = removeEdgesAndNodes(baseVariant.inventory.byLocation).at(0);

  return inventoryByLocation?.backorderMessage ?? undefined;
};

export const singleProductCardTransformer = (
  product: ResultOf<typeof ProductCardFragment>,
  format: ExistingResultType<typeof getFormatter>,
  outOfStockMessage?: string,
  showBackorderMessage?: boolean,
): Product => {
  return {
    id: product.entityId.toString(),
    title: product.name,
    href: product.path,
    image: product.defaultImage
      ? { src: product.defaultImage.url, alt: product.defaultImage.altText }
      : undefined,
    price: pricesTransformer(product.prices, format),
    subtitle: product.brand?.name ?? undefined,
    rating: product.reviewSummary.averageRating,
    numberOfReviews: product.reviewSummary.numberOfReviews,
    inventoryMessage: getInventoryMessage(product, outOfStockMessage, showBackorderMessage),
  };
};

export const productCardTransformer = (
  products: Array<ResultOf<typeof ProductCardFragment>>,
  format: ExistingResultType<typeof getFormatter>,
  outOfStockMessage?: string,
  showBackorderMessage?: boolean,
): Product[] => {
  return products.map((product) =>
    singleProductCardTransformer(product, format, outOfStockMessage, showBackorderMessage),
  );
};
