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

interface RawWishlist {
  entityId: number;
  name: string;
  items: Array<{
    entityId: number;
    product: {
      entityId: number;
      reviewCount?: number;
      path: string;
      name: string;
      images: ProductImage[];
      brand?: ProductBrand;
      prices?: ProductPrices | null;
      rating?: number;
    };
  }>;
}

interface Wishlist {
  entityId: number;
  name: string;
  items: WishlistItem[];
}

interface WishlistAddToListProps {
  wishlists: RawWishlist[];
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
  const { setAccountState } = useAccountStatusContext();
  const t = useTranslations('Account.Wishlist');
  const router = useRouter();

  useEffect(() => {
    const mappedWishlists: Wishlist[] = wishlists.map((wishlist) => ({
      entityId: wishlist.entityId,
      name: wishlist.name,
      items: wishlist.items.map((item) => ({
        entityId: item.entityId,
        product: {
          entityId: item.product.entityId,
          name: item.product.name,
          path: item.product.path,
          images: item.product.images,
          reviewCount: item.product.reviewCount || 0,
          brand: item.product.brand,
          rating: item.product.rating,
          prices: item.product.prices,
        },
      })),
    }));

    setCurrentWishlists(mappedWishlists);
  }, [wishlists]);

  const handleHeartClick = () => {
    console.log('Selected product:', {
      id: product.entityId,
      name: product.name,
      variant: product.variantEntityId,
    });
    setIsOpen(true);
  };

  const handleInputValidation = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValidation(!e.target.validity.valueMissing);
    setNewListName(e.target.value);
  };

  const handleWishlistSelect = async (wishlist: Wishlist) => {
    try {
      setIsPending(true);

      const productExists = wishlist.items.some(
        (item) => item.product.entityId === product.entityId,
      );

      if (productExists) {
        toast.error('Product already exists in this list');
        return;
      }

      const result = await addToWishlist(
        wishlist.entityId,
        product.entityId,
        product.variantEntityId,
      );

      if (result.status === 'success' && result.data) {
        setCurrentWishlists((prevWishlists) =>
          prevWishlists.map((list) => {
            if (list.entityId === wishlist.entityId) {
              return {
                ...list,
                items: [
                  ...list.items,
                  {
                    entityId: Date.now(),
                    product: product,
                  },
                ],
              };
            }
            return list;
          }),
        );

        toast.success('Successfully added to your list');
        setIsOpen(false);
        router.refresh();
      } else {
        toast.error(result.message || 'Failed to add to list');
      }
    } catch (error) {
      console.error('Error adding product:', error);
      toast.error('Failed to add product to list');
    } finally {
      setIsPending(false);
    }
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

        // Add product to the newly created wishlist
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
              onClick={() => {
                setIsOpen(false);
                setShowCreateForm(false);
                setNewListName('');
              }}
              className="absolute right-4 top-4 rounded-full p-1 hover:bg-gray-100"
            >
              <X size={20} />
            </button>

            <h2 className="mb-6 text-xl font-semibold">Add to List</h2>

            <div className="space-y-4">
              <div
                className={
                  currentWishlists.length > 5
                    ? 'max-h-72 space-y-2 overflow-y-auto pr-2'
                    : 'space-y-2'
                }
              >
                {currentWishlists.map((wishlist) => (
                  <button
                    key={wishlist.entityId}
                    onClick={() => handleWishlistSelect(wishlist)}
                    disabled={isPending}
                    className={`group flex w-full items-center text-left ${
                      isPending ? 'cursor-not-allowed opacity-50' : ''
                    }`}
                  >
                    <span className="mr-2 text-xl text-[#0C89A6] group-hover:text-[#03465C]">
                      +
                    </span>
                    <span className="text-[#4B4B4B] group-hover:text-[#03465C]">
                      {wishlist.name}
                      <span className="ml-2 text-gray-500">({wishlist.items.length} items)</span>
                    </span>
                  </button>
                ))}

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

              <button
                onClick={() => setShowCreateForm(true)}
                className="group flex w-full items-center text-left"
              >
                <span className="mr-2 text-xl text-[#0C89A6] group-hover:text-[#03465C]">+</span>
                <span className="text-[#0C89A6] group-hover:text-[#03465C]">NEW LIST ...</span>
              </button>

              <div className="flex justify-center gap-2 pt-4">
                {showCreateForm && (
                  <Button
                    onClick={() =>
                      handleCreateSubmit({
                        preventDefault: () => {},
                      } as React.FormEvent<HTMLFormElement>)
                    }
                    disabled={isPending || !newListName}
                    className="w-32 bg-[#008BB7] text-white hover:bg-[#007da6]"
                  >
                    CREATE AND ADD
                  </Button>
                )}
                <Button
                  className="w-24 bg-[#008BB7] text-white hover:bg-[#007da6]"
                  onClick={() => setIsOpen(false)}
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
