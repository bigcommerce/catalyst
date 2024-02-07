'use client';

import { Button } from '@bigcommerce/components/Button';
import { Loader2 as Spinner } from 'lucide-react';
import { useFormStatus } from 'react-dom';

export const AddToCart = ({ disabled = false }: { disabled?: boolean }) => {
  const { pending } = useFormStatus();

  return (
    <Button className="mt-2" disabled={disabled || pending} type="submit">
      {pending ? (
        <>
          <Spinner aria-hidden="true" className="animate-spin" />
          <span className="sr-only">Processing...</span>
        </>
      ) : (
        'Add to cart'
      )}
    </Button>
  );
};
