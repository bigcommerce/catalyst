'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Hit as AlgoliaHit, HitHighlightResult } from 'instantsearch.js';
import { Button } from '~/components/ui/button';
import { Breadcrumbs as ComponentsBreadcrumbs } from '~/components/ui/breadcrumbs';
import { Hit } from '~/belami/components/search/hit';
import { AddToCart } from '~/app/[locale]/(default)/compare/_components/add-to-cart';

interface HitPrice {
  USD: number;
  CAD: number;
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
  variant_id?: string;
}

type AvailabilityStatus = 'Available' | 'Preorder' | 'Unavailable';

interface WishlistItem {
  entityId: number;
  product: {
    reviewCount: number;
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
        min: { value: number };
        max: { value: number };
      };
    } | null;
    rating?: number;
    variants?: ProductVariant[];
    availabilityV2?: {
      status: AvailabilityStatus;
    };
    inventory?: {
      isInStock: boolean;
    };
  };
}

interface WishlistData {
  entityId: number;
  name: string;
  items: WishlistItem[];
}

interface ProductHit {
  objectID: string;
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
  reviews_rating_sum: number;
  reviews_count: number;
  metafields: {
    Details: {
      ratings_certifications: any[];
    };
  };
  variants: any[];
  has_variants: boolean;
  sku?: string;
  __position: number;
  __queryID: string;
  _highlightResult?: HitHighlightResult;
}

export function WishlistProductCard() {
  const [wishlistData, setWishlistData] = useState<WishlistData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const loadWishlist = async () => {
      try {
        const savedWishlist = localStorage.getItem('selectedWishlist');
        if (savedWishlist) {
          setWishlistData(JSON.parse(savedWishlist));
        } else {
          router.push('/account/wishlists');
        }
      } catch (error) {
        console.error('Error loading wishlist:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadWishlist();
  }, [router]);

  const transformToProductData = (item: WishlistItem): AlgoliaHit<ProductHit> => {
    const defaultImage = item.product.images.find((img: ProductImage) => img.isDefault);
    const basePrice = item.product.prices?.price.value || 0;

    const getFormattedImageUrl = (url: string) => {
      return url.replace('{:size}', '386x513');
    };

    const priceObject: HitPrice = {
      USD: basePrice,
      CAD: basePrice,
    };

    const variants = (item.product.variants || []).map(
      (variant: ProductVariant, index: number) => ({
        variant_id: `${item.entityId}_${index}`,
        options: {
          'Finish Color': variant.name || 'Default',
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
        hex: variant.hex || '#000000',
        url: item.product.path || '#',
        price: basePrice,
        prices: priceObject,
        sales_prices: { USD: 0, CAD: 0 },
        retail_prices: priceObject,
      }),
    );

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
        sales_prices: { USD: 0, CAD: 0 },
        retail_prices: priceObject,
      });
    }

    return {
      objectID: item.entityId.toString(),
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
      sales_prices: { USD: 0, CAD: 0 },
      retail_prices: priceObject,
      rating: item.product.rating || 0,
      on_sale: false,
      on_clearance: false,
      newPrice: 0,
      description: '',
      reviews_rating_sum: item.product.rating || 0,
      reviews_count: item.product.reviewCount || 0,
      metafields: {
        Details: {
          ratings_certifications: [],
        },
      },
      variants,
      has_variants: variants.length > 0,
      sku: item.entityId.toString(),
      __position: 0,
      __queryID: '',
      _highlightResult: {
        name: {
          value: item.product.name,
          matchLevel: 'none',
          matchedWords: [],
          fullyHighlighted: false,
        },
      } as HitHighlightResult,
    };
  };

  const breadcrumbs = [
    {
      label: 'Favorites and Lists',
      href: '/account/wishlists',
    },
    {
      label: wishlistData?.name || 'Loading...',
      href: '#',
    },
  ];

  const WishlistItem = ({
    item,
    productData,
  }: {
    item: WishlistItem;
    productData: AlgoliaHit<ProductHit>;
  }) => {
    return (
      <div className="relative flex h-full flex-col">
        <div className="product-form mb-[1.4em] flex-grow">
          <Hit
            hit={productData}
            view="grid"
            promotions={[]}
            useDefaultPrices={true}
            classname="wishlist-product-card"
          />
          <button type="submit" className="hidden" id={`add-to-cart-${item.entityId}`}>
            Submit
          </button>
        </div>
        <div className="mt-auto">
          <AddToCart
            data={{
              entityId: item.entityId,
              availabilityV2: {
                status: (item.product.availabilityV2?.status || 'Available') as AvailabilityStatus,
              },
              inventory: {
                isInStock: item.product.inventory?.isInStock ?? true,
              },
            }}
          />
        </div>
      </div>
    );
  };

  if (isLoading) {
    return <div className="flex items-center justify-center p-8">Loading...</div>;
  }

  if (!wishlistData) {
    return null;
  }

  const items = wishlistData.items || [];

  return (
    <div className="container mx-auto mb-12 px-4">
      <ComponentsBreadcrumbs
        className="login-div login-breadcrumb mx-auto mb-2 mt-2 hidden px-[1px] lg:block"
        breadcrumbs={breadcrumbs}
      />

      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="mb-2 text-left text-xl font-medium leading-8 tracking-[0.15px] text-black">
            {wishlistData?.name}
          </h1>
          <p className="text-left text-base leading-8 tracking-[0.15px] text-black">
            {items.length} {items.length === 1 ? 'item' : 'items'}
          </p>
        </div>
        <Button
          variant="secondary"
          className="h-10 !w-auto bg-[#008BB7] px-6 text-[14px] font-medium uppercase tracking-wider text-white hover:bg-[#007a9e]"
        >
          SHARE FAVORITES
        </Button>
      </div>

      <div className="ais-Hits product-card-plp">
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8">
            <p className="mb-4 text-lg text-gray-500">No items in this wishlist</p>
            <button
              onClick={() => router.push('/account/wishlists')}
              className="text-blue-600 underline hover:text-blue-800"
            >
              Return to Wishlists
            </button>
          </div>
        ) : (
          <ol className="ais-Hits-list grid grid-cols-1 gap-8 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {items.map((item) => (
              <li key={item.entityId} className="ais-Hits-item !radius-none !p-0 !shadow-none">
                <WishlistItem item={item} productData={transformToProductData(item)} />
              </li>
            ))}
          </ol>
        )}
      </div>
    </div>
  );
}
