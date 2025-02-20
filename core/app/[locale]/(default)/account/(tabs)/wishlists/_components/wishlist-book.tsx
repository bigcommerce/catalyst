'use client';

import { useRouter } from 'next/navigation';
import { useFormatter, useTranslations } from 'next-intl';
import {
  memo,
  PropsWithChildren,
  SetStateAction,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import Link from 'next/link';
import { Button } from '~/components/ui/button';
import { Message } from '~/components/ui/message/message';
import { Modal } from '../../_components/modal';
import { DeleteWishlistForm } from './delete-wishlist-form';
import { CreateWishlistDialog } from './create-wishlist-form';
import { useAccountStatusContext } from '../../_components/account-status-provider';
import { manageDeletedProducts } from '~/components/common-functions';

// Create local storage utility since it's not exported from common-functions
const storageUtils = {
  getFromStorage: (key: string) => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(key);
    }
    return null;
  },
  setToStorage: (key: string, value: string) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(key, value);
    }
  },
  removeFromStorage: (key: string) => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(key);
    }
  },
};

const WISHLISTS_PER_PAGE = 100;

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
    entityId: number;
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

interface WishlistMenuProps {
  entityId: number;
  name: string;
  onWishlistDeleted: () => void;
  wishlist: Wishlist;
}

// Modal component props
interface ModalProps {
  children: React.ReactNode;
  trigger?: React.ReactNode;
  title?: string;
}

type Wishlists = Wishlist[];
type NewWishlist = any;
type WishlistArray = Array<NewWishlist | Wishlists[number]>;

// Helper function to filter items using the common manageDeletedProducts utility
const filterDeletedWishlistItems = (items: WishlistItem[]): WishlistItem[] => {
  if (!items || !items.length) return [];

  return items.filter((item) => {
    // Check if this item is in the deleted items list
    return !manageDeletedProducts.isWishlistItemDeleted(item.entityId);
  });
};

const WishlistMenu = memo(({ entityId, name, onWishlistDeleted, wishlist }: WishlistMenuProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const { setAccountState } = useAccountStatusContext();
  const t = useTranslations('Account.Wishlist');

  const toggleModal = () => setIsOpen(!isOpen);

  // Move handlers outside of render
  const handleWishlistDeleted = useCallback(() => {
    onWishlistDeleted();
    setAccountState((prevState) => ({
      ...prevState,
      status: 'success',
      message: t('messages.deleted', { name }),
    }));
    setDeleteModalOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [onWishlistDeleted, setAccountState, t, name]);

  const handleEditClick = useCallback(() => {
    // Apply deleted items filter when setting selectedWishlist
    const filteredWishlist = {
      ...wishlist,
      items: filterDeletedWishlistItems(wishlist.items),
    };
    localStorage.setItem('selectedWishlist', JSON.stringify(filteredWishlist));
    setIsOpen(false);
  }, [wishlist]);

  return (
    <div className="relative block lg:hidden">
      <button onClick={toggleModal} className="p-2">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          height="20"
          viewBox="0 0 20 20"
          width="20"
        >
          <path
            d="M6 10C6 11.1046 5.10457 12 4 12C2.89543 12 2 11.1046 2 10C2 8.89543 2.89543 8 4 8C5.10457 8 6 8.89543 6 10Z"
            fill="#4A5568"
          />
          <path
            d="M12 10C12 11.1046 11.1046 12 10 12C8.89543 12 8 11.1046 8 10C8 8.89543 8.89543 8 10 8C11.1046 8 12 8.89543 12 10Z"
            fill="#4A5568"
          />
          <path
            d="M16 12C17.1046 12 18 11.1046 18 10C18 8.89543 17.1046 8 16 8C14.8954 8 14 8.89543 14 10C14 11.1046 14.8954 12 16 12Z"
            fill="#4A5568"
          />
        </svg>
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40 bg-black bg-opacity-50" onClick={toggleModal} />
          <div className="fixed bottom-0 left-0 right-0 z-50 flex transform justify-center rounded-t-lg bg-white p-4 transition-transform duration-300 ease-out">
            <div className="space-y-4">
              <Modal
                title={t('deleteTitle', { name })}
                trigger={
                  <button
                    onClick={() => setDeleteModalOpen(true)}
                    className="flex w-full items-center gap-2 rounded-lg p-3 hover:bg-gray-50"
                  >
                    <span className="text-gray-600">
                      <svg
                        className="h-5 w-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                    </span>
                    <span className="text-gray-700">Delete List</span>
                  </button>
                }
              >
                <DeleteWishlistForm
                  id={entityId}
                  name={name}
                  onWishistDeleted={handleWishlistDeleted}
                />
              </Modal>

              <Link
                href="/account/wishlists/wishlist-product"
                className="flex w-full items-center gap-2 rounded-lg p-3 pl-0"
                onClick={handleEditClick}
              >
                <span className="text-gray-600">
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                    />
                  </svg>
                </span>
                <span className="text-gray-700">Edit List</span>
              </Link>

              <button className="flex w-full items-center gap-2 rounded-lg p-3 pl-0">
                <span className="text-gray-600">
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                    />
                  </svg>
                </span>
                <span className="text-gray-700">Share List</span>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
});

const Wishlist = memo(
  ({ setWishlistBook, wishlist, onCompare, onRemove, onColorSelect }: WishlistProps) => {
    const [deleteWishlistModalOpen, setDeleteWishlistModalOpen] = useState(false);
    const { setAccountState } = useAccountStatusContext();
    const t = useTranslations('Account.Wishlist');
    const { entityId, name } = wishlist;

    // Use the common filter function to handle deleted items
    const filteredItems = useMemo(() => {
      const items = 'items' in wishlist ? wishlist.items : [];
      return filterDeletedWishlistItems(items);
    }, [wishlist]);

    const handleWishlistDeleted = useCallback(() => {
      setWishlistBook((prev) => prev.filter((item) => item.entityId !== entityId));
      setAccountState((prevState) => ({
        ...prevState,
        status: 'success',
        message: t('messages.deleted', { name }),
      }));
      setDeleteWishlistModalOpen(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, [entityId, name, setWishlistBook, setAccountState, t]);

    const handleWishlistClick = useCallback(() => {
      // Store filtered wishlist in localStorage
      const filteredWishlist = {
        ...wishlist,
        items: filteredItems,
      };
      localStorage.setItem('selectedWishlist', JSON.stringify(filteredWishlist));
    }, [wishlist, filteredItems]);

    return (
      <div className="wishlist-item flex w-full items-center gap-4 bg-white lg:gap-6">
        <div className="flex h-[9em] w-[9em] items-center justify-center bg-[#80C5DA]">
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

        <div className="flex-1">
          <Link href="/account/wishlists/wishlist-product" onClick={handleWishlistClick}>
            <h3 className="wishlist-name mb-[4px] text-left text-[20px] font-medium leading-8 tracking-[0.15px] text-[#000000]">
              {name}
            </h3>
          </Link>
          <p className="mb-[12px] text-left text-[16px] font-normal leading-8 tracking-[0.15px] text-[#000000]">
            {filteredItems.length} {filteredItems.length === 1 ? 'item' : 'items'}
          </p>
          <div className="flex hidden w-[30%] gap-2 lg:block">
            <Link
              href="/account/wishlists/wishlist-product"
              onClick={handleWishlistClick}
              className="rounded-[3px] border border-[#B4DDE9] p-[10px] text-left text-[14px] font-medium uppercase !leading-5 tracking-wider text-[#002A37]"
            >
              EDIT DETAILS
            </Link>
          </div>
        </div>

        {name !== t('favorites') && (
          <div className="delete-wishlist block h-[10em]">
            <div className="delete-wishlist hidden lg:block">
              <Modal
                title={t('deleteTitle', { name })}
                trigger={
                  <Button variant="secondary" className="text-gray-500 hover:text-red-600">
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
            <WishlistMenu
              entityId={entityId}
              name={name}
              onWishlistDeleted={handleWishlistDeleted}
              wishlist={wishlist as Wishlist}
            />
          </div>
        )}
      </div>
    );
  },
);

export const WishlistBook = ({
  children,
  hasPreviousPage,
  wishlists,
  onCompare,
  onRemove,
  onColorSelect,
}: PropsWithChildren<WishlistBookProps>) => {
  const [wishlistBook, setWishlistBook] = useState<WishlistArray>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { accountState } = useAccountStatusContext();
  const [createWishlistModalOpen, setCreateWishlistModalOpen] = useState(false);
  const router = useRouter();

  // Listen for storage events from other components
  useEffect(() => {
    const handleStorageChange = (event: StorageEvent): void => {
      if (event.key === manageDeletedProducts.STORAGE_KEY) {
        // Refresh wishlists when deletion events occur in other components
        setWishlistBook((prevWishlists) => {
          return prevWishlists.map((wishlist) => {
            const items = 'items' in wishlist ? wishlist.items : [];
            const filteredItems = filterDeletedWishlistItems(items);

            return {
              ...wishlist,
              items: filteredItems,
              itemCount: filteredItems.length,
            };
          });
        });
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Memoize filtered wishlists calculation using the common function
  const filteredWishlists = useMemo(() => {
    return wishlists.map((wishlist) => {
      const filteredItems = filterDeletedWishlistItems(wishlist.items);

      return {
        ...wishlist,
        items: filteredItems,
        itemCount: filteredItems.length,
      };
    });
  }, [wishlists]);

  useEffect(() => {
    setWishlistBook(filteredWishlists);
    setIsLoading(false);

    storageUtils.setToStorage(
      'wishlistData',
      JSON.stringify({
        wishlists: filteredWishlists,
        lastUpdated: Date.now(),
      }),
    );

    if (hasPreviousPage && filteredWishlists.length === 0) {
      const timer = setTimeout(() => {
        router.back();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [filteredWishlists, hasPreviousPage, router]);

  const handleWishlistCreated = useCallback((newWishlist: NewWishlist) => {
    setWishlistBook((prev) => {
      if (prev.length < WISHLISTS_PER_PAGE) {
        return [...prev, newWishlist];
      }
      return prev;
    });
    setCreateWishlistModalOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="account-wishlist m-auto w-[80%]">
      {(accountState.status === 'error' || accountState.status === 'success') && (
        <Message className="mb-8 w-full text-gray-500" variant={accountState.status}>
          <p>{accountState.message}</p>
        </Message>
      )}

      <div className="mb-8 block md:hidden">
        <Modal
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

      <div className="create-wishlist-mobile-display mb-16 xl:block">
        <Modal
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

export default WishlistBook;
