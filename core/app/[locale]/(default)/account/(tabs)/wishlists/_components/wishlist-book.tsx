'use client';

import React, { PropsWithChildren, SetStateAction, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Trash2 } from 'lucide-react';

import { createWishlist } from '~/client/mutations/create-wishlist';
import { Link } from '~/components/link';
import { Button } from '~/components/ui/button';
import { Message } from '~/components/ui/message/message';
import { useAccountStatusContext } from '../../_components/account-status-provider';
import { Modal } from '../../_components/modal';
import { CreateWishlistDialog } from './create-wishlist-form';
import { DeleteWishlistForm } from './delete-wishlist-form';
import { Wishlists } from './wishlist-content';

type NewWishlist = NonNullable<Awaited<ReturnType<typeof createWishlist>>>;
type WishlistArray = Array<NewWishlist | Wishlists[number]>;

interface WishlistProps {
  setWishlistBook: (value: SetStateAction<WishlistArray>) => void;
  wishlist: WishlistArray[number];
}

interface FavoritesSectionProps {
  itemsCount?: number;
  saveCartCount?: number;
}

const FavoritesSection = ({ itemsCount = 0, saveCartCount = 0 }: FavoritesSectionProps) => {
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const { setAccountState } = useAccountStatusContext();
  const t = useTranslations('Account.Wishlist');

  const handleFavoritesDeleted = () => {
    setAccountState({
      status: 'success',
      message: t('messages.deleted', { name: 'Favorites' }),
    });
    setDeleteModalOpen(false);
  };

  return (
    <div className="mb-[22px] border-b-2 border-[#4EAECC] pb-6">
      <div className="flex items-start gap-[4em]">
        <div className="flex h-[130px] w-[130px] justify-center bg-[#87CEEB]">
          <svg className="text-white" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
          </svg>
        </div>

        <div className="flex-1">
          <div className="flex justify-between">
            <div>
              <div className="mb-[4px] text-left text-[20px] font-medium leading-8 tracking-[0.15px] text-[#000000]">
                Your Favorites
              </div>
              <p className="mb-[6px] text-left text-[16px] font-normal leading-8 tracking-[0.15px] text-[#000000]">
                {saveCartCount} {saveCartCount === 1 ? 'item' : 'items'} Items
              </p>
              <div className="flex gap-4">
                <button className="rounded-[3px] border border-[#4EAECC] p-[7px] text-[14px] font-medium">
                  EDIT DETAILS
                </button>
                <Link
                  className="rounded-[3px] bg-[#008BB7] px-[30px] py-[7px] text-[14px] font-medium text-white"
                  href="/account/wishlists/wishlist-product/"
                >
                  SHARE
                </Link>
              </div>
            </div>
          </div>
        </div>

        <Modal
          open={deleteModalOpen}
          setOpen={setDeleteModalOpen}
          showCancelButton={false}
          title={t('deleteTitle', { name: 'Favorites' })}
        >
          <DeleteWishlistForm
            id={'favorites'}
            name="Favorites"
            onWishistDeleted={handleFavoritesDeleted}
          />
        </Modal>
      </div>
    </div>
  );
};

const Wishlist = ({ setWishlistBook, wishlist }: WishlistProps) => {
  const [deleteWishlistModalOpen, setDeleteWishlistModalOpen] = useState(false);
  const { setAccountState } = useAccountStatusContext();
  const t = useTranslations('Account.Wishlist');
  const { entityId, name } = wishlist;

  const handleWishlistDeleted = () => {
    setWishlistBook((prevWishlistBook) =>
      prevWishlistBook.filter((wishlistItem) => wishlistItem.entityId !== entityId),
    );
    setAccountState({ status: 'success', message: t('messages.deleted', { name }) });
    setDeleteWishlistModalOpen(false);
  };

  if (name.startsWith('Save Cart -')) {
    return null;
  }

  const itemsCount = 'items' in wishlist ? wishlist.items.length : 0;

  return (
    <div className="mb-4">
      <div className="mb-[22px] border-b-2 border-[#4EAECC] pb-6">
        <div className="flex items-start gap-[4em]">
          <div className="flex h-[130px] w-[130px] justify-center bg-[#87CEEB]">
            <svg className="text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
            </svg>
          </div>

          <div className="flex-1">
            <div className="flex justify-between">
              <div>
                <div className="mb-[4px] text-left text-[20px] font-medium leading-8 tracking-[0.15px] text-[#000000]">
                  {name}
                </div>

                <div className="flex gap-4">
                  <button className="rounded-[3px] border border-[#4EAECC] p-[7px] text-[14px] font-medium">
                    EDIT DETAILS
                  </button>
                  <Link
                    className="rounded-[3px] bg-[#008BB7] px-[30px] py-[7px] text-[14px] font-medium text-white"
                    href="/account/wishlists/wishlist-product/"
                  >
                    SHARE
                  </Link>
                </div>
              </div>
            </div>
          </div>

          <Modal
            open={deleteWishlistModalOpen}
            setOpen={setDeleteWishlistModalOpen}
            showCancelButton={false}
            title={t('deleteTitle', { name })}
          >
            <DeleteWishlistForm
              id={entityId}
              name={name}
              onWishistDeleted={handleWishlistDeleted}
            />
          </Modal>
        </div>
      </div>
    </div>
  );
};

interface WishlistBookProps {
  hasPreviousPage?: boolean;
  wishlists: Wishlists;
}

export const WishlistBook = ({
  children,
  hasPreviousPage,
  wishlists,
}: PropsWithChildren<WishlistBookProps>) => {
  const t = useTranslations('Account.Wishlist');
  const [saveCartCount, setSaveCartCount] = useState(0);
  const [wishlistBook, setWishlistBook] = useState<WishlistArray>(
    wishlists.filter((wishlist: { name: string }) => !wishlist.name.startsWith('Save Cart -')),
  );
  const { accountState } = useAccountStatusContext();
  const [createWishlistModalOpen, setCreateWishlistModalOpen] = useState(false);
  const router = useRouter();

  const getAllItems = () => {
    return wishlistBook.flatMap((wishlist) => ('items' in wishlist ? wishlist.items : [])).length;
  };

  useEffect(() => {
    const saveCartWishlists = wishlists.filter((wishlist: { name: string }) =>
      wishlist.name.startsWith('Save Cart -'),
    );

    const totalSaveCartItems = saveCartWishlists.reduce((total, wishlist) => {
      return total + ('items' in wishlist ? wishlist.items.length : 0);
    }, 0);

    setSaveCartCount(totalSaveCartItems);

    const filteredWishlists = wishlists.filter(
      (wishlist: { name: string }) => !wishlist.name.startsWith('Save Cart -'),
    );
    setWishlistBook(filteredWishlists);
  }, [wishlists]);

  useEffect(() => {
    if (hasPreviousPage && wishlistBook.length === 0) {
      const timer = setTimeout(() => {
        router.back();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [hasPreviousPage, router, wishlistBook]);

  const handleWishlistCreated = (newWishlist: NewWishlist) => {
    setWishlistBook((prevWishlistBook) => [...prevWishlistBook, newWishlist]);
    setCreateWishlistModalOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div>
      {(accountState.status === 'error' || accountState.status === 'success') && (
        <Message className="mb-8 w-full text-gray-500" variant={accountState.status}>
          <p>{accountState.message}</p>
        </Message>
      )}

      <div className="mb-[0.8em] border-b-2 border-[#4EAECC] pb-[1em] text-left text-[24px] font-normal leading-8">
        Favorites and Lists
      </div>

      <FavoritesSection saveCartCount={saveCartCount} />

      {wishlistBook.map((wishlist) => (
        <Wishlist key={wishlist.entityId} setWishlistBook={setWishlistBook} wishlist={wishlist} />
      ))}

      <div className="mb-16 mt-[45px] flex flex-row-reverse justify-between">
        <Modal
          open={createWishlistModalOpen}
          setOpen={setCreateWishlistModalOpen}
          showCancelButton={false}
          title={t('new')}
          trigger={
            <Button className="w-auto" variant="secondary">
              {t('new')}
            </Button>
          }
        >
          <CreateWishlistDialog onWishlistCreated={handleWishlistCreated} />
        </Modal>
        {children}
      </div>
    </div>
  );
};