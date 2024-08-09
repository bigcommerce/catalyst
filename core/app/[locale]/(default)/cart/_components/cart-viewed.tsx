'use client';

import { useEffect } from 'react';

import { FragmentOf } from '~/client/graphql';
import { bodl } from '~/lib/bodl';

import { CartItemFragment } from './cart-item';
import { CheckoutSummaryFragment } from './checkout-summary';

type FragmentResult = FragmentOf<typeof CartItemFragment>;
type PhysicalItem = FragmentResult['physicalItems'][number];
type DigitalItem = FragmentResult['digitalItems'][number];
type lineItem = PhysicalItem | DigitalItem;

interface Props {
  checkout: FragmentOf<typeof CheckoutSummaryFragment> | null;
  currencyCode: string;
  lineItems: lineItem[];
}

const lineItemTransform = (item: lineItem) => {
  return {
    product_id: item.productEntityId.toString(),
    product_name: item.name,
    brand_name: item.brand ?? undefined,
    sku: item.sku ?? undefined,
    sale_price: item.extendedSalePrice.value,
    purchase_price: item.listPrice.value,
    base_price: item.originalPrice.value,
    retail_price: item.listPrice.value,
    currency: item.listPrice.currencyCode,
    variant_id: item.variantEntityId ? [item.variantEntityId] : undefined,
    quantity: item.quantity,
  };
};

export const CartViewed = ({ checkout, currencyCode, lineItems }: Props) => {
  useEffect(() => {
    bodl.cart.cartViewed({
      currency: currencyCode,
      cart_value: checkout?.grandTotal?.value ?? 0,
      line_items: lineItems.map(lineItemTransform),
    });
  }, [currencyCode, lineItems, checkout]);

  return null;
};
