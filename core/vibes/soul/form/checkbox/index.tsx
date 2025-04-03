'use client';

import * as CheckboxPrimitive from '@radix-ui/react-checkbox';
import * as LabelPrimitive from '@radix-ui/react-label';
import { clsx } from 'clsx';
import { Check } from 'lucide-react';
import { ComponentPropsWithoutRef, ReactNode, useId } from 'react';

import { FieldError } from '@/vibes/soul/form/field-error';

export interface CheckboxProps extends ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root> {
  label?: ReactNode;
  errors?: string[];
  colorScheme?: 'light' | 'dark';
}

// eslint-disable-next-line valid-jsdoc
/**
 * This component supports various CSS variables for theming. Here's a comprehensive list, along
 * with their default values:
 *
 * ```css
 *  :root {
 *    --checkbox-focus: hsl(var(--primary));
 *    --checkbox-light-label: hsl(var(--foreground));
 *    --checkbox-light-error: hsl(var(--error));
 *    --checkbox-light-unchecked-border: hsl(var(--contrast-200));
 *    --checkbox-light-unchecked-border-hover: hsl(var(--contrast-300));
 *    --checkbox-light-unchecked-background: hsl(var(--background));
 *    --checkbox-light-unchecked-icon: hsl(var(--foreground));
 *    --checkbox-light-checked-border: hsl(var(--foreground));
 *    --checkbox-light-checked-border-hover: hsl(var(--foreground));
 *    --checkbox-light-checked-background: hsl(var(--foreground));
 *    --checkbox-light-checked-icon: hsl(var(--background));
 *    --checkbox-dark-label: hsl(var(--background));
 *    --checkbox-dark-error: hsl(var(--error));
 *    --checkbox-dark-unchecked-border: hsl(var(--contrast-400));
 *    --checkbox-dark-unchecked-border-hover: hsl(var(--contrast-300));
 *    --checkbox-dark-unchecked-background: hsl(var(--foreground));
 *    --checkbox-dark-unchecked-icon: hsl(var(--background));
 *    --checkbox-dark-checked-border: hsl(var(--background));
 *    --checkbox-dark-checked-border-hover: hsl(var(--background));
 *    --checkbox-dark-checked-background: hsl(var(--foreground));
 *    --checkbox-dark-checked-icon: hsl(var(--foreground));
 *    --checkbox-font-family: var(--font-family-body);
 *  }
 * ```
 */
export function Checkbox({
  id,
  label,
  errors,
  className,
  colorScheme = 'light',
  ...props
}: CheckboxProps) {
  const generatedId = useId();

  return (
    <div className="space-y-2">
      <div
        className={clsx(
          'flex items-center gap-2 font-[family-name:var(--checkbox-font-family,var(--font-family-body))]',
          className,
        )}
      >
        <CheckboxPrimitive.Root
          {...props}
          aria-labelledby={id !== undefined ? `${id}-label` : `${generatedId}-label`}
          className={clsx(
            'flex h-5 w-5 items-center justify-center rounded-md border transition-colors duration-150 focus-visible:ring-2 focus-visible:ring-[var(--checkbox-focus,hsl(var(--primary)))] focus-visible:outline-0',
            {
              light:
                errors && errors.length > 0
                  ? 'border-[var(--checkbox-light-error,hsl(var(--error)))]'
                  : 'data-[state=checked]:border-[var(--checkbox-light-checked-border,hsl(var(--foreground)))] data-[state=checked]:bg-[var(--checkbox-light-checked-background,hsl(var(--foreground)))] data-[state=checked]:text-[var(--checkbox-light-checked-text,hsl(var(--background)))] data-[state=checked]:hover:border-[var(--checkbox-light-checked-border-hover,hsl(var(--foreground)))] data-[state=unchecked]:border-[var(--checkbox-light-unchecked-border,hsl(var(--contrast-200)))] data-[state=unchecked]:bg-[var(--checkbox-light-unchecked-background,hsl(var(--background)))] data-[state=unchecked]:text-[var(--checkbox-light-unchecked-text,hsl(var(--foreground)))] data-[state=unchecked]:hover:border-[var(--checkbox-light-unchecked-border-hover,hsl(var(--contrast-300)))]',
              dark:
                errors && errors.length > 0
                  ? 'border-[var(--checkbox-dark-error,hsl(var(--error)))]'
                  : 'data-[state=checked]:border-[var(--checkbox-dark-checked-border,hsl(var(--background)))] data-[state=checked]:bg-[var(--checkbox-dark-checked-background,hsl(var(--foreground)))] data-[state=checked]:text-[var(--checkbox-dark-checked-text,hsl(var(--background)))] data-[state=checked]:hover:border-[var(--checkbox-dark-checked-border-hover,hsl(var(--background)))] data-[state=unchecked]:border-[var(--checkbox-dark-unchecked-border,hsl(var(--contrast-400)))] data-[state=unchecked]:bg-[var(--checkbox-dark-unchecked-background,hsl(var(--foreground)))] data-[state=unchecked]:text-[var(--checkbox-dark-unchecked-text,hsl(var(--background)))] data-[state=unchecked]:hover:border-[var(--checkbox-dark-unchecked-border-hover,hsl(var(--contrast-300)))]',
            }[colorScheme],
          )}
          id={id ?? generatedId}
        >
          <CheckboxPrimitive.Indicator>
            <Check className="h-4 w-4" color="currentColor" />
          </CheckboxPrimitive.Indicator>
        </CheckboxPrimitive.Root>

        {label != null && label !== '' && (
          <LabelPrimitive.Root
            className={clsx(
              'cursor-pointer text-sm',
              {
                light: 'text-[var(--checkbox-light-label,hsl(var(--foreground)))]',
                dark: 'text-[var(--checkbox-dark-label,hsl(var(--background)))]',
              }[colorScheme],
            )}
            htmlFor={id ?? generatedId}
            id={id !== undefined ? `${id}-label` : `${generatedId}-label`}
          >
            {label}
          </LabelPrimitive.Root>
        )}
      </div>
      {errors?.map((error) => <FieldError key={error}>{error}</FieldError>)}
    </div>
  );
}
