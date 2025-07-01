import * as RadioGroupPrimitive from '@radix-ui/react-radio-group';
import { clsx } from 'clsx';
import * as React from 'react';

import { FieldError } from '@/vibes/soul/form/field-error';
import { Label } from '@/vibes/soul/form/label';
import { Image } from '~/components/image';

interface Option {
  value: string;
  label: string;
  image?: { src: string; alt: string };
  disabled?: boolean;
}

/**
 * This component supports various CSS variables for theming. Here's a comprehensive list, along
 * with their default values:
 *
 * ```css
 *  :root {
 *   --card-radio-group-focus: hsl(var(--primary));
 *   --card-radio-group-light-unchecked-border: hsl(var(--contrast-100));
 *   --card-radio-group-light-unchecked-border-hover: hsl(var(--contrast-200));
 *   --card-radio-group-light-unchecked-background: hsl(var(--background));
 *   --card-radio-group-light-unchecked-text: hsl(var(--foreground));
 *   --card-radio-group-light-unchecked-background-hover: hsl(var(--contrast-100));
 *   --card-radio-group-light-checked-background: hsl(var(--foreground));
 *   --card-radio-group-light-checked-text: hsl(var(--background));
 *   --card-radio-group-light-border-error: hsl(var(--error));
 *   --card-radio-group-dark-unchecked-border: hsl(var(--contrast-500));
 *   --card-radio-group-dark-unchecked-border-hover: hsl(var(--contrast-400));
 *   --card-radio-group-dark-unchecked-background: hsl(var(--foreground));
 *   --card-radio-group-dark-unchecked-background-hover: hsl(var(--contrast-500));
 *   --card-radio-group-dark-unchecked-text: hsl(var(--background));
 *   --card-radio-group-dark-checked-background: hsl(var(--background));
 *   --card-radio-group-dark-checked-text: hsl(var(--foreground));
 *   --card-radio-group-dark-border-error: hsl(var(--error));
 *  }
 * ```
 */
export const CardRadioGroup = React.forwardRef<
  React.ComponentRef<typeof RadioGroupPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Root> & {
    label?: string;
    options: Option[];
    errors?: string[];
    onOptionMouseEnter?: (value: string) => void;
    colorScheme?: 'light' | 'dark';
  }
>(
  (
    { label, options, errors, className, onOptionMouseEnter, colorScheme = 'light', ...rest },
    ref,
  ) => {
    const id = React.useId();

    return (
      <div className={clsx('space-y-2', className)}>
        {label !== undefined && label !== '' && (
          <Label colorScheme={colorScheme} id={id}>
            {label}
          </Label>
        )}
        <RadioGroupPrimitive.Root {...rest} aria-labelledby={id} className="space-y-2" ref={ref}>
          {options.map((option) => (
            <RadioGroupPrimitive.Item
              aria-label={option.label}
              className={clsx(
                'data-disabled:pointer-events-none data-disabled:opacity-50 relative flex h-12 w-full items-center overflow-hidden rounded-lg border font-body text-sm font-normal leading-normal transition-colors focus-visible:outline-0 focus-visible:ring-2 focus-visible:ring-[var(--card-radio-group-focus,hsl(var(--primary)))]',
                {
                  light:
                    'border-[var(--card-radio-group-light-unchecked-border,hsl(var(--contrast-100)))] text-[var(--card-radio-group-light-unchecked-text,hsl(var(--foreground)))] data-[state=checked]:bg-[var(--card-radio-group-light-checked-background,hsl(var(--foreground)))] data-[state=unchecked]:bg-[var(--card-radio-group-light-unchecked-background,hsl(var(--background)))] data-[state=checked]:text-[var(--card-radio-group-light-checked-text,hsl(var(--background)))] data-[state=unchecked]:hover:border-[var(--card-radio-group-light-unchecked-border-hover,hsl(var(--contrast-200)))] data-[state=unchecked]:hover:bg-[var(--card-radio-group-light-unchecked-background-hover,hsl(var(--contrast-100)))]',
                  dark: 'border-[var(--card-radio-group-dark-unchecked-border,hsl(var(--contrast-500)))] text-[var(--card-radio-group-dark-unchecked-text,hsl(var(--background)))] data-[state=checked]:bg-[var(--card-radio-group-dark-checked-background,hsl(var(--background)))] data-[state=unchecked]:bg-[var(--card-radio-group-dark-unchecked-background,hsl(var(--foreground)))] data-[state=checked]:text-[var(--card-radio-group-dark-checked-text,hsl(var(--foreground)))] data-[state=unchecked]:hover:border-[var(--card-radio-group-dark-unchecked-border-hover,hsl(var(--contrast-400)))] data-[state=unchecked]:hover:bg-[var(--card-radio-group-dark-unchecked-background-hover,hsl(var(--contrast-500)))]',
                }[colorScheme],
                {
                  light:
                    errors && errors.length > 0
                      ? 'data-[state=unchecked]:border-[var(--card-radio-group-light-border-error,hsl(var(--error)))]'
                      : 'data-[state=checked]:border-[var(--card-radio-group-light-checked-background,hsl(var(--foreground)))]',
                  dark:
                    errors && errors.length > 0
                      ? 'data-[state=unchecked]:border-[var(--card-radio-group-dark-border-error,hsl(var(--error)))]'
                      : 'data-[state=checked]:border-[var(--card-radio-group-dark-checked-background,hsl(var(--foreground)))]',
                }[colorScheme],
              )}
              disabled={option.disabled}
              id={option.value}
              key={option.value}
              onMouseEnter={() => {
                onOptionMouseEnter?.(option.value);
              }}
              value={option.value}
            >
              {option.image && (
                <div className="relative aspect-square h-full">
                  <Image
                    alt={option.image.alt}
                    className="bg-background object-fill"
                    fill
                    src={option.image.src}
                  />
                </div>
              )}

              <span className="flex-1 truncate text-ellipsis px-4 text-left">{option.label}</span>
            </RadioGroupPrimitive.Item>
          ))}
        </RadioGroupPrimitive.Root>
        {errors?.map((error) => <FieldError key={error}>{error}</FieldError>)}
      </div>
    );
  },
);

CardRadioGroup.displayName = 'CardRadioGroup';
