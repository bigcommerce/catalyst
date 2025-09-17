import { removeEdgesAndNodes } from '@bigcommerce/catalyst-client';
import { getFormatter, getTranslations } from 'next-intl/server';

import { WishlistItem } from '@/vibes/soul/primitives/wishlist-item-card';
import { Wishlist } from '@/vibes/soul/sections/wishlist-details';
import { ResultOf } from '~/client/graphql';
import { ExistingResultType } from '~/client/util';
import {
  PublicWishlistFragment,
  WishlistFragment,
  WishlistItemProductFragment,
  WishlistPaginatedItemsFragment,
  WishlistsFragment,
} from '~/components/wishlist/fragment';

import { singleProductCardTransformer } from './product-card-transformer';

const getCtaLabel = (
  product: ResultOf<typeof WishlistItemProductFragment>,
  pt: ExistingResultType<typeof getTranslations<'Product.ProductDetails'>>,
): string => {
  if (product.availabilityV2.status === 'Unavailable') {
    return pt('Submit.unavailable');
  }

  if (product.availabilityV2.status === 'Preorder') {
    return pt('Submit.preorder');
  }

  if (!product.inventory.isInStock) {
    return pt('Submit.outOfStock');
  }

  return pt('Submit.addToCart');
};

const getCtaDisabled = (product: ResultOf<typeof WishlistItemProductFragment>): boolean => {
  if (product.availabilityV2.status === 'Unavailable') {
    return true;
  }

  if (product.availabilityV2.status === 'Preorder') {
    return false;
  }

  if (!product.inventory.isInStock) {
    return true;
  }

  return false;
};

function wishlistItemsTransformer(
  wishlistItems: ResultOf<typeof WishlistFragment | typeof WishlistPaginatedItemsFragment>['items'],
  formatter: ExistingResultType<typeof getFormatter>,
  pt?: ExistingResultType<typeof getTranslations<'Product.ProductDetails'>>,
): WishlistItem[] {
  return removeEdgesAndNodes(wishlistItems)
    .filter(
      (item): item is typeof item & { product: NonNullable<typeof item.product> } =>
        item.product !== null,
    )
    .map((item) => ({
      itemId: item.entityId.toString(),
      productId: item.productEntityId.toString(),
      variantId: item.variantEntityId?.toString() ?? undefined,
      callToAction: pt
        ? {
            label: getCtaLabel(item.product, pt),
            disabled: getCtaDisabled(item.product),
          }
        : undefined,
      product: singleProductCardTransformer(item.product, 'EX', formatter),
    }));
}

function wishlistTransformer(
  wishlist: ResultOf<typeof WishlistFragment | typeof WishlistPaginatedItemsFragment>,
  t: ExistingResultType<typeof getTranslations<'Wishlist'>>,
  formatter: ExistingResultType<typeof getFormatter>,
  pt?: ExistingResultType<typeof getTranslations<'Product.ProductDetails'>>,
): Wishlist {
  const totalItems = wishlist.items.collectionInfo?.totalItems ?? 0;

  return {
    id: wishlist.entityId.toString(),
    name: wishlist.name,
    publicUrl: `/wishlist/${wishlist.token}`,
    visibility: {
      isPublic: wishlist.isPublic,
      label: wishlist.isPublic ? t('Visibility.public') : t('Visibility.private'),
      publicLabel: t('Visibility.public'),
      privateLabel: t('Visibility.private'),
    },
    href: `/account/wishlists/${wishlist.entityId}`,
    items: wishlistItemsTransformer(wishlist.items, formatter, pt),
    totalItems: {
      value: totalItems,
      label: t('items', { count: totalItems }),
    },
  };
}

export const wishlistsTransformer = (
  wishlists: ResultOf<typeof WishlistsFragment>,
  t: ExistingResultType<typeof getTranslations<'Wishlist'>>,
  formatter: ExistingResultType<typeof getFormatter>,
): Wishlist[] =>
  removeEdgesAndNodes(wishlists).map((wishlist) => wishlistTransformer(wishlist, t, formatter));

export const wishlistDetailsTransformer = (
  wishlist: ResultOf<typeof WishlistPaginatedItemsFragment>,
  t: ExistingResultType<typeof getTranslations<'Wishlist'>>,
  pt: ExistingResultType<typeof getTranslations<'Product.ProductDetails'>>,
  formatter: ExistingResultType<typeof getFormatter>,
): Wishlist => wishlistTransformer(wishlist, t, formatter, pt);

export const publicWishlistDetailsTransformer = (
  wishlist: ResultOf<typeof PublicWishlistFragment>,
  t: ExistingResultType<typeof getTranslations<'Wishlist'>>,
  pt: ExistingResultType<typeof getTranslations<'Product.ProductDetails'>>,
  formatter: ExistingResultType<typeof getFormatter>,
): Wishlist => wishlistTransformer({ ...wishlist, isPublic: true }, t, formatter, pt);
