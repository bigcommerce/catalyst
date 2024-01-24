import * as RadioGroupPrimitive from '@radix-ui/react-radio-group';
import { ComponentPropsWithRef, ElementRef, forwardRef } from 'react';

import { cn } from '~/lib/utils';

type RadioIndicatorType = typeof RadioGroupPrimitive.Indicator;

const RadioIndicator = forwardRef<
  ElementRef<RadioIndicatorType>,
  ComponentPropsWithRef<RadioIndicatorType>
>(({ children, className, ...props }, ref) => {
  return (
    <RadioGroupPrimitive.Indicator
      className={cn('h-2 w-2 rounded-full bg-white', className)}
      {...props}
      ref={ref}
    >
      {children}
    </RadioGroupPrimitive.Indicator>
  );
});

RadioIndicator.displayName = 'RadioIndicator';

type RadioItemType = typeof RadioGroupPrimitive.Item;

const RadioItem = forwardRef<ElementRef<RadioItemType>, ComponentPropsWithRef<RadioItemType>>(
  ({ children, className, ...props }, ref) => {
    return (
      <RadioGroupPrimitive.Item
        className={cn(
          'flex h-6 w-6 items-center justify-center rounded-full border-2 border-gray-200',
          'hover:border-blue-secondary',
          'focus:border-blue-primary focus:outline-none focus:ring-4 focus:ring-blue-primary/20',
          'focus:hover:border-blue-secondary',
          'radix-state-checked:border-blue-primary radix-state-checked:bg-blue-primary',
          'radix-state-checked:hover:border-blue-secondary radix-state-checked:hover:bg-blue-secondary',
          'disabled:pointer-events-none disabled:bg-gray-100',
          'radix-state-checked:disabled:border-gray-400 radix-state-checked:disabled:bg-gray-400',
          className,
        )}
        ref={ref}
        {...props}
      >
        {children || <RadioIndicator />}
      </RadioGroupPrimitive.Item>
    );
  },
);

RadioItem.displayName = 'RadioItem';

type RadioGroupType = typeof RadioGroupPrimitive.Root;

const RadioGroup = forwardRef<ElementRef<RadioGroupType>, ComponentPropsWithRef<RadioGroupType>>(
  ({ children, className, ...props }, ref) => {
    return (
      <RadioGroupPrimitive.Root className={cn(className)} ref={ref} {...props}>
        {children}
      </RadioGroupPrimitive.Root>
    );
  },
);

RadioGroup.displayName = 'RadioGroup';

export { RadioGroup, RadioItem, RadioIndicator };
