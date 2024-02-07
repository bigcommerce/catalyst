'use client';

import { Counter } from '@bigcommerce/components/Counter';
import { useState } from 'react';

import {
  CartLineItemInput,
  CartPhysicalItem,
  UpdateCartLineItemInput,
} from '~/client/generated/graphql';

import { updateProductQuantity } from '../_actions/update-product-quantity';

type CartItemData = Pick<CartPhysicalItem, 'quantity' | 'productEntityId' | 'variantEntityId'> & {
  lineItemEntityId: CartPhysicalItem['entityId'];
};

interface UpdateProductQuantityData extends CartLineItemInput {
  lineItemEntityId: UpdateCartLineItemInput['lineItemEntityId'];
}

export const CartItemCounter = ({ itemData }: { itemData: CartItemData }) => {
  const { quantity, lineItemEntityId, productEntityId, variantEntityId } = itemData;

  const [counterValue, setCounterValue] = useState<'' | number>(quantity);
  const handleCountUpdate = async (value: string | number) => {
    if (value === '') {
      setCounterValue(value);

      return;
    }

    setCounterValue(Number(value));

    const productData: UpdateProductQuantityData = Object.assign(
      { lineItemEntityId, productEntityId, quantity: Number(value) },
      variantEntityId && { variantEntityId },
    );

    await updateProductQuantity(productData);
  };

  return (
    <Counter
      className="w-32 text-base font-bold"
      min={1}
      onChange={handleCountUpdate}
      value={counterValue}
    />
  );
};
