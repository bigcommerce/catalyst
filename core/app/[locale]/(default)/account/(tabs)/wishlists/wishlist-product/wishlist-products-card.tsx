'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Hit } from '~/app/[locale]/(default)/(faceted)/_components/hit';
import { Hit as AlgoliaHit, HitAttributeHighlightResult } from 'instantsearch.js';
import { Button } from '~/components/ui/button';

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
  };
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
  _highlightResult?: {
    [key: string]: HitAttributeHighlightResult | HitAttributeHighlightResult[];
  };
}

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

  const variants = (item.product.variants || []).map((variant: ProductVariant, index: number) => ({
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
  }));

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
    objectID: item.entityId.toString(), // Convert to string as required by AlgoliaHit
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
    reviews_rating_sum: 0,
    reviews_count: item.product.reviewCount || 0,
    metafields: {
      Details: {
        ratings_certifications: [],
      },
    },
    variants,
    has_variants: true,
    sku: item.entityId.toString(),
    __position: 0,
    __queryID: '',
    _highlightResult: {
      name: {
        value: item.product.name,
        matchLevel: 'none' as const,
        matchedWords: [],
        fullyHighlighted: false,
      },
    },
  };
};

export function WishlistProductCard() {
  const [wishlistData, setWishlistData] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    const savedWishlist = localStorage.getItem('selectedWishlist');
    if (savedWishlist) {
      setWishlistData(JSON.parse(savedWishlist));
    } else {
      router.push('/account/wishlists');
    }
  }, [router]);

  if (!wishlistData) {
    return <div>Loading...</div>;
  }

  const items = 'items' in wishlistData ? wishlistData.items : [];

  return (
    <div className="container mx-auto mb-[50px] px-4">
      {/* <h1 className="mb-6 text-2xl font-bold">{wishlistData.name}</h1> */}
      <div className="flex justify-between">
        <div>
          <h1 className="mb-[4px] text-left text-[20px] font-medium leading-8 tracking-[0.15px] text-[#000000]">
            Your Favourites
          </h1>
          <p className="mb-[30px] text-left text-[16px] font-normal leading-8 tracking-[0.15px] text-[#000000]">
            {items.length} {items.length === 1 ? 'item' : 'items'}
          </p>
        </div>
        <div>
          <Button
            variant="secondary"
            className="bg-[#008BB7] px-2 text-left text-[14px] font-medium uppercase !leading-5 tracking-wider text-white"
          >
            SHARE FAVORITES
          </Button>
        </div>
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
          <ol className="ais-Hits-list grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {items.map((item: WishlistItem) => {
              const productData = transformToProductData(item);
              return (
                <li key={item.entityId} className="ais-Hits-item !radius-none !p-0 !shadow-none">
                  <Hit
                    hit={productData}
                    view="grid"
                    promotions={[]}
                    onCompareChange={(checked: boolean) => {}}
                    onColorSelect={(variant: ProductVariant) => {}}
                  />
                </li>
              );
            })}
          </ol>
        )}
      </div>
    </div>
  );
}
