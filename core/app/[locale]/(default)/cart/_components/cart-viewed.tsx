'use client';

import { useEffect, useRef } from 'react';

import { FragmentOf } from '~/client/graphql';
import { useAnalytics } from '~/lib/analytics/react';

import {
  CartGiftCertificateFragment,
  DigitalItemFragment,
  PhysicalItemFragment,
} from '../page-data';

type PhysicalItem = FragmentOf<typeof PhysicalItemFragment>;
type DigitalItem = FragmentOf<typeof DigitalItemFragment>;
type GiftCertificateItem = FragmentOf<typeof CartGiftCertificateFragment>;
type LineItem = PhysicalItem | DigitalItem | GiftCertificateItem;

interface Props {
  subtotal?: number;
  currencyCode: string;
  lineItems: LineItem[];
}

export const CartViewed = ({ subtotal, currencyCode, lineItems }: Props) => {
  const isMounted = useRef(false);
  const analytics = useAnalytics();

  useEffect(() => {
    if (isMounted.current) {
      return;
    }

    isMounted.current = true;

    analytics?.cart.cartViewed({
      currency: currencyCode,
      value: subtotal ?? 0,
      items: lineItems.map((lineItem) => {
        if (lineItem.__typename === 'CartGiftCertificate') {
          return {
            id: lineItem.entityId.toString(),
            name: lineItem.name,
            price: lineItem.amount.value,
            quantity: 1,
          };
        }

        return {
          id: lineItem.productEntityId.toString(),
          name: lineItem.name,
          brand: lineItem.brand ?? undefined,
          sku: lineItem.sku ?? undefined,
          price: lineItem.listPrice.value,
          variant_id: lineItem.variantEntityId ?? undefined,
          quantity: lineItem.quantity,
        };
      }),
    });
  }, [analytics, currencyCode, lineItems, subtotal]);

  return null;
};
