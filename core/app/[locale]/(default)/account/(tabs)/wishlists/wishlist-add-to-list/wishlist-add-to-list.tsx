'use client';

import React, { useState, ChangeEvent, useEffect } from 'react';
import { Heart, X } from 'lucide-react';
import { Button } from '~/components/ui/button';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { Input } from '~/components/ui/form';
import { useAccountStatusContext } from '../../_components/account-status-provider';
import { createWishlist } from '../_components/create-wishlist-form/_actions/create-wishlist';

interface WishlistItem {
  entityId: number;
  product: {
    reviewCount: number;
    path: string;
    name: string;
    images: Array<{
      url: string;
      altText: string;
      isDefault: boolean;
    }>;
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
  };
}

interface Wishlist {
  entityId: number;
  name: string;
  items: WishlistItem[];
}

interface WishlistAddToListProps {
  wishlists: Wishlist[];
  hasPreviousPage: boolean;
}

const WishlistAddToList: React.FC<WishlistAddToListProps> = ({
  wishlists = [],
  hasPreviousPage = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newListName, setNewListName] = useState('');
  const [isInputValid, setInputValidation] = useState(true);
  const [isPending, setIsPending] = useState(false);
  const [currentWishlists, setCurrentWishlists] = useState<Wishlist[]>(wishlists);
  const { setAccountState } = useAccountStatusContext();
  const t = useTranslations('Account.Wishlist');
  const router = useRouter();

  useEffect(() => {
    if (wishlists.length > currentWishlists.length) {
      setCurrentWishlists(wishlists);
    }
  }, [wishlists]);

  const handleInputValidation = (e: ChangeEvent<HTMLInputElement>) => {
    setInputValidation(!e.target.validity.valueMissing);
    setNewListName(e.target.value);
  };

  const handleCreateSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!newListName) return;
    setIsPending(true);

    try {
      const formData = new FormData();
      formData.append('name', newListName);
      const result = await createWishlist(formData);

      if (result.status === 'success' && result.data) {
        setCurrentWishlists((prev) => [
          ...prev,
          {
            entityId: result.data.entityId,
            name: result.data.name,
            items: [],
          },
        ]);
        setNewListName('');
        setShowCreateForm(false);
        setAccountState({
          status: 'success',
          message: t('messages.created', { name: result.data.name }),
        });
        router.refresh();
      }
    } catch (error) {
      setAccountState({
        status: 'error',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
    setIsPending(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(true)}
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
                    className="group flex w-full items-center text-left"
                  >
                    <span className="mr-2 text-xl text-[#0C89A6] group-hover:text-[#03465C]">
                      +
                    </span>
                    <span className="text-[#4B4B4B] group-hover:text-[#03465C]">
                      {wishlist.name}
                      {wishlist.items?.length > 0 && (
                        <span className="ml-2 text-gray-500">{wishlist.items.length} items</span>
                      )}
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
                    onClick={handleCreateSubmit}
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
