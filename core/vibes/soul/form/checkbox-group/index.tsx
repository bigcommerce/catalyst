import { clsx } from 'clsx';
import * as React from 'react';

import { FieldError } from '@/vibes/soul/form/field-error';
import { Label } from '@/vibes/soul/form/label';

import { Checkbox } from '../checkbox';

interface Option {
  value: string;
  label: string;
  disabled?: boolean;
}

interface Props {
  id?: string;
  className?: string;
  label?: string;
  options: Option[];
  errors?: string[];
  name?: string;
  value: string[];
  onValueChange: (value: string[]) => void;
}

export function CheckboxGroup({
  className,
  label,
  options,
  errors,
  name,
  value,
  onValueChange,
}: Props) {
  return (
    <div className={clsx('space-y-2', className)}>
      {label !== undefined && label !== '' && <Label>{label}</Label>}
      <div className="space-y-2">
        {options.map((option) => (
          <Checkbox
            aria-label={option.label}
            checked={value.includes(option.value)}
            key={option.value}
            label={option.label}
            name={name}
            onCheckedChange={(checked) =>
              onValueChange(
                checked === true
                  ? [...value, option.value]
                  : value.filter((v) => v !== option.value),
              )
            }
            value={option.value}
          />
        ))}
      </div>
      {errors?.map((error) => <FieldError key={error}>{error}</FieldError>)}
    </div>
  );
}
