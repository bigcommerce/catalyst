import * as RadioGroupPrimitive from '@radix-ui/react-radio-group';
import clsx from 'clsx';
import * as React from 'react';

import { ErrorMessage } from '@/vibes/soul/form/error-message';
import { Label } from '@/vibes/soul/form/label';

type Option = {
  value: string;
  label: string;
  disabled?: boolean;
};

export const RadioGroup = React.forwardRef<
  React.ComponentRef<typeof RadioGroupPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Root> & {
    label?: string;
    options: Option[];
    errors?: string[];
  }
>(({ id, label, options, errors, className, ...rest }, ref) => {
  return (
    <div className={clsx('space-y-2', className)}>
      {label !== undefined && label !== '' && <Label htmlFor={id}>{label}</Label>}
      <RadioGroupPrimitive.Root
        {...rest}
        aria-label={label}
        className="space-y-2"
        id={id}
        ref={ref}
      >
        {options.map((option) => (
          <div className="flex items-center" key={option.value}>
            <RadioGroupPrimitive.Item
              aria-label={option.label}
              className={clsx(
                'size-5 cursor-default rounded-full border bg-background outline-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&:disabled+label]:pointer-events-none [&:disabled+label]:opacity-50',
                errors && errors.length > 0
                  ? 'border-error disabled:border-error/50'
                  : 'border-contrast-200 hover:border-contrast-300 focus:border-contrast-300',
              )}
              disabled={option.disabled}
              id={option.value}
              value={option.value}
            >
              <RadioGroupPrimitive.Indicator className="relative flex size-full items-center justify-center after:block after:size-3 after:rounded-full after:bg-foreground" />
            </RadioGroupPrimitive.Item>
            <label className="pl-3 text-sm leading-none text-foreground" htmlFor={option.value}>
              {option.label}
            </label>
          </div>
        ))}
      </RadioGroupPrimitive.Root>
      {errors?.map((error) => <ErrorMessage key={error}>{error}</ErrorMessage>)}
    </div>
  );
});

RadioGroup.displayName = 'RadioGroup';
