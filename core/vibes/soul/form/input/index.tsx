import { clsx } from 'clsx';
import * as React from 'react';

import { FieldError } from '@/vibes/soul/form/field-error';
import { Label } from '@/vibes/soul/form/label';

/**
 * This component supports various CSS variables for theming. Here's a comprehensive list, along
 * with their default values:
 *
 * ```css
 *  :root {
 *   --input-light-background: hsl(var(--background));
 *   --input-light-text: hsl(var(--foreground));
 *   --input-light-border: hsl(var(--contrast-100));
 *   --input-light-focus: hsl(var(--foreground));
 *   --input-light-placeholder: hsl(var(--contrast-500));
 *   --input-light-error: hsl(var(--error));
 *   --input-dark-background: hsl(var(--foreground));
 *   --input-dark-text: hsl(var(--background));
 *   --input-dark-border: hsl(var(--contrast-500));
 *   --input-dark-focus: hsl(var(--background));
 *   --input-dark-placeholder: hsl(var(--contrast-100));
 *   --input-dark-error: hsl(var(--error));
 *  }
 * ```
 */
export const Input = React.forwardRef<
  React.ComponentRef<'input'>,
  React.ComponentPropsWithoutRef<'input'> & {
    prepend?: React.ReactNode;
    label?: string;
    errors?: string[];
    colorScheme?: 'light' | 'dark';
  }
>(({ prepend, label, className, required, errors, colorScheme = 'light', id, ...rest }, ref) => {
  const generatedId = React.useId();

  return (
    <div className={clsx('w-full space-y-2', className)}>
      {label != null && label !== '' && (
        <Label colorScheme={colorScheme} htmlFor={id ?? generatedId}>
          {label}
        </Label>
      )}
      <div
        className={clsx(
          'relative overflow-hidden rounded-lg border transition-colors duration-200 focus:outline-hidden',
          {
            light:
              'border-[var(--input-light-border,hsl(var(--contrast-100)))] bg-[var(--input-light-background,hsl(var(--background)))] focus-within:border-[var(--input-light-focus,hsl(var(--foreground)))]',
            dark: 'border-[var(--input-dark-border,hsl(var(--contrast-500)))] bg-[var(--input-dark-background,hsl(var(--foreground)))] focus-within:border-[var(--input-dark-focus,hsl(var(--background)))]',
          }[colorScheme],
        )}
      >
        {prepend != null && prepend !== '' && (
          <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2">
            {prepend}
          </span>
        )}
        <input
          {...rest}
          className={clsx(
            'w-full px-6 py-3 text-sm [appearance:textfield] placeholder:font-normal focus:outline-hidden [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none',
            {
              light:
                'bg-[var(--input-light-background,hsl(var(--background)))] text-[var(--input-light-text,hsl(var(--foreground)))] placeholder:text-[var(--input-light-placeholder,hsl(var(--contrast-500)))]',
              dark: 'bg-[var(--input-dark-background,hsl(var(--foreground)))] text-[var(--input-dark-text,hsl(var(--background)))] placeholder:text-[var(--input-dark-placeholder,hsl(var(--contrast-100)))]',
            }[colorScheme],
            { 'py-2.5 pe-4 ps-12': prepend },
          )}
          id={id ?? generatedId}
          ref={ref}
        />
      </div>
      {errors?.map((error) => <FieldError key={error}>{error}</FieldError>)}
    </div>
  );
});

Input.displayName = 'Input';
