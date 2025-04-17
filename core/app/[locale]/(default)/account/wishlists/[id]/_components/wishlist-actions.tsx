import { SwitchSkeleton } from '@/vibes/soul/form/switch';
import { Streamable } from '@/vibes/soul/lib/streamable';
import * as Skeleton from '@/vibes/soul/primitives/skeleton';
import { Wishlist } from '@/vibes/soul/sections/wishlist-details';

import { WishlistAction, WishlistActionsMenu } from '../../_components/wishlist-actions-menu';

import { WishlistShareButton, WishlistShareButtonSkeleton } from './share-button';
import { WishlistVisibilitySwitch } from './visibility-switch';

interface Props {
  wishlist: Wishlist;
  isMobileUser: Streamable<boolean>;
  shareLabel: string;
  shareCloseLabel: string;
  shareModalTitle: string;
  shareSuccessMessage: string;
  shareCopiedMessage: string;
  shareDisabledTooltip: string;
  menuActions: WishlistAction[];
}

export const WishlistActions = ({
  wishlist,
  isMobileUser,
  shareLabel,
  shareCloseLabel,
  shareModalTitle,
  shareSuccessMessage,
  shareCopiedMessage,
  shareDisabledTooltip,
  menuActions,
}: Props) => {
  const { publicUrl } = wishlist;

  return (
    <div className="flex items-center">
      <div className="flex flex-1 items-center justify-between gap-4">
        <div className="flex-1">
          <WishlistVisibilitySwitch {...wishlist} />
        </div>
        <div className="@lg:border-l-contrast-100 flex items-center gap-2 pl-4 @lg:border-l">
          {publicUrl != null && publicUrl !== '' && (
            <WishlistShareButton
              closeLabel={shareCloseLabel}
              copiedMessage={shareCopiedMessage}
              disabledTooltip={shareDisabledTooltip}
              isMobileUser={isMobileUser}
              isPublic={wishlist.visibility.isPublic}
              label={shareLabel}
              modalTitle={shareModalTitle}
              publicUrl={publicUrl}
              successMessage={shareSuccessMessage}
              wishlistName={wishlist.name}
            />
          )}
          <WishlistActionsMenu items={menuActions} />
        </div>
      </div>
    </div>
  );
};

export function WishlistActionsSkeleton() {
  return (
    <div className="flex items-center">
      <div className="flex flex-1 items-center justify-between gap-4">
        <div className="flex-1">
          <SwitchSkeleton characterCount={5} />
        </div>
        <div className="@lg:border-l-contrast-100 flex items-center gap-2 pl-4 @lg:border-l">
          <WishlistShareButtonSkeleton />
          <Skeleton.Box className="h-10 w-10 rounded-full" />
        </div>
      </div>
    </div>
  );
}
