'use client';

import { Loader2 as Spinner, Trash } from 'lucide-react';
import { useFormStatus } from 'react-dom';

export const RemoveFromCartButton = ({
  label,
  spinnerLabel,
}: {
  label: string;
  spinnerLabel: string;
}) => {
  const { pending } = useFormStatus();

  return (
    <button
      aria-label={label}
      className="items-center hover:text-primary focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/20"
      disabled={pending}
      type="submit"
    >
      {pending ? (
        <>
          <Spinner aria-hidden="true" className="animate-spin text-primary " />
          <span className="sr-only">{spinnerLabel}</span>
        </>
      ) : (
        <Trash aria-hidden="true" />
      )}
    </button>
  );
};
