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
}

interface Props extends ComponentPropsWithRef<typeof RadioGroupPrimitive.Root> {
  items: Item[];
}

const RectangleList = forwardRef<ElementRef<typeof RadioGroupPrimitive.Root>, Props>(
  ({ children, className, items, ...props }, ref) => {
    const id = useId();

    return (
      <RadioGroupPrimitive.Root
        className={cn('flex flex-wrap gap-4', className)}
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
              className="border-2 px-6 py-2.5 font-semibold text-black hover:border-primary focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/20 disabled:border-gray-100 disabled:text-gray-400 disabled:hover:border-gray-100 data-[state=checked]:border-primary"
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
