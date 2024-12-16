'use client';

import * as ToggleGroupPrimitive from '@radix-ui/react-toggle-group';
import { clsx } from 'clsx';
import * as React from 'react';

import { FieldError } from '@/vibes/soul/form/field-error';
import { Label } from '@/vibes/soul/form/label';

interface Option {
  value: string;
  label: string;
  disabled?: boolean;
}

export const ToggleGroup = React.forwardRef<
  React.ComponentRef<typeof ToggleGroupPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof ToggleGroupPrimitive.Root> & {
    label?: string;
    options: Option[];
    errors?: string[];
  }
>(({ label, options, errors, className, ...rest }, ref) => {
  const id = React.useId();

  return (
    <div className={clsx('space-y-2', className)}>
      {label !== undefined && label !== '' && <Label id={id}>{label}</Label>}
      <ToggleGroupPrimitive.Root
        {...rest}
        aria-labelledby={id}
        className="flex flex-wrap gap-2"
        ref={ref}
        role="group"
      >
        {options.map((option) => (
          <ToggleGroupPrimitive.Item
            aria-label={option.label}
            className="h-12 whitespace-nowrap rounded-full border border-contrast-100 px-4 font-body text-sm font-normal leading-normal ring-primary transition-colors focus-visible:outline-0 focus-visible:ring-2 data-[disabled]:pointer-events-none data-[state=on]:border-foreground data-[state=off]:bg-background data-[state=on]:bg-foreground data-[state=on]:text-background data-[disabled]:opacity-50 data-[disabled]:hover:border-transparent data-[state=off]:hover:border-contrast-200 data-[state=off]:hover:bg-contrast-100"
            disabled={option.disabled}
            key={option.value}
            value={option.value}
          >
            {option.label}
          </ToggleGroupPrimitive.Item>
        ))}
      </ToggleGroupPrimitive.Root>
      {errors?.map((error) => <FieldError key={error}>{error}</FieldError>)}
    </div>
  );
});

ToggleGroup.displayName = 'ToggleGroup';
