'use client';

import { AlertCircle, Check } from 'lucide-react';
import Link from 'next/link';
import { ComponentPropsWithoutRef } from 'react';
import { toast } from 'react-hot-toast';

import { handleAddToCart } from './_actions/addToCart';

export const ProductForm = ({ children }: ComponentPropsWithoutRef<'form'>) => (
  <form
    action={async (formData: FormData) => {
      const result = await handleAddToCart(formData);
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
              <Link className="font-semibold text-blue-primary" href="/cart">
                your cart
              </Link>
            </span>
          </div>
        ),
        { icon: <Check className="text-green-100" /> },
      );
    }}
    className="w-full"
  >
    {children}
  </form>
);
