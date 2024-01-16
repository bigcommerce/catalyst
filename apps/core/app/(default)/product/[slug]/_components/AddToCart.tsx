'use client';

import { Button } from 'components/_reactant/components/Button';
import { ShoppingCart, Loader2 as Spinner } from 'lucide-react';
import { useFormStatus } from 'react-dom';

export const AddToCart = ({ disabled = false }: { disabled: boolean }) => {
  const { pending } = useFormStatus();

  const status = pending ? 'pending' : 'idle';

  return (
    <Button disabled={disabled || pending} type="submit">
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
