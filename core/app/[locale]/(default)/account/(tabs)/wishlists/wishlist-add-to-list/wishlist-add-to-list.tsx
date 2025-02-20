'use client';

import React, { useState, useEffect, useCallback, memo, useMemo } from 'react';
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
// Define the interface for added items
interface AddedWishlistItem {
  listId: number;
  productId: number;
  wishlistItemId: number;
}
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

const WishlistAddToList = memo(
  ({ hasPreviousPage, product, onGuestClick, classNames }: WishlistAddToListProps) => {
    const t = useTranslations('Account.Wishlist');
    const router = useRouter();

    // Combine related states into a single state object
    const [uiState, setUiState] = useState({
      isOpen: false,
      showCreateForm: false,
      isInputValid: true,
      isDuplicate: false,
      isPending: false,
      isCreating: false,
      isSaving: false,
      isAddToListLoading: false,
      hasCreatedWishlist: false,
      loadingListId: null as number | null,
      justAddedToList: null as number | null,
      message: null as { type: 'success' | 'error'; text: string } | null,
    });

    // Group related data states
    const [wishlistState, setWishlistState] = useState({
      currentWishlists: [] as Wishlist[],
      tempAddedItems: [] as { listId: number; product: Product }[],
      newListName: '',
    });

    // Check if product is currently deleted
    const isProductDeleted = useCallback(() => {
      return manageDeletedProducts.isProductDeleted(product.entityId);
    }, [product.entityId]);

    // Filter function to remove deleted items
    const filterDeletedItems = useCallback((wishlists: Wishlist[]): Wishlist[] => {
      return wishlists.map((wishlist) => ({
        ...wishlist,
        items: wishlist.items.filter(
          (item) => !manageDeletedProducts.isWishlistItemDeleted(item.entityId),
        ),
      }));
    }, []);

    useEffect(() => {
      let isMounted = true;

      const loadWishlists = async () => {
        try {
          const data = await getWishlists({ limit: 50 });

          if (data?.wishlists && isMounted) {
            // First transform the data
            const transformedWishlists = data.wishlists.map((wishlist: any) => ({
              entityId: wishlist.entityId,
              name: wishlist.name,
              items: wishlist.items.map((item: any) => ({
                entityId: item.entityId,
                product: {
                  ...item.product,
                  images: item.product.images || [],
                  variants: item.product.variants || { edges: [] },
                },
              })),
            }));

            // Then filter out deleted items using the common function
            const filteredWishlists = filterDeletedItems(transformedWishlists);

            setWishlistState((prev) => ({
              ...prev,
              currentWishlists: filteredWishlists,
            }));
          }
        } catch (error) {
          console.error('Error loading wishlists:', error);
        }
      };

      // Handle storage changes from other components
      const handleStorageChange = (e: StorageEvent) => {
        if (e.key === manageDeletedProducts.STORAGE_KEY) {
          // Refresh wishlists when deletion events occur in other components
          loadWishlists();
        }
      };

      // Initial load
      loadWishlists();
      window.addEventListener('storage', handleStorageChange);

      // Handle modal body scroll
      if (uiState.isOpen) {
        document.body.style.overflow = 'hidden';
      }

      // Cleanup
      return () => {
        isMounted = false;
        window.removeEventListener('storage', handleStorageChange);
        document.body.style.overflow = 'unset';
      };
    }, [uiState.isOpen, filterDeletedItems]);

    const handleHeartClick = useCallback(async () => {
      const data = await getWishlists({ limit: 1 });
      if (!data) {
        window.location.href = '/login';
        return;
      }

      setUiState((prev) => ({
        ...prev,
        isOpen: true,
        message: null,
      }));

      setWishlistState((prev) => ({
        ...prev,
        tempAddedItems: [],
      }));
    }, []);

    const handleClose = useCallback(() => {
      if (wishlistState.tempAddedItems.length > 0) {
        const confirmed = window.confirm(
          'You have unsaved changes. Are you sure you want to close?',
        );
        if (!confirmed) return;
      }

      setUiState((prev) => ({
        ...prev,
        isOpen: false,
        showCreateForm: false,
        isDuplicate: false,
        message: null,
      }));

      setWishlistState((prev) => ({
        ...prev,
        newListName: '',
        tempAddedItems: [],
      }));
    }, [wishlistState.tempAddedItems.length]);

    const toggleCreateForm = useCallback(() => {
      setUiState((prev) => ({
        ...prev,
        showCreateForm: !prev.showCreateForm,
        isInputValid: true,
        isDuplicate: false,
      }));

      if (uiState.showCreateForm) {
        setWishlistState((prev) => ({
          ...prev,
          newListName: '',
        }));
      }
    }, [uiState.showCreateForm]);

    const handleInputValidation = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        const currentValue = e.target.value.trim();

        const isDuplicateName = wishlistState.currentWishlists.some(
          (wishlist) => wishlist.name.toLowerCase().trim() === currentValue.toLowerCase(),
        );

        setUiState((prev) => ({
          ...prev,
          isInputValid: !!currentValue,
          isDuplicate: isDuplicateName,
        }));

        setWishlistState((prev) => ({
          ...prev,
          newListName: e.target.value,
        }));
      },
      [wishlistState.currentWishlists],
    );

    const handleWishlistSelect = useCallback(
      async (wishlist: Wishlist) => {
        if (uiState.loadingListId === wishlist.entityId || uiState.isAddToListLoading) return;

        setUiState((prev) => ({
          ...prev,
          loadingListId: wishlist.entityId,
          isAddToListLoading: true,
        }));

        try {
          const isPendingAdd = wishlistState.tempAddedItems.some(
            (item) =>
              item.listId === wishlist.entityId && item.product.entityId === product.entityId,
          );

          const isExistingItem = wishlist.items.some(
            (item) => item.product.entityId === product.entityId,
          );

          if (isExistingItem) {
            setUiState((prev) => ({
              ...prev,
              message: {
                type: 'error',
                text: `This product already exists in "${wishlist.name}"`,
              },
            }));
            return;
          }

          if (isPendingAdd) {
            // Remove from pending items
            setWishlistState((prev) => ({
              ...prev,
              tempAddedItems: prev.tempAddedItems.filter(
                (item) =>
                  !(
                    item.listId === wishlist.entityId && item.product.entityId === product.entityId
                  ),
              ),
            }));

            setUiState((prev) => ({
              ...prev,
              justAddedToList: null,
              message: null,
            }));
          } else {
            // Add to pending items
            const productToAdd = {
              listId: wishlist.entityId,
              product: {
                ...product,
                sku: product.sku || '',
                variants: product.variants || {},
                entityId: product.entityId,
              },
            };

            setWishlistState((prev) => ({
              ...prev,
              tempAddedItems: [...prev.tempAddedItems, productToAdd],
            }));

            setUiState((prev) => ({
              ...prev,
              justAddedToList: wishlist.entityId,
              message: null,
            }));

            // If this product was previously deleted, we should restore it
            if (isProductDeleted()) {
              // Note: We don't actually remove from deleted products yet
              // This happens when we save
              console.log('Product was previously deleted, will be restored on save');
            }
          }
        } catch (error) {
          console.error('Error toggling wishlist item:', error);
          setUiState((prev) => ({
            ...prev,
            message: {
              type: 'error',
              text: 'Failed to modify item in list',
            },
          }));
        } finally {
          setUiState((prev) => ({
            ...prev,
            loadingListId: null,
            isAddToListLoading: false,
          }));
        }
      },
      [
        product,
        uiState.loadingListId,
        uiState.isAddToListLoading,
        wishlistState.tempAddedItems,
        isProductDeleted,
      ],
    );

    // Fix for WishlistAddToList handleSave function

    const handleSave = useCallback(async () => {
      const data = await getWishlists({ limit: 1 });
      if (!data && onGuestClick) {
        onGuestClick();
        return;
      }

      setUiState((prev) => ({
        ...prev,
        isSaving: true,
      }));

      try {
        // Properly typed array
        const successfullyAddedItems: AddedWishlistItem[] = [];

        for (const item of wishlistState.tempAddedItems) {
          try {
            const result = await addToWishlist(
              item.listId,
              item.product.entityId,
              item.product.variantEntityId,
            );

            if (result.status === 'success') {
              const addedItem: AddedWishlistItem = {
                listId: item.listId,
                productId: item.product.entityId,
                wishlistItemId: result.data?.entityId || Date.now(),
              };
              successfullyAddedItems.push(addedItem);

              // CRITICAL FIX: Check if this product was previously deleted
              if (manageDeletedProducts.isProductDeleted(item.product.entityId)) {
                console.log(`Restoring previously deleted product: ${item.product.entityId}`);

                // We need to find all deleted items with this product ID and restore them
                const deletedItems = manageDeletedProducts.getDeletedItems();
                const itemsToRestore = deletedItems.filter(
                  (deletedItem) => deletedItem.productId === item.product.entityId,
                );

                // Restore each item that matches this product
                for (const itemToRestore of itemsToRestore) {
                  manageDeletedProducts.restoreWishlistItem(itemToRestore.wishlistItemId);
                }

                // Dispatch storage event to notify other components
                window.dispatchEvent(
                  new StorageEvent('storage', {
                    key: manageDeletedProducts.STORAGE_KEY,
                  }),
                );
              }
            }
          } catch (error) {
            console.error('Error adding item to wishlist:', error);
            throw error;
          }
        }

        // Update local wishlist state
        setWishlistState((prev) => {
          const updatedWishlists = prev.currentWishlists.map((wishlist) => {
            const addedToThisWishlist = successfullyAddedItems.filter(
              (item) => item.listId === wishlist.entityId,
            );

            if (addedToThisWishlist.length > 0) {
              // Create new wishlist items for valid additions
              const newItems: WishlistItem[] = [];

              for (const addition of addedToThisWishlist) {
                // Only add if it doesn't exist already
                const itemExists = wishlist.items.some(
                  (item) => item.product.entityId === addition.productId,
                );

                if (!itemExists) {
                  newItems.push({
                    entityId: addition.wishlistItemId,
                    product: {
                      ...product,
                      entityId: product.entityId,
                    },
                  });
                }
              }

              // Only update if we have new items
              if (newItems.length > 0) {
                return {
                  ...wishlist,
                  items: [...wishlist.items, ...newItems],
                };
              }
            }
            return wishlist;
          });

          return {
            ...prev,
            currentWishlists: updatedWishlists,
            tempAddedItems: [],
          };
        });

        setUiState((prev) => ({
          ...prev,
          message: {
            type: 'success',
            text: 'Saved to Favorites',
          },
        }));

        // Refresh wishlists after a short delay
        const refreshWishlists = async () => {
          try {
            const refreshedData = await getWishlists({ limit: 50 });
            if (refreshedData?.wishlists) {
              const transformedWishlists = refreshedData.wishlists.map((wishlist: any) => ({
                entityId: wishlist.entityId,
                name: wishlist.name,
                items: wishlist.items || [],
              }));

              // No need to filter here since we're about to call handleStorageChange
              setWishlistState((prev) => ({
                ...prev,
                currentWishlists: transformedWishlists,
              }));

              // Force a storage event to ensure all components update
              window.dispatchEvent(
                new StorageEvent('storage', {
                  key: manageDeletedProducts.STORAGE_KEY,
                }),
              );
            }
          } catch (error) {
            console.error('Error refreshing wishlists:', error);
          }
        };

        setTimeout(refreshWishlists, 500);
      } catch (error) {
        console.error('Error in handleSave:', error);
        setUiState((prev) => ({
          ...prev,
          message: {
            type: 'error',
            text: 'Failed to save items. Please try again.',
          },
        }));
      } finally {
        setUiState((prev) => ({
          ...prev,
          isSaving: false,
        }));
      }
    }, [wishlistState.tempAddedItems, product, onGuestClick]);

    const handleCreateSubmit = useCallback(
      async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const trimmedName = wishlistState.newListName.trim();

        if (!trimmedName) {
          setUiState((prev) => ({
            ...prev,
            isInputValid: false,
            message: { type: 'error', text: 'Please enter a list name' },
          }));
          return;
        }

        setUiState((prev) => ({
          ...prev,
          isCreating: true,
          isAddToListLoading: true,
        }));

        try {
          const formData = new FormData();
          formData.append('name', trimmedName);

          const result = await createWishlist(formData);

          if (result.status === 'success') {
            const newWishlist: Wishlist = {
              entityId: result.data.entityId,
              name: trimmedName,
              items: [],
            };

            // If the product was previously deleted, we'll restore it when saving
            const wasDeleted = isProductDeleted();

            setWishlistState((prev) => ({
              ...prev,
              currentWishlists: [...prev.currentWishlists, newWishlist],
              tempAddedItems: [
                ...prev.tempAddedItems,
                {
                  listId: result.data.entityId,
                  product: {
                    ...product,
                    sku: product.sku || '',
                    variants: product.variants || {},
                  },
                },
              ],
              newListName: '',
            }));

            setUiState((prev) => ({
              ...prev,
              showCreateForm: false,
              justAddedToList: result.data.entityId,
              hasCreatedWishlist: true,
            }));
          }
        } catch (error) {
          setUiState((prev) => ({
            ...prev,
            message: { type: 'error', text: 'Failed to create new list' },
          }));
        } finally {
          setUiState((prev) => ({
            ...prev,
            isCreating: false,
            isAddToListLoading: false,
          }));
        }
      },
      [wishlistState.newListName, product, isProductDeleted],
    );

    // Determine button appearance - show special indicator if it's a previously deleted product
    const heartIndicator = useMemo(() => {
      const wasDeleted = isProductDeleted();

      // You can modify this to show a different icon/style for previously deleted products
      return (
        <BcImage
          alt="wishlist-heart"
          width={35}
          height={35}
          unoptimized={true}
          src={heartIcon}
          className={cn(
            classNames?.icon || 'h-[30px] w-[30px]',
            wasDeleted ? 'opacity-60' : '', // Optional: dim the icon if it was deleted
          )}
        />
      );
    }, [classNames?.icon, isProductDeleted]);

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
          {heartIndicator}
        </button>

        {uiState.isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="relative w-full max-w-[20em] bg-white px-[2.5em] py-[1.5em] pb-[3em] shadow-2xl md:max-w-[35em]">
              <button
                title='Close "Add to List" modal'
                onClick={handleClose}
                className="mb-[1em] mt-[1em] flex w-[100%] justify-center rounded-full p-1"
              >
                <X size={16} strokeWidth={3} />
              </button>

              {uiState.message && (
                <div
                  className={cn(
                    'mb-4 flex items-center px-4 py-2 text-sm font-medium shadow-sm',
                    uiState.message.type === 'success'
                      ? 'border-green-200 bg-green-50'
                      : 'border-red-200 bg-red-50 text-red-800',
                  )}
                >
                  {uiState.message.type === 'success' ? (
                    <div className="flex w-full items-center justify-center">
                      <div className="flex items-center">
                        <span className="mr-2 flex h-5 w-5 items-center justify-center rounded-full bg-[#145A2E] xl:h-5 xl:w-5">
                          <Check className="mb-1 mt-1 h-3 w-3 text-white" />
                        </span>
                        <span className="text-[12px] font-semibold xl:text-base">
                          {uiState.message.text}
                        </span>
                        <span className="ml-2 mr-2"> - </span>
                      </div>
                      <Link
                        href="/account/wishlists"
                        className="text-[12px] font-medium text-[#145A2E] underline xl:text-sm"
                      >
                        View
                      </Link>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <AlertCircle className="h-4 w-4 text-red-600" />
                      <span>{uiState.message.text}</span>
                    </div>
                  )}
                </div>
              )}

              <h2 className="mb-1 text-center text-xl font-[500] xl:text-left">
                {isProductDeleted() ? 'Restore to List' : 'Add to List'}
              </h2>

              <div className="flex flex-col">
                <div className="flex-1">
                  <div className="max-h-[250px] overflow-y-auto pr-2">
                    <div className="scrollbar-thin scrollbar-track-transparent scrollbar-thumb-gray-300">
                      {wishlistState.currentWishlists.map((wishlist) => {
                        if (!wishlist.items || !product) return null;

                        const isPendingAdd = wishlistState.tempAddedItems.some(
                          (item) =>
                            item.listId === wishlist.entityId &&
                            item.product.entityId === product.entityId,
                        );
                        const isItemLoading = uiState.loadingListId === wishlist.entityId;

                        return (
                          <div key={wishlist.entityId} className="wishlist-item">
                            <button
                              onClick={() => handleWishlistSelect(wishlist)}
                              disabled={isItemLoading || uiState.isAddToListLoading}
                              className={cn(
                                'group flex w-full items-center py-[0.8em] text-left transition-all hover:bg-green-100 hover:pl-4',
                                (isItemLoading || uiState.isAddToListLoading) && 'opacity-50',
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
                      {uiState.showCreateForm ? (
                        <span className="text-[16px] text-[#353535]">New List</span>
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

                  {uiState.showCreateForm && (
                    <form onSubmit={handleCreateSubmit} className="mt-[6px]">
                      <div className="pdp-wishlist-input space-y-3">
                        <Input
                          autoFocus
                          value={wishlistState.newListName}
                          name="name"
                          type="text"
                          required
                          error={!uiState.isInputValid}
                          onChange={handleInputValidation}
                          onInvalid={handleInputValidation}
                          className="w-full rounded-md border"
                          placeholder="Add a short description..."
                        />
                        {!uiState.isInputValid && !uiState.isDuplicate && (
                          <p className="text-xs text-[#A71F23]">{t('emptyName')}</p>
                        )}
                        {uiState.isDuplicate && (
                          <p className="text-xs text-[#A71F23]">
                            A list with this name already exists
                          </p>
                        )}
                      </div>
                    </form>
                  )}
                </div>

                <div className="m-auto mt-2 flex flex-col justify-center gap-2">
                  {uiState.showCreateForm && (
                    <Button
                      onClick={() =>
                        handleCreateSubmit({
                          preventDefault: () => {},
                        } as React.FormEvent<HTMLFormElement>)
                      }
                      disabled={
                        uiState.isCreating || !wishlistState.newListName || uiState.isDuplicate
                      }
                      className="!hover:bg-[#008BB7] mt-[1em] w-[11em] !bg-[#008BB7] px-[10px] py-[10px] !font-[400] text-white disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {uiState.isCreating ? (
                        <div className="flex items-center gap-2">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          CREATING...
                        </div>
                      ) : (
                        'CREATE AND ADD'
                      )}
                    </Button>
                  )}

                  {wishlistState.tempAddedItems.length > 0 && (
                    <Button
                      className={cn(
                        '!hover:bg-[#008BB7] m-auto !mt-[1em] w-[9em] !bg-[#008BB7] text-[14px] !font-[400] text-white',
                        'disabled:cursor-not-allowed disabled:opacity-50',
                      )}
                      onClick={handleSave}
                      disabled={uiState.isSaving}
                    >
                      {uiState.isSaving ? (
                        <div className="flex items-center gap-2">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          SAVING...
                        </div>
                      ) : isProductDeleted() ? (
                        'RESTORE'
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
  },
);

export default WishlistAddToList;
