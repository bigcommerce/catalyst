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
  path: string;
  images: ProductImage[];
  brand?: ProductBrand;
  prices?: ProductPrices | null;
  rating?: number;
  reviewCount?: number;
  variantEntityId?: number;
  mpn: string;
  selectedOptionValue?: string; // Make sure it's optional
  productOptions?: {
    // Add this if needed for accessing options
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
  const [currentWishlists, setCurrentWishlists] = useState<Wishlist[]>(wishlists);
  const [tempAddedItems, setTempAddedItems] = useState<{ listId: number; product: Product }[]>([]);
  const [justAddedToList, setJustAddedToList] = useState<number | null>(null);
  const [loadingListId, setLoadingListId] = useState<number | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const t = useTranslations('Account.Wishlist');
  const router = useRouter();

  // Check authentication on component mount
  useEffect(() => {
    const verifyAuth = async () => {
      const authResult = await checkAuthStatus();
    };
    verifyAuth();
  }, []);

  useEffect(() => {
    if (message) {
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

  const handleWishlistSelect = async (wishlist: Wishlist) => {
    const authResult = await checkAuthStatus();

    if (!authResult.isAuthenticated) {
      console.log('Auth required for wishlist selection');
      if (onGuestClick) {
        onGuestClick();
      }
      return;
    }

    const isProductInList = wishlist.items?.some(
      (item) => item.product?.entityId === product?.entityId,
    );

    const isInTempList = tempAddedItems.some((item) => item.listId === wishlist.entityId);

    if (isProductInList || isInTempList) {
      setMessage({
        type: 'error',
        text: `This product already exists in "${wishlist.name}"`,
      });
      return;
    }

    setLoadingListId(wishlist.entityId);
    try {
      const selectedOption =
        product.productOptions?.edges
          ?.find((edge) => edge.node.__typename === 'MultipleChoiceOption')
          ?.node.values?.edges?.find((valueEdge) => valueEdge.node.isSelected)?.node.label ||
        undefined; // Convert null to undefined

      const productToAdd = {
        listId: wishlist.entityId,
        product: {
          entityId: product.entityId,
          name: product.name,
          path: product.path,
          images: product.images,
          brand: product.brand,
          prices: product.prices,
          variantEntityId: product.variantEntityId,
          mpn: product.mpn,
          selectedOptionValue: product.productOptions?.edges
            ?.find((edge) => edge.node.__typename === 'MultipleChoiceOption')
            ?.node.values?.edges?.find((valueEdge) => valueEdge.node.isSelected)?.node.label,
        },
      };

      setTempAddedItems((prev) => [...prev, productToAdd]);
      setJustAddedToList(wishlist.entityId);

      setCurrentWishlists((prev) =>
        prev.map((w) => {
          if (w.entityId === wishlist.entityId) {
            return {
              ...w,
              items: w.items
                ? [...w.items, { entityId: Date.now(), product: productToAdd.product }]
                : [{ entityId: Date.now(), product: productToAdd.product }],
            };
          }
          return w;
        }),
      );

      setMessage({
        type: 'success',
        text: 'Item added to list. Click SAVE to confirm.',
      });
    } catch (error) {
      setMessage({
        type: 'error',
        text: 'Failed to add item to list',
      });
    } finally {
      setLoadingListId(null);
    }
  };

  const handleSave = async () => {
    const authResult = await checkAuthStatus();

    if (!authResult.isAuthenticated) {
      console.log('Auth required for saving changes');
      if (onGuestClick) {
        onGuestClick();
      }
      return;
    }

    if (tempAddedItems.length === 0) {
      setMessage({ type: 'error', text: 'Please add items to save' });
      return;
    }

    setIsSaving(true);
    try {
      for (const item of tempAddedItems) {
        const result = await addToWishlist(
          item.listId,
          item.product.entityId,
          item.product.variantEntityId,
        );

        if (result.status !== 'success') {
          throw new Error(result.message || 'Failed to add item to list');
        }
      }

      setMessage({ type: 'success', text: 'All items saved successfully' });

      setTimeout(() => {
        router.refresh();
        setIsOpen(false);
        setTempAddedItems([]);
        setJustAddedToList(null);
      }, 1500);
    } catch (error) {
      console.error('Error saving items:', error);
      setMessage({ type: 'error', text: 'Failed to save items. Please try again.' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleCreateSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const authResult = await checkAuthStatus();

    if (!authResult.isAuthenticated) {
      console.log('Auth required for creating wishlist');
      if (onGuestClick) {
        onGuestClick();
      }
      return;
    }

    const trimmedName = newListName.trim();

    if (!trimmedName) {
      setInputValidation(false);
      setMessage({ type: 'error', text: 'Please enter a list name' });
      return;
    }

    if (isDuplicate) {
      setMessage({ type: 'error', text: 'A list with this name already exists' });
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

        setCurrentWishlists((prev) => [...prev, newWishlist]);
        setNewListName('');
        setShowCreateForm(false);
        setIsDuplicate(false);
        setMessage({ type: 'success', text: 'New list created successfully' });
        await handleWishlistSelect(newWishlist);
      } else {
        setMessage({ type: 'error', text: result.message || 'Failed to create new list' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to create new list' });
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="relative">
      {/* Heart Button */}
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

      {/* Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="relative w-full max-w-[35em] rounded-lg bg-white px-[2.5em] py-[1.5em] pb-[3em] shadow-2xl">
            {/* Close Button */}
            <button
              onClick={handleClose}
              className="mb-[1em] mt-[1em] flex w-[100%] justify-center rounded-full p-1"
            >
              <X size={16} strokeWidth={3} />
            </button>

            {/* Message Display */}
            {message && (
              <div
                className={cn(
                  'mb-4 flex items-center gap-2 rounded-md border px-4 py-3 text-sm font-medium shadow-sm',
                  message.type === 'success'
                    ? 'border-green-200 bg-green-50 text-green-800'
                    : 'border-red-200 bg-red-50 text-red-800',
                )}
              >
                {message.type === 'success' ? (
                  <Check className="h-4 w-4 text-green-600" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-red-600" />
                )}
                <span className="flex-1">{message.text}</span>
              </div>
            )}

            <h2 className="mb-1 text-xl font-[500]">Add to List</h2>

            {/* Wishlists Section */}

            {/* Wishlists Section */}
            <div className="flex flex-col">
              <div className="flex-1">
                <div className="max-h-[250px] overflow-y-auto pr-2">
                  <div className="scrollbar-thin scrollbar-track-transparent scrollbar-thumb-gray-300">
                    {currentWishlists.map((wishlist) => {
                      // Skip if no items or product
                      if (!wishlist.items || !product) return null;

                      // Check if product is already in list
                      const isProductInList =
                        wishlist.items.some(
                          (item) => item.product?.entityId === product?.entityId,
                        ) || tempAddedItems.some((item) => item.listId === wishlist.entityId);

                      const isLoading = loadingListId === wishlist.entityId;
                      const isAdded = justAddedToList === wishlist.entityId;

                      return (
                        <div className="wishlist-item">
                          <button
                            key={wishlist.entityId}
                            onClick={() => {
                              if (isProductInList) {
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
                              // Base styles
                              'group flex w-full items-center py-[0.5em] text-left transition-all hover:bg-green-100 hover:pl-4',
                              // Conditional background
                              isProductInList ? 'cursor-not-allowed' : '',
                              // Loading state
                              (isPending || isLoading) && 'opacity-50',
                            )}
                          >
                            {/* Plus Icon or Checkmark */}
                            {isAdded ? (
                              <span className="mr-2 flex h-5 w-5 items-center justify-center rounded-full bg-green-600">
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
                                ({wishlist.items.length} items)
                              </span>
                            </span>

                            {/* Loading/Added Icons */}
                            {isLoading ? (
                              <Loader2 className="ml-auto h-4 w-4 animate-spin" />
                            ) : isAdded ? (
                              <Check className="ml-auto h-4 w-4 text-green-500" />
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
