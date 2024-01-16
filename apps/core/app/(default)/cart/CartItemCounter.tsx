'use client';

import { CartLineItemInput, CartPhysicalItem, UpdateCartLineItemInput } from '../../../clients/old';
import { Counter } from 'components/_reactant/components/Counter';
import { useState } from 'react';

import { updateProductQuantity } from './_actions/updateProductQuantity';

type CartItemData = Pick<CartPhysicalItem, 'quantity' | 'productEntityId' | 'variantEntityId'> & {
  lineItemEntityId: CartPhysicalItem['entityId'];
};

interface UpdateProductQuantityData extends CartLineItemInput {
  lineItemEntityId: UpdateCartLineItemInput['lineItemEntityId'];
}

export const CartItemCounter = ({ itemData }: { itemData: CartItemData }) => {
  const { quantity, lineItemEntityId, productEntityId, variantEntityId } = itemData;
  const [counterValue, setCounterValue] = useState(quantity);
  const handleCountUpdate = async (value: string | number) => {
    if (Number.isNaN(value)) {
      setCounterValue(0);
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
      onChange={handleCountUpdate}
      value={counterValue}
    />
  );
};
