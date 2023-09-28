'use client';

import { Button } from '@bigcommerce/reactant/Button';
import { Loader2 as Spinner } from 'lucide-react';
import { experimental_useFormStatus as useFormStatus } from 'react-dom';
import { PartialDeep } from 'type-fest';

import client from '~/client';

import { handleAddToCart } from './_actions/addToCart';

type Product =
  | NonNullable<Awaited<ReturnType<typeof client.getProduct>>>
  | NonNullable<Awaited<ReturnType<typeof client.getBestSellingProducts>>[number]>
  | NonNullable<Awaited<ReturnType<typeof client.getFeaturedProducts>>[number]>
  | NonNullable<Awaited<ReturnType<typeof client.getRelatedProducts>>[number]>;

const AddToCart = () => {
  const { pending } = useFormStatus();

  return (
    <Button className="mt-2" disabled={pending} type="submit">
      {pending ? (
        <>
          <Spinner aria-hidden="true" className="animate-spin" />
          <span className="sr-only">Processing...</span>
        </>
      ) : (
        <span>Add to cart</span>
      )}
    </Button>
  );
};

export const CartAction = ({ product }: { product: PartialDeep<Product> }) => {
  const { entityId, productOptions } = product;

  if (!entityId) {
    return null;
  }

  // TODO: Render Quick Add button
  return Array.isArray(productOptions) && productOptions.length > 0 ? null : (
    <form action={handleAddToCart}>
      <input name="product_id" type="hidden" value={entityId} />
      <AddToCart />
    </form>
  );
};
