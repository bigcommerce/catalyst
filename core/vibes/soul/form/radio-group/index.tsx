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

export const RadioGroup = React.forwardRef<
  React.ComponentRef<typeof RadioGroupPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Root> & {
    label?: string;
    options: Option[];
    errors?: string[];
  }
>(({ label, options, errors, className, ...rest }, ref) => {
  const id = React.useId();

  return (
    <div className={clsx('space-y-2', className)}>
      {label !== undefined && label !== '' && <Label htmlFor={id}>{label}</Label>}
      <RadioGroupPrimitive.Root
        {...rest}
        aria-labelledby={id}
        className="space-y-2"
        ref={ref}
        role="group"
      >
        {options.map((option, index) => (
          <RadioGroupItem error={errors != null && errors.length > 0} key={index} option={option} />
        ))}
      </RadioGroupPrimitive.Root>
      {errors?.map((error) => <FieldError key={error}>{error}</FieldError>)}
    </div>
  );
});

RadioGroup.displayName = 'RadioGroup';

function RadioGroupItem({ option, error = false }: { option: Option; error?: boolean }) {
  const id = React.useId();

  return (
    <div className="flex items-center" key={option.value}>
      <RadioGroupPrimitive.Item
        aria-label={option.label}
        className={clsx(
          'size-5 cursor-default rounded-full border bg-background outline-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&:disabled+label]:pointer-events-none [&:disabled+label]:opacity-50',
          error
            ? 'border-error disabled:border-error/50'
            : 'border-contrast-200 hover:border-contrast-300 focus:border-contrast-300',
        )}
        disabled={option.disabled}
        id={id}
        value={option.value}
      >
        <RadioGroupPrimitive.Indicator className="relative flex size-full items-center justify-center after:block after:size-3 after:rounded-full after:bg-foreground" />
      </RadioGroupPrimitive.Item>
      <label className="pl-3 text-sm leading-none text-foreground" htmlFor={id}>
        {option.label}
      </label>
    </div>
  );
}
