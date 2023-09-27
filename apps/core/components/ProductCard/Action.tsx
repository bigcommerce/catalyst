'use client';

import { Product } from '@bigcommerce/catalyst-client';
import { Button } from '@bigcommerce/reactant/Button';
import { Loader2 as Spinner } from 'lucide-react';
import { experimental_useFormStatus as useFormStatus } from 'react-dom';
import { PartialDeep } from 'type-fest';

import { handleAddToCart } from './_actions/addToCart';

const AddToCart = () => {
  const { pending } = useFormStatus();

  const status = pending ? 'pending' : 'idle';

  return (
    <Button className="mt-2" disabled={pending} type="submit">
      {status === 'idle' && <span>Add to cart</span>}

      {status === 'pending' && (
        <>
          <Spinner aria-hidden="true" className="animate-spin" />
          <span className="sr-only">Processing...</span>
        </>
      )}
    </Button>
  );
};

export const Action = ({ product }: { product: PartialDeep<Product> }) => {
  const { entityId, productOptions } = product;

  if (!entityId) {
    return null;
  }

  return Array.isArray(productOptions) && productOptions.length > 0 ? null : (
    <form action={handleAddToCart}>
      <input name="product_id" type="hidden" value={entityId} />
      <AddToCart />
    </form>
  );
};
