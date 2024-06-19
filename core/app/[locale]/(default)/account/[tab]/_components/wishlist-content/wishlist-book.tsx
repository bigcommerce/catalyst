'use client';

import { useTranslations } from 'next-intl';
import { useState } from 'react';

import { BcImage } from '~/components/bc-image';
import { Link } from '~/components/link';
import { Pricing } from '~/components/pricing';
import { Button } from '~/components/ui/button';
import { Message } from '~/components/ui/message/message';

import { deleteWishlists } from '../../_actions/delete-wishlists';
import { useAccountStatusContext } from '../account-status-provider';
import { Modal } from '../modal';

import { CreateWishlistForm } from './create-wishlist-form';

import { Wishlists } from '.';

interface Wishlist {
  onDeleteWishlist?: (id: number, name: string) => Promise<void>;
  wishlist: Wishlists[number];
}

interface WishlistBook {
  wishlists: Wishlists;
}

interface WishlistItems {
  itemsLength: number;
}

enum VisibleWishlistItemsPerDevice {
  sm = 1,
  md = 3,
  lg = 4,
  xl = 5,
}

const QuantityDisplay = ({ itemsLength }: WishlistItems) => {
  const smItems = itemsLength - VisibleWishlistItemsPerDevice.sm;
  const mdItems = itemsLength - VisibleWishlistItemsPerDevice.md;
  const lgItems = itemsLength - VisibleWishlistItemsPerDevice.lg;
  const xlItems = itemsLength - VisibleWishlistItemsPerDevice.xl;

  return (
    <>
      {smItems > 0 && (
        <div className="list-item w-40 md:!hidden">
          <div className="flex h-40 w-full items-center justify-center bg-gray-200 font-semibold text-gray-500">
            +{smItems}
          </div>
        </div>
      )}
      {mdItems > 0 && (
        <div className="hidden w-36 w-36 md:list-item lg:hidden">
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

const Wishlist = ({ onDeleteWishlist, wishlist: { items, entityId, name } }: Wishlist) => {
  const t = useTranslations('Account.Wishlist');

  return (
    <>
      <h3 className="mb-2 text-lg font-bold">{name}</h3>
      <div className="flex w-full flex-col items-start justify-between lg:flex-row">
        {items.length === 0 ? (
          <p className="flex-1 py-4 text-center">{t('noItems')}</p>
        ) : (
          <div className="mb-4 flex gap-4 lg:me-12">
            <ul
              className="flex gap-4 [&>*:nth-child(n+2)]:hidden 
                md:[&>*:nth-child(n+2)]:list-item md:[&>*:nth-child(n+4)]:hidden 
                lg:[&>*:nth-child(n+4)]:list-item lg:[&>*:nth-child(n+5)]:hidden
                xl:[&>*:nth-child(n+5)]:list-item lg:[&>*:nth-child(n+7)]:hidden"
            >
              {items
                .slice(0, VisibleWishlistItemsPerDevice.xl)
                .map(({ entityId: productId, product }) => {
                  const defaultImage = product.images.find(({ isDefault }) => isDefault);

                  return (
                    <li className="w-40 md:w-36" key={productId}>
                      <Link className="mb-2 flex" href={product.path}>
                        <div className="h-40 w-full md:h-36">
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
            <QuantityDisplay itemsLength={items.length} />
          </div>
        )}
        {onDeleteWishlist && (
          <div>
            <Modal
              actionHandler={() => onDeleteWishlist(entityId, name)}
              confirmationText={t('confirmDelete', { name })}
              title={t('deleteTitle', { name })}
              trigger={
                <Button className="w-auto" variant="secondary">
                  {t('delete')}
                </Button>
              }
            />
          </div>
        )}
      </div>
    </>
  );
};

export const WishlistBook = ({ wishlists }: WishlistBook) => {
  const t = useTranslations('Account.Wishlist');
  const [wishlistBook, setWishlistBook] = useState(wishlists);
  const { accountState, setAccountState } = useAccountStatusContext();
  const [ceateWishlistModalOpen, setCreateWishlistModalOpen] = useState(false);

  const handleWishlistCreated = (newWishlist: Wishlists[number]) => {
    setWishlistBook((prevWishlistBook) => [...prevWishlistBook, newWishlist]);
    setCreateWishlistModalOpen(false);
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  const handleDeleteWishlist = async (id: number, name: string) => {
    const result = await deleteWishlists({ entityIds: [id] });

    if (result === 'success') {
      setWishlistBook((prevWishlistBook) =>
        prevWishlistBook.filter(({ entityId }) => entityId !== id),
      );
      setAccountState({ status: 'success', message: t('messages.deleted', { name }) });
      window.scrollTo({
        top: 0,
        behavior: 'smooth',
      });
    }
  };

  return (
    <div>
      {(accountState.status === 'error' || accountState.status === 'success') && (
        <Message className="mb-8 w-full text-gray-500" variant={accountState.status}>
          <p>{accountState.message}</p>
        </Message>
      )}

      <ul className="mb-8">
        {wishlistBook.length === 0 && (
          <li className="border-y py-4">
            <Wishlist wishlist={{ isPublic: true, items: [], name: t('favorites'), entityId: 0 }} />
          </li>
        )}
        {wishlistBook.map((wishlist) => {
          return (
            <li
              className="flex flex-wrap items-start border-b py-4 first:border-t"
              key={wishlist.entityId}
            >
              <Wishlist onDeleteWishlist={handleDeleteWishlist} wishlist={wishlist} />
            </li>
          );
        })}
      </ul>
      <Modal
        confirmationText={t('createTitle')}
        open={ceateWishlistModalOpen}
        setOpen={setCreateWishlistModalOpen}
        showCancelButton={false}
        title={t('createTitle')}
        trigger={
          <Button className="mb-16 w-auto" variant="secondary">
            {t('new')}
          </Button>
        }
      >
        <CreateWishlistForm onWishlistCreated={handleWishlistCreated} />
      </Modal>
    </div>
  );
};
