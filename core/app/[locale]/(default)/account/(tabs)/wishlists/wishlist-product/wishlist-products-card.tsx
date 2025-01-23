'use client';

import React, { useEffect, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '~/components/ui/button';
import Link from 'next/link';
import { useFormatter } from 'next-intl';
import { Breadcrumbs as ComponentsBreadcrumbs } from '~/components/ui/breadcrumbs';
import { addToCart } from '~/components/product-card/add-to-cart/form/_actions/add-to-cart';
import toast from 'react-hot-toast';
import { Loader2 } from 'lucide-react';
import { GetVariantsByProductId } from '~/components/management-apis';

interface OptionValue {
  entityId: number;
  label: string;
  isDefault: boolean;
}

interface ProductOption {
  __typename: string;
  entityId: number;
  displayName: string;
  isRequired: boolean;
  isVariantOption: boolean;
  values: OptionValue[];
}

interface ProductVariant {
  entityId: number;
  sku: string;
  mpn: string;
  prices: {
    price: { value: number; currencyCode: string };
    basePrice: { value: number; currencyCode: string };
    salePrice: { value: number; currencyCode: string } | null;
  };
}

interface WishlistProduct {
  entityId: number;
  name: string;
  sku: string;
  mpn: string;
  path: string;
  availabilityV2: string;
  brand?: {
    name: string;
    path: string;
  };
  defaultImage: {
    url: string;
    altText: string;
  };
  prices: {
    price: { value: number; currencyCode: string };
    basePrice: { value: number; currencyCode: string };
    salePrice: { value: number; currencyCode: string } | null;
  };
  productOptions?: ProductOption[];
  variants: ProductVariant[];
}

interface WishlistItem {
  entityId: number;
  productEntityId: number;
  variantEntityId: number;
  product: WishlistProduct;
}

const ProductCard = ({ item }: { item: WishlistItem }) => {
  const format = useFormatter();
  const [isLoading, setIsLoading] = useState(false);
  const [variantDetails, setVariantDetails] = useState<{
    mpn: string;
    calculated_price: number;
    option_values: Array<{
      option_display_name: string;
      label: string;
    }>;
  } | null>(null);

  useEffect(() => {
    const fetchVariantDetails = async () => {
      try {
        const allVariantData = await GetVariantsByProductId(item.productEntityId);
        const variant = item.variantEntityId
          ? allVariantData.find((v: any) => v.id === item.variantEntityId)
          : allVariantData[0];

        if (variant) {
          setVariantDetails({
            mpn: variant.mpn,
            calculated_price: variant.calculated_price,
            option_values: variant.option_values,
          });
        }
      } catch (error) {
        console.error('Error fetching variant details:', error);
      }
    };

    fetchVariantDetails();
  }, [item]);

  return (
    <div className="relative flex h-full flex-col rounded border border-gray-300">
      <div className="relative aspect-square overflow-hidden">
        <Link href={item.product.path}>
          <img
            src={item.product.defaultImage.url.replace('{:size}', '500x500')}
            alt={item.product.defaultImage.altText || item.product.name}
            className="h-full w-full object-cover"
          />
        </Link>
      </div>

      <div className="flex flex-col p-4">
        {item.product.brand && (
          <p className="mb-2 text-sm text-gray-600">{item.product.brand.name}</p>
        )}

        <Link href={item.product.path}>
          <h3 className="font-medium text-black hover:text-gray-700">{item.product.name}</h3>
        </Link>

        {/* Display the specific variant details */}
        {variantDetails && (
          <div className="mt-2 space-y-2">
            <p className="text-sm">
              <span className="font-semibold">Sku: </span>
              <span>{variantDetails.mpn}</span>
            </p>

            <p className="text-sm">
              <span className="font-semibold">Price: </span>
              <span>
                {format.number(variantDetails.calculated_price, {
                  style: 'currency',
                  currency: 'USD',
                })}
              </span>
            </p>

            {variantDetails.option_values.map((option, index) => (
              <p key={index} className="text-sm">
                <span className="font-semibold">{option.option_display_name}: </span>
                <span>{option.label}</span>
              </p>
            ))}
          </div>
        )}

        <form
          onSubmit={(e) => {
            e.preventDefault();
            setIsLoading(true);
            const formData = new FormData(e.currentTarget);

            addToCart(formData)
              .then((result) => {
                if (result.error) {
                  toast.error('Failed to add item to cart');
                } else {
                  toast.success('Item added to cart');
                }
              })
              .catch((error) => {
                console.error('Error:', error);
                toast.error('Failed to add item to cart');
              })
              .finally(() => {
                setIsLoading(false);
              });
          }}
        >
          <input name="product_id" type="hidden" value={item.productEntityId} />
          <input name="variant_id" type="hidden" value={item.variantEntityId} />

          <div className="mt-4">
          {item.product.availabilityV2.status === 'Unavailable' ? (
              <div className="flex flex-col items-center">
                <Button
                  id="add-to-cart"
                  className="group relative flex h-[3.5em] w-full items-center justify-center overflow-hidden rounded-[4px] !bg-[#b1b9bc] text-center text-[14px] font-medium uppercase leading-[32px] tracking-[1.25px] text-black transition-all duration-300 hover:bg-[#03465c]/90 disabled:opacity-50"
                  disabled={item.product.availabilityV2.status === 'Unavailable'}
                  type="submit"
                >
                  <span>ADD TO CART</span>
                </Button>
                <p className="text-[12px] text-[#2e2e2e]">This product is currently unavailable</p>
              </div>
            ) : (
              <Button
                type="submit"
                className="h-[42px] w-full bg-[#03465C] font-medium tracking-wider text-white hover:bg-[#02374a]"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center justify-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>ADDING...</span>
                  </div>
                ) : (
                  'ADD TO CART'
                )}
              </Button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export function WishlistProductCard(): JSX.Element {
  const [wishlistData, setWishlistData] = useState<{
    entityId: number;
    name: string;
    items: WishlistItem[];
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const loadWishlist = async () => {
      try {
        const savedWishlist = localStorage.getItem('selectedWishlist');
        if (savedWishlist) {
          const parsedWishlist = JSON.parse(savedWishlist);
          console.log('Loaded Wishlist Data:', parsedWishlist);
          setWishlistData(parsedWishlist);
        } else {
          router.push('/account/wishlists');
        }
      } catch (error) {
        console.error('Error loading wishlist:', error);
        setError('Failed to load wishlist data');
      } finally {
        setIsLoading(false);
      }
    };

    loadWishlist();
  }, [router]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
      </div>
    );
  }

  if (error) {
    return <div className="flex items-center justify-center p-8 text-red-500">{error}</div>;
  }

  if (!wishlistData) {
    return <div></div>;
  }

  return (
    <div className="container mx-auto mb-12 px-4">
      <ComponentsBreadcrumbs
        className="login-div login-breadcrumb mx-auto mb-2 mt-2 hidden px-[1px] lg:block"
        breadcrumbs={[
          {
            label: 'Favorites and Lists',
            href: '/account/wishlists',
          },
          {
            label: wishlistData?.name || 'Loading...',
            href: '#',
          },
        ]}
      />

      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="mb-2 text-left text-xl font-medium leading-8 tracking-[0.15px] text-black">
            {wishlistData?.name}
          </h1>
          <p className="text-left text-base leading-8 tracking-[0.15px] text-black">
            {wishlistData?.items.length} {wishlistData?.items.length === 1 ? 'item' : 'items'}
          </p>
        </div>
        <Button
          variant="secondary"
          className="h-10 !w-auto bg-[#008BB7] px-6 text-[14px] font-medium uppercase tracking-wider text-white hover:bg-[#007a9e]"
        >
          SHARE FAVORITES
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 2xl:grid-cols-4">
        {wishlistData?.items.map((item) => <ProductCard key={item.entityId} item={item} />)}
      </div>
    </div>
  );
}

export default WishlistProductCard;
