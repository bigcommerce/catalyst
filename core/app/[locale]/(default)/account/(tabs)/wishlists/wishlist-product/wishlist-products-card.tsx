'use client';

import React, { useState, useEffect } from 'react';
import { useAccountStatusContext } from '../../_components/account-status-provider';
import { Hit } from '~/belami/components/search';
import { Hit as AlgoliaHit } from 'instantsearch.js';

interface HitPrice {
  USD: number;
  CAD: number;
}

interface AlgoliaVariant {
  variant_id: string;
  options: {
    'Finish Color': string;
    [key: string]: any;
  };
  image_url: string;
  image: string;
  hex?: string;
  url: string;
  price: number;
  prices: HitPrice;
  sales_prices: HitPrice;
  retail_prices: HitPrice;
}

interface ProductHit {
  name: string;
  brand: string;
  brand_id: number;
  brand_name: string;
  category_ids: number[];
  image: string;
  image_url: string;
  url: string;
  product_images: any;
  price: number;
  prices: HitPrice;
  sales_prices: HitPrice;
  retail_prices: HitPrice;
  rating: number;
  on_sale: boolean;
  on_clearance: boolean;
  newPrice: number;
  description: string;
  objectID: number;
  metafields: {
    Details: {
      ratings_certifications: any[];
    };
  };
  variants: AlgoliaVariant[];
  has_variants: boolean;
  sku: string;
  __position: number;
  __queryID: string;
  _highlightResult?: {
    name: {
      value: string;
      matchLevel: string;
      matchedWords: string[];
    };
  };
}

interface ProductImage {
  url: string;
  altText: string;
  isDefault: boolean;
}

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
  onItemsCountChange?: (count: number) => void;
}

export function WishlistProductCard({
  initialWishlists,
  onCompare,
  onRemove,
  onColorSelect,
  onItemsCountChange,
}: WishlistProductCardProps) {
  const [wishlists] = useState<Wishlist[]>(initialWishlists);
  const { accountState } = useAccountStatusContext();

  const transformWishlistToProductData = (item: WishlistItem): AlgoliaHit<ProductHit> => {
    const defaultImage = item.product.images.find((img: ProductImage) => img.isDefault);
    const basePrice = item.product.prices?.price.value || 0;

    const getFormattedImageUrl = (url: string) => {
      return url.replace('{:size}', '386x513');
    };

    const priceObject: HitPrice = {
      USD: basePrice,
      CAD: basePrice,
    };

    // Ensure variants is always an array, even if empty
    const variants = (item.product.variants || []).map(
      (variant: ProductVariant, index: number) => ({
        variant_id: `${item.entityId}_${index}`,
        options: {
          'Finish Color': variant.name || 'Default', // Ensure name is not undefined
        },
        image_url: variant.imageUrl
          ? getFormattedImageUrl(variant.imageUrl)
          : defaultImage?.url
            ? getFormattedImageUrl(defaultImage.url)
            : '',
        image: variant.imageUrl
          ? getFormattedImageUrl(variant.imageUrl)
          : defaultImage?.url
            ? getFormattedImageUrl(defaultImage.url)
            : '',
        hex: variant.hex || '#000000', // Provide default hex color
        url: item.product.path || '#',
        price: basePrice,
        prices: priceObject,
        sales_prices: {
          USD: 0,
          CAD: 0,
        },
        retail_prices: {
          USD: basePrice,
          CAD: basePrice,
        },
      }),
    );

    // If no variants, create a default one
    if (variants.length === 0) {
      variants.push({
        variant_id: `${item.entityId}_default`,
        options: {
          'Finish Color': 'Default',
        },
        image_url: defaultImage?.url ? getFormattedImageUrl(defaultImage.url) : '',
        image: defaultImage?.url ? getFormattedImageUrl(defaultImage.url) : '',
        hex: '#000000',
        url: item.product.path || '#',
        price: basePrice,
        prices: priceObject,
        sales_prices: {
          USD: 0,
          CAD: 0,
        },
        retail_prices: {
          USD: basePrice,
          CAD: basePrice,
        },
      });
    }

    const transformedHit: AlgoliaHit<ProductHit> = {
      objectID: item.entityId,
      name: item.product.name,
      brand: item.product.brand?.name || '',
      brand_id: item.entityId,
      brand_name: item.product.brand?.name || '',
      category_ids: [],
      image: defaultImage?.url ? getFormattedImageUrl(defaultImage.url) : '',
      image_url: defaultImage?.url ? getFormattedImageUrl(defaultImage.url) : '',
      url: item.product.path || '#',
      product_images: item.product.images.map((img) => ({
        ...img,
        url: getFormattedImageUrl(img.url),
      })),
      price: basePrice,
      prices: priceObject,
      sales_prices: {
        USD: 0,
        CAD: 0,
      },
      retail_prices: {
        USD: basePrice,
        CAD: basePrice,
      },
      rating: item.product.rating || 0,
      on_sale: false,
      on_clearance: false,
      newPrice: 0,
      description: '',
      sku: item.entityId.toString(),
      metafields: {
        Details: {
          ratings_certifications: [],
        },
      },
      variants, // Use the modified variants array
      has_variants: true, // Always set to true since we ensure at least one variant
      __position: 0,
      __queryID: '',
      _highlightResult: {
        name: {
          value: item.product.name,
          matchLevel: 'none',
          matchedWords: [],
          fullyHighlighted: false,
          matchingWords: [],
        },
      },
    };

    return transformedHit;
  };

  const getAllItems = () => wishlists.flatMap((wishlist) => wishlist.items);
  const allItems = getAllItems();

  useEffect(() => {
    onItemsCountChange?.(allItems.length);
  }, [allItems.length, onItemsCountChange]);

  return (
    <div>
      {accountState?.status && (
        <div className={`alert ${accountState.status}`}>
          <p>{accountState.message}</p>
        </div>
      )}

      {allItems.length === 0 ? (
        <p className="py-8 text-center">No items in wishlist</p>
      ) : (
        <div className="ais-Hits product-card-plp mt-4">
          <ol className="ais-Hits-list grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
            {allItems.map((item) => {
              const productData = transformWishlistToProductData(item);

              return (
                <li key={item.entityId} className="ais-Hits-item !radius-none !p-0 !shadow-none">
                  <Hit
                    hit={productData}
                    view="grid"
                    promotions={[]}
                    onRemoveFromWishlist={() => onRemove?.(item.entityId)}
                    onCompareChange={(checked: boolean) => onCompare?.(item.entityId, checked)}
                    onColorSelect={(variant: ProductVariant) =>
                      onColorSelect?.(item.entityId, variant)
                    }
                  />
                </li>
              );
            })}
          </ol>
        </div>
      )}
    </div>
  );
}
