import { Stream, Streamable } from '@/vibes/soul/lib/streamable';
import { Wishlist } from '@/vibes/soul/sections/wishlist-details';
import {
  WishlistItemActions,
  WishlistListItem,
  WishlistListItemSkeleton,
} from '@/vibes/soul/sections/wishlist-list-item';

interface Props {
  wishlists: Streamable<Wishlist[]>;
  emptyStateCallToAction?: React.ReactNode;
  emptyStateTitle?: Streamable<string | null>;
  emptyWishlistStateText?: Streamable<string | null>;
  viewWishlistLabel?: string;
  itemActions?: WishlistItemActions;
}

export const WishlistList = ({
  wishlists: streamableWishlists,
  emptyStateCallToAction,
  emptyStateTitle,
  emptyWishlistStateText,
  viewWishlistLabel,
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
                emptyStateTitle={emptyStateTitle}
                itemActions={itemActions}
              />
            );
          }

          return wishlists.map((wishlist) => (
            <WishlistListItem
              className="border-b border-b-contrast-100 last:border-b-transparent"
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
  emptyStateCallToAction,
  emptyStateTitle = "You don't have any wish list",
}: Omit<Props, 'wishlists'>) {
  return (
    <div className="@container">
      <div className="py-20">
        <header className="mx-auto flex max-w-2xl flex-col items-center gap-5">
          <h2 className="text-center text-lg font-semibold text-[var(--order-list-empty-state-title,hsl(var(--foreground)))]">
            {emptyStateTitle}
          </h2>
          {emptyStateCallToAction}
        </header>
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
