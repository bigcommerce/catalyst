import * as RadioGroupPrimitive from '@radix-ui/react-radio-group';
import { clsx } from 'clsx';
import * as React from 'react';

import { FieldError } from '@/vibes/soul/form/field-error';
import { Label } from '@/vibes/soul/form/label';

interface Option {
  value: string;
  label: string;
  disabled?: boolean;
}

export const ButtonRadioGroup = React.forwardRef<
  React.ComponentRef<typeof RadioGroupPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Root> & {
    label?: string;
    options: Option[];
    errors?: string[];
    onOptionMouseEnter?: (value: string) => void;
  }
>(({ label, options, errors, className, onOptionMouseEnter, ...rest }, ref) => {
  const id = React.useId();

  return (
    <div className={clsx('space-y-2', className)}>
      {label !== undefined && label !== '' && <Label id={id}>{label}</Label>}
      <RadioGroupPrimitive.Root
        {...rest}
        aria-labelledby={id}
        className="flex flex-wrap gap-2"
        ref={ref}
      >
        {options.map((option) => (
          <RadioGroupPrimitive.Item
            aria-label={option.label}
            className={clsx(
              'h-12 whitespace-nowrap rounded-full border border-contrast-100 px-4 font-body text-sm font-normal leading-normal ring-primary transition-colors focus-visible:outline-0 focus-visible:ring-2 data-[disabled]:pointer-events-none data-[state=checked]:bg-foreground data-[state=unchecked]:bg-background data-[state=checked]:text-background data-[disabled]:opacity-50 data-[disabled]:hover:border-transparent data-[state=unchecked]:hover:border-contrast-200 data-[state=unchecked]:hover:bg-contrast-100',
              errors && errors.length > 0
                ? 'disabled:border-error/50 data-[state=unchecked]:border-error'
                : 'data-[state=checked]:border-foreground',
            )}
            disabled={option.disabled}
            id={option.value}
            key={option.value}
            onMouseEnter={() => {
              if (typeof onOptionMouseEnter === 'function') {
                onOptionMouseEnter(option.value);
              }
            }}
            value={option.value}
          >
            {option.label}
          </RadioGroupPrimitive.Item>
        ))}
      </RadioGroupPrimitive.Root>
      {errors?.map((error) => <FieldError key={error}>{error}</FieldError>)}
    </div>
  );
});

ButtonRadioGroup.displayName = 'ButtonRadioGroup';
