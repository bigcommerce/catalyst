import * as RadioGroupPrimitive from '@radix-ui/react-radio-group';
import { ComponentPropsWithRef, ElementRef, forwardRef, useId } from 'react';

import { cn } from '~/lib/utils';

interface Item {
  label: string;
  value: string;
}

interface Props extends ComponentPropsWithRef<typeof RadioGroupPrimitive.Root> {
  error?: boolean;
  items: Item[];
}

const RectangleList = forwardRef<ElementRef<typeof RadioGroupPrimitive.Root>, Props>(
  ({ children, className, error = false, items, ...props }, ref) => {
    const id = useId();

    return (
      <RadioGroupPrimitive.Root
        className={cn('flex flex-wrap fabric-type-modifier-list', className)}
        orientation="horizontal"
        ref={ref}
        {...props}
      >
        {items.map((item) => {
          const { label, value, ...itemProps } = item;

          return (
            <RadioGroupPrimitive.Item
            key={`${id}-${value}`}
            {...itemProps}
            className={cn(
              'border-2 px-6 py-2.5 font-semibold text-black',
              'hover:border-sky-400',
              'focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-sky-400/20',
              'disabled:border-gray-100 disabled:text-gray-400 disabled:hover:border-gray-100',
              'data-[state=checked]:border-sky-400',
              'border-sky-200 border-2 font-normal text-slate-900',
              error && 
                'border-red-300 hover:border-red-500 focus-visible:border-red-300 focus-visible:ring-red-500/20 disabled:border-gray-200 data-[state=checked]:border-red-300',
            )}
            value={value}
          >
              {item.label}
            </RadioGroupPrimitive.Item>
          );
        })}
      </RadioGroupPrimitive.Root>
    );
  },
);

RectangleList.displayName = 'RectangleList';

export { RectangleList };