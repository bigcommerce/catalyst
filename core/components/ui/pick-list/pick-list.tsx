import * as RadioGroupPrimitive from '@radix-ui/react-radio-group';
import { ComponentPropsWithRef, ElementRef, forwardRef, useId } from 'react';

import { BcImage } from '~/components/bc-image';
import { cn } from '~/lib/utils';

interface Props extends ComponentPropsWithRef<typeof RadioGroupPrimitive.Root> {
  items: Array<{
    value: string;
    label: string;
    defaultImage: { altText: string; url: string } | null;
    prefetchHandler?: () => void;
  }>;
}

const PickList = forwardRef<ElementRef<typeof RadioGroupPrimitive.Root>, Props>(
  ({ children, items, className, ...props }, ref) => {
    const id = useId();

    return (
      <RadioGroupPrimitive.Root
        className={cn('grid auto-rows-fr divide-y divide-solid divide-gray-200 border', className)}
        ref={ref}
        {...props}
      >
        {items.map((item) => (
          <div
            className="flex items-center p-4"
            key={item.value}
            onMouseEnter={() => item.prefetchHandler?.()}
          >
            {Boolean(item.defaultImage) && (
              <BcImage
                alt={item.defaultImage?.altText || ''}
                className="me-6"
                height={48}
                src={item.defaultImage?.url || ''}
                width={48}
              />
            )}
            <RadioGroupPrimitive.Item
              className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 border-gray-200 hover:border-secondary focus-visible:border-primary focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/20 focus-visible:hover:border-secondary disabled:pointer-events-none disabled:bg-gray-100 radix-state-checked:border-primary radix-state-checked:bg-primary radix-state-checked:hover:border-secondary radix-state-checked:hover:bg-secondary radix-state-checked:disabled:border-gray-400 radix-state-checked:disabled:bg-gray-400"
              id={`${id}-${item.value}`}
              value={item.value}
            >
              <RadioGroupPrimitive.Indicator className="h-2 w-2 rounded-full bg-white" />
            </RadioGroupPrimitive.Item>
            <label className="w-full cursor-pointer ps-4" htmlFor={`${id}-${item.value}`}>
              {item.label}
            </label>
          </div>
        ))}
      </RadioGroupPrimitive.Root>
    );
  },
);

PickList.displayName = 'PickList';

export { PickList };
