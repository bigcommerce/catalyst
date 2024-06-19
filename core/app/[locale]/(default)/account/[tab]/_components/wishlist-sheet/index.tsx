import { Heart } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { PropsWithChildren, useEffect, useState } from 'react';

import { addWishlistItems } from '~/client/mutations/add-wishlist-items';
import { Sheet } from '~/components/ui/sheet';

import { Button } from '../../../../../../../components/ui/button';
import { AccountStatusProvider } from '../account-status-provider';

import { WishlistSheetContent } from './wishlist-sheet-content';

export type Wishlist = NonNullable<Awaited<ReturnType<typeof addWishlistItems>>>;

interface WishlistSheetProps extends PropsWithChildren {
  productId: number;
  wishlistsData: Wishlist[];
}

export const WishlistSheet = ({ productId, wishlistsData }: WishlistSheetProps) => {
  const t = useTranslations('Account.Wishlist.Sheet');

  const [wishlists, setWishlists] = useState(() => {
    if (wishlistsData.length === 0) {
      return [{ items: [], entityId: 0, name: t('favorites') }];
    }

    return wishlistsData;
  });

  const [saved, setSaved] = useState(() => {
    if (wishlistsData.length === 0) {
      return false;
    }

    return wishlistsData.some(({ items }) => {
      return items.some(({ product }) => product.entityId === productId);
    });
  });

  useEffect(() => {
    const firstWishlistWithProduct = wishlists.find(({ items }) =>
      items.find(({ product }) => product.entityId === productId),
    );

    setSaved(!!firstWishlistWithProduct);
  }, [productId, setSaved, wishlists]);

  return (
    <Sheet
      side="right"
      title={t('title')}
      trigger={
        <Button type="button" variant="secondary">
          <Heart
            aria-hidden="true"
            className="mx-2"
            fill={saved ? 'currentColor' : 'transparent'}
          />
          <span>{t(saved ? 'saved' : 'saveToWishlist')}</span>
        </Button>
      }
    >
      <AccountStatusProvider>
        <WishlistSheetContent
          productId={productId}
          setWishlists={setWishlists}
          wishlists={wishlists}
        />
      </AccountStatusProvider>
    </Sheet>
  );
};
