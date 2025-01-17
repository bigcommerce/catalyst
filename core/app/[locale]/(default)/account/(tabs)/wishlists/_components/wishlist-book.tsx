// wishlist-book.tsx
'use client';

import { useRouter } from 'next/navigation';
import { useFormatter, useTranslations } from 'next-intl';
import { PropsWithChildren, SetStateAction, useEffect, useState } from 'react';
import { Hit as AlgoliaHit } from 'instantsearch.js';
import Link from 'next/link';

import { createWishlist } from '~/client/mutations/create-wishlist';
import { Button } from '~/components/ui/button';
import { Message } from '~/components/ui/message/message';
import { BcImage } from '~/components/bc-image';

import { useAccountStatusContext } from '../../_components/account-status-provider';
import { Modal } from '../../_components/modal';
import { DeleteWishlistForm } from './delete-wishlist-form';
import { CreateWishlistDialog } from './create-wishlist-form';

// Constants
const WISHLISTS_PER_PAGE = 100;

// Types and Interfaces
interface HitPrice {
  USD: number;
  CAD: number;
}

interface ProductImage {
  url: string;
  altText: string;
  isDefault: boolean;
}

interface ProductVariant {
  name: string;
  hex: string;
  imageUrl?: string;
  variant_id?: string;
}

interface WishlistItem {
  entityId: number;
  product: {
    reviewCount: number;
    path: string;
    name: string;
    images: ProductImage[];
    brand?: {
      name: string;
      path: string;
    };
    prices?: {
      price: {
        value: number;
        currencyCode: string;
      };
      priceRange: {
        min: { value: number };
        max: { value: number };
      };
    } | null;
    rating?: number;
    variants?: ProductVariant[];
  };
}

interface Wishlist {
  entityId: number;
  name: string;
  items: WishlistItem[];
}

type Wishlists = Wishlist[];
type NewWishlist = NonNullable<Awaited<ReturnType<typeof createWishlist>>>;
type WishlistArray = Array<NewWishlist | Wishlists[number]>;

interface WishlistProps {
  setWishlistBook: (value: SetStateAction<WishlistArray>) => void;
  wishlist: WishlistArray[number];
  onCompare?: (productId: number, checked: boolean) => void;
  onRemove?: (productId: number) => void;
  onColorSelect?: (variant: ProductVariant) => void;
}

interface WishlistBookProps {
  hasPreviousPage: boolean;
  wishlists: Wishlists;
  onCompare?: (productId: number, checked: boolean) => void;
  onRemove?: (productId: number) => void;
  onColorSelect?: (variant: ProductVariant) => void;
}

const Wishlist = ({
  setWishlistBook,
  wishlist,
  onCompare,
  onRemove,
  onColorSelect,
}: WishlistProps) => {
  const [deleteWishlistModalOpen, setDeleteWishlistModalOpen] = useState(false);
  const { setAccountState } = useAccountStatusContext();
  const t = useTranslations('Account.Wishlist');
  const { entityId, name } = wishlist;
  const items = 'items' in wishlist ? wishlist.items : [];

  const handleWishlistDeleted = () => {
    setWishlistBook((prev) => prev.filter((item) => item.entityId !== entityId));
    setAccountState((prevState) => ({
      ...prevState,
      status: 'success',
      message: t('messages.deleted', { name }),
    }));
    setDeleteWishlistModalOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleWishlistClick = () => {
    localStorage.setItem('selectedWishlist', JSON.stringify(wishlist));
  };

  return (
    <div className="wishlist-item flex w-full items-center gap-6 bg-white">
      {/* Left Column - Image */}
      <div className="flex h-32 w-32 items-center justify-center rounded bg-[#80C5DA]">
        <svg
          className="h-16 w-16 text-white"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path
            d="M12 6L9.5 3.5C7.5 1.5 4 2 2.5 4.5C1 7 2 10 4.5 12L12 19L19.5 12C22 10 23 7 21.5 4.5C20 2 16.5 1.5 14.5 3.5L12 6Z"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>

      {/* Middle Column - Content */}
      <div className="flex-1">
        <Link href="/account/wishlists/wishlist-product" onClick={handleWishlistClick}>
          <h3 className="wishlist-name mb-[4px] text-left text-[20px] font-medium leading-8 tracking-[0.15px] text-[#000000]">
            {name}
          </h3>
        </Link>
        <p className="mb-[6px] text-left text-[16px] font-normal leading-8 tracking-[0.15px] text-[#000000]">
          {items.length} {items.length === 1 ? 'item' : 'items'}
        </p>
        <div className="flex w-[30%] gap-2">
          <Link
            href="/account/wishlists/wishlist-product"
            onClick={handleWishlistClick}
            className="rounded-[3px] border border-[#B4DDE9] p-[10px] text-left text-[14px] font-medium uppercase !leading-5 tracking-wider text-[#002A37]"
          >
            EDIT DETAILS
          </Link>
        </div>
      </div>

      {/* Right Column - Delete Button */}
      {name !== t('favorites') && (
        <div>
          <Modal
            isOpen={deleteWishlistModalOpen}
            onClose={() => setDeleteWishlistModalOpen(false)}
            showCancelButton={false}
            title={t('deleteTitle', { name })}
            trigger={
              <Button variant="ghost" size="sm" className="text-gray-500 hover:text-red-600">
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
              </Button>
            }
          >
            <DeleteWishlistForm
              id={entityId}
              name={name}
              onWishistDeleted={handleWishlistDeleted}
            />
          </Modal>
        </div>
      )}
    </div>
  );
};

export const WishlistBook = ({
  children,
  hasPreviousPage,
  wishlists,
  onCompare,
  onRemove,
  onColorSelect,
}: PropsWithChildren<WishlistBookProps>) => {
  const t = useTranslations('Account.Wishlist');
  const [wishlistBook, setWishlistBook] = useState<WishlistArray>(wishlists);
  const { accountState } = useAccountStatusContext();
  const [createWishlistModalOpen, setCreateWishlistModalOpen] = useState(false);
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

  const handleWishlistCreated = (newWishlist: NewWishlist) => {
    setWishlistBook((prev) => {
      if (prev.length < WISHLISTS_PER_PAGE) {
        return [...prev, newWishlist];
      }
      return prev;
    });
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

      <ul className="mb-8">
        {wishlistBook.map((wishlist) => (
          <li
            className="flex flex-wrap items-start border-b border-[#4EAECC] py-4 first:border-t"
            key={wishlist.entityId}
          >
            <Wishlist
              setWishlistBook={setWishlistBook}
              wishlist={wishlist}
              onCompare={onCompare}
              onRemove={onRemove}
              onColorSelect={onColorSelect}
            />
          </li>
        ))}
      </ul>

      <div className="mb-16 flex flex-row-reverse justify-between">
        <Modal
          isOpen={createWishlistModalOpen}
          onClose={() => setCreateWishlistModalOpen(false)}
          showCancelButton={false}
          title={t('new')}
          trigger={
            <Button
              className="h-[45px] w-[12em] rounded-sm bg-[#03465C] text-sm font-medium leading-8 tracking-wide text-white"
              onClick={() => setCreateWishlistModalOpen(true)}
            >
              <span className="mr-[5px] text-[20px]">+</span> CREATE NEW LIST
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
