'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Heart, X, Check, Loader2, AlertCircle, Plus } from 'lucide-react';
import { Button } from '~/components/ui/button';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { Input } from '~/components/ui/form';
import { getWishlists } from '~/components/graphql-apis';
import {
  addToWishlist,
  createWishlist,
} from '../_components/create-wishlist-form/_actions/create-wishlist';
import { BcImage } from '~/components/bc-image';
import heartIcon from '~/public/wishlistIcons/heartIcon.svg';
import { cn } from '~/lib/utils';
import Link from 'next/link';
import { manageDeletedProducts } from '~/components/common-functions';

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
  images?: ProductImage[];
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
  hasPreviousPage: boolean;
  product: Product;
  onGuestClick?: () => void;
  classNames?: {
    root?: string;
    button?: string;
    icon?: string;
  };
}

const WishlistAddToList = ({
  hasPreviousPage,
  product,
  onGuestClick,
  classNames,
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
  const [hasCreatedWishlist, setHasCreatedWishlist] = useState(false);
  const [isAddToListLoading, setIsAddToListLoading] = useState(false);
  const t = useTranslations('Account.Wishlist');
  const router = useRouter();

  const [selectedWishlists, setSelectedWishlists] = useState<number[]>([]);

  useEffect(() => {
    const loadWishlists = async () => {
      try {
        // Get deleted products from localStorage
        const deletedProducts = manageDeletedProducts.getDeletedProducts();

        const data = await getWishlists({ limit: 50 });
        if (data?.wishlists) {
          const transformedWishlists = data.wishlists.map((wishlist: any) => ({
            entityId: wishlist.entityId,
            name: wishlist.name,
            items: wishlist.items
              // Filter out any deleted products
              .filter((item: any) => {
                const isDeleted = deletedProducts.some(
                  (deletedProduct: any) =>
                    deletedProduct.productId === item.product.entityId &&
                    deletedProduct.wishlistItemId === item.entityId,
                );
                return !isDeleted;
              })
              .map((item: any) => ({
                entityId: item.entityId,
                product: {
                  ...item.product,
                  images: item.product.images || [],
                  variants: item.product.variants || { edges: [] },
                },
              })),
          }));
          setCurrentWishlists(transformedWishlists);
        }
      } catch (error) {
        console.error('Error loading wishlists:', error);
      }
    };

    loadWishlists();

    // Add event listener for storage changes
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'deletedProducts' || e.key === 'selectedWishlist') {
        loadWishlists();
      }
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  // Handle error message timeout
  useEffect(() => {
    if (message?.type === 'error') {
      const timer = setTimeout(() => {
        setMessage(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  // Handle modal body scroll
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

  const handleHeartClick = async () => {
    const data = await getWishlists({ limit: 1 });
    if (!data) {
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

  const getItemCount = (wishlist: Wishlist) => {
    // Base count from actual items
    const baseCount = wishlist.items?.length || 0;

    // Check if this wishlist has this product pending
    const hasPendingItem = tempAddedItems.some(
      (item) => item.listId === wishlist.entityId && item.product.entityId === product.entityId,
    );

    // Only add 1 if this specific wishlist has a pending item
    return baseCount + (hasPendingItem ? 1 : 0);
  };

  // Update handleWishlistSelect function
  const handleWishlistSelect = async (wishlist: Wishlist) => {
    if (loadingListId === wishlist.entityId || isAddToListLoading) return;

    // Check if product already exists in the wishlist
    const isExistingItem = wishlist.items.some(
      (item) => item.product.entityId === product.entityId,
    );

    if (isExistingItem) {
      setMessage({
        type: 'error',
        text: `This product already exists in "${wishlist.name}"`,
      });
      return;
    }

    setLoadingListId(wishlist.entityId);
    setIsAddToListLoading(true);

    try {
      const isPendingAdd = tempAddedItems.some(
        (item) => item.listId === wishlist.entityId && item.product.entityId === product.entityId,
      );

      if (isPendingAdd) {
        // Remove from temp items
        setTempAddedItems((prev) =>
          prev.filter(
            (item) =>
              !(item.listId === wishlist.entityId && item.product.entityId === product.entityId),
          ),
        );
        setJustAddedToList(null);
      } else {
        // Add to temp items
        const productToAdd = {
          listId: wishlist.entityId,
          product: {
            ...product,
            sku: product.sku || '',
            variants: product.variants || {},
          },
        };
        setTempAddedItems((prev) => [...prev, productToAdd]);
        setJustAddedToList(wishlist.entityId);
      }
    } catch (error) {
      console.error('Error toggling wishlist item:', error);
      setMessage({
        type: 'error',
        text: 'Failed to modify item in list',
      });
    } finally {
      setLoadingListId(null);
      setIsAddToListLoading(false);
    }
  };

  // Update handleSave function
  const handleSave = async () => {
    const data = await getWishlists({ limit: 1 });
    if (!data) {
      if (onGuestClick) {
        onGuestClick();
      }
      return;
    }

    setIsSaving(true);
    let hasError = false;

    try {
      // Keep track of successes
      const successfullyAddedItems: { listId: number; productId: number }[] = [];

      for (const item of tempAddedItems) {
        try {
          const result = await addToWishlist(
            item.listId,
            item.product.entityId,
            item.product.variantEntityId || undefined,
          );

          if (result.status === 'success') {
            successfullyAddedItems.push({
              listId: item.listId,
              productId: item.product.entityId,
            });
            manageDeletedProducts.removeDeletedProduct(item.product.entityId);
          } else {
            throw new Error(result.message || 'Failed to add item to list');
          }
        } catch (error) {
          console.error('Error adding item to wishlist:', error);
          hasError = true;
          break;
        }
      }

      if (!hasError) {
        setMessage({
          type: 'success',
          text: 'Saved to Favorites',
        });

        // Update wishlists immediately with new items
        setCurrentWishlists((prev) =>
          prev.map((wishlist) => {
            const addedToThisWishlist = successfullyAddedItems.find(
              (item) => item.listId === wishlist.entityId,
            );

            if (addedToThisWishlist) {
              // Add the new item to this wishlist
              return {
                ...wishlist,
                items: [
                  ...wishlist.items,
                  {
                    entityId: Date.now(), // Temporary ID until refresh
                    product: product,
                    productEntityId: product.entityId,
                    variantEntityId: product.variantEntityId || 0,
                  },
                ],
              };
            }
            return wishlist;
          }),
        );

        // Clear temp items
        setTempAddedItems([]);
        setJustAddedToList(null);

        // Refresh from API after local update
        const refreshData = async () => {
          const refreshedData = await getWishlists({ limit: 50 });
          if (refreshedData?.wishlists) {
            const transformedWishlists = refreshedData.wishlists.map((wishlist: any) => ({
              entityId: wishlist.entityId,
              name: wishlist.name,
              items: wishlist.items || [],
            }));
            setCurrentWishlists(transformedWishlists);
          }
        };

        // Refresh after a short delay to allow API to sync
        setTimeout(refreshData, 500);

        router.refresh();
      } else {
        setMessage({
          type: 'error',
          text: 'Failed to save some items. Please try again.',
        });
      }
    } catch (error) {
      console.error('Error in handleSave:', error);
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
    setIsAddToListLoading(true);

    try {
      const formData = new FormData();
      formData.append('name', trimmedName);

      const result = await createWishlist(formData);

      if (result.status === 'success') {
        // Create new wishlist with initial item
        const newWishlist: Wishlist = {
          entityId: result.data.entityId,
          name: trimmedName,
          items: [], // Start with empty items array
        };

        // Add to current wishlists
        setCurrentWishlists((prev) => [...prev, newWishlist]);

        // Add product to temp items immediately
        const productToAdd = {
          listId: result.data.entityId,
          product: {
            ...product,
            sku: product.sku || '',
            variants: product.variants || {},
          },
        };

        setTempAddedItems((prev) => [...prev, productToAdd]);
        setJustAddedToList(result.data.entityId);

        setNewListName('');
        setShowCreateForm(false);
        setHasCreatedWishlist(true);
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to create new list' });
    } finally {
      setIsCreating(false);
      setIsAddToListLoading(false);
    }
  };

  return (
    <div className={cn(classNames?.root || 'relative')}>
      <button
        title="Add to List"
        onClick={handleHeartClick}
        className={cn(
          classNames?.button ||
            'inline-flex items-center justify-center rounded-full bg-[#F3F4F5] p-[10px] text-sm font-medium text-white focus:outline-none',
        )}
      >
        <BcImage
          alt="wishlist-heart"
          width={35}
          height={35}
          unoptimized={true}
          src={heartIcon}
          className={cn(classNames?.icon || 'h-[30px] w-[30px]')}
        />
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="relative w-full max-w-[20em] rounded-lg bg-white px-[2.5em] py-[1.5em] pb-[3em] shadow-2xl md:max-w-[35em]">
            <button
              title='Close "Add to List" modal'
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
                      <span className="text-[12px] font-semibold xl:text-base">{message.text}</span>{' '}
                      <span className="ml-2 mr-2"> - </span>
                    </div>
                    <Link
                      href="/account/wishlists"
                      className="text-[12px] font-medium text-[#145A2E] underline xl:text-sm"
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

                      const isExistingItem = wishlist.items.some(
                        (item) => item.product.entityId === product.entityId,
                      );
                      const isPendingAdd = tempAddedItems.some(
                        (item) =>
                          item.listId === wishlist.entityId &&
                          item.product.entityId === product.entityId,
                      );
                      const isItemLoading = loadingListId === wishlist.entityId;
                      const itemCount = getItemCount(wishlist);

                      return (
                        <div key={wishlist.entityId} className="wishlist-item">
                          <button
                            onClick={() => handleWishlistSelect(wishlist)}
                            disabled={isItemLoading || isAddToListLoading}
                            className={cn(
                              'group flex w-full items-center py-[0.8em] text-left transition-all hover:bg-green-100 hover:pl-4',
                              (isItemLoading || isAddToListLoading) && 'opacity-50',
                            )}
                          >
                            {isItemLoading ? (
                              <span className="mr-2">
                                <Loader2 className="h-5 w-5 animate-spin text-[#B4B4B5]" />
                              </span>
                            ) : isPendingAdd ? (
                              <span className="mr-2 flex h-5 w-5 items-center justify-center rounded-full bg-[#145A2E]">
                                <Check className="h-3 w-3 text-white" />
                              </span>
                            ) : (
                              <span className="mr-2 flex h-5 w-5 items-center justify-center">
                                <Plus className="h-5 w-5 text-[#B4B4B5]" />
                              </span>
                            )}

                            <span
                              className={cn(
                                'font-[500] capitalize',
                                isPendingAdd ? 'text-[#145A2E]' : 'text-[#353535]',
                              )}
                            >
                              {wishlist.name}
                              <span
                                className={cn(
                                  'ml-2 font-[500]',
                                  isPendingAdd ? 'text-[#145A2E]' : 'text-[#353535]',
                                )}
                              >
                                ({itemCount} {itemCount === 1 ? 'item' : 'items'})
                              </span>
                            </span>
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

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

                {tempAddedItems.length > 0 && (
                  <Button
                    className={cn(
                      '!hover:bg-[#008BB7] m-auto !mt-[1em] w-[9em] !bg-[#008BB7] text-[14px] !font-[400] text-white',
                      'disabled:cursor-not-allowed disabled:opacity-50',
                    )}
                    onClick={handleSave}
                    disabled={isSaving}
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
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WishlistAddToList;
