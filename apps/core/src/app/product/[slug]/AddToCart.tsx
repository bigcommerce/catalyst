'use client';

import { Button } from '@bigcommerce/reactant/Button';
import { ShoppingCart, Loader2 as Spinner } from 'lucide-react';
import { experimental_useFormStatus as useFormStatus } from 'react-dom';

import { handleAddToCart } from './_actions/addToCart';

interface Props {
  productId: number;
}

const AddToCartButton = () => {
  const { pending } = useFormStatus();

  const status = pending ? 'pending' : 'idle';

  return (
    <Button disabled={pending} type="submit">
      {status === 'idle' && (
        <>
          <ShoppingCart aria-hidden="true" className="mx-2" />
          <span>Add to Cart</span>
        </>
      )}

      {status === 'pending' && (
        <>
          <Spinner aria-hidden="true" className="animate-spin" />
          <span className="sr-only">Processing...</span>
        </>
      )}
    </Button>
  );
};

export const AddToCart = ({ productId }: Props) => {
  return (
    <form action={() => handleAddToCart(productId)} className="w-full">
      <AddToCartButton />
    </form>
  );
};
