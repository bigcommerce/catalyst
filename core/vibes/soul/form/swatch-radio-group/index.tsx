import * as RadioGroupPrimitive from '@radix-ui/react-radio-group';
import { clsx } from 'clsx';
import { X } from 'lucide-react';
import * as React from 'react';

import { FieldError } from '@/vibes/soul/form/field-error';
import { Label } from '@/vibes/soul/form/label';
import { Image } from '~/components/image';

type SwatchOption =
  | {
      type: 'color';
      value: string;
      label: string;
      color: string;
      disabled?: boolean;
    }
  | {
      type: 'image';
      value: string;
      label: string;
      image: { src: string; alt: string };
      disabled?: boolean;
    };

/**
 * This component supports various CSS variables for theming. Here's a comprehensive list, along
 * with their default values:
 *
 * ```css
 *  :root {
 *    --swatch-radio-group-focus: hsl(var(--primary));
 *    --swatch-radio-group-light-icon: hsl(var(--foreground));
 *    --swatch-radio-group-light-unchecked-border: transparent;
 *    --swatch-radio-group-light-unchecked-border-hover: hsl(var(--border-contrast-200));
 *    --swatch-radio-group-light-disabled-border: transparent;
 *    --swatch-radio-group-light-border-error: hsl(var(--error));
 *    --swatch-radio-group-light-checked-border: hsl(var(--foreground));
 *    --swatch-radio-group-light-option-border: hsl(var(--foreground) / 10%);
 *    --swatch-radio-group-dark-icon: hsl(var(--background));
 *    --swatch-radio-group-dark-unchecked-border: transparent;
 *    --swatch-radio-group-dark-unchecked-border-hover: hsl(var(--border-contrast-400));
 *    --swatch-radio-group-dark-disabled-border: transparent;
 *    --swatch-radio-group-dark-border-error: hsl(var(--error));
 *    --swatch-radio-group-dark-checked-border: hsl(var(--background));
 *    --swatch-radio-group-dark-option-border: hsl(var(--background) / 10%);
 *  }
 * ```
 */
export const SwatchRadioGroup = React.forwardRef<
  React.ComponentRef<typeof RadioGroupPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Root> & {
    label?: string;
    options: SwatchOption[];
    errors?: string[];
    colorScheme?: 'light' | 'dark';
    onOptionMouseEnter?: (value: string) => void;
  }
>(
  (
    { label, options, errors, className, colorScheme = 'light', onOptionMouseEnter, ...rest },
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
        <RadioGroupPrimitive.Root
          {...rest}
          aria-labelledby={id}
          className="flex flex-wrap gap-1"
          ref={ref}
        >
          {options.map((option) => (
            <RadioGroupPrimitive.Item
              aria-label={option.label}
              className={clsx(
                'group relative box-content h-8 w-8 rounded-full border p-0.5 transition-colors focus-visible:ring-2 focus-visible:ring-[var(--swatch-radio-group-focus,hsl(var(--primary)))] focus-visible:outline-hidden data-disabled:pointer-events-none [&:disabled>.disabled-icon]:grid',
                {
                  light:
                    'hover:border-[var(--swatch-radio-group-light-unchecked-border-hover,hsl(var(--border-contrast-200)))] data-[state=checked]:border-[var(--swatch-radio-group-light-checked-border,hsl(var(--foreground)))]',
                  dark: 'hover:border-[var(--swatch-radio-group-dark-unchecked-border-hover,hsl(var(--border-contrast-400)))] data-[state=checked]:border-[var(--swatch-radio-group-dark-checked-border,hsl(var(--background)))]',
                }[colorScheme],
                {
                  light:
                    errors && errors.length > 0
                      ? 'border-[var(--swatch-radio-group-light-border-error,hsl(var(--error)))] disabled:border-[var(--swatch-radio-group-light-disabled-border,transparent)]'
                      : 'border-[var(--swatch-radio-group-light-unchecked-border,transparent)]',
                  dark:
                    errors && errors.length > 0
                      ? 'border-[var(--swatch-radio-group-dark-border-error,hsl(var(--error)))] disabled:border-[var(--swatch-radio-group-dark-disabled-border,transparent)]'
                      : 'border-[var(--swatch-radio-group-dark-unchecked-border,transparent)]',
                }[colorScheme],
              )}
              disabled={option.disabled}
              key={option.value}
              onMouseEnter={() => {
                onOptionMouseEnter?.(option.value);
              }}
              value={option.value}
            >
              {option.type === 'color' ? (
                <span
                  className={clsx(
                    'block size-full rounded-full border group-disabled:opacity-20',
                    {
                      light:
                        'border-[var(--swatch-radio-group-light-option-border,hsl(var(--foreground)/10%))]',
                      dark: 'border-[var(--swatch-radio-group-dark-option-border,hsl(var(--background)/10%))]',
                    }[colorScheme],
                  )}
                  style={{ backgroundColor: option.color }}
                />
              ) : (
                <span
                  className={clsx(
                    'relative block size-full overflow-hidden rounded-full border',
                    {
                      light:
                        'border-[var(--swatch-radio-group-light-option-border,hsl(var(--foreground)/10%))]',
                      dark: 'border-[var(--swatch-radio-group-dark-option-border,hsl(var(--background)/10%))]',
                    }[colorScheme],
                  )}
                >
                  <Image alt={option.image.alt} height={40} src={option.image.src} width={40} />
                </span>
              )}
              <div
                className={clsx(
                  'disabled-icon absolute inset-0 hidden place-content-center',
                  {
                    light: 'text-[var(--swatch-radio-group-light-icon,hsl(var(--foreground)))]',
                    dark: 'text-[var(--swatch-radio-group-dark-icon,hsl(var(--background)))]',
                  }[colorScheme],
                )}
              >
                <X size={16} strokeWidth={1.5} />
              </div>
            </RadioGroupPrimitive.Item>
          ))}
        </RadioGroupPrimitive.Root>
        {errors?.map((error) => <FieldError key={error}>{error}</FieldError>)}
      </div>
    );
  },
);

SwatchRadioGroup.displayName = 'SwatchRadioGroup';
