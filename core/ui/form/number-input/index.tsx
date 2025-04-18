'use client';

import { clsx } from 'clsx';
import { Minus, Plus } from 'lucide-react';
import * as React from 'react';

import { FieldError } from '@/ui/form/field-error';
import { Label } from '@/ui/form/label';

/**
 * This component supports various CSS variables for theming. Here's a comprehensive list, along
 * with their default values:
 *
 * ```css
 *  :root {
 *   --number-input-focus: hsl(var(--primary));
 *   --number-input-light-background: hsl(var(--background));
 *   --number-input-light-text: hsl(var(--foreground));
 *   --number-input-light-icon: hsl(var(--contrast-300));
 *   --number-input-light-icon-hover: hsl(var(--foreground));
 *   --number-input-light-button-background: hsl(var(--background));
 *   --number-input-light-button-background-hover: hsl(var(--contrast-100) / 50%);
 *   --number-input-light-border: hsl(var(--contrast-100));
 *   --number-input-dark-background: hsl(var(--background));
 *   --number-input-dark-text: hsl(var(--background));
 *   --number-input-dark-icon: hsl(var(--contrast-300));
 *   --number-input-dark-icon-hover: hsl(var(--background));
 *   --number-input-dark-button-background: hsl(var(--foreground));
 *   --number-input-dark-button-background-hover: hsl(var(--contrast-500) / 50%);
 *   --number-input-dark-border: hsl(var(--contrast-500));
 *  }
 * ```
 */
export const NumberInput = React.forwardRef<
  React.ComponentRef<'input'>,
  Omit<React.ComponentPropsWithoutRef<'input'>, 'id'> & {
    label?: string;
    errors?: string[];
    decrementLabel?: string;
    incrementLabel?: string;
    colorScheme?: 'light' | 'dark';
  }
>(
  (
    {
      label,
      className,
      required,
      errors,
      decrementLabel,
      incrementLabel,
      disabled = false,
      colorScheme = 'light',
      ...rest
    },
    ref,
  ) => {
    const id = React.useId();

    return (
      <div className={clsx('space-y-2', className)}>
        {label != null && label !== '' && (
          <Label colorScheme={colorScheme} htmlFor={id}>
            {label}
          </Label>
        )}
        <div
          className={clsx(
            'inline-flex items-center rounded-lg border',
            {
              light:
                'border-[var(--number-input-light-border,hsl(var(--contrast-100)))] bg-[var(--number-input-light-background,hsl(var(--background)))]',
              dark: 'border-[var(--number-input-dark-border,hsl(var(--contrast-500)))] bg-[var(--number-input-dark-background,hsl(var(--foreground)))]',
            }[colorScheme],
          )}
        >
          <button
            aria-label={decrementLabel}
            className={clsx(
              'group rounded-l-lg p-3.5 focus-visible:ring-2 focus-visible:ring-[var(--number-input-focus,hsl(var(--primary)))] focus-visible:outline-hidden disabled:cursor-not-allowed disabled:opacity-30',
              {
                light:
                  'bg-[var(--number-input-light-button-background,hsl(var(--background)))] hover:bg-[var(--number-input-light-button-background-hover,hsl(var(--contrast-100)/50%))]',
                dark: 'bg-[var(--number-input-dark-button-background,hsl(var(--foreground)))] hover:bg-[var(--number-input-dark-button-background-hover,hsl(var(--contrast-500)/50%))]',
              }[colorScheme],
            )}
            disabled={disabled}
            onClick={(e) => {
              e.preventDefault();

              const input = e.currentTarget.parentElement?.querySelector('input');

              input?.stepDown();
              input?.dispatchEvent(new InputEvent('change', { bubbles: true, cancelable: true }));
            }}
          >
            <Minus
              className={clsx(
                'transition-colors duration-300',
                {
                  light:
                    'text-[var(--number-input-light-icon,hsl(var(--contrast-300)))] group-hover:text-[var(--number-input-light-icon-hover,hsl(var(--foreground)))]',
                  dark: 'text-[var(--number-input-dark-icon,hsl(var(--contrast-300)))] group-hover:text-[var(--number-input-dark-icon-hover,hsl(var(--background)))]',
                }[colorScheme],
              )}
              size={18}
              strokeWidth={1.5}
            />
          </button>
          <input
            {...rest}
            className={clsx(
              'w-8 flex-1 [appearance:textfield] justify-center bg-transparent text-center select-none focus-visible:outline-hidden disabled:cursor-not-allowed disabled:opacity-30 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none',
              {
                light: 'text-[var(--number-input-light-text,hsl(var(--foreground)))]',
                dark: 'text-[var(--number-input-dark-text,hsl(var(--background)))]',
              }[colorScheme],
            )}
            disabled={disabled}
            id={id}
            ref={ref}
            type="number"
          />
          <button
            aria-label={incrementLabel}
            className={clsx(
              'group rounded-r-lg p-3.5 focus-visible:ring-2 focus-visible:ring-[var(--number-input-focus,hsl(var(--primary)))] focus-visible:outline-hidden disabled:cursor-not-allowed disabled:opacity-30',
              {
                light:
                  'bg-[var(--number-input-light-button-background,hsl(var(--background)))] hover:bg-[var(--number-input-light-button-background-hover,hsl(var(--contrast-100)/50%))]',
                dark: 'bg-[var(--number-input-dark-button-background,hsl(var(--foreground)))] hover:bg-[var(--number-input-dark-button-background-hover,hsl(var(--contrast-500)/50%))]',
              }[colorScheme],
            )}
            disabled={disabled}
            onClick={(e) => {
              e.preventDefault();

              const input = e.currentTarget.parentElement?.querySelector('input');

              input?.stepUp();
              input?.dispatchEvent(new InputEvent('change', { bubbles: true, cancelable: true }));
            }}
          >
            <Plus
              className={clsx(
                'transition-colors duration-300',
                {
                  light:
                    'text-[var(--number-input-light-icon,hsl(var(--contrast-300)))] group-hover:text-[var(--number-input-light-icon-hover,hsl(var(--foreground)))]',
                  dark: 'text-[var(--number-input-dark-icon,hsl(var(--contrast-300)))] group-hover:text-[var(--number-input-dark-icon-hover,hsl(var(--background)))]',
                }[colorScheme],
              )}
              size={18}
              strokeWidth={1.5}
            />
          </button>
        </div>
        {errors?.map((error) => <FieldError key={error}>{error}</FieldError>)}
      </div>
    );
  },
);

NumberInput.displayName = 'NumberInput';
