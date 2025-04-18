import { clsx } from 'clsx';
import * as React from 'react';

import { FieldError } from '@/ui/form/field-error';
import { Label } from '@/ui/form/label';

/**
 * This component supports various CSS variables for theming. Here's a comprehensive list, along
 * with their default values:
 *
 * ```css
 *  :root {
 *    --textarea-light-background: hsl(var(--background));
 *    --textarea-light-text: hsl(var(--foreground));
 *    --textarea-light-placeholder: hsl(var(--contrast-500));
 *    --textarea-light-border: hsl(var(--contrast-100));
 *    --textarea-light-border-focus: hsl(var(--foreground));
 *    --textarea-light-border-error: hsl(var(--error));
 *    --textarea-dark-background: hsl(var(--foreground));
 *    --textarea-dark-text: hsl(var(--background));
 *    --textarea-dark-placeholder: hsl(var(--contrast-100));
 *    --textarea-dark-border: hsl(var(--contrast-500));
 *    --textarea-dark-border-focus: hsl(var(--background));
 *    --textarea-dark-border-error: hsl(var(--error));
 *  }
 * ```
 */
export const Textarea = React.forwardRef<
  React.ComponentRef<'textarea'>,
  React.ComponentPropsWithoutRef<'textarea'> & {
    prepend?: React.ReactNode;
    label?: string;
    errors?: string[];
    colorScheme?: 'light' | 'dark';
  }
>(({ label, className, required, errors, colorScheme = 'light', ...rest }, ref) => {
  const id = React.useId();

  return (
    <div className={clsx('space-y-2', className)}>
      {label != null && label !== '' && (
        <Label colorScheme={colorScheme} htmlFor={id}>
          {label}
        </Label>
      )}
      <textarea
        {...rest}
        className={clsx(
          'w-full rounded-lg border p-3 transition-colors duration-200 placeholder:font-normal focus:outline-hidden disabled:cursor-not-allowed disabled:opacity-50',
          {
            light:
              'bg-[var(--textarea-light-background,hsl(var(--background)))] text-[var(--textarea-light-text,hsl(var(--foreground)))] placeholder-[var(--textarea-light-placeholder,hsl(var(--contrast-500)))] focus:border-[var(--textarea-light-border-focus,hsl(var(--foreground)))]',
            dark: 'bg-[var(--textarea-dark-background,hsl(var(--foreground)))] text-[var(--textarea-dark-text,hsl(var(--background)))] placeholder-[var(--textarea-dark-placeholder,hsl(var(--contrast-100)))] focus:border-[var(--textarea-dark-border-focus,hsl(var(--background)))]',
          }[colorScheme],
          {
            light:
              errors && errors.length > 0
                ? 'border-[var(--textarea-light-border-error,hsl(var(--error)))]'
                : 'border-[var(--textarea-light-border,hsl(var(--contrast-100)))]',
            dark:
              errors && errors.length > 0
                ? 'border-[var(--textarea-dark-border-error,hsl(var(--error)))]'
                : 'border-[var(--textarea-dark-border,hsl(var(--contrast-500)))]',
          }[colorScheme],
        )}
        id={id}
        ref={ref}
      />
      {errors?.map((error) => <FieldError key={error}>{error}</FieldError>)}
    </div>
  );
});

Textarea.displayName = 'Textarea';
