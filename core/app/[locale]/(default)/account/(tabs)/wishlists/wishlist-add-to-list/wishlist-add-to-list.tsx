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
import { BcImage } from '~/components/bc-image';
import heartIcon from '~/public/wishlistIcons/heartIcon.svg';

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
          <div className="relative w-full max-w-[35em] rounded-lg bg-white px-[2.5em] py-[1.5em] pb-[3em] shadow-2xl">
            <button
              onClick={handleClose}
              className="mb-[1em] mt-[1em] flex w-[100%] justify-center rounded-full p-1"
            >
              <X size={16} strokeWidth={3} />
            </button>

            <h2 className="mb-1 text-xl font-[500]">Add to List</h2>
            <div className="flex flex-col">
              <div className="flex-1">
                <div className="max-h-[250px] overflow-y-auto pr-2">
                  <div className="scrollbar-thin scrollbar-track-transparent scrollbar-thumb-gray-300">
                    {currentWishlists.map((wishlist) => {
                      if (!wishlist.items || !product) return null;

                      const isProductInList =
                        wishlist.items.some(
                          (item) => item.product?.entityId === product?.entityId,
                        ) || tempAddedItems.some((item) => item.listId === wishlist.entityId);

                      return (
                        <button
                          key={wishlist.entityId}
                          onClick={() => handleWishlistSelect(wishlist)}
                          disabled={isPending || isProductInList}
                          className={`group flex w-full items-center py-[0.5em] text-left hover:bg-gray-50 ${
                            isPending ? 'cursor-not-allowed opacity-50' : ''
                          }`}
                        >
                          {/* Fixed width container for icons to maintain consistent spacing */}
                          <div className="flex h-[30px] w-[30px] items-center justify-center">
                            {justAddedToList === wishlist.entityId ? (
                              <div className="flex h-[30px] w-[30px] items-center justify-center">
                                <div className="flex h-5 w-5 items-center justify-center rounded-full bg-[#4CAF50]">
                                  <Check className="h-3 w-3 text-white" />
                                </div>
                              </div>
                            ) : (
                              <span className="text-[30px] leading-none text-[#A9A9A9]">+</span>
                            )}
                          </div>
                          <span className="text-[#4B4B4B]">
                            {wishlist.name}
                            <span className="ml-2 text-[#4B4B4B]">
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
                        {' '}
                        <span className="text-[30px]"> + </span>
                        <span className="relative bottom-[4px] text-[16px] font-bold">
                          {' '}
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
                        className="!focus:[unset] w-full rounded-md hover:border-[#E5E7EB]"
                        placeholder="Add a short description..."
                      />
                      {!isInputValid && <p className="text-xs text-red-500">{t('emptyName')}</p>}
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
                    disabled={isPending || !newListName}
                    className="!hover:bg-[#008BB7] mt-[1em] w-[11em] !bg-[#008BB7] px-[10px] py-[10px] !font-[400] text-white"
                  >
                    CREATE AND ADD
                  </Button>
                )}
                <Button
                  className="!hover:bg-[#008BB7] m-auto !mt-[1em] w-[9em] !bg-[#008BB7] text-[14px] !font-[400] text-white"
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
