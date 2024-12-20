// wishlist-product-card.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useFormatter, useTranslations } from 'next-intl';
import { BcImage } from '~/components/bc-image';
import { Link } from '~/components/link';
import { useAccountStatusContext } from '../../_components/account-status-provider';
import { Star, Heart } from 'lucide-react';

interface ProductVariant {
  name: string;
  hex: string;
  imageUrl?: string;
}

interface WishlistItem {
  entityId: number;
  product: {
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
        min: {
          value: number;
        };
        max: {
          value: number;
        };
      };
    } | null;
    rating?: number;
    reviewCount?: number;
    variants?: ProductVariant[];
  };
}

interface Wishlist {
  entityId: number;
  name: string;
  items: WishlistItem[];
}

interface WishlistProductCardProps {
  initialWishlists: Wishlist[];
  onCompare?: (productId: number, checked: boolean) => void;
  onRemove?: (productId: number) => void;
  onColorSelect?: (productId: number, variant: ProductVariant) => void;
  onItemsCountChange?: (count: number) => void; // New prop for count callback
}

export function WishlistProductCard({
  initialWishlists,
  onCompare,
  onRemove,
  onColorSelect,
  onItemsCountChange,
}: WishlistProductCardProps) {
  const [wishlists] = useState<Wishlist[]>(initialWishlists);
  const format = useFormatter();
  const t = useTranslations('Account.Wishlist');
  const { accountState } = useAccountStatusContext();

  const getAllItems = () => {
    return wishlists.flatMap((wishlist) => wishlist.items);
  };

  const allItems = getAllItems();
  const allItemsCount = allItems.length;

  // Notify parent component when count changes
  useEffect(() => {
    onItemsCountChange?.(allItemsCount);
  }, [allItemsCount, onItemsCountChange]);

  return (
    <div>
      {accountState && accountState.status && (
        <div className={`alert ${accountState.status}`}>
          <p>{accountState.message}</p>
        </div>
      )}

      {allItems.length === 0 ? (
        <p className="py-8 text-center">{t('noItems')}</p>
      ) : (
        <ul className="grid grid-cols-1 gap-[20px] md:grid-cols-2 lg:grid-cols-3">
          {allItems.map((item) => {
            const { entityId: productId, product } = item;
            const defaultImage = product.images.find(({ isDefault }) => isDefault);
            const showPriceRange =
              product.prices?.priceRange.min.value !== product.prices?.priceRange.max.value;

            return (
              <li className="relative border border-gray-300 p-4" key={productId}>
                <div className="absolute left-4 right-4 top-4 z-10 flex items-center justify-between">
                  <label className="flex cursor-pointer items-center space-x-2">
                    <input
                      type="checkbox"
                      className="h-4 w-4 rounded border-gray-300"
                      onChange={(e) => onCompare?.(productId, e.target.checked)}
                    />
                    <span className="text-sm text-gray-700">Compare</span>
                  </label>
                  <button
                    type="button"
                    className="text-gray-500 hover:text-gray-700"
                    aria-label="Remove from Wishlist"
                    onClick={() => onRemove?.(productId)}
                  >
                    <Heart className="h-5 w-5" />
                  </button>
                </div>

                <Link href={product.path} className="block">
                  <div className="relative flex h-[360px] w-full items-center justify-center">
                    {defaultImage ? (
                      <BcImage
                        alt={defaultImage.altText}
                        className="h-full w-full object-contain"
                        height={300}
                        src={defaultImage.url}
                        width={300}
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-gray-100 text-gray-500">
                        {t('noGalleryText')}
                      </div>
                    )}
                  </div>
                </Link>

                {product.variants && product.variants.length > 0 && (
                  <div className="mt-4 flex justify-center space-x-2">
                    {product.variants.slice(0, 5).map((variant) => (
                      <button
                        key={variant.name}
                        className="h-8 w-8 rounded-full border border-gray-300 hover:border-gray-400"
                        style={{
                          backgroundColor: variant.hex,
                          backgroundImage: variant.imageUrl ? `url(${variant.imageUrl})` : 'none',
                          backgroundSize: 'cover',
                          backgroundRepeat: 'no-repeat',
                        }}
                        title={variant.name}
                        onClick={() => onColorSelect?.(productId, variant)}
                      />
                    ))}
                    {product.variants.length > 5 && (
                      <span className="text-sm text-gray-600">+{product.variants.length - 5}</span>
                    )}
                  </div>
                )}

                <div className="mt-4 text-center">
                  {product.brand && (
                    <Link href={product.brand.path}>
                      <p className="text-gray-600">{product.brand.name}</p>
                    </Link>
                  )}

                  <Link href={product.path}>
                    <h4 className="mt-2 px-4 text-lg font-medium">{product.name}</h4>
                  </Link>

                  {(product.rating || product.rating === 0) && (
                    <div className="mt-2 flex items-center justify-center space-x-1">
                      <div className="flex space-x-0.5 text-yellow-500">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            size={16}
                            className={i < (product.rating || 0) ? 'fill-current' : ''}
                          />
                        ))}
                      </div>
                      {product.reviewCount !== undefined && (
                        <span className="text-sm text-gray-500">({product.reviewCount})</span>
                      )}
                    </div>
                  )}

                  {product.prices && (
                    <p className="mt-2 text-center">
                      {showPriceRange ? (
                        <>
                          {format.number(product.prices.priceRange.min.value, {
                            style: 'currency',
                            currency: product.prices.price.currencyCode,
                          })}{' '}
                          -{' '}
                          {format.number(product.prices.priceRange.max.value, {
                            style: 'currency',
                            currency: product.prices.price.currencyCode,
                          })}
                        </>
                      ) : (
                        product.prices.price.value && (
                          <>
                            {format.number(product.prices.price.value, {
                              style: 'currency',
                              currency: product.prices.price.currencyCode,
                            })}
                          </>
                        )
                      )}
                    </p>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
