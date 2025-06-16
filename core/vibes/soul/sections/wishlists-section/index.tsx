import { Streamable } from '@/vibes/soul/lib/streamable';
import { CursorPagination, CursorPaginationInfo } from '@/vibes/soul/primitives/cursor-pagination';
import { Wishlist } from '@/vibes/soul/sections/wishlist-details';
import { WishlistList } from '@/vibes/soul/sections/wishlist-list';
import { WishlistItemActions } from '@/vibes/soul/sections/wishlist-list-item';

interface Props {
  title: string;
  wishlists: Streamable<Wishlist[]>;
  paginationInfo?: Streamable<CursorPaginationInfo>;
  emptyStateCallToAction?: React.ReactNode;
  emptyStateTitle?: Streamable<string | null>;
  emptyWishlistStateText?: Streamable<string | null>;
  viewWishlistLabel?: string;
  actions?: React.ReactNode;
  itemActions?: WishlistItemActions;
}

/**
 * This component supports various CSS variables for theming. Here's a comprehensive list, along
 * with their default values:
 *
 * ```css
 * :root {
 *   --wishlists-section-title-font-family: var(--font-family-heading);
 *   --wishlists-section-title: hsl(var(--foreground));
 *   --wishlists-section-border: hsl(var(--contrast-100));
 * }
 * ```
 */

export const WishlistsSection = ({
  title,
  wishlists,
  paginationInfo,
  emptyStateCallToAction,
  emptyStateTitle,
  emptyWishlistStateText,
  viewWishlistLabel,
  actions,
  itemActions,
}: Props) => {
  return (
    <section className="w-full">
      <header className="mb-4 border-[var(--wishlists-section-border,hsl(var(--contrast-100)))] @2xl:min-h-[72px] @2xl:border-b">
        <div className="mb-4 flex items-center justify-between">
          <h1 className="hidden font-[family-name:var(--wishlists-section-title-font-family,var(--font-family-heading))] text-4xl font-medium leading-none tracking-tight text-[var(--wishlists-section-title,hsl(var(--foreground)))] @2xl:block">
            {title}
          </h1>
          {actions}
        </div>
      </header>

      <WishlistList
        emptyStateCallToAction={emptyStateCallToAction}
        emptyStateTitle={emptyStateTitle}
        emptyWishlistStateText={emptyWishlistStateText}
        itemActions={itemActions}
        viewWishlistLabel={viewWishlistLabel}
        wishlists={wishlists}
      />

      {paginationInfo && <CursorPagination info={paginationInfo} />}
    </section>
  );
};
