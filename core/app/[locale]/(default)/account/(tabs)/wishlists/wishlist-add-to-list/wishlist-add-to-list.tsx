'use client';

import React, { useState, useEffect } from 'react';
import { Heart, X, Check } from 'lucide-react';
import { Button } from '~/components/ui/button';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { Input } from '~/components/ui/form';
import { toast } from 'react-hot-toast';
import { useAccountStatusContext } from '../../_components/account-status-provider';
import {
  addToWishlist,
  createWishlist,
} from '../_components/create-wishlist-form/_actions/create-wishlist';

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
}

const WishlistAddToList: React.FC<WishlistAddToListProps> = ({
  wishlists = [],
  hasPreviousPage = false,
  product,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newListName, setNewListName] = useState('');
  const [isInputValid, setInputValidation] = useState(true);
  const [isPending, setIsPending] = useState(false);
  const [currentWishlists, setCurrentWishlists] = useState<Wishlist[]>([]);
  const [tempAddedItems, setTempAddedItems] = useState<{ listId: number; product: Product }[]>([]);
  const [justAddedToList, setJustAddedToList] = useState<number | null>(null);
  const { setAccountState } = useAccountStatusContext();
  const t = useTranslations('Account.Wishlist');
  const router = useRouter();

  useEffect(() => {
    setCurrentWishlists(wishlists);
  }, [wishlists]);

  const toggleCreateForm = () => {
    setShowCreateForm(!showCreateForm);
    if (showCreateForm) {
      setNewListName(''); // Clear input when closing
      setInputValidation(true); // Reset validation
    }
  };

  const handleHeartClick = () => {
    setIsOpen(true);
    setTempAddedItems([]);
    setJustAddedToList(null);
  };

  const handleInputValidation = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValidation(!e.target.validity.valueMissing);
    setNewListName(e.target.value);
  };

  const handleWishlistSelect = async (wishlist: Wishlist) => {
    const isProductInList =
      wishlist.items.some((item) => item.product?.entityId === product?.entityId) ||
      tempAddedItems.some((item) => item.listId === wishlist.entityId);

    if (isProductInList) {
      toast.error('Product already exists in this list');
      return;
    }

    setTempAddedItems((prev) => [...prev, { listId: wishlist.entityId, product }]);
    setJustAddedToList(wishlist.entityId);
  };

  const handleSave = async () => {
    setIsPending(true);
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

      toast.success('Successfully saved all items to lists');
      router.refresh();
      setIsOpen(false);
    } catch (error) {
      console.error('Error saving items:', error);
      toast.error('Failed to save some items');
    } finally {
      setIsPending(false);
      setTempAddedItems([]);
      setJustAddedToList(null);
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    setShowCreateForm(false);
    setNewListName('');
    setTempAddedItems([]);
    setJustAddedToList(null);
  };

  const handleCreateSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!newListName) return;
    setIsPending(true);

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
      formData.append('name', `${newListName} - ${dateTime}`);

      const result = await createWishlist(formData);

      if (result.status === 'success') {
        const newWishlist: Wishlist = {
          entityId: result.data.entityId,
          name: `${newListName} - ${dateTime}`,
          items: [],
        };

        setCurrentWishlists((prev) => [...prev, newWishlist]);
        setNewListName('');
        setShowCreateForm(false);
        await handleWishlistSelect(newWishlist);
      } else {
        toast.error(result.message || 'Failed to create new list');
      }
    } catch (error) {
      console.error('Error creating list:', error);
      toast.error('Failed to create new list');
    }
    setIsPending(false);
  };

  return (
    <div className="relative">
      <button
        onClick={handleHeartClick}
        className="inline-flex items-center justify-center rounded-[3px] bg-[#008BB7] px-4 py-2 text-sm font-medium text-white hover:bg-[#007da6] focus:outline-none"
      >
        <Heart className="h-6 w-6" />
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="relative w-full max-w-md rounded-lg bg-white p-6">
            <button
              onClick={handleClose}
              className="absolute right-4 top-4 rounded-full p-1 hover:bg-gray-100"
            >
              <X size={20} />
            </button>

            <h2 className="mb-6 text-xl font-semibold">Add to List</h2>

            <div className="flex h-[415px] flex-col">
              <div className="flex-1 overflow-hidden">
                <div className="h-full overflow-y-auto pr-2">
                  {currentWishlists.map((wishlist) => {
                    if (!wishlist.items || !product) return null; // Guard against undefined items and product

                    const isProductInList =
                      wishlist.items.some((item) => item.product?.entityId === product?.entityId) ||
                      tempAddedItems.some((item) => item.listId === wishlist.entityId);

                    return (
                      <button
                        key={wishlist.entityId}
                        onClick={() => handleWishlistSelect(wishlist)}
                        disabled={isPending || isProductInList}
                        className={`group flex w-full items-center text-left last:mt-[5px] ${
                          isPending ? 'cursor-not-allowed opacity-50' : ''
                        }`}
                      >
                        <span className="ml-[2px] mr-2 text-[28px] font-[500] text-[#0C89A6] group-hover:text-[#03465C]">
                          {justAddedToList === wishlist.entityId ? (
                            <div className="flex h-5 w-5 items-center justify-center rounded-full bg-[#4CAF50]">
                              <Check className="h-3 w-3 text-white" />
                            </div>
                          ) : (
                            '+'
                          )}
                        </span>
                        <span className="text-[#4B4B4B] group-hover:text-[#03465C]">
                          {wishlist.name}
                          <span className="ml-2 text-gray-500">
                            (
                            {wishlist.items.length +
                              tempAddedItems.filter((item) => item.listId === wishlist.entityId)
                                .length}{' '}
                            items)
                          </span>
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="mt-4 bg-white">
                <button
                  onClick={toggleCreateForm}
                  className="group mb-2 flex w-full items-center text-left"
                >
                  <span className="ml-[2px] mr-2 text-[28px] font-[500] text-[#0C89A6] group-hover:text-[#03465C]">
                    {showCreateForm ? (
                      <span className="text-[#0C89A6] group-hover:text-[#03465C]">NEW LIST</span>
                    ) : (
                      <span className="text-[#0C89A6] group-hover:text-[#03465C]">
                        {' '}
                        + NEW LIST ...
                      </span>
                    )}
                  </span>
                </button>

                {showCreateForm && (
                  <form onSubmit={handleCreateSubmit} className="mt-4">
                    <div className="space-y-3">
                      <Input
                        autoFocus
                        value={newListName}
                        name="name"
                        type="text"
                        required
                        error={!isInputValid}
                        onChange={handleInputValidation}
                        onInvalid={handleInputValidation}
                        className="w-full rounded-md"
                        placeholder="Add a short description..."
                      />
                      {!isInputValid && <p className="text-xs text-red-500">{t('emptyName')}</p>}
                    </div>
                  </form>
                )}
              </div>

              <div className="mt-4 flex justify-center gap-2">
                {showCreateForm && (
                  <Button
                    onClick={() =>
                      handleCreateSubmit({
                        preventDefault: () => {},
                      } as React.FormEvent<HTMLFormElement>)
                    }
                    disabled={isPending || !newListName}
                    className="!hover:bg-[#008BB7] w-32 !bg-[#008BB7] text-white"
                  >
                    CREATE AND ADD
                  </Button>
                )}
                <Button
                  className="!hover:bg-[#008BB7] w-[9em] !bg-[#008BB7] text-[14px] !font-[400] text-white"
                  onClick={handleSave}
                  disabled={isPending || tempAddedItems.length === 0}
                >
                  SAVE
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
