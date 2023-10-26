'use client';

import { Button } from '@bigcommerce/reactant/Button';
import { cs } from '@bigcommerce/reactant/cs';
import { Loader2 as Spinner } from 'lucide-react';
import { useFormStatus } from 'react-dom';

export const AddToCart = () => {
  const { pending } = useFormStatus();

  return (
    <Button className={cs('mt-2')} disabled={pending} type="submit">
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
