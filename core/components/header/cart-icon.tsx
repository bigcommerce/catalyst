'use client';

import { useLocale } from 'next-intl';
import { useEffect } from 'react';
import { z } from 'zod';

import { Badge } from '~/components/ui/badge';
import { useCart } from './cart-provider';

const CartQuantityResponseSchema = z.object({
  count: z.number(),
});

interface CartIconProps {
  count?: number;
}

export const CartIcon = ({ count: serverCount }: CartIconProps) => {
  const { count, setCount } = useCart();
  const locale = useLocale();

  useEffect(() => {
    async function fetchCartQuantity() {
      const response = await fetch(`/api/cart-quantity/?locale=${locale}`);
      const parsedData = CartQuantityResponseSchema.parse(await response.json());

      setCount(parsedData.count);
    }

    if (serverCount !== undefined) {
      setCount(serverCount);
    } else {
      void fetchCartQuantity();
    }
  }, [serverCount, locale, setCount]);

  const cartIconBase64 =
    'data:image/svg+xml; charset=utf-8;utf8;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgaWQ9IkNhcnQiPgogIDxwYXRoIGQ9Ik04LjUsMTlBMS41LDEuNSwwLDEsMCwxMCwyMC41LDEuNSwxLjUsMCwwLDAsOC41LDE5Wk0xOSwxNkg3YTEsMSwwLDAsMSwwLTJoOC40OTEyMUEzLjAxMzIsMy4wMTMyLDAsMCwwLDE4LjM3NiwxMS44MjQyMkwxOS45NjE0Myw2LjI3NDlBMS4wMDAwOSwxLjAwMDA5LDAsMCwwLDE5LDVINi43MzkwN0EzLjAwNjY2LDMuMDA2NjYsMCwwLDAsMy45MjEzOSwzSDNBMSwxLDAsMCwwLDMsNWguOTIxMzlhMS4wMDQ1OSwxLjAwNDU5LDAsMCwxLC45NjE0Mi43MjUxbC4xNTU1Mi41NDQ3NC4wMDAyNC4wMDUwNkw2LjY3OTIsMTIuMDE3MDlBMy4wMDAwNiwzLjAwMDA2LDAsMCwwLDcsMThIMTlhMSwxLDAsMCwwLDAtMlpNMTcuNjc0MzIsN2wtMS4yMjEyLDQuMjc0NDFBMS4wMDQ1OCwxLjAwNDU4LDAsMCwxLDE1LjQ5MTIxLDEySDguNzU0MzlsLS4yNTQ5NC0uODkyMjFMNy4zMjY0Miw3Wk0xNi41LDE5QTEuNSwxLjUsMCwxLDAsMTgsMjAuNSwxLjUsMS41LDAsMCwwLDE2LjUsMTlaIiBmaWxsPSIjMDA2MzgwIiBjbGFzcz0iY29sb3IwMDAwMDAgc3ZnU2hhcGUiPjwvcGF0aD4KPC9zdmc+Cg==';

  if (!count) {
    return (
      <div className='flex items-center'>
        <img
        className='header-cart-icon mr-0 relative left-[0.4em]'
        src={cartIconBase64}
        alt="Cart"
        style={{ width: '24px', height: '24px' }}
        aria-label="cart"
      />
        <Badge className="text-[#008bb7] pl-2 text-[15px] header-cart-count">{count}</Badge>
      </div>
    );
  }

  return (
    <>
      <span className="sr-only">Cart Items</span>
      <img
        className='header-cart-icon mr-0 relative left-[0.4em] top-[0.2em]'
        src={cartIconBase64}
        alt="Cart"
        style={{ width: '24px', height: '24px' }}
        aria-hidden="true"
      />
    <Badge className="text-[#008bb7] pl-2 text-[15px] header-cart-count">{count}</Badge>
    </>
  );
};