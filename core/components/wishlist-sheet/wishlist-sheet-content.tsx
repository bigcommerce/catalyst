import { useTranslations } from 'next-intl';
import { Dispatch, SetStateAction, useState } from 'react';

import { AccountStatusProvider } from '~/app/[locale]/(default)/account/[tab]/_components/account-status-provider';
import { Modal } from '~/app/[locale]/(default)/account/[tab]/_components/modal';
import { CreateWishlistForm } from '~/app/[locale]/(default)/account/[tab]/_components/wishlist-content/create-wishlist-form';
import { createWishlist } from '~/client/mutations/create-wishlist';

import { Button } from '../ui/button';

import { UpdateWishlistsForm } from './update-wishlists-form';

import { Wishlist } from '.';

export type NewWishlist = NonNullable<Awaited<ReturnType<typeof createWishlist>>>;

interface WishlistSheetContentProps {
  productId: number;
  setWishlists: Dispatch<SetStateAction<Wishlist[]>>;
  wishlists: Wishlist[];
}

export const WishlistSheetContent = ({
  productId,
  setWishlists,
  wishlists,
}: WishlistSheetContentProps) => {
  const t = useTranslations('Account.Wishlist.Sheet');

  const [ceateWishlistModalOpen, setCreateWishlistModalOpen] = useState(false);

  const handleWishlistCreated = (newWishlist: NewWishlist) => {
    setCreateWishlistModalOpen(false);

    const wishlist = {
      ...newWishlist,
      items: [],
    };

    setWishlists((prevWishlists) => {
      const newWishlists = [...prevWishlists, wishlist];

      return newWishlists;
    });
  };

  const handleWishlistsUpdated = (updatedWishlists: Wishlist[]) => {
    setWishlists((prevWishlists) => {
      return prevWishlists.map((wishlist) => {
        const updatedWishlist = updatedWishlists.find(
          ({ entityId }) => entityId === wishlist.entityId,
        );

        return {
          ...wishlist,
          items: updatedWishlist ? [...updatedWishlist.items] : [...wishlist.items],
        };
      });
    });
  };

  return (
    <AccountStatusProvider>
      <div className="flex-1">
        <p className="mb-6">{t('selectCta')}</p>
        <UpdateWishlistsForm
          onWishlistsUpdated={handleWishlistsUpdated}
          productId={productId}
          wishlists={wishlists}
        />
        <Modal
          confirmationText={t('createTitle')}
          open={ceateWishlistModalOpen}
          setOpen={setCreateWishlistModalOpen}
          showCancelButton={false}
          title={t('createTitle')}
          trigger={<Button variant="secondary">{t('new')}</Button>}
        >
          <CreateWishlistForm onWishlistCreated={handleWishlistCreated} />
        </Modal>
      </div>
    </AccountStatusProvider>
  );
};
