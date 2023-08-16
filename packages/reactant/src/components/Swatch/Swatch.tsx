import * as RadioGroupPrimitive from '@radix-ui/react-radio-group';
import { ComponentPropsWithRef, ElementRef, forwardRef } from 'react';

import { cs } from '../../utils/cs';

export const Swatch = forwardRef<
  ElementRef<typeof RadioGroupPrimitive.Root>,
  ComponentPropsWithRef<typeof RadioGroupPrimitive.Root>
>(({ children, className, ...props }, ref) => {
  return (
    <RadioGroupPrimitive.Root
      className={cs('flex flex-wrap gap-4', className)}
      ref={ref}
      role="radiogroup"
      {...props}
    >
      {children}
    </RadioGroupPrimitive.Root>
  );
});

interface SwatchVariantProps extends ComponentPropsWithRef<typeof RadioGroupPrimitive.Item> {
  variantColor?: string;
}

export const SwatchItem = forwardRef<
  ElementRef<typeof RadioGroupPrimitive.Item>,
  SwatchVariantProps
>(({ children, className, disabled, variantColor, ...props }, ref) => (
  <RadioGroupPrimitive.Item
    className={cs(
      'focus:ring-primary-blue/20 group h-12 w-12 border-2 bg-white p-1 hover:border-blue-primary focus:outline-none focus:ring-4 disabled:border-gray-100 disabled:hover:border-gray-100',
      'data-[state=checked]:border-blue-primary',
      className,
    )}
    disabled={disabled}
    ref={ref}
    {...props}
  >
    {variantColor ? (
      <span
        className={cs('block h-9 w-9 group-disabled:bg-gray-200 group-disabled:opacity-30')}
        style={{ backgroundColor: variantColor, backgroundImage: `url(${variantColor})` }}
      />
    ) : (
      <span
        className={cs(
          'relative block h-9 w-9 overflow-hidden border border-gray-200 group-disabled:border-gray-100 ',
          className,
        )}
        ref={ref}
        {...props}
      >
        <span
          className={cs(
            'absolute -left-px -top-[2px] w-[51px] origin-top-left rotate-45 border-t-2 border-red-100 group-disabled:opacity-30',
          )}
        />
      </span>
    )}
  </RadioGroupPrimitive.Item>
));
