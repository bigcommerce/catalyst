'use client';

import { Button } from '@bigcommerce/components/Button';
import { ShoppingCart, Loader2 as Spinner } from 'lucide-react';
import { useFormContext } from 'react-hook-form';

export const AddToCart = ({ disabled = false }: { disabled?: boolean }) => {
  const { formState } = useFormContext();
  const { isSubmitting } = formState;

  return (
    <Button disabled={disabled || isSubmitting} type="submit">
      {isSubmitting ? (
        <>
          <Spinner aria-hidden="true" className="animate-spin" />
          <span className="sr-only">Processing...</span>
        </>
      ) : (
        <>
          <ShoppingCart aria-hidden="true" className="mx-2" />
          <span>Add to cart</span>
        </>
      )}
    </Button>
  );
};
