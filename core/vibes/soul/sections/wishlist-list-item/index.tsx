import { clsx } from 'clsx';

import { Stream, Streamable } from '@/vibes/soul/lib/streamable';
import { Badge } from '@/vibes/soul/primitives/badge';
import { ButtonLink } from '@/vibes/soul/primitives/button-link';
import { ProductCard, ProductCardSkeleton } from '@/vibes/soul/primitives/product-card';
import * as Skeleton from '@/vibes/soul/primitives/skeleton';
import { WishlistItem } from '@/vibes/soul/primitives/wishlist-item-card';
import { Wishlist } from '@/vibes/soul/sections/wishlist-details';

export interface WishlistItemActions {
  component: (wishlist?: Wishlist) => React.ReactNode;
  position?: 'left' | 'right';
}

interface Props {
  wishlist: Streamable<Wishlist>;
  itemActions?: WishlistItemActions;
  viewWishlistLabel?: string;
  className?: string;
  placeholderCount?: number;
  emptyStateText?: Streamable<string | null>;
}

export const WishlistListItem = ({
  className = '',
  itemActions,
  wishlist: streamableWishlist,
  viewWishlistLabel = 'View list',
  placeholderCount,
  emptyStateText,
}: Props) => {
  const { component: actionsComponent, position: actionsPosition = 'right' } = itemActions ?? {};

  return (
    <Stream
      fallback={
        <WishlistListItemSkeleton
          itemActions={itemActions}
          pending
          placeholderCount={placeholderCount}
        />
      }
      value={streamableWishlist}
    >
      {(wishlist) => {
        const { name, visibility, items, totalItems, href } = wishlist;

        return (
          <div
            className={clsx('@container my-4 flex flex-col', className)}
            data-testid="wishlist-list-item"
          >
            <div className="flex flex-1 flex-col justify-between @sm:flex-row @sm:items-center">
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <span className="text-lg font-semibold">{name}</span>
                  <Badge variant={visibility.isPublic ? 'primary' : 'info'}>
                    {visibility.label}
                  </Badge>
                </div>
                <div className="text-contrast-500 text-sm">{totalItems.label}</div>
              </div>
              <div className="my-4 flex gap-2 whitespace-nowrap @sm:my-0 @sm:ml-2 @sm:items-center">
                {actionsPosition === 'left' && actionsComponent?.(wishlist)}
                <ButtonLink className="flex-1" href={href} size="small" variant="primary">
                  {viewWishlistLabel}
                </ButtonLink>
                {actionsPosition === 'right' && actionsComponent?.(wishlist)}
              </div>
            </div>
            <WishlistListItemItems
              emptyStateText={emptyStateText}
              items={items}
              placeholderCount={placeholderCount}
            />
          </div>
        );
      }}
    </Stream>
  );
};

function WishlistListItemItems({
  emptyStateText,
  items: streamableWishlistItems,
  placeholderCount,
}: {
  items: Streamable<WishlistItem[]>;
  emptyStateText?: Streamable<string | null>;
  placeholderCount?: number;
}) {
  return (
    <Stream
      fallback={<WishlistListItemItemsSkeleton placeholderCount={placeholderCount} />}
      value={streamableWishlistItems}
    >
      {(items) => {
        if (items.length === 0) {
          return (
            <WishlistListItemItemsEmptyState
              emptyStateText={emptyStateText}
              placeholderCount={placeholderCount}
            />
          );
        }

        return (
          <div className="my-8 flex flex-1 gap-4 overflow-hidden [mask-image:linear-gradient(to_right,_black_70%,_transparent_100%)]">
            {items.map(({ product }) => (
              <div className="min-w-36" key={product.id}>
                <ProductCard aspectRatio="1:1" product={product} />
              </div>
            ))}
          </div>
        );
      }}
    </Stream>
  );
}

function WishlistListItemItemsEmptyState({
  emptyStateText = "You haven't added products to your wish list.",
  placeholderCount = 8,
}: {
  emptyStateText?: Streamable<string | null>;
  placeholderCount?: number;
}) {
  return (
    <div className="relative">
      <div className="[mask-image:linear-gradient(to_bottom,_black_25%,_transparent_100%)]">
        <WishlistListItemItemsSkeleton placeholderCount={placeholderCount} />
      </div>
      <div className="absolute inset-0 mx-auto px-3 py-24 pb-3 @4xl:px-10 @4xl:pt-24 @4xl:pb-10">
        <div className="mx-auto max-w-xl space-y-2 text-center @4xl:space-y-3">
          <p className="text-contrast-500 text-sm @4xl:text-lg">{emptyStateText}</p>
        </div>
      </div>
    </div>
  );
}

function WishlistListItemItemsSkeleton({
  className = '',
  placeholderCount = 8,
}: {
  className?: string;
  placeholderCount?: number;
}) {
  return (
    <div className="my-8 flex flex-1 gap-4 overflow-hidden [mask-image:linear-gradient(to_right,_black_70%,_transparent_100%)]">
      {Array.from({ length: placeholderCount }).map((_, index) => (
        <div className={clsx('min-w-36', className)} key={index}>
          <ProductCardSkeleton aspectRatio="1:1" />
        </div>
      ))}
    </div>
  );
}

export function WishlistListItemSkeleton({
  className = '',
  itemActions,
  placeholderCount,
  pending = false,
}: {
  className?: string;
  itemActions?: WishlistItemActions;
  placeholderCount?: number;
  pending?: boolean;
}) {
  const { component, position: actionsPosition = 'right' } = itemActions ?? {};

  return (
    <div
      className={clsx('@container my-4 flex flex-col', pending ? 'animate-pulse' : '', className)}
      data-pending={pending ? '' : undefined}
    >
      <div className="flex flex-1 flex-col justify-between @sm:flex-row @sm:items-center">
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <Skeleton.Text characterCount={12} className="rounded-sm text-lg" />
            <Skeleton.Text characterCount={5} className="rounded-sm px-2 py-0.5" />
          </div>
          <Skeleton.Text characterCount={5} className="rounded-sm" />
        </div>
        <div className="my-4 flex gap-2 @sm:my-0 @sm:ml-2 @sm:items-center">
          {actionsPosition === 'left' && component?.()}
          <Skeleton.Box className="h-10 min-w-[9ch] flex-1 rounded-full" />
          {actionsPosition === 'right' && component?.()}
        </div>
      </div>
      <WishlistListItemItemsSkeleton placeholderCount={placeholderCount} />
    </div>
  );
}
