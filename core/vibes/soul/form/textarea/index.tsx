import { clsx } from 'clsx';
import * as React from 'react';

import { ErrorMessage } from '@/vibes/soul/form/error-message';
import { Label } from '@/vibes/soul/form/label';

export const Textarea = React.forwardRef<
  React.ComponentRef<'textarea'>,
  React.ComponentPropsWithoutRef<'textarea'> & {
    prepend?: React.ReactNode;
    label?: string;
    errors?: string[];
  }
>(({ id, label, className, required, errors, ...rest }, ref) => {
  return (
    <div className={clsx('space-y-2', className)}>
      {label != null && label !== '' && <Label htmlFor={id}>{label}</Label>}
      <textarea
        {...rest}
        className={clsx(
          'placeholder-contrast-gray-500 w-full rounded-lg border bg-background p-3 text-foreground transition-colors duration-200 placeholder:font-normal focus:border-foreground focus:outline-none disabled:cursor-not-allowed disabled:opacity-50',
          errors && errors.length > 0 ? 'border-error' : 'border-contrast-100',
        )}
        id={id}
        ref={ref}
      />
      {errors?.map((error) => <ErrorMessage key={error}>{error}</ErrorMessage>)}
    </div>
  );
});

Textarea.displayName = 'Textarea';
