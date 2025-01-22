'use client';

import React, { useEffect, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { AlertCircle, Check } from 'lucide-react';
import toast from 'react-hot-toast';
import { Button } from '~/components/ui/button';
import Link from 'next/link';
import { useFormatter, useTranslations } from 'next-intl';
import { InputPlusMinus } from '~/components/form-fields/input-plus-minus';
import { Breadcrumbs as ComponentsBreadcrumbs } from '~/components/ui/breadcrumbs';
import { addToCart } from '~/components/product-card/add-to-cart/form/_actions/add-to-cart';

interface WishlistItem {
  entityId: number;
  product: {
    sku: string;
    entityId: number;
    name: string;
    path: string;
    defaultImage: {
      altText: string;
      url: string;
    };
    brand?: {
      name: string;
      path: string;
    };
    prices?: {
      price: {
        value: number;
        currencyCode: string;
      };
    };
    variants: {
      edges: Array<{
        node: {
          entityId: number;
          sku: string;
        };
      }>;
    };
  };
}

function useCart() {
  const [items, setItems] = useState<number>(0);
  return {
    increment: (quantity: number) => setItems((prev) => prev + quantity),
    decrement: (quantity: number) => setItems((prev) => Math.max(0, prev - quantity)),
    setItems: (newItems: any[]) => setItems(newItems.length || 0),
    items,
  };
}

const ProductCard = ({ item }: { item: WishlistItem }) => {
  const format = useFormatter();
  const t = useTranslations('Cart');
  const cart = useCart();
  const [isLoading, setIsLoading] = useState(false);
  const [isPending, startTransition] = useTransition();

  const formattedPrice = item.product.prices?.price?.value
    ? format.number(item.product.prices.price.value, {
        style: 'currency',
        currency: 'USD',
      })
    : null;

  const getImageUrl = (url: string) => {
    if (!url) return '';
    return url.replace('{:size}', '500x500');
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);

    try {
      const formData = new FormData(event.currentTarget);
      const result = await addToCart(formData);

      if (result.error) {
        toast.error('Failed to add item to cart');
        return;
      }

      toast.success('Item added to cart');
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative flex h-full flex-col rounded border border-gray-300">
      <div className="relative aspect-square overflow-hidden">
        <Link href={item.product.path}>
          <img
            src={getImageUrl(item.product.defaultImage.url)}
            alt={item.product.defaultImage.altText || item.product.name}
            className="h-full w-full object-cover"
          />
        </Link>
      </div>

      <div className="flex flex-col gap-2 p-4">
        {item.product.brand && <p className="text-sm text-gray-600">{item.product.brand.name}</p>}

        <Link href={item.product.path}>
          <h3 className="font-medium text-black hover:text-gray-700">{item.product.name}</h3>
        </Link>

        {formattedPrice && <p className="text-lg font-bold">{formattedPrice}</p>}

        <form onSubmit={handleSubmit}>
          <input name="product_id" type="hidden" value={item.product.entityId} />
          <input
            name="variant_id"
            type="hidden"
            value={item.product.variants.edges[0]?.node?.entityId}
          />
          <div className="relative flex flex-col items-center justify-end gap-[10px] p-0 sm:flex-row sm:items-start">
            <InputPlusMinus
              product="false"
              isLoading={isLoading}
              setIsLoading={setIsLoading}
              productData=""
            />
            <Button
              id="add-to-cart"
              className="h-[42px] flex-shrink-[100] !rounded-[3px] bg-[#03465C] !px-[10px] !py-[5px] text-[14px] font-medium tracking-[1.25px]"
              loading={isPending}
              loadingText="processing"
              type="submit"
              disabled={isLoading}
            >
              ADD TO CART
            </Button>
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

  if (isLoading) {
    return <div className="flex items-center justify-center p-8">Loading...</div>;
  }

  if (!wishlistData) {
    return <div></div>;
  }

  return (
    <div className="container mx-auto mb-12 px-4">
      <ComponentsBreadcrumbs
        className="login-div login-breadcrumb mx-auto mb-2 mt-2 hidden px-[1px] lg:block"
        breadcrumbs={breadcrumbs}
      />

      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="mb-2 text-left text-xl font-medium leading-8 tracking-[0.15px] text-black">
            {wishlistData.name}
          </h1>
          <p className="text-left text-base leading-8 tracking-[0.15px] text-black">
            {wishlistData.items.length} {wishlistData.items.length === 1 ? 'item' : 'items'}
          </p>
        </div>
        <Button
          variant="secondary"
          className="h-10 !w-auto bg-[#008BB7] px-6 text-[14px] font-medium uppercase tracking-wider text-white hover:bg-[#007a9e]"
        >
          SHARE FAVORITES
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {wishlistData.items.map((item) => (
          <ProductCard key={item.entityId} item={item} />
        ))}
      </div>
    </div>
  );
}

export default WishlistProductCard;
