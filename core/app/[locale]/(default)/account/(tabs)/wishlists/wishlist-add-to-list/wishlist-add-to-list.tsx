'use client';

import React, { useState, useEffect } from 'react';
import { Heart, X, Check, Loader2, AlertCircle, Plus } from 'lucide-react';
import { Button } from '~/components/ui/button';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { Input } from '~/components/ui/form';
import {
  addToWishlist,
  createWishlist,
} from '../_components/create-wishlist-form/_actions/create-wishlist';
import { BcImage } from '~/components/bc-image';
import heartIcon from '~/public/wishlistIcons/heartIcon.svg';
import { cn } from '~/lib/utils';
import { checkAuthStatus } from './auth-client';
import Link from 'next/link';
import { useCommonContext } from '~/components/common-context/common-provider';

interface ProductImage {
  url: string;
  altText: string;
  isDefault: boolean;
}

interface ProductBrand {
  name: string;
  path: string;
}

interface ProductPrices {
  price: {
    value: number;
    currencyCode: string;
  };
  priceRange: {
    min: { value: number };
    max: { value: number };
  };
}

interface Product {
  entityId: number;
  name: string;
  sku: string;
  path: string;
  images: ProductImage[];
  brand?: ProductBrand;
  prices?: ProductPrices | null;
  rating?: number;
  reviewCount?: number;
  variantEntityId?: number;
  mpn: string;
  selectedOptionValue?: string;
  productOptions?: {
    edges: Array<{
      node: {
        __typename: string;
        values: {
          edges: Array<{
            node: {
              label: string;
              isSelected: boolean;
            };
          }>;
        };
      };
    }>;
  };
  variants: any;
}

interface WishlistItem {
  entityId: number;
  product: Product;
}

interface Wishlist {
  entityId: number;
  name: string;
  items: WishlistItem[];
}

interface WishlistAddToListProps {
  wishlists: Wishlist[];
  hasPreviousPage: boolean;
  product: Product;
  onGuestClick?: () => void;
}

const WishlistAddToList = ({
  wishlists,
  hasPreviousPage,
  product,
  onGuestClick,
}: WishlistAddToListProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newListName, setNewListName] = useState('');
  const [isInputValid, setInputValidation] = useState(true);
  const [isDuplicate, setIsDuplicate] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [currentWishlists, setCurrentWishlists] = useState<Wishlist[]>([]);
  const [tempAddedItems, setTempAddedItems] = useState<{ listId: number; product: Product }[]>([]);
  const [justAddedToList, setJustAddedToList] = useState<number | null>(null);
  const [loadingListId, setLoadingListId] = useState<number | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const { deletedProductIds, setDeletedProductId } = useCommonContext();

  const t = useTranslations('Account.Wishlist');
  const router = useRouter();

  // Function to remove deletion record from IndexedDB
  const removeFromDeletedProducts = async (wishlistId: number, productId: number) => {
    try {
      const request = indexedDB.open('WishlistDB', 4);

      request.onsuccess = (event: Event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        const transaction = db.transaction(['deletedProducts'], 'readwrite');
        const store = transaction.objectStore('deletedProducts');
        const index = store.index('by_ids');

        const getRequest = index.getKey([wishlistId, productId]);

        getRequest.onsuccess = () => {
          if (getRequest.result) {
            store.delete(getRequest.result);
          }
        };
      };
    } catch (error) {
      console.error('Error removing deletion record:', error);
    }
  };

  // Filter wishlists based on deletedProductIds
  useEffect(() => {
    const filteredWishlists = wishlists.map((wishlist) => ({
      ...wishlist,
      items: wishlist.items.filter(
        (item) =>
          !deletedProductIds.some(
            (deletion) =>
              deletion.wishlistId === wishlist.entityId &&
              deletion.productId === item.product.entityId,
          ),
      ),
    }));

    setCurrentWishlists(filteredWishlists);
  }, [wishlists, deletedProductIds]);

  // Add IndexedDB initialization
  useEffect(() => {
    const loadDeletedProducts = async () => {
      try {
        const request = indexedDB.open('WishlistDB', 4);

        request.onsuccess = (event: Event) => {
          const db = (event.target as IDBOpenDBRequest).result;
          const transaction = db.transaction(['deletedProducts'], 'readonly');
          const store = transaction.objectStore('deletedProducts');
          const getAllRequest = store.getAll();

          getAllRequest.onsuccess = () => {
            const storedDeletions = getAllRequest.result;

            // Filter wishlists based on stored deletions
            const filteredWishlists = wishlists.map((wishlist) => ({
              ...wishlist,
              items: wishlist.items.filter(
                (item) =>
                  !storedDeletions.some(
                    (deletion) =>
                      deletion.wishlistId === wishlist.entityId &&
                      deletion.productId === item.product.entityId,
                  ),
              ),
            }));

            setCurrentWishlists(filteredWishlists);
          };
        };
      } catch (error) {
        console.error('Error loading deleted products:', error);
      }
    };

    loadDeletedProducts();
  }, [wishlists]);

  useEffect(() => {
    const verifyAuth = async () => {
      const authResult = await checkAuthStatus();
    };
    verifyAuth();
  }, []);

  useEffect(() => {
    if (message?.type === 'error') {
      const timer = setTimeout(() => {
        setMessage(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  useEffect(() => {
    setCurrentWishlists(wishlists);
  }, [wishlists]);

  const handleHeartClick = async () => {
    const authResult = await checkAuthStatus();

    if (!authResult.isAuthenticated) {
      window.location.href = '/login';
      return;
    }

    setIsOpen(true);
    setTempAddedItems([]);
    setJustAddedToList(null);
    setMessage(null);
  };

  const handleClose = () => {
    if (tempAddedItems.length > 0) {
      const confirmed = window.confirm('You have unsaved changes. Are you sure you want to close?');
      if (!confirmed) {
        return;
      }
    }

    setIsOpen(false);
    setShowCreateForm(false);
    setNewListName('');
    setTempAddedItems([]);
    setJustAddedToList(null);
    setIsDuplicate(false);
    setMessage(null);
  };

  const toggleCreateForm = () => {
    setShowCreateForm(!showCreateForm);
    if (showCreateForm) {
      setNewListName('');
      setInputValidation(true);
      setIsDuplicate(false);
    }
  };

  const handleInputValidation = (e: React.ChangeEvent<HTMLInputElement>) => {
    const currentValue = e.target.value.trim();

    setInputValidation(!e.target.validity.valueMissing);
    setIsDuplicate(false);
    setNewListName(e.target.value);

    if (!currentValue) {
      setInputValidation(false);
      return;
    }

    const isDuplicateName = currentWishlists.some(
      (wishlist) => wishlist.name.toLowerCase().trim() === currentValue.toLowerCase(),
    );

    if (isDuplicateName) {
      setIsDuplicate(true);
      setInputValidation(false);
    }
  };

  // Update getItemCount function to account for deletions
  const getItemCount = (wishlist: Wishlist) => {
    // Filter out deleted items first
    const nonDeletedItems = wishlist.items.filter(
      (item) =>
        !deletedProductIds.some(
          (deletion) =>
            deletion.wishlistId === wishlist.entityId &&
            deletion.productId === item.product.entityId,
        ),
    );

    const savedItems = nonDeletedItems.length;
    const tempItems = tempAddedItems.filter((item) => item.listId === wishlist.entityId).length;
    const existingProduct = nonDeletedItems.some(
      (item) => item.product?.entityId === product?.entityId,
    );

    return existingProduct ? savedItems : savedItems + tempItems;
  };

  const handleSave = async () => {
    if (tempAddedItems.length === 0) {
      setMessage({
        type: 'error',
        text: 'Please add items to a wishlist before saving',
      });
      return;
    }

    setIsSaving(true);

    try {
      for (const item of tempAddedItems) {
        const result = await addToWishlist(
          item.listId,
          item.product.entityId,
          item.product.variantEntityId || undefined,
        );

        if (result.status === 'success') {
          // Update the current wishlists without clearing temp items
          setCurrentWishlists((prev) =>
            prev.map((wishlist) => {
              if (wishlist.entityId === item.listId) {
                const newItem = {
                  entityId: Date.now(),
                  product: item.product,
                };
                return {
                  ...wishlist,
                  items: [...wishlist.items, newItem],
                };
              }
              return wishlist;
            }),
          );
        }
      }

      setMessage({
        type: 'success',
        text: 'Saved to Favorites',
      });

      // Don't clear tempAddedItems or justAddedToList
      // Don't close modal
      router.refresh();
    } catch (error) {
      setMessage({
        type: 'error',
        text: 'Failed to save items. Please try again.',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleCreateSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const trimmedName = newListName.trim();

    if (!trimmedName) {
      setInputValidation(false);
      setMessage({ type: 'error', text: 'Please enter a list name' });
      return;
    }

    setIsCreating(true);

    try {
      const dateTime = new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'numeric',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        second: 'numeric',
        hourCycle: 'h23',
      }).format(new Date());

      const formData = new FormData();
      formData.append('name', `${trimmedName} - ${dateTime}`);

      const result = await createWishlist(formData);

      if (result.status === 'success') {
        const newWishlist: Wishlist = {
          entityId: result.data.entityId,
          name: `${trimmedName} - ${dateTime}`,
          items: [],
        };

        // Add new wishlist to current wishlists
        setCurrentWishlists((prev) => [...prev, newWishlist]);

        // Keep form state
        setNewListName('');
        setShowCreateForm(false);

        // Select the new wishlist immediately
        await handleWishlistSelect(newWishlist);
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to create new list' });
    } finally {
      setIsCreating(false);
    }
  };

  const handleWishlistSelect = async (wishlist: Wishlist) => {
    setLoadingListId(wishlist.entityId);

    try {
      const productToAdd = {
        listId: wishlist.entityId,
        product: {
          ...product,
          sku: product.sku || '',
          variants: product.variants || {},
        },
      };

      // Add to temporary items without clearing existing ones
      setTempAddedItems((prev) => {
        const isAlreadyAdded = prev.some(
          (item) => item.listId === wishlist.entityId && item.product.entityId === product.entityId,
        );

        if (isAlreadyAdded) {
          return prev;
        }

        return [...prev, productToAdd];
      });

      setJustAddedToList(wishlist.entityId);
    } catch (error) {
      setMessage({
        type: 'error',
        text: 'Failed to add item to list',
      });
    } finally {
      setLoadingListId(null);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={handleHeartClick}
        className="inline-flex items-center justify-center rounded-full bg-[#F3F4F5] p-[10px] text-sm font-medium text-white focus:outline-none"
      >
        <BcImage
          alt="wishlist-heart"
          width={35}
          height={35}
          unoptimized={true}
          src={heartIcon}
          className="h-[30px] w-[30px]"
        />
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="relative w-full max-w-[20em] rounded-lg bg-white px-[2.5em] py-[1.5em] pb-[3em] shadow-2xl md:max-w-[35em]">
            <button
              onClick={handleClose}
              className="mb-[1em] mt-[1em] flex w-[100%] justify-center rounded-full p-1"
            >
              <X size={16} strokeWidth={3} />
            </button>

            {message && (
              <div
                className={cn(
                  'mb-4 flex items-center px-4 py-2 text-sm font-medium shadow-sm',
                  message.type === 'success'
                    ? 'border-green-200 bg-green-50'
                    : 'border-red-200 bg-red-50 text-red-800',
                )}
              >
                {message.type === 'success' ? (
                  <div className="flex w-full items-center justify-center">
                    <div className="flex items-center">
                      <span className="mr-2 flex h-5 w-5 items-center justify-center rounded-full bg-[#145A2E] xl:h-5 xl:w-5">
                        <Check className="mb-1 mt-1 h-3 w-3 text-white" />
                      </span>
                      <span className="text-[12px] xl:text-base font-semibold">{message.text}</span>{' '}
                      <span className="ml-2 mr-2"> - </span>
                    </div>
                    <Link
                      href="/account/wishlists"
                      className="text-[12px] xl:text-sm font-medium text-[#145A2E] underline"
                    >
                      {' '}
                      View
                    </Link>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-red-600" />
                    <span>{message.text}</span>
                  </div>
                )}
              </div>
            )}

            <h2 className="mb-1 text-center text-xl font-[500] xl:text-left">Add to List</h2>

            <div className="flex flex-col">
              <div className="flex-1">
                <div className="max-h-[250px] overflow-y-auto pr-2">
                  <div className="scrollbar-thin scrollbar-track-transparent scrollbar-thumb-gray-300">
                    {currentWishlists.map((wishlist) => {
                      if (!wishlist.items || !product) return null;

                      const isProductInList = wishlist.items.some(
                        (item) => item.product?.entityId === product?.entityId,
                      );

                      const isInTempList = tempAddedItems.some(
                        (item) => item.listId === wishlist.entityId,
                      );
                      const isLoading = loadingListId === wishlist.entityId;
                      const isAdded = justAddedToList === wishlist.entityId;

                      // Get correct item count
                      const itemCount = getItemCount(wishlist);

                      return (
                        <div key={wishlist.entityId} className="wishlist-item">
                          <button
                            onClick={() => {
                              if (isProductInList || isInTempList) {
                                setMessage({
                                  type: 'error',
                                  text: `This product already exists in "${wishlist.name}"`,
                                });
                              } else {
                                handleWishlistSelect(wishlist);
                              }
                            }}
                            disabled={isPending || isLoading}
                            className={cn(
                              'group flex w-full items-center py-[0.8em] text-left transition-all hover:bg-green-100 hover:pl-4',
                              isProductInList ? 'cursor-not-allowed' : '',
                              (isPending || isLoading) && 'opacity-50',
                            )}
                          >
                            {/* Plus Icon or Checkmark */}
                            {isAdded ? (
                              <span className="mr-2 flex h-5 w-7 items-center justify-center rounded-full bg-[#145A2E] xl:h-5 xl:w-5">
                                <Check className="mb-1 mt-1 h-3 w-3 text-white" />
                              </span>
                            ) : (
                              <span className="mr-2 text-[#B4B4B5]">
                                <Plus className="h-5 w-5 text-[#B4B4B5]" />
                              </span>
                            )}

                            {/* Wishlist Name and Item Count */}
                            <span className="capitalize text-[#353535]">
                              {wishlist.name}
                              <span className="ml-2 capitalize text-[#353535]">
                                ({itemCount} {itemCount === 1 ? 'item' : 'items'})
                              </span>
                            </span>

                            {/* Loading/Added Icons */}
                            {isLoading ? (
                              <Loader2 className="ml-auto h-4 w-4 animate-spin" />
                            ) : isAdded ? (
                              <Check className="ml-auto h-4 w-4 text-[#145A2E]" />
                            ) : null}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* New List Section */}
              <div className="mt-4 bg-white">
                <button
                  onClick={toggleCreateForm}
                  className="group flex w-full items-center text-left"
                >
                  <span className="ml-[2px] mr-2 text-[28px] font-[500] text-[#0C89A6] group-hover:text-[#03465C]">
                    {showCreateForm ? (
                      <span className="text-[16px] text-black">NEW LIST</span>
                    ) : (
                      <span className="text-black">
                        <span className="mr-2 text-[29px]">+</span>
                        <span className="relative bottom-[4px] text-[16px] font-bold">
                          New List...
                        </span>
                      </span>
                    )}
                  </span>
                </button>

                {showCreateForm && (
                  <form onSubmit={handleCreateSubmit} className="mt-[6px]">
                    <div className="pdp-wishlist-input space-y-3">
                      <Input
                        autoFocus
                        value={newListName}
                        name="name"
                        type="text"
                        required
                        error={!isInputValid}
                        onChange={handleInputValidation}
                        onInvalid={handleInputValidation}
                        className="w-full rounded-md border"
                        placeholder="Add a short description..."
                      />
                      {!isInputValid && !isDuplicate && (
                        <p className="text-xs text-[#A71F23]">{t('emptyName')}</p>
                      )}
                      {isDuplicate && (
                        <p className="text-xs text-[#A71F23]">
                          A list with this name already exists
                        </p>
                      )}
                    </div>
                  </form>
                )}
              </div>

              {/* Action Buttons */}
              <div className="m-auto mt-2 flex flex-col justify-center gap-2">
                {showCreateForm && (
                  <Button
                    onClick={() =>
                      handleCreateSubmit({
                        preventDefault: () => {},
                      } as React.FormEvent<HTMLFormElement>)
                    }
                    disabled={isCreating || !newListName || isDuplicate}
                    className="!hover:bg-[#008BB7] mt-[1em] w-[11em] !bg-[#008BB7] px-[10px] py-[10px] !font-[400] text-white disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {isCreating ? (
                      <div className="flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        CREATING...
                      </div>
                    ) : (
                      'CREATE AND ADD'
                    )}
                  </Button>
                )}
                <Button
                  className={cn(
                    '!hover:bg-[#008BB7] m-auto !mt-[1em] w-[9em] !bg-[#008BB7] text-[14px] !font-[400] text-white',
                    'disabled:cursor-not-allowed disabled:opacity-50',
                  )}
                  onClick={handleSave}
                  disabled={isSaving || tempAddedItems.length === 0}
                >
                  {isSaving ? (
                    <div className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      SAVING...
                    </div>
                  ) : (
                    'SAVE'
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WishlistAddToList;
