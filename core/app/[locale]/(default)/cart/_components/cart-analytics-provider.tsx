'use client';

import { PropsWithChildren } from 'react';
import { z } from 'zod';

import { Streamable } from '@/vibes/soul/lib/streamable';
import { StreamableEventsProvider } from '~/components/analytics/events';
import { useAnalytics } from '~/lib/analytics/react';

interface AddToCartContext {
  entityId: string;
  id: number;
  name: string;
  brand: string;
  sku?: string;
  currency: string;
  price: number;
}

const AddToCartSchema = z.object({
  id: z.string(),
  quantity: z.number({ coerce: true }).default(1),
});

export function CartAnalyticsProvider({
  children,
  data,
}: PropsWithChildren<{ data: Streamable<AddToCartContext[]> }>) {
  const analytics = useAnalytics();

  const onAddToCart = (products: AddToCartContext[], payload?: FormData) => {
    const parsedPayload = AddToCartSchema.safeParse(Object.fromEntries(payload?.entries() ?? []));

    if (parsedPayload.success) {
      const { id, quantity } = parsedPayload.data;

      const product = products.find(({ entityId }) => entityId === id);

      if (product) {
        const { id: productId, name, brand, sku, price, currency } = product;

        analytics?.cart.productAdded({
          currency,
          value: quantity * price,
          items: [
            {
              id: productId.toString(),
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

  const onRemoveFromCart = (products: AddToCartContext[], payload?: FormData) => {
    const parsedPayload = AddToCartSchema.safeParse(Object.fromEntries(payload?.entries() ?? []));

    if (parsedPayload.success) {
      const { id, quantity } = parsedPayload.data;

      const product = products.find(({ entityId }) => entityId === id);

      if (product) {
        const { id: productId, name, brand, sku, price, currency } = product;

        analytics?.cart.productRemoved({
          currency,
          value: quantity * price,
          items: [
            {
              id: productId.toString(),
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
    <StreamableEventsProvider
      data={data}
      onAddToCart={onAddToCart}
      onRemoveFromCart={onRemoveFromCart}
    >
      {children}
    </StreamableEventsProvider>
  );
}
