'use client';

import { ShoppingCart } from 'lucide-react';
import { useLocale } from 'next-intl';
import { useEffect, useState } from 'react';
import { z } from 'zod';

import { Badge } from '~/components/ui/badge';

const CartQuantityResponseSchema = z.object({
  count: z.number(),
});

interface CartIconProps {
  count?: number;
}

export const CartIcon = ({ count }: CartIconProps) => {
  const [fetchedCount, setFetchedCount] = useState<number | null>();
  const computedCount = count ?? fetchedCount;
  const locale = useLocale();

  useEffect(() => {
    async function fetchCartQuantity() {
      const response = await fetch(`/api/cart-quantity/?locale=${locale}`);
      const parsedData = CartQuantityResponseSchema.parse(await response.json());

      setFetchedCount(parsedData.count);
    }

    // When a page is rendered statically via the 'force-static' route config option, cookies().get() always returns undefined,
    // which ultimately means that the `count` prop here will always be undefined on initial render, even if there actually is
    // a populated cart. Thus, we perform a client-side check in this case.
    if (count === undefined) {
      void fetchCartQuantity();
    }
  }, [count, locale]);

  if (!computedCount) {
    return <ShoppingCart aria-label="cart" />;
  }

  return (
    <>
      <span className="sr-only">Cart Items</span>
      <ShoppingCart aria-hidden="true" />
      <Badge>{computedCount}</Badge>
    </>
  );
};
