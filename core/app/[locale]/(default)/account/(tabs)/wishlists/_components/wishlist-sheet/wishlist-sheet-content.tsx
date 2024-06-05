import { useTranslations } from 'next-intl';
import { Dispatch, SetStateAction, useState } from 'react';

import { createWishlist } from '~/client/mutations/create-wishlist';
import { Button } from '~/components/ui/button';
import { Message } from '~/components/ui/message';

import { useAccountStatusContext } from '../../../_components/account-status-provider';
import { Modal } from '../../../_components/modal';
import { CreateWishlistForm } from '../create-wishlist-form';

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

  const { accountState } = useAccountStatusContext();
  const [ceateWishlistModalOpen, setCreateWishlistModalOpen] = useState(false);

  const handleWishlistCreated = (newWishlist: NewWishlist) => {
    setCreateWishlistModalOpen(false);

    setWishlists((prevWishlists) => {
      const newWishlists = [...prevWishlists, { ...newWishlist, items: [] }];

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
    <div className="flex-1">
      {(accountState.status === 'error' || accountState.status === 'success') && (
        <Message className="mb-8 w-full" variant={accountState.status}>
          <p>{accountState.message}</p>
        </Message>
      )}

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
  );
};
