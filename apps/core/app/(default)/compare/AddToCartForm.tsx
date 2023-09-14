'use client';

import { addToCart } from './_actions/addToCart';
import { AddToCart } from './AddToCart';

export const AddToCartForm = ({
  entityId,
  availability,
  productName,
}: {
  entityId: number;
  availability: 'Unavailable' | 'Available' | 'Preorder';
  productName: string;
}) => (
  <form action={addToCart}>
    <input name="product_id" type="hidden" value={entityId} />
    <AddToCart disabled={availability === 'Unavailable'} productName={productName} />
  </form>
);
