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
  quantity: z.number({ coerce: true }).default(1),
});

export function ProductAnalyticsProvider(
  props: PropsWithChildren<{ data: Streamable<AddToCartContext> }>,
) {
  return (
    <Suspense fallback={props.children}>
      <ProductAnalyticsProviderResolved {...props} />
    </Suspense>
  );
}

function ProductAnalyticsProviderResolved({
  children,
  data,
}: PropsWithChildren<{ data: Streamable<AddToCartContext> }>) {
  const analytics = useAnalytics();
  const { id, name, brand, sku, currency, price } = useStreamable(data);

  const onAddToCart = (payload?: FormData) => {
    const parsedPayload = AddToCartSchema.safeParse(Object.fromEntries(payload?.entries() ?? []));

    if (parsedPayload.success) {
      const { quantity } = parsedPayload.data;

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

  return <EventsProvider onAddToCart={onAddToCart}>{children}</EventsProvider>;
}
