'use client';

import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Dispatch, PropsWithChildren, SetStateAction, useEffect, useState } from 'react';

import { createWishlist } from '~/client/mutations/create-wishlist';
import { BcImage } from '~/components/bc-image';
import { Link } from '~/components/link';
import { Pricing } from '~/components/pricing';
import { Button } from '~/components/ui/button';
import { Message } from '~/components/ui/message/message';

import { useAccountStatusContext } from '../account-status-provider';
import { Modal } from '../modal';

import { CreateWishlistForm } from './create-wishlist-form';
import { DeleteWishlistForm } from './delete-wishlist-form';

import { Wishlists, WISHLISTS_PER_PAGE } from '.';

type CreatedWishlist = NonNullable<Awaited<ReturnType<typeof createWishlist>>>;

type WishlistArray = Array<CreatedWishlist | Wishlists[number]>;

interface WishlistProps {
  onWishlistDeleted: (id: number, name: string) => void;
  openModal: boolean;
  setOpenModal: Dispatch<SetStateAction<boolean>>;
  wishlist: WishlistArray[number];
}

interface WishlistBookProps {
  hasPreviousPage: boolean;
  wishlists: Wishlists;
}

interface WishlistItemsCount {
  itemsQuantity: number;
}

enum VisibleWishlistItemsPerDevice {
  xs = 1,
  md = 3,
  lg = 4,
  xl = 5,
}

const HiddenQuantity = ({ itemsQuantity }: WishlistItemsCount) => {
  const smItems = itemsQuantity - VisibleWishlistItemsPerDevice.xs;
  const mdItems = itemsQuantity - VisibleWishlistItemsPerDevice.md;
  const lgItems = itemsQuantity - VisibleWishlistItemsPerDevice.lg;
  const xlItems = itemsQuantity - VisibleWishlistItemsPerDevice.xl;

  return (
    <>
      {smItems > 0 && (
        <div className="list-item w-32 sm:w-40 md:!hidden">
          <div className="flex h-32 w-full items-center justify-center bg-gray-200 font-semibold text-gray-500 sm:h-40">
            +{smItems}
          </div>
        </div>
      )}
      {mdItems > 0 && (
        <div className="hidden w-36 md:list-item lg:hidden">
          <div className="flex h-36 w-full items-center justify-center bg-gray-200 font-semibold text-gray-500">
            +{mdItems}
          </div>
        </div>
      )}
      {lgItems > 0 && (
        <div className="hidden w-36 lg:list-item xl:hidden">
          <div className="flex h-36 w-full items-center justify-center bg-gray-200 font-semibold text-gray-500 md:h-36">
            +{lgItems}
          </div>
        </div>
      )}
      {xlItems > 0 && (
        <div className="hidden w-36 xl:list-item">
          <div className="flex h-36 w-full items-center justify-center bg-gray-200 font-semibold text-gray-500 md:h-36">
            +{xlItems}
          </div>
        </div>
      )}
    </>
  );
};

const Wishlist = ({ onWishlistDeleted, openModal, setOpenModal, wishlist }: WishlistProps) => {
  const t = useTranslations('Account.Wishlist');
  const { entityId, name } = wishlist;
  const items = 'items' in wishlist ? wishlist.items : undefined;

  return (
    <>
      <h3 className="mb-2 text-lg font-bold">{name}</h3>
      <div className="flex w-full flex-col items-start justify-between lg:flex-row">
        {!items ? (
          <p className="flex-1 py-4 text-center">{t('noItems')}</p>
        ) : (
          <div className="mb-4 flex gap-4 lg:me-12">
            <ul className="flex gap-4 [&>*:nth-child(n+2)]:hidden md:[&>*:nth-child(n+2)]:list-item md:[&>*:nth-child(n+4)]:hidden lg:[&>*:nth-child(n+4)]:list-item lg:[&>*:nth-child(n+5)]:hidden xl:[&>*:nth-child(n+5)]:list-item lg:[&>*:nth-child(n+7)]:hidden">
              {items.slice(0, VisibleWishlistItemsPerDevice.xl).map((item) => {
                const { entityId: productId, product } = item;
                const defaultImage = product.images.find(({ isDefault }) => isDefault);

                return (
                  <li className="w-32 sm:w-40 md:w-36" key={productId}>
                    <Link className="mb-2 flex" href={product.path}>
                      <div className="h-32 w-full sm:h-40 md:h-36">
                        {defaultImage ? (
                          <BcImage
                            alt={defaultImage.altText}
                            className="object-contain"
                            height={300}
                            src={defaultImage.url}
                            width={300}
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center bg-gray-200 font-semibold text-gray-500">
                            {t('noGalleryText')}
                          </div>
                        )}
                      </div>
                    </Link>

                    {product.brand && (
                      <Link href={product.brand.path}>
                        <p className="text-gray-500">{product.brand.name}</p>
                      </Link>
                    )}
                    <Link href={product.path}>
                      <h4 className="mb-2 font-semibold">{product.name}</h4>
                    </Link>
                    <Pricing data={product} />
                  </li>
                );
              })}
            </ul>
            <HiddenQuantity itemsQuantity={items.length} />
          </div>
        )}
        {name !== t('favorites') && (
          <div>
            <Modal
              confirmationText={t('confirmDelete', { name })}
              open={openModal}
              setOpen={setOpenModal}
              showCancelButton={false}
              title={t('deleteTitle', { name })}
              trigger={
                <Button className="w-auto" variant="secondary">
                  {t('delete')}
                </Button>
              }
            >
              <DeleteWishlistForm id={entityId} name={name} onWishistDeleted={onWishlistDeleted} />
            </Modal>
          </div>
        )}
      </div>
    </>
  );
};

export const WishlistBook = ({
  children,
  hasPreviousPage,
  wishlists,
}: PropsWithChildren<WishlistBookProps>) => {
  const t = useTranslations('Account.Wishlist');
  const [wishlistBook, setWishlistBook] = useState<WishlistArray>(wishlists);
  const { accountState, setAccountState } = useAccountStatusContext();
  const [ceateWishlistModalOpen, setCreateWishlistModalOpen] = useState(false);
  const [deleteWishlistModalOpen, setDeleteWishlistModalOpen] = useState(false);

  const router = useRouter();

  useEffect(() => {
    setWishlistBook(wishlists);
  }, [wishlists]);

  useEffect(() => {
    if (hasPreviousPage && wishlistBook.length === 0) {
      const timer = setTimeout(() => {
        router.back();
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [hasPreviousPage, router, wishlistBook]);

  const handleWishlistCreated = (newWishlist: CreatedWishlist) => {
    setWishlistBook((prevWishlistBook) => {
      if (prevWishlistBook.length < WISHLISTS_PER_PAGE) {
        return [...prevWishlistBook, newWishlist];
      }

      return prevWishlistBook;
    });
    setCreateWishlistModalOpen(false);

    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  const handleWishlistDeleted = (id: number, name: string) => {
    setWishlistBook((prevWishlistBook) =>
      prevWishlistBook.filter(({ entityId }) => entityId !== id),
    );

    const message = t('messages.deleted', { name });

    setAccountState({ status: 'success', message });
    setDeleteWishlistModalOpen(false);

    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  return (
    <div>
      {(accountState.status === 'error' || accountState.status === 'success') && (
        <Message className="mb-8 w-full text-gray-500" variant={accountState.status}>
          <p>{accountState.message}</p>
        </Message>
      )}

      <ul className="mb-8">
        {wishlistBook.map((wishlist) => {
          return (
            <li
              className="flex flex-wrap items-start border-b py-4 first:border-t"
              key={wishlist.entityId}
            >
              <Wishlist
                onWishlistDeleted={handleWishlistDeleted}
                openModal={deleteWishlistModalOpen}
                setOpenModal={setDeleteWishlistModalOpen}
                wishlist={wishlist}
              />
            </li>
          );
        })}
      </ul>
      <div className="mb-16 flex justify-between">
        <Modal
          confirmationText={t('createTitle')}
          open={ceateWishlistModalOpen}
          setOpen={setCreateWishlistModalOpen}
          showCancelButton={false}
          title={t('createTitle')}
          trigger={
            <Button className="w-auto" variant="secondary">
              {t('new')}
            </Button>
          }
        >
          <CreateWishlistForm onWishlistCreated={handleWishlistCreated} />
        </Modal>
        {children}
      </div>
    </div>
  );
};
