import { clsx } from 'clsx';

import {
  Product,
  ProductCard,
  ProductCardProps,
  ProductCardSkeleton,
} from '@/vibes/soul/primitives/product-card';
import * as Skeleton from '@/vibes/soul/primitives/skeleton';

import { RemoveWishlistItemAction, RemoveWishlistItemButton } from './remove-wishlist-item';
import { AddWishlistItemToCartAction, WishlistItemAddToCart } from './wishlist-item-add-to-cart';

export interface WishlistItem {
  itemId: string;
  productId: string;
  variantId?: string;
  callToAction?: {
    label: string;
    disabled?: boolean;
  };
  product: Product;
}

interface WishlistItemCardProps extends Omit<ProductCardProps, 'product' | 'showCompare'> {
  wishlistId: string;
  item: WishlistItem;
  action: AddWishlistItemToCartAction;
  removeAction?: RemoveWishlistItemAction;
}

export const WishlistItemCard = ({
  wishlistId,
  item: { itemId, productId, variantId, callToAction, product },
  action,
  removeAction,
  ...props
}: WishlistItemCardProps) => {
  return (
    <div
      className="relative flex max-w-md basis-[calc(100%-1rem)] flex-col justify-between gap-3 @md:basis-[calc(50%-0.75rem)] @lg:basis-[calc(33%-0.5rem)] @2xl:basis-[calc(25%-0.25rem)]"
      key={product.id}
    >
      <ProductCard aspectRatio="3:4" product={product} showCompare={false} {...props} />
      {callToAction && (
        <WishlistItemAddToCart
          action={action}
          callToAction={callToAction}
          productId={productId}
          variantId={variantId}
        />
      )}
      {removeAction && (
        <div className="absolute -right-3 -top-3 rounded-full transition-shadow duration-100 hover:shadow-md">
          <RemoveWishlistItemButton action={removeAction} itemId={itemId} wishlistId={wishlistId} />
        </div>
      )}
    </div>
  );
};

export function WishlistItemSkeleton({ className = '' }: { className?: string }) {
  return (
    <div
      className={clsx(
        'flex basis-[calc(100%-1rem)] flex-col justify-between gap-3 @md:basis-[calc(50%-0.75rem)] @lg:basis-[calc(33%-0.5rem)] @2xl:basis-[calc(25%-0.25rem)]',
        className,
      )}
    >
      <ProductCardSkeleton aspectRatio="3:4" />
      <Skeleton.Box className="min-h-10 rounded-full" />
    </div>
  );
}
