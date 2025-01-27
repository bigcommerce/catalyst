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
        className={cn('contents flex-wrap gap-2', className)}
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
                'group m-0 h-12 w-12 rounded-[50px] bg-white p-0 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/20 disabled:border-[#4EAECC]',
                'data-[state=checked]:border-[2px] data-[state=checked]:border-[#4EAECC]', // Default selected state
                'focus-within:border-[2px] focus-within:border-[#4EAECC] hover:border-[2px] hover:border-[#4EAECC]',
                error &&
                  'border-error-secondary focus-visible:border-error-secondary data-[state=checked]:border-error-secondary hover:border-error focus-visible:ring-error/20 disabled:border-gray-200',
              )}
              title={label}
              value={value}
            >
              {color ? (
                <span
                  className="swatch-span block h-full w-full rounded-[50px] group-focus-within:border-[3px] group-focus-within:border-[#B4DDE9] group-hover:border-[3px] group-hover:border-[#B4DDE9] group-disabled:bg-gray-200 group-disabled:opacity-30 group-data-[state=checked]:border-[3px] group-data-[state=checked]:border-[#B4DDE9]"
                  style={{
                    backgroundColor: color,
                    backgroundImage: `url(${color})`,
                  }}
                />
              ) : (
                <span className="relative block h-9 w-9 overflow-hidden border border-gray-200 group-disabled:border-gray-100">
                  <span className="border-error-secondary absolute -start-px -top-[2px] w-[51px] origin-top-left rotate-45 border-t-2 group-disabled:opacity-30" />
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
