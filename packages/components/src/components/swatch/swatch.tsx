import * as RadioGroupPrimitive from '@radix-ui/react-radio-group';
import { ComponentPropsWithRef, ElementRef, forwardRef } from 'react';

import { cn } from '~/lib/utils';

const Swatch = forwardRef<
  ElementRef<typeof RadioGroupPrimitive.Root>,
  ComponentPropsWithRef<typeof RadioGroupPrimitive.Root>
>(({ children, className, ...props }, ref) => {
  return (
    <RadioGroupPrimitive.Root
      className={cn('flex flex-wrap gap-4', className)}
      ref={ref}
      role="radiogroup"
      {...props}
    >
      {children}
    </RadioGroupPrimitive.Root>
  );
});

Swatch.displayName = 'Swatch';

interface SwatchVariantProps extends ComponentPropsWithRef<typeof RadioGroupPrimitive.Item> {
  variantColor?: string;
}

const SwatchItem = forwardRef<ElementRef<typeof RadioGroupPrimitive.Item>, SwatchVariantProps>(
  ({ children, className, disabled, variantColor, ...props }, ref) => (
    <RadioGroupPrimitive.Item
      className={cn(
        'group h-12 w-12 border-2 bg-white p-1 hover:border-blue-primary focus:outline-none focus:ring-4 focus:ring-blue-primary/20 disabled:border-gray-100 disabled:hover:border-gray-100',
        'data-[state=checked]:border-blue-primary',
        className,
      )}
      disabled={disabled}
      ref={ref}
      {...props}
    >
      {variantColor ? (
        <span
          className={cn('block h-9 w-9 group-disabled:bg-gray-200 group-disabled:opacity-30')}
          style={{ backgroundColor: variantColor, backgroundImage: `url(${variantColor})` }}
        />
      ) : (
        <span
          className={cn(
            'relative block h-9 w-9 overflow-hidden border border-gray-200 group-disabled:border-gray-100 ',
            className,
          )}
          ref={ref}
          {...props}
        >
          <span
            className={cn(
              'absolute -start-px -top-[2px] w-[51px] origin-top-left rotate-45 border-t-2 border-red-100 group-disabled:opacity-30',
            )}
          />
        </span>
      )}
    </RadioGroupPrimitive.Item>
  ),
);

SwatchItem.displayName = 'SwatchItem';

export { Swatch, SwatchItem };
