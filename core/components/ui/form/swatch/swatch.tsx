import * as RadioGroupPrimitive from '@radix-ui/react-radio-group';
import { ComponentPropsWithRef, ElementRef, forwardRef, useId } from 'react';

import { cn } from '~/lib/utils';

interface Swatch {
  color?: string;
  label: string;
  value: string;
}

interface Props extends ComponentPropsWithRef<typeof RadioGroupPrimitive.Root> {
  error?: boolean;
  swatches: Swatch[];
}

const Swatch = forwardRef<ElementRef<typeof RadioGroupPrimitive.Root>, Props>(
  ({ children, className, error = false, swatches, ...props }, ref) => {
    const id = useId();

    return (
      <RadioGroupPrimitive.Root
        className={cn('flex flex-wrap gap-4', className)}
        ref={ref}
        role="radiogroup"
        {...props}
      >
        {swatches.map((swatch) => {
          const { label, value, color, ...itemProps } = swatch;

          return (
            <RadioGroupPrimitive.Item
              key={`${id}-${value}`}
              {...itemProps}
              className={cn(
                'group h-12 w-12 border-2 bg-white p-1 hover:border-primary focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/20 disabled:border-gray-100 disabled:hover:border-gray-100 data-[state=checked]:border-primary',
                error &&
                  'border-error-secondary hover:border-error focus-visible:border-error-secondary focus-visible:ring-error/20 disabled:border-gray-200 data-[state=checked]:border-error-secondary',
              )}
              title={label}
              value={value}
            >
              {color ? (
                <span
                  className="block h-9 w-9 group-disabled:bg-gray-200 group-disabled:opacity-30"
                  style={{
                    backgroundColor: color,
                    backgroundImage: `url(${color})`,
                  }}
                />
              ) : (
                <span className="relative block h-9 w-9 overflow-hidden border border-gray-200 group-disabled:border-gray-100">
                  <span className="absolute -start-px -top-[2px] w-[51px] origin-top-left rotate-45 border-t-2 border-error-secondary group-disabled:opacity-30" />
                </span>
              )}
            </RadioGroupPrimitive.Item>
          );
        })}
      </RadioGroupPrimitive.Root>
    );
  },
);

Swatch.displayName = 'Swatch';

export { Swatch };
