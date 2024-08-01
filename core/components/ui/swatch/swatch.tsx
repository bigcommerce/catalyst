import * as RadioGroupPrimitive from '@radix-ui/react-radio-group';
import {
  ComponentPropsWithoutRef,
  ComponentPropsWithRef,
  ElementRef,
  forwardRef,
  useId,
} from 'react';

import { cn } from '~/lib/utils';

interface Item extends ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Item> {
  label: string;
  variantColor?: string;
}

interface Props extends ComponentPropsWithRef<typeof RadioGroupPrimitive.Root> {
  items: Item[];
}

const Swatch = forwardRef<ElementRef<typeof RadioGroupPrimitive.Root>, Props>(
  ({ children, className, items, ...props }, ref) => {
    const id = useId();

    return (
      <RadioGroupPrimitive.Root
        className={cn('flex flex-wrap gap-4', className)}
        ref={ref}
        role="radiogroup"
        {...props}
      >
        {items.map((item) => {
          const { label, value, variantColor, ...itemProps } = item;

          return (
            <RadioGroupPrimitive.Item
              key={`${id}-${value}`}
              {...itemProps}
              className="group h-12 w-12 border-2 bg-white p-1 hover:border-primary focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/20 disabled:border-gray-100 disabled:hover:border-gray-100 data-[state=checked]:border-primary"
              title={label}
              value={value}
            >
              {variantColor ? (
                <span
                  className="block h-9 w-9 group-disabled:bg-gray-200 group-disabled:opacity-30"
                  style={{
                    backgroundColor: variantColor,
                    backgroundImage: `url(${variantColor})`,
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
