import { handleAddToCart } from '~/app/(default)/product/[slug]/_actions/addToCart';

import { ProductSheet, ProductSheetContent, ProductSheetForm } from '../ProductSheet';

import { AddToCart } from './AddToCart';

import { Product } from '.';

export const Cart = ({ product }: { product: Partial<Product> }) => {
  if (!product.entityId) {
    return null;
  }

  return Array.isArray(product.productOptions) && product.productOptions.length > 0 ? (
    <ProductSheet title="Quick add">
      <ProductSheetContent productId={product.entityId}>
        <ProductSheetForm action={handleAddToCart} />
      </ProductSheetContent>
    </ProductSheet>
  ) : (
    <form action={handleAddToCart}>
      <input name="product_id" type="hidden" value={product.entityId} />
      <input name="quantity" type="hidden" value={1} />
      <AddToCart />
    </form>
  );
};
