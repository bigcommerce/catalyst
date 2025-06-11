'use client';

import { PropsWithChildren, Suspense } from 'react';
import { z } from 'zod';

import { Streamable, useStreamable } from '@/vibes/soul/lib/streamable';
import { EventsProvider } from '~/components/analytics/events';
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

export function CompareAnalyticsProvider(
  props: PropsWithChildren<{ data: Streamable<AddToCartContext[]> }>,
) {
  return (
    <Suspense fallback={props.children}>
      <CompareAnalyticsProviderResolved {...props} />
    </Suspense>
  );
}

export function CompareAnalyticsProviderResolved({
  children,
  data,
}: PropsWithChildren<{ data: Streamable<AddToCartContext[]> }>) {
  const analytics = useAnalytics();
  const products = useStreamable(data);

  const onAddToCart = (payload?: FormData) => {
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

  return <EventsProvider onAddToCart={onAddToCart}>{children}</EventsProvider>;
}
