'use client';

import { Heart } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { PropsWithChildren, useEffect, useState } from 'react';

import { ExistingResultType } from '~/client/util';
import { Button } from '~/components/ui/button';
import { Sheet } from '~/components/ui/sheet';

import { AccountStatusProvider } from '../../app/[locale]/(default)/account/(tabs)/_components/account-status-provider';

import { addWishlistItems } from './update-wishlists-form/_actions/add-wishlist-items';
import { WishlistSheetContent } from './wishlist-sheet-content';

export type Wishlist = NonNullable<ExistingResultType<typeof addWishlistItems>['data']>;

interface WishlistSheetProps extends PropsWithChildren {
  productId: number;
  trigger?: 'button' | 'icon';
  wishlistsList: Wishlist[];
}

export const WishlistSheet = ({
  productId,
  trigger = 'button',
  wishlistsList,
}: WishlistSheetProps) => {
  const t = useTranslations('Account.Wishlist.Sheet');

  const [wishlists, setWishlists] = useState(wishlistsList);

  useEffect(() => {
    setWishlists(wishlistsList);
  }, [wishlistsList]);

  const [saved, setSaved] = useState(() => {
    if (wishlistsList.length === 0) {
      return false;
    }

    return wishlistsList.some(({ items }) => {
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
        trigger === 'button' ? (
          <Button type="button" variant="secondary">
            <Heart
              aria-hidden="true"
              className="mx-2"
              fill={saved ? 'currentColor' : 'transparent'}
            />
            <span>{t(saved ? 'saved' : 'saveToWishlist')}</span>
          </Button>
        ) : (
          <Button
            aria-label={t('open')}
            className="p-3 text-black hover:bg-transparent hover:text-black"
            title={t('open')}
            type="button"
            variant="subtle"
          >
            <Heart fill="currentColor" />
          </Button>
        )
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
