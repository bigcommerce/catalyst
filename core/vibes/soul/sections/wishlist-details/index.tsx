import { clsx } from 'clsx';
import { ArrowLeft } from 'lucide-react';

import { Stream, Streamable } from '@/vibes/soul/lib/streamable';
import { ButtonLink } from '@/vibes/soul/primitives/button-link';
import { CursorPagination, CursorPaginationInfo } from '@/vibes/soul/primitives/cursor-pagination';
import * as Skeleton from '@/vibes/soul/primitives/skeleton';
import {
  WishlistItem,
  WishlistItemCard,
  WishlistItemSkeleton,
} from '@/vibes/soul/primitives/wishlist-item-card';
import { RemoveWishlistItemAction } from '@/vibes/soul/primitives/wishlist-item-card/remove-wishlist-item';
import { AddWishlistItemToCartAction } from '@/vibes/soul/primitives/wishlist-item-card/wishlist-item-add-to-cart';

export interface Wishlist {
  id: string;
  name: string;
  href: string;
  items: Streamable<WishlistItem[]>;
  publicUrl?: string;
  visibility: {
    isPublic: boolean;
    label: string;
    publicLabel: string;
    privateLabel: string;
  };
  totalItems: {
    value: number;
    label: string;
  };
}

interface Props {
  className?: string;
  wishlist: Streamable<Wishlist>;
  paginationInfo?: Streamable<CursorPaginationInfo>;
  prevHref?: string;
  emptyStateText?: Streamable<string | null>;
  placeholderCount?: number;
  headerActions?: React.ReactNode | ((wishlist?: Wishlist) => React.ReactNode);
  action: AddWishlistItemToCartAction;
  removeAction?: RemoveWishlistItemAction;
}

export const WishlistDetails = ({
  className = '',
  wishlist: streamableWishlist,
  emptyStateText,
  paginationInfo,
  headerActions,
  prevHref,
  placeholderCount,
  action,
  removeAction,
}: Props) => {
  return (
    <Stream
      fallback={
        <WishlistDetailSkeleton
          className={className}
          headerActions={typeof headerActions === 'function' ? headerActions() : headerActions}
          placeholderCount={placeholderCount}
          prevHref={prevHref}
        />
      }
      value={streamableWishlist}
    >
      {(wishlist) => {
        const { name, totalItems, items } = wishlist;

        return (
          <section className={clsx('w-full @container', className)}>
            <header className="mb-4 flex flex-col gap-4 @lg:flex-row @lg:justify-between">
              <div className="flex flex-1 gap-2">
                {prevHref != null && prevHref !== '' && (
                  <ButtonLink href={prevHref} shape="circle" size="small" variant="ghost">
                    <ArrowLeft />
                  </ButtonLink>
                )}
                <div className="flex flex-1 flex-col gap-2">
                  <h1 className="font-heading text-3xl font-medium leading-none @7xl:text-5xl">
                    {name}
                  </h1>
                  <div className="text-sm text-contrast-500 @7xl:text-base">{totalItems.label}</div>
                </div>
              </div>
              {typeof headerActions === 'function' ? headerActions(wishlist) : headerActions}
            </header>

            <WishlistItems
              action={action}
              emptyStateText={emptyStateText}
              items={items}
              placeholderCount={placeholderCount}
              removeAction={removeAction}
              wishlistId={wishlist.id}
            />

            {paginationInfo && <CursorPagination info={paginationInfo} />}
          </section>
        );
      }}
    </Stream>
  );
};

function WishlistItems({
  wishlistId,
  emptyStateText,
  items: streamableWishlistItems,
  placeholderCount,
  action,
  removeAction,
}: {
  wishlistId: string;
  items: Streamable<WishlistItem[]>;
  emptyStateText?: Streamable<string | null>;
  placeholderCount?: number;
  action: AddWishlistItemToCartAction;
  removeAction?: RemoveWishlistItemAction;
}) {
  return (
    <Stream
      fallback={<WishlistItemsSkeleton pending placeholderCount={8} />}
      value={streamableWishlistItems}
    >
      {(items) => {
        if (items.length === 0) {
          return (
            <WishlistItemsEmptyState
              emptyStateText={emptyStateText}
              placeholderCount={placeholderCount}
            />
          );
        }

        return (
          <div className="w-full @container">
            <div className="mx-auto grid grid-cols-2 gap-x-4 gap-y-6 @sm:grid-cols-3 @2xl:grid-cols-4 @2xl:gap-x-5 @2xl:gap-y-8 @5xl:grid-cols-5 @7xl:grid-cols-6">
              {items.map((item, index) => (
                <WishlistItemCard
                  action={action}
                  item={item}
                  key={index}
                  removeAction={removeAction}
                  wishlistId={wishlistId}
                />
              ))}
            </div>
          </div>
        );
      }}
    </Stream>
  );
}

function WishlistItemsEmptyState({
  emptyStateText = "You haven't added products to your wish list.",
  placeholderCount = 8,
}: {
  emptyStateText?: Streamable<string | null>;
  placeholderCount?: number;
}) {
  return (
    <div className="relative">
      <div className="[mask-image:linear-gradient(to_bottom,_black_25%,_transparent_100%)]">
        <WishlistItemsSkeleton placeholderCount={placeholderCount} />
      </div>
      <div className="absolute inset-0 mx-auto px-3 py-24 pb-3 @4xl:px-10 @4xl:pb-10 @4xl:pt-24">
        <div className="mx-auto max-w-xl space-y-2 text-center @4xl:space-y-3">
          <p className="text-sm text-contrast-500 @4xl:text-lg">{emptyStateText}</p>
        </div>
      </div>
    </div>
  );
}

function WishlistItemsSkeleton({
  className = '',
  placeholderCount = 8,
  pending = false,
}: {
  className?: string;
  placeholderCount?: number;
  pending?: boolean;
}) {
  return (
    <div
      className={clsx(
        'mx-auto grid grid-cols-2 gap-x-4 gap-y-6 [mask-image:linear-gradient(to_bottom,_black_0%,_transparent_100%)] @sm:grid-cols-3 @2xl:grid-cols-4 @2xl:gap-x-5 @2xl:gap-y-8 @5xl:grid-cols-5 @7xl:grid-cols-6',
        pending ? 'animate-pulse' : '',
        className,
      )}
    >
      {Array.from({ length: placeholderCount }).map((_, index) => (
        <WishlistItemSkeleton key={index} />
      ))}
    </div>
  );
}

function WishlistDetailSkeleton({
  className = '',
  prevHref,
  placeholderCount = 8,
  headerActions,
}: {
  prevHref?: string;
  className?: string;
  placeholderCount?: number;
  headerActions?: React.ReactNode;
}) {
  return (
    <section className={clsx('w-full animate-pulse @container', className)}>
      <header className="mb-4 flex flex-col gap-4 @lg:flex-row @lg:justify-between">
        <div className="flex flex-1 gap-2">
          {prevHref != null &&
            prevHref !== '' &&
            (prevHref ? (
              <ButtonLink href={prevHref} shape="circle" size="small" variant="ghost">
                <ArrowLeft />
              </ButtonLink>
            ) : (
              <Skeleton.Box className="h-10 w-10 rounded-full" />
            ))}
          <div className="flex flex-1 flex-col gap-2">
            <Skeleton.Text
              characterCount={12}
              className="rounded text-3xl leading-none @7xl:text-5xl"
            />
            <Skeleton.Text characterCount={5} className="rounded text-sm @7xl:text-base" />
          </div>
        </div>
        {headerActions}
      </header>

      <WishlistItemsSkeleton placeholderCount={placeholderCount} />
    </section>
  );
}
