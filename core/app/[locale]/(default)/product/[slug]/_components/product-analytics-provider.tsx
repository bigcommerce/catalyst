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
  quantity: z.number({ coerce: true }).default(1),
});

export function ProductAnalyticsProvider({
  children,
  data,
}: PropsWithChildren<{ data: Streamable<AddToCartContext> }>) {
  const analytics = useAnalytics();

  const onAddToCart = (product: AddToCartContext, payload?: FormData) => {
    const parsedPayload = AddToCartSchema.safeParse(Object.fromEntries(payload?.entries() ?? []));

    if (parsedPayload.success) {
      const { quantity } = parsedPayload.data;
      const { id, name, brand, sku, currency, price } = product;

      analytics?.cart.productAdded({
        currency,
        value: quantity * price,
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
  };

  return (
    <StreamableEventsProvider data={data} onAddToCart={onAddToCart}>
      {children}
    </StreamableEventsProvider>
  );
}
