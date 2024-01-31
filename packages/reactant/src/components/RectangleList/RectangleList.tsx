import * as RadioGroupPrimitive from '@radix-ui/react-radio-group';
import { ComponentPropsWithRef, ElementRef, forwardRef } from 'react';

import { cn } from '~/lib/utils';

const RectangleList = forwardRef<
  ElementRef<typeof RadioGroupPrimitive.Root>,
  ComponentPropsWithRef<typeof RadioGroupPrimitive.Root>
>(({ children, className, ...props }, ref) => (
  <RadioGroupPrimitive.Root
    className={cn('flex flex-wrap gap-4', className)}
    orientation="horizontal"
    ref={ref}
    {...props}
  >
    {children}
  </RadioGroupPrimitive.Root>
));

RectangleList.displayName = 'RectangleList';

const RectangleListItem = forwardRef<
  ElementRef<typeof RadioGroupPrimitive.Item>,
  ComponentPropsWithRef<typeof RadioGroupPrimitive.Item>
>(({ className, children, ...props }, ref) => (
  <RadioGroupPrimitive.Item
    className={cn(
      'border-2 px-6 py-2.5 font-semibold text-black hover:border-blue-primary focus:outline-none focus:ring-4 focus:ring-blue-primary/20 disabled:border-gray-100 disabled:text-gray-400 disabled:hover:border-gray-100',
      'data-[state=checked]:border-blue-primary',
      className,
    )}
    ref={ref}
    {...props}
  >
    {children}
  </RadioGroupPrimitive.Item>
));

RectangleListItem.displayName = 'RectangleListItem';

export { RectangleList, RectangleListItem };
