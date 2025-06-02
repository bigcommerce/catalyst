'use client';

import { clsx } from 'clsx';
import * as React from 'react';

import { FieldError } from '@/vibes/soul/form/field-error';
import { Label } from '@/vibes/soul/form/label';
import { Select, type SelectProps } from '@/vibes/soul/primitives/select';

export interface SelectFieldProps extends SelectProps {
  label: string;
  name: string;
  value: string;
  hideLabel?: boolean;
  className?: string;
}

export function SelectField({
  label,
  className,
  hideLabel = false,
  name,
  value,
  colorScheme,
  pending,
  placeholder,
  variant,
  options,
  errors,
  onFocus,
  onBlur,
  onOptionMouseEnter,
  onValueChange,
}: SelectFieldProps) {
  const id = React.useId();

  return (
    <div className={clsx('w-full', className)}>
      <Label
        className={clsx(hideLabel && 'sr-only', 'mb-2')}
        colorScheme={colorScheme}
        htmlFor={id}
      >
        {label}
      </Label>
      <Select
        colorScheme={colorScheme}
        errors={errors}
        id={id}
        label={label}
        name={name}
        onBlur={onBlur}
        onFocus={onFocus}
        onOptionMouseEnter={onOptionMouseEnter}
        onValueChange={onValueChange}
        options={options}
        pending={pending}
        placeholder={placeholder}
        value={value}
        variant={variant}
      />
      {errors?.map((error) => (
        <FieldError className="mt-2" key={error}>
          {error}
        </FieldError>
      ))}
    </div>
  );
}
