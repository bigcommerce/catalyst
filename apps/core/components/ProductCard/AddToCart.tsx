'use client';

import { Button } from 'components/_reactant/components/Button';
import { Loader2 as Spinner } from 'lucide-react';
import { useFormStatus } from 'react-dom';

import { cn } from '~/lib/utils';

export const AddToCart = () => {
  const { pending } = useFormStatus();

  return (
    <Button className={cn('mt-2')} disabled={pending} type="submit">
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
