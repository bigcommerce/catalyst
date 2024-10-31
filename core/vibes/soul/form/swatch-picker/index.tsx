import { BcImage } from '~/components/bc-image';
import * as React from 'react';

import * as RadioGroupPrimitive from '@radix-ui/react-radio-group';
import clsx from 'clsx';

import { ErrorMessage } from '@/vibes/soul/form/error-message';
import { Label } from '@/vibes/soul/form/label';

interface SwatchColorOption {
  value: string;
  label: string;
  color: string;
  disabled?: boolean;
}

interface SwatchImageOption {
  value: string;
  label: string;
  image: { src: string };
  disabled?: boolean;
}

type Option = SwatchColorOption | SwatchImageOption;

export const SwatchPicker = React.forwardRef<
  React.ElementRef<typeof RadioGroupPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Root> & {
    label?: string;
    options: Option[];
    errors?: string[];
  }
>(({ id, label, options, errors, className, ...rest }, ref) => {
  return (
    <div className={clsx('space-y-2', className)}>
      {label !== undefined && label !== '' && <Label htmlFor={id}>{label}</Label>}
      <RadioGroupPrimitive.Root {...rest} ref={ref} aria-label={label} className="flex gap-2">
        {options.map((option) => (
          <RadioGroupPrimitive.Item
            key={option.value}
            value={option.value}
            aria-label={option.label}
            disabled={option.disabled}
            className={clsx(
              'box-content h-10 w-10 rounded-full border p-1 transition-colors hover:border-contrast-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:cursor-not-allowed disabled:opacity-20 disabled:hover:border-transparent data-[state=checked]:border-foreground',
              errors && errors.length > 0
                ? 'border-error disabled:border-transparent'
                : 'border-transparent',
            )}
          >
            {'color' in option ? (
              <span
                className="block h-10 w-10 rounded-full border border-foreground/10"
                style={{ backgroundColor: option.color }}
              />
            ) : (
              <span className="relative block h-10 w-10 rounded-full border border-foreground/10">
                <BcImage src={option.image.src} alt={option.label} height={40} width={40} />
              </span>
            )}
          </RadioGroupPrimitive.Item>
        ))}
      </RadioGroupPrimitive.Root>
      {errors?.map((error) => <ErrorMessage key={error}>{error}</ErrorMessage>)}
    </div>
  );
});

SwatchPicker.displayName = 'SwatchPicker';
