'use client';

import { Button } from '@bigcommerce/reactant/Button';
import { useFormStatus } from 'react-dom';

export const AddToCart = ({
  disabled = false,
  productName,
}: {
  disabled: boolean;
  productName: string;
}) => {
  const { pending } = useFormStatus();

  const status = pending ? 'pending' : 'idle';

  return (
    <Button aria-label={productName} disabled={disabled || pending} type="submit">
      {status === 'idle' && <span>Add to Cart</span>}
      {status === 'pending' && <span>Processing...</span>}
    </Button>
  );
};
