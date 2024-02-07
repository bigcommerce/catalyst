'use client';

import { AlertCircle, Check } from 'lucide-react';
import { toast } from 'react-hot-toast';

import { Link } from '~/components/link';

import { addToCart } from '../_actions/add-to-cart';

import { AddToCart } from './add-to-cart';

export const AddToCartForm = ({
  entityId,
  availability,
  productName,
}: {
  entityId: number;
  availability: 'Unavailable' | 'Available' | 'Preorder';
  productName: string;
}) => (
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
    <input name="product_id" type="hidden" value={entityId} />
    <input name="quantity" type="hidden" value={1} />
    <AddToCart disabled={availability === 'Unavailable'} productName={productName} />
  </form>
);
