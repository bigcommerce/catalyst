'use client';

import { AlertCircle } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { toast } from 'react-hot-toast';

import { FragmentOf } from '~/client/graphql';
import { bodl } from '~/lib/bodl';

import { removeItem } from '../_actions/remove-item';

import { CartItemFragment } from './cart-item';
import { RemoveFromCartButton } from './remove-from-cart-button';

type FragmentResult = FragmentOf<typeof CartItemFragment>;
type PhysicalItem = FragmentResult['physicalItems'][number];
type DigitalItem = FragmentResult['digitalItems'][number];

export type Product = PhysicalItem | DigitalItem;

interface Props {
  currency: string;
  product: Product;
}

const lineItemTransform = (item: Product) => {
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

export const RemoveItem = ({ currency, product }: Props) => {
  const t = useTranslations('Cart.SubmitRemoveItem');

  const onSubmitRemoveItem = async () => {
    const { status } = await removeItem({
      lineItemEntityId: product.entityId,
    });

    if (status === 'error') {
      toast.error(t('errorMessage'), {
        icon: <AlertCircle className="text-error-secondary" />,
      });

      return;
    }

    bodl.cart.productRemoved({
      currency,
      product_value: product.listPrice.value * product.quantity,
      line_items: [lineItemTransform(product)],
    });
  };

  return (
    <form action={onSubmitRemoveItem}>
      <RemoveFromCartButton />
    </form>
  );
};
