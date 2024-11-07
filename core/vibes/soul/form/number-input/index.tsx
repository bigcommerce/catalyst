'use client';

import { clsx } from 'clsx';
import { Minus, Plus } from 'lucide-react';
import { forwardRef } from 'react';

import { ErrorMessage } from '@/vibes/soul/form/error-message';
import { Label } from '@/vibes/soul/form/label';

export const NumberInput = forwardRef<
  React.ComponentRef<'input'>,
  React.ComponentPropsWithoutRef<'input'> & {
    prepend?: React.ReactNode;
    label?: string;
    errors?: string[];
    onValueChange?: (value: number) => void;
    decrementLabel?: string;
    incrementLabel?: string;
  }
>(
  (
    {
      id,
      prepend,
      label,
      className,
      required,
      errors,
      value,
      onValueChange,
      decrementLabel,
      incrementLabel,
      min,
      max,
      ...rest
    },
    ref,
  ) => {
    return (
      <div className={clsx('space-y-2', className)}>
        {label != null && label !== '' && <Label htmlFor={id}>{label}</Label>}
        <div className="inline-flex items-center rounded-lg border">
          <button
            aria-label={decrementLabel}
            className={clsx(
              'group rounded-l-lg p-3.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
              Number(value) === min ? 'opacity-50' : 'hover:bg-contrast-100/50',
            )}
            disabled={value != null && Number(value) === min}
            onClick={(e) => {
              e.preventDefault();

              const input = e.currentTarget.parentElement?.querySelector('input');

              input?.stepDown();
              input?.dispatchEvent(new InputEvent('change', { bubbles: true, cancelable: true }));
            }}
          >
            <Minus
              className={clsx(
                'text-contrast-300 transition-colors duration-300',
                value !== 1 && 'group-hover:text-foreground',
              )}
              size={18}
              strokeWidth={1.5}
            />
          </button>
          <input
            {...rest}
            className="w-8 flex-1 select-none justify-center text-center [appearance:textfield] focus-visible:outline-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
            id={id}
            max={max}
            min={min}
            ref={ref}
            type="number"
            value={value}
          />
          <button
            aria-label={incrementLabel}
            className={clsx(
              'group rounded-r-lg p-3.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
              Number(value) === max ? 'opacity-50' : 'hover:bg-contrast-100/50',
            )}
            disabled={value != null && Number(value) === max}
            onClick={(e) => {
              e.preventDefault();

              const input = e.currentTarget.parentElement?.querySelector('input');

              input?.stepUp();
              input?.dispatchEvent(new InputEvent('change', { bubbles: true, cancelable: true }));
            }}
          >
            <Plus
              className="text-contrast-300 transition-colors duration-300 group-hover:text-foreground"
              size={18}
              strokeWidth={1.5}
            />
          </button>
        </div>
        {errors?.map((error) => <ErrorMessage key={error}>{error}</ErrorMessage>)}
      </div>
    );
  },
);

NumberInput.displayName = 'NumberInput';
