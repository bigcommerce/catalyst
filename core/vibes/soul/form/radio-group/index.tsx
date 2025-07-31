import * as RadioGroupPrimitive from '@radix-ui/react-radio-group';
import { clsx } from 'clsx';
import * as React from 'react';

import { FieldError } from '@/vibes/soul/form/field-error';
import { Label } from '@/vibes/soul/form/label';

interface Option {
  value: string;
  label: string;
  description?: string;
  disabled?: boolean;
}

export const RadioGroup = React.forwardRef<
  React.ComponentRef<typeof RadioGroupPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Root> & {
    label?: string;
    options: Option[];
    errors?: string[];
    colorScheme?: 'light' | 'dark';
    onOptionMouseEnter?: (value: string) => void;
  }
>(
  (
    { label, options, errors, className, onOptionMouseEnter, colorScheme = 'light', ...rest },
    ref,
  ) => {
    const id = React.useId();

    return (
      <div className={clsx('space-y-2', className)}>
        {label !== undefined && label !== '' && <Label id={id}>{label}</Label>}
        <RadioGroupPrimitive.Root {...rest} aria-labelledby={id} className="space-y-2" ref={ref}>
          {options.map((option, index) => (
            <RadioGroupItem
              colorScheme={colorScheme}
              error={errors != null && errors.length > 0}
              key={index}
              onOptionMouseEnter={onOptionMouseEnter}
              option={option}
            />
          ))}
        </RadioGroupPrimitive.Root>
        {errors?.map((error) => (
          <FieldError key={error}>{error}</FieldError>
        ))}
      </div>
    );
  },
);

RadioGroup.displayName = 'RadioGroup';

// eslint-disable-next-line valid-jsdoc
/**
 * This component supports various CSS variables for theming. Here's a comprehensive list, along
 * with their default values:
 *
 * ```css
 *  :root {
 *   --radio-group-light-background: hsl(var(--background));
 *   --radio-group-light-border: hsl(var(--contrast-200));
 *   --radio-group-light-border-error: hsl(var(--error));
 *   --radio-group-light-disabled-border-error: hsl(var(--error) / 50%);
 *   --radio-group-light-border-hover: hsl(var(--contrast-300));
 *   --radio-group-light-border-focus: hsl(var(--contrast-300));
 *   --radio-group-light-indicator-background: hsl(var(--foreground));
 *   --radio-group-light-label: hsl(var(--foreground));
 *   --radio-group-dark-background: hsl(var(--foreground));
 *   --radio-group-dark-border: hsl(var(--contrast-400));
 *   --radio-group-dark-border-error: hsl(var(--error));
 *   --radio-group-dark-disabled-border-error: hsl(var(--error) / 50%);
 *   --radio-group-dark-border-hover: hsl(var(--contrast-300));
 *   --radio-group-dark-border-focus: hsl(var(--contrast-300));
 *   --radio-group-dark-indicator-background: hsl(var(--background));
 *   --radio-group-dark-label: hsl(var(--background));
 *  }
 * ```
 */
function RadioGroupItem({
  option,
  error = false,
  colorScheme = 'light',
  onOptionMouseEnter,
}: {
  option: Option;
  error?: boolean;
  colorScheme?: 'light' | 'dark';
  onOptionMouseEnter?: (value: string) => void;
}) {
  const id = React.useId();

  return (
    <div className="flex items-center" key={option.value}>
      <RadioGroupPrimitive.Item
        aria-labelledby={
          option.description !== undefined ? `${id}-label ${id}-description` : `${id}-label`
        }
        className={clsx(
          'data-disabled:pointer-events-none data-disabled:opacity-50 size-5 cursor-default rounded-full border outline-none [&:disabled+label]:pointer-events-none [&:disabled+label]:opacity-50',
          {
            light: 'bg-[var(--radio-group-light-background,hsl(var(--background)))]',
            dark: 'bg-[var(--radio-group-dark-background,hsl(var(--foreground)))]',
          }[colorScheme],
          {
            light: error
              ? 'border-[var(--radio-group-light-border-error,hsl(var(--error)))] disabled:border-[var(--radio-group-light-disabled-border-error,hsl(var(--error)/50%))]'
              : 'border-[var(--radio-group-light-border,hsl(var(--contrast-200)))] hover:border-[var(--radio-group-light-border-hover,hsl(var(--contrast-300)))] focus:border-[var(--radio-group-light-border-focus,hsl(var(--contrast-300)))]',
            dark: error
              ? 'border-[var(--radio-group-dark-border-error,hsl(var(--error)))] disabled:border-[var(--radio-group-dark-disabled-border-error,hsl(var(--error)/50%))]'
              : 'border-[var(--radio-group-dark-border,hsl(var(--contrast-400)))] hover:border-[var(--radio-group-dark-border-hover,hsl(var(--contrast-300)))] focus:border-[var(--radio-group-light-border-focus,hsl(var(--contrast-300)))]',
          }[colorScheme],
        )}
        disabled={option.disabled}
        id={id}
        onMouseEnter={() => {
          onOptionMouseEnter?.(option.value);
        }}
        value={option.value}
      >
        <RadioGroupPrimitive.Indicator
          className={clsx(
            'relative flex size-full items-center justify-center after:block after:size-3 after:rounded-full',
            {
              light:
                'after:bg-[var(--radio-group-light-indicator-background,hsl(var(--foreground)))]',
              dark: 'after:bg-[var(--radio-group-dark-indicator-background,hsl(var(--background)))]',
            }[colorScheme],
          )}
        />
      </RadioGroupPrimitive.Item>
      <label
        className={clsx(
          'flex grow justify-between pl-3 text-sm leading-none',
          {
            light: 'text-[var(--radio-group-light-label,hsl(var(--foreground)))]',
            dark: 'text-[var(--radio-group-dark-label,hsl(var(--background)))]',
          }[colorScheme],
        )}
        htmlFor={id}
      >
        <span id={`${id}-label`}>{option.label}</span>
        {option.description !== undefined && (
          <span id={`${id}-description`}>{option.description}</span>
        )}
      </label>
    </div>
  );
}
