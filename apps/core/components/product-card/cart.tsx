'use client';

import { AlertCircle, Check } from 'lucide-react';
import { toast } from 'react-hot-toast';

import { Link } from '../link';
import { ProductSheet, ProductSheetContent } from '../product-sheet';

import { addToCart } from './_actions/add-to-cart';
import { AddToCart } from './add-to-cart';

import { Product } from '.';

export const Cart = ({ product }: { product: Partial<Product> }) => {
  if (!product.entityId) {
    return null;
  }

  return Array.isArray(product.productOptions) && product.productOptions.length > 0 ? (
    <ProductSheet title="Quick add">
      <ProductSheetContent productId={product.entityId} />
    </ProductSheet>
  ) : (
    <form
      action={async (formData: FormData) => {
        const result = await addToCart(formData);
        const quantity = Number(formData.get('quantity'));

        if (result?.error) {
          toast.error(result.error, { icon: <AlertCircle className="text-red-100" /> });

          return;
        }

        toast.success(
          () => (
            <div className="flex items-center gap-3">
              <span>
                {quantity} {quantity === 1 ? 'Item' : 'Items'} added to{' '}
                <Link className="font-semibold text-blue-primary" href="/cart" prefetch={false}>
                  your cart
                </Link>
              </span>
            </div>
          ),
          { icon: <Check className="text-green-100" /> },
        );
      }}
    >
      <input name="product_id" type="hidden" value={product.entityId} />
      <input name="quantity" type="hidden" value={1} />
      <AddToCart />
    </form>
  );
};
