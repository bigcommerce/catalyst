'use client';

import * as SelectPrimitive from '@radix-ui/react-select';
import { clsx } from 'clsx';
import { ChevronDown, ChevronUp } from 'lucide-react';
import * as React from 'react';

import { FieldError } from '@/vibes/soul/form/field-error';
import { Label } from '@/vibes/soul/form/label';

type Props = {
  id?: string;
  name: string;
  placeholder?: string;
  label?: string;
  variant?: 'round' | 'rectangle';
  options: Array<{ label: string; value: string }>;
  className?: string;
  errors?: string[];
  onFocus?: (e: React.FocusEvent<HTMLButtonElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLButtonElement>) => void;
} & React.ComponentPropsWithoutRef<typeof SelectPrimitive.Root>;

export function Select({
  label,
  name,
  placeholder = 'Select an item',
  variant = 'rectangle',
  options,
  className,
  errors,
  onFocus,
  onBlur,
  value,
  ...rest
}: Props) {
  const id = React.useId();

  return (
    <div className={clsx('space-y-2', className)}>
      {label !== undefined && label !== '' && <Label htmlFor={id}>{label}</Label>}
      <SelectPrimitive.Root {...rest} value={value}>
        <SelectPrimitive.Trigger
          className={clsx(
            'flex h-fit w-full select-none items-center justify-between gap-3 border bg-white p-2 px-5 py-3 text-sm font-medium text-foreground ring-primary transition-colors hover:border-contrast-300 hover:bg-contrast-100 focus-visible:outline-none focus-visible:ring-2',
            variant === 'rectangle' ? 'rounded-lg' : 'rounded-full',
            errors && errors.length > 0 ? 'border-error' : 'border-contrast-100',
          )}
          id={id}
          name={name}
          onBlur={onBlur}
          onFocus={onFocus}
        >
          <SelectPrimitive.Value placeholder={placeholder} />
          <SelectPrimitive.Icon asChild>
            <ChevronDown className="w-5 text-foreground transition-transform" strokeWidth={1.5} />
          </SelectPrimitive.Icon>
        </SelectPrimitive.Trigger>
        <SelectPrimitive.Portal>
          <SelectPrimitive.Content className="z-50 max-h-80 w-full overflow-y-scroll rounded-xl bg-background p-2 shadow-xl data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 @4xl:rounded-3xl @4xl:p-4">
            <SelectPrimitive.ScrollUpButton className="flex w-full cursor-default items-center justify-center py-3">
              <ChevronUp className="w-5 text-foreground" strokeWidth={1.5} />
            </SelectPrimitive.ScrollUpButton>
            <SelectPrimitive.Viewport>
              {options.map((option) => (
                <SelectPrimitive.Item
                  className="w-full cursor-default select-none rounded-xl px-3 py-2 text-sm font-medium text-contrast-400 outline-none transition-colors hover:bg-contrast-100 hover:text-foreground data-[state=checked]:text-foreground @4xl:text-base"
                  key={option.value}
                  value={option.value}
                >
                  <SelectPrimitive.ItemText>{option.label}</SelectPrimitive.ItemText>
                </SelectPrimitive.Item>
              ))}
            </SelectPrimitive.Viewport>
            <SelectPrimitive.ScrollDownButton className="flex w-full cursor-default items-center justify-center py-3">
              <ChevronDown className="w-5 text-foreground" strokeWidth={1.5} />
            </SelectPrimitive.ScrollDownButton>
          </SelectPrimitive.Content>
        </SelectPrimitive.Portal>
      </SelectPrimitive.Root>
      {errors?.map((error) => <FieldError key={error}>{error}</FieldError>)}
    </div>
  );
}
