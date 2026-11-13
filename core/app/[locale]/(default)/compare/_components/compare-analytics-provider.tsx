'use client';

import { PropsWithChildren } from 'react';
import { z } from 'zod';

import { Streamable } from '@/vibes/soul/lib/streamable';
import { StreamableEventsProvider } from '~/components/analytics/events';
import { useAnalytics } from '~/lib/analytics/react';

interface AddToCartContext {
  id: number;
  name: string;
  brand: string;
  sku?: string;
  currency: string;
  price: number;
}

const AddToCartSchema = z.object({
  id: z.number({ coerce: true }),
  quantity: z.number({ coerce: true }).default(1),
});

export function CompareAnalyticsProvider({
  children,
  data,
}: PropsWithChildren<{ data: Streamable<AddToCartContext[]> }>) {
  const analytics = useAnalytics();

  const onAddToCart = (products: AddToCartContext[], payload?: FormData) => {
    const parsedPayload = AddToCartSchema.safeParse(Object.fromEntries(payload?.entries() ?? []));

    if (parsedPayload.success) {
      const { id: productId, quantity } = parsedPayload.data;
      const product = products.find(({ id }) => id === productId);

      if (product) {
        const { id, name, brand, sku, price, currency } = product;

        analytics?.cart.productAdded({
          currency,
          value: 1 * price,
          items: [
            {
              id: id.toString(),
              name,
              brand,
              sku,
              price,
              quantity,
            },
          ],
        });
      }
    }
  };

  return (
    <StreamableEventsProvider data={data} onAddToCart={onAddToCart}>
      {children}
    </StreamableEventsProvider>
  );
}
