import { clsx } from 'clsx';

import { Stream, Streamable } from '@/ui/lib/streamable';
import { Wishlist } from '@/ui/sections/wishlist-details';
import {
  WishlistItemActions,
  WishlistListItem,
  WishlistListItemSkeleton,
} from '@/ui/sections/wishlist-list-item';

interface Props {
  wishlists: Streamable<Wishlist[]>;
  emptyStateCallToAction?: React.ReactNode;
  emptyStateSubtitle?: Streamable<string | null>;
  emptyStateTitle?: Streamable<string | null>;
  emptyWishlistStateText?: Streamable<string | null>;
  viewWishlistLabel?: string;
  placeholderCount?: number;
  itemActions?: WishlistItemActions;
}

export const WishlistList = ({
  wishlists: streamableWishlists,
  emptyStateCallToAction,
  emptyStateTitle,
  emptyStateSubtitle,
  emptyWishlistStateText,
  viewWishlistLabel,
  placeholderCount,
  itemActions,
}: Props) => {
  return (
    <div className="@container">
      <Stream
        fallback={<WishlistListSkeleton itemActions={itemActions} pending />}
        value={streamableWishlists}
      >
        {(wishlists) => {
          if (wishlists.length === 0) {
            return (
              <WishlistListEmptyState
                emptyStateCallToAction={emptyStateCallToAction}
                emptyStateSubtitle={emptyStateSubtitle}
                emptyStateTitle={emptyStateTitle}
                itemActions={itemActions}
                placeholderCount={placeholderCount}
              />
            );
          }

          return wishlists.map((wishlist) => (
            <WishlistListItem
              className="border-b-contrast-100 border-b last:border-b-transparent"
              emptyStateText={emptyWishlistStateText}
              itemActions={itemActions}
              key={wishlist.id}
              viewWishlistLabel={viewWishlistLabel}
              wishlist={wishlist}
            />
          ));
        }}
      </Stream>
    </div>
  );
};

function WishlistListEmptyState({
  className = '',
  emptyStateCallToAction,
  emptyStateSubtitle = 'Create a new wish list to save your favorite products.',
  emptyStateTitle = "You don't have any wish list",
  itemActions,
  placeholderCount = 1,
}: { className?: string } & Omit<Props, 'wishlists'>) {
  return (
    <div className={clsx('relative', className)}>
      <div className="[mask-image:linear-gradient(to_bottom,_black_0%,_transparent_100%)]">
        <WishlistListSkeleton itemActions={itemActions} placeholderCount={placeholderCount} />
      </div>
      <div className="absolute inset-0 mx-auto px-3 py-24 pb-3 @4xl:px-10 @4xl:pt-16 @4xl:pb-10">
        <div className="mx-auto max-w-xl space-y-2 text-center @4xl:space-y-3">
          <h3 className="@4x:leading-none font-heading text-foreground text-2xl leading-tight @4xl:text-4xl">
            {emptyStateTitle}
          </h3>
          <p className="text-contrast-500 text-sm @4xl:text-lg">{emptyStateSubtitle}</p>
          {emptyStateCallToAction}
        </div>
      </div>
    </div>
  );
}

function WishlistListSkeleton({
  itemActions,
  placeholderCount = 1,
  pending = false,
}: {
  itemActions?: WishlistItemActions;
  placeholderCount?: number;
  pending?: boolean;
}) {
  return Array.from({ length: placeholderCount }).map((_, index) => (
    <WishlistListItemSkeleton itemActions={itemActions} key={index} pending={pending} />
  ));
}
